
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Info, ShieldAlert, Users, PieChart, BarChartIcon } from "lucide-react";
import Chart3D from './Chart3D';
import { useIsMobile } from '@/hooks/use-mobile';
import { getMonthName } from '@/utils/dashboardUtils';

interface ComparisonCardProps {
  title: string;
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
  tonnage1?: number;
  tonnage2?: number;
  period1?: { month: string; year: string };
  period2?: { month: string; year: string };
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ 
  title, 
  value1, 
  value2, 
  category,
  tonnage1,
  tonnage2,
  period1,
  period2
}) => {
  const isMobile = useIsMobile();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('bar'); // Default to bar chart
  
  // Calcular valores para exibição, considerando divisão por tonelada para indicadores ambientais
  const getDisplayValues = () => {
    // Se for um indicador ambiental e tiver tonelagem disponível
    if (
      category === 'environmental' && 
      title !== 'tonelada' && 
      tonnage1 && 
      tonnage2 && 
      tonnage1 > 0 && 
      tonnage2 > 0
    ) {
      return {
        display1: (value1 / tonnage1).toFixed(4),
        display2: (value2 / tonnage2).toFixed(4),
        perTon: true
      };
    }
    
    // Para outros indicadores ou sem tonelagem válida
    return {
      display1: value1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      display2: value2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      perTon: false
    };
  };
  
  const { display1, display2, perTon } = getDisplayValues();
  
  // Calculate comparison icon with vibrant colors
  const getComparisonIcon = () => {
    // Para indicadores ambientais, comparar os valores divididos por tonelada
    const compareValue1 = category === 'environmental' && title !== 'tonelada' && tonnage1 && tonnage1 > 0 ? value1 / tonnage1 : value1;
    const compareValue2 = category === 'environmental' && title !== 'tonelada' && tonnage2 && tonnage2 > 0 ? value2 / tonnage2 : value2;
    
    if (compareValue1 > compareValue2) {
      return <span className="text-xl sm:text-2xl font-bold text-red-600 animate-pulse">↓</span>;
    } else if (compareValue1 < compareValue2) {
      return <span className="text-xl sm:text-2xl font-bold text-green-600 animate-pulse">↑</span>;
    } else {
      return <span className="text-xl sm:text-2xl font-bold text-gray-600 animate-pulse">→</span>;
    }
  };
  
  // Get category icon with vibrant colors
  const getCategoryIcon = () => {
    const iconSize = isMobile ? "h-4 w-4" : "h-5 w-5";
    switch (category) {
      case 'environmental':
        return <Info className={`${iconSize} text-white`} />;
      case 'governance':
        return <ShieldAlert className={`${iconSize} text-white`} />;
      case 'social':
        return <Users className={`${iconSize} text-white`} />;
      default:
        return <Info className={`${iconSize} text-white`} />;
    }
  };
  
  // Generate vibrant background colors based on category
  const getBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-green-600';
      case 'governance':
        return 'bg-blue-700'; // Matching header blue
      case 'social':
        return 'bg-red-600'; // Strong red
      default:
        return 'bg-gray-600';
    }
  };
  
  // Toggle chart type
  const toggleChartType = () => {
    setChartType(prev => prev === 'pie' ? 'bar' : 'pie');
  };
  
  // Format period labels using month names if available
  const getPeriodLabel = (periodObj?: { month: string, year: string }) => {
    if (!periodObj) return "Período";
    return `${getMonthName(periodObj.month)}/${periodObj.year}`;
  };
  
  return (
    <Card className="flex flex-col h-full overflow-hidden text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`flex items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2 ${getBgColor()}`}>
        {getCategoryIcon()}
        <h3 className="text-white font-bold text-xs sm:text-sm uppercase truncate">
          {title.replace("_", " ")}
        </h3>
      </div>
      
      <div className="p-2 sm:p-3 flex flex-col flex-grow items-center justify-center text-center">
        <p className="text-xs sm:text-sm mb-1 w-full text-center">
          <strong>{period1 ? getPeriodLabel(period1) : "Período 1"}:</strong> {display1}
          {perTon && <span className="text-xs text-gray-500">/ton</span>}
        </p>
        <p className="text-xs sm:text-sm mb-1 w-full text-center">
          <strong>{period2 ? getPeriodLabel(period2) : "Período 2"}:</strong> {display2}
          {perTon && <span className="text-xs text-gray-500">/ton</span>}
        </p>
        <p className="text-xs sm:text-sm mb-2 flex items-center justify-center w-full">
          <strong>Variação:</strong> {getComparisonIcon()}
        </p>
        
        <div className="w-full h-24 sm:h-32 relative mt-auto">
          <div className="absolute inset-0">
            <Chart3D type={chartType} value1={value1} value2={value2} category={category} />
          </div>
        </div>
        
        <div className="mt-1 sm:mt-2 flex justify-center space-x-2">
          <button 
            onClick={toggleChartType}
            className="text-xxs sm:text-xs p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
          >
            {chartType === 'pie' ? (
              <>
                <BarChartIcon size={isMobile ? 10 : 12} className="mr-1" /> Barras
              </>
            ) : (
              <>
                <PieChart size={isMobile ? 10 : 12} className="mr-1" /> Pizza
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ComparisonCard;
