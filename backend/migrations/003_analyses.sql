-- Analyses — resultados da análise da IA por projeto
CREATE TABLE IF NOT EXISTS analyses (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status                  TEXT        NOT NULL CHECK (status IN ('pending','running','done','failed')),
  summary                 TEXT,
  bottlenecks             JSONB       NOT NULL DEFAULT '[]'::jsonb,
  modeling_issues         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  improvement_suggestions JSONB       NOT NULL DEFAULT '[]'::jsonb,
  final_assessment        JSONB       NOT NULL DEFAULT '{"score":0,"explanation":""}'::jsonb,
  error                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS analyses_project_id_idx ON analyses (project_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);
