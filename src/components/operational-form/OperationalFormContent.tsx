
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formSchema, FormValues } from './types';
import { TerminalSelector } from './TerminalSelector';
import { PeriodSelector } from './PeriodSelector';
import { OperationalDataSection } from './OperationalDataSection';
import { EnvironmentalSection } from './EnvironmentalSection';
import { SocialSection } from './SocialSection';
import { GovernanceSection } from './GovernanceSection';
import { useFormSubmit } from './useFormSubmit';
import { UserData } from '@/types/auth';

interface OperationalFormContentProps {
  user: UserData | null;
  isAdmin: boolean;
  userTerminal: string;
}

export const OperationalFormContent: React.FC<OperationalFormContentProps> = ({ 
  user, 
  isAdmin, 
  userTerminal 
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      terminal: userTerminal,
      period: "1",
      year: new Date().getFullYear().toString(),
      toneladasMovimentadas: "",
      waterPerTon: "",
      kgPerTon: "",
      kwhPerTon: "",
      fuelPerTon: "",
      wastePercentage: "",
      processIncidents: "",
      accidentsWithLeave: "",
      discriminationComplaints: "",
      womenPercentage: "",
      corruptionComplaints: "",
      neighborComplaints: "",
      cyberIncidents: "",
    }
  });

  const { onSubmit, isSubmitting } = useFormSubmit({ form, user, userTerminal });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Inserir Dados ESG</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TerminalSelector form={form} isAdmin={isAdmin} userTerminal={userTerminal} />
              <PeriodSelector form={form} />
            </div>

            <OperationalDataSection form={form} />
            <EnvironmentalSection form={form} />
            <SocialSection form={form} />
            <GovernanceSection form={form} />

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                className="bg-custom-blue"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
