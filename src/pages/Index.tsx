
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        console.log("Index: Verificando usuário para redirecionamento");
        console.log("Estado de inicialização:", isInitialized);
        console.log("Usuário atual:", user);
        
        // Aguardar inicialização do contexto de autenticação
        if (!isInitialized) {
          console.log("Contexto de autenticação ainda não inicializado, aguardando...");
          return; // Não fazer nada até que esteja inicializado
        }
        
        // Verificação simples - usuário já está logado?
        if (user) {
          console.log("Usuário já logado, redirecionando para dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Redirecionamento básico para login se não estiver logado
        console.log("Usuário não logado, redirecionando para login");
        navigate("/login");
      } catch (err) {
        console.error("Erro ao verificar estado:", err);
        setError(`Erro ao inicializar: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    // Executar somente quando isInitialized mudar
    checkAndRedirect();
  }, [navigate, user, isInitialized]);

  // Mostrar tela de carregamento ou erro
  if (!isInitialized || loading) {
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
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Problemas comuns e soluções:</h2>
          <ul className="list-disc pl-5 space-y-2">
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
              <strong>Problemas de rede:</strong> Verifique sua conexão com a internet.
            </li>
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

  // Não mostra nada durante redirecionamento
  return null;
}
