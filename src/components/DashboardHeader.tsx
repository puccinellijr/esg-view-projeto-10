
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  username: string;
}

const DashboardHeader = ({ username }: DashboardHeaderProps) => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Logo';
          }} />
          <span className="text-lg font-medium">ESG Analytics</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gray-600">Bem-vindo, <span className="font-semibold">{username}</span></p>
      </div>
    </header>
  );
};

export default DashboardHeader;
