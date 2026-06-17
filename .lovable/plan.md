
# Plano de Evolução — Plataforma BPMN

Entrega em duas fases dentro do mesmo plano. Estrutura final do repositório:

```text
/ (raiz)
├── frontend/         (move-se o projeto TanStack atual pra cá)
│   ├── src/
│   ├── package.json
│   └── .env          (VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
└── backend/
    ├── infra/        (db pool, supabase admin, jwt, google verifier, logger)
    ├── modules/
    │   ├── auth/      {domain,service,controller,routes}
    │   ├── users/     {domain,service,controller,routes}
    │   ├── projects/  {domain,service,controller,routes}
    │   └── analyses/  {domain,service,controller,routes}
    ├── migrations/   (SQL versionado p/ Postgres Supabase)
    ├── server.ts
    ├── package.json
    └── .env          (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, N8N_WEBHOOK_URL, PORT)
```

Observação importante: como o backend será Express local + n8n em `http://localhost:5678`, o preview hospedado da Lovable só mostrará a UI. Para login, persistência e análises você precisa rodar `cd backend && npm run dev` e `cd frontend && npm run dev` localmente, com `VITE_API_URL=http://localhost:3001`.

---

## FASE 1 — UX e refactor do frontend

### 1. Landing page pública `/`
- Nova rota `src/routes/index.tsx` (substitui a atual): hero com proposta de valor, sem jargão BPMN, paleta Emerald Prestige, tipografia Sora/Manrope já definida.
- Seções: Hero + CTA, "Como funciona" (3 passos visuais), "Análise inteligente" (diferenciais), CTA final.
- CTAs: "Criar conta" → `/signup`, "Entrar" → `/login`, "Começar um novo fluxo" → `/modeler` (cai no gate `_authenticated`).
- Responsivo mobile-first; SEO com `head()` (title, description, og).
- Dashboard atual vira `/_authenticated/dashboard` (em vez de `/`).

### 2. Página de ajuda `/ajuda`
- Rota pública nova `src/routes/ajuda.tsx`.
- Conteúdo: intro à modelagem, glossário leigo dos elementos (ponto de início, etapa, ponto de decisão, conexão, participante, área responsável), quando usar cada um, exemplos do cotidiano, FAQ, boas práticas.
- Link visível no header e no painel de ajuda contextual da modelagem.

### 3. Refatorar painel lateral do Modeler
- Substituir empilhamento atual por **Accordion** (shadcn) com a ordem fixa:
  1. **Elemento selecionado** (nome/tipo amigável + ID escondido em hover) — aberto por padrão.
  2. **Dados Operacionais** — aberto por padrão; vazio mostra "Selecione uma etapa do fluxo para informar dados operacionais."; renderiza form só quando há seleção; troca de seleção atualiza sem desmontar (preserva valores via cache por elementId no `ProcessDataPanel`).
  3. **Validação BPMN** — fechado por padrão; badge com contagem.
  4. **Ajuda contextual** — fechado; link "Ver guia completo" → `/ajuda`.
- Remove divs aninhadas que causam overflow vertical; painel com `overflow-y-auto` único.

### 4. Dedupe de validações
- No `useBpmnValidation` (ou no `ValidationPanel`): chave `${rule}|${elementId}|${message}`; consolidar e mostrar contador "×N" quando houver repetidas. Mantém ordenação por severidade.

### 5. Botão "Descartar rascunho"
- Mover do menu/canto atual para ao lado de "Exportar" no `BpmnToolBar`.
- Ícone `Trash2` (lucide).
- `AlertDialog` (shadcn) com texto: "Tem certeza de que deseja descartar este rascunho? Essa ação não poderá ser desfeita." Botões: "Cancelar" / "Sim, descartar".

### 6. Linguagem leiga
- Varredura final em `BpmnToolBar`, `ValidationPanel`, `ProcessDataPanel`, `SemanticValidator`, `CustomRules`, header do canvas: substituir Gateway/Pool/Lane/Sequence Flow/Event por termos amigáveis (ponto de decisão, participante, área responsável, conexão, evento durante o processo).
- Tooltips (shadcn `Tooltip`) onde termo técnico for inevitável.

