
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [terminal, setTerminal] = useState(user?.terminal || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updated = await updateUserProfile({
        name,
        email,
        photoUrl,
        terminal,
        ...(newPassword ? { password: newPassword } : {}),
      });
      
      if (updated) {
        toast.success("Perfil atualizado com sucesso");
        // Limpar os campos de senha
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        toast.error("Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95%] max-w-[350px] max-h-[70vh] overflow-y-auto' : 'sm:max-w-[350px]'} p-4 sm:p-6`}>
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex justify-center">
            <ImageUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              name={name}
              email={email}
              className="scale-75"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              disabled
              placeholder="seu@email.com"
            />
            <p className="text-xs text-gray-500">Email não pode ser alterado</p>
          </div>
          
          {user?.accessLevel === "administrative" && (
            <div className="space-y-1">
              <Label htmlFor="terminal">Terminal</Label>
              <Select
                value={terminal}
                onValueChange={setTerminal}
                disabled={isLoading}
              >
                <SelectTrigger id="terminal">
                  <SelectValue placeholder="Selecione o terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                  <SelectItem value="SP">SP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
