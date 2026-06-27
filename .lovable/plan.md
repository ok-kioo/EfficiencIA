
# Evolução da Plataforma — Fase 1 (correções críticas + planos + UX da IA)

Entrega faseada conforme acordado. Esta é a Fase 1. Fase 2 (Clean Architecture + Docker completo com n8n/qdrant/ollama) e Fase 3 (onboarding + projeto de exemplo + páginas Premium completas) ficam para iterações seguintes para reduzir risco de regressão.

## 0. Diagnóstico do preview quebrado (resolver primeiro)

O projeto foi reorganizado em `frontend/` e `backend/`, mas o sandbox do Lovable procura o `package.json` na raiz e roda `dev` a partir dali. Resultado: `Error: no command found for task "dev"` → preview nunca builda → WebSocket falha.

Correção: criar `lovable.toml` na raiz apontando para `frontend/`:

```toml
[run]
install = "cd frontend && bun install"
dev = "cd frontend && bun run dev"
build = "cd frontend && bun run build"
```

Sem mover arquivos. Backend continua isolado em `backend/` (não roda no sandbox do preview de qualquer forma).

## 1. Correções de comportamento

### 1.1 Limpeza do editor BPMN ao trocar de projeto
Hoje `ModelerPage` chama `loadDraft()` do `localStorage` no `useMemo` inicial, e o draft é único global (`efficiencia:modeler:draft`). Ao abrir outro projeto, o draft do anterior volta antes do fetch do projeto atual sobrescrever — e se o novo projeto não tem XML, o draft permanece.

Mudanças em `frontend/src/lib/modeler/autosave.ts` e `frontend/src/pages/ModelerPage.tsx`:
- Trocar a chave do draft para incluir o projectId: `efficiencia:modeler:draft:<projectId>` e uma chave separada `…:new` para rascunho sem projeto.
- Ao montar `ModelerPage` com `?projectId=X`, ignorar qualquer draft que não seja dessa chave; carregar SEMPRE o projeto do backend antes de exibir o XML; se o projeto não tem `bpmn_xml`, usar `defaultBpmnXml` vazio (não draft).
- Ao desmontar ou ao navegar para fora do modeler, chamar `clearDraft(currentKey)` quando o conteúdo já foi persistido (após `Analisar com IA` ou após salvar).
- Adicionar um guarda em `Dashboard → Abrir projeto`: navegar com `replace: true` e key da rota para forçar remount do `ModelerPage`.

### 1.2 Isolamento por usuário (reforço no app, sem RLS — conforme escolhido)
Auditar e garantir `WHERE user_id = $1` em todas as queries:
- `projectService` (ok) — manter.
- `analysisService.listRecent` / `findOne` / `listForProject` — já fazem join com ownership, revisar.
- Adicionar testes manuais documentados em `backend/README.md`: tentar `GET /api/projects/:id` com token de outro usuário deve retornar 404.
- `clearDraft` no logout: `AuthContext.logout()` limpa todas as chaves `efficiencia:modeler:draft:*` do localStorage para não vazar rascunho entre contas no mesmo navegador.

### 1.3 Navegação da página de ajuda
Hoje `/ajuda` é pública e o botão "Voltar" usa `<Link to="/">`, sempre indo para a landing. O usuário logado também vê "Criar conta".

Mudanças em `frontend/src/routes/ajuda.tsx`:
- Detectar auth via `useAuth()`. Se autenticado:
  - Botão "Voltar" usa `router.history.back()` com fallback para `/dashboard`.
  - Esconder botão "Criar conta"; mostrar "Ir para o Dashboard".
  - Esconder CTA final "Criar sua conta".
- Se não autenticado: comportamento atual (volta para `/`, mostra "Criar conta").
- A rota interna `/_authenticated/guia` continua existindo (mais completa) — o Sidebar continua apontando para ela. A `/ajuda` pública fica como vitrine para visitantes.

## 2. Modelo de assinatura FREE / PREMIUM (simulação, sem pagamento)

