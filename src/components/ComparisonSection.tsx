
import React from 'react';
import ComparisonCard from './ComparisonCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { getMonthName } from '@/utils/dashboardUtils';

interface ComparisonSectionProps {
  title: string;
  data: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  category: 'environmental' | 'governance' | 'social';
  tonnage?: {
    value1: number;
    value2: number;
  };
  period1?: { month: string; year: string };
  period2?: { month: string; year: string };
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ 
  title, 
  data, 
  category,
  tonnage,
  period1,
  period2
}) => {
  const isMobile = useIsMobile();
  const entries = Object.entries(data);
  
  // Generate vibrant section background color based on category
  const getSectionBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-green-50'; // Light green background
      case 'governance':
        return 'bg-blue-50'; // Light blue background (matching header)
      case 'social':
        return 'bg-red-50'; // Light red background
      default:
        return 'bg-gray-50';
    }
  };

  // Generate vibrant section title color based on category
  const getSectionTitleColor = () => {
    switch (category) {
      case 'environmental':
        return 'text-green-700';
      case 'governance':
        return 'text-blue-700'; // Matching header blue
      case 'social':
        return 'text-red-700'; // Strong red color
      default:
        return 'text-gray-800';
    }
  };
  
  // Format the period display (month/year)
  const formatPeriod = (period?: { month: string; year: string }) => {
    if (!period) return "";
    const monthName = getMonthName(period.month);
    return `${monthName}/${period.year}`;
  };
  
  // Get SDG icons for each category
  const getCategorySDGIcons = () => {
    switch (category) {
      case 'environmental':
        return (
          <div className="flex items-center justify-center space-x-1 mt-2">
            <img src="/lovable-uploads/daaf77d8-285e-4892-ad63-61484f3108e8.png" alt="SDG 3" className="h-6 w-auto" />
            <img src="/lovable-uploads/bce0c470-9644-4b88-b89d-6ea778402830.png" alt="SDG 13" className="h-6 w-auto" />
            <img src="/lovable-uploads/7accd2c6-e11c-4fb6-bda7-cff1b7f4279e.png" alt="SDG 7" className="h-6 w-auto" />
          </div>
        );
      case 'social':
        return (
          <div className="flex items-center justify-center space-x-1 mt-2">
            <img src="/lovable-uploads/1f81be8b-af8c-4907-8a8d-11630da5dc59.png" alt="SDG 8" className="h-6 w-auto" />
            <img src="/lovable-uploads/44de5bfe-6035-4a7a-8c6c-40bba940c3aa.png" alt="SDG 12" className="h-6 w-auto" />
            <img src="/lovable-uploads/28d930c2-0955-408a-bb2d-52d31f204e3d.png" alt="SDG 9" className="h-6 w-auto" />
          </div>
        );
      case 'governance':
        return (
          <div className="flex items-center justify-center mt-2">
            <img src="/lovable-uploads/9296c21d-78f0-4f74-9479-31137ced4df5.png" alt="SDG 16" className="h-6 w-auto" />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`mt-6 sm:mt-10 mb-6 sm:mb-12 py-4 sm:py-8 px-2 sm:px-4 rounded-lg ${getSectionBgColor()} shadow-md`}>
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center">
          <h2 className={`text-xl sm:text-2xl font-bold ${getSectionTitleColor()}`}>{title}</h2>
        </div>
        {getCategorySDGIcons()}
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Compare os valores entre os períodos selecionados
          {category === 'environmental' && tonnage && (
            <> - Indicadores por tonelada movimentada</>
          )}
        </p>
      </div>
      
      {/* Mostrar tonelada primeiro se categoria for environmental */}
      {category === 'environmental' && tonnage && (
        <div className="text-center mb-4 p-3 bg-white rounded-lg shadow-sm max-w-xs mx-auto">
          <h3 className="font-semibold mb-1">Tonelada movimentada:</h3>
          <div className="flex justify-between items-center text-sm">
            <span>{formatPeriod(period1)}: {tonnage.value1.toLocaleString('pt-BR')}</span>
            <span>{formatPeriod(period2)}: {tonnage.value2.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {entries
            .filter(([key]) => key !== 'tonelada') // Não exibir tonelada nos cards normais
            .map(([key, values]) => (
              <div key={key} className="w-full flex justify-center">
                <div className="w-full max-w-xs">
                  <ComparisonCard
                    title={key}
                    value1={values.value1}
                    value2={values.value2}
                    category={category}
                    tonnage1={category === 'environmental' && tonnage ? tonnage.value1 : undefined}
                    tonnage2={category === 'environmental' && tonnage ? tonnage.value2 : undefined}
                    period1={period1}
                    period2={period2}
                  />
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
