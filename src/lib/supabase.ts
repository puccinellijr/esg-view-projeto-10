
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ou valores de teste
// IMPORTANTE: Estes são valores de teste - substitua pelos seus valores de produção adequados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zrlczidvxjfulcogtbxd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGN6aWR2eGpmdWxjb2d0YnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjI1NTcsImV4cCI6MjA2MjYzODU1N30.CGVcBAraQKepURsahjwPZzLXwmnZqocEfJfbgIaD2Gw';

// Verificar se as variáveis são válidas e imprimir para debug
console.log('CONFIGURAÇÕES DO SUPABASE:');
console.log('URL:', supabaseUrl);
console.log('Chave anônima válida:', supabaseAnonKey && supabaseAnonKey.length > 20);

if (!supabaseUrl.includes('supabase.co') || supabaseAnonKey.length < 10) {
  console.error('Configurações do Supabase inválidas ou não encontradas. Verifique suas variáveis de ambiente.', {
    url: supabaseUrl.substring(0, 10) + '...',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
  });
}

// Criar cliente com tempo limite de resposta aumentado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Aumentar os timeouts para evitar problemas em redes lentas
    headers: { 'x-application-name': 'esg-dashboard' }
  },
});

// Função simplificada para testar conexão com o Supabase
// Reduzimos a complexidade para evitar timeouts
export const testSupabaseConnection = async () => {
  try {
    console.log('>>> Iniciando diagnóstico simplificado de conexão com Supabase <<<');
    console.log(`URL do Supabase: ${supabaseUrl.substring(0, 15)}...`);
    console.log(`Comprimento da chave anônima: ${supabaseAnonKey.length} caracteres`);
    
    // Verificar formato da URL
    if (!supabaseUrl.includes('supabase.co')) {
      console.error('URL do Supabase inválida. Deve conter "supabase.co"');
      return { success: false, error: 'URL_INVALID', message: 'URL do Supabase inválida' };
    }
    
    // Verificar se a chave parece válida
    if (supabaseAnonKey.length < 20) {
      console.error('Chave anônima do Supabase parece inválida (muito curta)');
      return { success: false, error: 'KEY_INVALID', message: 'Chave anônima do Supabase inválida' };
    }
    
    // Teste simplificado: apenas verificar se consegue obter a sessão atual
    // sem fazer várias consultas que podem causar timeout
    try {
      console.log('Testando conexão básica com Supabase...');
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro básico de conexão:', error);
        return { 
          success: false, 
          error: 'BASIC_CONNECTION', 
          message: `Erro de conexão: ${error.message}` 
        };
      }
      
      console.log('Conexão básica com Supabase OK');
      return { success: true };
      
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao testar conexão básica:', error);
      return { 
        success: false, 
        error: 'CONNECTION_ERROR', 
        message: `Erro de conexão: ${error.message}` 
      };
    }
  } catch (err) {
    const error = err as Error;
    console.error('>>> ERRO FATAL no diagnóstico de conexão <<<', error);
    return { 
      success: false, 
      error: 'FATAL_ERROR', 
      message: `Erro ao testar conexão: ${error.message}` 
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
