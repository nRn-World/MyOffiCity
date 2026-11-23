class Core {
  constructor() {
    this.apiKeys = {
      openRouter: process.env.OPENROUTER_API_KEY,
      openAI: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      github: process.env.GITHUB_TOKEN,
    };
    this.validateAPIKeys();
  }

  validateAPIKeys() {
    Object.keys(this.apiKeys).forEach(key => {
      if (!this.apiKeys[key]) {
        console.warn(`Warning: ${key} is not set in environment variables.`);
      }
    });
  }

  async fetchFromAPI(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from API:', error.message);
      throw error;
    }
  }

  async processCommand(command) {
    if (!command) {
      throw new Error('No command provided');
    }
    console.log(`Processing command: ${command}`);
    // Simulate command processing
    return { message: 'Command processed successfully' };
  }
}

module.exports = Core;
