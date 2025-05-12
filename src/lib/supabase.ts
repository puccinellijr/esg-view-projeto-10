
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente ou valores de teste
// IMPORTANTE: Estes são valores de teste - substitua pelos seus valores de produção adequados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://djpkwwpjinznnzxkbbsf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcGt3d3BqaW56bm56eGtiYnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTQ1OTAsImV4cCI6MjA2MjYzMDU5MH0.OJJwunPn_vyKdmlnxZwVtW1ITOLniXXF7KnBcMJ0F1k';

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
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro na conexão com Supabase:', error);
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
