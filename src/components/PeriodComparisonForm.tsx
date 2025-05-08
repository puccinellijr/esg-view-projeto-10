
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
}

const PeriodComparisonForm: React.FC<PeriodComparisonFormProps> = ({
  period1,
  period2,
  onPeriod1Change,
  onPeriod2Change,
  onCompare
}) => {
  // Generate arrays for months and years
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (2020 + i).toString());

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Período 1:</Label>
          <Select value={period1.month} onValueChange={(value) => onPeriod1Change('month', value)}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={`p1-month-${month}`} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={period1.year} onValueChange={(value) => onPeriod1Change('year', value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={`p1-year-${year}`} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Período 2:</Label>
          <Select value={period2.month} onValueChange={(value) => onPeriod2Change('month', value)}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={`p2-month-${month}`} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={period2.year} onValueChange={(value) => onPeriod2Change('year', value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={`p2-year-${year}`} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onCompare} className="bg-blue-500 hover:bg-blue-600">
          Comparar
        </Button>
      </div>
    </div>
  );
};

export default PeriodComparisonForm;
