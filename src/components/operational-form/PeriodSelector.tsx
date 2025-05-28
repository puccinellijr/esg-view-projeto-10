
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';

interface PeriodSelectorProps {
  form: UseFormReturn<FormValues>;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ form }) => {
  // Generate years: current year and last 4 years (total of 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <>
      <FormField
        control={form.control}
        name="period"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mês</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Mês" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ano</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Ano" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
