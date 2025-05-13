
import { supabase } from '@/lib/supabase';
import { AccessLevel, UserData } from '@/types/auth';
import { normalizeAccessLevel } from '@/context/authUtils';

/**
 * Verifica o nível de acesso de um usuário diretamente no banco de dados
 */
export const verifyUserAccessLevel = async (userId: string): Promise<{
  accessLevel?: AccessLevel,
  error?: any
}> => {
  try {
    console.log(`Verificando nível de acesso para usuário ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('access_level')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao verificar nível de acesso:', error);
      return { error };
    }
    
    if (!data || !data.access_level) {
      console.warn('Nível de acesso não encontrado para o usuário:', userId);
      return { accessLevel: 'viewer' }; // Nível padrão por segurança
    }
    
    console.log(`Nível de acesso encontrado no banco: "${data.access_level}"`);
    const normalizedLevel = normalizeAccessLevel(data.access_level);
    console.log(`Nível de acesso normalizado: "${normalizedLevel}"`);
    
    return { accessLevel: normalizedLevel };
  } catch (err) {
    console.error('Erro ao verificar permissões do usuário:', err);
    return { error: err };
  }
};

/**
 * Obtém todos os níveis de acesso dos usuários no sistema
 */
export const getUsersAccessLevels = async (): Promise<{
  users?: {id: string, email: string, accessLevel: AccessLevel}[],
  error?: any
}> => {
  try {
    // Consultar tabela de perfis de usuário juntamente com informações de autenticação
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        access_level,
        auth.users!inner(email)
      `)
      .order('access_level');
    
    if (error) {
      console.error('Erro ao obter níveis de acesso dos usuários:', error);
      return { error };
    }
    
    if (!data || data.length === 0) {
      return { users: [] };
    }
    
    // Mapear os resultados para o formato esperado
    const users = data.map(record => ({
      id: record.id,
      email: record.auth?.users?.email || 'Email não encontrado',
      accessLevel: normalizeAccessLevel(record.access_level)
    }));
    
    console.log(`Encontrados ${users.length} usuários com diferentes níveis de acesso`);
    return { users };
  } catch (err) {
    console.error('Erro ao obter níveis de acesso dos usuários:', err);
    return { error: err };
  }
};

/**
 * Atualiza o nível de acesso de um usuário
 */
export const updateUserAccessLevel = async (userId: string, accessLevel: AccessLevel): Promise<{
  success: boolean,
  error?: any
}> => {
  try {
    console.log(`Atualizando nível de acesso para usuário ${userId} para: ${accessLevel}`);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ access_level: accessLevel })
      .eq('id', userId);
    
    if (error) {
      console.error('Erro ao atualizar nível de acesso:', error);
      return { success: false, error };
    }
    
    console.log('Nível de acesso atualizado com sucesso');
    return { success: true };
  } catch (err) {
    console.error('Erro ao atualizar nível de acesso:', err);
    return { success: false, error: err };
  }
};
