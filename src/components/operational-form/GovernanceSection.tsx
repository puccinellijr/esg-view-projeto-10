
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

interface GovernanceSectionProps {
  form: UseFormReturn<FormValues>;
}

export const GovernanceSection: React.FC<GovernanceSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Dimensão Governança</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="corruptionComplaints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denúncias por Corrupção</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="neighborComplaints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reclamação de Vizinhos</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cyberIncidents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incidentes Cibernéticos</FormLabel>
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
