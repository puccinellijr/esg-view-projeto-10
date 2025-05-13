
import { z } from 'zod';

// Define the form schema for validation
export const formSchema = z.object({
  terminal: z.string({
    required_error: "Por favor selecione um terminal",
  }),
  period: z.string({
    required_error: "Por favor selecione um período",
  }),
  year: z.string({
    required_error: "Por favor selecione um ano",
  }),
  // Tonelada movimentada
  toneladasMovimentadas: z.string().min(1, "Campo obrigatório"),
  // Campos Ambientais
  waterPerTon: z.string().min(1, "Campo obrigatório"),
  kgPerTon: z.string().min(1, "Campo obrigatório"),
  kwhPerTon: z.string().min(1, "Campo obrigatório"),
  fuelPerTon: z.string().min(1, "Campo obrigatório"),
  wastePercentage: z.string().min(1, "Campo obrigatório"),
  // Campos Sociais
  processIncidents: z.string().min(1, "Campo obrigatório"),
  accidentsWithLeave: z.string().min(1, "Campo obrigatório"),
  discriminationComplaints: z.string().min(1, "Campo obrigatório"),
  womenPercentage: z.string().min(1, "Campo obrigatório"),
  // Campos Governança
  corruptionComplaints: z.string().min(1, "Campo obrigatório"),
  neighborComplaints: z.string().min(1, "Campo obrigatório"),
  cyberIncidents: z.string().min(1, "Campo obrigatório"),
});

export type FormValues = z.infer<typeof formSchema>;

// Types for ESG indicator categorization
export interface ESGIndicator {
  name: string;
  value: number;
  category: "environmental" | "social" | "governance";
}
