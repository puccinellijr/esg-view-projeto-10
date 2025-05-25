
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserUpdateData } from '@/types/auth';
import { updateUserProfile as updateProfile } from '@/services/userProfileService';

export const useAuthProfile = (sessionUser: any, setSessionUser: (user: any) => void) => {
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
        // Update session user state immediately with new data
        setSessionUser(prev => {
          if (!prev) return null;
          const updatedUser = {
            ...prev,
            name: data.name !== undefined ? data.name : prev.name,
            photoUrl: data.photoUrl !== undefined ? data.photoUrl : prev.photoUrl,
          };
          console.log('Estado do usuário atualizado localmente:', updatedUser);
          return updatedUser;
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar perfil no contexto:', error);
      return false;
    }
  };

  return { updateUserProfile };
};
