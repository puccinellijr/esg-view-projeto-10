import { useState } from 'react';
import { fetchESGData } from '@/services/esgComparisonService';
import { Period, ESGComparisonData } from '@/types/esg';

export const useESGData = () => {
  const [terminal, setTerminal] = useState('Rio Grande');
  // FIXED: Month values should be 1-12 rather than 0-11
  const [period1, setPeriod1] = useState<Period>({ month: '1', year: '2020' });
  const [period2, setPeriod2] = useState<Period>({ month: '1', year: '2021' });
  const [esgData, setESGData] = useState<ESGComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const updatePeriod1 = (field: 'month' | 'year', value: string) => {
    setPeriod1(prev => ({ ...prev, [field]: value }));
  };

  const updatePeriod2 = (field: 'month' | 'year', value: string) => {
    setPeriod2(prev => ({ ...prev, [field]: value }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchESGData(terminal, period1, period2);
      setESGData(data);
      setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching ESG data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    terminal,
    setTerminal,
    period1,
    period2,
    updatePeriod1,
    updatePeriod2,
    esgData,
    isLoading,
    isDataFetched,
    fetchData
  };
};
