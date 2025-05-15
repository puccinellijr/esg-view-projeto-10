
import React from 'react';
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
                />
              </CardContent>
            </Card>
            
            {isLoading && (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Carregando dados...</p>
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

                {/* Split bar charts into two separate charts */}
                <div className="mt-6 sm:mt-10 p-3 sm:p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Visão Geral de Indicadores</h2>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 gap-6'}`}>
                    {/* Environmental Chart */}
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-green-700 mb-3 text-center">Dimensão Ambiental</h3>
                      <ComparisonBarChart 
                        esgData={esgData} 
                        category="environmental"
                        period1={period1}
                        period2={period2}
                      />
                    </div>
                    
                    {/* Social and Governance Chart */}
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">Dimensões Social e Governança</h3>
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
            
            {!isLoading && isDataFetched && !esgData && (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Nenhum dado encontrado para os períodos selecionados.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Comparison;
