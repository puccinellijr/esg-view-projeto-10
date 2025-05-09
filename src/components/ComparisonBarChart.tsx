
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';

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
}

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ esgData }) => {
  // Process data for the chart
  const processChartData = () => {
    const chartData: any[] = [];
    
    // Process environmental data
    Object.entries(esgData.environmental).forEach(([key, values]) => {
      chartData.push({
        name: key.replace('_', ' '),
        periodo1: values.value1,
        periodo2: values.value2,
        category: 'environmental'
      });
    });
    
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
    
    return chartData;
  };
  
  const chartData = processChartData();
  
  // Define color for each category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environmental':
        return '#34D399'; // green
      case 'social':
        return '#60A5FA'; // blue
      case 'governance':
        return '#A78BFA'; // purple
      default:
        return '#9CA3AF'; // gray
    }
  };
  
  const chartConfig = {
    period1: { label: 'Período 1', color: '#10B981' },
    period2: { label: 'Período 2', color: '#3B82F6' },
  };
  
  return (
    <div className="w-full h-[600px] p-4">
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 30, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <ChartTooltip 
              content={(props) => (
                <ChartTooltipContent {...props} />
              )}
            />
            <Legend />
            <Bar 
              dataKey="periodo1" 
              name="Período 1" 
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              className="animate-fade-in"
            />
            <Bar 
              dataKey="periodo2" 
              name="Período 2" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              className="animate-fade-in"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default ComparisonBarChart;
