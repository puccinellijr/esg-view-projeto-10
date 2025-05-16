
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Indicator } from '@/hooks/useESGDashboardData';
import IndicatorItem from './IndicatorItem';

interface IndicatorsSectionProps {
  title: string;
  indicators: Indicator[];
  category: 'environmental' | 'social' | 'governance';
  iconComponent: React.ReactNode;
  bgColorClass: string;
  isEditable: boolean;
  tonnage?: number;
  onEdit: (indicator: Indicator) => void;
}

const IndicatorsSection: React.FC<IndicatorsSectionProps> = ({
  title,
  indicators,
  category,
  iconComponent,
  bgColorClass,
  isEditable,
  tonnage,
  onEdit
}) => {
  // Get vibrant background color for each category
  const getSoftBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-green-100'; // Vibrant green
      case 'social':
        return 'bg-red-100'; // Vibrant red
      case 'governance':
        return 'bg-blue-100'; // Vibrant blue
      default:
        return `bg-${bgColorClass}-100`;
    }
  };

  // Get border color for each category
  const getBorderColor = () => {
    switch (category) {
      case 'environmental':
        return 'border-green-600'; // Vibrant green
      case 'social':
        return 'border-red-600'; // Strong red - now uses a stronger red
      case 'governance':
        return 'border-sidebar'; // Header blue - uses the same blue as the header
      default:
        return `border-${bgColorClass}`;
    }
  };

  // Add an animated icon wrapper with much slower animation
  const getIconWrapper = () => {
    // Added 'duration-5000' for much slower animation (even slower than before)
    const iconClasses = "scale-125 transition-all duration-5000 animate-pulse shadow-xl rounded-full p-2 transform rotate-3d";
    
    switch (category) {
      case 'environmental':
        return React.cloneElement(iconComponent as React.ReactElement, {
          className: `${iconClasses} text-white bg-gradient-to-br from-green-500 to-green-700`
        });
      case 'social':
        return React.cloneElement(iconComponent as React.ReactElement, {
          className: `${iconClasses} text-white bg-gradient-to-br from-red-600 to-red-800`
        });
      case 'governance':
        return React.cloneElement(iconComponent as React.ReactElement, {
          className: `${iconClasses} text-white bg-gradient-to-br from-sidebar to-blue-700`
        });
      default:
        return iconComponent;
    }
  };

  return (
    <Card className={`shadow-lg border-t-4 ${getBorderColor()} min-h-[500px] flex flex-col overflow-hidden transition-transform hover:scale-[1.01]`}>
      <div className={`${getSoftBgColor()} p-4 w-full flex items-center gap-2`}>
        <div className="transform perspective-1000 transition-transform duration-3000 hover:rotate-y-12">
          {getIconWrapper()}
        </div>
        <h2 className="text-black font-bold text-[1.05em]">
          {title}
        </h2>
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[1.05em] font-medium text-black">
          Indicadores {title.split(" ")[1]}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col">
        <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
          {indicators.map((indicator, index) => (
            <React.Fragment key={indicator.id}>
              <IndicatorItem 
                indicator={indicator} 
                isEditable={isEditable} 
                tonnage={tonnage}
                onEdit={onEdit} 
              />
              {index < indicators.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicatorsSection;
