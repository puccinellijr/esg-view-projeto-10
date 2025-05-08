
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AccessLevel = "operational" | "viewer" | "administrative";

interface User {
  email: string;
  accessLevel: AccessLevel;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasAccess: (requiredLevel: AccessLevel) => boolean;
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
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Access level hierarchy
  const accessHierarchy: AccessLevel[] = ['operational', 'viewer', 'administrative'];

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Check if user has sufficient access
  const hasAccess = (requiredLevel: AccessLevel) => {
    if (!user) return false;
    
    const userLevelIndex = accessHierarchy.indexOf(user.accessLevel);
    const requiredLevelIndex = accessHierarchy.indexOf(requiredLevel);
    
    // Administrative has access to all levels
    if (user.accessLevel === 'administrative') return true;
    
    // For other access levels, they can only access their level or lower
    return userLevelIndex >= requiredLevelIndex;
  };

  const value = {
    user,
    login,
    logout,
    hasAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
