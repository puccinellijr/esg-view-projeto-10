
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
    console.log('Iniciando busca de níveis de acesso dos usuários');
    
    // Primeiro, obter todos os usuários autenticados da view
    const { data: authUsers, error: authError } = await supabase
      .from('auth_users_view') // Usando uma view que deve existir
      .select('id, email');
    
    if (authError) {
      console.error('Erro ao obter usuários autenticados:', authError);
      return { error: authError };
    }
    
    if (!authUsers || authUsers.length === 0) {
      console.log('Nenhum usuário autenticado encontrado');
      return { users: [] };
    }
    
    console.log(`Encontrados ${authUsers.length} usuários autenticados`);
    
    // Para cada usuário autenticado, buscar seu perfil e nível de acesso
    const usersWithAccessLevels = await Promise.all(
      authUsers.map(async (authUser) => {
        try {
          // Buscar perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('access_level')
            .eq('id', authUser.id)
            .single();
          
          if (profileError || !profileData) {
            console.warn(`Perfil não encontrado para usuário ${authUser.id}. Usando nível padrão 'viewer'`);
            return {
              id: authUser.id,
              email: authUser.email || 'Email não disponível',
              accessLevel: 'viewer' as AccessLevel
            };
          }
          
          const accessLevel = normalizeAccessLevel(profileData.access_level);
          
          return {
            id: authUser.id,
            email: authUser.email || 'Email não disponível',
            accessLevel
          };
        } catch (err) {
          console.error(`Erro ao processar usuário ${authUser.id}:`, err);
          return {
            id: authUser.id,
            email: authUser.email || 'Email não disponível',
            accessLevel: 'viewer' as AccessLevel
          };
        }
      })
    );
    
    console.log(`Processados ${usersWithAccessLevels.length} usuários com níveis de acesso`);
    return { users: usersWithAccessLevels };
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
