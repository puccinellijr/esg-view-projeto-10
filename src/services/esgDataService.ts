
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
      // Buscar dados do primeiro período
      console.log(`Buscando dados de ${category} para período 1...`);
      const { data: data1, error: error1 } = await supabase
        .from('esg_indicators')
        .select('id, name, value')
        .eq('terminal', terminal)
        .eq('category', category)
        .eq('month', parseInt(period1.month))
        .eq('year', parseInt(period1.year));

      if (error1) {
        console.error(`Erro ao buscar dados de ${category} (período 1):`, error1);
      } else {
        console.log(`Dados de ${category} período 1 encontrados:`, data1?.length || 0);
      }

      // Buscar dados do segundo período
      console.log(`Buscando dados de ${category} para período 2...`);
      const { data: data2, error: error2 } = await supabase
        .from('esg_indicators')
        .select('id, name, value')
        .eq('terminal', terminal)
        .eq('category', category)
        .eq('month', parseInt(period2.month))
        .eq('year', parseInt(period2.year));

      if (error2) {
        console.error(`Erro ao buscar dados de ${category} (período 2):`, error2);
      } else {
        console.log(`Dados de ${category} período 2 encontrados:`, data2?.length || 0);
      }

      // Processar dados e construir o objeto de resultado
      // @ts-ignore - Adicionando dinamicamente ao objeto result
      const categoryData = result[category];

      // Processar dados do primeiro período
      if (data1) {
        data1.forEach(item => {
          if (!categoryData[item.name]) {
            categoryData[item.name] = { value1: 0, value2: 0 };
          }
          categoryData[item.name].value1 = item.value;
        });
      }

      // Processar dados do segundo período
      if (data2) {
        data2.forEach(item => {
          if (!categoryData[item.name]) {
            categoryData[item.name] = { value1: 0, value2: 0 };
          }
          categoryData[item.name].value2 = item.value;
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

// Função para salvar dados ESG no Supabase
export const saveESGIndicator = async (
  indicatorData: {
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
    
    // Verificar se o indicador já existe
    const { data: existingData, error: queryError } = await supabase
      .from('esg_indicators')
      .select('id')
      .eq('name', indicatorData.name)
      .eq('terminal', indicatorData.terminal)
      .eq('month', indicatorData.month)
      .eq('year', indicatorData.year)
      .eq('category', indicatorData.category)
      .maybeSingle();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 é "no rows found"
      console.error("Erro ao verificar existência do indicador:", queryError);
      throw queryError;
    }

    if (existingData?.id) {
      // Atualizar indicador existente
      console.log(`Atualizando indicador existente (ID: ${existingData.id})`);
      const { error: updateError } = await supabase
        .from('esg_indicators')
        .update({ value: indicatorData.value })
        .eq('id', existingData.id);

      if (updateError) {
        console.error("Erro ao atualizar indicador:", updateError);
        throw updateError;
      }
      return { success: true, message: 'Indicador atualizado com sucesso' };
    } else {
      // Criar novo indicador
      console.log("Criando novo indicador");
      const { error: insertError } = await supabase
        .from('esg_indicators')
        .insert([indicatorData]);

      if (insertError) {
        console.error("Erro ao inserir indicador:", insertError);
        throw insertError;
      }
      return { success: true, message: 'Indicador criado com sucesso' };
    }
  } catch (error) {
    console.error('Erro ao salvar indicador ESG:', error);
    return { success: false, message: 'Erro ao salvar indicador: ' + (error as Error).message };
  }
};
