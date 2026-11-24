// Assistant UI Module for MyOffiCity
class AssistantUI {
  constructor(assistant) {
    this.assistant = assistant;
    this.uiElement = document.getElementById('assistant-ui');
    this.initUI();
  }

  // Initialize the assistant UI
  initUI() {
    if (!this.uiElement) {
      this.createUI();
    }
    this.updateUI();
  }

  // Create the assistant UI if it doesn't exist
  createUI() {
    const appElement = document.getElementById('app');
    const assistantUI = document.createElement('div');
    assistantUI.id = 'assistant-ui';
    assistantUI.className = 'assistant-ui';
    appElement.appendChild(assistantUI);
    this.uiElement = assistantUI;
  }

  // Update the assistant UI with the latest recommendations
  updateUI() {
    const recommendations = this.assistant.getRecommendations();
    this.uiElement.innerHTML = '<h2>Your Personal Assistant</h2>';

    recommendations.forEach(rec => {
      const recElement = document.createElement('div');
      recElement.className = 'recommendation';
      recElement.innerHTML = `
        <h3>${rec.title}</h3>
        <p>${rec.description}</p>
      `;
      this.uiElement.appendChild(recElement);
    });
  }

  // Update the assistant UI when new data is available
  onDataUpdate() {
    this.updateUI();
  }
}

// Export the AssistantUI class
export default AssistantUI;
