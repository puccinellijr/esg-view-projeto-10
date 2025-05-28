
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
import { startSessionRefresh, stopSessionRefresh } from '@/services/sessionRefreshService';

export function useAuthSession() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUserState, setLastUserState] = useState<UserData | null>(null);

  // Initialize session and set up listener
  useEffect(() => {
    console.log("AuthProvider: Inicializando...");
    let isComponentMounted = true;
    let hasStartedInitialization = false;
    
    const checkSession = async () => {
      if (hasStartedInitialization) {
        console.log("AuthProvider: Inicialização já em andamento, ignorando");
        return;
      }
      
      hasStartedInitialization = true;
      
      try {
        console.log("AuthProvider: Verificando sessão...");
        setIsLoading(true);
        
        const { session, user: sessionUser, error: sessionError } = await getCurrentSession();
        
        if (!isComponentMounted) return;
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          // Manter último estado conhecido se houver erro de rede
          if (lastUserState) {
            console.log("Mantendo último estado de usuário conhecido");
            setUser(lastUserState);
          } else {
            setUser(null);
          }
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        if (sessionUser) {
          console.log("AuthProvider: Sessão encontrada para usuário:", sessionUser.email);
          
          // Start session refresh when user is authenticated
          startSessionRefresh();
          
          try {
            const { profileData: loadedProfile, error } = await loadUserProfile(sessionUser.id);

            if (!isComponentMounted) return;

            if (!error && loadedProfile) {
              console.log("AuthProvider: Perfil de usuário carregado:", loadedProfile.name);
              console.log("AuthProvider: Nível de acesso bruto do banco:", loadedProfile.access_level);
              
              const accessLevel = normalizeAccessLevel(loadedProfile.access_level);
              console.log("AuthProvider: Nível de acesso normalizado:", accessLevel);
              
              const userData = {
                id: sessionUser.id,
                email: sessionUser.email || '',
                accessLevel: accessLevel,
                name: loadedProfile.name,
                photoUrl: loadedProfile.photo_url,
                terminal: loadedProfile.terminal
              };
              
              setUser(userData);
              setLastUserState(userData); // Salvar como último estado conhecido
            } else {
              console.error('Erro ao buscar perfil:', error);
              // Se temos um estado anterior, mantê-lo
              if (lastUserState) {
                console.log("Mantendo dados de usuário do estado anterior");
                setUser(lastUserState);
              } else {
                // Create minimal user data to prevent blocking
                const minimalUser = {
                  id: sessionUser.id,
                  email: sessionUser.email || '',
                  accessLevel: 'viewer' as const,
                  name: sessionUser.email?.split('@')[0] || 'Usuário',
                  photoUrl: null,
                  terminal: 'Rio Grande'
                };
                setUser(minimalUser);
                setLastUserState(minimalUser);
              }
            }
          } catch (profileErr) {
            if (!isComponentMounted) return;
            console.error('Exceção ao buscar perfil:', profileErr);
            
            // Manter estado anterior se disponível
            if (lastUserState) {
              console.log("Mantendo dados de usuário do estado anterior após erro");
              setUser(lastUserState);
            } else {
              const fallbackUser = {
                id: sessionUser.id,
                email: sessionUser.email || '',
                accessLevel: 'viewer' as const,
                name: sessionUser.email?.split('@')[0] || 'Usuário',
                photoUrl: null,
                terminal: 'Rio Grande'
              };
              setUser(fallbackUser);
              setLastUserState(fallbackUser);
            }
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
          setUser(null);
          setLastUserState(null);
          stopSessionRefresh();
        }
      } catch (err) {
        if (!isComponentMounted) return;
        console.error("AuthProvider: Erro ao inicializar:", err);
        
        // Manter estado anterior em caso de erro de rede
        if (lastUserState) {
          console.log("Mantendo estado anterior devido a erro de rede");
          setUser(lastUserState);
        } else {
          setUser(null);
          stopSessionRefresh();
        }
      } finally {
        if (isComponentMounted) {
          console.log("AuthProvider: Inicialização concluída");
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    // Start initial check
    checkSession();

    // Set up auth state change listener
    const cleanupListener = setupAuthListener((authUser, profileData) => {
      if (!isComponentMounted) return;
      
      if (authUser && profileData) {
        startSessionRefresh();
        
        console.log(`AuthProvider: Nível de acesso bruto do banco: "${profileData.access_level}"`);
        
        const accessLevel = normalizeAccessLevel(profileData.access_level);
        console.log(`AuthProvider: Atualizando usuário com nível ${accessLevel}`);
        
        const userData = {
          id: authUser.id,
          email: authUser.email || '',
          accessLevel: accessLevel,
          name: profileData.name,
          photoUrl: profileData.photo_url,
          terminal: profileData.terminal
        };
        
        setUser(userData);
        setLastUserState(userData); // Salvar como último estado conhecido
        setIsLoading(false);
      } else {
        console.log('AuthProvider: Limpando estado do usuário');
        setUser(null);
        setLastUserState(null);
        stopSessionRefresh();
        setIsLoading(false);
      }
    });

    return () => {
      isComponentMounted = false;
      stopSessionRefresh();
      cleanupListener();
    };
  }, []);

  // Login function
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { success, user: authUser, profileData } = await login(email, password);
      
      if (success && authUser && profileData) {
        startSessionRefresh();
        
        console.log(`Login: Nível de acesso bruto do banco: "${profileData.access_level}"`);
        
        const accessLevel = normalizeAccessLevel(profileData.access_level);
        console.log(`Login bem-sucedido para ${email} com nível de acesso ${accessLevel}`);
        
        const userData = {
          id: authUser.id,
          email: authUser.email || '',
          accessLevel: accessLevel,
          name: profileData.name,
          photoUrl: profileData.photo_url,
          terminal: profileData.terminal
        };
        
        setUser(userData);
        setLastUserState(userData); // Salvar como último estado conhecido
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async (): Promise<void> => {
    console.log('Iniciando processo de logout...');
    setIsLoading(true);
    
    stopSessionRefresh();
    setUser(null);
    setLastUserState(null); // Limpar estado salvo
    
    try {
      const { success, error } = await logout();
      if (!success) {
        console.error('Erro no logout do Supabase:', error);
      } else {
        console.log('Logout do Supabase realizado com sucesso');
      }
    } catch (err) {
      console.error('Exceção durante logout:', err);
    } finally {
      setIsLoading(false);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Logout concluído');
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
    isLoading,
    loginUser,
    logoutUser,
    resetPassword,
    updatePassword
  };
}
