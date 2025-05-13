
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TerminalSelectorProps {
  selectedTerminal: string;
  onTerminalChange: (terminal: string) => void;
}

const TerminalSelector: React.FC<TerminalSelectorProps> = ({ selectedTerminal, onTerminalChange }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const isViewer = user?.accessLevel === 'viewer';
  const isAdmin = user?.accessLevel === 'administrative';
  
  return (
    <div className="mb-4 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-3 sm:gap-4">
        <Label htmlFor="terminal" className="text-sm sm:text-base font-semibold">Escolha o Terminal:</Label>
        <Select value={selectedTerminal} onValueChange={onTerminalChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Selecione o terminal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rio Grande">Rio Grande</SelectItem>
            <SelectItem value="Alemoa">Alemoa</SelectItem>
            <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
          </SelectContent>
        </Select>
        
        {isViewer && (
          <div className="text-xs sm:text-sm text-blue-600 w-full sm:w-auto text-center sm:text-left">
            (Visualizador pode acessar todos os terminais)
          </div>
        )}
        
        {isAdmin && (
          <div className="text-xs sm:text-sm text-green-600 w-full sm:w-auto text-center sm:text-left">
            (Administrador pode gerenciar todos os terminais)
          </div>
        )}
        
        {!isViewer && !isAdmin && user?.terminal && (
          <div className="text-xs sm:text-sm text-gray-600 italic w-full sm:w-auto text-center sm:text-left">
            (Terminal padrão: {user.terminal})
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalSelector;
