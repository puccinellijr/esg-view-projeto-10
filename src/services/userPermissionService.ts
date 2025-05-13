
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
 * Utilizando diretamente a tabela auth.users e user_profiles
 */
export const getUsersAccessLevels = async (): Promise<{
  users?: {id: string, email: string, accessLevel: AccessLevel}[],
  error?: any
}> => {
  try {
    console.log('Iniciando busca de níveis de acesso dos usuários');
    
    // Obter todos os usuários da tabela auth.users usando o método admin
    // Como a view auth_users_view não existe, vamos usar uma abordagem diferente
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Erro ao obter lista de usuários autenticados:', authError);
      
      // Plano B: usar a tabela user_profiles para obter IDs de usuários
      console.log('Tentando obter usuários através da tabela user_profiles...');
      const { data: profileUsers, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id');
      
      if (profilesError || !profileUsers || profileUsers.length === 0) {
        console.error('Erro ao obter perfis de usuário:', profilesError);
        return { error: profilesError || new Error('Nenhum usuário encontrado') };
      }
      
      // Buscar perfil completo para cada usuário encontrado
      const usersWithProfiles = await Promise.all(
        profileUsers.map(async (profile) => {
          try {
            // Buscar dados do usuário autenticado
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
            
            if (userError || !userData) {
              console.warn(`Não foi possível obter dados de autenticação para usuário ${profile.id}`, userError);
              
              // Buscar perfil do usuário para obter o que conseguirmos
              const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', profile.id)
                .single();
              
              return {
                id: profile.id,
                email: profileData?.email || 'Email não disponível',
                accessLevel: normalizeAccessLevel(profileData?.access_level) as AccessLevel
              };
            }
            
            // Obter perfil adicional
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('access_level')
              .eq('id', profile.id)
              .single();
            
            return {
              id: profile.id,
              email: userData.user?.email || 'Email não disponível',
              accessLevel: normalizeAccessLevel(profileData?.access_level) as AccessLevel
            };
          } catch (err) {
            console.error(`Erro ao processar dados do usuário ${profile.id}:`, err);
            return {
              id: profile.id,
              email: 'Erro ao carregar email',
              accessLevel: 'viewer' as AccessLevel
            };
          }
        })
      );
      
      console.log(`Obtidos ${usersWithProfiles.length} usuários através do método alternativo`);
      return { users: usersWithProfiles };
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('Nenhum usuário autenticado encontrado');
      return { users: [] };
    }
    
    console.log(`Encontrados ${authUsers.users.length} usuários autenticados`);
    
    // Para cada usuário autenticado, buscar seu perfil e nível de acesso
    const usersWithAccessLevels = await Promise.all(
      authUsers.users.map(async (authUser) => {
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
    
    // Último recurso: tentar obter apenas dados de perfil
    try {
      console.log('Tentando abordagem alternativa para obter usuários...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, access_level');
      
      if (profilesError || !profiles || profiles.length === 0) {
        return { error: err };
      }
      
      // Para cada perfil, tente obter o email
      const basicUsers = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Tenta obter email através da API de usuários
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
            
            return {
              id: profile.id,
              email: userData?.user?.email || 'Email não disponível',
              accessLevel: normalizeAccessLevel(profile.access_level) as AccessLevel
            };
          } catch (userErr) {
            // Falha ao obter email, use um placeholder
            return {
              id: profile.id,
              email: 'Email não disponível',
              accessLevel: normalizeAccessLevel(profile.access_level) as AccessLevel
            };
          }
        })
      );
      
      console.log(`Obtidos ${basicUsers.length} usuários através do método de fallback final`);
      return { users: basicUsers };
    } catch (finalErr) {
      console.error('Todas as tentativas de obter usuários falharam:', finalErr);
      return { error: err };
    }
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

