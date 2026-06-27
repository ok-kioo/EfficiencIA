import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "..", "migrations");

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Garante RLS habilitado na tabela mesmo em bancos antigos que foram
  // inicializados antes da migration 007.
  await pool.query(
    "ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY",
  );
  await pool.query(
    "REVOKE ALL ON public.schema_migrations FROM PUBLIC",
  );
}

async function applied(): Promise<Set<string>> {
  const { rows } = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations",
  );
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  await ensureTable();
  const done = await applied();
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (done.has(file)) {
      console.log(`✓ já aplicada: ${file}`);
      continue;
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`→ aplicando: ${file}`);
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO schema_migrations(filename) VALUES($1)", [file]);
      await pool.query("COMMIT");
      console.log(`✓ aplicada:  ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(`✗ falhou:    ${file}`, err);
      process.exit(1);
    }
  }
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
