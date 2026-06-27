# EfficiencIA — Monorepo

Plataforma para mapear processos organizacionais com apoio de IA.

```
.
├── (raiz do projeto Lovable)    # frontend TanStack Start (este repositório)
└── backend/                     # API Express + Postgres (Supabase)
```

> ℹ️ O frontend continua na raiz por compatibilidade com a Lovable. O backend
> vive em `backend/` e é executado **localmente**.

## Rodar localmente

```bash
# 1. Frontend
bun install        # ou npm install
bun dev            # http://localhost:5173

# 2. Backend (em outro terminal)
cd backend
cp .env.example .env   # configure DATABASE_URL, GOOGLE_CLIENT_ID, JWT_SECRET
npm install
npm run migrate        # cria as tabelas no Postgres
npm run dev            # http://localhost:3000
```

Configure no frontend (`.env` na raiz, copie de `.env.example`):
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=<mesmo client id do backend, deixe vazio para esconder o botão>
```

## Backend — visão geral

```
backend/
├── infra/                # db pool, jwt, google auth, n8n client, middlewares
├── modules/
│   ├── auth/             # cadastro, login (Google + email/senha), JWT
│   ├── users/            # /me
│   ├── projects/         # CRUD de processos BPMN
│   └── analyses/         # análises da IA (delega ao n8n)
├── migrations/           # SQL versionado (Postgres / Supabase)
└── server.ts             # bootstrap Express
```

### Endpoints principais

| Método | Rota                              | Descrição                         |
| ------ | --------------------------------- | --------------------------------- |
| POST   | `/api/auth/google`                | Login com Google (id_token)       |
| POST   | `/api/auth/signup`                | Cadastro email/senha              |
| POST   | `/api/auth/login`                 | Login email/senha                 |
| GET    | `/api/auth/me`                    | Usuário atual                     |
| GET    | `/api/projects`                   | Lista projetos do usuário         |
| POST   | `/api/projects`                   | Cria projeto                      |
| GET    | `/api/projects/:id`               | Detalhe                           |
| PUT    | `/api/projects/:id`               | Atualiza (autosave)               |
| DELETE | `/api/projects/:id`               | Exclui                            |
| GET    | `/api/projects/:id/analyses`      | Análises do projeto               |
| POST   | `/api/projects/:id/analyses`      | Cria + chama agente n8n           |
| GET    | `/api/analyses/:id`               | Detalhe de uma análise            |

### Integração com n8n

O backend envia POST para `N8N_WEBHOOK_URL` (default `http://localhost:5678/webhook/assist-bpmn`) com o payload `{ projectId, projectName, bpmnXml, activities }` e espera resposta no formato:

```json
{
  "summary": "...",
  "bottlenecks": [],
  "modelingIssues": [],
  "improvementSuggestions": [],
  "finalAssessment": { "score": 0, "explanation": "" }
}
```
