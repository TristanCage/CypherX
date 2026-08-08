import { OpenAI } from 'openai';
import { Logger } from '../utils/logger.js';

export class AIService {
  constructor() {
    this.logger = new Logger();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.conversationHistory = new Map();
    this.systemPrompt = `You are Cyher, a helpful and friendly WhatsApp assistant bot. 
You provide helpful, accurate, and concise responses. 
Keep responses brief for WhatsApp (under 500 characters when possible).
Be professional but friendly in tone.`;
  }

  /**
   * Generate AI response using OpenAI GPT
   */
  async generateResponse(userMessage, userId) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.getDefaultResponse(userMessage);
      }

      // Get conversation history for context
      const history = this.conversationHistory.get(userId) || [];
      
      // Build messages array
      const messages = [
        ...history,
        { role: 'user', content: userMessage }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const assistantMessage = response.choices[0].message.content;

      // Update conversation history
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: assistantMessage });
      
      // Keep only last 10 messages for memory efficiency
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      this.conversationHistory.set(userId, history);

      return assistantMessage;
    } catch (error) {
      this.logger.error(`AI Service Error: ${error.message}`);
      return this.getDefaultResponse(userMessage);
    }
  }

  /**
   * Fallback response when AI is unavailable
   */
  getDefaultResponse(userMessage) {
    const responses = {
      'hello': 'Hi there! 👋 How can I help you today?',
      'hi': 'Hello! What can I do for you?',
      'help': 'I can help with:\n• General questions\n• Information lookup\n• Fun conversations\n\nJust ask me anything!',
      'thanks': 'You\'re welcome! 😊',
      'thank you': 'Happy to help!',
      'bye': 'Goodbye! Have a great day! 👋'
    };

    const lowerMessage = userMessage.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    return `I received your message: "${userMessage}". How can I assist you better?`;
  }

  /**
   * Clear conversation history for a user
   */
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
    this.logger.info(`Cleared conversation history for ${userId}`);
  }

  /**
   * Get conversation stats
   */
  getStats() {
    return {
      activeConversations: this.conversationHistory.size,
      totalUsers: this.conversationHistory.size
    };
  }
}
