
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const { user, updateUserProfile } = useAuth();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setPhotoUrl(user.photoUrl || "");
    }
  }, [user, isOpen]); // Reset form when modal is opened
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Atualizando perfil com dados:", {
        name,
        photoUrl,
      });
      
      // Atualizar usuário incluindo todos os dados necessários
      const updated = await updateUserProfile({
        name,
        photoUrl,
      });
      
      if (updated) {
        toast.success("Perfil atualizado com sucesso");
        onClose();
      } else {
        toast.error("Erro ao atualizar perfil");
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
          email={user?.email}
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
            autoFocus
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
