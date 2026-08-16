# 🚀 EfficiencIA

 Plataforma inteligente para validação, análise e otimização de fluxos de processos de negócios (BPMN) utilizando Inteligência Artificial.


---

## 📋 Sobre o projeto

O **EfficiencIA** é uma plataforma desenvolvida para gerenciar, analisar e otimizar processos de negócios. O sistema permite que usuários criem projetos, façam upload ou modelem fluxos BPMN e submetam esses fluxos a uma análise aprofundada realizada por um agente de Inteligência Artificial.

> **Arquitetura e desenvolvimento:** Este projeto foi concebido seguindo a metodologia **Spec-Driven Design (SDD)**, utilizando a plataforma **Lovable** como base para a definição e evolução das especificações. O desenvolvimento é orientado por especificações funcionais e técnicas, garantindo maior consistência entre requisitos, implementação e evolução do sistema.

A plataforma combina modelagem BPMN, análise automatizada e recursos de Inteligência Artificial para ajudar profissionais a identificar problemas e oportunidades de melhoria em seus processos.

### 🎯 O que o projeto faz?

O EfficiencIA analisa diagramas BPMN para identificar:

* Gargalos operacionais;
* Possíveis erros de modelagem;
* Ineficiências nos processos;
* Oportunidades de automação;

### 👥 Para quem foi desenvolvido?

A plataforma foi pensada principalmente para:

* Analistas de processos;
* Analistas de negócios;
* Gestores de operações;
* Profissionais de BPM;

### 💡 Qual problema resolve?

A análise manual de processos pode ser demorada e está sujeita a erros. Em diagramas BPMN complexos, identificar gargalos, problemas de modelagem e oportunidades de melhoria pode exigir bastante tempo e conhecimento especializado.

O EfficiencIA busca automatizar parte desse trabalho utilizando Inteligência Artificial para fornecer uma análise estruturada do processo.

### ⭐ Principais diferenciais

* Integração com agente de Inteligência Artificial através do **n8n**;
* Análise automatizada de processos;
* Identificação de gargalos e oportunidades de melhoria;
* Arquitetura multitenant;
* Isolamento de dados utilizando **Row Level Security (RLS)** no PostgreSQL.

---

## 🎯 Objetivos

Os principais objetivos do EfficiencIA são:

* Permitir a criação e edição de processos diretamente pelo navegador;
* Identificar gargalos e oportunidades de melhoria;
* Gerar avaliações automatizadas dos processos;
* Integrar agentes de Inteligência Artificial através do n8n;

---

## ✨ Funcionalidades

### BPMN

* ✅ Suporte à notação BPMN através do `bpmn-js`.
* ✅ Visualização de diagramas BPMN no navegador;
* ✅ Manipulação e edição de diagramas BPMN;
* ✅ Criação de projetos de processos;
* ✅ Importação de diagramas;

### Inteligência Artificial

* ✅ Avaliação automatizada de processos;
* ✅ Identificação de gargalos;
* ✅ Sugestões de melhoria;
* ✅ Avaliação da qualidade da modelagem;
* ✅ Geração de insights sobre processos;
* ✅ Integração com agente de IA através do n8n;
* ✅ Geração de relatórios PDF;

### Dados e segurança

* ✅ PostgreSQL;
* ✅ Supabase;
* ✅ Row Level Security (RLS);
* ✅ Isolamento de dados entre usuários;
* ✅ Controle de acesso por plano;
* ✅ Senhas protegidas com `bcryptjs`;
* ✅ Tokens de autenticação utilizando JWT.

---

## 📸 Screenshots

### Tela inicial
<a href="https://ibb.co/bMgWZzb5"><img src="https://i.ibb.co/q3MyfkJY/Captura-de-tela-de-2026-08-14-21-02-40.png" alt="Captura-de-tela-de-2026-08-14-21-02-40" border="0"></a>

### Exemplo de Projeto 
<a href="https://ibb.co/N2TkWDQP"><img src="https://i.ibb.co/Jj3br604/Captura-de-tela-de-2026-08-14-21-02-30.png" alt="Captura-de-tela-de-2026-08-14-21-02-30" border="0"></a>


---

