import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User } from '@/lib/supabase';
import { toast } from 'sonner';

export type AccessLevel = "operational" | "viewer" | "administrative";

interface UserData {
  email: string;
  accessLevel: AccessLevel;
  name?: string;
  photoUrl?: string;
  terminal?: string | null;
}

interface UserUpdateData {
  name?: string;
  email?: string;
  photoUrl?: string;
  password?: string;
  terminal?: string | null;
}

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

  // Verificar sessão atual do usuário ao carregar
  useEffect(() => {
    console.log("AuthProvider: Inicializando...");
    
    const checkSession = async () => {
      try {
        console.log("AuthProvider: Verificando sessão...");
        
        // Adicionar timeout para evitar bloqueio indefinido
        const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido na verificação de sessão")), 5000)
        );
        
        // Usar Promise.race para garantir timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        
        const { data, error: sessionError } = sessionResult;
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          setIsInitialized(true);
          return;
        }

        if (data.session?.user) {
          console.log("AuthProvider: Sessão encontrada para usuário:", data.session.user.email);
          
          try {
            // Buscar detalhes do usuário do perfil - usando prazo limite para evitar bloqueio
            const profileTimeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
              setTimeout(() => reject(new Error("Tempo limite excedido na busca de perfil")), 5000)
            );
            
            // Usar Promise.race para garantir timeout
            const profileResult = await Promise.race([
              supabase
                .from('user_profiles')
                .select('name, access_level, photo_url, terminal')
                .eq('id', data.session.user.id)
                .single(),
              profileTimeoutPromise
            ]);
            
            const { data: profileData, error } = profileResult;

            if (!error && profileData) {
              console.log("AuthProvider: Perfil de usuário carregado:", profileData.name);
              setUser({
                email: data.session.user.email || '',
                accessLevel: profileData.access_level as AccessLevel,
                name: profileData.name,
                photoUrl: profileData.photo_url,
                terminal: profileData.terminal
              });
            } else {
              console.error('Erro ao buscar perfil:', error);
              // Garantir que o usuário é nulo em caso de erro
              setUser(null);
            }
          } catch (profileErr) {
            console.error('Exceção ao buscar perfil:', profileErr);
            // Garantir que o usuário é nulo em caso de erro
            setUser(null);
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
          setUser(null);
        }
      } catch (err) {
        console.error("AuthProvider: Erro ao inicializar:", err);
        // Garantir que o usuário é nulo em caso de erro
        setUser(null);
      } finally {
        console.log("AuthProvider: Inicialização concluída");
        setIsInitialized(true);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`AuthProvider: Evento de autenticação: ${event}`);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: Usuário conectado:', session.user.email);
          
          try {
            // Buscar detalhes do perfil quando o usuário faz login
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('name, access_level, photo_url, terminal')
              .eq('id', session.user.id)
              .single();

            if (!error && profileData) {
              setUser({
                email: session.user.email || '',
                accessLevel: profileData.access_level as AccessLevel,
                name: profileData.name,
                photoUrl: profileData.photo_url,
                terminal: profileData.terminal
              });
              
              // Verificação extra para garantir que o usuário foi definido corretamente
              console.log('AuthProvider: Usuário definido no estado:', {
                email: session.user.email,
                accessLevel: profileData.access_level,
                name: profileData.name
              });
            } else {
              console.error('Erro ao buscar perfil após login:', error);
              setUser(null);
            }
          } catch (profileErr) {
            console.error('Exceção ao buscar perfil após login:', profileErr);
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Usuário desconectado');
          setUser(null);
        }
      }
    );

    return () => {
      console.log("AuthProvider: Limpando listener de autenticação");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentando login para:', email);
      
      // Definir um timeout para garantir resposta rápida do Supabase
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Criar um promise para o timeout
      const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => 
        setTimeout(() => reject(new Error("O login demorou muito tempo")), 8000)
      );
      
      // Usar Promise.race para evitar bloqueio indefinido
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) {
        console.error('Erro de autenticação:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('Login falhou: usuário não encontrado');
        return false;
      }
      
      console.log('Login bem-sucedido para:', data.user.email);
      
      // Não precisamos buscar o perfil aqui, o evento de 'SIGNED_IN' já fará isso
      // Aguardar um breve momento para garantir que o evento SIGNED_IN tenha tempo de processar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error('Erro de login:', errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar');
    }
  };

  // Verificar se o usuário tem acesso suficiente
  const hasAccess = (requiredLevel: AccessLevel): boolean => {
    if (!user) return false;
    
    // Administrative tem acesso a todos os níveis
    if (user.accessLevel === 'administrative') return true;
    
    // Operational users can access operational and viewer levels
    if (user.accessLevel === 'operational') {
      return requiredLevel === 'operational' || requiredLevel === 'viewer';
    }
    
    // Viewers can only access viewer level
    if (user.accessLevel === 'viewer') {
      return requiredLevel === 'viewer';
    }
    
    return false;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return false;
    }
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return false;
    }
  };

  const updateUserProfile = async (data: UserUpdateData): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Atualizar auth se houver password
      if (data.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: data.password
        });
        
        if (authError) {
          throw authError;
        }
      }
      
      // Obter o ID do usuário atual
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          name: data.name,
          photo_url: data.photoUrl,
          terminal: data.terminal
        })
        .eq('id', userData.user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Atualizar estado local
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          name: data.name || prev.name,
          photoUrl: data.photoUrl || prev.photoUrl,
          terminal: data.terminal !== undefined ? data.terminal : prev.terminal,
        };
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
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
