
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Chart3D from './Chart3D';

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
  period1: {
    month: string;
    year: string;
  };
  period2: {
    month: string;
    year: string;
  };
}

const KPISummarySection = ({ esgData, period1, period2 }: KPISummarySectionProps) => {
  // Calculate summary metrics
  const calculateSummary = () => {
    let totalImprovement = 0;
    let totalMetrics = 0;
    
    // Process all categories
    ['environmental', 'social', 'governance'].forEach(category => {
      const categoryData = esgData[category as keyof ESGData];
      
      Object.values(categoryData).forEach(({ value1, value2 }) => {
        if (value1 > 0) { // Avoid division by zero
          const percentChange = ((value2 - value1) / value1) * 100;
          totalImprovement += percentChange;
          totalMetrics++;
        }
      });
    });
    
    // Calculate average improvement
    const averageImprovement = totalMetrics > 0 ? totalImprovement / totalMetrics : 0;
    
    // Count metrics that improved
    let improvedCount = 0;
    let unchangedCount = 0;
    let worsenedCount = 0;
    
    ['environmental', 'social', 'governance'].forEach(category => {
      const categoryData = esgData[category as keyof ESGData];
      
      Object.values(categoryData).forEach(({ value1, value2 }) => {
        if (value2 > value1) improvedCount++;
        else if (value2 === value1) unchangedCount++;
        else worsenedCount++;
      });
    });
    
    return {
      averageImprovement,
      improvedCount,
      unchangedCount,
      worsenedCount,
      totalMetrics
    };
  };
  
  const summary = calculateSummary();
  
  // Format months for display
  const getMonthName = (monthIndex: string) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[parseInt(monthIndex)];
  };
  
  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow kpi-summary-section">
      <h2 className="text-2xl font-bold text-center mb-6">Resumo da Comparação</h2>
      <p className="text-center text-gray-600 mb-8">
        {getMonthName(period1.month)} {period1.year} vs {getMonthName(period2.month)} {period2.year}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Variação Média</h3>
              <div className="text-3xl font-bold text-blue-600">
                {summary.averageImprovement > 0 ? '+' : ''}
                {summary.averageImprovement.toFixed(2)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Média de variação em todos os indicadores
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Indicadores Melhorados</h3>
              <div className="text-3xl font-bold text-green-600">
                {summary.improvedCount} / {summary.totalMetrics}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {((summary.improvedCount / summary.totalMetrics) * 100).toFixed(1)}% dos indicadores melhoraram
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Indicadores Piorados</h3>
              <div className="text-3xl font-bold text-red-600">
                {summary.worsenedCount} / {summary.totalMetrics}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {((summary.worsenedCount / summary.totalMetrics) * 100).toFixed(1)}% dos indicadores pioraram
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Environmental Summary */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Ambiental</h3>
            <div className="h-40">
              <Chart3D 
                type="pie" 
                value1={Object.values(esgData.environmental).reduce((sum, { value1 }) => sum + value1, 0)} 
                value2={Object.values(esgData.environmental).reduce((sum, { value2 }) => sum + value2, 0)}
                category="environmental"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Social Summary */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Social</h3>
            <div className="h-40">
              <Chart3D 
                type="pie" 
                value1={Object.values(esgData.social).reduce((sum, { value1 }) => sum + value1, 0)} 
                value2={Object.values(esgData.social).reduce((sum, { value2 }) => sum + value2, 0)}
                category="social"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Governance Summary */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Governança</h3>
            <div className="h-40">
              <Chart3D 
                type="pie" 
                value1={Object.values(esgData.governance).reduce((sum, { value1 }) => sum + value1, 0)} 
                value2={Object.values(esgData.governance).reduce((sum, { value2 }) => sum + value2, 0)}
                category="governance"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPISummarySection;
