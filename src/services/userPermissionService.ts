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
    // Primeiro, vamos buscar os perfis de usuário
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, access_level')
      .order('access_level');
    
    if (profilesError) {
      console.error('Erro ao obter perfis de usuário:', profilesError);
      return { error: profilesError };
    }
    
    if (!profiles || profiles.length === 0) {
      return { users: [] };
    }
    
    // Agora, para cada perfil, vamos buscar as informações do usuário na tabela auth.users
    // usando o id como referência
    const usersData = [];
    
    for (const profile of profiles) {
      // Buscar o usuário correspondente através do id
      const { data: userData, error: userError } = await supabase
        .from('auth_users_view') // Usando uma view que deve existir ou substituir por uma consulta adequada
        .select('email')
        .eq('id', profile.id)
        .single();
      
      if (userError) {
        console.warn(`Não foi possível obter informações para o usuário ID ${profile.id}:`, userError);
        // Continue com o próximo usuário em vez de falhar completamente
        usersData.push({
          id: profile.id,
          email: 'Email não disponível',
          accessLevel: normalizeAccessLevel(profile.access_level)
        });
      } else {
        usersData.push({
          id: profile.id,
          email: userData?.email || 'Email não encontrado',
          accessLevel: normalizeAccessLevel(profile.access_level)
        });
      }
    }
    
    console.log(`Encontrados ${usersData.length} usuários com diferentes níveis de acesso`);
    return { users: usersData };
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
