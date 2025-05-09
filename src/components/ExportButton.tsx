
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  esgData: {
    environmental: {
      [key: string]: {
        value1: number;
        value2: number;
      };
    };
    governance: {
      [key: string]: {
        value1: number;
        value2: number;
      };
    };
    social: {
      [key: string]: {
        value1: number;
        value2: number;
      };
    };
  };
  period1: {
    month: string;
    year: string;
  };
  period2: {
    month: string;
    year: string;
  };
  terminal: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  esgData, 
  period1, 
  period2,
  terminal
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      exportToExcel(esgData, period1, period2, terminal);
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados para Excel com sucesso.",
      });
    } catch (error) {
      console.error("Erro na exportação para Excel:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para Excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(esgData, period1, period2, terminal);
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados para PDF com sucesso.",
      });
    } catch (error) {
      console.error("Erro na exportação para PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportToExcel}>
          <Download className="mr-2 h-4 w-4" />
          Exportar para Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar para PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
