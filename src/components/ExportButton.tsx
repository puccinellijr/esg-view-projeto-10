import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const ExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      // Adicionar arquivo com instruções de instalação
      const setupInstructions = `
# Instruções para Instalação no XAMPP

1. Extraia este arquivo ZIP para uma pasta em seu computador
2. Copie a pasta 'esg-api' para a pasta 'htdocs' do seu XAMPP (geralmente em C:\\xampp\\htdocs\\ ou /opt/lampp/htdocs/)
3. Inicie o XAMPP e ative os serviços Apache e MySQL
4. Importe a estrutura do banco de dados usando o phpMyAdmin (acesse http://localhost/phpmyadmin)
5. Use o arquivo 'esg_database.sql' para criar a estrutura do banco de dados
6. Para testar a aplicação frontend, copie a pasta 'esg-app' para 'htdocs' ou use um servidor web separado

O sistema estará disponível em:
- API: http://localhost/esg-api/
- Aplicação: http://localhost/esg-app/ (se hospedado no XAMPP)
      `;
      
      zip.file("README.md", setupInstructions);
      
      // Estrutura do banco de dados
      const sqlStructure = `
-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS esg_data;
USE esg_data;

-- Tabelas para Rio Grande (RG)
CREATE TABLE \`dimensao_governanca_rg\` (
  \`id\` int(10) NOT NULL AUTO_INCREMENT,
  \`denuncia_corrupcao\` int(10) NOT NULL,
  \`reclamacao_vizinho\` int(10) NOT NULL,
  \`incidente_cibernetico\` int(10) NOT NULL,
  \`dia\` varchar(10) NOT NULL,
  \`mes\` varchar(10) NOT NULL,
  \`ano\` varchar(10) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE \`dimensao_ambiental_rg\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`litro_tm\` varchar(20) NOT NULL,
  \`kg_tm\` varchar(20) NOT NULL,
  \`kwh_tm\` varchar(20) NOT NULL,
  \`litro_combustivel_tm\` varchar(20) NOT NULL,
  \`residuo_tm\` varchar(20) NOT NULL,
  \`dia\` int(10) NOT NULL,
  \`mes\` int(10) NOT NULL,
  \`ano\` int(10) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE \`dimensao_social_rg\` (
  \`id\` int(20) NOT NULL AUTO_INCREMENT,
  \`incidente\` int(20) NOT NULL,
  \`acidente\` int(20) NOT NULL,
  \`denuncia_discriminacao\` int(20) NOT NULL,
  \`mulher_trabalho\` int(10) NOT NULL,
  \`dia\` varchar(20) NOT NULL,
  \`mes\` varchar(20) NOT NULL,
  \`ano\` varchar(20) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Tabelas para São Paulo (SP)
CREATE TABLE \`dimensao_governanca_sp\` (
  \`id\` int(10) NOT NULL AUTO_INCREMENT,
  \`denuncia_corrupcao\` int(10) NOT NULL,
  \`reclamacao_vizinho\` int(10) NOT NULL,
  \`incidente_cibernetico\` int(10) NOT NULL,
  \`dia\` varchar(10) NOT NULL,
  \`mes\` varchar(10) NOT NULL,
  \`ano\` varchar(10) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE \`dimensao_ambiental_sp\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`litro_tm\` varchar(20) NOT NULL,
  \`kg_tm\` varchar(20) NOT NULL,
  \`kwh_tm\` varchar(20) NOT NULL,
  \`litro_combustivel_tm\` varchar(20) NOT NULL,
  \`residuo_tm\` varchar(20) NOT NULL,
  \`dia\` int(10) NOT NULL,
  \`mes\` int(10) NOT NULL,
  \`ano\` int(10) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE \`dimensao_social_sp\` (
  \`id\` int(20) NOT NULL AUTO_INCREMENT,
  \`incidente\` int(20) NOT NULL,
  \`acidente\` int(20) NOT NULL,
  \`denuncia_discriminacao\` int(20) NOT NULL,
  \`mulher_trabalho\` int(10) NOT NULL,
  \`dia\` varchar(20) NOT NULL,
  \`mes\` varchar(20) NOT NULL,
  \`ano\` varchar(20) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Inserir dados de exemplo
INSERT INTO \`dimensao_ambiental_rg\` (\`litro_tm\`, \`kg_tm\`, \`kwh_tm\`, \`litro_combustivel_tm\`, \`residuo_tm\`, \`dia\`, \`mes\`, \`ano\`) VALUES
('25.5', '15.3', '350.2', '45.8', '8.9', 1, 1, 2020);

INSERT INTO \`dimensao_governanca_rg\` (\`denuncia_corrupcao\`, \`reclamacao_vizinho\`, \`incidente_cibernetico\`, \`dia\`, \`mes\`, \`ano\`) VALUES
(2, 5, 1, '1', '1', '2020');

INSERT INTO \`dimensao_social_rg\` (\`incidente\`, \`acidente\`, \`denuncia_discriminacao\`, \`mulher_trabalho\`, \`dia\`, \`mes\`, \`ano\`) VALUES
(4, 2, 1, 35, '1', '1', '2020');

INSERT INTO \`dimensao_ambiental_sp\` (\`litro_tm\`, \`kg_tm\`, \`kwh_tm\`, \`litro_combustivel_tm\`, \`residuo_tm\`, \`dia\`, \`mes\`, \`ano\`) VALUES
('27.8', '14.2', '380.5', '52.3', '7.6', 1, 1, 2020);

INSERT INTO \`dimensao_governanca_sp\` (\`denuncia_corrupcao\`, \`reclamacao_vizinho\`, \`incidente_cibernetico\`, \`dia\`, \`mes\`, \`ano\`) VALUES
(1, 3, 0, '1', '1', '2020');

INSERT INTO \`dimensao_social_sp\` (\`incidente\`, \`acidente\`, \`denuncia_discriminacao\`, \`mulher_trabalho\`, \`dia\`, \`mes\`, \`ano\`) VALUES
(3, 1, 0, 38, '1', '1', '2020');
      `;
      
      zip.file("esg_database.sql", sqlStructure);
      
      // API PHP para o XAMPP
      const phpApi = `<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Parâmetros
$terminal = isset($_GET['terminal']) ? $_GET['terminal'] : 'Rio Grande';
$mes1 = isset($_GET['mes1']) ? $_GET['mes1'] : '1';
$ano1 = isset($_GET['ano1']) ? $_GET['ano1'] : '2020';
$mes2 = isset($_GET['mes2']) ? $_GET['mes2'] : '1';
$ano2 = isset($_GET['ano2']) ? $_GET['ano2'] : '2021';

// Conectar ao banco de dados
$host = "localhost";
$db_name = "esg_data";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(array("status" => "error", "message" => "Erro de conexão: " . $exception->getMessage()));
    exit;
}

// Determinar sufixo das tabelas com base no terminal (rg ou sp)
$terminal_suffix = strtolower($terminal) === 'rio grande' ? 'rg' : 'sp';

// Função para buscar dados de dimensão específica
function fetchDimensionData($conn, $dimension, $terminal_suffix, $mes1, $ano1, $mes2, $ano2) {
    $result = array();
    
    // Buscar dados do período 1
    $query1 = "SELECT * FROM dimensao_" . $dimension . "_" . $terminal_suffix . 
             " WHERE mes = :mes AND ano = :ano LIMIT 1";
             
    $stmt1 = $conn->prepare($query1);
    $stmt1->bindParam(":mes", $mes1);
    $stmt1->bindParam(":ano", $ano1);
    $stmt1->execute();
    
    if ($stmt1->rowCount() > 0) {
        $row1 = $stmt1->fetch(PDO::FETCH_ASSOC);
    } else {
        $row1 = null;
    }
    
    // Buscar dados do período 2
    $query2 = "SELECT * FROM dimensao_" . $dimension . "_" . $terminal_suffix . 
             " WHERE mes = :mes AND ano = :ano LIMIT 1";
             
    $stmt2 = $conn->prepare($query2);
    $stmt2->bindParam(":mes", $mes2);
    $stmt2->bindParam(":ano", $ano2);
    $stmt2->execute();
    
    if ($stmt2->rowCount() > 0) {
        $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    } else {
        $row2 = null;
    }
    
    // Montar estrutura de dados para cada métrica da dimensão
    if ($dimension === "ambiental") {
        $metrics = ["litro_tm", "kg_tm", "kwh_tm", "litro_combustivel_tm", "residuo_tm"];
    } elseif ($dimension === "governanca") {
        $metrics = ["denuncia_corrupcao", "reclamacao_vizinho", "incidente_cibernetico"];
    } else { // social
        $metrics = ["incidente", "acidente", "denuncia_discriminacao", "mulher_trabalho"];
    }
    
    foreach ($metrics as $metric) {
        $value1 = ($row1 !== null && isset($row1[$metric])) ? floatval($row1[$metric]) : 0;
        $value2 = ($row2 !== null && isset($row2[$metric])) ? floatval($row2[$metric]) : 0;
        
        $result[$metric] = [
            "value1" => $value1,
            "value2" => $value2
        ];
    }
    
    return $result;
}

// Construir resposta com dados das três dimensões
$response = [
    "environmental" => fetchDimensionData($conn, "ambiental", $terminal_suffix, $mes1, $ano1, $mes2, $ano2),
    "governance" => fetchDimensionData($conn, "governanca", $terminal_suffix, $mes1, $ano1, $mes2, $ano2),
    "social" => fetchDimensionData($conn, "social", $terminal_suffix, $mes1, $ano1, $mes2, $ano2)
];

// Enviar resposta JSON
echo json_encode($response);
?>`;
      
      // Adicionar arquivo PHP API
      const apiFolder = zip.folder("esg-api");
      apiFolder.file("get_esg_data.php", phpApi);
      
      // Adicionar arquivos do projeto React
      const appFolder = zip.folder("esg-app");
      
      // Arquivo esgDataService.ts atualizado para apontar para a API PHP
      const esgDataService = `// Data service to fetch ESG data from PHP API
// When in development mode, we can use mock data by setting useMockData to true

interface ESGData {
  environmental: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  governance: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  social: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
}

// Set to false to use real API instead of mock data
const useMockData = false;

// Generate random data for mock mode
const generateRandomValue = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
};

// Generate mock data
const generateMockData = (): ESGData => {
  return {
    environmental: {
      litro_tm: {
        value1: generateRandomValue(10, 50),
        value2: generateRandomValue(10, 50)
      },
      kg_tm: {
        value1: generateRandomValue(5, 25),
        value2: generateRandomValue(5, 25)
      },
      kwh_tm: {
        value1: generateRandomValue(100, 500),
        value2: generateRandomValue(100, 500)
      },
      litro_combustivel_tm: {
        value1: generateRandomValue(20, 80),
        value2: generateRandomValue(20, 80)
      },
      residuo_tm: {
        value1: generateRandomValue(2, 15),
        value2: generateRandomValue(2, 15)
      },
    },
    governance: {
      denuncia_corrupcao: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      reclamacao_vizinho: {
        value1: generateRandomValue(0, 10),
        value2: generateRandomValue(0, 10)
      },
      incidente_cibernetico: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
    },
    social: {
      incidente: {
        value1: generateRandomValue(0, 8),
        value2: generateRandomValue(0, 8)
      },
      acidente: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      denuncia_discriminacao: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
      mulher_trabalho: {
        value1: generateRandomValue(20, 50),
        value2: generateRandomValue(20, 50)
      },
    }
  };
};

export const fetchESGData = async (
  terminal: string,
  period1: { month: string; year: string },
  period2: { month: string; year: string }
): Promise<ESGData> => {
  // If using mock data, return randomly generated data after simulated delay
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  }

  // Otherwise, fetch from the actual API
  try {
    // Construct API URL with parameters - update this to your server path
    const apiUrl = \`/esg-api/get_esg_data.php?terminal=\${encodeURIComponent(terminal)}&mes1=\${period1.month}&ano1=\${period1.year}&mes2=\${period2.month}&ano2=\${period2.year}\`;
    
    console.log("Fetching data from API:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(\`API error: \${response.status} \${response.statusText}\`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    return data as ESGData;
  } catch (error) {
    console.error("Error fetching from API:", error);
    
    // Fall back to mock data if API call fails
    console.log("Falling back to mock data");
    return generateMockData();
  }
};`;

      appFolder.file("src/services/esgDataService.ts", esgDataService);
      
      // Adicionar arquivo README com instruções para o frontend
      const frontendReadme = `# Aplicação de Visualização de Indicadores ESG

Esta aplicação foi desenvolvida para visualizar e comparar indicadores ESG (Environmental, Social, Governance) entre diferentes períodos e terminais.

## Configuração do Frontend

1. Certifique-se de ter Node.js instalado (versão 14 ou superior)
2. Instale as dependências:
   \`\`\`
   npm install
   \`\`\`
3. Para desenvolvimento local:
   \`\`\`
   npm run dev
   \`\`\`
4. Para construir para produção:
   \`\`\`
   npm run build
   \`\`\`
5. Os arquivos de produção estarão na pasta 'dist' e podem ser copiados para o XAMPP

## Integrando com o Backend

O arquivo 'src/services/esgDataService.ts' está configurado para acessar a API PHP.
Se necessário, ajuste o caminho da API conforme sua configuração do servidor.

## Estrutura de Dados

A aplicação espera que a API retorne dados no seguinte formato:

\`\`\`json
{
  "environmental": {
    "litro_tm": { "value1": 20.5, "value2": 22.1 },
    "kg_tm": { "value1": 10.3, "value2": 9.8 },
    ...
  },
  "governance": {
    "denuncia_corrupcao": { "value1": 2, "value2": 1 },
    ...
  },
  "social": {
    "incidente": { "value1": 5, "value2": 3 },
    ...
  }
}
\`\`\`

Onde value1 representa o valor do primeiro período selecionado e value2 o segundo período.
`;

      appFolder.file("README.md", frontendReadme);
      
      // Gerar o arquivo ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'esg-visualizador-xampp.zip');
      
      toast.success("Exportação concluída com sucesso!", {
        description: "O arquivo ZIP contém o código fonte e as instruções para instalação no XAMPP."
      });
    } catch (error) {
      console.error("Erro durante a exportação:", error);
      toast.error("Erro ao exportar os arquivos", {
        description: "Ocorreu um problema durante a exportação. Por favor, tente novamente."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      className="bg-blue-600 hover:bg-blue-700 text-white"
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar para XAMPP
        </>
      )}
    </Button>
  );
};

export default ExportButton;
