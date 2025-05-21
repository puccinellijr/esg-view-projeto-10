import { supabase } from '@/lib/supabase';
import { UserData, UserUpdateData } from '@/types/auth';

/**
 * Loads a user profile from Supabase
 */
export const loadUserProfile = async (userId: string): Promise<{ 
  profileData?: any, 
  error?: any 
}> => {
  try {
    console.log(`Carregando perfil para usuário ID: ${userId}`);
    
    // Get user profile directly
    const { data, error } = await supabase
      .from('user_profiles')
      .select('name, access_level, photo_url, terminal, email')
      .eq('id', userId)
      .single();
    
    // If there's an error with the profile
    if (error) {
      console.warn('Erro ao carregar perfil, verificando se usuário existe:', error);
      
      // If profile fails to load, still return a minimal profile
      return { 
        profileData: {
          name: 'Usuário',
          access_level: 'viewer', // Default to lowest access level for safety
          photo_url: null,
          terminal: null,
          email: null
        },
        error 
      };
    }
    
    // Log the actual access level from the database for debugging
    console.log('Perfil carregado do banco de dados:', data);
    console.log('Nível de acesso do banco:', data.access_level);
    
    // Garantir que o nível de acesso seja mantido como está no banco
    // Se não existir, usar 'viewer' como padrão de segurança
    if (!data.access_level) {
      data.access_level = 'viewer';
    }
    
    return { profileData: data };
  } catch (err) {
    console.error('Erro ao carregar perfil de usuário:', err);
    return { error: err };
  }
};

/**
 * Updates a user profile in Supabase
 */
export const updateUserProfile = async (userId: string, data: UserUpdateData): Promise<{
  success: boolean,
  error?: any
}> => {
  try {
    console.log('Atualizando perfil de usuário:', userId, data);
    
    // Buscar email do usuário antes para garantir sincronização
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Erro ao buscar email do usuário:', userError);
      return { success: false, error: userError };
    }
    
    const userEmail = userData.email;
    console.log('Email do usuário para atualização:', userEmail);
    
    // Update password if provided - usando Auth API
    if (data.password) {
      console.log('Atualizando senha do usuário via Auth API');
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: data.password }
      );
      
      if (authError) {
        console.error('Erro ao atualizar senha:', authError);
        return { success: false, error: authError };
      }
      
      console.log('Senha atualizada com sucesso na autenticação');
    }
    
    // Update email if provided (will update in both auth and user_profiles)
    if (data.email && data.email !== userEmail) {
      console.log('Atualizando email do usuário de', userEmail, 'para', data.email);
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: data.email }
      );
      
      if (emailError) {
        console.error('Erro ao atualizar email:', emailError);
        return { success: false, error: emailError };
      }
      
      console.log('Email atualizado com sucesso na autenticação');
    }
    
    // Prepare update data for user_profiles table
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
    if (data.terminal !== undefined) updateData.terminal = data.terminal;
    if (data.email && data.email !== userEmail) updateData.email = data.email; // Also update email in profiles table
    
    // Only update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      console.log('Dados a serem atualizados no perfil (tabela user_profiles):', updateData);
      
      // Update profile data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (profileError) {
        console.error('Erro ao atualizar dados do perfil na tabela user_profiles:', profileError);
        return { success: false, error: profileError };
      }
      
      console.log('Dados de perfil atualizados com sucesso na tabela user_profiles');
    } else {
      console.log('Nenhum dado de perfil para atualizar na tabela user_profiles');
    }
    
    console.log('Perfil atualizado com sucesso em Auth e tabela user_profiles');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error };
  }
};

/**
 * Checks if a user with the given email already exists
 */
const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    // Check in user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking if user exists:', error);
    }
    
    return !!data; // Return true if data exists, false otherwise
  } catch (err) {
    console.error('Exception checking if user exists:', err);
    return false; // Assume user doesn't exist if there's an error
  }
};

/**
 * Creates a new user profile in Supabase
 */
export const createUserProfile = async (userData: UserData, password: string): Promise<{
  success: boolean,
  userId?: string,
  error?: any
}> => {
  try {
    console.log('Criando novo usuário:', userData.email);
    console.log('Dados completos do usuário:', JSON.stringify(userData));
    
    // First check if user already exists
    const userExists = await checkUserExists(userData.email);
    if (userExists) {
      console.warn('Usuário com este email já existe:', userData.email);
      return { 
        success: false, 
        error: { message: 'Um usuário com este email já existe.' }
      };
    }
    
    // Ensure userData has required fields for both auth and profile
    const validUserData = {
      ...userData,
      accessLevel: userData.accessLevel || 'viewer',
      terminal: userData.terminal || 'Rio Grande',
      name: userData.name || userData.email.split('@')[0],
    };
    
    // Create the auth user with complete data - Using admin API to prevent session change
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validUserData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: validUserData.name,
        access_level: validUserData.accessLevel,
        terminal: validUserData.terminal
      }
    });
    
    if (authError || !authData.user) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      return { success: false, error: authError };
    }
    
    const userId = authData.user.id;
    console.log('Usuário criado com sucesso na autenticação, ID:', userId);
    
    // Then, create the user profile with the same ID as the auth user
    const profileData = {
      id: userId,
      email: validUserData.email,
      name: validUserData.name,
      access_level: validUserData.accessLevel,
      photo_url: validUserData.photoUrl || null,
      terminal: validUserData.terminal
    };
    
    console.log('Criando perfil de usuário com dados:', profileData);
    
    // Try inserting first
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([profileData]);
      
    if (insertError) {
      console.warn('Erro na inserção direta, tentando upsert:', insertError);
      
      // If insert fails, try upsert
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert([profileData], { onConflict: 'id' });
        
      if (upsertError) {
        console.error('Erro também no upsert do perfil:', upsertError);
        return { success: false, error: upsertError };
      }
    }
    
    console.log('Perfil de usuário criado com sucesso');
    return { success: true, userId };
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return { success: false, error: err };
  }
};
