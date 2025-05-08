
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TerminalSelectorProps {
  selectedTerminal: string;
  onTerminalChange: (terminal: string) => void;
}

const TerminalSelector: React.FC<TerminalSelectorProps> = ({ selectedTerminal, onTerminalChange }) => {
  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Label htmlFor="terminal" className="text-base font-semibold">Escolha o Terminal:</Label>
        <Select value={selectedTerminal} onValueChange={onTerminalChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o terminal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rio Grande">Rio Grande</SelectItem>
            <SelectItem value="SP">SP</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TerminalSelector;
