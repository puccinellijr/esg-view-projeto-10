
import { AccessLevel } from '@/types/auth';

// Normalizes access level string to ensure consistent format
export const normalizeAccessLevel = (accessLevel?: string): AccessLevel => {
  if (!accessLevel) return 'viewer'; // Default if no access level
  
  const normalizedLevel = accessLevel.toLowerCase().trim();
  console.log(`Normalizando nível de acesso original: "${accessLevel}" -> "${normalizedLevel}"`);
  
  // Preservar o nível de acesso exato se for válido
  if (normalizedLevel === 'administrative' || normalizedLevel === 'admin') return 'administrative';
  if (normalizedLevel === 'operational' || normalizedLevel === 'operator') return 'operational';
  if (normalizedLevel === 'viewer' || normalizedLevel === 'view') return 'viewer';
  
  // Se o valor original corresponder exatamente a um dos níveis válidos, retorná-lo
  if (accessLevel === 'administrative' || accessLevel === 'operational' || accessLevel === 'viewer') {
    return accessLevel as AccessLevel;
  }
  
  console.warn(`Nível de acesso desconhecido: "${accessLevel}", configurando como viewer por segurança`);
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
