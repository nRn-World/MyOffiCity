-- Stadsdelen: öppna uppdrag som ett företag delar med sina närmaste grannar.
CREATE TABLE IF NOT EXISTS collab_posts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '[]',
  budget TEXT NOT NULL DEFAULT '',
  created INTEGER NOT NULL,
  closed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_collab_company ON collab_posts(company_id, closed);
