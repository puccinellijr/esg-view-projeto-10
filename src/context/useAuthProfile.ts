
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserUpdateData } from '@/types/auth';
import { updateUserProfile as updateProfile } from '@/services/userProfileService';

export const useAuthProfile = () => {
  const [user, setUser] = useState<any>(null);

  // Get current user from supabase session when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const updateUserProfile = async (data: UserUpdateData): Promise<boolean> => {
    try {
      // Get the current user ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error('Usuário não encontrado na sessão');
        throw new Error('Usuário não encontrado na sessão');
      }
      
      const userId = userData.user.id;
      console.log('Atualizando perfil para usuário:', userId, data);
      
      const { success, error } = await updateProfile(userId, data);
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }
      
      if (success) {
        // Update local state
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: data.name || prev.name,
            photoUrl: data.photoUrl !== undefined ? data.photoUrl : prev.photoUrl,
          };
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar perfil no contexto:', error);
      return false;
    }
  };

  return { user, setUser, updateUserProfile };
};
