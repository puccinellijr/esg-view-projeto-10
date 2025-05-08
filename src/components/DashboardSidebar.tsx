
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
        <div className="text-xl font-bold text-white">ESG Analytics</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" className="hover:bg-white/10">
              <Link to="/dashboard" className="text-white">
                <Home />
                <span>Home</span>
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
      <SidebarFooter className="p-4">
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
