
import { useState, useEffect } from 'react';
import { fetchESGData } from '@/services/esgComparisonService';
import { Period, ESGComparisonData } from '@/types/esg';
import { toast } from 'sonner';
import { ensureValidSession } from '@/services/sessionRefreshService';

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
    
    try {
      // Check and refresh session if needed before making the request
      const sessionValid = await ensureValidSession();
      if (!sessionValid) {
        console.warn("Sessão inválida ou expirada");
        toast.error("Sessão expirada - faça login novamente");
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching ESG comparison data for terminal: ${terminal}, periods: ${period1.month}/${period1.year} and ${period2.month}/${period2.year}`);
      
      const data = await fetchESGData(terminal, period1, period2);
      
      setESGData(data);
      setIsDataFetched(true);
      
      if (!data) {
        toast.warning("Nenhum dado encontrado para os períodos selecionados.");
      }
    } catch (error) {
      console.error("Error fetching ESG data:", error);
      
      // Check if it's a session/auth related error
      if (error.message?.includes('JWT') || error.message?.includes('session') || 
          error.message?.includes('unauthorized') || error.message?.includes('403')) {
        toast.error("Sessão expirada - faça login novamente");
      } else {
        toast.error("Erro ao buscar dados para comparação");
      }
      setESGData(null);
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
