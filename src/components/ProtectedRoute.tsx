
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AccessLevel } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requiredLevel?: AccessLevel;
}

export default function ProtectedRoute({ requiredLevel = 'operational' }: ProtectedRouteProps) {
  const { user, hasAccess } = useAuth();
  const location = useLocation();

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required access level
  if (!hasAccess(requiredLevel)) {
    // Redirect to unauthorized page or dashboard with a message
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // Special case for operational users - they should access dashboard and operational form
  if (user.accessLevel === 'operational' && 
      !location.pathname.startsWith('/operational-form') && 
      location.pathname !== '/dashboard' && 
      !location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/operational-form" replace />;
  }
  
  return <Outlet />;
}
