
import React from 'react';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  username: string;
}

const DashboardHeader = ({ username }: DashboardHeaderProps) => {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  
  return (
    <header className="bg-custom-blue text-white shadow-md p-4 flex items-center justify-between h-16 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:text-white/80" />
        {!isExpanded && (
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" 
              alt="Odjell Terminals Granel Química Logo" 
              className="h-10 w-auto" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/120x60?text=Odjell+Terminals';
              }} 
            />
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="text-white">Bem-vindo, <span className="font-semibold">{username}</span></p>
      </div>
    </header>
  );
};

export default DashboardHeader;
