import { Bot } from '../models/Bot';
import { IBotDocument } from '../types';
import { BotService } from './BotService';
import { ItemSyncService } from './ItemSyncService';

export class BotSyncService {
  private botService: BotService;
  private itemSyncService: ItemSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private tradeProcessingInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isPollingEnabled = false;

  constructor() {
    this.botService = new BotService();
    this.itemSyncService = new ItemSyncService();
  }

  /**
   * Запуск автоматической синхронизации
   */
  startAutoSync(options: {
    syncIntervalMs?: number; // Интервал синхронизации инвентаря (по умолчанию 10 минут)
    tradeProcessingIntervalMs?: number; // Интервал обработки трейдов (по умолчанию 5 минут)
    cleanupIntervalMs?: number; // Интервал очистки истекших трейдов (по умолчанию 15 минут)
  } = {}) {
    if (this.isRunning) {
      console.log('⚠️ Bot sync service is already running');
      return;
    }

    const {
      syncIntervalMs = 10 * 60 * 1000, // 10 минут
      tradeProcessingIntervalMs = 5 * 60 * 1000, // 5 минут
      cleanupIntervalMs = 15 * 60 * 1000 // 15 минут
    } = options;

    console.log('🚀 Starting bot sync service...');
    console.log(`📅 Sync interval: ${syncIntervalMs / 1000}s`);
    console.log(`🔄 Trade processing interval: ${tradeProcessingIntervalMs / 1000}s`);
    console.log(`🧹 Cleanup interval: ${cleanupIntervalMs / 1000}s`);

    this.isRunning = true;

    // Инициализируем состояние SteamTradeManagerService
    this.initializeSteamManager();

    // Запускаем синхронизацию инвентаря
    this.syncInterval = setInterval(async () => {
      try {
        console.log('🔄 Starting scheduled inventory sync...');
        await this.botService.syncAllBotInventories();
      } catch (error) {
        console.error('❌ Error during scheduled inventory sync:', error);
      }
    }, syncIntervalMs);

    // Запускаем обработку трейдов
    this.tradeProcessingInterval = setInterval(async () => {
      try {
        console.log('🔄 Starting scheduled trade processing...');
        await this.botService.processAllBotIncomingTrades();
      } catch (error) {
        console.error('❌ Error during scheduled trade processing:', error);
      }
    }, tradeProcessingIntervalMs);

    // Запускаем очистку истекших трейдов
    this.cleanupInterval = setInterval(async () => {
      try {
        console.log('🧹 Starting scheduled trade cleanup...');
        await this.cleanupExpiredTrades();
      } catch (error) {
        console.error('❌ Error during scheduled trade cleanup:', error);
      }
    }, cleanupIntervalMs);

    // Запускаем первую синхронизацию сразу
    this.performInitialSync();

    console.log('✅ Bot sync service started successfully');
  }

  /**
   * Остановка автоматической синхронизации
   */
  stopAutoSync() {
    if (!this.isRunning) {
      console.log('⚠️ Bot sync service is not running');
      return;
    }

    console.log('🛑 Stopping bot sync service...');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.tradeProcessingInterval) {
      clearInterval(this.tradeProcessingInterval);
      this.tradeProcessingInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isRunning = false;
    console.log('✅ Bot sync service stopped');
  }

