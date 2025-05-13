
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
      return <Droplet size={18} className="text-black" />;
    case 'kg_tm':
      return <Weight size={18} className="text-black" />;
    case 'kwh_tm':
      return <Zap size={18} className="text-black" />;
    case 'litro_combustivel_tm':
      return <Fuel size={18} className="text-black" />;
    case 'residuo_tm':
      return <Percent size={18} className="text-black" />;
    case 'incidente':
      return <AlertTriangle size={18} className="text-black" />;
    case 'acidente':
      return <Bandage size={18} className="text-black" />;
    case 'denuncia_discriminacao':
      return <Users size={18} className="text-black" />;
    case 'mulher_trabalho':
      return <Handshake size={18} className="text-black" />;
    case 'denuncia_corrupcao':
      return <Gavel size={18} className="text-black" />;
    case 'reclamacao_vizinho':
      return <Bell size={18} className="text-black" />;
    case 'incidente_cibernetico':
      return <Server size={18} className="text-black" />;
    case 'tonelada':
      return <TruckIcon size={18} className="text-black" />;
    default:
      return <Leaf size={18} className="text-black" />;
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
      return <Leaf className="text-black h-5 w-5" />;
    case 'social':
      return <Users className="text-black h-5 w-5" />;
    case 'governance':
      return <Shield className="text-black h-5 w-5" />;
  }
};

export const getCategoryBgColor = (category: 'environmental' | 'social' | 'governance') => {
  switch (category) {
    case 'environmental':
      return { color: 'custom-blue', bgClass: '[#F2FCE2]' }; // Updated to soft green
    case 'social':
      return { color: 'custom-yellow', bgClass: '[#ea384c]/10' }; // Updated to soft red
    case 'governance':
      return { color: 'custom-red', bgClass: '[#D3E4FD]' }; // Updated to soft blue
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
