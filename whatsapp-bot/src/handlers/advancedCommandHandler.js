import { Logger } from '../utils/logger.js';
import axios from 'axios';
import crypto from 'crypto';

export class AdvancedCommandHandler {
  constructor(client, aiService, autoUpdater, selfMonitor) {
    this.client = client;
    this.aiService = aiService;
    this.autoUpdater = autoUpdater;
    this.selfMonitor = selfMonitor;
    this.logger = new Logger('CommandHandler');
    this.userPermissions = new Map();
    this.commandAliases = this.setupAliases();
  }

  /**
   * Setup command aliases
   */
  setupAliases() {
    return {
      'h': '/help',
      'start': '/start',
      'menu': '/menu',
      'cls': '/clear',
      'statistics': '/stats',
      'info': '/about',
      'update': '/update',
      'monitor': '/monitor',
      'ping': '/ping',
      'system': '/system',
      'health': '/health',
      'version': '/version',
      'restart': '/restart',
      'broadcast': '/broadcast',
      'admin': '/admin',
      'log': '/log'
    };
  }

  /**
   * Main command handler with advanced features
   */
  async handleCommand(message, command) {
    const chatId = message.from;
    const userId = message.author || message.from;
    const parts = command.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    // Check for aliases
    const actualCommand = this.commandAliases[commandName.slice(1)] || commandName;

    this.logger.info(`🔧 Command received: ${commandName} | Args: ${args}`);

    try {
      switch (actualCommand) {
        // Basic Commands
        case '/help':
          await this.handleHelp(chatId);
          break;
        case '/start':
          await this.handleStart(chatId);
          break;
        case '/menu':
          await this.handleMenu(chatId);
          break;
        case '/about':
          await this.handleAbout(chatId);
          break;
        case '/clear':
          await this.handleClear(chatId, userId);
          break;

        // Statistics & Monitoring
        case '/stats':
          await this.handleStats(chatId);
          break;
        case '/ping':
          await this.handlePing(chatId);
          break;
        case '/system':
          await this.handleSystemInfo(chatId);
          break;
        case '/health':
          await this.handleHealth(chatId);
          break;

        // Bot Management
        case '/version':
          await this.handleVersion(chatId);
          break;
        case '/update':
          await this.handleUpdate(chatId);
          break;
        case '/restart':
          await this.handleRestart(chatId);
          break;
        case '/monitor':
          await this.handleMonitor(chatId);
          break;

        // Advanced Features
        case '/broadcast':
          await this.handleBroadcast(chatId, userId, args);
          break;
        case '/admin':
          await this.handleAdmin(chatId, userId, args);
          break;
        case '/log':
          await this.handleLog(chatId, args);
          break;

        // AI Features
        case '/ask':
          await this.handleAsk(chatId, userId, args);
          break;

        default:
          await this.client.sendMessage(chatId, `❌ Unknown command: ${commandName}\n\nType /help for available commands.`);
      }
    } catch (error) {
      this.logger.error(`Command error: ${error.message}`);
      await this.client.sendMessage(chatId, `❌ Error executing command: ${error.message}`);
    }
  }

  /**
   * Help command
   */
  async handleHelp(chatId) {
    const helpMessage = `
╔════════════════════════════════════════╗
║   🤖 CYPHER X BOT v2.0 - HELP          ║
╚════════════════════════════════════════╝

📚 BASIC COMMANDS:
/start    - Start using the bot
/menu     - Show main menu
/about    - About this bot
/help     - Show this message

📊 STATISTICS & INFO:
/stats    - View bot statistics
/ping     - Check bot response time
/system   - System information
/health   - System health check
/version  - Bot version info

🔧 MANAGEMENT:
/update   - Check for updates
/restart  - Restart bot
/monitor  - Real-time monitoring
/log      - View bot logs

⚡ ADVANCED:
/ask      - Ask AI anything
/broadcast - Send message to users
/admin    - Admin controls
/clear    - Clear conversation

📞 QUICK ALIASES:
h = /help | menu = /menu | stats = /stats
info = /about | ping = /ping | log = /log

Type any command to execute!
`;
    await this.client.sendMessage(chatId, helpMessage);
  }

  /**
   * Start command
   */
  async handleStart(chatId) {
    const startMessage = `
╔════════════════════════════════════════╗
║   👋 WELCOME TO CYPHER X BOT           ║
╚════════════════════════════════════════╝

🤖 I'm an advanced WhatsApp assistant powered by:
  • AI GPT Technology
  • Real-time Monitoring
  • Auto-Updates
  • Smart Command System

✨ What I can do:
  ✓ Answer your questions
  ✓ Have natural conversations
  ✓ Process media files
  ✓ Track system stats
  ✓ Execute advanced commands

🚀 Let's get started!
Type /menu to see options
    `;
    await this.client.sendMessage(chatId, startMessage);
  }

