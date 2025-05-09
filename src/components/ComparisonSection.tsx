
import React from 'react';
import ComparisonCard from './ComparisonCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface ComparisonSectionProps {
  title: string;
  data: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  category: 'environmental' | 'governance' | 'social';
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ title, data, category }) => {
  const isMobile = useIsMobile();
  const entries = Object.entries(data);
  
  // Generate section background color based on category
  const getSectionBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-custom-blue/5'; // Light blue background
      case 'governance':
        return 'bg-custom-red/5'; // Light red background
      case 'social':
        return 'bg-custom-gray/5'; // Light gray background
      default:
        return 'bg-gray-50';
    }
  };

  // Generate section title color based on category
  const getSectionTitleColor = () => {
    switch (category) {
      case 'environmental':
        return 'text-custom-blue';
      case 'governance':
        return 'text-custom-red';
      case 'social':
        return 'text-custom-gray';
      default:
        return 'text-gray-800';
    }
  };
  
  return (
    <div className={`mt-6 sm:mt-10 mb-6 sm:mb-12 py-4 sm:py-8 px-2 sm:px-4 rounded-lg ${getSectionBgColor()}`}>
      <div className="text-center mb-4 sm:mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${getSectionTitleColor()}`}>{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Compare os valores entre os períodos selecionados
        </p>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {entries.map(([key, values]) => (
            <div key={key} className="w-full flex justify-center">
              <div className="w-full max-w-xs">
                <ComparisonCard
                  title={key}
                  value1={values.value1}
                  value2={values.value2}
                  category={category}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
