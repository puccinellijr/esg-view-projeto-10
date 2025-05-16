import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if email is valid
      if (!email || !email.includes('@')) {
        toast({
          title: "Erro",
          description: "Por favor, informe um email válido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Send password reset email using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Error sending reset email:", error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao enviar email de redefinição",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setIsSubmitted(true);
      toast({
        title: "Sucesso",
        description: "Instruções de redefinição de senha foram enviadas para seu email"
      });
      
    } catch (error) {
      console.error("Exception during password reset:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-sidebar to-sidebar/70 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-lg">
        <div className="flex justify-center p-6 border-b">
          <img src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" alt="Logo" className="h-16 object-contain" />
        </div>
        <CardContent className="pt-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold text-center text-black">Redefinir Sua Senha</h1>
              <p className="text-center text-black mb-4">
                Digite seu endereço de email e enviaremos instruções para redefinir sua senha.
              </p>
              
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
              
              <Button 
                type="submit" 
                className="w-full bg-custom-blue text-white hover:bg-custom-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Instruções de Redefinição"}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-custom-blue hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <Alert className="bg-blue-50 text-black border-blue-200">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Instruções de redefinição de senha foram enviadas para <strong>{email}</strong>. 
                  Por favor, verifique seu email e siga as instruções.
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
