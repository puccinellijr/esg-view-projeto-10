
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="text-xl font-bold text-primary">ESG Analytics</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link to="/dashboard">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Relatórios">
              <Link to="/relatorios">
                <BarChart2 />
                <span>Relatórios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboards">
              <Link to="/dashboards">
                <LayoutDashboard />
                <span>Dashboards</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
              <Link to="/configuracoes">
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenuButton asChild tooltip="Sair">
          <button className="w-full flex items-center gap-2 text-red-500">
            <LogOut />
            <span>Sair</span>
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
