
import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { AccessLevel, UserData, UserUpdateData } from '@/types/auth';
import { useAuthSession } from './useAuthSession';
import { useAuthProfile } from './useAuthProfile';
import { checkAccessLevel } from './authUtils';
import { AuthContextType } from './types';
import { verifyUserAccessLevel } from '@/services/userPermissionService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks to separate concerns
  const { 
    user: sessionUser, 
    isInitialized, 
    loginUser, 
    logoutUser, 
    resetPassword, 
    updatePassword 
  } = useAuthSession();
  
  const { updateUserProfile } = useAuthProfile();
  
  // If session user changes, update the profile user
  React.useEffect(() => {
    if (sessionUser) {
      // Verificar nível de acesso diretamente do banco quando o usuário muda
      const verifyAccessLevel = async () => {
        if (sessionUser.id) {
          try {
            const { accessLevel, error } = await verifyUserAccessLevel(sessionUser.id);
            if (error) {
              console.error('Erro ao verificar nível de acesso:', error);
            } else if (accessLevel && accessLevel !== sessionUser.accessLevel) {
              console.log(`Atualizando nível de acesso: ${sessionUser.accessLevel} -> ${accessLevel}`);
              // Atualizar o nível de acesso no contexto local se estiver diferente
              sessionUser.accessLevel = accessLevel;
            }
          } catch (err) {
            console.error('Erro ao verificar nível de acesso:', err);
          }
        }
      };
      
      verifyAccessLevel();
    }
  }, [sessionUser]);
  
  // Check if user has required access level
  const hasAccess = (requiredLevel: AccessLevel): boolean => {
    if (!sessionUser) return false;
    
    console.log(`AuthContext: verificando se ${sessionUser.email} com nível ${sessionUser.accessLevel} pode acessar ${requiredLevel}`);
    
    return checkAccessLevel(sessionUser.accessLevel, requiredLevel);
  };

  const value = {
    user: sessionUser,
    login: loginUser,
    logout: logoutUser,
    hasAccess,
    resetPassword,
    updatePassword,
    updateUserProfile,
    isInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Re-export the types for convenience
export type { AccessLevel, UserData, UserUpdateData };
