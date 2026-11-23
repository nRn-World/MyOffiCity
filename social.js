// Social features module for MyOffiCity

class SocialFeatures {
  constructor() {
    this.users = {};
    this.friendRequests = {};
    this.chats = {};
    this.currentUser = null;
  }

  // Initialize social features
  init() {
    this.loadUsers();
    this.setupEventListeners();
  }

  // Load users from localStorage
  loadUsers() {
    const savedUsers = localStorage.getItem('myofficityUsers');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }

    const savedFriendRequests = localStorage.getItem('myofficityFriendRequests');
    if (savedFriendRequests) {
      this.friendRequests = JSON.parse(savedFriendRequests);
    }

    const savedChats = localStorage.getItem('myofficityChats');
    if (savedChats) {
      this.chats = JSON.parse(savedChats);
    }
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem('myofficityUsers', JSON.stringify(this.users));
    localStorage.setItem('myofficityFriendRequests', JSON.stringify(this.friendRequests));
    localStorage.setItem('myofficityChats', JSON.stringify(this.chats));
  }

  // Set current user
  setCurrentUser(userId) {
    this.currentUser = userId;
  }

  // Create a new user profile
  createUser(userId, username, email) {
    if (!this.users[userId]) {
      this.users[userId] = {
        id: userId,
        username: username,
        email: email,
        friends: [],
        profile: {
          bio: '',
          avatar: '',
          office: ''
        }
      };
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Update user profile
  updateProfile(userId, updates) {
    if (this.users[userId]) {
      this.users[userId].profile = { ...this.users[userId].profile, ...updates };
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Send friend request
  sendFriendRequest(senderId, receiverId) {
    if (this.users[senderId] && this.users[receiverId] && senderId !== receiverId) {
      if (!this.users[receiverId].friends.includes(senderId) &&
          !this.friendRequests[receiverId]?.includes(senderId)) {
        if (!this.friendRequests[receiverId]) {
          this.friendRequests[receiverId] = [];
        }
        this.friendRequests[receiverId].push(senderId);
        this.saveUsers();
        return true;
      }
    }
    return false;
  }

  // Accept friend request
  acceptFriendRequest(userId, friendId) {
    if (this.users[userId] && this.users[friendId] &&
        this.friendRequests[userId]?.includes(friendId)) {
      // Add to friends list
      this.users[userId].friends.push(friendId);
      this.users[friendId].friends.push(userId);

      // Remove from friend requests
      this.friendRequests[userId] = this.friendRequests[userId].filter(id => id !== friendId);

      this.saveUsers();
      return true;
    }
    return false;
  }

  // Reject friend request
  rejectFriendRequest(userId, friendId) {
    if (this.users[userId] && this.friendRequests[userId]?.includes(friendId)) {
      this.friendRequests[userId] = this.friendRequests[userId].filter(id => id !== friendId);
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Get user profile
  getUserProfile(userId) {
    return this.users[userId] ? { ...this.users[userId] } : null;
  }

  // Get friends list
  getFriends(userId) {
    if (this.users[userId]) {
      return this.users[userId].friends.map(friendId => ({
        id: friendId,
        username: this.users[friendId].username,
        profile: this.users[friendId].profile
      }));
    }
    return [];
  }

  // Get friend requests
  getFriendRequests(userId) {
    if (this.friendRequests[userId]) {
      return this.friendRequests[userId].map(requestId => ({
        id: requestId,
        username: this.users[requestId].username,
        profile: this.users[requestId].profile
      }));
    }
    return [];
  }

  // Start a chat
  startChat(userId1, userId2) {
    const chatId = [userId1, userId2].sort().join('_');
    if (!this.chats[chatId]) {
      this.chats[chatId] = {
        participants: [userId1, userId2],
        messages: []
      };
      this.saveUsers();
    }
    return chatId;
  }

  // Send a message
  sendMessage(chatId, senderId, content) {
    if (this.chats[chatId] && this.chats[chatId].participants.includes(senderId)) {
      this.chats[chatId].messages.push({
        sender: senderId,
        content: content,
        timestamp: new Date().toISOString()
      });
      this.saveUsers();
      return true;
    }
    return false;
  }

  // Get chat messages
  getChatMessages(chatId) {
    if (this.chats[chatId]) {
      return [...this.chats[chatId].messages];
    }
    return [];
  }

  // Setup event listeners for UI
  setupEventListeners() {
    // This would be implemented in the main app.js to connect to the UI
  }
}

// Export the SocialFeatures class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialFeatures;
} else {
  window.SocialFeatures = SocialFeatures;
}
