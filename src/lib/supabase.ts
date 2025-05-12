
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ou valores de teste
// IMPORTANTE: Estes são valores de teste - substitua pelos seus valores de produção adequados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zrlczidvxjfulcogtbxd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGN6aWR2eGpmdWxjb2d0YnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjI1NTcsImV4cCI6MjA2MjYzODU1N30.CGVcBAraQKepURsahjwPZzLXwmnZqocEfJfbgIaD2Gw';

// Verificar se as variáveis são válidas e imprimir para debug
console.log('CONFIGURAÇÕES DO SUPABASE:');
console.log('URL:', supabaseUrl);
console.log('Chave anônima válida:', supabaseAnonKey && supabaseAnonKey.length > 20);

// Criar cliente com configurações básicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Função super simplificada para testar conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    // Verificação mínima e rápida
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { 
        success: false, 
        error: 'CONNECTION_ERROR', 
        message: `Erro de conexão básica: ${error.message}`
      };
    }
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { 
      success: false, 
      error: 'FATAL_ERROR', 
      message: `Erro ao testar conexão básica: ${error.message}`
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
