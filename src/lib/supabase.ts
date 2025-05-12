
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ou valores de teste
// IMPORTANTE: Estes são valores de teste - substitua pelos seus valores de produção adequados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zrlczidvxjfulcogtbxd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGN6aWR2eGpmdWxjb2d0YnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjI1NTcsImV4cCI6MjA2MjYzODU1N30.CGVcBAraQKepURsahjwPZzLXwmnZqocEfJfbgIaD2Gw';

// Criar cliente com configurações básicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Função aprimorada para testar conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('Testando conexão com Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    console.log('Testando autenticação anônima...');
    
    // Definir timeout para evitar bloqueio indefinido
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // Teste básico de conexão - verificar sessão
      const { data, error } = await supabase.auth.getSession();
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        return { 
          success: false, 
          error: 'AUTH_SESSION_ERROR', 
          message: `Erro ao verificar sessão: ${error.message}`
        };
      }
      
      console.log('Teste de sessão bem-sucedido');
      
      // Teste de acesso a tabela (uma operação rápida)
      console.log('Testando acesso à tabela user_profiles...');
      const { count, error: tableError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (tableError) {
        console.error('Erro ao acessar tabela user_profiles:', tableError);
        return { 
          success: false, 
          error: 'TABLE_ACCESS_ERROR', 
          message: `Erro ao acessar tabela: ${tableError.message}`
        };
      }
      
      console.log(`Conexão com tabela bem-sucedida. Encontrados ${count} registros.`);
      return { 
        success: true,
        message: 'Conexão com Supabase estabelecida com sucesso.'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (err) {
    console.error('Erro ao testar conexão:', err);
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return { 
      success: false, 
      error: 'CONNECTION_ERROR', 
      message: `Erro de conexão: ${error}`
    };
  }
};

// Tipos para nossas tabelas no Supabase
export type User = {
  id: string;
  email: string;
  name?: string;
  access_level: 'operational' | 'viewer' | 'administrative';
  photo_url?: string;
  terminal?: string;
};

export type ESGIndicator = {
  id: string;
  name: string;
  value: number;
  category: 'environmental' | 'social' | 'governance';
  terminal: string;
  month: number;
  year: number;
  created_at: string;
};

export type ESGComparisonData = {
  indicator_id: string;
  indicator_name: string;
  category: 'environmental' | 'social' | 'governance';
  value1: number;
  value2: number;
};
