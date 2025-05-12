
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { UserData, UserUpdateData, AccessLevel } from '@/types/auth';
import { loginUser, logoutUser, resetPassword, updatePassword, getCurrentSession } from '@/services/authService';
import { updateUserProfile as updateProfile } from '@/services/userProfileService';
import { setupAuthListener, checkAccessLevel } from '@/services/sessionService';

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasAccess: (requiredLevel: AccessLevel) => boolean;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (email: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (data: UserUpdateData) => Promise<boolean>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check current session on load
  useEffect(() => {
    console.log("AuthProvider: Inicializando...");
    
    const checkSession = async () => {
      try {
        console.log("AuthProvider: Verificando sessão...");
        
        const { session, user: sessionUser, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          setIsInitialized(true);
          return;
        }

        if (sessionUser) {
          console.log("AuthProvider: Sessão encontrada para usuário:", sessionUser.email);
          
          try {
            // Buscar detalhes do usuário do perfil
            const { profileData: loadedProfile, error } = await loadUserProfile(sessionUser.id);

            if (!error && loadedProfile) {
              console.log("AuthProvider: Perfil de usuário carregado:", loadedProfile.name);
              setUser({
                email: sessionUser.email || '',
                accessLevel: loadedProfile.access_level as AccessLevel,
                name: loadedProfile.name,
                photoUrl: loadedProfile.photo_url,
                terminal: loadedProfile.terminal
              });
            } else {
              console.error('Erro ao buscar perfil:', error);
              setUser(null);
            }
          } catch (profileErr) {
            console.error('Exceção ao buscar perfil:', profileErr);
            setUser(null);
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
          setUser(null);
        }
      } catch (err) {
        console.error("AuthProvider: Erro ao inicializar:", err);
        setUser(null);
      } finally {
        console.log("AuthProvider: Inicialização concluída");
        setIsInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const cleanupListener = setupAuthListener((authUser, profileData) => {
      if (authUser && profileData) {
        setUser({
          email: authUser.email || '',
          accessLevel: profileData.access_level as AccessLevel,
          name: profileData.name,
          photoUrl: profileData.photo_url,
          terminal: profileData.terminal
        });
      } else {
        setUser(null);
      }
    });

    return cleanupListener;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { success } = await loginUser(email, password);
    
    // The auth state listener will update the user state if login is successful
    // Just wait a brief moment to ensure the event has time to process
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return success;
  };

  const logout = async (): Promise<void> => {
    const { success, error } = await logoutUser();
    
    if (!success) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar');
    }
    
    // The auth state listener will clear the user state
  };

  const hasAccess = (requiredLevel: AccessLevel): boolean => {
    if (!user) return false;
    return checkAccessLevel(user.accessLevel, requiredLevel);
  };

  const handleResetPassword = async (email: string): Promise<boolean> => {
    const { success } = await resetPassword(email);
    return success;
  };

  const handleUpdatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    const { success } = await updatePassword(newPassword);
    return success;
  };

  const handleUpdateUserProfile = async (data: UserUpdateData): Promise<boolean> => {
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

  const value = {
    user,
    login,
    logout,
    hasAccess,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    updateUserProfile: handleUpdateUserProfile,
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
import { supabase } from '@/lib/supabase';  // Need to import directly for getUser
import { loadUserProfile } from '@/services/userProfileService';  // For session check
