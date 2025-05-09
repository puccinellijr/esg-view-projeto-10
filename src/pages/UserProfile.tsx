
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    try {
      await updateUserProfile({
        name,
        email,
        photoUrl,
        ...(newPassword ? { password: newPassword } : {}),
      });
      
      toast.success("Perfil atualizado com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };
  
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <DashboardSidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        
        <div className="container py-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={photoUrl} alt={name || email} />
                    <AvatarFallback className="bg-blue-500 text-white text-xl">{getInitials(name, email)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">URL da Foto</Label>
                    <Input
                      id="photoUrl"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessLevel">Nível de Acesso</Label>
                    <Input
                      id="accessLevel"
                      value={user?.accessLevel === "administrative" ? "Administrativo" : 
                             user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"}
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <h3 className="text-lg font-medium">Alterar Senha</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 mt-4 border-t">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => {
                      logout();
                      toast.success("Desconectado com sucesso");
                    }}
                  >
                    Sair
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
