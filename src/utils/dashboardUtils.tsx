
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
      return <Droplet size={18} className="text-blue-600" />; // Blue for water
    case 'kg_tm':
      return <Weight size={18} className="text-purple-600" />; // Purple for weight
    case 'kwh_tm':
      return <Zap size={18} className="text-yellow-500" />; // Yellow for energy
    case 'litro_combustivel_tm':
      return <Fuel size={18} className="text-orange-600" />; // Orange for fuel
    case 'residuo_tm':
      return <Percent size={18} className="text-green-600" />; // Green for waste
    case 'incidente':
      return <AlertTriangle size={18} className="text-red-600" />; // Red for incidents
    case 'acidente':
      return <Bandage size={18} className="text-red-700" />; // Deep red for accidents
    case 'denuncia_discriminacao':
      return <Users size={18} className="text-pink-600" />; // Pink for discrimination
    case 'mulher_trabalho':
      return <Handshake size={18} className="text-teal-600" />; // Teal for work relations
    case 'denuncia_corrupcao':
      return <Gavel size={18} className="text-purple-700" />; // Deep purple for corruption
    case 'reclamacao_vizinho':
      return <Bell size={18} className="text-amber-600" />; // Amber for complaints
    case 'incidente_cibernetico':
      return <Server size={18} className="text-indigo-600" />; // Indigo for cyber incidents
    case 'tonelada':
      return <TruckIcon size={18} className="text-gray-700" />; // Gray for tonnage
    default:
      return <Leaf size={18} className="text-green-600" />; // Green default
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

// Get month name for display
export const getMonthName = (month: string) => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return monthNames[parseInt(month) - 1];
};
