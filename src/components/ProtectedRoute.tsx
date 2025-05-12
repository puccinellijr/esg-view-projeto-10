
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AccessLevel } from '@/types/auth';

interface ProtectedRouteProps {
  requiredLevel?: AccessLevel;
}

export default function ProtectedRoute({ requiredLevel = 'operational' }: ProtectedRouteProps) {
  const { user, hasAccess, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        <span className="ml-3">Verificando autenticação...</span>
      </div>
    );
  }

  // Redirect to login if user is not logged in
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required access level
  const hasRequiredAccess = hasAccess(requiredLevel);
  
  console.log(`User ${user.email} with level ${user.accessLevel} accessing route requiring ${requiredLevel} - Access granted: ${hasRequiredAccess}`);
  
  if (!hasRequiredAccess) {
    // Redirect to unauthorized page or dashboard with a message
    console.log(`Acesso negado para ${user.email} - Nível requerido: ${requiredLevel}, Nível do usuário: ${user.accessLevel}`);
    return <Navigate to="/unauthorized" state={{ from: location, requiredLevel }} replace />;
  }
  
  // Return the outlet component to render child routes
  return <Outlet />;
}
