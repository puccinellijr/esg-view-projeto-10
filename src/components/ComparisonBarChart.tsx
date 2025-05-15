
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
      <div className="bg-white p-2 sm:p-4 shadow-md rounded-md border border-gray-200 text-xs sm:text-sm">
        <p className="font-bold mb-1 sm:mb-2 text-xs sm:text-sm">{label}</p>
        <p className="text-xs sm:text-sm text-green-600">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-green-500 mr-1 sm:mr-2 rounded-full"></span>
          {period1Label}: {payload[0].value.toFixed(4)}
        </p>
        <p className="text-xs sm:text-sm text-blue-600">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 mr-1 sm:mr-2 rounded-full"></span>
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
  
  // Define color for each category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environmental':
        return '#16A34A'; // vibrant green
      case 'social':
        return '#2563EB'; // vibrant blue
      case 'governance':
        return '#9333EA'; // vibrant purple
      default:
        return '#4B5563'; // gray
    }
  };
  
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
  
  // Determine chart height based on screen size and data length
  const getChartHeight = () => {
    const baseHeight = isMobile ? 400 : 600;
    const itemCount = chartData.length;
    
    // Adjust height based on number of items for better readability on mobile
    if (isMobile && itemCount > 10) {
      return Math.max(baseHeight, itemCount * 30); // 30px per item minimum on mobile
    }
    
    return baseHeight;
  };
  
  return (
    <div className="w-full h-auto p-2 sm:p-4 comparison-bar-chart">
      <h3 className="text-lg sm:text-xl font-bold text-center mb-3">{getTitle()}</h3>
      <ChartContainer config={chartConfig} className="h-[400px] sm:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ 
              top: 20, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 10 : 30, 
              bottom: isMobile ? 120 : 100 
            }}
            barGap={isMobile ? 0 : 4}
            barSize={isMobile ? 8 : 16}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={isMobile ? 120 : 100}
              tick={{ fontSize: isMobile ? 8 : 12 }}
              interval={0}
              tickMargin={isMobile ? 15 : 10}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 8 : 12 }}
              width={isMobile ? 40 : 50}
            />
            <Tooltip content={<CustomTooltip period1={period1} period2={period2} />} />
            <Legend
              wrapperStyle={{ 
                fontSize: isMobile ? 10 : 12,
                paddingTop: isMobile ? 5 : 10
              }}
            />
            <Bar 
              dataKey="periodo1" 
              name={period1 ? `${getMonthName(period1.month)}/${period1.year}` : "Período 1"} 
              fill={getPeriod1Color()}
              radius={[3, 3, 0, 0]}
              className="animate-fade-in"
            />
            <Bar 
              dataKey="periodo2" 
              name={period2 ? `${getMonthName(period2.month)}/${period2.year}` : "Período 2"}  
              fill={getPeriod2Color()}
              radius={[3, 3, 0, 0]}
              className="animate-fade-in"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default ComparisonBarChart;
