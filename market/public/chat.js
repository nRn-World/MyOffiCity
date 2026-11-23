import { openai } from '../llms.txt';

class Chat {
    constructor() {
        this.conversationHistory = [];
        this.chatBox = document.getElementById('chat-box');
        this.inputField = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const userMessage = this.inputField.value.trim();
        if (!userMessage) return;

        this.addToConversation('user', userMessage);
        this.inputField.value = '';

        try {
            const aiResponse = await this.getAIResponse(userMessage);
            this.addToConversation('ai', aiResponse);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            this.addToConversation('ai', 'Det verkar som att det fanns ett problem med att få svar från AI.');
        }
    }

    addToConversation(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = message;
        this.chatBox.appendChild(messageElement);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    async getAIResponse(message) {
        this.conversationHistory.push({ role: 'user', content: message });

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: this.conversationHistory }),
        });

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        this.conversationHistory.push({ role: 'assistant', content: aiMessage });

        return aiMessage;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Chat();
});
