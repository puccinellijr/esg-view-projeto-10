
import { supabase } from '@/lib/supabase';
import { loadUserProfile } from './userProfileService';
import { AccessLevel } from '@/types/auth';
import { checkAccessLevel as checkAccess } from '@/context/authUtils';

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
            console.log('Nível de acesso carregado (valor original):', profileData.access_level);
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
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('Usuário desconectado ou removido');
        // Immediately notify about the session change
        onAuthStateChange(null, null);
        
        // Double-check session status after a short delay
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            console.warn('Sessão ainda ativa após evento de logout - forçando limpeza');
            await supabase.auth.signOut({ scope: 'local' });
            onAuthStateChange(null, null);
          }
        }, 500);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado');
        // No action needed, session is still valid
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
  return checkAccess(userAccessLevel, requiredLevel);
};
