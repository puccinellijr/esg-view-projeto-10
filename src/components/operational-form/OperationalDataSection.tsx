
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

interface OperationalDataSectionProps {
  form: UseFormReturn<FormValues>;
}

export const OperationalDataSection: React.FC<OperationalDataSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Dados Operacionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="toneladasMovimentadas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Toneladas Movimentadas (TM)</FormLabel>
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
