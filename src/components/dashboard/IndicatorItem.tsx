
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Indicator } from '@/hooks/useESGDashboardData';
import { formatIndicatorName } from '@/utils/dashboardUtils';

interface IndicatorItemProps {
  indicator: Indicator;
  isEditable: boolean;
  tonnage?: number;
  onEdit: (indicator: Indicator) => void;
}

const IndicatorItem: React.FC<IndicatorItemProps> = ({ 
  indicator, 
  isEditable, 
  tonnage, 
  onEdit 
}) => {
  // Para indicadores ambientais, dividir pelo valor da tonelada se disponível
  let displayValue = indicator.value;
  
  // Verificar se é um indicador ambiental e se a tonelada é válida para divisão
  if (
    indicator.category === 'environmental' && 
    indicator.name !== 'tonelada' && 
    tonnage && 
    typeof indicator.value === 'number' && 
    tonnage > 0
  ) {
    // Calcular valor por tonelada
    const calculatedValue = indicator.value / tonnage;
    // Formatar com 4 casas decimais
    displayValue = calculatedValue.toFixed(4);
  }
  
  return (
    <div className="flex items-center gap-2">
      {indicator.icon}
      <span className="text-sm text-black font-medium text-[1.05em]">{formatIndicatorName(indicator.name)}</span>
      <span className="ml-auto text-sm font-medium text-black">
        {displayValue}
        {indicator.category === 'environmental' && indicator.name !== 'tonelada' ? 
          <span className="text-xs text-gray-500 ml-1">/ton</span> : 
          null
        }
      </span>
      {isEditable && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-auto" 
          onClick={() => onEdit(indicator)}
        >
          <Edit size={16} className="text-custom-blue" />
        </Button>
      )}
    </div>
  );
};

export default IndicatorItem;
