
import { useEffect, useState } from 'react';
import { UserData } from '@/types/auth';
import { 
  getCurrentSession,
  loginUser as login, 
  logoutUser as logout,
  resetPassword as resetPwd,
  updatePassword as updatePwd
} from '@/services/authService';
import { setupAuthListener } from '@/services/sessionService';
import { loadUserProfile } from '@/services/userProfileService';
import { normalizeAccessLevel } from './authUtils';

export function useAuthSession() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session and set up listener
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
              
              // Normalizar nível de acesso
              const accessLevel = normalizeAccessLevel(loadedProfile.access_level);
              console.log("AuthProvider: Nível de acesso normalizado:", accessLevel);
              
              setUser({
                id: sessionUser.id,
                email: sessionUser.email || '',
                accessLevel: accessLevel,
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
        // Normalizar nível de acesso
        const accessLevel = normalizeAccessLevel(profileData.access_level);
        console.log(`AuthProvider: Atualizando usuário com nível ${accessLevel}`);
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          accessLevel: accessLevel,
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

  // Login function
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    const { success, user: authUser, profileData } = await login(email, password);
    
    if (success && authUser && profileData) {
      // Normalize access level
      const accessLevel = normalizeAccessLevel(profileData.access_level);
      console.log(`Login bem-sucedido para ${email} com nível de acesso ${accessLevel}`);
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        accessLevel: accessLevel,
        name: profileData.name,
        photoUrl: profileData.photo_url,
        terminal: profileData.terminal
      });
      
      // Wait a brief moment to ensure the event has time to process
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return success;
  };

  // Wrapper functions for auth operations
  const logoutUser = async (): Promise<void> => {
    const { success, error } = await logout();
    if (!success) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const { success } = await resetPwd(email);
    return success;
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    const { success } = await updatePwd(newPassword);
    return success;
  };

  return {
    user,
    setUser,
    isInitialized,
    loginUser,
    logoutUser,
    resetPassword,
    updatePassword
  };
}
