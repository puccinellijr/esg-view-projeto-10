
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { FormValues } from './types';
import { saveESGIndicator } from '@/services/esgIndicatorService';
import { UserData } from '@/types/auth';

interface UseFormSubmitProps {
  form: UseFormReturn<FormValues>;
  user: UserData | null;
  userTerminal: string;
}

export const useFormSubmit = ({ form, user, userTerminal }: UseFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Converter toneladas movimentadas para número para fazer cálculos
      const toneladasMovimentadas = parseFloat(data.toneladasMovimentadas);
      
      if (isNaN(toneladasMovimentadas) || toneladasMovimentadas <= 0) {
        toast.error("Tonelada movimentada deve ser um número positivo");
        setIsSubmitting(false);
        return;
      }

      // Use a unique ID for the toast so we can dismiss it later
      const toastId = toast.loading("Salvando dados...");
      
      // Preparar dados para salvar
      const indicators = [
        // Indicadores ambientais (divididos por tonelada movimentada)
        {
          name: "litro_tm",
          value: parseFloat(data.waterPerTon), 
          category: "environmental" as const,
        },
        {
          name: "kg_tm",
          value: parseFloat(data.kgPerTon),
          category: "environmental" as const,
        },
        {
          name: "kwh_tm",
          value: parseFloat(data.kwhPerTon),
          category: "environmental" as const,
        },
        {
          name: "litro_combustivel_tm",
          value: parseFloat(data.fuelPerTon),
          category: "environmental" as const,
        },
        {
          name: "residuo_tm",
          value: parseFloat(data.wastePercentage),
          category: "environmental" as const,
        },
        
        // Indicadores sociais
        {
          name: "incidente",
          value: parseFloat(data.processIncidents),
          category: "social" as const,
        },
        {
          name: "acidente",
          value: parseFloat(data.accidentsWithLeave),
          category: "social" as const,
        },
        {
          name: "denuncia_discriminacao",
          value: parseFloat(data.discriminationComplaints),
          category: "social" as const,
        },
        {
          name: "mulher_trabalho",
          value: parseFloat(data.womenPercentage),
          category: "social" as const,
        },
        
        // Indicadores de governança
        {
          name: "denuncia_corrupcao",
          value: parseFloat(data.corruptionComplaints),
          category: "governance" as const,
        },
        {
          name: "reclamacao_vizinho",
          value: parseFloat(data.neighborComplaints),
          category: "governance" as const,
        },
        {
          name: "incidente_cibernetico",
          value: parseFloat(data.cyberIncidents),
          category: "governance" as const,
        },
      ];
      
      // Adicionar também o valor da tonelada movimentada como um indicador
      indicators.push({
        name: "tonelada",
        value: toneladasMovimentadas,
        category: "environmental" as const,
      });

      const month = parseInt(data.period);
      const year = parseInt(data.year);
      const terminal = data.terminal;

      console.log(`Salvando ${indicators.length} indicadores para ${terminal}, mês ${month}/${year}`);
      
      // Get user ID for tracking but don't attempt to save it to DB
      const userId = user?.id;
      
      // Still include created_by in our app logic for tracking purposes,
      // but the ESG service will now strip it out before DB operations
      const savePromises = indicators.map(indicator => 
        saveESGIndicator({
          name: indicator.name,
          value: indicator.value,
          category: indicator.category,
          terminal: terminal,
          month: month,
          year: year,
          created_by: userId
        })
      );
      
      const results = await Promise.all(savePromises);
      
      // Verificar se houve algum erro
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        console.error("Erros ao salvar indicadores:", errors);
        toast.dismiss(toastId);
        toast.error(`${errors.length} erros ao salvar indicadores. Verifique o console.`);
        setIsSubmitting(false);
        return;
      }
      
      // Sucesso - use the toastId to dismiss the loading toast
      toast.dismiss(toastId);
      toast.success("Dados salvos com sucesso no banco de dados!");
      
      // Resetar formulário
      form.reset({
        ...form.getValues(),
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
      });
      
    } catch (error) {
      // Always dismiss the toast, even in case of error
      toast.dismiss();
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { onSubmit, isSubmitting };
};
