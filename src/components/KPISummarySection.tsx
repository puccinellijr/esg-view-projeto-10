
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Chart3D from './Chart3D';
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
  const isMobile = useIsMobile();
  
  // Calculate summary metrics
  const calculateSummary = () => {
    let totalMetrics = 0;
    
    // Count metrics that improved
    let improvedCount = 0;
    let unchangedCount = 0;
    let worsenedCount = 0;
    
    // For calculating average variation
    let totalVariationPercentage = 0;
    let metricsWithValues = 0;
    
    ['environmental', 'social', 'governance'].forEach(category => {
      const categoryData = esgData[category as keyof ESGData];
      
      Object.values(categoryData).forEach(({ value1, value2 }) => {
        if (value2 > value1) improvedCount++;
        else if (value2 === value1) unchangedCount++;
        else worsenedCount++;
        totalMetrics++;
        
        // Calculate percentage variation for metrics with value1 > 0
        if (value1 > 0) {
          const variationPercent = ((value2 - value1) / value1) * 100;
          totalVariationPercentage += variationPercent;
          metricsWithValues++;
        }
      });
    });
    
    // Calculate average variation percentage
    const averageVariation = metricsWithValues > 0 ? totalVariationPercentage / metricsWithValues : 0;
    
    return {
      improvedCount,
      unchangedCount,
      worsenedCount,
      totalMetrics,
      averageVariation
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <div className="mt-4 sm:mt-8 p-3 sm:p-6 bg-white rounded-lg shadow kpi-summary-section">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-6">Resumo da Comparação</h2>
      <p className="text-center text-gray-600 mb-4 sm:mb-8">
        {getMonthName(period1.month)} {period1.year} vs {getMonthName(period2.month)} {period2.year}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-800">Variação Média</h3>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                {summary.averageVariation.toFixed(2)}%
              </div>
              <p className="text-xs sm:text-sm text-blue-600 mt-2">
                Média de variação em todos os indicadores
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-green-800">Indicadores Melhorados</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-700">
                {summary.improvedCount} / {summary.totalMetrics}
              </div>
              <p className="text-xs sm:text-sm text-green-600 mt-2">
                Indicadores que melhoraram
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-800">Indicadores Piorados</h3>
              <div className="text-2xl sm:text-3xl font-bold text-red-700">
                {summary.worsenedCount} / {summary.totalMetrics}
              </div>
              <p className="text-xs sm:text-sm text-red-600 mt-2">
                Indicadores que pioraram
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Environmental Summary */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center text-green-800">Ambiental</h3>
            <div className="h-32 sm:h-40">
              <Chart3D 
                type="bar" 
                value1={Object.values(esgData.environmental).reduce((sum, { value1 }) => sum + value1, 0)} 
                value2={Object.values(esgData.environmental).reduce((sum, { value2 }) => sum + value2, 0)}
                category="environmental"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Social Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center text-blue-800">Social</h3>
            <div className="h-32 sm:h-40">
              <Chart3D 
                type="bar" 
                value1={Object.values(esgData.social).reduce((sum, { value1 }) => sum + value1, 0)} 
                value2={Object.values(esgData.social).reduce((sum, { value2 }) => sum + value2, 0)}
                category="social"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Governance Summary */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center text-purple-800">Governança</h3>
            <div className="h-32 sm:h-40">
              <Chart3D 
                type="bar" 
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
