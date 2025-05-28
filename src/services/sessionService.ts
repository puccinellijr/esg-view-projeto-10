import { supabase } from '@/lib/supabase';
import { loadUserProfile } from './userProfileService';
import { AccessLevel } from '@/types/auth';
import { checkAccessLevel as checkAccess } from '@/context/authUtils';

type AuthStateChangeCallback = (user: any, profileData: any | null) => void;

let lastProcessedSession: string | null = null;
let isProcessingAuth = false;

/**
 * Set up auth state change listener
 */
export const setupAuthListener = (onAuthStateChange: AuthStateChangeCallback) => {
  console.log("Configurando listener de autenticação");
  
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log(`Evento de autenticação: ${event}`);
      
      // Evitar processar o mesmo evento/sessão múltiplas vezes
      const sessionId = session?.access_token?.substring(0, 20) || 'no-session';
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar se já processamos esta sessão
        if (lastProcessedSession === sessionId || isProcessingAuth) {
          console.log('Sessão já processada ou processamento em andamento - ignorando evento');
          return;
        }
        
        isProcessingAuth = true;
        lastProcessedSession = sessionId;
        
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
        } finally {
          isProcessingAuth = false;
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário desconectado - limpando estado');
        lastProcessedSession = null;
        isProcessingAuth = false;
        onAuthStateChange(null, null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado - mantendo estado atual');
        // Keep current user state on token refresh - não recarregar perfil
      } else {
        console.log(`Evento de autenticação não tratado: ${event}`);
        // For other events, don't change user state unless it's a sign out
        if (!session) {
          lastProcessedSession = null;
          onAuthStateChange(null, null);
        }
      }
    }
  );

  return () => {
    console.log("Limpando listener de autenticação");
    lastProcessedSession = null;
    isProcessingAuth = false;
    authListener.subscription.unsubscribe();
  };
};

/**
 * Check if user has required access level
 */
export const checkAccessLevel = (userAccessLevel: string | undefined, requiredLevel: AccessLevel): boolean => {
  return checkAccess(userAccessLevel, requiredLevel);
};
