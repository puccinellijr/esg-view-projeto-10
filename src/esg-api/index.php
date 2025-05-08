
<?php
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html>
<head>
    <title>API ESG - Documentação</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1, h2 {
            color: #0066cc;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>API de Indicadores ESG</h1>
        <p>Bem-vindo à documentação da API de indicadores ESG. Esta API fornece dados comparativos de indicadores ESG para diferentes terminais e períodos.</p>
        
        <h2>Endpoint Principal</h2>
        <code>GET /esg-api/get_esg_data.php</code>
        
        <h2>Parâmetros</h2>
        <table>
            <tr>
                <th>Parâmetro</th>
                <th>Descrição</th>
                <th>Valores Permitidos</th>
                <th>Padrão</th>
            </tr>
            <tr>
                <td>terminal</td>
                <td>O terminal para buscar os dados</td>
                <td>Rio Grande, São Paulo</td>
                <td>Rio Grande</td>
            </tr>
            <tr>
                <td>mes1</td>
                <td>Mês do primeiro período</td>
                <td>1-12</td>
                <td>1</td>
            </tr>
            <tr>
                <td>ano1</td>
                <td>Ano do primeiro período</td>
                <td>2020-2025</td>
                <td>2020</td>
            </tr>
            <tr>
                <td>mes2</td>
                <td>Mês do segundo período</td>
                <td>1-12</td>
                <td>1</td>
            </tr>
            <tr>
                <td>ano2</td>
                <td>Ano do segundo período</td>
                <td>2020-2025</td>
                <td>2021</td>
            </tr>
        </table>
        
        <h2>Exemplo de Uso</h2>
        <code>/esg-api/get_esg_data.php?terminal=Rio%20Grande&mes1=1&ano1=2020&mes2=6&ano2=2020</code>
        
        <h2>Formato de Resposta</h2>
        <pre>
{
  "environmental": {
    "litro_tm": { "value1": 25.5, "value2": 27.8 },
    "kg_tm": { "value1": 15.3, "value2": 14.2 },
    "kwh_tm": { "value1": 350.2, "value2": 380.5 },
    "litro_combustivel_tm": { "value1": 45.8, "value2": 52.3 },
    "residuo_tm": { "value1": 8.9, "value2": 7.6 }
  },
  "governance": {
    "denuncia_corrupcao": { "value1": 2, "value2": 1 },
    "reclamacao_vizinho": { "value1": 5, "value2": 3 },
    "incidente_cibernetico": { "value1": 1, "value2": 0 }
  },
  "social": {
    "incidente": { "value1": 4, "value2": 3 },
    "acidente": { "value1": 2, "value2": 1 },
    "denuncia_discriminacao": { "value1": 1, "value2": 0 },
    "mulher_trabalho": { "value1": 35, "value2": 38 }
  }
}
        </pre>
        
        <h2>Status do Banco de Dados</h2>
        <?php
        // Teste de conexão com o banco de dados
        $host = "localhost";
        $db_name = "esg_data";
        $username = "root";
        $password = "";

        try {
            $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "<p style='color:green;'>✓ Conexão com o banco de dados estabelecida com sucesso!</p>";
            
            // Verificar se as tabelas existem
            $tables = [
                "dimensao_ambiental_rg", 
                "dimensao_governanca_rg", 
                "dimensao_social_rg",
                "dimensao_ambiental_sp",
                "dimensao_governanca_sp",
                "dimensao_social_sp"
            ];
            
            echo "<h3>Verificação das tabelas:</h3>";
            echo "<ul>";
            
            foreach ($tables as $table) {
                $stmt = $conn->prepare("SHOW TABLES LIKE :table");
                $stmt->bindParam(':table', $table);
                $stmt->execute();
                
                if ($stmt->rowCount() > 0) {
                    echo "<li style='color:green;'>✓ Tabela {$table} existe</li>";
                } else {
                    echo "<li style='color:red;'>✗ Tabela {$table} não encontrada</li>";
                }
            }
            
            echo "</ul>";
            
        } catch(PDOException $e) {
            echo "<p style='color:red;'>✗ Erro na conexão com o banco de dados: " . $e->getMessage() . "</p>";
            echo "<p>Certifique-se de que:</p>";
            echo "<ul>";
            echo "<li>O serviço MySQL está ativo</li>";
            echo "<li>O banco de dados 'esg_data' foi criado</li>";
            echo "<li>O usuário 'root' tem acesso ao banco de dados</li>";
            echo "</ul>";
        }
        ?>
        
        <h2>Próximos passos</h2>
        <p>Se todos os testes estiverem passando, a API está pronta para uso. Caso contrário, verifique os seguintes itens:</p>
        <ol>
            <li>Certifique-se de que o MySQL está em execução no XAMPP</li>
            <li>Importe o arquivo 'esg_database.sql' para criar o banco de dados e as tabelas</li>
            <li>Verifique se as permissões do usuário estão corretas</li>
        </ol>
    </div>
</body>
</html>