### 7. Remoção da aba Cenários
- Apagar: `src/pages/ScenariosPage.tsx`, `src/routes/_authenticated.scenarios.tsx`, item do `Sidebar`, qualquer import órfão.
- Verificar `routeTree.gen.ts` (regenera sozinho), `Sidebar.tsx`, `Header.tsx`.

### 8. Botão "Analisar" no Modeler
- Adicionar no `BpmnToolBar` (entre Salvar e Exportar): chama autosave → POST `/projects/:id/analyses` no backend → navega para `/_authenticated/projetos/$id/analises`.
- Estado de loading + toast de erro.

---

## FASE 2 — Backend Express + Supabase + n8n

### 9. Reorganização do repositório
- Mover o projeto atual inteiro para `frontend/` (`mv` de tudo exceto `.git`, `backend/` futuro, READMEs raiz).
- Criar `package.json` raiz com workspaces (`"workspaces": ["frontend", "backend"]`) só para conveniência de scripts — Lovable continua buildando `frontend/`.
- README raiz explicando como rodar.

### 10. Backend Express (`backend/`)
- Stack: Node 20, TypeScript, Express 4, `pg` (cliente Postgres), `jsonwebtoken`, `google-auth-library` (verifica `id_token`), `zod`, `cors`, `helmet`, `morgan`, `dotenv`, `tsx` (dev) / `tsc` (build).
- `server.ts`: monta CORS (origin = `FRONTEND_URL`), registra rotas dos 4 módulos sob `/api/auth`, `/api/users`, `/api/projects`, `/api/analyses`. Health em `/health`.
- `infra/`:
  - `db.ts` — pool `pg` apontando para `DATABASE_URL` do Supabase (connection string Postgres).
  - `jwt.ts` — `sign(userId)` / `verify(token)`; expiração 7d.
  - `google.ts` — verifica `id_token` Google contra `GOOGLE_CLIENT_ID`, retorna `{ sub, email, name, picture }`.
  - `authMiddleware.ts` — extrai `Authorization: Bearer`, valida JWT, injeta `req.user`.
  - `n8n.ts` — POST para `N8N_WEBHOOK_URL` (default `http://localhost:5678/webhook/assist-bpmn`).
  - `errors.ts` — handler central com formato `{ error, message }`.
- Padrão de cada módulo (ex.: `projects/`):
  - `domain/Project.ts` — tipos + schemas zod.
  - `service/projectService.ts` — regras de negócio + queries `pg`.
  - `controller/projectController.ts` — handlers Express puros.
  - `routes/index.ts` — `Router()` montando os endpoints.

### 11. Migrations (Postgres via Supabase)
SQL versionado em `backend/migrations/` (executados via `psql` ou script `npm run migrate`; também aplicáveis pelo Supabase MCP):

- `001_users.sql` — `users(id uuid pk, google_sub text unique, email text unique, name text, picture text, created_at)`.
- `002_projects.sql` — `projects(id uuid pk, user_id uuid fk, name text, description text, bpmn_xml text, updated_at, created_at)`; index por `user_id`.
- `003_analyses.sql` — `analyses(id uuid pk, project_id uuid fk, status text check in ('pending','running','done','failed'), summary text, bottlenecks jsonb, modeling_issues jsonb, improvement_suggestions jsonb, final_assessment jsonb, error text, created_at, finished_at)`.

Sem RLS (acesso só via backend com service role / pool direto). Documentar variáveis necessárias no README do backend.

### 12. Endpoints

**Auth (`/api/auth`)** — públicos:
- `POST /google` — body `{ idToken }`; verifica via Google, upsert em `users`, retorna `{ token, user }`.
- `POST /signup` — `{ email, password, name }` (fallback email/senha com bcrypt) — opcional, marcar TODO se priorizar OAuth.
- `POST /login` — `{ email, password }`.
- `GET /me` — protegido; retorna usuário atual.

**Projects (`/api/projects`)** — protegidos:
- `GET /` — lista do usuário.
- `POST /` — cria `{ name, description?, bpmnXml? }`.
- `GET /:id` — detalhe (ownership check).
- `PUT /:id` — atualiza `name/description/bpmnXml` (autosave).
- `DELETE /:id`.

