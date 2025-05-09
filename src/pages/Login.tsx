import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

// Define user access levels
export type AccessLevel = "operational" | "viewer" | "administrative";

// Mock users for demonstration with names and photos
const users = [
  { 
    email: "admin@example.com", 
    password: "admin123", 
    accessLevel: "administrative" as AccessLevel,
    name: "Admin User",
    photoUrl: "https://i.pravatar.cc/150?u=admin@example.com"
  },
  { 
    email: "viewer@example.com", 
    password: "viewer123", 
    accessLevel: "viewer" as AccessLevel,
    name: "Viewer User",
    photoUrl: "https://i.pravatar.cc/150?u=viewer@example.com"
  },
  { 
    email: "operator@example.com", 
    password: "operator123", 
    accessLevel: "operational" as AccessLevel,
    name: "Operator User",
    photoUrl: "https://i.pravatar.cc/150?u=operator@example.com"
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    
    if (user) {
      // Use the login function from AuthContext
      login({
        email: user.email,
        accessLevel: user.accessLevel,
        name: user.name,
        photoUrl: user.photoUrl
      });
      
      toast.success(`Bem-vindo, ${user.name}! Você está conectado com acesso ${user.accessLevel === "administrative" ? "administrativo" : user.accessLevel === "viewer" ? "visualizador" : "operacional"}`);
      
      // Always redirect to dashboard for all user types
      navigate("/dashboard");
    } else {
      toast.error("Email ou senha inválidos");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-lg">
        <div className="flex justify-center p-6 border-b">
          <img src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" alt="Logo" className="h-16 object-contain" />
        </div>
        <CardContent className="pt-6">
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
              />
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-custom-blue hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-custom-blue text-white hover:bg-custom-blue/90">
              Entrar
            </Button>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Contas de demonstração:</p>
              <p>admin@example.com / admin123 (Administrativo)</p>
              <p>viewer@example.com / viewer123 (Visualizador)</p>
              <p>operator@example.com / operator123 (Operacional)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
