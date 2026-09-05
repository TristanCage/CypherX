import { Logger } from '../utils/logger.js';
import os from 'os';

export class SelfMonitor {
  constructor(client, logger) {
    this.client = client;
    this.logger = new Logger('SelfMonitor');
    this.diagnostics = {
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      lastCheck: null,
      issues: [],
      fixes: []
    };
    this.startTime = Date.now();
    this.statusHistory = [];
  }

  /**
   * Run full diagnostic check
   */
  async runDiagnostics() {
    try {
      this.logger.info('🔧 Running system diagnostics...');

      const status = {
        timestamp: new Date(),
        checks: {
          memory: this.checkMemory(),
          connection: await this.checkConnection(),
          files: this.checkFiles(),
          performance: this.checkPerformance()
        }
      };

      this.diagnostics.lastCheck = status;
      this.statusHistory.push(status);

      // Keep only last 50 checks
      if (this.statusHistory.length > 50) {
        this.statusHistory.shift();
      }

      // Fix issues if found
      await this.autoFix(status);

      this.logger.info('✅ Diagnostics complete');
    } catch (error) {
      this.logger.error(`Diagnostic error: ${error.message}`);
    }
  }

  /**
   * Check memory usage
   */
  checkMemory() {
    const used = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    this.diagnostics.memoryUsage = usagePercent;

    if (usagePercent > 80) {
      this.diagnostics.issues.push(`⚠️ High memory usage: ${usagePercent.toFixed(2)}%`);
      this.logger.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
    }

    return {
      heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(used.external / 1024 / 1024).toFixed(2)} MB`,
      systemUsage: `${usagePercent.toFixed(2)}%`,
      status: usagePercent > 80 ? '⚠️ HIGH' : '✅ OK'
    };
  }

  /**
   * Check connection status
   */
  async checkConnection() {
    try {
      const isReady = this.client.info !== undefined;
      
      return {
        connected: isReady,
        status: isReady ? '✅ Connected' : '❌ Disconnected',
        info: isReady ? {
          phone: this.client.info.me,
          platform: this.client.info.platform
        } : null
      };
    } catch (error) {
      return {
        connected: false,
        status: `❌ Error: ${error.message}`,
        info: null
      };
    }
  }

  /**
   * Check critical files
   */
  checkFiles() {
    const fs = require('fs');
    const requiredFiles = [
      'src/index.js',
      'src/handlers/messageHandler.js',
      'src/services/aiService.js',
      '.env',
      'package.json'
    ];

    const missing = [];
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        missing.push(file);
      }
    });

    if (missing.length > 0) {
      this.diagnostics.issues.push(`Missing files: ${missing.join(', ')}`);
    }

    return {
      requiredFiles: requiredFiles.length,
      present: requiredFiles.length - missing.length,
      missing: missing,
      status: missing.length === 0 ? '✅ All OK' : `⚠️ ${missing.length} missing`
    };
  }

  /**
   * Check performance metrics
   */
  checkPerformance() {
    const uptime = (Date.now() - this.startTime) / 1000;
    this.diagnostics.uptime = uptime;

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return {
      uptime: `${hours}h ${minutes}m`,
      uptimeSeconds: Math.floor(uptime),
      status: uptime > 86400 ? '✅ 24h+ stable' : '✅ Running'
    };
  }

  /**
   * Auto-fix detected issues
   */
  async autoFix(status) {
    const fs = require('fs');

    // Fix high memory usage
    if (status.checks.memory.systemUsage > 80) {
      this.logger.warn('🧹 Clearing cache to free memory...');
      
      try {
        if (fs.existsSync('.wwebjs_cache')) {
          fs.rmSync('.wwebjs_cache', { recursive: true });
          this.diagnostics.fixes.push('Cleared .wwebjs_cache');
        }
      } catch (error) {
        this.logger.debug(`Could not clear cache: ${error.message}`);
      }
    }

    // Check if critical services are running
    if (!status.checks.connection.connected) {
      this.logger.warn('⚠️ Connection lost! Attempting reconnect...');
      this.diagnostics.issues.push('Connection was lost');
    }
  }

  /**
   * Send startup notification
   */
  async notifyStartup() {
    try {
      // Get admin phone from env
      const adminPhone = process.env.ADMIN_PHONE;
      
      if (adminPhone) {
        const message = `
✅ CypherX Bot Started Successfully!

📊 System Info:
• Bot Name: ${process.env.BOT_NAME}
• Version: 2.0.0
• Status: Online
• Time: ${new Date().toLocaleString()}

🚀 Ready to serve!
`;
        
        await this.client.sendMessage(`${adminPhone}@c.us`, message);
        this.logger.info('📬 Startup notification sent');
      }
    } catch (error) {
      this.logger.debug(`Could not send startup notification: ${error.message}`);
    }
  }

  /**
   * Get diagnostics report
   */
  getDiagnosticsReport() {
    return {
      timestamp: new Date(),
      uptime: this.diagnostics.uptime,
      memoryUsage: this.diagnostics.memoryUsage,
      issues: this.diagnostics.issues,
      fixes: this.diagnostics.fixes,
      lastCheck: this.diagnostics.lastCheck,
      statusHistory: this.statusHistory.slice(-10)
    };
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    const health = {
      status: 'UNKNOWN',
      score: 0,
      details: {}
    };

    if (this.diagnostics.lastCheck) {
      const checks = this.diagnostics.lastCheck.checks;
      
      let score = 100;
      
      // Deduct points for issues
      if (checks.memory.systemUsage > 80) score -= 30;
      if (!checks.connection.connected) score -= 50;
      if (checks.files.missing.length > 0) score -= 40;

      health.score = Math.max(0, score);
      health.status = score >= 80 ? '✅ HEALTHY' : score >= 50 ? '⚠️ WARNING' : '❌ CRITICAL';
      health.details = checks;
    }

    return health;
  }
}
