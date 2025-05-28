
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
      <div className="bg-white p-1 sm:p-2 shadow-md rounded-md border border-gray-200 text-xs">
        <p className="font-bold mb-1 text-xs">{label}</p>
        <p className="text-xs text-green-600">
          <span className="inline-block w-2 h-2 bg-green-500 mr-1 rounded-full"></span>
          {period1Label}: {payload[0].value.toFixed(4)}
        </p>
        <p className="text-xs text-blue-600">
          <span className="inline-block w-2 h-2 bg-blue-500 mr-1 rounded-full"></span>
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
  
  // Get chart colors based on category
  const getPeriod1Color = () => {
    if (category === 'environmental') {
      return '#15803D'; // darker green
    } else {
      return '#1E40AF'; // darker blue
    }
  };
  
  const getPeriod2Color = () => {
    if (category === 'environmental') {
      return '#22C55E'; // lighter green
    } else {
      return '#3B82F6'; // lighter blue
    }
  };
  
  const chartConfig = {
    period1: { label: period1 ? `${getMonthName(period1.month)}/${period1.year}` : 'Período 1', color: getPeriod1Color() },
    period2: { label: period2 ? `${getMonthName(period2.month)}/${period2.year}` : 'Período 2', color: getPeriod2Color() },
  };
  
  return (
    <div className="w-full h-auto p-1 sm:p-2 comparison-bar-chart">
      <h3 className="text-sm sm:text-base font-bold text-center mb-2">{getTitle()}</h3>
      <ChartContainer config={chartConfig} className={`${isMobile ? 'h-[58px]' : 'h-[280px]'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ 
              top: 6, 
              right: isMobile ? 2 : 20, 
              left: isMobile ? 2 : 20, 
              bottom: isMobile ? 14 : 60 
            }}
            barGap={isMobile ? 0 : 4}
            barSize={isMobile ? 1.5 : 12}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={isMobile ? 14 : 60}
              tick={{ fontSize: isMobile ? 3 : 10 }}
              interval={0}
              tickMargin={isMobile ? 3 : 12}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 3 : 10 }}
              width={isMobile ? 10 : 40}
            />
            <Tooltip content={<CustomTooltip period1={period1} period2={period2} />} />
            <Legend
              wrapperStyle={{ 
                fontSize: isMobile ? 3 : 12,
                paddingTop: isMobile ? 0.5 : 8
              }}
            />
            <Bar 
              dataKey="periodo1" 
              name={period1 ? `${getMonthName(period1.month)}/${period1.year}` : "Período 1"} 
              fill={getPeriod1Color()}
              radius={[2, 2, 0, 0]}
              className="animate-fade-in"
            />
            <Bar 
              dataKey="periodo2" 
              name={period2 ? `${getMonthName(period2.month)}/${period2.year}` : "Período 2"}  
              fill={getPeriod2Color()}
              radius={[2, 2, 0, 0]}
              className="animate-fade-in"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default ComparisonBarChart;
