
import { AccessLevel } from '@/types/auth';

// Normalizes access level string to ensure consistent format
export const normalizeAccessLevel = (accessLevel?: string): AccessLevel => {
  if (!accessLevel) return 'viewer'; // Default if no access level
  
  const normalizedLevel = accessLevel.toLowerCase().trim();
  
  if (normalizedLevel === 'administrative') return 'administrative';
  if (normalizedLevel === 'operational') return 'operational';
  return 'viewer'; // Default to lowest access level if unknown
};

// Check if user has required access level
export const checkAccessLevel = (userAccessLevel?: string, requiredLevel?: AccessLevel): boolean => {
  if (!userAccessLevel || !requiredLevel) return false;
  
  const normalizedUserLevel = normalizeAccessLevel(userAccessLevel);
  
  // Administrative has access to all levels
  if (normalizedUserLevel === 'administrative') return true;
  
  // Operational users can access operational and viewer levels
  if (normalizedUserLevel === 'operational') {
    return requiredLevel === 'operational' || requiredLevel === 'viewer';
  }
  
  // Viewers can only access viewer level
  return requiredLevel === 'viewer';
};
