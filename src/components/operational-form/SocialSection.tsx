
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

interface SocialSectionProps {
  form: UseFormReturn<FormValues>;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Dimensão Social</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="processIncidents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incidentes de Processo</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accidentsWithLeave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acidentes com Afastamento</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="discriminationComplaints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denúncias por Discriminação</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="womenPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mulheres no Trabalho (%)</FormLabel>
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
