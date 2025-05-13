
import React, { useState } from 'react';
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
            
            <Card className="mb-4 sm:mb-6">
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
                />
                <ComparisonSection 
                  title="Dimensão Social" 
                  data={esgData.social} 
                  category="social"
                />
                <ComparisonSection 
                  title="Dimensão Governança" 
                  data={esgData.governance} 
                  category="governance"
                />

                <div className="mt-6 sm:mt-10 p-3 sm:p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Visão Geral de Indicadores</h2>
                  <ComparisonBarChart esgData={esgData} />
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
