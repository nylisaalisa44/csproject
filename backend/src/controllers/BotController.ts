import { Request, Response } from 'express';
import { Bot } from '../models/Bot';
import { BotService } from '../services/BotService';
import { BotSyncService } from '../services/BotSyncService';
import { steamService } from '../services/SteamService';
import { IBotDocument } from '../types';

const botService = new BotService();
const botSyncService = new BotSyncService();

export class BotController {
  /**
   * Получение всех ботов
   */
  static async getAllBots(req: Request, res: Response) {
    try {
      const bots = await botService.getAllBots();
      
      const botsWithStats = bots.map(bot => ({
        _id: bot._id,
        displayName: bot.displayName,
        steamId: bot.steamId,
        avatar: bot.avatar,
        isActive: bot.isActive,
        isOnline: bot.isOnline,
        lastActivity: bot.lastActivity,
        lastLogin: bot.lastLogin,
        syncStatus: bot.syncStatus,
        lastSync: bot.lastSync,
        inventoryCount: bot.inventory ? bot.inventory.length : 0,
        activeTradesCount: bot.activeTrades ? bot.activeTrades.length : 0,
        stats: bot.stats,
        createdAt: bot.createdAt
      }));

      return res.json({
        success: true,
        data: { bots: botsWithStats }
      });
    } catch (error) {
      console.error('❌ Error getting all bots:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get bots'
      });
    }
  }

  /**
   * Получение бота по ID
   */
  static async getBotById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bot = await botService.getBotById(id);
      
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      return res.json({
        success: true,
        data: { bot }
      });
    } catch (error) {
      console.error('❌ Error getting bot by ID:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get bot'
      });
    }
  }

  /**
   * Создание нового бота
   */
  static async createBot(req: Request, res: Response) {
    try {
      const botData = req.body;
      
      // Валидация обязательных полей
      if (!botData.displayName || !botData.steamId || !botData.steamUsername || !botData.steamPassword || !botData.tradeUrl) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: displayName, steamId, steamUsername, steamPassword, tradeUrl'
        });
      }

      const bot = await botService.createBot(botData);

      return res.status(201).json({
        success: true,
        data: { bot }
      });
    } catch (error) {
      console.error('❌ Error creating bot:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create bot'
      });
    }
  }

  /**
   * Обновление бота
   */
  static async updateBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const bot = await botService.updateBot(id, updateData);
      
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      return res.json({
        success: true,
        data: { bot }
      });
    } catch (error) {
      console.error('❌ Error updating bot:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update bot'
      });
    }
  }

  /**
   * Удаление бота
   */
  static async deleteBot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await botService.deleteBot(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      return res.json({
        success: true,
        message: 'Bot deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting bot:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete bot'
      });
    }
  }

  /**
   * Авторизация бота в Steam
   */
  static async loginBot(req: Request, res: Response) {
    try {
      const { botId } = req.params;
      const { steamGuardCode } = req.body;
      
      const success = await botService.loginBot(botId);
      
      if (success) {
        return res.json({
          success: true,
          message: 'Bot logged in successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to login bot'
        });
      }
    } catch (error) {
      console.error('❌ Error logging in bot:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to login bot'
      });
    }
  }

  /**
   * Синхронизация инвентаря бота
   */
  static async syncBotInventory(req: Request, res: Response) {
    try {
      const { botId } = req.params;
      
      const bot = await Bot.findById(botId) as IBotDocument;
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      const result = await botService.syncBotInventory(botId);

      return res.json({
        success: true,
        data: {
          botId,
          result,
          message: `Inventory synced: +${result.added}, -${result.removed}, ~${result.updated}`
        }
      });
    } catch (error) {
      console.error('❌ Error syncing bot inventory:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to sync bot inventory'
      });
    }
  }

  /**
   * Синхронизация всех ботов
   */
  static async syncAllBots(req: Request, res: Response) {
    try {
      const result = await botService.syncAllBotInventories();

      return res.json({
        success: true,
        data: {
          result,
          message: `Sync completed: ${result.successCount} successful, ${result.errorCount} failed`
        }
      });
    } catch (error) {
      console.error('❌ Error syncing all bots:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to sync all bots'
      });
    }
  }

  /**
   * Обработка входящих трейдов
   */
  static async processIncomingTrades(req: Request, res: Response) {
    try {
      const result = await botService.processAllBotIncomingTrades();

      return res.json({
        success: true,
        data: {
          result,
          message: `Processed ${result.totalProcessed} trades: ${result.totalAccepted} accepted, ${result.totalDeclined} declined`
        }
      });
    } catch (error) {
      console.error('❌ Error processing incoming trades:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process incoming trades'
      });
    }
  }

  /**
   * Получение статистики ботов
   */
  static async getBotStats(req: Request, res: Response) {
    try {
      const stats = await botService.getBotStats();

      return res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('❌ Error getting bot stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get bot stats'
      });
    }
  }

  /**
   * Получение статуса здоровья ботов
   */
  static async getBotHealth(req: Request, res: Response) {
    try {
      const health = await botSyncService.getBotHealthStatus();

      return res.json({
        success: true,
        data: { health }
      });
    } catch (error) {
      console.error('❌ Error getting bot health:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get bot health'
      });
    }
  }

  /**
   * Получение статуса синхронизации
   */
  static async getSyncStatus(req: Request, res: Response) {
    try {
      const status = botSyncService.getStatus();
      const health = await botSyncService.getBotHealthStatus();

      return res.json({
        success: true,
        data: {
          status,
          health
        }
      });
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get sync status'
      });
    }
  }

  /**
   * Запуск синхронизации
   */
  static async startSync(req: Request, res: Response) {
    try {
      botSyncService.startAutoSync();
      
      return res.json({
        success: true,
        message: 'Bot sync service started'
      });
    } catch (error) {
      console.error('❌ Error starting sync:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to start sync'
      });
    }
  }

  /**
   * Остановка синхронизации
   */
  static async stopSync(req: Request, res: Response) {
    try {
      botSyncService.stopAutoSync();
      
      return res.json({
        success: true,
        message: 'Bot sync service stopped'
      });
    } catch (error) {
      console.error('❌ Error stopping sync:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to stop sync'
      });
    }
  }

  /**
   * Принудительная синхронизация бота
   */
  static async forceSyncBot(req: Request, res: Response) {
    try {
      const { botId } = req.params;
      
      const bot = await Bot.findById(botId) as IBotDocument;
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      const result = await botService.syncBotInventory(botId);

      return res.json({
        success: true,
        data: {
          botId,
          result,
          message: `Forced sync completed: +${result.added}, -${result.removed}, ~${result.updated}`
        }
      });
    } catch (error) {
      console.error('❌ Error forcing bot sync:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to force bot sync'
      });
    }
  }

  /**
   * Получение инвентаря бота
   */
  static async getBotInventory(req: Request, res: Response) {
    try {
      const { botId } = req.params;
      const { limit = 60, offset = 0, sort = 'name-asc' } = req.query;
      
      const bot = await Bot.findById(botId) as IBotDocument;
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      // Убеждаемся, что inventory - это массив
      const inventory = Array.isArray(bot.inventory) ? bot.inventory : [];

      // Применяем сортировку
      let sortedInventory = [...inventory];
      if (sort === 'name-asc') {
        sortedInventory.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
      } else if (sort === 'name-desc') {
        sortedInventory.sort((a, b) => (b.itemName || '').localeCompare(a.itemName || ''));
      } else if (sort === 'rarity-asc') {
        sortedInventory.sort((a, b) => (a.rarity || '').localeCompare(b.rarity || ''));
      } else if (sort === 'rarity-desc') {
        sortedInventory.sort((a, b) => (b.rarity || '').localeCompare(a.rarity || ''));
      }

      // Применяем пагинацию
      const startIndex = parseInt(offset as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedInventory = sortedInventory.slice(startIndex, endIndex);

      // Форматируем предметы в том же формате, что и /api/inventory
      const formattedItems = paginatedInventory.map((item: any) => ({
        classid: item.classId || item.steamId,
        instanceid: item.instanceId || '0',
        market_hash_name: item.marketHashName || item.itemName,
        name: item.itemName,
        type: item.type || 'weapon',
        rarity: item.rarity || 'Consumer Grade',
        exterior: item.exterior || 'Field-Tested',
        icon_url: item.iconUrl,
        // Добавляем обработанные URL изображений
        icon_url_full: item.iconUrl ? steamService.getImageURL(item.iconUrl) : undefined,
        icon_url_large: item.iconUrl ? steamService.getImageURL(item.iconUrl, 256, 256) : undefined,
        icon_url_medium: item.iconUrl ? steamService.getImageURL(item.iconUrl, 128, 128) : undefined,
        icon_url_small: item.iconUrl ? steamService.getImageURL(item.iconUrl, 64, 64) : undefined,
        // Дополнительные поля для совместимости
        assetid: item.assetId,
        steamid: item.steamId,
        acquired_at: item.acquiredAt,
        last_updated: item.lastUpdated
      }));

      return res.json({
        success: true,
        data: {
          botId,
          botName: bot.displayName,
          appId: '730', // CS2
          inventory: formattedItems,
          totalItems: inventory.length,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: inventory.length,
            hasMore: endIndex < inventory.length
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting bot inventory:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get bot inventory'
      });
    }
  }

  /**
   * Получение инвентаря всех ботов (для трейдинга)
   */
  static async getAllBotsInventory(req: Request, res: Response) {
    try {
      const { limit = 60, offset = 0, sort = 'name-asc', appId = '730' } = req.query;

      // Получаем всех активных ботов
      const bots = await Bot.find({ isActive: true, isOnline: true }) as IBotDocument[];

      // Собираем все предметы из всех ботов
      let allItems: any[] = [];
      
      bots.forEach(bot => {
        if (Array.isArray(bot.inventory)) {
          const botItems = bot.inventory.map((item: any) => ({
            ...item,
            botId: bot._id,
            botName: bot.displayName,
            botSteamId: bot.steamId
          }));
          allItems = allItems.concat(botItems);
        }
      });

      // Применяем сортировку
      if (sort === 'name-asc') {
        allItems.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
      } else if (sort === 'name-desc') {
        allItems.sort((a, b) => (b.itemName || '').localeCompare(a.itemName || ''));
      } else if (sort === 'rarity-asc') {
        allItems.sort((a, b) => (a.rarity || '').localeCompare(b.rarity || ''));
      } else if (sort === 'rarity-desc') {
        allItems.sort((a, b) => (b.rarity || '').localeCompare(a.rarity || ''));
      } else if (sort === 'bot-asc') {
        allItems.sort((a, b) => (a.botName || '').localeCompare(b.botName || ''));
      }

      // Применяем пагинацию
      const startIndex = parseInt(offset as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedItems = allItems.slice(startIndex, endIndex);

      // Форматируем предметы в том же формате, что и /api/inventory
      const formattedItems = paginatedItems.map((item: any) => ({
        classid: item.classId || item.steamId,
        instanceid: item.instanceId || '0',
        market_hash_name: item.marketHashName || item.itemName,
        name: item.itemName,
        type: item.type || 'weapon',
        rarity: item.rarity || 'Consumer Grade',
        exterior: item.exterior || 'Field-Tested',
        icon_url: item.iconUrl,
        // Добавляем обработанные URL изображений
        icon_url_full: item.iconUrl ? steamService.getImageURL(item.iconUrl) : undefined,
        icon_url_large: item.iconUrl ? steamService.getImageURL(item.iconUrl, 256, 256) : undefined,
        icon_url_medium: item.iconUrl ? steamService.getImageURL(item.iconUrl, 128, 128) : undefined,
        icon_url_small: item.iconUrl ? steamService.getImageURL(item.iconUrl, 64, 64) : undefined,
        // Дополнительные поля для совместимости
        assetid: item.assetId,
        steamid: item.steamId,
        acquired_at: item.acquiredAt,
        last_updated: item.lastUpdated,
        // Информация о боте
        bot_id: item.botId,
        bot_name: item.botName,
        bot_steam_id: item.botSteamId
      }));

      return res.json({
        success: true,
        data: {
          appId,
          inventory: formattedItems,
          totalItems: allItems.length,
          totalBots: bots.length,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: allItems.length,
            hasMore: endIndex < allItems.length
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting all bots inventory:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get all bots inventory'
      });
    }
  }
}
