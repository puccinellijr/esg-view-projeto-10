
import React from 'react';

interface DashboardLoadingProps {
  selectedMonth: string;
  selectedYear: string;
}

const DashboardLoading: React.FC<DashboardLoadingProps> = ({ selectedMonth, selectedYear }) => {
  // Get month name for display
  const getMonthName = (month: string) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[parseInt(month) - 1];
  };

  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando indicadores de {getMonthName(selectedMonth)} {selectedYear}...</p>
      </div>
    </div>
  );
};

export default DashboardLoading;
