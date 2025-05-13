
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Indicator } from '@/hooks/useESGDashboardData';

interface IndicatorEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingIndicator: Indicator | null;
  newValue: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

const IndicatorEditDialog: React.FC<IndicatorEditDialogProps> = ({
  isOpen,
  onClose,
  editingIndicator,
  newValue,
  onValueChange,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onChange={(e) => onValueChange(e.target.value)} 
            placeholder="Novo valor" 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IndicatorEditDialog;
