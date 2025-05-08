
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BarChart2, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  return (
    <Sidebar className="bg-custom-blue text-white">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" 
            alt="Odjell Terminals Granel Química Logo" 
            className="h-16 w-auto" 
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Odjell+Terminals';
            }} 
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-4 px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Início" className="hover:bg-white/10">
              <Link to="/dashboard" className="text-white">
                <Home />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Relatórios" className="hover:bg-white/10">
              <Link to="/relatorios" className="text-white">
                <BarChart2 />
                <span>Relatórios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboards" className="hover:bg-white/10">
              <Link to="/dashboards" className="text-white">
                <LayoutDashboard />
                <span>Dashboards</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações" className="hover:bg-white/10">
              <Link to="/configuracoes" className="text-white">
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenuButton asChild tooltip="Sair" className="hover:bg-custom-red/90">
          <button className="w-full flex items-center gap-2 text-white">
            <LogOut />
            <span>Sair</span>
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
