
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    // Verify if the token is valid
    if (!token || !email) {
      toast.error("Link de redefinição de senha inválido ou expirado");
      navigate("/login");
      return;
    }

    const storedToken = sessionStorage.getItem(`reset_${email}`);
    
    if (storedToken !== token) {
      toast.error("Link de redefinição de senha inválido ou expirado");
      navigate("/login");
      return;
    }
    
    setIsValid(true);
  }, [token, email, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    // In a real application, we would send the new password to a server
    // For this demo, we'll update our mock user's password in session storage
    const users = [
      { email: "admin@example.com", password: "admin123", accessLevel: "administrative" },
      { email: "viewer@example.com", password: "viewer123", accessLevel: "viewer" },
      { email: "operator@example.com", password: "operator123", accessLevel: "operational" }
    ];
    
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex !== -1) {
      // In a real app, we would update the user in the database
      // For this demo, we'll just show a success message
      setIsReset(true);
      
      // Remove the reset token as it's been used
      sessionStorage.removeItem(`reset_${email}`);
      
      toast.success("A senha foi redefinida com sucesso");
      
      // Automatically redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      toast.error("Falha ao redefinir a senha. Usuário não encontrado.");
    }
  };

  if (!isValid) {
    return null; // Don't render anything if the token is invalid
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-lg">
        <div className="flex justify-center p-6 border-b">
          <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
        </div>
        <CardContent className="pt-6">
          {!isReset ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold text-center text-black">Redefinir Sua Senha</h1>
              <p className="text-center text-black mb-4">
                Por favor, digite sua nova senha abaixo.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-black">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-300 pr-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-custom-blue text-white hover:bg-custom-blue/90">
                Redefinir Senha
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-custom-blue hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <Alert className="bg-green-50 text-black border-green-200">
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-custom-blue hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
