
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export type AccessLevel = "operational" | "viewer" | "administrative";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Validação básica
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Tentando login com email: ${email}`);
      
      const success = await login(email, password);
      
      if (success) {
        console.log('Login bem-sucedido!');
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else {
        console.error('Login falhou: credenciais inválidas');
        toast.error("Email ou senha inválidos");
        setErrorMessage("Email ou senha inválidos. Por favor, verifique suas credenciais e tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login");
      setErrorMessage("Ocorreu um erro durante o login. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-lg">
        <div className="flex justify-center p-6 border-b">
          <img src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" alt="Logo" className="h-16 object-contain" />
        </div>
        <CardContent className="pt-6">
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300"
                required
                disabled={isLoading}
              />
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-custom-blue hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-custom-blue text-white hover:bg-custom-blue/90"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Para usar o sistema, entre em contato com o administrador para criar sua conta.</p>
              <p className="mt-2 text-xs text-gray-500">
                Para configurar o sistema, siga as instruções na tela inicial.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
