
import { supabase } from '@/lib/supabase';
import { ESGIndicator, ESGIndicatorResult } from '@/types/esg';

/**
 * Update an existing ESG indicator
 */
export const updateESGIndicator = async (id: string, indicatorData: Omit<ESGIndicator, 'id'>): Promise<ESGIndicatorResult> => {
  try {
    // Create a data object without the created_by field for the database operation
    const { created_by, ...dataForDb } = indicatorData;
    
    const { data, error } = await supabase
      .from('esg_indicators')
      .update(dataForDb)
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

/**
 * Insert a new ESG indicator
 */
export const insertESGIndicator = async (indicatorData: ESGIndicator): Promise<ESGIndicatorResult> => {
  try {
    // Create a data object without the created_by field for the database operation
    const { created_by, ...dataForDb } = indicatorData;
    
    const { data, error } = await supabase
      .from('esg_indicators')
      .insert([dataForDb])
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

/**
 * Save an ESG indicator (create new or update existing)
 */
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
