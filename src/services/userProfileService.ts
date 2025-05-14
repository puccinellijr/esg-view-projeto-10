
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
        throw authError;
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
        throw profileError;
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
 * Creates a new user profile in Supabase
 */
export const createUserProfile = async (userData: UserData, password: string): Promise<{
  success: boolean,
  userId?: string,
  error?: any
}> => {
  try {
    console.log('Criando novo usuário:', userData.email);
    
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (authError || !authData.user) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      return { success: false, error: authError };
    }
    
    const userId = authData.user.id;
    console.log('Usuário criado com ID:', userId);
    
    // Then, create the user profile
    const profileData = {
      id: userId,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      access_level: userData.accessLevel,
      photo_url: userData.photoUrl,
      terminal: userData.terminal
    };
    
    console.log('Criando perfil de usuário:', profileData);
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([profileData]);
    
    if (profileError) {
      console.error('Erro ao criar perfil do usuário:', profileError);
      // Try to cleanup the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (e) {
        console.warn('Não foi possível limpar o usuário da autenticação após falha:', e);
      }
      return { success: false, error: profileError };
    }
    
    console.log('Perfil de usuário criado com sucesso');
    return { success: true, userId };
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return { success: false, error: err };
  }
};