  /**
   * Выполнение первоначальной синхронизации
   */
  private async performInitialSync() {
    try {
      console.log('🚀 Performing initial bot sync...');
      
      // Очищаем невалидные состояния ботов
      await this.cleanupInvalidBotStates();
      
      // Проверяем статус ботов и пытаемся восстановить сессии
      const bots = await Bot.find({ isActive: true });
      console.log(`📊 Found ${bots.length} active bots`);
      
      let loggedInBots = 0;
      let botsNeeding2FA = 0;
      let sessionRestored = 0;
      
      for (const bot of bots) {
        try {
          // Проверяем наличие сохраненной сессии
          if (bot.steamSessionId && bot.steamLoginSecure) {
            console.log(`🔄 Attempting to restore session for bot ${bot.displayName}...`);
            
            // Пытаемся восстановить сессию
            const restored = await this.botService.restoreBotSession(bot);
            if (restored) {
              console.log(`✅ Session restored for bot ${bot.displayName}`);
              loggedInBots++;
              sessionRestored++;
            } else {
              console.log(`❌ Failed to restore session for bot ${bot.displayName}`);
              // Переводим бота в офлайн статус при неудачной авторизации
              bot.isOnline = false;
              bot.lastActivity = new Date();
              bot.syncStatus = 'error';
              await bot.save();
              console.log(`🔴 Bot ${bot.displayName} marked as offline due to auth failure`);
              
              if (bot.steamGuardCode) {
                console.log(`💡 Bot ${bot.displayName} has 2FA code - can be logged in via admin panel`);
                botsNeeding2FA++;
              } else {
                console.log(`💡 Bot ${bot.displayName} needs 2FA code - please login via admin panel`);
                botsNeeding2FA++;
              }
            }
          } else {
            console.log(`⚠️ Bot ${bot.displayName} has no saved session`);
            // Переводим бота в офлайн статус если нет сохраненной сессии
            bot.isOnline = false;
            bot.lastActivity = new Date();
            bot.syncStatus = 'error';
            await bot.save();
            console.log(`🔴 Bot ${bot.displayName} marked as offline - no saved session`);
            
            if (bot.steamGuardCode) {
              console.log(`💡 Bot ${bot.displayName} has 2FA code - can be logged in via admin panel`);
              botsNeeding2FA++;
            } else {
              console.log(`💡 Bot ${bot.displayName} needs 2FA code - please login via admin panel`);
              botsNeeding2FA++;
            }
          }
        } catch (error) {
          console.error(`❌ Error checking bot ${bot.displayName}:`, error);
          // Переводим бота в офлайн статус при ошибке
          bot.isOnline = false;
          bot.lastActivity = new Date();
          bot.syncStatus = 'error';
          await bot.save();
          console.log(`🔴 Bot ${bot.displayName} marked as offline due to error`);
        }
      }
      
      console.log(`📊 Bot status: ${loggedInBots} logged in (${sessionRestored} restored), ${botsNeeding2FA} need 2FA login`);
      
      if (loggedInBots > 0) {
        console.log(`💡 ${loggedInBots} bots are ready for sync`);
      } else {
        console.log(`💡 No bots are logged in. Please login via admin panel`);
      }
      
      // Обрабатываем существующие трейды (только для залогиненных ботов)
      const tradeResult = await this.botService.processAllBotIncomingTrades();
      console.log('📊 Initial trade processing result:', tradeResult);

      // Очищаем истекшие трейды
      const cleanupResult = await this.cleanupExpiredTrades();
      console.log('📊 Initial cleanup result:', cleanupResult);

      // Синхронизируем предметы ботов с глобальной базой предметов
      console.log('🔄 Starting items sync to global inventory...');
      const itemsSyncResult = await this.itemSyncService.syncBotItemsToGlobalInventory();
      console.log('📊 Items sync result:', itemsSyncResult);

      console.log('✅ Initial bot sync completed');
    } catch (error) {
      console.error('❌ Error during initial bot sync:', error);
    }
  }

  /**
   * Принудительная синхронизация всех ботов
   */
  async forceSyncAllBots(): Promise<{
    syncResult: any;
    tradeResult: any;
    cleanupResult: any;
  }> {
    console.log('🔄 Force syncing all bots...');

    const syncResult = await this.botService.syncAllBotInventories();
    const tradeResult = await this.botService.processAllBotIncomingTrades();
    const cleanupResult = await this.cleanupExpiredTrades();

    console.log('✅ Force sync completed');
    return { syncResult, tradeResult, cleanupResult };
  }

  /**
   * Принудительная синхронизация конкретного бота
   */
  async forceSyncBot(botId: string): Promise<{
    syncResult: any;
    tradeResult: any;
  }> {
    console.log(`🔄 Force syncing bot ${botId}...`);

    // Находим бота по ID
    const bot = await Bot.findById(botId);
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }

    const syncResult = await this.botService.syncBotInventory((bot._id as any).toString());
    const tradeResult = await this.botService.processBotIncomingTrades(botId);

