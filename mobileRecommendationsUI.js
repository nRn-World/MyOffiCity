/**
 * Mobile Recommendations UI Module
 * Handles the display of recommendations in the mobile interface
 */
class MobileRecommendationsUI {
  constructor(recommendationsModule) {
    this.recommendationsModule = recommendationsModule;
    this.recommendationsContainer = null;
  }

  /**
   * Initialize the UI component
   * @param {HTMLElement} container - The container element for recommendations
   */
  init(container) {
    this.recommendationsContainer = container;
    this.renderRecommendations();
  }

  /**
   * Render the recommendations in the UI
   */
  renderRecommendations() {
    if (!this.recommendationsContainer) return;

    const recommendations = this.recommendationsModule.getRecommendations();

    // Clear previous recommendations
    this.recommendationsContainer.innerHTML = '';

    // Create and append recommendation elements
    recommendations.forEach(rec => {
      const recElement = this.createRecommendationElement(rec);
      this.recommendationsContainer.appendChild(recElement);
    });
  }

  /**
   * Create a DOM element for a single recommendation
   * @param {Object} recommendation - The recommendation data
   * @returns {HTMLElement} The created recommendation element
   */
  createRecommendationElement(recommendation) {
    const recElement = document.createElement('div');
    recElement.className = `recommendation ${recommendation.type} ${recommendation.priority}`;

    const titleElement = document.createElement('h3');
    titleElement.textContent = recommendation.title;

    const descElement = document.createElement('p');
    descElement.textContent = recommendation.description;

    recElement.appendChild(titleElement);
    recElement.appendChild(descElement);

    // Add time information if available
    if (recommendation.time) {
      const timeElement = document.createElement('p');
      timeElement.className = 'time';
      timeElement.textContent = `Best at ${recommendation.time}`;
      recElement.appendChild(timeElement);
    }

    //
