import { supabase } from '@/lib/supabase';
import { loadUserProfile } from './userProfileService';

/**
 * Logs in a user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<{
  success: boolean,
  user?: any,
  profileData?: any,
  error?: any
}> => {
  try {
    console.log('Tentando login para:', email);
    
    // Aumentar o tempo limite para 15 segundos para evitar timeout em redes mais lentas
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro de autenticação:', error.message);
      return { success: false, error };
    }

    if (!data.user) {
      console.error('Login falhou: usuário não encontrado');
      return { success: false, error: new Error('Usuário não encontrado') };
    }
    
    console.log('Login bem-sucedido para:', data.user.email);
    
    // Load user profile data
    const { profileData, error: profileError } = await loadUserProfile(data.user.id);
    
    if (profileError) {
      console.error('Erro ao carregar perfil após login:', profileError);
      return { success: true, user: data.user, error: profileError };
    }
    
    return { success: true, user: data.user, profileData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error('Erro de login:', errorMessage);
    return { success: false, error };
  }
};

/**
 * Logs out the current user
 */
export const logoutUser = async (): Promise<{
  success: boolean,
  error?: any
}> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    return { success: false, error };
  }
};

/**
 * Sends a password reset email
 */
export const resetPassword = async (email: string): Promise<{
  success: boolean,
  error?: any
}> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return { success: false, error };
  }
};

/**
 * Updates a user's password
 */
export const updatePassword = async (newPassword: string): Promise<{
  success: boolean,
  error?: any
}> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error };
  }
};

/**
 * Gets the current session
 */
export const getCurrentSession = async (): Promise<{
  session?: any,
  user?: any,
  error?: any
}> => {
  try {
    // Aumentar o tempo limite para evitar problemas de timeout em redes lentas
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { error };
    }
    
    if (data && data.session) {
      return { session: data.session, user: data.session.user };
    }
    
    return {};
  } catch (error) {
    console.error('Erro ao obter sessão atual:', error);
    return { error };
  }
};

/**
 * Gets the current user
 */
export const getCurrentUser = async (): Promise<{
  user?: any,
  error?: any
}> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return { error };
    }
    return { user: data.user };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return { error };
  }
};