**Analyses (`/api/analyses` + nested em projects)** — protegidos:
- `GET /api/projects/:id/analyses` — lista análises do projeto.
- `POST /api/projects/:id/analyses` — cria registro `status='running'`, dispara n8n em background (sync await por simplicidade no MVP), grava resposta no formato exigido, atualiza para `done` ou `failed`. Retorna a análise.
- `GET /api/analyses/:id`.

Formato persistido e devolvido segue exatamente:
```json
{ "summary": "", "bottlenecks": [], "modelingIssues": [], "improvementSuggestions": [], "finalAssessment": { "score": 0, "explanation": "" } }
```

### 13. Frontend — integração
- `frontend/.env` adiciona `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`.
- Novo `src/services/api.ts` — cliente `fetch` com base URL, injeta `Authorization: Bearer <token>` do `localStorage`.
- Login/Signup:
  - Substitui forms atuais por botão "Entrar com Google" usando `@react-oauth/google` (`GoogleOAuthProvider` no root + `GoogleLogin` no `LoginForm`). Recebe `credential` (id_token) → POST `/api/auth/google` → salva token → redireciona dashboard.
  - Manter form email/senha como secundário (opcional).
- `AuthContext` passa a guardar `{ user, token }` vindos do backend; gate `_authenticated` checa token (valida via `/api/auth/me` no mount).
- Dashboard (`/_authenticated/dashboard`): lista projetos via `GET /api/projects`; cards com nome, data, botões "Abrir", "Excluir", "Análises". Botão "Novo projeto" cria e abre modeler.
- Modeler autosave (`useModelerAutosave`): troca chamadas locais por `PUT /api/projects/:id` debounced.
- Tela de Análises: nova rota `src/routes/_authenticated.projetos.$id.analises.tsx`.
  - Lista análises do projeto; cada item expande para mostrar Resumo, Gargalos, Problemas de modelagem, Sugestões, Pontuação + explicação — UI amigável (Cards + Badges, sem JSON cru).
  - Botão "Nova análise" dispara fluxo (autosave do modeler se estiver lá; aqui só POST).
  - Estado vazio: "Este projeto ainda não foi analisado." + botão "Iniciar primeira análise".
  - Estado `running`: skeleton + polling a cada 2s até `done|failed`.
- Botão "Analisar" no Modeler segue o fluxo definido na Fase 1 item 8.

### 14. Variáveis de ambiente

`backend/.env.example`:
```text
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres
JWT_SECRET=troque-isto
GOOGLE_CLIENT_ID=...
N8N_WEBHOOK_URL=http://localhost:5678/webhook/assist-bpmn
```

`frontend/.env.example`:
```text
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=...
```

### 15. Scripts
- Raiz `package.json`: `"dev": "concurrently \"npm:dev:*\""`, `"dev:frontend"`, `"dev:backend"`, `"migrate"`.
- Backend: `dev` (tsx watch), `build` (tsc), `start`, `migrate` (executa SQL na ordem).

---

## Notas técnicas

- A Lovable build/preview continuará apontada para `frontend/` — backend não roda no Worker.
- Google OAuth: usuário precisa criar Client ID em console.cloud.google.com e configurar origens `http://localhost:5173`. Eu deixo instruções no README.
- n8n: backend trata timeout (30s) e falha graciosamente (status `failed` + mensagem).
- Sem mocks de IA; se n8n estiver offline, a análise simplesmente entra como `failed` e a UI mostra "Não foi possível conectar ao agente de análise. Verifique se o n8n está rodando."
- Linguagem em pt-BR em todas as mensagens visíveis.

## Fora de escopo
- Deploy do backend em produção.
- Edição colaborativa em tempo real.
- Roles/permissões além de "dono do projeto".
- Recuperação de senha (se mantivermos email/senha como fallback, marcar TODO).

Após sua aprovação eu começo pela Fase 1 (UX + remoção de Cenários), e na sequência Fase 2 (mover para monorepo + backend + integração).
