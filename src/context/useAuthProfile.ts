
import { useState } from 'react';
import { UserData, UserUpdateData } from '@/types/auth';
import { updateUserProfile as updateProfile } from '@/services/userProfileService';
import { supabase } from '@/lib/supabase';

export function useAuthProfile() {
  const [user, setUser] = useState<UserData | null>(null);

  const updateUserProfile = async (data: UserUpdateData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get the current user ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('Usuário não encontrado');
      }
      
      const { success } = await updateProfile(userData.user.id, data);
      
      if (success) {
        // Update local state
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: data.name || prev.name,
            photoUrl: data.photoUrl || prev.photoUrl,
            terminal: data.terminal !== undefined ? data.terminal : prev.terminal,
          };
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao atualizar perfil no contexto:', error);
      return false;
    }
  };

  return { user, setUser, updateUserProfile };
}
