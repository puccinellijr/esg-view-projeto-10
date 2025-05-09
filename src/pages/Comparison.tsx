
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

const Comparison = () => {
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
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-black">Comparação de Períodos</h1>
              {isDataFetched && (
                <ExportButton />
              )}
            </div>
            
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <ComparisonSection 
                  title="Dimensão Ambiental" 
                  data={esgData.environmental} 
                  category="environmental"
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
