
import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { AccessLevel, UserData, UserUpdateData } from '@/types/auth';
import { useAuthSession } from './useAuthSession';
import { useAuthProfile } from './useAuthProfile';
import { checkAccessLevel } from './authUtils';
import { AuthContextType } from './types';
import { verifyUserAccessLevel } from '@/services/userPermissionService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks to separate concerns
  const { 
    user: sessionUser, 
    setUser: setSessionUser,
    isInitialized, 
    isLoading,
    loginUser, 
    logoutUser, 
    resetPassword, 
    updatePassword,
    validateSessionOnNavigation
  } = useAuthSession();
  
  const { updateUserProfile } = useAuthProfile(sessionUser, setSessionUser);
  
  // Check if user has required access level
  const hasAccess = React.useCallback((requiredLevel: AccessLevel): boolean => {
    if (!sessionUser) return false;
    
    console.log(`AuthContext: verificando se ${sessionUser.email} com nível ${sessionUser.accessLevel} pode acessar ${requiredLevel}`);
    
    return checkAccessLevel(sessionUser.accessLevel, requiredLevel);
  }, [sessionUser]);

  const value = React.useMemo(() => ({
    user: sessionUser,
    login: loginUser,
    logout: logoutUser,
    hasAccess,
    resetPassword,
    updatePassword,
    updateUserProfile,
    isInitialized: isInitialized && !isLoading,
    validateSessionOnNavigation
  }), [sessionUser, loginUser, logoutUser, hasAccess, resetPassword, updatePassword, updateUserProfile, isInitialized, isLoading, validateSessionOnNavigation]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Add more detailed error information for debugging
    console.error('useAuth foi chamado fora do AuthProvider. Stack trace:', new Error().stack);
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Re-export the types for convenience
export type { AccessLevel, UserData, UserUpdateData };
