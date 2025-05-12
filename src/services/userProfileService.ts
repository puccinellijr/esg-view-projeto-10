
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
    // Use Promise.race to add timeout for profile loading
    const profileTimeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
      setTimeout(() => reject(new Error("Tempo limite excedido na busca de perfil")), 5000)
    );
    
    const profileResult = await Promise.race([
      supabase
        .from('user_profiles')
        .select('name, access_level, photo_url, terminal')
        .eq('id', userId)
        .single(),
      profileTimeoutPromise
    ]);
    
    return profileResult;
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
    // Update password if provided
    if (data.password) {
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (authError) {
        throw authError;
      }
    }
    
    // Update profile data
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name: data.name,
        photo_url: data.photoUrl,
        terminal: data.terminal
      })
      .eq('id', userId);
    
    if (profileError) {
      throw profileError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error };
  }
};
