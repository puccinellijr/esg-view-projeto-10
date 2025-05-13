
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
    
    // Buscar todos os perfis de usuário diretamente
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, access_level, name, photo_url, terminal');
    
    if (profileError) {
      console.error('Erro ao obter perfis de usuário:', profileError);
      return { error: profileError };
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('Nenhum perfil de usuário encontrado');
      return { users: [] };
    }
    
    console.log(`Obtidos ${profiles.length} perfis de usuário`);
    
    const users = profiles.map(profile => {
      const accessLevel = normalizeAccessLevel(profile.access_level);
      console.log(`Usuário ${profile.email}: nível ${profile.access_level} -> ${accessLevel}`);
      
      return {
        id: profile.id,
        email: profile.email || 'Email não disponível',
        accessLevel: accessLevel,
        name: profile.name,
        photoUrl: profile.photo_url,
        terminal: profile.terminal
      };
    });
    
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
