import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL não definida — defina no .env antes de subir o backend.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("supabase.co") ||
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  // Força IPv4 quando o DNS devolve A + AAAA (host direto do Supabase é IPv6-only;
  // em redes sem rota IPv6 dá ENETUNREACH). Use o pooler do Supavisor + PG_FORCE_IPV4=true.
  ...(process.env.PG_FORCE_IPV4 === "true" ? { family: 4 as const } : {}),
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params as never);
}
