import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ESGData {
  environmental: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  governance: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  social: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
}

// Definir como false para usar dados do Supabase
// Mudar para true apenas se os dados do Supabase não estiverem prontos
const useMockData = false;

// Gerar dados aleatórios para modo mock ou desenvolvimento
const generateRandomValue = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
};

// Gerar dados mockados
const generateMockData = (): ESGData => {
  return {
    environmental: {
      litro_tm: {
        value1: generateRandomValue(10, 50),
        value2: generateRandomValue(10, 50)
      },
      kg_tm: {
        value1: generateRandomValue(5, 25),
        value2: generateRandomValue(5, 25)
      },
      kwh_tm: {
        value1: generateRandomValue(100, 500),
        value2: generateRandomValue(100, 500)
      },
      litro_combustivel_tm: {
        value1: generateRandomValue(20, 80),
        value2: generateRandomValue(20, 80)
      },
      residuo_tm: {
        value1: generateRandomValue(2, 15),
        value2: generateRandomValue(2, 15)
      },
    },
    governance: {
      denuncia_corrupcao: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      reclamacao_vizinho: {
        value1: generateRandomValue(0, 10),
        value2: generateRandomValue(0, 10)
      },
      incidente_cibernetico: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
    },
    social: {
      incidente: {
        value1: generateRandomValue(0, 8),
        value2: generateRandomValue(0, 8)
      },
      acidente: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      denuncia_discriminacao: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
      mulher_trabalho: {
        value1: generateRandomValue(20, 50),
        value2: generateRandomValue(20, 50)
      },
    }
  };
};

export const fetchESGData = async (
  terminal: string,
  period1: { month: string; year: string },
  period2: { month: string; year: string }
): Promise<ESGData> => {
  // Se estiver usando dados mockados, retorne dados gerados aleatoriamente após atraso simulado
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  }

  try {
    console.log(`Buscando dados ESG para terminal: ${terminal}`);
    console.log(`Período 1: ${period1.month}/${period1.year}`);
    console.log(`Período 2: ${period2.month}/${period2.year}`);
    
    // Verificar conexão com Supabase
    const { error: healthCheckError } = await supabase.from('esg_indicators').select('count');
    if (healthCheckError) {
      console.error("Erro na verificação de conexão com Supabase:", healthCheckError);
      throw new Error("Não foi possível conectar ao banco de dados");
    }
    
    // Fetch dos dados de ESG do Supabase
    const categories = ['environmental', 'social', 'governance'];
    const result: ESGData = {
      environmental: {},
      social: {},
      governance: {}
    };

    for (const category of categories) {
      // Buscar dados do primeiro período - Usando subquery para obter os mais recentes para cada indicador
      console.log(`Buscando dados de ${category} para período 1...`);
      const { data: data1, error: error1 } = await supabase
        .from('esg_indicators')
        .select('id, name, value, created_at')
        .eq('terminal', terminal)
        .eq('category', category)
        .eq('month', parseInt(period1.month))
        .eq('year', parseInt(period1.year))
        .order('created_at', { ascending: false });

      if (error1) {
        console.error(`Erro ao buscar dados de ${category} (período 1):`, error1);
      } else {
        console.log(`Dados de ${category} período 1 encontrados:`, data1?.length || 0);
      }

      // Buscar dados do segundo período - Usando subquery para obter os mais recentes para cada indicador
      console.log(`Buscando dados de ${category} para período 2...`);
      const { data: data2, error: error2 } = await supabase
        .from('esg_indicators')
        .select('id, name, value, created_at')
        .eq('terminal', terminal)
        .eq('category', category)
        .eq('month', parseInt(period2.month))
        .eq('year', parseInt(period2.year))
        .order('created_at', { ascending: false });

      if (error2) {
        console.error(`Erro ao buscar dados de ${category} (período 2):`, error2);
      } else {
        console.log(`Dados de ${category} período 2 encontrados:`, data2?.length || 0);
      }

      // Processar dados e construir o objeto de resultado
      // @ts-ignore - Adicionando dinamicamente ao objeto result
      const categoryData = result[category];

      // Processar dados do primeiro período - pegando apenas o mais recente para cada nome de indicador
      if (data1) {
        // Criar um mapa para armazenar apenas o valor mais recente de cada indicador
        const latestValues = new Map();
        
        // Iterar pelos dados ordenados por created_at descendente
        data1.forEach(item => {
          // Se ainda não temos este nome de indicador no mapa, adicione-o
          // Isso vai pegar apenas o primeiro encontrado de cada tipo, que é o mais recente
          if (!latestValues.has(item.name)) {
            latestValues.set(item.name, item.value);
          }
        });
        
        // Adicionar os valores mais recentes ao resultado
        latestValues.forEach((value, name) => {
          if (!categoryData[name]) {
            categoryData[name] = { value1: 0, value2: 0 };
          }
          categoryData[name].value1 = value;
        });
      }

      // Processar dados do segundo período - similar ao primeiro período
      if (data2) {
        const latestValues = new Map();
        
        data2.forEach(item => {
          if (!latestValues.has(item.name)) {
            latestValues.set(item.name, item.value);
          }
        });
        
        latestValues.forEach((value, name) => {
          if (!categoryData[name]) {
            categoryData[name] = { value1: 0, value2: 0 };
          }
          categoryData[name].value2 = value;
        });
      }
    }

    // Verificar se existem dados
    const isEmpty = Object.keys(result.environmental).length === 0 && 
                    Object.keys(result.social).length === 0 && 
                    Object.keys(result.governance).length === 0;
    
    if (isEmpty) {
      console.log("Nenhum dado encontrado no Supabase. Usando dados mockados como fallback.");
      toast.warning("Não foram encontrados dados para o período selecionado. Exibindo dados de exemplo.");
      return generateMockData();
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar dados ESG:", error);
    toast.error("Erro ao buscar dados. Usando dados de exemplo.");
    
    // Fallback para dados mockados em caso de falha
    console.log("Recorrendo a dados mockados devido a erro");
    return generateMockData();
  }
};

