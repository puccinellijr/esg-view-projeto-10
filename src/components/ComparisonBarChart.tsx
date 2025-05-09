
import React from 'react';
import { ChartContainer } from '@/components/ui/chart';
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

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
        <p className="font-bold mb-2">{label}</p>
        <p className="text-sm text-green-600">
          <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
          Período 1: {payload[0].value.toFixed(4)}
        </p>
        <p className="text-sm text-blue-600">
          <span className="inline-block w-3 h-3 bg-blue-500 mr-2 rounded-full"></span>
          Período 2: {payload[1].value.toFixed(4)}
        </p>
      </div>
    );
  }

  return null;
};

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
    <div className="w-full h-[600px] p-4 comparison-bar-chart">
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
            <Tooltip content={<CustomTooltip />} />
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
