// assistantUI.js
import AIAssistant from './aiAssistant.js';

class AssistantUI {
  constructor() {
    this.meetingSuggestionsContainer = document.getElementById('meeting-suggestions');
    this.init();
  }

  async init() {
    // Get user ID from session or authentication
    const userId = 'current-user-id'; // Replace with actual user ID

    // Get meeting suggestions
    const suggestions = await AIAssistant.suggestMeetings(userId);

    // Display meeting suggestions
    this.displayMeetingSuggestions(suggestions);
  }

  displayMeetingSuggestions(suggestions) {
    if (!this.meetingSuggestionsContainer) return;

    this.meetingSuggestionsContainer.innerHTML = '';

    if (suggestions.length === 0) {
      this.meetingSuggestionsContainer.innerHTML = '<p>No meeting suggestions at the moment.</p>';
      return;
    }

    const suggestionsList = document.createElement('ul');
    suggestionsList.className = 'meeting-suggestions-list';

    suggestions.forEach(suggestion => {
      const listItem = document.createElement('li');
      listItem.className = 'meeting-suggestion';

      const title = document.createElement('h3');
      title.textContent = suggestion.title;

      const time = document.createElement('p');
      time.textContent = `Time: ${this.formatTime(suggestion.startTime)} - ${this.formatTime(suggestion.endTime)}`;

      const participants = document.createElement('p');
      participants.textContent = `Participants: ${suggestion.participants.join(', ')}`;

      const suggestedBy = document.createElement('p');
      suggestedBy.textContent = `Suggested by: ${suggestion.suggestedBy}`;

      const acceptButton = document.createElement('button');
      acceptButton.textContent = 'Accept';
      acceptButton.className = 'accept-meeting';
      acceptButton.addEventListener('click', () => this.acceptMeeting(suggestion));

      listItem.appendChild(title);
      listItem.appendChild(time);
      listItem.appendChild(participants);
      listItem.appendChild(suggestedBy);
      listItem.appendChild(acceptButton);

      suggestionsList.appendChild(listItem);
    });

    this.meetingSuggestionsContainer.appendChild(suggestionsList);
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  acceptMeeting(meeting) {
    // Logic to accept the meeting
    console.log('Meeting accepted:', meeting);
    // In a real application, this would add the meeting to the calendar
  }
}

// Initialize the Assistant UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AssistantUI();
});
