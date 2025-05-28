
import React, { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import PeriodComparisonForm from '@/components/PeriodComparisonForm';
import ComparisonSection from '@/components/ComparisonSection';
import { useESGData } from '@/hooks/useESGData';
import { Card, CardContent } from '@/components/ui/card';
import TerminalSelector from '@/components/TerminalSelector';
import ExportButton from '@/components/ExportButton';
import KPISummarySection from '@/components/KPISummarySection';
import ComparisonBarChart from '@/components/ComparisonBarChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

const Comparison = () => {
  const isMobile = useIsMobile();
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

  // Initial data load when component mounts
  useEffect(() => {
    console.log('Comparison page mounted, will fetch data');
    fetchData();
    // We only want to run this once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-black">Comparação de Períodos</h1>
              {isDataFetched && esgData && (
                <div className="w-full sm:w-auto">
                  <ExportButton 
                    esgData={esgData} 
                    period1={period1} 
                    period2={period2}
                    terminal={terminal}
                  />
                </div>
              )}
            </div>
            
            <Card className="mb-4 sm:mb-6 bg-white shadow-md border-blue-100">
              <CardContent className={`pt-4 sm:pt-6 ${isMobile ? 'px-3' : 'px-6'}`}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <TerminalSelector
                    selectedTerminal={terminal}
                    onTerminalChange={setTerminal}
                  />
                </div>
                <PeriodComparisonForm
                  period1={period1}
                  period2={period2}
                  onPeriod1Change={updatePeriod1}
                  onPeriod2Change={updatePeriod2}
                  onCompare={fetchData}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
            
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium text-lg">Carregando dados...</p>
              </div>
            )}
            
            {!isLoading && isDataFetched && esgData && (
              <div>
                <KPISummarySection 
                  esgData={esgData}
                  period1={period1}
                  period2={period2}
                />
                
                <ComparisonSection 
                  title="Dimensão Ambiental" 
                  data={esgData.environmental} 
                  category="environmental"
                  tonnage={esgData.tonnage}
                  period1={period1}
                  period2={period2}
                />
                <ComparisonSection 
                  title="Dimensão Social" 
                  data={esgData.social} 
                  category="social"
                  period1={period1}
                  period2={period2}
                />
                <ComparisonSection 
                  title="Dimensão Governança" 
                  data={esgData.governance} 
                  category="governance"
                  period1={period1}
                  period2={period2}
                />

                {/* Charts section with desktop enlargement */}
                <div className="mt-6 sm:mt-8">
                  <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">Visão Geral de Indicadores</h2>
                  
                  {/* Desktop layout: 30% larger containers */}
                  {!isMobile && (
                    <div className="flex justify-center">
                      <div className="w-full max-w-6xl scale-130 origin-center">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Environmental Chart */}
                          <div className="bg-green-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <ComparisonBarChart 
                              esgData={esgData} 
                              category="environmental"
                              period1={period1}
                              period2={period2}
                            />
                          </div>
                          
                          {/* Social and Governance Chart */}
                          <div className="bg-blue-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <ComparisonBarChart 
                              esgData={esgData} 
                              category="social_governance"
                              period1={period1}
                              period2={period2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile layout: compact stacked vertically */}
                  {isMobile && (
                    <div className="flex flex-col gap-3">
                      {/* Environmental Chart */}
                      <div className="bg-green-50 rounded-lg p-2 shadow-md">
                        <ComparisonBarChart 
                          esgData={esgData} 
                          category="environmental"
                          period1={period1}
                          period2={period2}
                        />
                      </div>
                      
                      {/* Social and Governance Chart */}
                      <div className="bg-blue-50 rounded-lg p-2 shadow-md">
                        <ComparisonBarChart 
                          esgData={esgData} 
                          category="social_governance"
                          period1={period1}
                          period2={period2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!isLoading && isDataFetched && !esgData && (
              <div className="flex flex-col justify-center items-center h-64 gap-2">
                <p className="text-gray-500 text-lg">Nenhum dado encontrado para os períodos selecionados.</p>
                <p className="text-gray-400 text-sm">Selecione diferentes períodos e tente novamente.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Comparison;
