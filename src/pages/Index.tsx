
import React, { useEffect } from 'react';
import TerminalSelector from '../components/TerminalSelector';
import PeriodComparisonForm from '../components/PeriodComparisonForm';
import ComparisonSection from '../components/ComparisonSection';
import { useESGData } from '../hooks/useESGData';
import { Loader2 } from 'lucide-react';

// Declare Chart.js to fix TypeScript error
declare global {
  interface Window {
    Chart: any;
  }
}

const Index = () => {
  const {
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
  } = useESGData();

  // Load Chart.js script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Create charts when data is available
  useEffect(() => {
    if (esgData && typeof window !== 'undefined' && window.Chart) {
      // Create environmental charts
      Object.entries(esgData.environmental).forEach(([key, values]) => {
        createPieChart(`chart-${key}`, values.value1, values.value2);
      });
      
      // Create governance charts
      Object.entries(esgData.governance).forEach(([key, values]) => {
        createPieChart(`chart-${key}`, values.value1, values.value2);
      });
      
      // Create social charts
      Object.entries(esgData.social).forEach(([key, values]) => {
        createPieChart(`chart-${key}`, values.value1, values.value2);
      });
    }
  }, [esgData]);

  const createPieChart = (canvasId: string, value1: number, value2: number) => {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return;

    const total = value1 + value2;
    const percent1 = total ? (value1 / total) * 100 : 0;
    const percent2 = total ? (value2 / total) * 100 : 0;
    
    if (typeof window !== 'undefined' && window.Chart) {
      // @ts-ignore - Chart is loaded dynamically
      new window.Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Período 1', 'Período 2'],
          datasets: [{
            data: [percent1, percent2],
            backgroundColor: ['#3498db', '#e74c3c'],
            borderColor: ['#2980b9', '#c0392b'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return context.raw.toFixed(2) + '%';
                }
              }
            }
          },
          aspectRatio: 1,  // Maintain chart proportion
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Terminal {terminal}
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <TerminalSelector 
            selectedTerminal={terminal} 
            onTerminalChange={setTerminal} 
          />
          
          <PeriodComparisonForm
            period1={period1}
            period2={period2}
            onPeriod1Change={updatePeriod1}
            onPeriod2Change={updatePeriod2}
            onCompare={fetchData}
          />
        </div>
        
        {isLoading && (
          <div className="flex justify-center my-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        )}
        
        {!isLoading && esgData && (
          <div className="max-w-6xl mx-auto">
            <ComparisonSection 
              title="Comparação de Indicadores Ambientais" 
              data={esgData.environmental} 
              category="environmental" 
            />
            
            <ComparisonSection 
              title="Comparação de Indicadores de Governança" 
              data={esgData.governance} 
              category="governance" 
            />
            
            <ComparisonSection 
              title="Comparação de Indicadores Sociais" 
              data={esgData.social} 
              category="social" 
            />
          </div>
        )}
        
        {!isLoading && !isDataFetched && (
          <div className="text-center my-16 text-gray-500">
            <p className="text-lg">Selecione os períodos e clique em "Comparar" para visualizar os indicadores</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
