
import { supabase } from '@/lib/supabase';
import { Indicator } from '@/hooks/useESGDashboardData';

export const fetchDashboardIndicators = async (
  terminal: string,
  month: number,
  year: number
) => {
  try {
    const { data, error } = await supabase
      .from('esg_indicators')
      .select('*')
      .eq('terminal', terminal)
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching dashboard indicators:", error);
    return { data: null, error };
  }
};

export const updateDashboardIndicators = (
  indicators: Indicator[],
  updatedIndicator: Indicator
) => {
  return indicators.map(ind => 
    ind.name === updatedIndicator.name ? { ...ind, value: updatedIndicator.value, id: updatedIndicator.id } : ind
  );
};
