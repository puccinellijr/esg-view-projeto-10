
import { supabase } from '@/lib/supabase';
import { Period, ESGComparisonData } from '@/types/esg';

/**
 * Fetch ESG data for comparison between two periods
 */
export const fetchESGData = async (terminal: string, period1: Period, period2: Period): Promise<ESGComparisonData | null> => {
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
    const result: ESGComparisonData = {
      environmental: {},
      social: {},
      governance: {},
      tonnage: undefined
    };
    
    // Helper function to add indicator to result
    const addIndicator = (data: any[], periodNum: 1 | 2) => {
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
