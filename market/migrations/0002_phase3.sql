-- Fas 3: e-post, återställningskod, taggar, betyg. Körs EN gång på en databas som skapades med fas 2-schemat:
--   npx wrangler d1 execute nrn-market --remote --file=migrations/0002_phase3.sql
-- (Nya installationer använder schema.sql, som redan innehåller allt detta.)
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN recovery_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
ALTER TABLE companies ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS reviews (
  order_id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  stars INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id, created);
CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,                -- verify | reset
  data TEXT NOT NULL DEFAULT '',     -- e-postadressen som ska verifieras
  expires INTEGER NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);
CREATE TABLE IF NOT EXISTS outbox (   -- bara för lokal utveckling (DEV_MAIL=1), används aldrig i drift
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_addr TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created INTEGER NOT NULL
);