### Backend
Migration `005_user_plans.sql`:
```sql
CREATE TYPE user_plan AS ENUM ('free', 'premium');
ALTER TABLE users ADD COLUMN plan user_plan NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN plan_updated_at TIMESTAMPTZ;
```
- `userService.findById` retorna `plan`.
- Novo endpoint `POST /api/users/me/upgrade` → seta `plan='premium'` para o usuário autenticado (sem pagamento, só simulação). Endpoint `POST /api/users/me/downgrade` (opcional, útil para testes).
- Middleware `requirePremium` em `backend/src/infra/planMiddleware.ts` retorna `403 { error: 'plan_required', requiredPlan: 'premium' }`.
- `POST /api/analyses` (criar análise) passa por `requirePremium`. FREE recebe 403.
- `analysisService` ao retornar `bottlenecks`/`improvement_suggestions` para FREE: filtra itens marcados como `severity: 'premium'` ou `tier: 'premium'` no JSON e substitui por um único item placeholder `{ type: 'premium_locked', message: '…' }`. **O conteúdo Premium nunca é serializado para o cliente FREE.** (Hoje a análise só roda para Premium, então esse filtro vale para listagens históricas: se o usuário rebaixou ou se executou antes — manter consistência.)

### Frontend
- `AuthContext` expõe `user.plan`.
- `services/userService.ts` novo, com `upgradeToPremium()`.
- `ModelerPage`: botão "Analisar com IA" para FREE não dispara request — navega para `/premium`.
- `ValidationPanel` / "Pontos a revisar": renderiza card especial para itens `type: 'premium_locked'` com botão "Conhecer Plano Premium" → `/premium`.
- Nova rota pública-mas-com-redirect `/_authenticated/premium` (`PremiumPage`): hero, comparação FREE × PREMIUM, exemplos de análise da IA, CTA "Ser PREMIUM" que chama `upgradeToPremium()` e redireciona para `/dashboard` com toast. Visual no padrão da landing.

## 3. UX — Tornar a IA mais atrativa

Mudanças incrementais, sem ser invasivo:

- `BpmnToolbar`: destacar o botão "Analisar com IA" — cor primária mais vibrante, ícone `Sparkles`, microcopy abaixo: "Receba recomendações inteligentes que vão além das validações tradicionais."
- `ModelerPage`: se o projeto atual nunca foi analisado, mostrar banner discreto no topo do painel lateral: "Seu processo ainda não foi analisado pela IA." com CTA.
- Modal de confirmação antes de **Exportar XML** e antes de **Descartar rascunho** perguntando "Deseja realizar uma análise inteligente antes?". Opções: "Analisar agora" / "Continuar sem analisar".
- `DashboardPage`: cards de projetos sem análise recebem selo "Recomendado analisar".
- Para FREE: todos os CTAs de IA levam a `/premium`; para PREMIUM, disparam fluxo normal.

## 4. Sem mudanças nesta fase

- Clean Architecture / camada de Repository (Fase 2).
- docker-compose com n8n/qdrant/ollama (Fase 2).
- RLS real no Postgres (decidido: manter app-level).
- Projeto de exemplo automático no signup (Fase 3).
- Onboarding em modais (Fase 3).
- Migração para Supabase Auth.

## Detalhes técnicos (referência)

Arquivos novos:
- `lovable.toml` (raiz)
- `backend/migrations/005_user_plans.sql`
- `backend/src/infra/planMiddleware.ts`
- `frontend/src/services/userService.ts`
- `frontend/src/routes/_authenticated.premium.tsx` + `PremiumPage.tsx`
- `frontend/src/components/modeler/AnalyzeBeforeActionDialog.tsx`

Arquivos editados:
- `lib/modeler/autosave.ts` — chave por projeto
- `pages/ModelerPage.tsx` — load por projectId, banner, modais, gate FREE
- `pages/DashboardPage.tsx` — selo "Recomendado analisar"
- `components/bpmn/BpmnToolBar.tsx` — destaque visual + microcopy
- `components/bpmn/ValidationPanel.tsx` — card `premium_locked`
- `routes/ajuda.tsx` — voltar inteligente + esconder CTAs para logado
- `contexts/AuthContext.tsx` — incluir `plan` e limpar drafts no logout
- `@types/user.ts` — campo `plan`
- `backend/src/modules/users/domain/User.ts` + `service` + `controller` + `routes` — endpoints upgrade/downgrade e expor `plan`
- `backend/src/modules/analyses/routes/index.ts` — aplicar `requirePremium` no `POST`
- `backend/src/modules/analyses/service/analysisService.ts` — filtrar itens premium para FREE
- `backend/src/modules/auth/service/authService.ts` — incluir `plan` no payload `/me`

Checagens ao final:
- `cd frontend && bun run build` deve passar.
- Preview do Lovable abre sem erro de WebSocket.
- Login → abrir projeto A → voltar ao dashboard → abrir projeto B → editor mostra XML de B, nunca de A.
- Usuário FREE clicando em "Analisar com IA" vai para `/premium`; após "Ser PREMIUM", botão funciona normalmente.
