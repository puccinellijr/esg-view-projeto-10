
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

interface DashboardContentProps {
  selectedMonth: string;
  selectedYear: string;
  isEditable: boolean;
  refreshTrigger?: number;
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
  refreshTrigger = 0
}) => {
  const { toast } = useToast();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data when month, year, or refreshTrigger changes
  useEffect(() => {
    const fetchData = () => {
      // Simulate API call with month and year
      console.log(`Fetching data for month ${selectedMonth} and year ${selectedYear}, refresh: ${refreshTrigger}`);
      
      // Simulate data from API
      const mockData: Indicator[] = [
        { id: 'water', name: 'Litro / TM', value: 435, icon: <Droplet size={18} className="text-black" />, category: 'environmental' },
        { id: 'weight', name: 'KG / TM', value: 1234, icon: <Weight size={18} className="text-black" />, category: 'environmental' },
        { id: 'energy', name: 'KWH / TM', value: 156, icon: <Zap size={18} className="text-black" />, category: 'environmental' },
        { id: 'fuel', name: 'L Combustível / TM', value: 48, icon: <Fuel size={18} className="text-black" />, category: 'environmental' },
        { id: 'waste', name: 'Resíduos Gerados', value: 5.2, icon: <Percent size={18} className="text-black" />, category: 'environmental' },
        
        { id: 'incidents', name: 'Incidentes de Processo', value: 3, icon: <AlertTriangle size={18} className="text-black" />, category: 'social' },
        { id: 'accidents', name: 'Acidentes com Afastamento', value: 1, icon: <Bandage size={18} className="text-black" />, category: 'social' },
        { id: 'discrimination', name: 'Denúncias por Discriminação', value: 0, icon: <Users size={18} className="text-black" />, category: 'social' },
        { id: 'women', name: 'Mulheres no Trabalho', value: 42, icon: <Handshake size={18} className="text-black" />, category: 'social' },
        
        { id: 'corruption', name: 'Denúncias por Corrupção', value: 0, icon: <Gavel size={18} className="text-black" />, category: 'governance' },
        { id: 'complaints', name: 'Reclamação de Vizinhos', value: 2, icon: <Bell size={18} className="text-black" />, category: 'governance' },
        { id: 'cyber', name: 'Incidentes Cibernéticos', value: 1, icon: <Server size={18} className="text-black" />, category: 'governance' },
      ];
      
      setIndicators(mockData);
    };
    
    fetchData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  // Filter indicators by category
  const environmentalIndicators = indicators.filter(ind => ind.category === 'environmental');
  const socialIndicators = indicators.filter(ind => ind.category === 'social');
  const governanceIndicators = indicators.filter(ind => ind.category === 'governance');

  // Open edit dialog for an indicator
  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setNewValue(indicator.value.toString());
    setIsDialogOpen(true);
  };

  // Save edited value
  const handleSave = () => {
    if (!editingIndicator) return;
    
    // Update local state
    setIndicators(prev => prev.map(ind => 
      ind.id === editingIndicator.id ? { ...ind, value: newValue } : ind
    ));
    
    // Close dialog
    setIsDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Valor atualizado com sucesso",
      description: `${editingIndicator.name}: ${newValue}`,
    });
    
    // Reset editing state
    setEditingIndicator(null);
  };

  // Render indicator item with optional edit button
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

  return (
    <main className="flex-1 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-black">Visão Geral</h1>
      
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
