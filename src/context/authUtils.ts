
import { AccessLevel } from '@/types/auth';

// Normalizes access level string to ensure consistent format
export const normalizeAccessLevel = (accessLevel?: string): AccessLevel => {
  if (!accessLevel) return 'viewer'; // Default if no access level
  
  const normalizedLevel = accessLevel.toLowerCase().trim();
  
  // Make sure we properly recognize all possible variations of access levels
  if (normalizedLevel === 'administrative' || normalizedLevel === 'admin') return 'administrative';
  if (normalizedLevel === 'operational' || normalizedLevel === 'operator') return 'operational';
  if (normalizedLevel === 'viewer' || normalizedLevel === 'view') return 'viewer';
  
  console.log(`Nível de acesso desconhecido: "${accessLevel}", configurando como visualizador por segurança`);
  return 'viewer'; // Default to lowest access level if unknown
};

// Check if user has required access level
export const checkAccessLevel = (userAccessLevel?: string, requiredLevel?: AccessLevel): boolean => {
  if (!userAccessLevel || !requiredLevel) return false;
  
  const normalizedUserLevel = normalizeAccessLevel(userAccessLevel);
  console.log(`Verificando acesso: nível do usuário ${normalizedUserLevel}, nível requerido ${requiredLevel}`);
  
  // Administrative has access to all levels
  if (normalizedUserLevel === 'administrative') return true;
  
  // Operational users can access operational and viewer levels
  if (normalizedUserLevel === 'operational') {
    return requiredLevel === 'operational' || requiredLevel === 'viewer';
  }
  
  // Viewers can only access viewer level
  return requiredLevel === 'viewer';
};
