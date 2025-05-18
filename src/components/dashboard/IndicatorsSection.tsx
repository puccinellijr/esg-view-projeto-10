
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
  // Get stronger background color for each category
  const getSoftBgColor = () => {
    switch (category) {
      case 'environmental':
        return 'bg-green-200'; // Stronger green
      case 'social':
        return 'bg-red-200'; // Stronger red
      case 'governance':
        return 'bg-blue-200'; // Stronger blue
      default:
        return `bg-${bgColorClass}-200`;
    }
  };

  // Get border color for each category
  const getBorderColor = () => {
    switch (category) {
      case 'environmental':
        return 'border-green-700'; // Stronger green
      case 'social':
        return 'border-red-700'; // Stronger red
      case 'governance':
        return 'border-blue-800'; // Stronger blue
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
          className: `${iconClasses} text-white bg-gradient-to-br from-green-600 to-green-800`
        });
      case 'social':
        return React.cloneElement(iconComponent as React.ReactElement, {
          className: `${iconClasses} text-white bg-gradient-to-br from-red-700 to-red-900`
        });
      case 'governance':
        return React.cloneElement(iconComponent as React.ReactElement, {
          className: `${iconClasses} text-white bg-gradient-to-br from-blue-700 to-blue-900`
        });
      default:
        return iconComponent;
    }
  };
  
  // Get SDG icons for each category
  const getSDGIcons = () => {
    switch (category) {
      case 'environmental':
        return (
          <div className="flex items-center space-x-1">
            <img src="/lovable-uploads/daaf77d8-285e-4892-ad63-61484f3108e8.png" alt="SDG 3" className="h-8 w-auto" />
            <img src="/lovable-uploads/bce0c470-9644-4b88-b89d-6ea778402830.png" alt="SDG 13" className="h-8 w-auto" />
            <img src="/lovable-uploads/7accd2c6-e11c-4fb6-bda7-cff1b7f4279e.png" alt="SDG 7" className="h-8 w-auto" />
          </div>
        );
      case 'social':
        return (
          <div className="flex items-center space-x-1">
            <img src="/lovable-uploads/1f81be8b-af8c-4907-8a8d-11630da5dc59.png" alt="SDG 8" className="h-8 w-auto" />
            <img src="/lovable-uploads/44de5bfe-6035-4a7a-8c6c-40bba940c3aa.png" alt="SDG 12" className="h-8 w-auto" />
            <img src="/lovable-uploads/28d930c2-0955-408a-bb2d-52d31f204e3d.png" alt="SDG 9" className="h-8 w-auto" />
          </div>
        );
      case 'governance':
        return (
          <div className="flex items-center">
            <img src="/lovable-uploads/9296c21d-78f0-4f74-9479-31137ced4df5.png" alt="SDG 16" className="h-8 w-auto" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`shadow-lg border-t-4 ${getBorderColor()} min-h-[500px] flex flex-col overflow-hidden transition-transform hover:scale-[1.01]`}>
      <div className={`${getSoftBgColor()} p-4 w-full flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="transform perspective-1000 transition-transform duration-3000 hover:rotate-y-12">
            {getIconWrapper()}
          </div>
          <h2 className="text-black font-bold text-[1.05em]">
            {title}
          </h2>
        </div>
        {/* SDG Icons aligned to the right */}
        {getSDGIcons()}
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
