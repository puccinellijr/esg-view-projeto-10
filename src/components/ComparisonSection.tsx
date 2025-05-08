
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
  
  // Find if "incidente" card exists in social section to align governance cards properly
  const hasIncidentCard = category === 'social' && 
    entries.some(([key]) => 
      key.toLowerCase().includes('incidente') || 
      key.toLowerCase().includes('incident')
    );
  
  // Calculate the position of the incident card in the grid
  const incidentCardPosition = () => {
    if (category === 'social') {
      const incidentIndex = entries.findIndex(([key]) => 
        key.toLowerCase().includes('incidente') || 
        key.toLowerCase().includes('incident')
      );
      
      if (incidentIndex !== -1) {
        return incidentIndex % 5; // Assuming 5 columns max (xl:grid-cols-5)
      }
    }
    return 2; // Default position (3rd column)
  };
  
  return (
    <div className={`mt-10 mb-12 py-8 px-4 rounded-lg ${getSectionBgColor()}`}>
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${getSectionTitleColor()}`}>{title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compare os valores entre os períodos selecionados
        </p>
      </div>
      <div className="flex justify-center">
        {/* For governance cards, align with the incident card position */}
        {category === 'governance' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl">
            {/* Dynamically add empty placeholder cells based on incident card position */}
            {Array.from({ length: incidentCardPosition() }).map((_, index) => (
              <div key={`placeholder-${index}`} className="w-full hidden sm:block"></div>
            ))}
            
            {/* Render the actual cards */}
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ComparisonSection;
