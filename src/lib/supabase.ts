
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
});

// Função melhorada para testar conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('>>> Iniciando diagnóstico de conexão com Supabase <<<');
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
    
    // Primeiro teste: verificar se o serviço de autenticação está acessível
    console.log('1. Testando serviço de autenticação...');
    const authTest = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout na autenticação')), 3000))
    ]).catch(err => {
      console.error('Timeout ou erro na autenticação:', err);
      return { error: { message: err.message } };
    });
    
    if (authTest.error) {
      console.error('Erro no serviço de autenticação:', authTest.error);
      return { 
        success: false, 
        error: 'AUTH_SERVICE', 
        message: `Erro no serviço de autenticação: ${authTest.error.message}` 
      };
    }
    
    console.log('Serviço de autenticação OK');
    
    // Segundo teste: verificar se a tabela user_profiles existe
    console.log('2. Verificando existência da tabela user_profiles...');
    try {
      const tableTest = await Promise.race([
        supabase.from('user_profiles').select('count'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao verificar tabela')), 3000))
      ]);
      
      if (tableTest.error) {
        // Detectar erro específico de tabela inexistente
        if (tableTest.error.code === '42P01') {
          console.error('Tabela user_profiles não existe no banco de dados');
          return {
            success: false,
            error: 'TABLE_NOT_FOUND',
            message: 'Tabela user_profiles não existe. Crie a tabela no Supabase.'
          };
        }
        
        // Detectar erro de permissão (RLS)
        if (tableTest.error.code === '42501' || 
            (tableTest.error.message && tableTest.error.message.includes('permission denied'))) {
          console.error('Erro de permissão nas políticas RLS');
          return {
            success: false,
            error: 'RLS_POLICY',
            message: 'Erro nas políticas RLS da tabela user_profiles. Verifique o painel do Supabase.'
          };
        }
        
        // Outro erro na consulta
        console.error('Erro ao consultar tabela:', tableTest.error);
        return {
          success: false,
          error: 'TABLE_QUERY',
          message: `Erro ao acessar tabela: ${tableTest.error.message}`
        };
      }
    } catch (err) {
      console.error('Erro ao testar tabela:', err);
      return {
        success: false,
        error: 'TABLE_TEST',
        message: `Erro ao testar tabela: ${err.message}`
      };
    }
    
    console.log('>>> Diagnóstico concluído: Conexão com Supabase OK <<<');
    return { success: true };
    
  } catch (error) {
    console.error('>>> ERRO FATAL no diagnóstico de conexão <<<', error);
    return { 
      success: false, 
      error: 'FATAL_ERROR', 
      message: `Erro fatal ao testar conexão: ${error.message}` 
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
