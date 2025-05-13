
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './types';

interface TerminalSelectorProps {
  form: UseFormReturn<FormValues>;
  isAdmin: boolean;
  userTerminal: string;
}

export const TerminalSelector: React.FC<TerminalSelectorProps> = ({ form, isAdmin, userTerminal }) => {
  return (
    <>
      {isAdmin ? (
        <FormField
          control={form.control}
          name="terminal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terminal</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Terminal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                  <SelectItem value="Alemoa">Alemoa</SelectItem>
                  <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="terminal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terminal</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  value={field.value} 
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Terminal associado ao seu perfil
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
