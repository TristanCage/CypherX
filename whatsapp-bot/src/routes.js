import express from 'express';
import { Logger } from './utils/logger.js';

const logger = new Logger();

export function setupRoutes(app, client, messageHandler) {
  /**
   * Health check endpoint
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date(),
      bot: process.env.BOT_NAME || 'Cyher Bot'
    });
  });

  /**
   * Get bot statistics
   */
  app.get('/api/stats', (req, res) => {
    try {
      const stats = messageHandler.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Error getting stats: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get WhatsApp connection status
   */
  app.get('/api/status', (req, res) => {
    const isReady = client.info !== undefined;
    res.json({
      connected: isReady,
      info: isReady ? client.info : null,
      timestamp: new Date()
    });
  });

  /**
   * Send message via API (Admin endpoint)
   */
  app.post('/api/send-message', async (req, res) => {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and message are required'
        });
      }

      // Format phone number (ensure it has @c.us suffix)
      const chatId = phone.includes('@') ? phone : `${phone}@c.us`;

      await client.sendMessage(chatId, message);

      res.json({
        success: true,
        message: `Message sent to ${phone}`
      });

      logger.info(`Message sent via API to ${phone}`);
    } catch (error) {
      logger.error(`API send error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get chat list
   */
  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await client.getChats();
      const chatList = chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage ? chat.lastMessage.body : null
      }));

      res.json({
        success: true,
        chats: chatList
      });
    } catch (error) {
      logger.error(`Error getting chats: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 404 Handler
   */
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      path: req.path
    });
  });

  logger.info('API routes configured');
}
