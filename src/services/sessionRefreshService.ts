
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

let refreshInterval: NodeJS.Timeout | null = null;
let lastVisibilityChange = Date.now();
let visibilityChangeHandler: (() => void) | null = null;
let isRefreshing = false;

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

  // Refresh session every 20 minutes (more frequent to prevent issues)
  refreshInterval = setInterval(async () => {
    if (isRefreshing) {
      console.log('Renovação já em andamento, pulando...');
      return;
    }
    
    try {
      console.log('Renovando sessão automaticamente...');
      isRefreshing = true;
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        // Only show error if it's a critical auth issue
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('invalid_refresh_token')) {
          console.warn('Token de renovação inválido - usuário precisa fazer login novamente');
        }
      } else {
        console.log('Sessão renovada com sucesso');
      }
    } catch (err) {
      console.error('Exceção ao renovar sessão:', err);
    } finally {
      isRefreshing = false;
    }
  }, 20 * 60 * 1000); // 20 minutes

  // Create new visibility change handler with improved logic
  visibilityChangeHandler = async () => {
    const now = Date.now();
    const wasHidden = document.hidden;
    
    if (!wasHidden) {
      // Page became visible again
      const timeSinceLastChange = now - lastVisibilityChange;
      
      // If page was hidden for more than 10 seconds, check and refresh session
      if (timeSinceLastChange > 10 * 1000) {
        console.log(`Página ficou oculta por ${Math.round(timeSinceLastChange / 1000)}s, verificando sessão...`);
        
        // Don't block if already refreshing
        if (!isRefreshing) {
          try {
            isRefreshing = true;
            await ensureValidSession();
          } finally {
            isRefreshing = false;
          }
        }
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
  
  isRefreshing = false;
};

/**
 * Check if session is valid and refresh if needed
 */
export const ensureValidSession = async (): Promise<boolean> => {
  try {
    // First check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return false;
    }
    
    if (!session) {
      console.log('Nenhuma sessão ativa');
      return false;
    }
    
    // Check if token is about to expire (within 10 minutes instead of 5)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 600) { // Less than 10 minutes
      console.log(`Token expira em ${Math.round(timeUntilExpiry / 60)} minutos, renovando...`);
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