  /**
   * Menu command
   */
  async handleMenu(chatId) {
    const menuMessage = `
╔════════════════════════════════════════╗
║   🎯 MAIN MENU                         ║
╚════════════════════════════════════════╝

1️⃣  Chat with AI (/ask)
2️⃣  View Statistics (/stats)
3️⃣  System Health (/health)
4️⃣  Bot Version (/version)
5️⃣  Help & Commands (/help)
6️⃣  Monitor Bot (/monitor)
7️⃣  Clear History (/clear)
8️⃣  System Info (/system)

⚡ Just send /command to execute!

Need help? Type /help
    `;
    await this.client.sendMessage(chatId, menuMessage);
  }

  /**
   * Stats command
   */
  async handleStats(chatId) {
    const stats = this.aiService.getStats();
    const health = this.selfMonitor.getSystemHealth();
    
    const statsMessage = `
╔════════════════════════════════════════╗
║   📊 BOT STATISTICS                    ║
╚════════════════════════════════════════╝

💬 CHAT STATS:
• Active Users: ${stats.totalUsers}
• Active Conversations: ${stats.activeConversations}
• Total Messages: ${stats.totalMessages || 'N/A'}

🖥️  SYSTEM STATUS:
• Health: ${health.status}
• Score: ${health.score}%
• Uptime: ${Math.floor(this.selfMonitor.diagnostics.uptime / 3600)}h

📱 BOT INFO:
• Name: ${process.env.BOT_NAME}
• Version: 2.0.0
• Status: ✅ ONLINE
• Time: ${new Date().toLocaleString()}

    `;
    await this.client.sendMessage(chatId, statsMessage);
  }

  /**
   * Ping command
   */
  async handlePing(chatId) {
    const start = Date.now();
    const message = await this.client.sendMessage(chatId, '📡 Pinging...');
    const ping = Date.now() - start;
    
    await this.client.editMessage(message.id._serialized, `✅ Pong! Response time: ${ping}ms`);
  }

  /**
   * System info command
   */
  async handleSystemInfo(chatId) {
    const os = require('os');
    const diagnostics = this.selfMonitor.diagnostics.lastCheck;
    
    const systemMessage = `
╔════════════════════════════════════════╗
║   🖥️  SYSTEM INFORMATION               ║
╚════════════════════════════════════════╝

💾 MEMORY:
${diagnostics?.checks?.memory ? `• Heap: ${diagnostics.checks.memory.heapUsed}` : 'Loading...'}
• System Usage: ${this.selfMonitor.diagnostics.memoryUsage.toFixed(2)}%

🔗 CONNECTION:
${diagnostics?.checks?.connection ? `• Status: ${diagnostics.checks.connection.status}` : 'Loading...'}

⚙️  PERFORMANCE:
${diagnostics?.checks?.performance ? `• Uptime: ${diagnostics.checks.performance.uptime}` : 'Loading...'}

🗂️  FILES:
${diagnostics?.checks?.files ? `• Status: ${diagnostics.checks.files.status}` : 'Loading...'}

    `;
    await this.client.sendMessage(chatId, systemMessage);
  }

  /**
   * Health check command
   */
  async handleHealth(chatId) {
    const health = this.selfMonitor.getSystemHealth();
    const healthBar = '█'.repeat(Math.floor(health.score / 10)) + '░'.repeat(10 - Math.floor(health.score / 10));
    
    const healthMessage = `
╔════════════════════════════════════════╗
║   ❤️  SYSTEM HEALTH CHECK              ║
╚════════════════════════════════════════╝

Overall Status: ${health.status}

Health Score: [${healthBar}] ${health.score}%

Memory: ${health.details.memory?.status || '⏳'}
Connection: ${health.details.connection?.status || '⏳'}
Files: ${health.details.files?.status || '⏳'}
Performance: ${health.details.performance?.status || '⏳'}

    `;
    await this.client.sendMessage(chatId, healthMessage);
  }

