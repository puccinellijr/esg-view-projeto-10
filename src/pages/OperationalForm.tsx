import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { saveESGIndicator } from '@/services/esgDataService';

// Define the form schema for validation
const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

const OperationalForm = () => {
  const navigate = useNavigate();
  const { user, hasAccess } = useAuth();
  const isAdmin = hasAccess('administrative');
  const userTerminal = user?.terminal || "Rio Grande";

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

  const onSubmit = async (data: FormValues) => {
    try {
      // Converter toneladas movimentadas para número para fazer cálculos
      const toneladasMovimentadas = parseFloat(data.toneladasMovimentadas);
      
      if (isNaN(toneladasMovimentadas) || toneladasMovimentadas <= 0) {
        toast.error("Tonelada movimentada deve ser um número positivo");
        return;
      }

      // Mostrar toast de carregamento
      toast.loading("Salvando dados...");
      
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
      
      // Salvar todos os indicadores com informações do criador
      const userId = user?.id;
      
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
        toast.dismiss();
        toast.error(`${errors.length} erros ao salvar indicadores. Verifique o console.`);
        return;
      }
      
      // Sucesso
      toast.dismiss();
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
      toast.dismiss();
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Verifique o console.");
    }
  };

  // Function to handle navigation back to dashboard
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-semibold mb-6 text-black">Formulário Operacional</h1>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Inserir Dados ESG</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tonelada movimentada - new section */}
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

                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="bg-custom-blue">Salvar</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OperationalForm;
