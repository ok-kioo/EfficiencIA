-- Fase 2 — Onboarding
-- Marca quando o usuário concluiu o tour de boas-vindas
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
