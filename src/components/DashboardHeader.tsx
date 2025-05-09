
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import UserProfileModal from "@/components/UserProfileModal";

const DashboardHeader = () => {
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 md:px-6 bg-sidebar text-white">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="flex md:hidden lg:flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {state === "collapsed" && (
          <div className="hidden md:flex items-center justify-center">
            <img 
              src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" 
              alt="Odjell Terminals Logo" 
              className="h-10 w-auto" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Odjell+Terminals';
              }} 
            />
          </div>
        )}
        
        <h1 className="text-lg font-medium md:text-xl">
          Visualizador de Cartão ESG
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm hidden md:inline">
            {user?.email} ({user?.accessLevel === "administrative" ? "Administrativo" : user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"})
          </span>
          <Avatar className="cursor-pointer h-9 w-9 border-2 border-white/20 hover:border-white transition-colors"
                onClick={() => setIsProfileOpen(true)}>
            <AvatarImage src={user?.photoUrl || ""} alt={user?.email || "User"} />
            <AvatarFallback className="bg-blue-500 text-white">{getInitials(user?.email || "")}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {isProfileOpen && <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </header>
  );
};

export default DashboardHeader;
