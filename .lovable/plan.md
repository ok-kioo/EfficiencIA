
## Objetivo

Substituir o estado mockado do frontend (DEMO_USER, `isAuthenticated: true`, projetos vazios fixos, botão "Analisar" só com toast) por chamadas reais às rotas do backend `backend/` (Express) já implementadas:

- `POST /api/auth/login` `/signup` `/google`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/projects`, `GET/POST /api/projects/:id/analyses`
- `GET /api/analyses/:id`

## Mudanças no frontend

### 1. Camada HTTP (`src/services/api.ts`)
- Manter `axios` com `baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"`.
- Adicionar **interceptor de request** que injeta `Authorization: Bearer <token>` lendo de `localStorage`.
- Adicionar **interceptor de response** que, em `401`, limpa o token e redireciona para `/login`.

### 2. `authService` real (`src/services/authService.ts`)
Remover `buildDemoResponse`. Chamar de fato:
- `login({ email, password })` → `POST /api/auth/login`
- `signup({ name, email, password })` → `POST /api/auth/signup` (não enviar `confirmPassword`)
- `loginWithGoogle(idToken)` → `POST /api/auth/google`
- `me()` → `GET /api/auth/me`

Persistir `token` e `user` em `localStorage`; tratar erros do axios devolvendo a mensagem do backend (`err.response?.data?.message`).

### 3. `AuthContext` real (`src/contexts/AuthContext.tsx`)
- Remover `DEMO_USER` e `isAuthenticated: true` forçado.
- Estado: `user`, `isLoading` (true durante hidratação inicial), `isAuthenticated = !!user`.
- Ao montar: se houver token, chamar `authService.me()` para revalidar; em falha → logout silencioso.
- `login`/`signup`/`loginWithGoogle` atualizam o user a partir da resposta real.

### 4. Guard real de rota (`src/routes/_authenticated.tsx`)
Adicionar componente que, dentro do `AuthProvider`, espera `isLoading` e:
- Se não autenticado → `useNavigate({ to: "/login" })`.
- Se autenticado → renderiza `<AppLayout><Outlet/></AppLayout>`.

Atualizar `ProtectedRoute.tsx` (hoje passthrough) para a mesma lógica e usar nas páginas que precisarem.

### 5. Login com Google
- Instalar `@react-oauth/google`.
- Envolver `LoginPage` e `SignupPage` com `<GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>`.
- Adicionar botão `<GoogleLogin onSuccess={({credential}) => loginWithGoogle(credential)}>` em `LoginForm` e `SignupForm` (separador "ou").
- Se `VITE_GOOGLE_CLIENT_ID` não estiver definido, esconder o botão (graceful).

### 6. Serviços de projeto e análise (novos)
- `src/services/projectService.ts` (renomear o atual para `processDraftService.ts` — só mexe com localStorage): `list()`, `get(id)`, `create({name, bpmnXml, activities})`, `update(id, patch)`, `remove(id)`.
- `src/services/analysisService.ts`: `createForProject(projectId)`, `get(id)`.

### 7. Dashboard real (`src/pages/DashboardPage.tsx`)
Usar `useQuery(['projects'], projectService.list)` para listar; manter empty state. Botão "Análises" leva para `/projects/$id/analyses` (rota nova simples listando) — opcional nesta fase: pode só mostrar a última análise.

### 8. Análise real no Modeler (`src/pages/ModelerPage.tsx`)
Substituir o `handleAnalyze` (hoje só `toast.info`):
1. `projectService.create({ name: processName, bpmnXml, activities })` (ou `update` se já existir id em estado local).
2. `analysisService.createForProject(project.id)` — backend chama o n8n e retorna a análise pronta.
3. `navigate({ to: "/analyses/$id", params: { id: analysis.id } })`.
4. Tratar erros com `toast.error(message)`.

### 9. Página de resultado (`src/routes/analyses.$id.tsx`)
Nova rota protegida que busca `GET /api/analyses/:id` e exibe:
- `summary`
- listas de `bottlenecks`, `modelingIssues`, `improvementSuggestions`
- `finalAssessment.score` + `explanation`
- Estados `running`/`failed` (`error`).

UI simples reaproveitando cards/badges existentes; sem novo design system.

### 10. Tipos (`src/@types/user.ts`)
Adicionar `picture?: string`. Manter `SignupRequest` com `confirmPassword` (UI), mas `authService.signup` só envia `{name,email,password}`.

## Variáveis de ambiente

Adicionar ao README e a um `.env.example` na raiz do frontend:
- `VITE_API_URL=http://localhost:3001`
- `VITE_GOOGLE_CLIENT_ID=` (mesmo do backend `GOOGLE_CLIENT_ID`)

## Não está no escopo

- Refresh token / sessão SSR.
- Telas de gestão completa de projetos (edição de metadados, exclusão em massa).
- Histórico de análises por projeto (uma listagem simples pode ficar para depois).
- Mudanças no backend Express (já está com as rotas necessárias).

## Verificação

1. `cd backend && npm run dev` + `npm run dev` no frontend.
2. `/signup` cria conta real (linha em `users`), redireciona para `/dashboard`.
3. `/login` com email/senha existente funciona; refresh mantém sessão via `GET /me`.
4. Botão Google aparece se `VITE_GOOGLE_CLIENT_ID` definido e autentica.
5. No modeler, "Analisar com IA" cria projeto + análise, navega para `/analyses/:id`, mostra resultado do n8n (ou erro amigável se webhook offline).
6. Sem token, qualquer rota `_authenticated/*` redireciona para `/login`.
