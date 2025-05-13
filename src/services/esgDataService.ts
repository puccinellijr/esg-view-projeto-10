import { supabase } from '@/lib/supabase';

interface Period {
  month: string;
  year: string;
}

interface ESGIndicator {
  id?: string; // Make id optional so we can create new indicators
  name: string;
  value: number;
  category: "environmental" | "social" | "governance";
  terminal: string;
  month: number;
  year: number;
  created_by?: string; // Optional in case legacy code doesn't provide it
}

interface ESGIndicatorResult {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
  id?: string;
}

const updateESGIndicator = async (id: string, indicatorData: Omit<ESGIndicator, 'id'>): Promise<ESGIndicatorResult> => {
  try {
    const { data, error } = await supabase
      .from('esg_indicators')
      .update(indicatorData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      id: data?.id,
      message: 'Indicador atualizado com sucesso'
    };
  } catch (error) {
    console.error('Error updating ESG indicator:', error);
    return {
      success: false,
      error,
      message: `Erro ao atualizar indicador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

const insertESGIndicator = async (indicatorData: ESGIndicator): Promise<ESGIndicatorResult> => {
  try {
    const { data, error } = await supabase
      .from('esg_indicators')
      .insert([indicatorData])
      .select('*')
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      id: data?.id,
      message: 'Indicador criado com sucesso'
    };
  } catch (error) {
    console.error('Error inserting ESG indicator:', error);
    return {
      success: false,
      error,
      message: `Erro ao criar indicador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

export const saveESGIndicator = async ({
  id,
  name,
  value,
  category,
  terminal,
  month,
  year,
  created_by
}: ESGIndicator): Promise<ESGIndicatorResult> => {
  try {
    if (id && !id.startsWith('new-')) {
      return await updateESGIndicator(id, { name, value, category, terminal, month, year, created_by });
    } else {
      return await insertESGIndicator({ name, value, category, terminal, month, year, created_by });
    }
  } catch (error) {
    console.error('Error saving ESG indicator:', error);
    return {
      success: false,
      error,
      message: `Erro ao salvar indicador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

export const fetchESGData = async (terminal: string, period1: Period, period2: Period) => {
  try {
    // Convert string values to numbers
    const month1 = parseInt(period1.month);
    const year1 = parseInt(period1.year);
    const month2 = parseInt(period2.month);
    const year2 = parseInt(period2.year);
    
    // Fetch data for period 1
    const { data: data1, error: error1 } = await supabase
      .from('esg_indicators')
      .select('*')
      .eq('terminal', terminal)
      .eq('month', month1)
      .eq('year', year1);
    
    if (error1) throw error1;
    
    // Fetch data for period 2
    const { data: data2, error: error2 } = await supabase
      .from('esg_indicators')
      .select('*')
      .eq('terminal', terminal)
      .eq('month', month2)
      .eq('year', year2);
    
    if (error2) throw error2;
    
    // If no data found for either period, return null
    if (!data1?.length || !data2?.length) {
      console.log("No data found for one or both periods");
      return null;
    }
    
    // Process and structure the data for comparison
    const result = {
      environmental: {},
      social: {},
      governance: {},
      tonnage: undefined
    };
    
    // Helper function to add indicator to result
    const addIndicator = (data, periodNum) => {
      data.forEach(item => {
        if (item.name === 'tonelada') {
          if (!result.tonnage) {
            result.tonnage = { value1: 0, value2: 0 };
          }
          result.tonnage[`value${periodNum}`] = item.value;
          return;
        }
        
        if (!result[item.category][item.name]) {
          result[item.category][item.name] = { value1: 0, value2: 0 };
        }
        
        result[item.category][item.name][`value${periodNum}`] = item.value;
      });
    };
    
    // Add data from both periods
    addIndicator(data1, 1);
    addIndicator(data2, 2);
    
    return result;
  } catch (error) {
    console.error("Error fetching ESG data:", error);
    throw error;
  }
};
