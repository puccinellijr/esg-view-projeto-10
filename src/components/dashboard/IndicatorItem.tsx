
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Indicator } from '@/hooks/useESGDashboardData';

interface IndicatorItemProps {
  indicator: Indicator;
  isEditable: boolean;
  tonnage?: number;
  onEdit: (indicator: Indicator) => void;
}

// Função para formatar o nome do indicador
const formatIndicatorName = (name: string): string => {
  // Substituir underscores por espaços
  const nameWithSpaces = name.replace(/_/g, ' ');
  
  // Capitalizar primeira letra de cada palavra
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Casos especiais para nomes complexos
const getSpecialFormattedName = (name: string): string => {
  const specialNames: Record<string, string> = {
    'litro_tm': 'Litro / TM',
    'kg_tm': 'Kg / TM',
    'kwh_tm': 'kWh / TM',
    'litro_combustivel_tm': 'Litro Combustível / TM',
    'residuo_tm': 'Resíduo / TM',
    'incidente': 'Incidente',
    'acidente': 'Acidente',
    'denuncia_discriminacao': 'Denúncia Discriminação',
    'mulher_trabalho': 'Mulheres no Trabalho',
    'denuncia_corrupcao': 'Denúncia Corrupção',
    'reclamacao_vizinho': 'Reclamação Vizinho',
    'incidente_cibernetico': 'Incidente Cibernético',
    'tonelada': 'Tonelada'
  };

  return specialNames[name] || formatIndicatorName(name);
};

// Get color based on indicator category
const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'environmental':
      return 'bg-green-600 text-white';
    case 'social':
      return 'bg-red-600 text-white';
    case 'governance':
      return 'bg-blue-700 text-white'; // Matching header blue
    default:
      return 'bg-gray-600 text-white';
  }
};

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
  
  // Obter nome formatado para exibição
  const displayName = getSpecialFormattedName(indicator.name);
  
  // Get category color
  const categoryColor = getCategoryColor(indicator.category);
  
  return (
    <div className="flex items-center gap-2">
      {/* Ícone com efeito 3D colorido de acordo com a categoria */}
      <div className="transform transition-all duration-3000 hover:scale-110 animate-pulse">
        <div className={`p-1 rounded-lg shadow-lg ${categoryColor} md:scale-130 scale-[1.105]`}>
          {React.cloneElement(indicator.icon as React.ReactElement, { 
            className: "md:size-6 size-5 fill-current",
            fill: "currentColor" 
          })}
        </div>
      </div>
      
      {/* Nome do indicador em negrito - Reduzido em 15% para mobile */}
      <span className="md:text-[1.3em] text-[1.105em] text-black font-bold">{displayName}</span>
      
      <span className="ml-auto md:text-[1.3em] text-[1.105em] font-medium text-black">
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
