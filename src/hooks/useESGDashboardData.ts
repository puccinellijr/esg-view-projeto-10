import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ensureValidSession } from '@/services/sessionRefreshService';
import { usePageVisibility } from './usePageVisibility';

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
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
  const { isVisible, lastVisibilityChange } = usePageVisibility();
  
  // Get month name for display
  const getMonthName = (month: string) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[parseInt(month) - 1];
  };

  // Memoize the fetchData function to avoid recreation on each render
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Debounce requests that happen within 500ms of each other, unless forced
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestamp < 500) {
      console.log("Skipping fetch due to debounce");
      return;
    }
    
    setLastFetchTimestamp(now);
    setIsLoading(true);
    
    try {
      // Always check session before making requests
      const sessionValid = await ensureValidSession();
      if (!sessionValid) {
        console.warn("Sessão inválida - tentando continuar com dados em cache");
        // Don't show error immediately, try to work with cached data
        setIsLoading(false);
        return;
      }
      
      console.log(`Buscando dados para terminal: ${selectedTerminal}, mês ${selectedMonth} e ano ${selectedYear}`);
      
      const { data, error } = await supabase
        .from('esg_indicators')
        .select('*')
        .eq('terminal', selectedTerminal)
        .eq('month', parseInt(selectedMonth))
        .eq('year', parseInt(selectedYear))
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process data and update indicators state
      processIndicatorData(data);
      setHasInitialLoad(true);
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      
      // More specific error handling
      if (error.message?.includes('JWT') || error.message?.includes('session') || 
          error.message?.includes('unauthorized') || error.message?.includes('403')) {
        console.warn("Erro de autenticação detectado");
        // Only show toast error if we don't have any data cached
        if (!hasInitialLoad) {
          toast.error("Sessão expirada - faça login novamente");
        }
      } else {
        // Only show error if it's not a network/temporary issue and we don't have data
        if (!hasInitialLoad) {
          toast.error("Erro ao carregar indicadores");
        } else {
          console.warn("Erro temporário ao atualizar dados, mantendo dados em cache");
        }
      }
      handleFetchError();
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedTerminal, refreshTrigger, lastFetchTimestamp, hasInitialLoad]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle page visibility changes with improved logic
  useEffect(() => {
    if (isVisible && hasInitialLoad) {
      const timeSinceVisibilityChange = Date.now() - lastVisibilityChange;
      const timeSinceLastFetch = Date.now() - lastFetchTimestamp;
      
      // More aggressive refresh when page becomes visible after being hidden
      if (timeSinceVisibilityChange < 2000 && timeSinceLastFetch > 15000) {
        console.log('Página Dashboard ficou visível novamente, atualizando dados...');
        // Delay to ensure session refresh completes first
        setTimeout(() => {
          fetchData(true);
        }, 1000);
      }
    }
  }, [isVisible, lastVisibilityChange, hasInitialLoad, lastFetchTimestamp, fetchData]);
  
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
    fetchData(true);
  };
  
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
