
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import HeaderLogo from "./header/HeaderLogo";
import WelcomeMessage from "./header/WelcomeMessage";
import UserAvatar from "./header/UserAvatar";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Get user's first name only for welcome message
  const getUserDisplayName = () => {
    if (user?.name) {
      const firstName = user.name.split(' ')[0]; // Get first name only
      return firstName;
    } else if (user?.email) {
      return user.email.split('@')[0]; // Get username from email
    } else {
      return 'Usuário';
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada com sucesso');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-2 sm:px-4 md:px-6 bg-sidebar text-white">
      <HeaderLogo toggleSidebar={toggleSidebar} sidebarState={state} />
      
      <div className="flex items-center gap-2 sm:gap-4">
        <WelcomeMessage 
          displayName={getUserDisplayName()} 
          isMobile={isMobile} 
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <UserAvatar 
                email={user?.email} 
                photoUrl={user?.photoUrl}
                accessLevel={user?.accessLevel}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="flex flex-col space-y-1">
              <Button 
                variant="ghost" 
                className="justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default DashboardHeader;
