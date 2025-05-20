
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ImageUpload from './ImageUpload';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [terminal, setTerminal] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhotoUrl(user.photoUrl || "");
      setTerminal(user.terminal || "none");
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    // If trying to change password but current password is not provided
    if (newPassword && !currentPassword) {
      toast.error("É necessário fornecer a senha atual para alterar a senha");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Atualizando perfil com dados:", {
        name,
        photoUrl,
        terminal: terminal === "none" ? null : terminal,
        ...(newPassword ? { password: newPassword, currentPassword } : {})
      });
      
      // Incluir senha atual quando a nova senha for fornecida
      const updated = await updateUserProfile({
        name,
        photoUrl,
        terminal: terminal === "none" ? null : terminal,
        ...(newPassword ? { 
          password: newPassword,
          currentPassword // Adicionar a senha atual para verificação
        } : {})
      });
      
      if (updated) {
        toast.success("Perfil atualizado com sucesso");
        // Limpar os campos de senha
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        toast.error("Erro ao atualizar perfil. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="flex flex-col items-center mb-6">
        <ImageUpload 
          value={photoUrl} 
          onChange={setPhotoUrl}
          name={name}
          email={email}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            disabled={true}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="terminal">Terminal Padrão</Label>
          <Select value={terminal} onValueChange={setTerminal} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um terminal padrão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="Rio Grande">Rio Grande</SelectItem>
              <SelectItem value="Alemoa">Alemoa</SelectItem>
              <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="current-password">Senha Atual</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova Senha</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
  
  // Use Sheet for mobile and Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto">
          <div className="py-6">
            <h2 className="text-lg font-semibold mb-4">Editar Perfil</h2>
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export { UserProfileModal };
