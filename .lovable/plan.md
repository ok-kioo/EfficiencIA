## Objetivo

Resolver inconsistências da página de ajuda dentro da plataforma, enriquecer o Dashboard e adicionar o fluxo de "esqueci minha senha".

---

## 1. Página de Ajuda dentro da plataforma (`/app/ajuda`)

A `/ajuda` atual é da landing page (header com "Voltar" para `/` e "Criar conta"). Vou criar uma página separada para usuários logados.

- **Nova rota protegida**: `src/routes/_authenticated.ajuda.tsx` → renderiza `AppLayout` (com Sidebar/Header normais).
- **Sidebar**: trocar `path: "/ajuda"` por `/app/ajuda` (rota autenticada). Detalhe: como `_authenticated` é pathless, a URL final será `/ajuda` mesmo. Para evitar colisão com a rota pública existente, renomeio a pública para `/sobre-ajuda` **ou** removo a pública e deixo só a interna. **Decisão**: manter a pública em `/ajuda` (landing usa) e criar a interna em `/guia` (rota `_authenticated.guia.tsx`). Sidebar aponta para `/guia`.
- **Conteúdo da nova página interna** (mais completa que a landing):
  - Introdução curta + link "Criar novo processo".
  - Seção **Como preencher os dados operacionais** de cada elemento (tempo médio, custo, responsável, SLA, recursos) — explicando o que cada campo significa e como impacta a análise da IA.
  - Catálogo completo de elementos, incluindo as variações específicas que a landing não cobre:
    - **Tarefas**: User Task, Service Task, Manual Task, Script Task, Send/Receive Task.
    - **Gateways**: Exclusive (XOR), Parallel (AND), Inclusive (OR), Event-based — com exemplos de cada.
    - **Eventos**: Start/Intermediate/End nas variações Message, Timer, Error, Signal.
    - **Subprocessos e Call Activities**.
    - **Pools e Lanes** com mensagens entre pools.
  - Boas práticas avançadas + FAQ focado em uso da plataforma logada (autosave, análise IA, histórico de análises, exportação).
  - Sem botão "Criar conta"; CTAs apontam para `/modeler` e `/dashboard`.

## 2. Dashboard mais rico (`src/pages/DashboardPage.tsx`)

Adicionar, mantendo o estilo atual:

- **Cards de estatísticas** no topo (4 cards): total de processos, total de análises, análises concluídas, última análise.
- **Bloco "Atalhos rápidos"**: Criar processo, Abrir modelagem em branco, Ler guia (`/guia`).
- **Lista "Análises recentes"** (até 5): nome do projeto, score, status, data — buscando via `analysisService` (novo método `listRecent` ou agregando do backend).
  - Backend: adicionar rota `GET /api/analyses/recent?limit=5` reutilizando service.
- **Estado dos processos**: mostrar último score por projeto nos cards de processo existentes.
- Manter responsividade e tema atuais (cards, bordas, tipografia display).

## 3. Esqueci minha senha

### Backend
- Migração `004_password_resets.sql`:
  ```sql
  CREATE TABLE public.password_resets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  ```
- `authService` ganha:
  - `requestPasswordReset(email)`: gera token aleatório (32 bytes hex), salva hash SHA-256, expira em 1h. Retorna sempre 200 (não revela se e-mail existe). Loga o link no console do backend (substituto de e-mail enquanto não há provedor configurado) e/ou retorna o link em dev se `NODE_ENV !== "production"`.
  - `resetPassword(token, newPassword)`: valida hash, expiração e `used_at`, atualiza `password_hash`, marca como usado.
- Rotas:
  - `POST /api/auth/forgot-password` `{ email }`
  - `POST /api/auth/reset-password` `{ token, password }`

### Frontend
- `authService.ts`: adicionar `requestPasswordReset(email)` e `resetPassword(token, password)`.
- **Link "Esqueci minha senha"** abaixo do botão Entrar em `LoginForm.tsx`, apontando para `/forgot-password`.
- Nova rota pública `src/routes/forgot-password.tsx`: form com e-mail, mensagem de sucesso genérica.
- Nova rota pública `src/routes/reset-password.tsx`: lê `?token=...` da URL, form com nova senha + confirmação, chama API, redireciona para `/login` com toast.
- Em dev, o backend devolve `resetUrl` no JSON para facilitar teste; em prod, só mensagem.

---

## Detalhes técnicos

- **Roteamento**: criar a nova ajuda como `/guia` evita colisão com a `/ajuda` pública e mantém SEO da landing.
- **Stack de e-mail**: não vou plugar provedor de e-mail agora; o backend só loga o link. Documentar no README que substituir por SMTP/Resend é trabalho futuro.
- **Segurança**: tokens armazenados como hash, expiração curta, uso único, resposta neutra em forgot-password.
- **Sem mudanças** em: BPMN modeler, análise IA, fluxo de Google login, schema de users/projects/analyses.

## Fora de escopo

- Envio real de e-mail (SMTP/Resend).
- Alterações na landing page `/ajuda` (continua como está).
- i18n.
