import { Logger } from '../utils/logger.js';
import { CommandHandler } from './commandHandler.js';

export class MessageHandler {
  constructor(client, aiService) {
    this.client = client;
    this.aiService = aiService;
    this.logger = new Logger();
    this.commandHandler = new CommandHandler(client, aiService);
    this.messageQueue = [];
    this.isProcessing = false;
  }

  /**
   * Main message handler
   */
  async handleMessage(message) {
    // Ignore messages from the bot itself
    if (message.fromMe) {
      return;
    }

    // Ignore group messages for now (optional)
    if (message.isGroupMsg && !process.env.ENABLE_GROUP_MESSAGES) {
      return;
    }

    // Log incoming message
    this.logger.info(`📨 Message from ${message.from}: ${message.body}`);

    // Queue message for processing
    this.messageQueue.push(message);
    this.processQueue();
  }

  /**
   * Process message queue to avoid rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      try {
        await this.processMessage(message);
        // Small delay between messages to avoid rate limiting
        await this.delay(500);
      } catch (error) {
        this.logger.error(`Error processing message: ${error.message}`);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process individual message
   */
  async processMessage(message) {
    const chatId = message.from;
    const userId = message.author || message.from;
    const messageBody = message.body.trim();

    // Show typing indicator
    await this.client.sendPresenceSubscription(chatId);
    await this.client.sendSeen(message.id);

    // Check for commands
    if (messageBody.startsWith('/')) {
      await this.commandHandler.handleCommand(message, messageBody);
      return;
    }

    // Handle media messages
    if (message.hasMedia) {
      await this.handleMediaMessage(message, chatId);
      return;
    }

    // Get AI response
    let response;
    if (process.env.ENABLE_AI === 'true') {
      response = await this.aiService.generateResponse(messageBody, userId);
    } else {
      response = this.aiService.getDefaultResponse(messageBody);
    }

    // Send response with typing effect
    await this.sendResponseWithTyping(chatId, response);
  }

  /**
   * Send response with typing indicator
   */
  async sendResponseWithTyping(chatId, response, delayMs = 1000) {
    try {
      // Show typing indicator
      const chat = await this.client.getChatById(chatId);
      await chat.sendStateTyping();

      // Simulate typing delay
      await this.delay(delayMs);

      // Send message
      await this.client.sendMessage(chatId, response);
      this.logger.info(`✅ Response sent to ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send response: ${error.message}`);
    }
  }

  /**
   * Handle media messages
   */
  async handleMediaMessage(message, chatId) {
    try {
      const media = await message.downloadMedia();
      this.logger.info(`📸 Media received from ${chatId}: ${media.mimetype}`);

      const response = `Thanks for sharing! I received a ${media.mimetype} file. ✨`;
      await this.sendResponseWithTyping(chatId, response);
    } catch (error) {
      this.logger.error(`Error handling media: ${error.message}`);
      await this.client.sendMessage(chatId, 'Sorry, I had trouble processing that media. 😅');
    }
  }

  /**
   * Utility: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      queuedMessages: this.messageQueue.length,
      isProcessing: this.isProcessing,
      aiStats: this.aiService.getStats()
    };
  }
}
