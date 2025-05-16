
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { BarChart3, Settings, Users, FileTextIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const { logout, user, hasAccess } = useAuth();
  
  // Get sidebar state to conditionally render content
  const sidebarStateAttr = document.querySelector('[data-sidebar-state]')?.getAttribute('data-sidebar-state');
  const state = sidebarStateAttr as "expanded" | "collapsed" | "hidden" || "expanded";

  // Check user permissions
  const isAdmin = hasAccess('administrative');
  
  return (
    <>
      <SidebarHeader>
        {/* Only show logo when sidebar is expanded */}
        <div className="flex flex-col items-center justify-center py-4">
          {state !== "collapsed" && (
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" 
                alt="Odjell Terminals Granel Química Logo" 
                className="h-16 w-auto" 
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200x80?text=Logo';
                }}
              />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Added top banner in the sidebar content with the new color #104379 */}
        <div className="w-full h-[50px] bg-[#104379] mb-4"></div>
        
        <SidebarMenu className="space-y-4 px-2 mt-5"> {/* Added mt-5 to push menu 5% down */}
          {/* Início/Dashboard - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              active={pathname === '/dashboard'}
              className="w-full flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-200 text-black"
            >
              <Link to="/dashboard" className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* User Management - Admin Only */}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                active={pathname === '/manage-users'}
                className="w-full flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-200 text-black"
              >
                <Link to="/manage-users" className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Usuários</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {/* Data Form - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              active={pathname === '/operational-form'}
              className="w-full flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-200 text-black"
            >
              <Link to="/operational-form" className="flex items-center gap-3">
                <FileTextIcon className="h-5 w-5" />
                <span>Formulário</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Comparison - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              active={pathname === '/comparison'}
              className="w-full flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-200 text-black"
            >
              <Link to="/comparison" className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                <span>Comparação</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* User Profile - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              active={pathname === '/profile'}
              className="w-full flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-200 text-black"
            >
              <Link to="/profile" className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </>
  )
}

export default DashboardSidebar;
