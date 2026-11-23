// app.js
// Main application file for MyOffiCity

import { storage, userData, currentUserData } from './core.js';

// Initialize the app
function initApp() {
  // Load user data
  const userData = userData.load();

  // Set up event listeners
  setupEventListeners();

  // Initialize UI
  initUI();

  // Load city assets
  loadCityAssets();

  console.log('App initialized with user data:', userData);
}

// Set up event listeners
function setupEventListeners() {
  // Example: Save user data when window is about to unload
  window.addEventListener('beforeunload', () => {
    userData.save(currentUserData);
  });

  // Add more event listeners as needed
}

// Initialize UI
function initUI() {
  // Initialize UI components
  // This would include setting up the office view, chat, team, etc.
}

// Load city assets
function loadCityAssets() {
  // Load 3D models and other assets for the city
}

// Start the app
initApp();
