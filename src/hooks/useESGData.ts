
import { useState, useEffect } from 'react';
import { fetchESGData } from '@/services/esgComparisonService';
import { Period, ESGComparisonData } from '@/types/esg';
import { toast } from 'sonner';

export const useESGData = () => {
  const [terminal, setTerminal] = useState('Rio Grande');
  // FIXED: Month values should be 1-12 rather than 0-11
  const [period1, setPeriod1] = useState<Period>({ month: '1', year: '2020' });
  const [period2, setPeriod2] = useState<Period>({ month: '1', year: '2021' });
  const [esgData, setESGData] = useState<ESGComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);

  const updatePeriod1 = (field: 'month' | 'year', value: string) => {
    setPeriod1(prev => ({ ...prev, [field]: value }));
  };

  const updatePeriod2 = (field: 'month' | 'year', value: string) => {
    setPeriod2(prev => ({ ...prev, [field]: value }));
  };

  const fetchData = async () => {
    // Debounce requests that happen within 500ms of each other
    const now = Date.now();
    if (now - lastFetchTimestamp < 500) {
      console.log("Skipping fetch request due to debounce");
      return;
    }
    
    setLastFetchTimestamp(now);
    setIsLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("ESG comparison data fetch timeout");
      setIsLoading(false);
      toast.error("Timeout ao buscar dados - tente novamente");
    }, 15000); // 15 second timeout
    
    console.log(`Fetching ESG comparison data for terminal: ${terminal}, periods: ${period1.month}/${period1.year} and ${period2.month}/${period2.year}`);
    
    try {
      // Create a timeout promise
      const fetchPromise = fetchESGData(terminal, period1, period2);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fetch timeout')), 12000)
      );
      
      const data = await Promise.race([fetchPromise, timeoutPromise]) as ESGComparisonData;
      
      clearTimeout(timeoutId);
      setESGData(data);
      setIsDataFetched(true);
      
      if (!data) {
        toast.warning("Nenhum dado encontrado para os períodos selecionados.");
      }
    } catch (error) {
      console.error("Error fetching ESG data:", error);
      if (error.message === 'Fetch timeout') {
        toast.error("Timeout ao buscar dados - tente novamente");
      } else {
        toast.error("Erro ao buscar dados para comparação");
      }
      setESGData(null);
    } finally {
      clearTimeout(timeoutId);
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
