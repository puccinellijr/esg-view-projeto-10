
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { AccessLevel } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { useIsMobile } from '@/hooks/use-mobile';
import { createUserProfile } from '@/services/userProfileService';

const CreateUser = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("viewer");
  const [photoUrl, setPhotoUrl] = useState("");
  const [terminal, setTerminal] = useState("Rio Grande");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await createUserProfile(
        {
          email,
          accessLevel,
          name,
          photoUrl,
          terminal
        },
        password
      );
      
      if (result.success) {
        toast.success(`Usuário ${name} criado com sucesso para o terminal ${terminal}`);
        navigate("/settings/users");
      } else {
        toast.error(`Erro ao criar usuário: ${result.error?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <DashboardSidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        
        <div className="container py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Cadastrar Novo Usuário</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
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
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do usuário"
                      required
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
                      placeholder="email@exemplo.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a senha"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessLevel">Nível de Acesso</Label>
                    <Select
                      value={accessLevel}
                      onValueChange={(value) => setAccessLevel(value as AccessLevel)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="accessLevel">
                        <SelectValue placeholder="Selecione o nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                        <SelectItem value="administrative">Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="terminal">Terminal</Label>
                    <Select
                      value={terminal}
                      onValueChange={(value) => setTerminal(value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="terminal">
                        <SelectValue placeholder="Selecione o terminal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                        <SelectItem value="Alemoa">Alemoa</SelectItem>
                        <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/settings/users")}
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Criar Usuário"}
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

export default CreateUser;
