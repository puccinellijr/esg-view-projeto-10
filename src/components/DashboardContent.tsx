
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  Edit,
  TruckIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { saveESGIndicator } from '@/services/esgDataService';

interface DashboardContentProps {
  selectedMonth: string;
  selectedYear: string;
  isEditable: boolean;
  refreshTrigger?: number;
  selectedTerminal?: string;
  isLoading?: boolean;
}

interface Indicator {
  id: string;
  name: string;
  value: string | number;
  icon: React.ReactNode;
  category: 'environmental' | 'social' | 'governance';
}

// Define expected indicators that should always be displayed
const expectedIndicators = [
  { name: 'litro_tm', category: 'environmental' as const, icon: <Droplet size={18} className="text-black" /> },
  { name: 'kg_tm', category: 'environmental' as const, icon: <Weight size={18} className="text-black" /> },
  { name: 'kwh_tm', category: 'environmental' as const, icon: <Zap size={18} className="text-black" /> },
  { name: 'litro_combustivel_tm', category: 'environmental' as const, icon: <Fuel size={18} className="text-black" /> },
  { name: 'residuo_tm', category: 'environmental' as const, icon: <Percent size={18} className="text-black" /> },
  { name: 'incidente', category: 'social' as const, icon: <AlertTriangle size={18} className="text-black" /> },
  { name: 'acidente', category: 'social' as const, icon: <Bandage size={18} className="text-black" /> },
  { name: 'denuncia_discriminacao', category: 'social' as const, icon: <Users size={18} className="text-black" /> },
  { name: 'mulher_trabalho', category: 'social' as const, icon: <Handshake size={18} className="text-black" /> },
  { name: 'denuncia_corrupcao', category: 'governance' as const, icon: <Gavel size={18} className="text-black" /> },
  { name: 'reclamacao_vizinho', category: 'governance' as const, icon: <Bell size={18} className="text-black" /> },
  { name: 'incidente_cibernetico', category: 'governance' as const, icon: <Server size={18} className="text-black" /> },
  { name: 'tonelada', category: 'environmental' as const, icon: <TruckIcon size={18} className="text-black" /> },
];

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  selectedMonth, 
  selectedYear, 
  isEditable,
  refreshTrigger = 0,
  selectedTerminal = "Rio Grande",
  isLoading: parentIsLoading = false
}) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tonnage, setTonnage] = useState<number>(0);
  
  // Get month name for display
  const getMonthName = (month: string) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[parseInt(month) - 1]; // Ajustado para meses 1-12
  };

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
          .eq('year', parseInt(selectedYear))
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Inicializar todos os indicadores esperados como N/D
        const initializedIndicators: Indicator[] = expectedIndicators.map(indicator => ({
          id: `${indicator.name}-placeholder`,
          name: indicator.name,
          value: "N/D",
          icon: indicator.icon,
          category: indicator.category
        }));
        
        let currentTonnage = 0;
        
        if (data && data.length > 0) {
          console.log(`Encontrados ${data.length} registros brutos para ${getMonthName(selectedMonth)} de ${selectedYear}`);
          
          // Criar um mapa para armazenar apenas o valor mais recente de cada indicador
          const latestIndicators = new Map();
          
          // Iterar pelos dados ordenados por created_at descendente
          data.forEach(item => {
            // Se ainda não temos este nome de indicador no mapa, adicione-o
            // Isso vai pegar apenas o primeiro encontrado de cada tipo, que é o mais recente
            if (!latestIndicators.has(item.name)) {
              // Determinar ícone baseado no nome do indicador
              const expectedIndicator = expectedIndicators.find(ind => ind.name === item.name);
              const icon = expectedIndicator ? expectedIndicator.icon : <Leaf size={18} className="text-black" />;
              
              // Garantir que category seja um dos valores literais permitidos
              let category: 'environmental' | 'social' | 'governance';
              
              if (item.category === 'environmental' || item.category === 'social' || item.category === 'governance') {
                category = item.category as 'environmental' | 'social' | 'governance';
              } else {
                // Caso o valor no banco não seja um dos esperados, use o do indicador esperado ou fallback para 'environmental'
                category = (expectedIndicator ? expectedIndicator.category : 'environmental');
              }
              
              // Se for tonelada, salvar o valor para cálculos posteriores
              if (item.name === 'tonelada') {
                currentTonnage = item.value;
                setTonnage(item.value);
              }
              
              latestIndicators.set(item.name, {
                id: item.id,
                name: item.name,
                value: item.value,
                icon,
                category
              });
            }
          });
          
          // Combinar os indicadores esperados com os dados reais
          const updatedIndicators = initializedIndicators.map(indicator => {
            const realIndicator = latestIndicators.get(indicator.name);
            return realIndicator || indicator;
          });
          
          setIndicators(updatedIndicators);
          console.log(`Carregados ${latestIndicators.size} indicadores mais recentes para ${getMonthName(selectedMonth)} de ${selectedYear}`);
          console.log(`Tonelada movimentada: ${currentTonnage}`);
        } else {
          // Se não houver dados, usar indicadores inicializados com N/D
          console.log("Nenhum dado encontrado, exibindo N/D para todos os indicadores");
          setIndicators(initializedIndicators);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar indicadores");
        
        // Em caso de erro, manter os indicadores com N/D
        const fallbackIndicators = expectedIndicators.map(indicator => ({
          id: `${indicator.name}-error`,
          name: indicator.name,
          value: "N/D",
          icon: indicator.icon,
          category: indicator.category
        }));
        setIndicators(fallbackIndicators);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonth, selectedYear, selectedTerminal, refreshTrigger]);

  // Filtrar indicadores por categoria
  const environmentalIndicators = indicators
    .filter(ind => ind.category === 'environmental' && ind.name !== 'tonelada');
  const socialIndicators = indicators.filter(ind => ind.category === 'social');
  const governanceIndicators = indicators.filter(ind => ind.category === 'governance');
  const tonnageIndicator = indicators.find(ind => ind.name === 'tonelada');

  // Abrir diálogo de edição para um indicador
  const handleEdit = (indicator: Indicator) => {
    // Não permitir editar indicadores com valor N/D - criar novo
    if (indicator.value === "N/D") {
      setEditingIndicator({
        ...indicator,
        id: `new-${indicator.name}` // Marcar como novo
      });
      setNewValue("0"); // Valor padrão para novos indicadores
    } else {
      setEditingIndicator(indicator);
      setNewValue(indicator.value.toString());
    }
    setIsDialogOpen(true);
  };

  // Salvar valor editado
  const handleSave = async () => {
    if (!editingIndicator) return;
    
    try {
      // Validar valor
      if (isNaN(parseFloat(newValue))) {
        toast.error("Por favor, insira um valor numérico válido");
        return;
      }
      
      // Salvar valor no Supabase (novo ou atualizado)
      const result = await saveESGIndicator({
        id: editingIndicator.id.startsWith('new-') ? undefined : editingIndicator.id,
        name: editingIndicator.name,
        value: parseFloat(newValue),
        category: editingIndicator.category,
        terminal: selectedTerminal,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear)
      });
      
      if (result.success) {
        // Atualizar apenas o indicador específico que foi editado
        setIndicators(prev => prev.map(ind => 
          ind.name === editingIndicator.name 
            ? { ...ind, value: parseFloat(newValue), id: result.id || ind.id } 
            : ind
        ));
        
        // Se for tonelada, atualizar o estado de tonelagem
        if (editingIndicator.name === 'tonelada') {
          setTonnage(parseFloat(newValue));
        }
        
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
  const renderIndicatorItem = (indicator: Indicator) => {
    // Para indicadores ambientais, dividir pelo valor da tonelada se disponível
    let displayValue = indicator.value;
    
    // Verificar se é um indicador ambiental e se a tonelada é válida para divisão
    if (
      indicator.category === 'environmental' && 
      indicator.name !== 'tonelada' && 
      tonnage && 
      typeof indicator.value === 'number' && 
      tonnage > 0
    ) {
      // Calcular valor por tonelada
      const calculatedValue = indicator.value / tonnage;
      // Formatar com 4 casas decimais
      displayValue = calculatedValue.toFixed(4);
    }
    
    return (
      <div key={indicator.id} className="flex items-center gap-2">
        {indicator.icon}
        <span className="text-sm text-black">{indicator.name}</span>
        <span className="ml-auto text-sm font-medium text-black">
          {displayValue}
          {indicator.category === 'environmental' && indicator.name !== 'tonelada' ? 
            <span className="text-xs text-gray-500 ml-1">/ton</span> : 
            null
          }
        </span>
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
  };

  if (isLoading || parentIsLoading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando indicadores de {getMonthName(selectedMonth)} {selectedYear}...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-black">
        Visão Geral - Terminal {selectedTerminal} - {getMonthName(selectedMonth)}/{selectedYear}
      </h1>
      
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
            {/* Mostrar tonelada primeiro */}
            {tonnageIndicator && (
              <div className="mb-4 p-2 bg-gray-100 rounded-md">
                {renderIndicatorItem(tonnageIndicator)}
              </div>
            )}
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
            <DialogDescription>
              Este valor será salvo como o mais recente para este indicador.
            </DialogDescription>
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
