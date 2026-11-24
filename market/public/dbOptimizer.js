// dbOptimizer.js - Modul för att optimera databasfrågor och förbättra prestanda

/**
 * Optimera databasfrågor genom att använda index och justera frågor
 * för att minska belastningen på databasen.
 */
class DbOptimizer {
  /**
   * Hämta alla aktiva företag med optimiserad fråga
   * @returns {Promise<Array>} En lista med aktiva företag
   */
  async getActiveCompanies() {
    const query = `
      SELECT * FROM companies
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;
    const result = await this.db.prepare(query).all();
    return result.results;
  }

  /**
   * Hämta alla öppna projekt för ett specifikt företag med optimiserad fråga
   * @param {number} companyId - ID för företaget
   * @returns {Promise<Array>} En lista med öppna projekt
   */
  async getOpenProjects(companyId) {
    const query = `
      SELECT * FROM projects
      WHERE company_id = ? AND status = 'open'
      ORDER BY created_at DESC
    `;
    const result = await this.db.prepare(query).bind(companyId).all();
    return result.results;
  }

  /**
   * Hämta alla öppna uppgifter för ett specifikt projekt med optimiserad fråga
   * @param {number} projectId - ID för projektet
   * @returns {Promise<Array>} En lista med öppna uppgifter
   */
  async getOpenTasks(projectId) {
    const query = `
      SELECT * FROM tasks
      WHERE project_id = ? AND status = 'open'
      ORDER BY created_at DESC
    `;
    const result = await this.db.prepare(query).bind(projectId).all();
    return result.results;
  }

  /**
   * Hämta alla teammedlemmar för ett specifikt företag med optimiserad fråga
   * @param {number} companyId - ID för företaget
   * @returns {Promise<Array>} En lista med teammedlemmar
   */
  async getTeamMembers(companyId) {
    const query = `
      SELECT * FROM team_members
      WHERE company_id = ?
      ORDER BY role, created_at DESC
    `;
    const result = await this.db.prepare(query).bind(companyId).all();
    return result.results;
  }

  /**
   * Hämta alla chattar för ett specifikt företag med optimiserad fråga
   * @param {number} companyId - ID för företaget
   * @returns {Promise<Array>} En lista med chattar
   */
  async getChats(companyId) {
    const query = `
      SELECT * FROM chats
      WHERE company_id = ?
      ORDER BY created_at DESC
    `;
    const result = await this.db.prepare(query).bind(companyId).all();
    return result.results;
  }

  /**
   * Hämta alla meddelanden för en specifik chatt med optimiserad fråga
   * @param {number} chatId - ID för chatten
   * @returns {Promise<Array>} En lista med meddelanden
   */
  async getMessages(chatId) {
    const query = `
      SELECT * FROM messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `;
    const result = await this.db.prepare(query).bind(chatId).all();
    return result.results;
  }
}

// Exportera DbOptimizer-klassen för användning i andra moduler
export default DbOptimizer;
