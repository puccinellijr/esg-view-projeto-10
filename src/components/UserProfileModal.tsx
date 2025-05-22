
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ImageUpload from './ImageUpload';
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, hasAccess } = useAuth();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [terminal, setTerminal] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const isAdmin = hasAccess('administrative');
  
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
    setPasswordError("");
    
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (newPassword && !currentPassword) {
      setPasswordError("A senha atual é necessária para definir uma nova senha");
      toast.error("A senha atual é necessária para definir uma nova senha");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Atualizando perfil com dados:", {
        name,
        photoUrl,
        terminal: isAdmin ? (terminal === "none" ? null : terminal) : undefined,
        ...(newPassword ? { 
          password: newPassword,
          currentPassword 
        } : {})
      });
      
      // Atualizar usuário incluindo todos os dados necessários
      const updated = await updateUserProfile({
        name,
        photoUrl,
        terminal: isAdmin ? (terminal === "none" ? null : terminal) : undefined,
        ...(newPassword ? { 
          password: newPassword,
          currentPassword 
        } : {})
      });
      
      if (updated) {
        toast.success("Perfil atualizado com sucesso");
        // Limpar os campos de senha
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        onClose();
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error?.message || "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };
  
  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="flex flex-col items-center mb-6">
        <ImageUpload 
          value={photoUrl} 
          onChange={setPhotoUrl}
          name={name}
          email={email}
          enableCamera={true}
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
        
        {isAdmin && (
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
        )}
        
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
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
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
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto">
          <div className="py-6">
            <h2 className="text-lg font-semibold mb-4">Editar Perfil</h2>
            <FormContent />
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
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export { UserProfileModal };
