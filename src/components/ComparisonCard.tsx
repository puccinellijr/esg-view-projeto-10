
import React from 'react';
import { Card } from "@/components/ui/card";
import { Info, ShieldAlert, Users } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, value1, value2, category }) => {
  // Calculate comparison icon
  const getComparisonIcon = () => {
    if (value1 > value2) {
      return <span className="text-2xl font-bold text-green-600 animate-blink">↑</span>;
    } else if (value1 < value2) {
      return <span className="text-2xl font-bold text-red-600 animate-blink">↓</span>;
    } else {
      return <span className="text-2xl font-bold text-gray-500 animate-blink">→</span>;
    }
  };
  
  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case 'environmental':
        return <Info className="h-5 w-5 text-white" />;
      case 'governance':
        return <ShieldAlert className="h-5 w-5 text-white" />;
      case 'social':
        return <Users className="h-5 w-5 text-white" />;
      default:
        return <Info className="h-5 w-5 text-white" />;
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
  
  // Calculate percentages for the pie chart
  const total = value1 + value2;
  const percent1 = total ? (value1 / total) * 100 : 0;
  const percent2 = total ? (value2 / total) * 100 : 0;
  
  return (
    <Card className="flex flex-col w-full sm:w-[calc(50%-0.5rem)] md:w-[300px] max-w-full overflow-hidden m-2">
      <div className={`flex items-center gap-2 p-3 ${getBgColor()}`}>
        {getCategoryIcon()}
        <h3 className="text-white font-bold text-sm uppercase">{title.replace("_", " ")}</h3>
      </div>
      
      <div className="p-4 flex flex-col">
        <p className="text-sm mb-1">
          <strong>Período 1:</strong> {value1.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
        </p>
        <p className="text-sm mb-1">
          <strong>Período 2:</strong> {value2.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
        </p>
        <p className="text-sm mb-3 flex items-center">
          <strong>Variação:</strong> {getComparisonIcon()}
        </p>
        
        <div className="w-full h-36 relative">
          <canvas id={`chart-${title}`} className="w-full h-full"></canvas>
        </div>
      </div>
    </Card>
  );
};

export default ComparisonCard;
