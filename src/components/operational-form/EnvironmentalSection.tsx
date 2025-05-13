
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';

interface EnvironmentalSectionProps {
  form: UseFormReturn<FormValues>;
}

export const EnvironmentalSection: React.FC<EnvironmentalSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Dimensão Ambiental</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="waterPerTon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Litro / TM</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="kgPerTon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KG / TM</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="kwhPerTon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KWH / TM</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fuelPerTon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>L Combustível / TM</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="wastePercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>% de Resíduos Gerados</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
