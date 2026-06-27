## Correção do erro em `/ajuda` + Fase 2

### Problema
A rota `/ajuda` é pública (fora de `_authenticated`), então não está envolvida pelo `AuthProvider`. O `useAuth()` lança erro ao montar a página, disparando o error boundary.

### Correção
1. **`frontend/src/contexts/AuthContext.tsx`**: criar hook `useOptionalAuth()` que retorna `null` quando não há provider (em vez de lançar). Manter `useAuth()` estrito.
2. **`frontend/src/routes/ajuda.tsx`**: trocar `useAuth()` por `useOptionalAuth()` e tratar `auth === null` como "não autenticado" (mostra CTAs públicos e link para `/`).

Validação: abrir `/ajuda` deslogado e logado via Playwright; confirmar render e botão "Voltar" inteligente.

---

### Fase 2 — Escopo

Conforme combinado (entrega em fases, RLS app-level no Express, Docker completo, preview já destravado), a Fase 2 cobre:

#### A. Clean Architecture no backend (refactor incremental)
Padronizar todos os módulos em camadas explícitas, sem mudar contratos HTTP:
```
backend/src/modules/<modulo>/
  domain/         (entidades + tipos)
  application/    (use-cases — regras de negócio puras)
  infrastructure/ (repos Postgres, clientes externos)
  interface/      (controllers + routes HTTP)
```
- Extrair `*Repository` de cada `*Service` (hoje os services falam SQL direto).
- Mover regras (ex.: gate Premium, cálculo de score, dedupe) para use-cases puros e testáveis.
- Manter rotas atuais funcionando — só trocar a fiação interna.
- Aplicar em ordem: `auth` → `users` → `projects` → `analyses`.

#### B. RLS app-level reforçado
- Criar middleware `withTenantScope` que injeta `userId` em todo repo call.
- Auditoria: garantir que toda query SELECT/UPDATE/DELETE filtra por `user_id` (ou via JOIN em `projects.user_id` no caso de `analyses`).
- Testes de integração mínimos por módulo confirmando 404 quando o recurso pertence a outro usuário.

#### C. Onboarding + projeto de exemplo
- Backend: ao concluir signup, criar `Welcome Process` (XML BPMN pronto) vinculado ao usuário.
- Frontend: modal de boas-vindas (3 passos: desenhar, dados operacionais, analisar com IA) na primeira entrada no dashboard, com flag `localStorage` + `users.onboarded_at`.
- Migration `006_user_onboarding.sql` + endpoint `POST /api/users/me/onboarding/complete`.

#### D. Docker Compose completo (raiz do repo)
`docker-compose.yml` orquestrando:
- `frontend` (Vite dev na 8080)
- `backend` (Express na 3001)
- `postgres` (15, volume nomeado, init com migrations)
- `n8n` (5678, com volume)
- `qdrant` (6333)
- `ollama` (11434, volume de modelos)

Mais:
- `Dockerfile` por serviço (frontend e backend).
- `.env.docker.example` com variáveis dos 6 serviços.
- README curto em `docs/docker.md` com comandos `up`, `migrate`, `logs`.

### Ordem de execução
1. Hotfix `/ajuda` (bloqueante).
2. Onboarding (alto impacto visível para o usuário).
3. Refactor Clean Architecture + RLS reforçado (qualidade interna).
4. Docker Compose (infra local).

### Fora de escopo desta fase
Assinaturas pagas reais (Stripe), envio real de e-mail de reset, edição colaborativa, integração com Ollama no fluxo de análise (n8n continua sendo a ponte). Esses entram na Fase 3.
