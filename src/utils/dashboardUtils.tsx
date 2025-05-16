
import React from 'react';
import { 
  Droplet, 
  Weight, 
  Zap, 
  Fuel, 
  Percent, 
  AlertTriangle, 
  Bandage, 
  Users, 
  Handshake, 
  Gavel, 
  Bell,
  Server,
  Leaf,
  Shield,
  TruckIcon
} from 'lucide-react';
import { Indicator } from '@/hooks/useESGDashboardData';

export const getIndicatorIcon = (name: string) => {
  switch (name) {
    case 'litro_tm':
      return <Droplet size={18} className="text-blue-600 animate-pulse-very-slow" />; // Blue for water
    case 'kg_tm':
      return <Weight size={18} className="text-purple-600 animate-pulse-very-slow" />; // Purple for weight
    case 'kwh_tm':
      return <Zap size={18} className="text-yellow-500 animate-pulse-very-slow" />; // Yellow for energy
    case 'litro_combustivel_tm':
      return <Fuel size={18} className="text-orange-600 animate-pulse-very-slow" />; // Orange for fuel
    case 'residuo_tm':
      return <Percent size={18} className="text-green-600 animate-pulse-very-slow" />; // Green for waste
    case 'incidente':
      return <AlertTriangle size={18} className="text-red-600 animate-pulse-very-slow" />; // Red for incidents
    case 'acidente':
      return <Bandage size={18} className="text-red-700 animate-pulse-very-slow" />; // Deep red for accidents
    case 'denuncia_discriminacao':
      return <Users size={18} className="text-pink-600 animate-pulse-very-slow" />; // Pink for discrimination
    case 'mulher_trabalho':
      return <Handshake size={18} className="text-teal-600 animate-pulse-very-slow" />; // Teal for work relations
    case 'denuncia_corrupcao':
      return <Gavel size={18} className="text-purple-700 animate-pulse-very-slow" />; // Deep purple for corruption
    case 'reclamacao_vizinho':
      return <Bell size={18} className="text-amber-600 animate-pulse-very-slow" />; // Amber for complaints
    case 'incidente_cibernetico':
      return <Server size={18} className="text-indigo-600 animate-pulse-very-slow" />; // Indigo for cyber incidents
    case 'tonelada':
      return <TruckIcon size={18} className="text-gray-700 animate-pulse-very-slow" />; // Gray for tonnage
    default:
      return <Leaf size={18} className="text-green-600 animate-pulse-very-slow" />; // Green default
  }
};

export const addIconsToIndicators = (indicators: Indicator[]): Indicator[] => {
  return indicators.map(indicator => ({
    ...indicator,
    icon: getIndicatorIcon(indicator.name)
  }));
};

export const getCategoryIcon = (category: 'environmental' | 'social' | 'governance') => {
  switch (category) {
    case 'environmental':
      return <Leaf className="text-green-600 h-5 w-5" />;
    case 'social':
      return <Users className="text-blue-600 h-5 w-5" />;
    case 'governance':
      return <Shield className="text-purple-600 h-5 w-5" />;
  }
};

export const getCategoryBgColor = (category: 'environmental' | 'social' | 'governance') => {
  switch (category) {
    case 'environmental':
      return { color: 'green-600', bgClass: 'green-100' }; // Stronger green
    case 'social':
      return { color: 'blue-600', bgClass: 'blue-100' }; // Stronger blue
    case 'governance':
      return { color: 'purple-600', bgClass: 'purple-100' }; // Stronger purple
  }
};

// Format the indicator name for display by replacing underscores and capitalizing
export const formatIndicatorName = (name: string): string => {
  // Special case handling for specific indicators
  switch (name) {
    case 'litro_tm':
      return 'Litro / TM';
    case 'kg_tm':
      return 'KG / TM';
    case 'kwh_tm':
      return 'KWH / TM';
    case 'litro_combustivel_tm':
      return 'Litro Combustível / TM';
    case 'residuo_tm':
      return 'Resíduo / TM';
    case 'incidente':
      return 'Incidente';
    case 'acidente':
      return 'Acidente';
    case 'denuncia_discriminacao':
      return 'Denúncia Discriminação';
    case 'mulher_trabalho':
      return 'Mulher Trabalho';
    case 'denuncia_corrupcao':
      return 'Denúncia Corrupção';
    case 'reclamacao_vizinho':
      return 'Reclamação Vizinho';
    case 'incidente_cibernetico':
      return 'Incidente Cibernético';
    case 'tonelada':
      return 'Tonelada';
    default:
      // Generic formatting for other names
      return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
};

// Get month name for display
export const getMonthName = (month: string) => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return monthNames[parseInt(month) - 1];
};
