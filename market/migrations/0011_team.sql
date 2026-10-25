CREATE TABLE IF NOT EXISTS company_team (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, slot INTEGER NOT NULL, persona TEXT NOT NULL, hired INTEGER NOT NULL, fired INTEGER);
CREATE INDEX IF NOT EXISTS company_team_c ON company_team(company_id);
