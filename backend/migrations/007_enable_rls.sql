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

-- Defesa em profundidade: revoga qualquer privilégio concedido a PUBLIC e,
-- se existirem, às roles anônimas típicas do Supabase.
REVOKE ALL ON public.users             FROM PUBLIC;
REVOKE ALL ON public.projects          FROM PUBLIC;
REVOKE ALL ON public.analyses          FROM PUBLIC;
REVOKE ALL ON public.password_resets   FROM PUBLIC;
REVOKE ALL ON public.schema_migrations FROM PUBLIC;

DO $$
DECLARE
	role_name text;
BEGIN
	FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated']
	LOOP
		IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
			EXECUTE format('REVOKE ALL ON public.users FROM %I', role_name);
			EXECUTE format('REVOKE ALL ON public.projects FROM %I', role_name);
			EXECUTE format('REVOKE ALL ON public.analyses FROM %I', role_name);
			EXECUTE format('REVOKE ALL ON public.password_resets FROM %I', role_name);
			EXECUTE format('REVOKE ALL ON public.schema_migrations FROM %I', role_name);
		END IF;
	END LOOP;
END $$;
