
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
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Object.entries(data).map(([key, values]) => (
          <ComparisonCard
            key={key}
            title={key}
            value1={values.value1}
            value2={values.value2}
            category={category}
          />
        ))}
      </div>
    </div>
  );
};

export default ComparisonSection;
