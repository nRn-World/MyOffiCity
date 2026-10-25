-- Personliga API-nycklar (för MCP/Claude och egna program). Körs EN gång på en fas 3-databas:
--   npx wrangler d1 execute nrn-market --remote --file=migrations/0003_api_keys.sql
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,   -- SHA-256 av nyckeln (nyckeln själv visas en gång och sparas aldrig)
  prefix TEXT NOT NULL,              -- de första tecknen, så man känner igen nyckeln i listan
  scope TEXT NOT NULL,               -- read | write | full
  created INTEGER NOT NULL,
  last_used INTEGER
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
