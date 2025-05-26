
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

let refreshInterval: NodeJS.Timeout | null = null;
let lastVisibilityChange = Date.now();
let visibilityChangeHandler: (() => void) | null = null;

/**
 * Start automatic session refresh
 */
export const startSessionRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Remove existing visibility listener
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
  }

  // Refresh session every 25 minutes (Supabase tokens expire after 1 hour)
  refreshInterval = setInterval(async () => {
    try {
      console.log('Renovando sessão automaticamente...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        // Don't show error toast for automatic refresh failures
      } else {
        console.log('Sessão renovada com sucesso');
      }
    } catch (err) {
      console.error('Exceção ao renovar sessão:', err);
    }
  }, 25 * 60 * 1000); // 25 minutes

  // Create new visibility change handler
  visibilityChangeHandler = () => {
    const now = Date.now();
    const wasHidden = document.hidden;
    
    if (!wasHidden) {
      // Page became visible again
      const timeSinceLastChange = now - lastVisibilityChange;
      
      // If page was hidden for more than 30 seconds, refresh session immediately
      if (timeSinceLastChange > 30 * 1000) {
        console.log('Página ficou oculta por mais de 30 segundos, renovando sessão...');
        ensureValidSession();
      }
    }
    
    lastVisibilityChange = now;
  };

  document.addEventListener('visibilitychange', visibilityChangeHandler);
};

/**
 * Stop automatic session refresh
 */
export const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('Renovação automática de sessão interrompida');
  }
  
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
    visibilityChangeHandler = null;
  }
};

/**
 * Check if session is valid and refresh if needed
 */
export const ensureValidSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return false;
    }
    
    if (!session) {
      console.log('Nenhuma sessão ativa');
      return false;
    }
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('Token próximo do vencimento, renovando...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Erro ao renovar token expirado:', refreshError);
        return false;
      }
      
      console.log('Token renovado com sucesso');
      return true;
    }
    
    return true;
  } catch (err) {
    console.error('Exceção ao verificar sessão:', err);
    return false;
  }
};
