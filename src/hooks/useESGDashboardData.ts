
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Define indicator types
export interface Indicator {
  id: string;
  name: string;
  value: string | number;
  icon?: React.ReactNode;
  category: 'environmental' | 'social' | 'governance';
}

interface UseESGDashboardDataProps {
  selectedMonth: string;
  selectedYear: string;
  selectedTerminal: string;
  refreshTrigger?: number;
}

export const useESGDashboardData = ({
  selectedMonth,
  selectedYear,
  selectedTerminal,
  refreshTrigger = 0
}: UseESGDashboardDataProps) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tonnage, setTonnage] = useState<number>(0);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);
  
  // Get month name for display
  const getMonthName = (month: string) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[parseInt(month) - 1];
  };

  // Memoize the fetchData function to avoid recreation on each render
  const fetchData = useCallback(async () => {
    // Debounce requests that happen within 300ms of each other
    const now = Date.now();
    if (now - lastFetchTimestamp < 300) {
      console.log("Skipping fetch due to debounce");
      return;
    }
    
    setLastFetchTimestamp(now);
    setIsLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("Dashboard data fetch timeout, showing N/D for all indicators");
      setIsLoading(false);
      handleFetchError();
    }, 15000); // 15 second timeout
    
    try {
      console.log(`Buscando dados para terminal: ${selectedTerminal}, mês ${selectedMonth} e ano ${selectedYear}, refresh: ${refreshTrigger}`);
      
      // Buscar indicadores do Supabase com timeout
      const fetchPromise = supabase
        .from('esg_indicators')
        .select('*')
        .eq('terminal', selectedTerminal)
        .eq('month', parseInt(selectedMonth))
        .eq('year', parseInt(selectedYear))
        .order('created_at', { ascending: false });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      // Clear timeout if we get a response
      clearTimeout(timeoutId);
      
      if (error) {
        throw error;
      }
      
      // Process data and update indicators state
      processIndicatorData(data);
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar indicadores");
      handleFetchError();
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedTerminal, refreshTrigger, lastFetchTimestamp]);
  
  // Fetch data effect
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Define expected indicators that should always be displayed
  const expectedIndicators = [
    { name: 'litro_tm', category: 'environmental' as const, iconType: 'Droplet' },
    { name: 'kg_tm', category: 'environmental' as const, iconType: 'Weight' },
    { name: 'kwh_tm', category: 'environmental' as const, iconType: 'Zap' },
    { name: 'litro_combustivel_tm', category: 'environmental' as const, iconType: 'Fuel' },
    { name: 'residuo_tm', category: 'environmental' as const, iconType: 'Percent' },
    { name: 'incidente', category: 'social' as const, iconType: 'AlertTriangle' },
    { name: 'acidente', category: 'social' as const, iconType: 'Bandage' },
    { name: 'denuncia_discriminacao', category: 'social' as const, iconType: 'Users' },
    { name: 'mulher_trabalho', category: 'social' as const, iconType: 'Handshake' },
    { name: 'denuncia_corrupcao', category: 'governance' as const, iconType: 'Gavel' },
    { name: 'reclamacao_vizinho', category: 'governance' as const, iconType: 'Bell' },
    { name: 'incidente_cibernetico', category: 'governance' as const, iconType: 'Server' },
    { name: 'tonelada', category: 'environmental' as const, iconType: 'TruckIcon' },
  ];
  
  const processIndicatorData = (data: any[] | null) => {
    // Inicializar todos os indicadores esperados como N/D
    const initializedIndicators: Indicator[] = expectedIndicators.map(indicator => ({
      id: `${indicator.name}-placeholder`,
      name: indicator.name,
      value: "N/D",
      category: indicator.category
    }));
    
    let currentTonnage = 0;
    
    if (data && data.length > 0) {
      console.log(`Encontrados ${data.length} registros brutos para ${getMonthName(selectedMonth)} de ${selectedYear}`);
      
      // Criar um mapa para armazenar apenas o valor mais recente de cada indicador
      const latestIndicators = new Map();
      
      // Iterar pelos dados ordenados por created_at descendente
      data.forEach(item => {
        // Se ainda não temos este nome de indicador no mapa, adicione-o
        if (!latestIndicators.has(item.name)) {
          // Find expected indicator to get category
          const expectedIndicator = expectedIndicators.find(ind => ind.name === item.name);
          
          // Garantir que category seja um dos valores literais permitidos
          let category: 'environmental' | 'social' | 'governance';
          
          if (item.category === 'environmental' || item.category === 'social' || item.category === 'governance') {
            category = item.category as 'environmental' | 'social' | 'governance';
          } else {
            // Caso o valor no banco não seja um dos esperados, use o do indicador esperado ou fallback para 'environmental'
            category = (expectedIndicator ? expectedIndicator.category : 'environmental');
          }
          
          // Se for tonelada, salvar o valor para cálculos posteriores
          if (item.name === 'tonelada') {
            currentTonnage = item.value;
            setTonnage(item.value);
          }
          
          latestIndicators.set(item.name, {
            id: item.id,
            name: item.name,
            value: item.value,
            category
          });
        }
      });
      
      // Combine expected indicators with real data
      const updatedIndicators = initializedIndicators.map(indicator => {
        const realIndicator = latestIndicators.get(indicator.name);
        return realIndicator || indicator;
      });
      
      setIndicators(updatedIndicators);
      console.log(`Carregados ${latestIndicators.size} indicadores mais recentes para ${getMonthName(selectedMonth)} de ${selectedYear}`);
      console.log(`Tonelada movimentada: ${currentTonnage}`);
    } else {
      // Se não houver dados, usar indicadores inicializados com N/D
      console.log("Nenhum dado encontrado, exibindo N/D para todos os indicadores");
      setIndicators(initializedIndicators);
    }
  };
  
  const handleFetchError = () => {
    // Em caso de erro, manter os indicadores com N/D
    const fallbackIndicators = expectedIndicators.map(indicator => ({
      id: `${indicator.name}-error`,
      name: indicator.name,
      value: "N/D",
      category: indicator.category
    }));
    setIndicators(fallbackIndicators);
  };
  
  // Expose a function to manually trigger a data refetch
  const refetch = () => {
    console.log("Manual refetch triggered");
    fetchData();
  };
  
  // Filter indicators by category
  const environmentalIndicators = indicators
    .filter(ind => ind.category === 'environmental' && ind.name !== 'tonelada');
  const socialIndicators = indicators.filter(ind => ind.category === 'social');
  const governanceIndicators = indicators.filter(ind => ind.category === 'governance');
  const tonnageIndicator = indicators.find(ind => ind.name === 'tonelada');
  
  return {
    indicators,
    environmentalIndicators,
    socialIndicators,
    governanceIndicators,
    tonnageIndicator,
    isLoading,
    tonnage,
    refetch
  };
};
