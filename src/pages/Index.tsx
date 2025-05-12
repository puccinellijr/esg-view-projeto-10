
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
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        // Testar conexão com Supabase
        console.log("Testando conexão com Supabase...");
        const isConnected = await testSupabaseConnection();
        
        if (!isConnected) {
          console.error("Falha na conexão com Supabase");
          setConnectionDetails(`Verifique suas credenciais do Supabase em src/lib/supabase.ts e confirme que o projeto está online.`);
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
        const errorMessage = (err as Error).message || "Erro ao inicializar o sistema";
        setError(errorMessage);
        toast.error(errorMessage);
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
          {connectionDetails && <p className="mt-2 text-sm">{connectionDetails}</p>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Problemas comuns e soluções:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Erro de política RLS:</strong> Seu projeto Supabase pode estar com políticas de Row Level Security mal configuradas. Acesse o painel do Supabase, vá para a tabela <code>user_profiles</code> e revise as políticas.
            </li>
            <li>
              <strong>Credenciais inválidas:</strong> Verifique se URL e chave anônima do Supabase estão corretas em <code>src/lib/supabase.ts</code>
            </li>
            <li>
              <strong>Tabelas não existem:</strong> Confirme que as tabelas necessárias foram criadas:
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>user_profiles - para armazenar dados dos usuários</li>
                <li>esg_indicators - para armazenar indicadores ESG</li>
              </ul>
            </li>
            <li>
              <strong>Usuário administrador:</strong> É necessário ter pelo menos um usuário administrador criado:
              <ol className="list-decimal pl-5 mt-1 text-sm">
                <li>Crie um usuário no Authentication do Supabase</li>
                <li>Adicione o mesmo ID na tabela user_profiles</li>
                <li>Configure access_level como "administrative"</li>
              </ol>
            </li>
          </ul>
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Instruções detalhadas:</strong><br />
              1. Acesse seu projeto no painel do Supabase<br />
              2. Verifique se as tabelas existem em "Table Editor"<br />
              3. Em "Authentication", crie um usuário (ex: admin@exemplo.com)<br />
              4. Adicione esse usuário à tabela user_profiles com o mesmo ID<br />
              5. Copie a URL e chave anônima do projeto em "Settings > API"
            </p>
          </div>
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
