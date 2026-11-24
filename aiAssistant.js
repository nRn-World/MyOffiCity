// aiAssistant.js
import { getCalendarEvents } from './calendar.js';
import { getUserActivity } from './userActivity.js';

class AIAssistant {
  constructor() {
    this.meetingSuggestions = [];
  }

  async suggestMeetings(userId) {
    const calendarEvents = await getCalendarEvents(userId);
    const userActivity = await getUserActivity(userId);

    // Analyze calendar and activity to suggest meetings
    this.meetingSuggestions = this.analyzeData(calendarEvents, userActivity);

    return this.meetingSuggestions;
  }

  analyzeData(calendarEvents, userActivity) {
    // Simple analysis for demonstration purposes
    // In a real application, this would be more sophisticated
    const suggestions = [];

    // Check for available time slots
    const availableSlots = this.findAvailableSlots(calendarEvents);

    // Suggest meetings based on user activity
    if (userActivity.recentProjects.length > 0) {
      availableSlots.forEach(slot => {
        suggestions.push({
          title: `Discuss ${userActivity.recentProjects[0].name}`,
          startTime: slot.start,
          endTime: slot.end,
          participants: userActivity.recentProjects[0].teamMembers,
          suggestedBy: 'AI Assistant'
        });
      });
    }

    return suggestions;
  }

  findAvailableSlots(calendarEvents) {
    // Simple slot finding logic
    // In a real application, this would be more sophisticated
    const slots = [];
    const now = new Date();

    // Check for available slots in the next 24 hours
    for (let i = 0; i < 24; i++) {
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + i);
      startTime.setMinutes(0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const isAvailable = !calendarEvents.some(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        return (startTime >= eventStart && startTime < eventEnd) ||
               (endTime > eventStart && endTime <= eventEnd) ||
               (startTime <= eventStart && endTime >= eventEnd);
      });

      if (isAvailable) {
        slots.push({ start: startTime, end: endTime });
      }
    }

    return slots;
  }
}

export default new AIAssistant();
