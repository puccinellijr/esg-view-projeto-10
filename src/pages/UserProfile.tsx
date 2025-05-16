
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';

const UserProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form when user data is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhotoUrl(user.photoUrl || "");
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Atualizando perfil com dados:", {
        name, 
        photoUrl,
        ...(newPassword ? { password: newPassword } : {})
      });
      
      const success = await updateUserProfile({
        name,
        photoUrl,
        ...(newPassword ? { password: newPassword } : {}),
      });
      
      if (success) {
        toast.success("Perfil atualizado com sucesso");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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
  
  if (!user) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando perfil...</h2>
        </div>
      </div>
    );
  }
  
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
                  <ImageUpload
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    name={name}
                    email={email}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessLevel">Nível de Acesso</Label>
                    <Input
                      id="accessLevel"
                      value={user?.accessLevel === "administrative" ? "Administrativo" : 
                             user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"}
                      readOnly
                      disabled={isLoading}
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
                      placeholder="Digite sua nova senha"
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    Sair
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
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
