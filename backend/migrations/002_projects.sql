-- Projects — cada projeto guarda o XML BPMN + dados operacionais do usuário
CREATE TABLE IF NOT EXISTS projects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT,
  bpmn_xml     TEXT        NOT NULL DEFAULT '',
  activities   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects (updated_at DESC);
