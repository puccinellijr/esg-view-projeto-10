
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
    
    // Update password if provided
    if (data.password) {
      console.log('Atualizando senha do usuário');
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (authError) {
        console.error('Erro ao atualizar senha:', authError);
        return { success: false, error: authError };
      }
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
    if (data.terminal !== undefined) updateData.terminal = data.terminal;
    if (data.email) updateData.email = data.email;
    
    // Only update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      console.log('Dados a serem atualizados:', updateData);
      
      // Update profile data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (profileError) {
        console.error('Erro ao atualizar dados do perfil:', profileError);
        return { success: false, error: profileError };
      }
    } else {
      console.log('Nenhum dado de perfil para atualizar');
    }
    
    console.log('Perfil atualizado com sucesso');
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
    
    // Then, create the auth user with complete data
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: userData.name,
          access_level: userData.accessLevel || 'viewer',
          terminal: userData.terminal || 'Rio Grande'
        }
      }
    });
    
    if (authError || !authData.user) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      return { success: false, error: authError };
    }
    
    const userId = authData.user.id;
    console.log('Usuário criado com ID:', userId);
    
    // Then, create the user profile with the same ID as the auth user
    const profileData = {
      id: userId,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      access_level: userData.accessLevel || 'viewer',
      photo_url: userData.photoUrl || null,
      terminal: userData.terminal || 'Rio Grande' // Ensure terminal has a default value
    };
    
    console.log('Criando perfil de usuário com dados:', profileData);
    
    // Check if a profile with this ID already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.warn('Já existe um perfil com este ID:', userId);
      // Instead of failing, update the profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId);
        
      if (updateError) {
        console.error('Erro ao atualizar perfil existente:', updateError);
        return { success: false, error: updateError };
      }
      
      console.log('Perfil existente atualizado com sucesso');
      return { success: true, userId };
    }
    
    // Create the profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([profileData]);
    
    if (profileError) {
      console.error('Erro ao criar perfil do usuário:', profileError);
      console.error('Detalhes do erro:', profileError.message, profileError.details);
      
      // Retry with upsert strategy
      console.log('Tentando upsert como alternativa...');
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert([profileData]);
        
      if (upsertError) {
        console.error('Erro no upsert do perfil:', upsertError);
        
        // Try to cleanup the auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(userId);
          console.log('Usuário de autenticação removido após falha na criação do perfil');
        } catch (e) {
          console.warn('Não foi possível limpar o usuário da autenticação após falha:', e);
        }
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
