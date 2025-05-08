
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success("Desconectado com sucesso");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <h1 className="text-lg font-medium md:text-xl">Visualizador de Cartão ESG</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm text-black">
            {user?.email} ({user?.accessLevel === "administrative" ? "Administrativo" : user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"})
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
