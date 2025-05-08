
import React from 'react';
import TerminalSelector from '../components/TerminalSelector';
import PeriodComparisonForm from '../components/PeriodComparisonForm';
import ComparisonSection from '../components/ComparisonSection';
import ExportButton from '../components/ExportButton';
import { useESGData } from '../hooks/useESGData';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">
            Terminal {terminal}
          </h1>
          <div className="mt-4 sm:mt-0">
            <ExportButton />
          </div>
        </div>
        
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
              title="Indicadores Ambientais" 
              data={esgData.environmental} 
              category="environmental" 
            />
            
            <ComparisonSection 
              title="Indicadores de Governança" 
              data={esgData.governance} 
              category="governance" 
            />
            
            <ComparisonSection 
              title="Indicadores Sociais" 
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
