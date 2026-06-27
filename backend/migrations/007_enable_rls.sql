-- Fase 2 — Hardening: habilita RLS nas tabelas do schema public.
-- O backend Express acessa o banco como dono das tabelas e por isso continua
-- operando normalmente (RLS não é forçada para o owner). Qualquer outra role
-- (ex.: anon/authenticated do PostgREST/Supabase) fica bloqueada por padrão,
-- já que NÃO criamos policies permissivas aqui.

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- Defesa em profundidade: revoga qualquer privilégio que tenha sido concedido
-- a roles públicas/anônimas pelo Supabase ao criar o schema.
REVOKE ALL ON public.users             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.projects          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.analyses          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.password_resets   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.schema_migrations FROM PUBLIC, anon, authenticated;
