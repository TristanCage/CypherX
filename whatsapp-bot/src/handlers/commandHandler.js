import { Logger } from '../utils/logger.js';

export class CommandHandler {
  constructor(client, aiService) {
    this.client = client;
    this.aiService = aiService;
    this.logger = new Logger();
  }

  /**
   * Handle command messages
   */
  async handleCommand(message, command) {
    const chatId = message.from;
    const commandName = command.split(' ')[0].toLowerCase();
    const args = command.split(' ').slice(1).join(' ');

    this.logger.info(`🔧 Command received: ${commandName}`);

    switch (commandName) {
      case '/help':
        await this.handleHelp(chatId);
        break;

      case '/start':
        await this.handleStart(chatId);
        break;

      case '/clear':
        await this.handleClear(chatId, message.author || message.from);
        break;

      case '/stats':
        await this.handleStats(chatId);
        break;

      case '/menu':
        await this.handleMenu(chatId);
        break;

      case '/about':
        await this.handleAbout(chatId);
        break;

      default:
        await this.client.sendMessage(chatId, `❌ Unknown command: ${commandName}\n\nType /help for available commands.`);
    }
  }

  /**
   * Help command
   */
  async handleHelp(chatId) {
    const helpMessage = `
📚 *Available Commands*

/help - Show this message
/start - Start using the bot
/menu - Show main menu
/clear - Clear conversation history
/stats - Show bot statistics
/about - About this bot

Just send a regular message and I'll respond with AI-powered answers! 🤖
    `;
    await this.client.sendMessage(chatId, helpMessage);
  }

  /**
   * Start command
   */
  async handleStart(chatId) {
    const startMessage = `
👋 Welcome to Cyher Bot!

I'm an AI-powered WhatsApp assistant ready to help you with:
• Answering questions
• Having conversations
• Providing information
• And much more!

How can I assist you today? 😊
    `;
    await this.client.sendMessage(chatId, startMessage);
  }

  /**
   * Clear conversation history
   */
  async handleClear(chatId, userId) {
    this.aiService.clearHistory(userId);
    await this.client.sendMessage(chatId, '🗑️ Conversation history cleared!');
    this.logger.info(`Cleared history for ${userId}`);
  }

  /**
   * Stats command
   */
  async handleStats(chatId) {
    const stats = this.aiService.getStats();
    const statsMessage = `
📊 *Bot Statistics*

Active Conversations: ${stats.activeConversations}
Total Users: ${stats.totalUsers}

Status: ✅ Online and running
    `;
    await this.client.sendMessage(chatId, statsMessage);
  }

  /**
   * Menu command
   */
  async handleMenu(chatId) {
    const menuMessage = `
🎯 *Main Menu*

What would you like to do?

1️⃣ Chat with me (just send a message)
2️⃣ Get help (/help)
3️⃣ Learn about me (/about)
4️⃣ View statistics (/stats)
5️⃣ Clear history (/clear)

Feel free to ask me anything! 💬
    `;
    await this.client.sendMessage(chatId, menuMessage);
  }

  /**
   * About command
   */
  async handleAbout(chatId) {
    const aboutMessage = `
ℹ️ *About Cyher Bot*

🤖 Name: Cyher Bot
🚀 Version: 1.0.0
💡 Powered by: OpenAI GPT

I'm an intelligent WhatsApp bot designed to:
• Have natural conversations
• Answer your questions
• Help with information lookups
• Provide assistance 24/7

Type /help for more commands!
    `;
    await this.client.sendMessage(chatId, aboutMessage);
  }
}
