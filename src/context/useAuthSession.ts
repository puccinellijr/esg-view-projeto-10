
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
  const [persistedUserState, setPersistedUserState] = useState<UserData | null>(null);

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
        console.log("AuthProvider: Verificando sessão inicial...");
        setIsLoading(true);
        
        const { session, user: sessionUser, error: sessionError } = await getCurrentSession();
        
        if (!isComponentMounted) return;
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          // Usar estado persistido se disponível
          if (persistedUserState) {
            console.log("Usando estado persistido devido a erro de sessão");
            setUser(persistedUserState);
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
              setPersistedUserState(userData); // Persistir estado
            } else {
              console.error('Erro ao buscar perfil:', error);
              // Se temos um estado persistido, mantê-lo
              if (persistedUserState) {
                console.log("Mantendo dados de usuário do estado persistido");
                setUser(persistedUserState);
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
                setPersistedUserState(minimalUser);
              }
            }
          } catch (profileErr) {
            if (!isComponentMounted) return;
            console.error('Exceção ao buscar perfil:', profileErr);
            
            // Manter estado persistido se disponível
            if (persistedUserState) {
              console.log("Mantendo dados de usuário do estado persistido após erro");
              setUser(persistedUserState);
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
              setPersistedUserState(fallbackUser);
            }
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
          setUser(null);
          setPersistedUserState(null);
          stopSessionRefresh();
        }
      } catch (err) {
        if (!isComponentMounted) return;
        console.error("AuthProvider: Erro ao inicializar:", err);
        
        // Manter estado persistido em caso de erro de rede
        if (persistedUserState) {
          console.log("Mantendo estado persistido devido a erro de rede");
          setUser(persistedUserState);
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

    // Set up auth state change listener - apenas para mudanças reais de autenticação
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
        setPersistedUserState(userData); // Persistir estado
        setIsLoading(false);
      } else {
        console.log('AuthProvider: Limpando estado do usuário');
        setUser(null);
        setPersistedUserState(null);
        stopSessionRefresh();
        setIsLoading(false);
      }
    });

    return () => {
      isComponentMounted = false;
      // Não parar refresh da sessão ao desmontar - manter conexão ativa
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
        setPersistedUserState(userData); // Persistir estado
        
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
    setPersistedUserState(null); // Limpar estado persistido
    
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

  // Função para verificar sessão apenas na navegação entre páginas
  const validateSessionOnNavigation = async (): Promise<boolean> => {
    try {
      console.log("Validando sessão durante navegação...");
      const { session, error } = await getCurrentSession();
      
      if (error || !session) {
        console.warn("Sessão inválida detectada durante navegação");
        if (!persistedUserState) {
          setUser(null);
          return false;
        }
        // Manter estado persistido mesmo com sessão inválida
        return true;
      }
      
      console.log("Sessão válida durante navegação");
      return true;
    } catch (err) {
      console.error("Erro ao validar sessão:", err);
      // Manter estado atual em caso de erro
      return persistedUserState !== null;
    }
  };

  return {
    user,
    setUser,
    isInitialized,
    isLoading,
    loginUser,
    logoutUser,
    resetPassword,
    updatePassword,
    validateSessionOnNavigation
  };
}
