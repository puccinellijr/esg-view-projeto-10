
import React, { useState, useEffect, useCallback } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TerminalSelector from '@/components/TerminalSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  // Initialize with current month/year, but we'll update this after we check the database
  // FIXED: Month in JavaScript is 0-based (0-11), but we want to display 1-12
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { hasAccess, user } = useAuth();
  const isAdmin = hasAccess('administrative');
  const isMobile = useIsMobile();
  
  // Add terminal state - default to user's assigned terminal or "Rio Grande" if not set
  const [selectedTerminal, setSelectedTerminal] = useState<string>(user?.terminal || "Rio Grande");

  // Generate array of months for the selector
  // FIXED: Month values should be 1-12 rather than 0-11
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  // Generate array of recent years for the selector
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Memoize the fetchMostRecentMonth function to avoid recreation on each render
  const fetchMostRecentMonth = useCallback(async () => {
    setIsLoading(true);
    console.log('Fetching most recent month for terminal:', selectedTerminal);
    
    try {
      // Query to find the most recent month/year with data
      const { data, error } = await supabase
        .from('esg_indicators')
        .select('month, year')
        .eq('terminal', selectedTerminal)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching most recent month:", error);
        toast.error("Erro ao carregar dados mais recentes");
      } else if (data && data.length > 0) {
        // Update selected month and year from the most recent data
        setSelectedMonth(data[0].month.toString());
        setSelectedYear(data[0].year.toString());
        console.log(`Most recent data found: Month ${data[0].month}, Year ${data[0].year}`);
      } else {
        console.log("No data found, using current month/year");
        // Set current month (1-12) if no data found
        setSelectedMonth((new Date().getMonth() + 1).toString());
      }
    } catch (err) {
      console.error("Error in fetching most recent month:", err);
      toast.error("Erro ao carregar períodos");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTerminal]);

  // Find the most recent month with data when terminal changes
  useEffect(() => {
    fetchMostRecentMonth();
  }, [selectedTerminal, fetchMostRecentMonth]);

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Dados atualizados com sucesso");
  };

  // Get display name of the selected month
  const getSelectedMonthName = () => {
    const selectedMonthObj = months.find(month => month.value === selectedMonth);
    return selectedMonthObj ? selectedMonthObj.label : "";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <div className="p-3 sm:p-4 md:p-6 flex flex-col">
            {/* Show TerminalSelector for both viewer and admin users */}
            {(user?.accessLevel === 'viewer' || user?.accessLevel === 'administrative') && (
              <TerminalSelector 
                selectedTerminal={selectedTerminal} 
                onTerminalChange={setSelectedTerminal}
              />
            )}
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 w-full sm:w-auto">Período:</h2>
              <div className="w-full sm:w-40">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-28">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
            
            {/* Display the selected period as a heading */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-700">
                Dados para: <span className="font-semibold text-custom-blue">{getSelectedMonthName()} de {selectedYear}</span>
              </h2>
            </div>
            
            <DashboardContent 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear}
              isEditable={isAdmin}
              refreshTrigger={refreshTrigger}
              selectedTerminal={selectedTerminal}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
