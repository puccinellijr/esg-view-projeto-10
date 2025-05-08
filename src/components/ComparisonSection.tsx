
import React from 'react';
import ComparisonCard from './ComparisonCard';

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
  const entries = Object.entries(data);
  
  return (
    <div className="mt-10 mb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compare os valores entre os períodos selecionados
        </p>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl">
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
