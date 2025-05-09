
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, ChevronDown, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const { user, hasAccess } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className="bg-custom-blue text-white">
      <SidebarHeader className="p-4">
        {state !== "collapsed" && (
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
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-4 px-2">
          {/* Início/Dashboard - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Início" className={`hover:bg-white/10 ${location.pathname === "/dashboard" ? "bg-white/20" : ""}`}>
              <Link to="/dashboard" className="text-white">
                <Home />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Formulário - Available to operational users and higher */}
          {hasAccess('operational') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Formulário" className={`hover:bg-white/10 ${location.pathname === "/operational-form" ? "bg-white/20" : ""}`}>
                <Link to="/operational-form" className="text-white">
                  <FileText />
                  <span>Formulário</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {/* Relatórios - Only visible to viewer and administrative users */}
          {hasAccess('viewer') && !hasAccess('operational') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Relatórios" className={`hover:bg-white/10 ${location.pathname === "/reports" ? "bg-white/20" : ""}`}>
                <Link to="/reports" className="text-white">
                  <Link to="/comparison" className="text-white">
                    <span>Relatórios</span>
                  </Link>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {/* Settings - Available to all users but with different options */}
          <SidebarMenuItem>
            {hasAccess('administrative') ? (
              <>
                <SidebarMenuButton 
                  tooltip="Configurações"
                  className={`hover:bg-white/10 ${location.pathname.startsWith("/settings") ? "bg-white/20" : ""}`}
                >
                  <Settings />
                  <span>Configurações</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={location.pathname === "/settings/user/create"}>
                      <Link to="/settings/user/create">
                        <UserPlus className="h-4 w-4" />
                        <span>Cadastrar Usuário</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={location.pathname === "/settings/users"}>
                      <Link to="/settings/users">
                        <Users className="h-4 w-4" />
                        <span>Gerenciar Usuários</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </>
            ) : (
              <SidebarMenuButton asChild tooltip="Configurações" className={`hover:bg-white/10 ${location.pathname === "/settings/profile" ? "bg-white/20" : ""}`}>
                <Link to="/settings/profile" className="text-white">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        {/* Footer content if needed */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
