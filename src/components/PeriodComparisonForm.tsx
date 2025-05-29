
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

interface Period {
  month: string;
  year: string;
}

interface PeriodComparisonFormProps {
  period1: Period;
  period2: Period;
  onPeriod1Change: (field: 'month' | 'year', value: string) => void;
  onPeriod2Change: (field: 'month' | 'year', value: string) => void;
  onCompare: () => void;
  isLoading?: boolean;
}

const PeriodComparisonForm: React.FC<PeriodComparisonFormProps> = ({
  period1,
  period2,
  onPeriod1Change,
  onPeriod2Change,
  onCompare,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  
  // Generate arrays for months (1-12) and years (current year + last 4 years)
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm mb-4 sm:mb-8">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Label className="text-base font-semibold mb-1 sm:mb-0">Período 1:</Label>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={period1.month} onValueChange={(value) => onPeriod1Change('month', value)}>
              <SelectTrigger className="w-full sm:w-[80px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={`p1-month-${month}`} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={period1.year || currentYear.toString()} onValueChange={(value) => onPeriod1Change('year', value)}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={`p1-year-${year}`} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Label className="text-base font-semibold mb-1 sm:mb-0">Período 2:</Label>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={period2.month} onValueChange={(value) => onPeriod2Change('month', value)}>
              <SelectTrigger className="w-full sm:w-[80px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={`p2-month-${month}`} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={period2.year || currentYear.toString()} onValueChange={(value) => onPeriod2Change('year', value)}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={`p2-year-${year}`} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={onCompare} 
          className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            'Comparar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PeriodComparisonForm;
