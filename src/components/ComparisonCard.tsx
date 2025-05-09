
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Info, ShieldAlert, Users, PieChart, BarChartIcon } from "lucide-react";
import Chart3D from './Chart3D';
import { useIsMobile } from '@/hooks/use-mobile';

interface ComparisonCardProps {
  title: string;
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, value1, value2, category }) => {
  const isMobile = useIsMobile();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Calculate comparison icon
  const getComparisonIcon = () => {
    if (value1 > value2) {
      return <span className="text-xl sm:text-2xl font-bold text-green-600 animate-blink">↑</span>;
    } else if (value1 < value2) {
      return <span className="text-xl sm:text-2xl font-bold text-red-600 animate-blink">↓</span>;
    } else {
      return <span className="text-xl sm:text-2xl font-bold text-gray-500 animate-blink">→</span>;
    }
  };
  
  // Get category icon
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
  
  // Generate the color based on category
  const getBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-esg-environmental';
      case 'governance':
        return 'bg-esg-governance';
      case 'social':
        return 'bg-esg-social';
      default:
        return 'bg-gray-200';
    }
  };
  
  // Toggle chart type
  const toggleChartType = () => {
    setChartType(prev => prev === 'pie' ? 'bar' : 'pie');
  };
  
  return (
    <Card className="flex flex-col h-full overflow-hidden text-center">
      <div className={`flex items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2 ${getBgColor()}`}>
        {getCategoryIcon()}
        <h3 className="text-white font-bold text-xs sm:text-sm uppercase truncate">
          {title.replace("_", " ")}
        </h3>
      </div>
      
      <div className="p-2 sm:p-3 flex flex-col flex-grow items-center justify-center text-center">
        <p className="text-xs sm:text-sm mb-1 w-full text-center">
          <strong>Período 1:</strong> {value1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs sm:text-sm mb-1 w-full text-center">
          <strong>Período 2:</strong> {value2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
