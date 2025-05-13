
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { OperationalFormContent } from '@/components/operational-form/OperationalFormContent';

const OperationalForm = () => {
  const navigate = useNavigate();
  const { user, hasAccess } = useAuth();
  const isAdmin = hasAccess('administrative');
  const userTerminal = user?.terminal || "Rio Grande";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-semibold mb-6 text-black">Formulário Operacional</h1>
            
            <OperationalFormContent 
              user={user} 
              isAdmin={isAdmin} 
              userTerminal={userTerminal} 
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OperationalForm;
