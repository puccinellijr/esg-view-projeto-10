
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import HeaderLogo from "./header/HeaderLogo";
import WelcomeMessage from "./header/WelcomeMessage";
import UserAvatar from "./header/UserAvatar";

const DashboardHeader = () => {
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const isMobile = useIsMobile();
  
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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-2 sm:px-4 md:px-6 bg-sidebar text-white">
      <HeaderLogo toggleSidebar={toggleSidebar} sidebarState={state} />
      
      <div className="flex items-center gap-2 sm:gap-4">
        <WelcomeMessage 
          displayName={getUserDisplayName()} 
          isMobile={isMobile} 
        />
        
        <UserAvatar 
          email={user?.email} 
          photoUrl={user?.photoUrl}
          accessLevel={user?.accessLevel}
        />
      </div>
    </header>
  );
};

export default DashboardHeader;
