
import { supabase } from '@/lib/supabase';
import { loadUserProfile } from './userProfileService';
import { AccessLevel } from '@/types/auth';

type AuthStateChangeCallback = (user: any, profileData: any | null) => void;

/**
 * Set up auth state change listener
 */
export const setupAuthListener = (onAuthStateChange: AuthStateChangeCallback) => {
  console.log("Configurando listener de autenticação");
  
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log(`Evento de autenticação: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Usuário conectado:', session.user.email);
        
        try {
          // Get user profile data with a shorter timeout
          const { profileData, error } = await loadUserProfile(session.user.id);

          if (!error && profileData) {
            console.log('Perfil carregado com sucesso:', profileData.name);
            console.log('Nível de acesso carregado:', profileData.access_level);
            onAuthStateChange(session.user, profileData);
          } else {
            console.error('Erro ao buscar perfil após login:', error);
            // Create a minimal profile so the user can at least navigate
            const minimalProfile = {
              access_level: 'viewer', // Default to lowest access level
              name: session.user.email?.split('@')[0] || 'Usuário',
              photo_url: null,
              terminal: null
            };
            onAuthStateChange(session.user, minimalProfile);
          }
        } catch (profileErr) {
          console.error('Exceção ao buscar perfil após login:', profileErr);
          // Create a minimal profile so the user can at least navigate
          const minimalProfile = {
            access_level: 'viewer', // Default to lowest access level
            name: session.user.email?.split('@')[0] || 'Usuário',
            photo_url: null,
            terminal: null
          };
          onAuthStateChange(session.user, minimalProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário desconectado');
        onAuthStateChange(null, null);
      }
    }
  );

  return () => {
    console.log("Limpando listener de autenticação");
    authListener.subscription.unsubscribe();
  };
};

/**
 * Check if user has required access level
 */
export const checkAccessLevel = (userAccessLevel: string | undefined, requiredLevel: AccessLevel): boolean => {
  if (!userAccessLevel) return false;
  
  console.log(`Verificando acesso: nível do usuário ${userAccessLevel}, nível requerido ${requiredLevel}`);
  
  // Normalizar os níveis de acesso para garantir que a comparação seja case-insensitive
  const normalizedUserLevel = userAccessLevel.toLowerCase().trim();
  const normalizedRequiredLevel = requiredLevel.toLowerCase().trim();
  
  // Administrative tem acesso a todos os níveis
  if (normalizedUserLevel === 'administrative') {
    console.log('Usuário é administrativo, acesso concedido');
    return true;
  }
  
  // Operational users can access operational and viewer levels
  if (normalizedUserLevel === 'operational') {
    const hasAccess = normalizedRequiredLevel === 'operational' || normalizedRequiredLevel === 'viewer';
    console.log(`Usuário é operacional, acesso a ${requiredLevel}: ${hasAccess}`);
    return hasAccess;
  }
  
  // Viewers can only access viewer level
  if (normalizedUserLevel === 'viewer') {
    const hasAccess = normalizedRequiredLevel === 'viewer';
    console.log(`Usuário é visualizador, acesso a ${requiredLevel}: ${hasAccess}`);
    return hasAccess;
  }
  
  console.log(`Nível de acesso desconhecido: ${userAccessLevel}, acesso negado`);
  return false;
};
