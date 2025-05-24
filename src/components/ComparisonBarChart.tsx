
import React from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { getMonthName } from '@/utils/dashboardUtils';

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

interface ComparisonBarChartProps {
  esgData: ESGData;
  category: 'environmental' | 'social_governance';
  period1?: { month: string; year: string };
  period2?: { month: string; year: string };
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label, period1, period2 }: any) => {
  if (active && payload && payload.length) {
    const period1Label = period1 ? `${getMonthName(period1.month)}/${period1.year}` : 'Período 1';
    const period2Label = period2 ? `${getMonthName(period2.month)}/${period2.year}` : 'Período 2';
    
    return (
      <div className="bg-white p-3 sm:p-4 shadow-lg rounded-lg border-2 border-gray-300 text-sm">
        <p className="font-bold mb-2 text-base text-gray-800">{label}</p>
        <p className="text-sm text-green-700 font-semibold">
          <span className="inline-block w-3 h-3 bg-green-600 mr-2 rounded-full shadow-sm"></span>
          {period1Label}: {payload[0].value.toFixed(4)}
        </p>
        <p className="text-sm text-blue-700 font-semibold">
          <span className="inline-block w-3 h-3 bg-blue-600 mr-2 rounded-full shadow-sm"></span>
          {period2Label}: {payload[1].value.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ esgData, category, period1, period2 }) => {
  const isMobile = useIsMobile();
  
  // Process data for the chart
  const processChartData = () => {
    const chartData: any[] = [];
    
    // Handle environmental data
    if (category === 'environmental') {
      Object.entries(esgData.environmental).forEach(([key, values]) => {
        chartData.push({
          name: key.replace('_', ' '),
          periodo1: values.value1,
          periodo2: values.value2,
          category: 'environmental'
        });
      });
    } 
    // Handle social and governance data
    else if (category === 'social_governance') {
      // Process social data
      Object.entries(esgData.social).forEach(([key, values]) => {
        chartData.push({
          name: key.replace('_', ' '),
          periodo1: values.value1,
          periodo2: values.value2,
          category: 'social'
        });
      });
      
      // Process governance data
      Object.entries(esgData.governance).forEach(([key, values]) => {
        chartData.push({
          name: key.replace('_', ' '),
          periodo1: values.value1,
          periodo2: values.value2,
          category: 'governance'
        });
      });
    }
    
    return chartData;
  };
  
  const chartData = processChartData();
  
  // Get title based on category
  const getTitle = () => {
    if (category === 'environmental') {
      return "Dimensão Ambiental";
    } else {
      return "Dimensões Social e Governança";
    }
  };
  
  // Get vibrant chart colors based on category
  const getPeriod1Color = () => {
    if (category === 'environmental') {
      return '#059669'; // Very vibrant green
    } else {
      return '#1D4ED8'; // Very vibrant blue
    }
  };
  
  const getPeriod2Color = () => {
    if (category === 'environmental') {
      return '#10B981'; // Bright emerald green
    } else {
      return '#3B82F6'; // Bright blue
    }
  };
  
  const chartConfig = {
    period1: { label: period1 ? `${getMonthName(period1.month)}/${period1.year}` : 'Período 1', color: getPeriod1Color() },
    period2: { label: period2 ? `${getMonthName(period2.month)}/${period2.year}` : 'Período 2', color: getPeriod2Color() },
  };
  
  return (
    <div className="w-full h-auto p-2 sm:p-4 comparison-bar-chart">
      <h3 className="text-lg sm:text-xl font-bold text-center mb-3">{getTitle()}</h3>
      {/* Reduzido a largura em 50% - agora usando w-1/2 e centralizado */}
      <div className="w-1/2 mx-auto">
        <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{ 
                top: 20, 
                right: isMobile ? 15 : 30, 
                left: isMobile ? 60 : 100, 
                bottom: isMobile ? 15 : 25 
              }}
              barGap={isMobile ? 3 : 6}
              barSize={isMobile ? 15 : 25}
              maxBarSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                domain={[0, 'dataMax']}
                tick={{ fontSize: isMobile ? 10 : 12, fill: '#374151', fontWeight: 'bold' }}
                axisLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
                tickLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#374151', fontWeight: 'bold' }}
                width={isMobile ? 60 : 100}
                axisLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
                tickLine={{ stroke: '#9CA3AF' }}
              />
              <Tooltip content={<CustomTooltip period1={period1} period2={period2} />} />
              <Legend
                wrapperStyle={{ 
                  fontSize: isMobile ? 11 : 13,
                  paddingTop: isMobile ? 10 : 15,
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="periodo1" 
                name={period1 ? `${getMonthName(period1.month)}/${period1.year}` : "Período 1"} 
                fill={getPeriod1Color()}
                radius={[0, 4, 4, 0]}
                className="animate-fade-in"
                stroke="#FFFFFF"
                strokeWidth={1}
              />
              <Bar 
                dataKey="periodo2" 
                name={period2 ? `${getMonthName(period2.month)}/${period2.year}` : "Período 2"}  
                fill={getPeriod2Color()}
                radius={[0, 4, 4, 0]}
                className="animate-fade-in"
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default ComparisonBarChart;
