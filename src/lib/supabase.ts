
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your Supabase project settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
