
import { supabase } from '@/lib/supabase';

let refreshInterval: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Start automatic session refresh - mantém conexão ativa sempre
 */
export const startSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Refresh session every 25 minutes (before 30min expiry)
  refreshInterval = setInterval(async () => {
    if (isRefreshing) {
      console.log('Renovação já em andamento - pulando');
      return;
    }
    
    try {
      console.log('Renovando sessão automaticamente...');
      isRefreshing = true;
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        // Não limpar estado persistido em caso de erro de renovação
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('invalid_refresh_token')) {
          console.warn('Token de renovação inválido - mantendo conexão');
        }
      } else {
        console.log('Sessão renovada com sucesso');
      }
    } catch (err) {
      console.error('Exceção ao renovar sessão:', err);
      // Continuar tentando renovar mesmo com erros
    } finally {
      isRefreshing = false;
    }
  }, 25 * 60 * 1000); // 25 minutes
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
  
  isRefreshing = false;
};

/**
 * Check if session is valid - usado apenas em navegação entre páginas
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
