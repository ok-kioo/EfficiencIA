-- 005_user_plans.sql
-- Plano de assinatura simulado (FREE / PREMIUM). Sem cobrança real.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_plan') THEN
    CREATE TYPE user_plan AS ENUM ('free', 'premium');
  END IF;
END$$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan user_plan NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ;
