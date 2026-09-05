import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../utils/logger.js';

export class AutoUpdater {
  constructor() {
    this.logger = new Logger('AutoUpdater');
    this.updateCheckFile = '.last_update_check';
    this.currentVersion = '2.0.0';
    this.updateLog = [];
  }

  /**
   * Check for updates from GitHub
   */
  async checkForUpdates() {
    try {
      this.logger.info('🔍 Checking for updates...');
      
      const response = await fetch('https://api.github.com/repos/salma1877/CypherX/commits/main', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      if (!response.ok) {
        this.logger.warn('Could not check for updates');
        return;
      }

      const data = await response.json();
      const latestCommit = data.sha;
      const currentCommit = this.getStoredCommit();

      if (latestCommit !== currentCommit) {
        this.logger.info(`✅ Update available! New commit: ${latestCommit}`);
        await this.performUpdate();
      } else {
        this.logger.info('✅ Already on latest version');
      }
    } catch (error) {
      this.logger.error(`Update check failed: ${error.message}`);
    }
  }

  /**
   * Perform automatic update
   */
  async performUpdate() {
    try {
      this.logger.info('📦 Performing auto-update...');

      // Pull latest changes
      execSync('git pull origin main', { stdio: 'inherit' });

      // Install new dependencies
      execSync('npm install', { stdio: 'inherit' });

      this.logger.info('✅ Update completed successfully!');
      this.addLog('Update completed successfully');

      // Optionally restart
      if (process.env.AUTO_RESTART_ON_UPDATE === 'true') {
        this.logger.info('🔄 Restarting bot...');
        this.restartBot();
      }
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      this.addLog(`Update failed: ${error.message}`);
    }
  }

  /**
   * Get stored commit hash
   */
  getStoredCommit() {
    try {
      if (fs.existsSync(this.updateCheckFile)) {
        return fs.readFileSync(this.updateCheckFile, 'utf8').trim();
      }
    } catch (error) {
      this.logger.debug(`Could not read stored commit: ${error.message}`);
    }
    return null;
  }

  /**
   * Store commit hash
   */
  storeCommit(hash) {
    try {
      fs.writeFileSync(this.updateCheckFile, hash, 'utf8');
    } catch (error) {
      this.logger.error(`Could not store commit: ${error.message}`);
    }
  }

  /**
   * Restart the bot
   */
  restartBot() {
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  }

  /**
   * Add to update log
   */
  addLog(message) {
    const timestamp = new Date().toISOString();
    this.updateLog.push(`[${timestamp}] ${message}`);
    
    // Keep only last 100 logs
    if (this.updateLog.length > 100) {
      this.updateLog.shift();
    }
  }

  /**
   * Get update history
   */
  getUpdateHistory() {
    return this.updateLog;
  }

  /**
   * Get version info
   */
  getVersionInfo() {
    return {
      version: this.currentVersion,
      lastUpdate: new Date().toISOString(),
      updateLog: this.updateLog.slice(-10)
    };
  }
}
