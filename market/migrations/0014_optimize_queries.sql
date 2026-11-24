-- Optimera databasfrågor genom att skapa index för ofta använda kolumner
-- och justera frågor för att minska belastningen på databasen

-- Skapa index för ofta använda kolumner i tabellen 'companies'
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Skapa index för ofta använda kolumner i tabellen 'projects'
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Skapa index för ofta använda kolumner i tabellen 'tasks'
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Skapa index för ofta använda kolumner i tabellen 'team_members'
CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at);

-- Skapa index för ofta använda kolumner i tabellen 'chats'
CREATE INDEX IF NOT EXISTS idx_chats_company_id ON chats(company_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);

-- Skapa index för ofta använda kolumner i tabellen 'messages'
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
