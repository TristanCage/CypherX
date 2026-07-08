import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { setupRoutes } from './routes.js';
import express from 'express';
import { AIService } from './services/aiService.js';
import { MessageHandler } from './handlers/messageHandler.js';
import { Logger } from './utils/logger.js';

dotenv.config();

const logger = new Logger();
const app = express();
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

app.use(express.json());

// Initialize services
const aiService = new AIService();
const messageHandler = new MessageHandler(client, aiService);

// QR Code Handler
client.on('qr', (qr) => {
  logger.info('QR Code received. Scan it with your phone:');
  qrcode.generate(qr, { small: true });
});

// Ready Event
client.on('ready', () => {
  logger.info('✅ WhatsApp Bot is ready!');
  logger.info(`Bot Name: ${process.env.BOT_NAME || 'Cyher Bot'}`);
});

// Message Handler
client.on('message', async (message) => {
  try {
    await messageHandler.handleMessage(message);
  } catch (error) {
    logger.error(`Error handling message: ${error.message}`);
  }
});

// Message Acknowledgment (optional feedback)
client.on('message_ack', (message, ack) => {
  logger.debug(`Message ${message.id._serialized} acknowledged: ${ack}`);
});

// Chat Opened Event
client.on('message_create', (message) => {
  if (!message.fromMe) {
    logger.info(`New message from ${message.author || message.from}: ${message.body}`);
  }
});

// Setup API Routes
setupRoutes(app, client, messageHandler);

// Start Bot & Server
const PORT = process.env.PORT || 3000;

client.initialize().catch((error) => {
  logger.error(`Failed to initialize WhatsApp client: ${error.message}`);
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📱 WhatsApp Bot initialized...`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  client.destroy();
  process.exit(0);
});
