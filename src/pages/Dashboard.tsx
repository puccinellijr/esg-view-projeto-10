
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardSidebar from '@/components/DashboardSidebar';

const Dashboard = () => {
  const username = "Admin"; // This would come from authentication in a real app
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader username={username} />
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
