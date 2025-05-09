import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AccessLevel = "operational" | "viewer" | "administrative";

interface User {
  email: string;
  accessLevel: AccessLevel;
  name?: string;
  photoUrl?: string;
  terminal?: string | null; // Added terminal property
}

interface UserUpdateData {
  name?: string;
  email?: string;
  photoUrl?: string;
  password?: string;
  terminal?: string | null; // Added terminal property
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasAccess: (requiredLevel: AccessLevel) => boolean;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (email: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (data: UserUpdateData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing user session on load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Falha ao analisar usuário armazenado:', error);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Access level hierarchy from lowest to highest
  const accessHierarchy: AccessLevel[] = ['viewer', 'operational', 'administrative'];

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Check if user has sufficient access
  const hasAccess = (requiredLevel: AccessLevel): boolean => {
    if (!user) return false;
    
    // Administrative has access to all levels
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

  // For password reset functionality
  const resetPassword = async (email: string): Promise<boolean> => {
    // In a real app, this would call an API to send a reset email
    // For this demo, we'll simulate it with a success response
    return new Promise(resolve => {
      // Check if the user exists
      const users = [
        { email: "admin@example.com" },
        { email: "viewer@example.com" },
        { email: "operator@example.com" }
      ];
      
      const userExists = users.some(user => user.email === email);
      
      if (userExists) {
        // Generate a reset token and store it
        const resetToken = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem(`reset_${email}`, resetToken);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    // In a real app, this would call an API to update the user's password
    // For this demo, we'll simulate it with a success response
    return new Promise(resolve => {
      // In a real application, we'd verify the user exists and update their password in the database
      // Here we'll just return success
      resolve(true);
    });
  };

  const updateUserProfile = async (data: UserUpdateData): Promise<boolean> => {
    // In a real app, this would call an API to update the user profile
    return new Promise(resolve => {
      try {
        if (user) {
          const updatedUser = {
            ...user,
            name: data.name || user.name,
            email: data.email || user.email,
            photoUrl: data.photoUrl || user.photoUrl,
            terminal: data.terminal !== undefined ? data.terminal : user.terminal,
          };
          
          setUser(updatedUser);
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        resolve(false);
      }
    });
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
