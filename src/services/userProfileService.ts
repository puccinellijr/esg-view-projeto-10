
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
    
    // Use Promise.race to add timeout for profile loading - use shorter timeout
    const profileTimeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
      setTimeout(() => reject(new Error("Tempo limite excedido na busca de perfil")), 3000)
    );
    
    // Get user profile directly
    const profilePromise = supabase
      .from('user_profiles')
      .select('name, access_level, photo_url, terminal')
      .eq('id', userId)
      .single();
    
    const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]);
    
    // If there's an error with the profile, let's check if the user exists in auth
    if (profileResult.error) {
      console.warn('Erro ao carregar perfil, verificando se usuário existe:', profileResult.error);
      
      // If profile fails to load, still return a minimal profile based on auth user
      return { 
        profileData: {
          name: 'Usuário',
          access_level: 'viewer', // Default to lowest access level for safety
          photo_url: null,
          terminal: null
        } 
      };
    }
    
    // Log the actual access level from the database for debugging
    console.log('Perfil carregado do banco de dados:', profileResult.data);
    console.log('Nível de acesso do banco:', profileResult.data.access_level);
    
    // Ensure access_level is returned exactly as stored in the database
    return { 
      profileData: {
        ...profileResult.data,
        access_level: profileResult.data.access_level
      } 
    };
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
