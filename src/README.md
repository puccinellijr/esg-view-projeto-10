
# ESG Visualizador - Configuração para XAMPP

Este projeto consiste em uma aplicação web para visualização e comparação de indicadores ESG (Environmental, Social, Governance) entre diferentes períodos e terminais, com integração direta ao XAMPP e banco de dados MySQL.

## Requisitos

- XAMPP 7.4 ou superior (com Apache e MySQL)
- Navegador web moderno (Chrome, Firefox, Edge, etc.)

## Estrutura do Projeto

- `esg-api`: Contém os arquivos PHP que formam a API de backend
- `esg-app`: Contém os arquivos da aplicação frontend React
- `esg_database.sql`: Script SQL para criação das tabelas necessárias

## Instruções de Instalação

### 1. Configuração do Banco de Dados

1. Inicie o XAMPP e ative os serviços Apache e MySQL
2. Acesse o phpMyAdmin (http://localhost/phpmyadmin)
3. Crie um novo banco de dados chamado `esg_data`
4. Importe o arquivo `esg_database.sql` para criar as tabelas necessárias

### 2. Instalação da API

1. Copie a pasta `esg-api` para dentro do diretório `htdocs` do seu XAMPP
   - Geralmente em `C:\xampp\htdocs\` (Windows) ou `/opt/lampp/htdocs/` (Linux)
2. Verifique se a API está funcionando acessando `http://localhost/esg-api/`
   - Você deverá ver uma página de documentação da API

### 3. Instalação da Aplicação Frontend

#### Opção 1: Usando arquivos pré-compilados
1. Copie a pasta `esg-app` para dentro do diretório `htdocs` do XAMPP
2. Acesse a aplicação através de `http://localhost/esg-app/`

#### Opção 2: Compilando o código-fonte
1. Certifique-se de ter o Node.js instalado (versão 14.0 ou superior)
2. Navegue até a pasta do projeto e execute `npm install`
3. Execute `npm run build`
4. Copie o conteúdo da pasta `dist` para `htdocs/esg-app/`

## Uso da Aplicação

1. Selecione o terminal desejado (Rio Grande ou São Paulo)
2. Escolha os períodos para comparação
3. Clique em "Comparar" para visualizar os indicadores
4. Explore os diferentes gráficos e métricas disponíveis

## Estrutura do Banco de Dados

O sistema utiliza 6 tabelas no MySQL:

- `dimensao_ambiental_rg`: Indicadores ambientais do terminal Rio Grande
- `dimensao_governanca_rg`: Indicadores de governança do terminal Rio Grande
- `dimensao_social_rg`: Indicadores sociais do terminal Rio Grande
- `dimensao_ambiental_sp`: Indicadores ambientais do terminal São Paulo
- `dimensao_governanca_sp`: Indicadores de governança do terminal São Paulo
- `dimensao_social_sp`: Indicadores sociais do terminal São Paulo

## Personalizações

### Configuração da Conexão com o Banco de Dados

Se necessário, você pode modificar as configurações de conexão com o banco de dados no arquivo `esg-api/get_esg_data.php`:

```php
$host = "localhost";      // Servidor MySQL
$db_name = "esg_data";    // Nome do banco de dados
$username = "root";       // Nome de usuário
$password = "";           // Senha
```

### Modo de Desenvolvimento

Para ativar o modo de desenvolvimento e usar dados simulados em vez do banco de dados MySQL, altere a seguinte linha no arquivo `src/services/esgDataService.ts`:

```typescript
const useMockData = true;  // Altere para false para usar a API PHP real
```

## Solução de Problemas

- **Erro "API error"**: Verifique se o Apache está em execução e se a pasta `esg-api` está corretamente instalada
- **Dados não aparecem**: Verifique se o MySQL está em execução e se as tabelas foram criadas corretamente
- **Problema de CORS**: Certifique-se de que está acessando pelo mesmo host (localhost)
- **Erro 404**: Verifique se o arquivo `.htaccess` está presente na pasta `esg-app`
