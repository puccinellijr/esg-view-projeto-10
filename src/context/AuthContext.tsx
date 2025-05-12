
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  // Verificar sessão atual do usuário ao carregar
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Buscar detalhes do usuário do perfil
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', data.session.user.email)
          .single();

        if (!error && profileData) {
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
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Buscar detalhes do perfil quando o usuário faz login
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!error && profileData) {
            setUser({
              email: session.user.email || '',
              accessLevel: profileData.access_level as AccessLevel,
              name: profileData.name,
              photoUrl: profileData.photo_url,
              terminal: profileData.terminal
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Buscar detalhes do perfil após login bem-sucedido
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          return false;
        }

        setUser({
          email: data.user.email || '',
          accessLevel: profileData.access_level as AccessLevel,
          name: profileData.name,
          photoUrl: profileData.photo_url,
          terminal: profileData.terminal
        });

        return true;
      }
      return false;
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
      
      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          name: data.name,
          photo_url: data.photoUrl,
          terminal: data.terminal
        })
        .eq('email', user.email);
      
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
    updateUserProfile
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
