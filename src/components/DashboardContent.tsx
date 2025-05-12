
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Droplet, 
  Weight, 
  Zap, 
  Fuel, 
  Percent, 
  AlertTriangle, 
  Bandage, 
  Users, 
  Handshake, 
  Gavel, 
  Bell,
  Server,
  Leaf,
  Shield,
  Edit
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { saveESGIndicator } from '@/services/esgDataService';

interface DashboardContentProps {
  selectedMonth: string;
  selectedYear: string;
  isEditable: boolean;
  refreshTrigger?: number;
  selectedTerminal?: string;
}

interface Indicator {
  id: string;
  name: string;
  value: string | number;
  icon: React.ReactNode;
  category: 'environmental' | 'social' | 'governance';
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  selectedMonth, 
  selectedYear, 
  isEditable,
  refreshTrigger = 0,
  selectedTerminal = "Rio Grande"
}) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados quando mês, ano, terminal ou refreshTrigger mudam
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log(`Buscando dados para terminal: ${selectedTerminal}, mês ${selectedMonth} e ano ${selectedYear}, refresh: ${refreshTrigger}`);
        
        // Buscar indicadores do Supabase
        const { data, error } = await supabase
          .from('esg_indicators')
          .select('*')
          .eq('terminal', selectedTerminal)
          .eq('month', parseInt(selectedMonth))
          .eq('year', parseInt(selectedYear));
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Mapear dados do banco para o formato de indicadores com ícones
          const mappedIndicators: Indicator[] = data.map(item => {
            // Determinar ícone baseado no nome do indicador
            let icon;
            switch (item.name) {
              case 'litro_tm': icon = <Droplet size={18} className="text-black" />; break;
              case 'kg_tm': icon = <Weight size={18} className="text-black" />; break;
              case 'kwh_tm': icon = <Zap size={18} className="text-black" />; break;
              case 'litro_combustivel_tm': icon = <Fuel size={18} className="text-black" />; break;
              case 'residuo_tm': icon = <Percent size={18} className="text-black" />; break;
              case 'incidente': icon = <AlertTriangle size={18} className="text-black" />; break;
              case 'acidente': icon = <Bandage size={18} className="text-black" />; break;
              case 'denuncia_discriminacao': icon = <Users size={18} className="text-black" />; break;
              case 'mulher_trabalho': icon = <Handshake size={18} className="text-black" />; break;
              case 'denuncia_corrupcao': icon = <Gavel size={18} className="text-black" />; break;
              case 'reclamacao_vizinho': icon = <Bell size={18} className="text-black" />; break;
              case 'incidente_cibernetico': icon = <Server size={18} className="text-black" />; break;
              default: icon = <Leaf size={18} className="text-black" />;
            }
            
            return {
              id: item.id,
              name: item.name,
              value: item.value,
              icon,
              category: item.category
            };
          });
          
          setIndicators(mappedIndicators);
        } else {
          // Se não houver dados, usar indicadores mockados para este mês
          console.log("Nenhum dado encontrado, usando indicadores padrão");
          
          const mockData: Indicator[] = [
            { 
              id: 'water', 
              name: 'litro_tm', 
              value: selectedTerminal === "Rio Grande" ? 435 : 398, 
              icon: <Droplet size={18} className="text-black" />, 
              category: 'environmental' 
            },
            { 
              id: 'weight', 
              name: 'kg_tm', 
              value: selectedTerminal === "Rio Grande" ? 1234 : 1412, 
              icon: <Weight size={18} className="text-black" />, 
              category: 'environmental' 
            },
            { 
              id: 'energy', 
              name: 'kwh_tm', 
              value: selectedTerminal === "Rio Grande" ? 156 : 173, 
              icon: <Zap size={18} className="text-black" />, 
              category: 'environmental' 
            },
            { 
              id: 'fuel', 
              name: 'litro_combustivel_tm', 
              value: selectedTerminal === "Rio Grande" ? 48 : 52, 
              icon: <Fuel size={18} className="text-black" />, 
              category: 'environmental' 
            },
            { 
              id: 'waste', 
              name: 'residuo_tm', 
              value: selectedTerminal === "Rio Grande" ? 5.2 : 6.1, 
              icon: <Percent size={18} className="text-black" />, 
              category: 'environmental' 
            },
            
            { 
              id: 'incidents', 
              name: 'incidente', 
              value: selectedTerminal === "Rio Grande" ? 3 : 2, 
              icon: <AlertTriangle size={18} className="text-black" />, 
              category: 'social' 
            },
            { 
              id: 'accidents', 
              name: 'acidente', 
              value: selectedTerminal === "Rio Grande" ? 1 : 0, 
              icon: <Bandage size={18} className="text-black" />, 
              category: 'social' 
            },
            { 
              id: 'discrimination', 
              name: 'denuncia_discriminacao', 
              value: 0, 
              icon: <Users size={18} className="text-black" />, 
              category: 'social' 
            },
            { 
              id: 'women', 
              name: 'mulher_trabalho', 
              value: selectedTerminal === "Rio Grande" ? 42 : 47, 
              icon: <Handshake size={18} className="text-black" />, 
              category: 'social' 
            },
            
            { 
              id: 'corruption', 
              name: 'denuncia_corrupcao', 
              value: 0, 
              icon: <Gavel size={18} className="text-black" />, 
              category: 'governance' 
            },
            { 
              id: 'complaints', 
              name: 'reclamacao_vizinho', 
              value: selectedTerminal === "Rio Grande" ? 2 : 3, 
              icon: <Bell size={18} className="text-black" />, 
              category: 'governance' 
            },
            { 
              id: 'cyber', 
              name: 'incidente_cibernetico', 
              value: selectedTerminal === "Rio Grande" ? 1 : 2, 
              icon: <Server size={18} className="text-black" />, 
              category: 'governance' 
            },
          ];
          
          setIndicators(mockData);
          
          // Opcional: salvar os dados mockados no Supabase para inicializar o banco
          if (isEditable) {
            mockData.forEach(async (indicator) => {
              await saveESGIndicator({
                name: indicator.name,
                value: typeof indicator.value === 'string' ? parseFloat(indicator.value) : indicator.value,
                category: indicator.category,
                terminal: selectedTerminal,
                month: parseInt(selectedMonth),
                year: parseInt(selectedYear)
              });
            });
            console.log("Dados mockados salvos no Supabase para inicializar o banco");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar indicadores");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonth, selectedYear, selectedTerminal, refreshTrigger, isEditable]);

  // Filtrar indicadores por categoria
  const environmentalIndicators = indicators.filter(ind => ind.category === 'environmental');
  const socialIndicators = indicators.filter(ind => ind.category === 'social');
  const governanceIndicators = indicators.filter(ind => ind.category === 'governance');

  // Abrir diálogo de edição para um indicador
  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setNewValue(indicator.value.toString());
    setIsDialogOpen(true);
  };

  // Salvar valor editado
  const handleSave = async () => {
    if (!editingIndicator) return;
    
    try {
      // Salvar valor no Supabase
      const result = await saveESGIndicator({
        name: editingIndicator.name,
        value: parseFloat(newValue),
        category: editingIndicator.category,
        terminal: selectedTerminal,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear)
      });
      
      if (result.success) {
        // Atualizar estado local
        setIndicators(prev => prev.map(ind => 
          ind.id === editingIndicator.id ? { ...ind, value: parseFloat(newValue) } : ind
        ));
        
        // Fechar diálogo
        setIsDialogOpen(false);
        
        // Mostrar toast de sucesso
        toast.success(result.message || "Valor atualizado com sucesso");
      } else {
        toast.error(result.message || "Erro ao atualizar valor");
      }
    } catch (error) {
      console.error("Erro ao salvar indicador:", error);
      toast.error("Erro ao salvar indicador");
    }
    
    // Resetar estado de edição
    setEditingIndicator(null);
  };

  // Renderizar item de indicador com botão de edição opcional
  const renderIndicatorItem = (indicator: Indicator) => (
    <div key={indicator.id} className="flex items-center gap-2">
      {indicator.icon}
      <span className="text-sm text-black">{indicator.name}</span>
      <span className="ml-auto text-sm font-medium text-black">{indicator.value}</span>
      {isEditable && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-auto" 
          onClick={() => handleEdit(indicator)}
        >
          <Edit size={16} className="text-custom-blue" />
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando indicadores...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-black">Visão Geral - Terminal {selectedTerminal}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-t-4 border-t-custom-blue min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#F2FCE2] p-4 w-full flex items-center gap-2">
            <Leaf className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Ambiental</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              {environmentalIndicators.map((indicator, index) => (
                <React.Fragment key={indicator.id}>
                  {renderIndicatorItem(indicator)}
                  {index < environmentalIndicators.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-yellow min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#ea384c]/10 p-4 w-full flex items-center gap-2">
            <Users className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Social</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores Sociais</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              {socialIndicators.map((indicator, index) => (
                <React.Fragment key={indicator.id}>
                  {renderIndicatorItem(indicator)}
                  {index < socialIndicators.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-t-custom-red min-h-[500px] flex flex-col overflow-hidden">
          <div className="bg-[#D3E4FD] p-4 w-full flex items-center gap-2">
            <Shield className="text-black h-5 w-5" />
            <h2 className="text-black font-bold">Dimensão Governança</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Indicadores de Governança</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex-grow flex flex-col">
            <div className="space-y-3 flex-grow flex flex-col justify-between py-4">
              {governanceIndicators.map((indicator, index) => (
                <React.Fragment key={indicator.id}>
                  {renderIndicatorItem(indicator)}
                  {index < governanceIndicators.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {editingIndicator?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="text" 
              value={newValue} 
              onChange={(e) => setNewValue(e.target.value)} 
              placeholder="Novo valor" 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default DashboardContent;
