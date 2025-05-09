
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
  
  // Remove the restriction that was preventing operational users from accessing the dashboard
  // Operational users should be able to access both the operational form and the dashboard
  
  return <Outlet />;
}
