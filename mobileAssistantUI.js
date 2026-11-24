// Mobile Assistant UI for MyOffiCity
// Provides a user interface for the mobile assistant

class MobileAssistantUI {
  constructor(assistant) {
    this.assistant = assistant;
    this.uiContainer = null;
    this.recommendationsContainer = null;
    this.loadingIndicator = null;
  }

  initialize() {
    // Create the UI container
    this.createUIContainer();

    // Set up the UI
    this.setupUI();

    // Show the UI
    this.showUI();
  }

  createUIContainer() {
    // Create the main container for the mobile assistant UI
    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'mobile-assistant-ui';
    this.uiContainer.className = 'mobile-assistant-ui';

    // Create the recommendations container
    this.recommendationsContainer = document.createElement('div');
    this.recommendationsContainer.className = 'recommendations-container';

    // Create the loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.textContent = 'Loading recommendations...';

    // Add the loading indicator to the recommendations container
    this.recommendationsContainer.appendChild(this.loadingIndicator);

    // Add the recommendations container to the UI container
    this.uiContainer.appendChild(this.recommendationsContainer);

    // Add the UI container to the document body
    document.body.appendChild(this.uiContainer);
  }

  setupUI() {
    // Set up the UI elements and event listeners
    // This would be expanded in a real implementation
  }

  showUI() {
    // Show the mobile assistant UI
    this.uiContainer.style.display = 'block';

    // Load and display recommendations
    this.loadRecommendations();
  }

  async loadRecommendations() {
    // Show the loading indicator
    this.loadingIndicator.style.display = 'block';

    try {
      // Get recommendations from the assistant
      const recommendations = await this.assistant.getRecommendations();

      // Hide the loading indicator
      this.loadingIndicator.style.display = 'none';

      // Display the recommendations
      this.displayRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);

      // Hide the loading indicator
      this.loadingIndicator.style.display = 'none';

      // Show an error message
      this.showErrorMessage('Failed to load recommendations. Please try again later.');
    }
  }

  displayRecommendations(recommendations) {
    // Clear the recommendations container
    this.recommendationsContainer.innerHTML = '';

    // Add each recommendation to the container
    recommendations.forEach(recommendation => {
      const recommendationElement = this.createRecommendationElement(recommendation);
      this.recommendationsContainer.appendChild(recommendationElement);
    });
  }

  createRecommendationElement(recommendation) {
    // Create a container for the recommendation
    const container = document.createElement('div');
    container.className = 'recommendation';

    // Create a heading for the task
    const taskHeading = document.createElement('h3');
    taskHeading.textContent = recommendation.task;
    container.appendChild(taskHeading);

    // Create a paragraph for the recommendation text
    const recommendationText = document.createElement('p');
    recommendationText.textContent = recommendation.recommendation;
    container.appendChild(recommendationText);

    // Create a paragraph for the confidence level
    const confidenceText = document.createElement('p');
    confidenceText.className = 'confidence';
    confidenceText.textContent = `Confidence: ${Math.round(recommendation.confidence * 100)}%`;
    container.appendChild(confidenceText);

    return container;
  }

  showErrorMessage(message) {
    // Create an error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Add the error message to the recommendations container
    this.recommendationsContainer.appendChild(errorElement);
  }
}

// Export the MobileAssistantUI class
export default MobileAssistantUI;
