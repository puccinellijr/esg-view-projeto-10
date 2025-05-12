
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
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthProvider: Erro ao verificar sessão:", sessionError);
          setIsInitialized(true);
          return;
        }

        if (data.session?.user) {
          console.log("AuthProvider: Sessão encontrada para usuário:", data.session.user.email);
          
          // Buscar detalhes do usuário do perfil - usando single() para melhor desempenho
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('name, access_level, photo_url, terminal')
            .eq('id', data.session.user.id)
            .single();

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
          }
        } else {
          console.log("AuthProvider: Nenhuma sessão ativa");
        }
      } catch (err) {
        console.error("AuthProvider: Erro ao inicializar:", err);
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
          } else {
            console.error('Erro ao buscar perfil após login:', error);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro de autenticação:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('Login falhou: usuário não encontrado');
        return false;
      }
      
      console.log('Login bem-sucedido para:', data.user.email);
      
      // Buscar detalhes do perfil após login bem-sucedido
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('name, access_level, photo_url, terminal')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return false;
      }

      console.log('Perfil carregado:', profileData?.name || 'sem nome');
      
      setUser({
        email: data.user.email || '',
        accessLevel: profileData.access_level as AccessLevel,
        name: profileData.name,
        photoUrl: profileData.photo_url,
        terminal: profileData.terminal
      });

      return true;
    } catch (error) {
      console.error('Erro de login:', error);
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
