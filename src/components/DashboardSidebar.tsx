
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings, ChevronDown, Users, UserPlus, ChevronRight, LogOut } from 'lucide-react';
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
  SidebarSeparator
} from "@/components/ui/sidebar";
import { toast } from 'sonner';
import UserProfileModal from "@/components/UserProfileModal";

const DashboardSidebar = () => {
  const { user, hasAccess, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada com sucesso');
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Sidebar className="text-gray-800">
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
          {/* Added top banner in the sidebar content */}
          <div className="w-full h-[50px] bg-gray-200 mb-4"></div>
          
          <SidebarMenu className="space-y-4 px-2 mt-5"> {/* Added mt-5 to push menu 5% down */}
            {/* Início/Dashboard - Available to all users */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Início" 
                className={`hover:bg-gray-200 ${location.pathname === "/dashboard" ? "bg-gray-300" : ""}`}
                onClick={() => handleNavigate('/dashboard')}
              >
                <Link 
                  to="/dashboard" 
                  className="text-gray-800"
                >
                  <Home />
                  <span>Início</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {/* Formulário - Available to operational users and higher */}
            {hasAccess('operational') && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  tooltip="Formulário" 
                  className={`hover:bg-gray-200 ${location.pathname === "/operational-form" ? "bg-gray-300" : ""}`}
                >
                  <Link to="/operational-form" className="text-gray-800">
                    <FileText />
                    <span>Formulário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            
            {/* Relatórios - Visible to all authenticated users */}
            {hasAccess('viewer') && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Relatórios" className={`hover:bg-gray-200 ${location.pathname === "/comparison" ? "bg-gray-300" : ""}`}>
                  <Link to="/comparison" className="text-gray-800">
                    <FileText />
                    <span>Relatórios</span>
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
                    className="hover:bg-gray-200"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  >
                    <Settings />
                    <span>Configurações</span>
                    {isSettingsOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </SidebarMenuButton>
                  
                  {isSettingsOpen && (
                    <SidebarMenuSub className="bg-white text-black rounded-md">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={location.pathname === "/settings/user/create"} className="text-black hover:bg-gray-100">
                          <Link to="/settings/user/create">
                            <UserPlus className="h-4 w-4" />
                            <span>Cadastrar Usuário</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={location.pathname === "/settings/users"} className="text-black hover:bg-gray-100">
                          <Link to="/settings/users">
                            <Users className="h-4 w-4" />
                            <span>Gerenciar Usuários</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          className="text-black hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(true)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Perfil do Usuário</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton 
                  tooltip="Configurações" 
                  className="hover:bg-gray-200"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-gray-300">
          <div className="flex flex-col gap-4">
            <SidebarMenuButton 
              tooltip="Sair"
              className="hover:bg-gray-200 text-gray-800 w-full"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
            
            {state !== "collapsed" && (
              <div className="text-xs text-gray-600 text-center">
                Desenvolvido por TI GRANEL RIO GRANDE
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {isProfileOpen && <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </>
  );
};

export default DashboardSidebar;
