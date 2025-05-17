
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

// Get specific icon colors based on indicator name
const getIndicatorColor = (name: string): string => {
  switch(name) {
    case 'litro_tm':
      return 'text-blue-600 fill-blue-600'; // Blue for water
    case 'kg_tm':
      return 'text-purple-600 fill-purple-600'; // Purple for weight
    case 'kwh_tm':
      return 'text-yellow-500 fill-yellow-500'; // Yellow for energy
    case 'litro_combustivel_tm':
      return 'text-orange-600 fill-orange-600'; // Orange for fuel
    case 'residuo_tm':
      return 'text-green-600 fill-green-600'; // Green for waste
    case 'incidente':
      return 'text-red-600 fill-red-600'; // Red for incidents
    case 'acidente':
      return 'text-red-700 fill-red-700'; // Deep red for accidents
    case 'denuncia_discriminacao':
      return 'text-pink-600 fill-pink-600'; // Pink for discrimination
    case 'mulher_trabalho':
      return 'text-teal-600 fill-teal-600'; // Teal for work relations
    case 'denuncia_corrupcao':
      return 'text-purple-700 fill-purple-700'; // Deep purple for corruption
    case 'reclamacao_vizinho':
      return 'text-amber-600 fill-amber-600'; // Amber for complaints
    case 'incidente_cibernetico':
      return 'text-indigo-600 fill-indigo-600'; // Indigo for cyber incidents
    case 'tonelada':
      return 'text-gray-700 fill-gray-700'; // Gray for tonnage
    default:
      return 'text-gray-600 fill-gray-600'; // Default fallback
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
  
  // Get indicator specific color
  const indicatorColor = getIndicatorColor(indicator.name);
  
  return (
    <div className="flex items-center gap-2">
      {/* Ícone com efeito 3D colorido de acordo com o tipo de indicador */}
      <div className="transform transition-all duration-3000 hover:scale-110 animate-pulse">
        <div className={`p-1 rounded-lg shadow-lg ${categoryColor} md:scale-130 scale-[1.105]`}>
          {React.cloneElement(indicator.icon as React.ReactElement, { 
            className: `md:size-6 size-5 ${indicatorColor}`,
            fill: "currentColor" 
          })}
        </div>
      </div>
      
      {/* Nome do indicador em negrito - Reduzido em 20% para mobile */}
      <span className="md:text-[1.3em] text-[0.88em] text-black font-bold">{displayName}</span>
      
      <span className="ml-auto md:text-[1.3em] text-[0.88em] font-medium text-black">
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
