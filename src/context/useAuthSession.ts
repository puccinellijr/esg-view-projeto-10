
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session and set up listener
  useEffect(() => {
    console.log("AuthProvider: Inicializando...");
    let initializationTimeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        console.log("AuthProvider: Verificando sessão...");
        setIsLoading(true);
        
        // Set a timeout to prevent infinite loading
        initializationTimeout = setTimeout(() => {
          console.warn("AuthProvider: Timeout na inicialização, definindo como não autenticado");
          setUser(null);
          setIsInitialized(true);
          setIsLoading(false);
        }, 10000); // 10 seconds timeout
        
        const { session, user: sessionUser, error: sessionError } = await getCurrentSession();
        
        // Clear timeout if we get a response
        clearTimeout(initializationTimeout);
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          setUser(null);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        if (sessionUser) {
          console.log("AuthProvider: Sessão encontrada para usuário:", sessionUser.email);
          
          try {
            // Add timeout for profile loading
            const profilePromise = loadUserProfile(sessionUser.id);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile loading timeout')), 8000)
            );
            
            const { profileData: loadedProfile, error } = await Promise.race([
              profilePromise,
              timeoutPromise
            ]) as any;

            if (!error && loadedProfile) {
              console.log("AuthProvider: Perfil de usuário carregado:", loadedProfile.name);
              
              // Log the raw access level from the database
              console.log("AuthProvider: Nível de acesso bruto do banco:", loadedProfile.access_level);
              
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
            console.error('Exceção ao buscar perfil:', profileErr);
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
        setIsLoading(false);
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };

    checkSession();

    // Set up auth state change listener
    const cleanupListener = setupAuthListener((authUser, profileData) => {
      if (authUser && profileData) {
        // Log the raw access level value from the database
        console.log(`AuthProvider: Nível de acesso bruto do banco: "${profileData.access_level}"`);
        
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
        setIsLoading(false);
      } else {
        console.log('AuthProvider: Limpando estado do usuário');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      cleanupListener();
    };
  }, []);

  // Login function
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { success, user: authUser, profileData } = await login(email, password);
      
      if (success && authUser && profileData) {
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
