
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  username: string;
}

const DashboardHeader = ({ username }: DashboardHeaderProps) => {
  return (
    <header className="bg-custom-blue text-white shadow-md p-4 flex items-center justify-between h-16 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:text-white/80" />
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Granel Química Logo" 
            className="h-8 w-auto" 
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Granel+Química';
            }} 
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-white">Bem-vindo, <span className="font-semibold">{username}</span></p>
      </div>
    </header>
  );
};

export default DashboardHeader;
