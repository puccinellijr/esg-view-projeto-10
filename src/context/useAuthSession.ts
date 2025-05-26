
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

  // Initialize session and set up listener
  useEffect(() => {
    console.log("AuthProvider: Inicializando...");
    let initializationTimeout: NodeJS.Timeout;
    let isComponentMounted = true;
    let hasStartedInitialization = false;
    
    const checkSession = async () => {
      // Prevent multiple simultaneous initializations
      if (hasStartedInitialization && !document.hidden) {
        console.log("AuthProvider: Inicialização já em andamento, ignorando");
        return;
      }
      
      // Don't start timeout if page is hidden during initialization
      if (document.hidden) {
        console.log("AuthProvider: Página oculta durante inicialização, aguardando...");
        return;
      }
      
      hasStartedInitialization = true;
      
      try {
        console.log("AuthProvider: Verificando sessão...");
        setIsLoading(true);
        
        // Only set timeout if page is visible
        if (!document.hidden) {
          initializationTimeout = setTimeout(() => {
            if (!isComponentMounted || document.hidden) return;
            console.warn("AuthProvider: Timeout na inicialização após 30s");
            setUser(null);
            setIsInitialized(true);
            setIsLoading(false);
          }, 30000);
        }
        
        const { session, user: sessionUser, error: sessionError } = await getCurrentSession();
        
        // Clear timeout if we get a response and component is still mounted
        if (isComponentMounted && initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
        
        if (!isComponentMounted) return;
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          setUser(null);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        if (sessionUser) {
          console.log("AuthProvider: Sessão encontrada para usuário:", sessionUser.email);
          
          // Start session refresh when user is authenticated
          startSessionRefresh();
          
          try {
            // Reduce timeout for profile loading to 10 seconds
            const profilePromise = loadUserProfile(sessionUser.id);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
            );
            
            const { profileData: loadedProfile, error } = await Promise.race([
              profilePromise,
              timeoutPromise
            ]) as any;

            if (!isComponentMounted) return;

            if (!error && loadedProfile) {
              console.log("AuthProvider: Perfil de usuário carregado:", loadedProfile.name);
              console.log("AuthProvider: Nível de acesso bruto do banco:", loadedProfile.access_level);
              
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
              // Create minimal user data to prevent blocking
              setUser({
                id: sessionUser.id,
                email: sessionUser.email || '',
                accessLevel: 'viewer',
                name: sessionUser.email?.split('@')[0] || 'Usuário',
                photoUrl: null,
                terminal: 'Rio Grande'
              });
            }
          } catch (profileErr) {
            if (!isComponentMounted) return;
            console.error('Exceção ao buscar perfil:', profileErr);
            setUser({
              id: sessionUser.id,
              email: sessionUser.email || '',
              accessLevel: 'viewer',
              name: sessionUser.email?.split('@')[0] || 'Usuário',
              photoUrl: null,
              terminal: 'Rio Grande'
            });
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
          setUser(null);
          stopSessionRefresh();
        }
      } catch (err) {
        if (!isComponentMounted) return;
        console.error("AuthProvider: Erro ao inicializar:", err);
        setUser(null);
        stopSessionRefresh();
      } finally {
        if (isComponentMounted) {
          console.log("AuthProvider: Inicialização concluída");
          setIsInitialized(true);
          setIsLoading(false);
        }
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };

    // Handle page visibility changes to restart initialization if needed
    const handleVisibilityChange = () => {
      if (!document.hidden && !isInitialized && !hasStartedInitialization) {
        console.log("AuthProvider: Página voltou a ficar visível, reiniciando verificação");
        checkSession();
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start initial check
    checkSession();

    // Set up auth state change listener
    const cleanupListener = setupAuthListener((authUser, profileData) => {
      if (!isComponentMounted) return;
      
      if (authUser && profileData) {
        // Start session refresh when user is authenticated
        startSessionRefresh();
        
        console.log(`AuthProvider: Nível de acesso bruto do banco: "${profileData.access_level}"`);
        
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
        setIsLoading(false);
      } else {
        console.log('AuthProvider: Limpando estado do usuário');
        setUser(null);
        stopSessionRefresh();
        setIsLoading(false);
      }
    });

    return () => {
      isComponentMounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        // Start session refresh on successful login
        startSessionRefresh();
        
        // Log the raw access level from the database
        console.log(`Login: Nível de acesso bruto do banco: "${profileData.access_level}"`);
        
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
    } finally {
      setIsLoading(false);
    }
  };

  // Improved logout function
  const logoutUser = async (): Promise<void> => {
    console.log('Iniciando processo de logout...');
    setIsLoading(true);
    
    // Stop session refresh immediately
    stopSessionRefresh();
    
    // Clear user state immediately to prevent UI inconsistencies
    setUser(null);
    
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
    
    // Force a small delay to ensure all auth listeners have processed the logout
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