// Função para salvar dados ESG no Supabase - modificada para atualizar registros existentes
export const saveESGIndicator = async (
  indicatorData: {
    id?: string;  // ID opcional para identificar registros existentes
    name: string;
    value: number;
    category: 'environmental' | 'social' | 'governance';
    terminal: string;
    month: number;
    year: number;
  }
) => {
  try {
    if (useMockData) {
      // Simular sucesso para dados mockados
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Indicador salvo com sucesso (mock)' };
    }
    
    console.log("Salvando indicador ESG:", indicatorData);
    
    // Verificar se já existe um registro para este indicador neste mês/ano/terminal
    const { data: existingIndicators, error: queryError } = await supabase
      .from('esg_indicators')
      .select('id')
      .eq('name', indicatorData.name)
      .eq('terminal', indicatorData.terminal)
      .eq('month', indicatorData.month)
      .eq('year', indicatorData.year)
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error("Erro ao verificar indicador existente:", queryError);
      throw queryError;
    }

    let message = '';
    let error = null;

    // Se encontrou um registro existente, atualiza-o
    if (existingIndicators && existingIndicators.length > 0) {
      const existingId = existingIndicators[0].id;
      console.log(`Atualizando indicador existente com ID: ${existingId}`);
      
      const { error: updateError } = await supabase
        .from('esg_indicators')
        .update({ value: indicatorData.value })
        .eq('id', existingId);
      
      error = updateError;
      message = 'Indicador atualizado com sucesso';
    } else {
      // Caso não exista, cria um novo registro
      console.log("Criando novo registro para o indicador");
      const { error: insertError } = await supabase
        .from('esg_indicators')
        .insert([{
          name: indicatorData.name,
          value: indicatorData.value,
          category: indicatorData.category,
          terminal: indicatorData.terminal,
          month: indicatorData.month,
          year: indicatorData.year
        }]);
      
      error = insertError;
      message = 'Indicador criado com sucesso';
    }

    if (error) {
      console.error("Erro ao salvar indicador:", error);
      throw error;
    }
    
    return { success: true, message };
  } catch (error) {
    console.error('Erro ao salvar indicador ESG:', error);
    return { success: false, message: 'Erro ao salvar indicador: ' + (error as Error).message };
  }
};
