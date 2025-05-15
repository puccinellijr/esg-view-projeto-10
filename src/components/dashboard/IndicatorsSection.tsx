
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
        return 'bg-blue-100'; // Vibrant blue
      case 'governance':
        return 'bg-purple-100'; // Vibrant purple
      default:
        return `bg-${bgColorClass}`;
    }
  };

  // Get border color for each category
  const getBorderColor = () => {
    switch (category) {
      case 'environmental':
        return 'border-green-600'; // Vibrant green
      case 'social':
        return 'border-blue-600'; // Vibrant blue
      case 'governance':
        return 'border-purple-600'; // Vibrant purple
      default:
        return `border-${bgColorClass}`;
    }
  };

  return (
    <Card className={`shadow-lg border-t-4 ${getBorderColor()} min-h-[500px] flex flex-col overflow-hidden`}>
      <div className={`${getSoftBgColor()} p-4 w-full flex items-center gap-2`}>
        {iconComponent}
        <h2 className="text-black font-bold">{title}</h2>
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-black">Indicadores {title.split(" ")[1]}</CardTitle>
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
