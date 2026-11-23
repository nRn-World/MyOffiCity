// core.js
// Core functionality for MyOffiCity

// Local storage helper functions
const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error getting from localStorage', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error setting to localStorage', e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage', e);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  }
};

// User data management
const userData = {
  save: (data) => {
    storage.set('userData', data);
  },
  load: () => {
    return storage.get('userData') || {};
  },
  clear: () => {
    storage.remove('userData');
  }
};

// Initialize user data
let currentUserData = userData.load();

// Export functions for use in other modules
export { storage, userData, currentUserData };
