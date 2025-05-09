
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const { hasAccess, user } = useAuth();
  const isAdmin = hasAccess('administrative');

  // Generate array of months for the selector
  const months = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
  ];

  // Generate array of recent years for the selector
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <div className="p-6 flex flex-col">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Período:</h2>
              <div className="w-40">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
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
              <div className="w-28">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
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
            </div>
            <DashboardContent 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear}
              isEditable={isAdmin}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