## 🛠️ Tecnologias utilizadas

### 🎨 Front-end

* [React 19](https://react.dev/)
* [TanStack](https://tanstack.com/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [Radix UI](https://www.radix-ui.com/)
* [Lucide React](https://lucide.dev/)
* [bpmn-js](https://bpmn.io/toolkit/bpmn-js/)
* TypeScript

### ⚙️ Back-end

* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [TypeScript](https://www.typescriptlang.org/)
* [Zod](https://zod.dev/)
* [JWT](https://jwt.io/)
* [bcryptjs](https://www.npmjs.com/package/bcryptjs)

### 🗄️ Banco de Dados & Cache

* **[PostgreSQL 16](https://www.postgresql.org/)** (Banco de dados relacional principal)
* **[Redis 7](https://redis.io/)** (Cache)
* **[Qdrant](https://qdrant.tech/)** (Banco de dados vetorial para IA)

### 🔌 Inteligência Artificial & Ferramentas

* **[n8n](https://n8n.io/)**: Orquestração de workflows e agentes de IA
* **[Ollama](https://ollama.com/)**: Execução de Modelos de Linguagem (LLM) rodando localmente
* **Docker & Docker Compose**: Gerenciamento integrado e padronizado da infraestrutura

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) `>= 20`
* npm ou yarn
* [Docker](https://www.docker.com/) — opcional
* Uma instância PostgreSQL/Supabase
* Uma instância n8n para processamento das análises de IA

Verifique as versões instaladas:

```bash
git --version
node --version
npm --version
docker --version
```

---

# 🚀 Instalação

O **EfficiencIA** pode ser executado facilmente utilizando **Docker Compose**, que sobe toda a infraestrutura necessária (Frontend, Backend, PostgreSQL, Redis, n8n, Qdrant e Ollama).

## 1. Clone o repositório

```bash
git clone https://github.com/usuario/efficiencia.git
cd efficiencia
```

## 2. Configure as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto utilizando o arquivo de exemplo:

```bash
cp .env.docker.example .env
```

Edite as variáveis conforme necessário para o seu ambiente.

## 3. Inicie toda a stack

Suba todos os serviços com Docker Compose:

```bash
docker compose up -d
```

> 💡 Na primeira inicialização, as **migrations do banco de dados são executadas automaticamente** quando o container do back-end inicia.

## 4. Acompanhe os logs (Opcional)

Para verificar se o back-end iniciou corretamente junto com o banco de dados:

```bash
docker compose logs -f backend
```

## 5. Acesse a aplicação

Após todos os containers estarem em execução, os serviços estarão disponíveis em:

| Serviço | URL |
|---------|-----|
| **Frontend** | `http://localhost:8080` |
| **Backend** | `http://localhost:3000` |
| **n8n** | `http://localhost:5678` |

---

# ⚙️ Arquitetura de Containers

O arquivo `docker-compose.yml` sobe toda a infraestrutura necessária para o funcionamento da plataforma.

## Serviços

| Serviço | Tecnologia | Porta | Propósito |
|---------|------------|:-----:|-----------|
| `frontend` | React + TanStack | `8080` | Interface web da plataforma |
| `backend` | Node.js + Express | `3000` | API principal e regras de negócio |
| `postgres` | PostgreSQL 16 | `5432` | Banco de dados relacional |
| `redis` | Redis 7 | `6379` | Cache e suporte ao orquestrador |
| `n8n` | n8n | `5678` | Orquestração dos agentes de IA |
| `qdrant` | Qdrant | `6333` / `6334` | Banco vetorial para embeddings |
| `ollama` | Ollama | `11434` | Execução local de modelos LLM |

---

# 🔌 Configuração do n8n

O fluxo de análise utiliza o n8n para receber as solicitações enviadas pelo back-end, processar os dados do processo BPMN, interagir com o **Ollama** e, quando necessário, consultar informações armazenadas no **Qdrant**.

## 1. Acesse o n8n

Com a stack Docker em execução, acesse:

```text
http://localhost:5678
```

Na primeira execução, o n8n solicitará a criação da conta de administrador.

## 2. Importe o workflow

1. Acesse **Workflows**;
2. Selecione **Import from File**;
3. Escolha o arquivo [n8n/efficiencIA.json](n8n/efficiencIA.json);
4. Verifique as credenciais e configurações utilizadas pelo workflow;
5. Salve o workflow.

## 3. Configure o Ollama

O n8n utiliza o **Ollama** para executar os modelos de linguagem localmente.

O serviço fica disponível dentro da rede Docker através de:

```text
http://ollama:11434
```

Para verificar se o Ollama está funcionando:

```bash
docker compose logs -f ollama
```

Você também pode verificar os modelos disponíveis:

```bash
docker exec -it ollama ollama list
```

Caso seja necessário baixar um modelo:

```bash
docker exec -it ollama ollama pull <nome-do-modelo>
```

> ⚠️ O modelo utilizado pelo workflow deve estar disponível no container do Ollama antes de executar uma análise.

## 5. Configure o Qdrant

O **Qdrant** é utilizado como banco de dados vetorial para armazenamento e recuperação de embeddings utilizados durante o processo de análise.

O serviço fica disponível na rede Docker através de:

```text
http://qdrant:6333
```

A interface HTTP pode ser acessada localmente através de:

```text
http://localhost:6333
```

## 6. Ative o workflow

Depois de configurar o webhook, Ollama e Qdrant:

1. Abra o workflow de análise BPMN;
2. Verifique as credenciais e variáveis utilizadas;
3. Verifique o nó de Webhook;
4. Verifique a conexão com o Ollama;
5. Verifique a conexão com o Qdrant;
6. Salve o workflow;
7. Ative o workflow.


> ⚠️ **Importante:** não versione credenciais, tokens, senhas ou chaves utilizadas pelo n8n, Ollama, Qdrant ou qualquer outro serviço.

---

# 📖 Como usar

Depois de rodar o **docker-compose**, acesse:

```text
http://localhost:8080
```

## 🔄 Fluxo básico

1. Cadastre-se ou faça login com seu e-mail;
2. Opcionalmente, utilize o login com Google;
3. Crie um novo projeto BPMN;
4. Importe ou desenhe seu diagrama;
5. Configure o processo conforme necessário;
6. Solicite uma **Análise IA**;
7. O back-end enviará os dados do processo para o agente através do n8n;
8. O agente realizará a análise;
9. O resultado será processado pelo back-end;
10. Visualize os gargalos, sugestões e avaliação do processo.

> 💡 O recurso de análise por Inteligência Artificial é destinado aos usuários que possuem acesso ao plano correspondente.

---

# 📁 Estrutura do projeto

O EfficiencIA utiliza uma estrutura de **monorepo**, mantendo front-end e back-end no mesmo repositório.

```text
efficiencia/
├── docker-compose.yml        # Orquestração completa da stack local
├── .env.docker.example       # Modelo de variáveis globais do compose
├── backend/                  # API Express, Node.js e scripts
│   ├── migrations/           # Esquemas SQL e RLS do Postgres
│   ├── src/                  # Controllers, Services e Repositories
│   ├── Dockerfile
│   └── package.json
└── frontend/                 # Interface React / TanStack
    ├── src/
    ├── Dockerfile
    └── package.json
```

---

# 📄 Licença

Este projeto está licenciado sob a
[GNU Affero General Public License v3.0 ou posterior](https://www.gnu.org/licenses/agpl-3.0.html).

Consulte o arquivo [`LICENSE`](LICENSE) para obter o texto completo da licença.

---

# 🤝 Contribuindo

Contribuições são bem-vindas!

Antes de contribuir, certifique-se de que suas alterações estão de acordo com os padrões utilizados pelo projeto especificados no arquivo [CONTRIBUTING.md](CONTRIBUTING.md).

## Convenção de commits

Este projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/).

## Licença das contribuições

Ao contribuir com este projeto, você concorda que suas contribuições
serão disponibilizadas sob os termos da GNU Affero General Public
License v3.0 ou posterior.

---

# ⭐ Apoie o projeto

Se o **EfficiencIA** foi útil para você, considere apoiar o projeto:

* ⭐ Dê uma estrela no repositório;
* 🐛 Reporte problemas;
* 💡 Sugira novas funcionalidades;
* 🤝 Contribua com código;
* 📢 Compartilhe o projeto;
* 📚 Ajude a melhorar a documentação.

Toda contribuição é bem-vinda!

**Obrigado por apoiar o EfficiencIA! ❤️**

---

# 📞 Suporte

Encontrou um problema?

Abra uma [Issue](https://github.com/efficiencia/efficiencia/issues) descrevendo, sempre que possível:

1. O problema encontrado;
2. Como reproduzi-lo;
3. O comportamento esperado;
4. O comportamento atual;
5. Logs ou mensagens de erro;
6. Sistema operacional;
7. Versão do Node.js;
8. Versão do projeto;
9. Passos necessários para reproduzir o problema.

---

# 📚 Documentação

A documentação do projeto pode ser organizada nos seguintes recursos:

* [Documentação principal](README.md)
* [Guia de contribuição](CONTRIBUTING.md)
* [Licença](LICENSE)

# 🚀 Chat API

Uma API backend robusta para gerenciamento de chats, mensagens e usuários, com suporte a comunicação em tempo real via WebSocket e armazenamento de arquivos em nuvem. O frontend da aplicação está disponível no repositório ['FrontChat-api'](https://github.com/Thulio05/FrontChat-api).

## 📋 Sobre o projeto

O **Chat API** é um backend desenvolvido para fornecer a infraestrutura necessária para aplicações de comunicação e chat. O projeto reúne funcionalidades como autenticação, gerenciamento de usuários e chats, envio de mensagens em tempo real e armazenamento de imagens utilizando o Amazon S3.

### Explicação simples

* **O que o projeto faz:** Disponibiliza uma API RESTful e comunicação em tempo real via WebSocket para gerenciamento de usuários, chats e mensagens.
* **Para quem foi desenvolvido:** Desenvolvedores que precisam integrar funcionalidades de chat em aplicações web ou mobile.
* **Qual problema resolve:** Simplifica a implementação de sistemas de comunicação, oferecendo uma estrutura pronta para autenticação, mensagens, persistência e armazenamento de arquivos.
* **Principais diferenciais:** Suporte a WebSocket com Socket.io, armazenamento via Amazon S3, PostgreSQL e MongoDB através do Prisma ORM, além de Docker e CI/CD.

## 🎯 Objetivos

1. Fornecer uma API completa para aplicações de chat em tempo real.
2. Permitir flexibilidade na escolha do banco de dados, suportando PostgreSQL e MongoDB.
3. Disponibilizar armazenamento de imagens através do Amazon S3.
4. Manter uma arquitetura organizada, testável e de fácil manutenção.

## ✨ Funcionalidades

* ✅ Autenticação de usuários com JWT
* ✅ Cadastro, atualização e exclusão de usuários
* ✅ Criação e gerenciamento de chats
* ✅ Envio e recebimento de mensagens em tempo real
* ✅ Histórico de mensagens
* ✅ Upload de imagens para o Amazon S3
* ✅ API REST com Express
* ✅ Comunicação em tempo real com Socket.io
* ✅ Persistência com Prisma ORM
* ✅ Suporte a PostgreSQL e MongoDB

## 🛠️ Tecnologias utilizadas

### Back-end

* Node.js
* TypeScript
* Express
* Socket.io
* Prisma ORM
* AWS SDK

### Bancos de dados

* PostgreSQL
* MongoDB

### Infraestrutura e ferramentas

* Docker
* Docker Compose
* GitHub Actions
* SonarQube
* Git
* GitHub

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* Git
* Node.js 20 ou superior
* npm ou Yarn
* Docker (opcional)
* Uma conta AWS com acesso ao S3

Verifique as versões:

```bash
git --version
node --version
npm --version
docker --version
```

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/usuario/chat-api.git
```

### 2. Entre na pasta

```bash
cd chat-api
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Configure o arquivo `.env`:

```env
# Bancos de dados
POSTGRES_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat_api
MONGO_DATABASE_URL=mongodb://localhost:27017/chat_api

# AWS S3
S3_BUCKET_NAME=chat-api-demo
AWS_ACCESS_KEY_ID=demo_access_key
AWS_SECRET_ACCESS_KEY=demo_secret_key

# Autenticação
JWT_SECRET=super_secret_jwt_key_for_development_only

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=demo@example.com
SMTP_PASS=demo_password
```

### 5. Execute a aplicação

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

O servidor WebSocket utiliza a mesma porta.

## 📖 Como usar

### API REST

A API pode ser consumida através de ferramentas como:

* Postman
* Insomnia
* Thunder Client
* Aplicações web ou mobile

Entre as operações disponíveis estão:

* autenticação;
* gerenciamento de usuários;
* criação e gerenciamento de chats;
* envio e consulta de mensagens;
* upload de imagens.

### WebSocket

O servidor utiliza **Socket.io** para comunicação em tempo real.

Os clientes devem se conectar a:

```text
http://localhost:3000
```

Principais eventos:

| Evento            | Descrição                             |
| ----------------- | ------------------------------------- |
| `connection`      | Estabelece uma conexão com o servidor |
| `join_chat`       | Adiciona o usuário a uma sala         |
| `send_message`    | Envia uma mensagem                    |
| `receive_message` | Recebe uma nova mensagem              |
| `disconnect`      | Encerra a conexão                     |

### Swagger:

acesse:

http://localhost:3000/api-docs

Na interface do Swagger, é possível:

- Visualizar todas as rotas disponíveis;
- Consultar os parâmetros e corpos das requisições;
- Visualizar os formatos das respostas;
- Autenticar utilizando um JWT através do botão Authorize;
- Executar as requisições diretamente pela interface.
- Autenticação

As rotas protegidas utilizam autenticação Bearer JWT.

Após realizar o login pela rota:

copie o token retornado e clique em Authorize no Swagger.

## 📁 Estrutura do projeto

```text
chat-api/
├── .github/             # CI/CD
├── prisma/              # Banco de dados e migrações
├── src/
│   ├── @types/          # Tipos TypeScript
│   ├── infra/           # Infraestrutura
│   ├── controllers/     # Controllers
│   ├── services/        # Regras de negócio
│   ├── routes/          # Rotas HTTP
│   └── middlewares/     # Middlewares
├── tests/               # Testes automatizados
├── .env.example         # Variáveis de ambiente
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.ts            # Entrada da aplicação
└── sonar-project.properties
```

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

Consulte o arquivo `LICENSE` para obter o texto completo da licença.

## 🤝 Contribuindo

Contribuições são bem-vindas!

Antes de contribuir:

* siga as diretrizes descritas em `CONTRIBUTING.md`;
* utilize **Conventional Commits**;
* mantenha o padrão de código existente;
* adicione testes quando necessário.

### Convenção de commits

Este projeto utiliza Conventional Commits.

### Licença das contribuições

Ao contribuir com este projeto, você concorda que suas contribuições serão disponibilizadas sob os termos da licença vigente do repositório.

## ⭐ Apoie o projeto

Se este projeto foi útil para você:

* ⭐ Dê uma estrela no repositório.
* 🐛 Reporte problemas.
* 💡 Sugira melhorias.
* 🤝 Contribua com código.
* 📢 Compartilhe o projeto.

Obrigado pelo apoio! ❤️

## 📞 Suporte

Encontrou algum problema?

Abra uma **Issue** informando:

* descrição do problema;
* passos para reprodução;
* comportamento esperado;
* comportamento atual;
* logs ou mensagens de erro;
* sistema operacional;
* versão do Node.js;
* versão do projeto.

## 📚 Documentação

* **README:** documentação e instalação do projeto.
* **`CONTRIBUTING.md`:** guia para contribuição.
* **`LICENSE`:** licença do projeto.

---

## 👥 Equipe

<a href="https://github.com/EvertnRS">
  <img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/840eeb2e-2866-4a83-a86b-e97a498bde9f" />
</a>

<a href="https://github.com/ok-kioo">
  <img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/f7da043e-005d-4c5c-a4ab-75fdec3ed861" />
</a>

</a>

---

<div align="center">

### 🚀 EfficiencIA

**Transformando processos em decisões inteligentes.**

<br>

⭐ **Se gostou do projeto, deixe uma estrela!**

</div>
