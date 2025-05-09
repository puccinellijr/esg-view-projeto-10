
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  
  const handleLogout = () => {
    logout();
    toast.success("Desconectado com sucesso");
    navigate("/login");
  };

  return (
    <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 md:px-6
                      ${state === "collapsed" ? "bg-sidebar text-white" : "bg-background"}`}>
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
        
        <h1 className={`text-lg font-medium md:text-xl ${state === "collapsed" ? "text-white" : "text-black"}`}>
          Visualizador de Cartão ESG
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className={`text-sm ${state === "collapsed" ? "text-white" : "text-black"}`}>
            {user?.email} ({user?.accessLevel === "administrative" ? "Administrativo" : user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"})
          </span>
        </div>
        <Button 
          variant={state === "collapsed" ? "outline" : "outline"} 
          size="sm" 
          className={`flex items-center gap-1 ${state === "collapsed" ? "text-white hover:text-sidebar hover:bg-white" : ""}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
