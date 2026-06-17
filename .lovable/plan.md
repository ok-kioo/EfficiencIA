## Problema

O erro `ENETUNREACH` em endereço IPv6 (`2600:1f14:...`) acontece porque a `DATABASE_URL` no `backend/.env` aponta para o host **direto** do Supabase (`db.<ref>.supabase.co`), que só resolve em **IPv6**. Sua rede local não tem rota IPv6, então a conexão falha antes mesmo de tentar autenticar.

Isso não é bug do código — é característica do plano gratuito do Supabase: conexão direta é IPv6-only. A solução oficial é usar o **Supavisor (connection pooler)**, que é IPv4.

## Solução (2 passos)

### 1. Trocar a `DATABASE_URL` para o pooler

No painel do Supabase: **Project Settings → Database → Connection string → Transaction pooler** (ou **Session pooler** se preferir conexão persistente para migrations).

O formato será:

```
postgresql://postgres.<project-ref>:<SENHA>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Diferenças em relação ao que você tem hoje:
- Host: `aws-0-<region>.pooler.supabase.com` (não `db.<ref>.supabase.co`)
- Porta: `6543` (transaction) ou `5432` (session)
- Usuário: `postgres.<project-ref>` (com o ref embutido)

Substitua a `DATABASE_URL` em `backend/.env` por essa string. Para rodar migrations, recomendo o **Session pooler (porta 5432)** porque alguns comandos DDL não funcionam bem em modo transaction.

### 2. Ajuste defensivo no `backend/infra/db.ts`

Adicionar fallback de família IP e SSL explícito, caso futuramente você volte a usar o host direto:

```ts
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // força IPv4 quando o DNS devolve ambos
  ...(process.env.PG_FORCE_IPV4 === "true" ? { family: 4 } : {}),
});
```

Isso é opcional — o passo 1 sozinho resolve.

## O que NÃO fazer

- Não tentar habilitar IPv6 na sua máquina/roteador — Supabase recomenda o pooler.
- Não trocar para `psql` direto: mesmo erro.
- Não mexer no código de migration (`migrate.ts`) — ele está correto.

## Verificação

Depois de trocar a URL:

```bash
cd backend && npm run migrate
```

Esperado: as 3 migrations (`001_users`, `002_projects`, `003_analyses`) aplicam sem erro e o script imprime "migrated".

---

Posso aplicar o ajuste no `db.ts` assim que você aprovar? A troca da `DATABASE_URL` precisa ser feita por você (está no `.env` local, fora do repositório).