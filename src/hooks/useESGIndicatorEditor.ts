
import { useState } from 'react';
import { toast } from 'sonner';
import { saveESGIndicator } from '@/services/esgIndicatorService';
import { Indicator } from './useESGDashboardData';

interface UseESGIndicatorEditorProps {
  selectedMonth: string;
  selectedYear: string;
  selectedTerminal: string;
  onIndicatorUpdate?: (indicator: Indicator) => void;
}

export const useESGIndicatorEditor = ({
  selectedMonth,
  selectedYear,
  selectedTerminal,
  onIndicatorUpdate
}: UseESGIndicatorEditorProps) => {
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        // Call the update callback if available
        if (onIndicatorUpdate) {
          const updatedIndicator = { 
            ...editingIndicator, 
            value: parseFloat(newValue), 
            id: result.id || editingIndicator.id 
          };
          onIndicatorUpdate(updatedIndicator);
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

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingIndicator(null);
  };

  return {
    editingIndicator,
    newValue,
    isDialogOpen,
    setNewValue,
    handleEdit,
    handleSave,
    closeDialog
  };
};
