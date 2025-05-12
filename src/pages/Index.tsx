
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        // Testar conexão com Supabase
        console.log("Testando conexão com Supabase...");
        const isConnected = await testSupabaseConnection();
        
        if (!isConnected) {
          console.error("Falha na conexão com Supabase");
          toast.error("Erro de conexão com o banco de dados");
          setError("Falha na conexão com o banco de dados");
          return;
        }

        // Verificar se há sessão ativa
        console.log("Verificando sessão...");
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Sessão:", sessionData?.session ? "Ativa" : "Inativa");
        
        // Se usuário está logado, redirecionar para dashboard
        if (user) {
          console.log("Usuário logado, redirecionando para dashboard");
          navigate("/dashboard");
        } else {
          // Caso contrário, redirecionar para login
          console.log("Usuário não logado, redirecionando para login");
          navigate("/login");
        }
      } catch (err) {
        console.error("Erro ao verificar sistema:", err);
        setError("Erro ao inicializar o sistema");
        toast.error("Erro ao inicializar o sistema");
      } finally {
        setLoading(false);
      }
    };

    checkSystem();
  }, [navigate, user]);

  // Mostrar tela de carregamento ou erro
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        <p className="mt-4 text-gray-600">Inicializando sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          <p className="font-bold">Erro ao inicializar o sistema</p>
          <p>{error}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Dicas de solução:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente</li>
            <li>Confirme que o banco de dados Supabase está acessível</li>
            <li>As tabelas necessárias foram criadas no Supabase?</li>
          </ul>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-custom-blue text-white px-4 py-2 rounded hover:bg-custom-blue/80"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return null; // Não mostra nada durante redirecionamento
}
