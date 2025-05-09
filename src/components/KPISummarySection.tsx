import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowRight, BarChart2, LineChart, PieChart } from "lucide-react";

interface Period {
  month: string;
  year: string;
}

interface ESGData {
  environmental: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  governance: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  social: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
}

interface KPISummarySectionProps {
  esgData: ESGData;
  period1: Period;
  period2: Period;
}

// Function to calculate overall trends
const calculateTrend = (data: { [key: string]: { value1: number; value2: number } }) => {
  let improvements = 0;
  let declines = 0;
  let stable = 0;
  
  Object.values(data).forEach(({ value1, value2 }) => {
    const diff = value2 - value1;
    const percentChange = value1 !== 0 ? (diff / value1) * 100 : 0;
    
    // Consider a 1% change threshold for determining if something is "stable"
    if (Math.abs(percentChange) < 1) {
      stable++;
    } else if (diff > 0) {
      improvements++;
    } else {
      declines++;
    }
  });
  
  return { improvements, declines, stable, total: Object.keys(data).length };
};

// Function to determine overall category direction
const getCategoryDirection = (
  improvements: number, 
  declines: number, 
  stable: number,
  total: number
) => {
  // If more than 60% are improvements, it's overall improving
  if (improvements / total >= 0.6) {
    return 'improvement';
  }
  // If more than 60% are declines, it's overall declining
  else if (declines / total >= 0.6) {
    return 'decline';
  }
  // If more than 60% are stable, it's overall stable
  else if (stable / total >= 0.6) {
    return 'stable';
  }
  // If improvements are more than declines, it's slightly improving
  else if (improvements > declines) {
    return 'slight-improvement';
  }
  // If declines are more than improvements, it's slightly declining
  else if (declines > improvements) {
    return 'slight-decline';
  }
  // Otherwise it's mixed/neutral
  else {
    return 'mixed';
  }
};

const KPISummarySection: React.FC<KPISummarySectionProps> = ({ esgData, period1, period2 }) => {
  // Calculate trends for each category
  const environmentalTrend = calculateTrend(esgData.environmental);
  const socialTrend = calculateTrend(esgData.social);
  const governanceTrend = calculateTrend(esgData.governance);
  
  // Get overall direction for each category
  const environmentalDirection = getCategoryDirection(
    environmentalTrend.improvements,
    environmentalTrend.declines,
    environmentalTrend.stable,
    environmentalTrend.total
  );
  
  const socialDirection = getCategoryDirection(
    socialTrend.improvements,
    socialTrend.declines,
    socialTrend.stable,
    socialTrend.total
  );
  
  const governanceDirection = getCategoryDirection(
    governanceTrend.improvements,
    governanceTrend.declines,
    governanceTrend.stable,
    governanceTrend.total
  );

  // Get class names and icons based on direction
  const getDirectionInfo = (direction: string) => {
    switch (direction) {
      case 'improvement':
        return { 
          icon: <ArrowUp size={28} className="text-green-500" />, 
          bgColor: 'bg-green-50', 
          textColor: 'text-green-700',
          label: 'Melhoria significativa'
        };
      case 'slight-improvement':
        return { 
          icon: <ArrowUp size={28} className="text-green-400" />, 
          bgColor: 'bg-green-50', 
          textColor: 'text-green-600',
          label: 'Leve melhoria'
        };
      case 'decline':
        return { 
          icon: <ArrowDown size={28} className="text-red-500" />, 
          bgColor: 'bg-red-50', 
          textColor: 'text-red-700',
          label: 'Declínio significativo'
        };
      case 'slight-decline':
        return { 
          icon: <ArrowDown size={28} className="text-red-400" />, 
          bgColor: 'bg-red-50', 
          textColor: 'text-red-600',
          label: 'Leve declínio'
        };
      case 'stable':
        return { 
          icon: <ArrowRight size={28} className="text-blue-500" />, 
          bgColor: 'bg-blue-50', 
          textColor: 'text-blue-700',
          label: 'Estável'
        };
      default:
        return { 
          icon: <ArrowRight size={28} className="text-gray-500" />, 
          bgColor: 'bg-gray-50', 
          textColor: 'text-gray-700',
          label: 'Resultados mistos'
        };
    }
  };
  
  const environmentalInfo = getDirectionInfo(environmentalDirection);
  const socialInfo = getDirectionInfo(socialDirection);
  const governanceInfo = getDirectionInfo(governanceDirection);
  
  // Format period display
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const formatPeriod = (period: Period) => {
    const monthIndex = parseInt(period.month) - 1;
    return `${monthNames[monthIndex]} ${period.year}`;
  };
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Resumo KPI de Comparação</h2>
      <p className="text-center mb-6 text-gray-600">
        Comparando {formatPeriod(period1)} com {formatPeriod(period2)}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Environmental KPI Card */}
        <Card className={`${environmentalInfo.bgColor} border-l-4 border-green-500`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm">
                {environmentalInfo.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ambiental</h3>
                <p className={`${environmentalInfo.textColor}`}>
                  {environmentalInfo.label}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-green-600">{environmentalTrend.improvements}</span> melhorias, 
                    <span className="font-semibold text-red-600 ml-1">{environmentalTrend.declines}</span> declínios, 
                    <span className="font-semibold text-blue-600 ml-1">{environmentalTrend.stable}</span> estáveis
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <PieChart size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <BarChart2 size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <LineChart size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Social KPI Card */}
        <Card className={`${socialInfo.bgColor} border-l-4 border-blue-500`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm">
                {socialInfo.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Social</h3>
                <p className={`${socialInfo.textColor}`}>
                  {socialInfo.label}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-green-600">{socialTrend.improvements}</span> melhorias, 
                    <span className="font-semibold text-red-600 ml-1">{socialTrend.declines}</span> declínios, 
                    <span className="font-semibold text-blue-600 ml-1">{socialTrend.stable}</span> estáveis
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <PieChart size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <BarChart2 size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <LineChart size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Governance KPI Card */}
        <Card className={`${governanceInfo.bgColor} border-l-4 border-purple-500`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm">
                {governanceInfo.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Governança</h3>
                <p className={`${governanceInfo.textColor}`}>
                  {governanceInfo.label}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-green-600">{governanceTrend.improvements}</span> melhorias, 
                    <span className="font-semibold text-red-600 ml-1">{governanceTrend.declines}</span> declínios, 
                    <span className="font-semibold text-blue-600 ml-1">{governanceTrend.stable}</span> estáveis
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <PieChart size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <BarChart2 size={16} />
              </div>
              <div className="p-1 rounded-full hover:bg-white/50 transition cursor-pointer">
                <LineChart size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPISummarySection;
