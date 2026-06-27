## Correções: RLS nas tabelas públicas + Onboarding abrindo projeto vazio

### 1) RLS nas tabelas `public.*` (segurança)

Contexto: o banco é acessado **apenas pelo backend Express** usando uma conexão Postgres com a role dona das tabelas (Supavisor/pooler). Não existe PostgREST/Supabase Auth consumindo essas tabelas direto do cliente, então hoje nada as exporia — mas o scanner do Supabase exige RLS habilitado em qualquer tabela do schema `public`.

**Solução:** habilitar RLS (com `FORCE ROW LEVEL SECURITY`) e **não criar policies permissivas**. O dono da tabela (a role do backend) continua acessando normalmente porque RLS não se aplica a quem é dono — exceto se usarmos `FORCE`, que força inclusive o dono a respeitar policies. Para manter o backend funcionando sem reescrever queries:

- Habilitar `ROW LEVEL SECURITY` **sem `FORCE`** nas 4 tabelas → o owner (backend) continua passando, qualquer outra role (anon/authenticated do PostgREST) fica bloqueada por padrão.
- Revogar explicitamente `ALL` de `anon`, `authenticated` e `PUBLIC` nessas tabelas, garantindo defesa em profundidade.

Tabelas atingidas:
- `public.projects`
- `public.analyses`
- `public.password_resets`
- `public.schema_migrations` (tabela criada pelo runner de migrations)

**Implementação:**

- Nova migration `backend/migrations/007_enable_rls.sql`:
  ```sql
  ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.analyses         ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.password_resets  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

  REVOKE ALL ON public.users, public.projects, public.analyses,
              public.password_resets, public.schema_migrations
    FROM PUBLIC, anon, authenticated;
  ```
- Ajuste no runner `backend/src/infra/migrate.ts` para chamar `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em `schema_migrations` logo após o `CREATE TABLE IF NOT EXISTS` (caso o banco já tenha sido inicializado antes de existir a migration 007).

Nenhuma policy é criada — o backend acessa como owner do schema e continua passando; PostgREST (anon/authenticated) não tem permissão nem policy, então fica fechado.

### 2) Onboarding abre o modeler vazio

**Causa:** o botão "Abrir o exemplo" do `WelcomeOnboarding` faz `<Link to="/modeler">` sem `projectId`. O `ModelerPage` então entra no caminho "novo processo" e mostra o XML default (só Start). O projeto de boas-vindas existe no banco, mas o modeler nunca foi instruído a abri-lo.

**Solução:** descobrir o id do projeto de exemplo e navegar para `/modeler?projectId=<id>`.

- No `WelcomeOnboarding.tsx`: trocar o `<Link>` por um botão que:
  1. Marca onboarding como concluído (`userService.completeOnboarding`).
  2. Chama `projectService.list()` e escolhe o projeto mais antigo do usuário (o welcome é o primeiro criado no signup); fallback: o primeiro cujo nome contenha "Pedido de cliente".
  3. Usa `useNavigate()` para ir a `/modeler` com `search: { projectId }`. Se a lista vier vazia (falha do seed), navega para `/modeler` sem projectId e mostra toast informativo.
- Garantir que `projectService.list()` já retorna `id` (sim — usado no dashboard).

### Arquivos a tocar

- `backend/migrations/007_enable_rls.sql` (novo)
- `backend/src/infra/migrate.ts` (RLS em `schema_migrations` ao criar)
- `frontend/src/components/onboarding/WelcomeOnboarding.tsx` (botão final navega para o projeto de exemplo)

### Como o usuário aplica

```
cd backend && npm run migrate
```

Depois o scan deve parar de reportar as 4 violações de RLS, e finalizar o onboarding já abre o modeler com o fluxo "Pedido de cliente" carregado.
