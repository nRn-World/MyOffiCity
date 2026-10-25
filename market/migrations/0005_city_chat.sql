ALTER TABLE companies ADD COLUMN building INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, customer_id TEXT NOT NULL, customer_name TEXT NOT NULL, created INTEGER NOT NULL, last_at INTEGER NOT NULL, UNIQUE(company_id, customer_id));
CREATE TABLE IF NOT EXISTS inquiry_msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, inquiry_id TEXT NOT NULL, from_owner INTEGER NOT NULL, text TEXT NOT NULL, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS inquiry_msgs_q ON inquiry_msgs(inquiry_id, id);