  /**
   * Version command
   */
  async handleVersion(chatId) {
    const versionInfo = this.autoUpdater.getVersionInfo();
    
    const versionMessage = `
╔════════════════════════════════════════╗
║   📦 VERSION INFORMATION               ║
╚════════════════════════════════════════╝

🤖 Bot Name: ${process.env.BOT_NAME}
📌 Version: ${versionInfo.version}
📅 Last Update: ${versionInfo.lastUpdate}

🆕 Update Status:
• Auto-Update: ✅ Enabled
• Check Interval: Every 1 hour

Recent Updates:
${versionInfo.updateLog.slice(-3).map(log => '• ' + log).join('\n')}

    `;
    await this.client.sendMessage(chatId, versionMessage);
  }

  /**
   * Update command
   */
  async handleUpdate(chatId) {
    await this.client.sendMessage(chatId, '⏳ Checking for updates...');
    await this.autoUpdater.checkForUpdates();
    await this.client.sendMessage(chatId, '✅ Update check completed! Check console for details.');
  }

  /**
   * Monitor command
   */
  async handleMonitor(chatId) {
    const report = this.selfMonitor.getDiagnosticsReport();
    
    const monitorMessage = `
╔════════════════════════════════════════╗
║   📡 REAL-TIME MONITORING              ║
╚════════════════════════════════════════╝

🕐 Timestamp: ${report.timestamp.toLocaleString()}
⏱️  Uptime: ${(report.uptime / 3600).toFixed(2)} hours
💾 Memory: ${report.memoryUsage.toFixed(2)}%

🚨 Issues Detected: ${report.issues.length}
${report.issues.length > 0 ? report.issues.map(i => '⚠️ ' + i).join('\n') : '✅ No issues'}

🔧 Auto-Fixes Applied: ${report.fixes.length}
${report.fixes.length > 0 ? report.fixes.map(f => '✓ ' + f).join('\n') : '✅ No fixes needed'}

    `;
    await this.client.sendMessage(chatId, monitorMessage);
  }

  /**
   * Restart command
   */
  async handleRestart(chatId) {
    await this.client.sendMessage(chatId, '🔄 Restarting bot in 5 seconds...');
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  }

  /**
   * Clear command
   */
  async handleClear(chatId, userId) {
    this.aiService.clearHistory(userId);
    await this.client.sendMessage(chatId, '🗑️ Conversation history cleared!');
  }

  /**
   * About command
   */
  async handleAbout(chatId) {
    const aboutMessage = `
╔════════════════════════════════════════╗
║   ℹ️  ABOUT CYPHER X BOT               ║
╚════════════════════════════════════════╝

🤖 CYPHER X BOT v2.0
Advanced WhatsApp Automation System

✨ KEY FEATURES:
✓ AI-Powered Responses (GPT)
✓ Auto-Update System
✓ Self-Monitoring & Diagnostics
✓ Real-time Health Checks
✓ Smart Command System
✓ Conversation Memory
✓ Media Support
✓ REST API Endpoints
✓ Admin Controls
✓ Broadcast Messages

👨‍💻 Developer: Advanced AI Bot Team
📅 Release: June 2026
⚡ Status: Production Ready

🔗 Repository: 
https://github.com/salma1877/CypherX

    `;
    await this.client.sendMessage(chatId, aboutMessage);
  }

  /**
   * Ask AI command
   */
  async handleAsk(chatId, userId, question) {
    if (!question) {
      await this.client.sendMessage(chatId, '❓ Please ask a question.\nExample: /ask What is AI?');
      return;
    }
    
    await this.client.sendMessage(chatId, '🤔 Thinking...');
    const response = await this.aiService.generateResponse(question, userId);
    await this.client.sendMessage(chatId, response);
  }

  /**
   * Broadcast command
   */
  async handleBroadcast(chatId, userId, message) {
    if (!message) {
      await this.client.sendMessage(chatId, '📢 Please provide a message to broadcast');
      return;
    }
    await this.client.sendMessage(chatId, `✅ Broadcasting: "${message}"`);
  }

  /**
   * Admin command
   */
  async handleAdmin(chatId, userId, args) {
    const adminMessage = `
╔════════════════════════════════════════╗
║   🔐 ADMIN PANEL                       ║
╚════════════════════════════════════════╝

Available Admin Commands:
/admin restart   - Restart bot
/admin update    - Force update
/admin monitor   - Enable monitoring
/admin broadcast - Broadcast message

    `;
    await this.client.sendMessage(chatId, adminMessage);
  }

  /**
   * Log command
   */
  async handleLog(chatId, args) {
    const lines = parseInt(args) || 10;
    const logs = this.autoUpdater.getUpdateHistory().slice(-lines);
    
    const logMessage = `
📋 Recent Bot Logs (Last ${lines}):

${logs.map(log => '• ' + log).join('\n')}

    `;
    await this.client.sendMessage(chatId, logMessage);
  }
}