    console.log(`✅ Force sync for bot ${botId} completed`);
    return { syncResult, tradeResult };
  }

  /**
   * Очистка истекших трейдов
   */
  private async cleanupExpiredTrades(): Promise<{ cleaned: number }> {
    try {
      const bots = await Bot.find({ isActive: true });
      let cleaned = 0;

      for (const bot of bots) {
        // Удаляем трейды старше 7 дней
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const expiredTrades = bot.activeTrades.filter(trade => 
          new Date(trade.expiresAt) < sevenDaysAgo
        );

        if (expiredTrades.length > 0) {
          bot.activeTrades = bot.activeTrades.filter(trade => 
            new Date(trade.expiresAt) >= sevenDaysAgo
          );
          await bot.save();
          cleaned += expiredTrades.length;
        }
      }

      console.log(`🧹 Cleaned up ${cleaned} expired trades`);
      return { cleaned };
    } catch (error) {
      console.error('❌ Error cleaning up expired trades:', error);
      return { cleaned: 0 };
    }
  }

  /**
   * Очистка невалидных состояний ботов
   */
  private async cleanupInvalidBotStates() {
    try {
      console.log('🧹 Cleaning up invalid bot states...');
      const bots = await Bot.find({ isActive: true });
      let cleaned = 0;

      for (const bot of bots) {
        // Проверяем, является ли бот неактивным или имеет ошибку синхронизации
        if (!bot.isActive || bot.syncStatus === 'error') {
          console.log(`🧹 Bot ${bot.displayName} (ID: ${bot._id}) is invalid. Attempting to restore.`);
          try {
            // Пытаемся восстановить сессию
            const restored = await this.botService.restoreBotSession(bot);
            if (restored) {
              console.log(`✅ Session restored for bot ${bot.displayName}`);
              bot.syncStatus = 'syncing'; // Устанавливаем статус синхронизации
              bot.lastSync = new Date(); // Обновляем время последней синхронизации
              bot.lastActivity = new Date(); // Обновляем время последней активности
              await bot.save();
              cleaned++;
            } else {
              console.log(`❌ Failed to restore session for bot ${bot.displayName}. Marking as inactive.`);
              bot.isActive = false; // Отключаем бота
              bot.syncStatus = 'error'; // Устанавливаем статус ошибки
              bot.lastSync = new Date(); // Обновляем время последней синхронизации
              bot.lastActivity = new Date(); // Обновляем время последней активности
              await bot.save();
              cleaned++;
            }
          } catch (error) {
            console.error(`❌ Error restoring session for bot ${bot.displayName}:`, error);
            bot.isActive = false; // Отключаем бота
            bot.syncStatus = 'error'; // Устанавливаем статус ошибки
            bot.lastSync = new Date(); // Обновляем время последней синхронизации
            bot.lastActivity = new Date(); // Обновляем время последней активности
            await bot.save();
            cleaned++;
          }
        }
        
        // Проверяем ботов без сессионных данных
        if (bot.isOnline && (!bot.steamSessionId || !bot.steamLoginSecure)) {
          console.log(`🧹 Bot ${bot.displayName} is marked as online but has no session data. Resetting status.`);
          bot.isOnline = false;
          bot.lastLoginError = 'Session data missing - needs re-login';
          bot.lastLoginErrorTime = new Date();
          await bot.save();
          cleaned++;
        }
      }
      console.log(`🧹 Cleaned up ${cleaned} invalid bot states.`);
    } catch (error) {
      console.error('❌ Error cleaning up invalid bot states:', error);
    }
  }

  /**
   * Инициализация SteamTradeManagerService
   */
  private async initializeSteamManager() {
    try {
      console.log('🔄 Initializing SteamTradeManagerService...');
      // Здесь можно добавить инициализацию если нужно
      console.log('✅ SteamTradeManagerService initialized');
    } catch (error) {
      console.error('❌ Error initializing SteamTradeManagerService:', error);
    }
  }

  /**
   * Получение статуса сервиса
   */
  getStatus(): {
    isRunning: boolean;
    hasSyncInterval: boolean;
    hasTradeProcessingInterval: boolean;
    hasCleanupInterval: boolean;
  } {
    return {
      isRunning: this.isRunning,
      hasSyncInterval: this.syncInterval !== null,
      hasTradeProcessingInterval: this.tradeProcessingInterval !== null,
      hasCleanupInterval: this.cleanupInterval !== null
    };
  }

  /**
   * Получение статистики ботов
   */
  async getBotStats() {
    return await this.botService.getBotStats();
  }

  /**
   * Получение статуса здоровья ботов
   */
  async getBotHealthStatus(): Promise<{
    totalBots: number;
    healthyBots: number;
    problematicBots: number;
    offlineBots: number;
    botsWithErrors: number;
    pollingEnabled: boolean;
    details: Array<{
      botId: string;
      displayName: string;
      steamId: string;
      status: 'healthy' | 'offline' | 'error' | 'syncing';
      lastSync: Date | undefined;
      lastActivity: Date | undefined;
      inventoryCount: number;
      activeTradesCount: number;
      issues: string[];
    }>;
  }> {
    const bots = await Bot.find({});
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let healthyBots = 0;
    let problematicBots = 0;
    let offlineBots = 0;
    let botsWithErrors = 0;

    const details = bots.map(bot => {
      const issues: string[] = [];
      let status: 'healthy' | 'offline' | 'error' | 'syncing' = 'healthy';

      // Проверяем онлайн статус
      if (!bot.isOnline) {
        status = 'offline';
        issues.push('Bot is offline');
        offlineBots++;
      }

      // Проверяем статус синхронизации
      if (bot.syncStatus === 'error') {
        status = 'error';
        issues.push('Sync error');
        botsWithErrors++;
      } else if (bot.syncStatus === 'syncing') {
        status = 'syncing';
        issues.push('Currently syncing');
      }

      // Проверяем время последней активности
      if (bot.lastActivity && bot.lastActivity < oneHourAgo) {
        issues.push('No recent activity');
        // Не меняем статус на offline, если бот онлайн
        // Просто добавляем предупреждение
      }

      // Проверяем время последней синхронизации
      if (bot.lastSync && bot.lastSync < fiveMinutesAgo) {
        issues.push('Outdated inventory');
        if (status === 'healthy') {
          status = 'error';
          botsWithErrors++;
        }
      }

      // Если бот онлайн, но имеет проблемы с синхронизацией, помечаем как problematic
      if (bot.isOnline && bot.syncStatus === 'error') {
        if (status === 'healthy') {
          status = 'error';
          botsWithErrors++;
        }
      }

      // Подсчитываем статистику
      if (status === 'healthy') {
        healthyBots++;
      } else if (status === 'offline') {
        offlineBots++;
      } else if (status === 'error') {
        botsWithErrors++;
      } else if (status === 'syncing') {
        problematicBots++;
      }

      return {
        botId: (bot._id as any).toString(),
        displayName: bot.displayName,
        steamId: bot.steamId,
        status,
        lastSync: bot.lastSync,
        lastActivity: bot.lastActivity,
        inventoryCount: bot.inventory.length,
        activeTradesCount: bot.activeTradesCount,
        issues
      };
    });

    return {
      totalBots: bots.length,
      healthyBots,
      problematicBots,
      offlineBots,
      botsWithErrors,
      pollingEnabled: this.getPollingStatus(),
      details
    };
  }

  /**
   * Перезапуск сервиса
   */
  restart() {
    console.log('🔄 Restarting bot sync service...');
    this.stopAutoSync();
    setTimeout(() => {
      this.startAutoSync();
    }, 1000);
  }

  /**
   * Включение polling для всех ботов
   */
  enablePolling() {
    if (this.isPollingEnabled) {
      console.log('⚠️ Polling is already enabled');
      return;
    }
    
    console.log('🔄 Enabling polling for all bots...');
    this.isPollingEnabled = true;
    
    // Здесь можно добавить логику для запуска polling у всех активных ботов
    // Пока что polling управляется автоматически через TradeOfferManager
  }

  /**
   * Отключение polling для всех ботов
   */
  disablePolling() {
    if (!this.isPollingEnabled) {
      console.log('⚠️ Polling is already disabled');
      return;
    }
    
    console.log('⏹️ Disabling polling for all bots...');
    this.isPollingEnabled = false;
    
    // Здесь можно добавить логику для остановки polling у всех ботов
  }

  /**
   * Получение статуса polling
   */
  getPollingStatus(): boolean {
    return this.isPollingEnabled;
  }
}

// Создаем глобальный экземпляр сервиса
export const botSyncService = new BotSyncService();
