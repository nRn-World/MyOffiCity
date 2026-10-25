-- nRn Market: konton, företag, beställningar och meddelanden (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  pw TEXT NOT NULL,                 -- pbkdf2$iterationer$salt$hash (base64), aldrig klartext
  created INTEGER NOT NULL,
  email TEXT,                       -- valfri; behövs för återställning via e-post
  email_verified INTEGER NOT NULL DEFAULT 0,
  google_sub TEXT,
  recovery_hash TEXT                -- SHA-256 av återställningskoden (koden själv sparas aldrig)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,      -- SHA-256 av sessionsnyckeln (nyckeln själv sparas aldrig)
  user_id TEXT NOT NULL,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL UNIQUE,   -- ett företag per konto i fas 2
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  services TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  building INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  size TEXT NOT NULL,
  status TEXT NOT NULL,
  chosen TEXT NOT NULL DEFAULT '',
  choice_note TEXT NOT NULL DEFAULT '',
  report TEXT NOT NULL DEFAULT '',   -- JSON
  variants TEXT NOT NULL DEFAULT '[]', -- JSON, inkl. intern granskning som bara ägaren får se
  files TEXT NOT NULL DEFAULT '{}',    -- JSON {sökväg: innehåll}
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id, updated);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id, updated);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  from_role TEXT NOT NULL,           -- customer | owner | system
  text TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id, id);
CREATE TABLE IF NOT EXISTS ratelimit (
  k TEXT PRIMARY KEY,
  win INTEGER NOT NULL,
  n INTEGER NOT NULL
);
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
  data TEXT NOT NULL DEFAULT '',
  expires INTEGER NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);
CREATE TABLE IF NOT EXISTS outbox (   -- bara för lokal utveckling (DEV_MAIL=1)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_addr TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  scope TEXT NOT NULL,               -- read | write | full
  created INTEGER NOT NULL,
  last_used INTEGER
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE TABLE IF NOT EXISTS oauth_clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, redirect_uris TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS oauth_codes (code_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, client_id TEXT NOT NULL, redirect_uri TEXT NOT NULL, challenge TEXT NOT NULL, scope TEXT NOT NULL, expires INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, customer_id TEXT NOT NULL, customer_name TEXT NOT NULL, created INTEGER NOT NULL, last_at INTEGER NOT NULL, UNIQUE(company_id, customer_id));
CREATE TABLE IF NOT EXISTS inquiry_msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, inquiry_id TEXT NOT NULL, from_owner INTEGER NOT NULL, text TEXT NOT NULL, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS inquiry_msgs_q ON inquiry_msgs(inquiry_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google ON users(google_sub) WHERE google_sub IS NOT NULL;
