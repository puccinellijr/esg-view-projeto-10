
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ou valores de teste
// IMPORTANTE: Estes são valores de teste - substitua pelos seus valores de produção adequados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zrlczidvxjfulcogtbxd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGN6aWR2eGpmdWxjb2d0YnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjI1NTcsImV4cCI6MjA2MjYzODU1N30.CGVcBAraQKepURsahjwPZzLXwmnZqocEfJfbgIaD2Gw';

// Verificar se as variáveis são válidas
if (!supabaseUrl.includes('supabase.co') || supabaseAnonKey.length < 10) {
  console.error('Configurações do Supabase inválidas ou não encontradas. Verifique suas variáveis de ambiente.', {
    url: supabaseUrl.substring(0, 10) + '...',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('Tentando conectar ao Supabase...');
    
    // Verificar se a URL está no formato correto
    if (!supabaseUrl.includes('supabase.co')) {
      console.error('URL do Supabase inválida. Deve conter "supabase.co"');
      return false;
    }
    
    // Verificar se a chave parece válida
    if (supabaseAnonKey.length < 20) {
      console.error('Chave anônima do Supabase parece inválida (muito curta)');
      return false;
    }
    
    // Primeiro, tente uma operação mais simples que não dependa de políticas complexas
    const { error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro na autenticação com Supabase:', authError);
      return false;
    }
    
    // Defina um timeout para a operação de banco de dados
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao conectar ao Supabase')), 5000);
    });
    
    // Tente acessar a tabela com timeout
    const dbPromise = supabase.from('user_profiles').select('count').limit(1);
    
    // Use Promise.race para implementar o timeout
    const { data, error } = await Promise.race([
      dbPromise,
      timeoutPromise.then(() => ({ data: null, error: new Error('Timeout ao conectar ao Supabase') }))
    ]) as any;
    
    if (error) {
      console.error('Erro na conexão com tabela Supabase:', error);
      
      // Verificar se é um erro de políticas RLS
      if (error.code === '42501' || (error.message && error.message.includes('permission denied'))) {
        console.error('Erro de permissão nas políticas RLS do Supabase. Verifique suas políticas de segurança.');
        throw new Error('Configuração incorreta nas políticas RLS da tabela user_profiles. Verifique o painel do Supabase.');
      }
      
      if (error.code === '42P01') {
        console.error('Tabela user_profiles não existe. Crie a tabela no Supabase.');
        throw new Error('Tabela user_profiles não existe. Crie a tabela no Supabase.');
      }
      
      throw error;
    }
    
    console.log('Conexão com Supabase bem-sucedida!', data);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return false;
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
