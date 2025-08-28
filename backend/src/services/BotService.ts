import { Bot } from '../models/Bot';
import { Trade } from '../models/Trade';
import { User } from '../models/User';
import { IBotDocument, ITradeDocument, IUserDocument } from '../types';
import { SteamTradeManagerService } from './SteamTradeManagerService';
import { steamService } from './SteamService';
import { InventorySyncResult, TradeProcessingResult } from '../types/steam-types';

export class BotService {
  private steamTradeManagers: Map<string, SteamTradeManagerService> = new Map();

  constructor() {}

  /**
   * Получение или создание SteamTradeManagerService для конкретного бота
   */
  private async getSteamTradeManager(botId: string, bot?: IBotDocument): Promise<SteamTradeManagerService> {
    if (!this.steamTradeManagers.has(botId)) {
      const manager = new SteamTradeManagerService();
      this.steamTradeManagers.set(botId, manager);
      
      // Если передан бот с сессией, пытаемся восстановить её
      if (bot && bot.steamSessionId && bot.steamLoginSecure && bot.isOnline) {
        try {
          console.log(`🔄 Auto-restoring session for bot ${bot.displayName}...`);
          await manager.restoreSession(bot);
        } catch (error) {
          console.log(`⚠️ Failed to auto-restore session for bot ${bot.displayName}:`, error);
        }
      }
    }
    return this.steamTradeManagers.get(botId)!;
  }

  /**
   * Удаление SteamTradeManagerService для бота
   */
  private removeSteamTradeManager(botId: string): void {
    const manager = this.steamTradeManagers.get(botId);
    if (manager) {
      manager.logout();
      this.steamTradeManagers.delete(botId);
    }
  }

  /**
   * Получение ID бота как строки
   */
  private getBotId(bot: IBotDocument): string {
    return (bot._id as any).toString();
  }

  /**
   * Создание нового бота
   */
  async createBot(botData: {
    displayName: string;
    steamId: string;
    steamUsername: string;
    steamPassword: string;
    steamGuardCode?: string;
    tradeUrl: string;
    isActive?: boolean;
    syncInterval?: number;
  }): Promise<IBotDocument> {
    try {
      const bot = new Bot({
        ...botData,
        isActive: botData.isActive ?? true,
        syncInterval: botData.syncInterval ?? 10 * 60 * 1000, // 10 минут по умолчанию
        inventory: [],
        activeTrades: [],
        stats: {
          totalTrades: 0,
          successfulTrades: 0,
          failedTrades: 0,
          totalValue: 0
        },
        security: {
          maxTradeValue: 1000,
          requireConfirmation: false,
          allowedUsers: [],
          blockedUsers: []
        }
      });

      await bot.save();
      console.log(`✅ Bot ${bot.displayName} created successfully`);
      return bot;
    } catch (error) {
      console.error('❌ Error creating bot:', error);
      throw error;
    }
  }

  /**
   * Авторизация бота в Steam
   */
  async loginBot(botId: string): Promise<boolean> {
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        throw new Error(`Bot with ID ${botId} not found`);
      }

      // Проверяем, не заблокирован ли аккаунт
      if (bot.isThrottled && bot.throttleUntil && new Date() < bot.throttleUntil) {
        console.log(`⏰ Bot ${bot.displayName} is throttled until ${bot.throttleUntil}`);
        return false;
      }

      // Проверяем, не залогинен ли уже бот
      const manager = await this.getSteamTradeManager(botId, bot);
      if (bot.isOnline && manager['isLoggedIn']) {
        console.log(`✅ Bot ${bot.displayName} is already logged in`);
        return true;
      }

      // Сначала пытаемся восстановить существующую сессию
      const sessionRestored = await manager.restoreSession(bot);
      if (sessionRestored) {
        console.log(`✅ Session restored for bot ${bot.displayName}`);
        return true;
      }

      // Если нет сохраненной сессии, выполняем новый логин
      console.log(`🔍 Bot state before login:`, {
        isOnline: bot.isOnline,
        hasSessionId: !!bot.steamSessionId,
        hasLoginSecure: !!bot.steamLoginSecure,
        hasGuardCode: !!bot.steamGuardCode
      });

             // Сбрасываем счетчик попыток входа, если прошло достаточно времени
       if (bot.lastLoginErrorTime && 
           new Date().getTime() - bot.lastLoginErrorTime.getTime() > 2 * 60 * 60 * 1000) { // 2 часа
         bot.loginAttempts = 0;
         bot.lastLoginError = undefined;
         await bot.save();
       }

      const success = await manager.loginBot(bot);
      
      console.log(`🔍 Bot state after login:`, {
        isOnline: bot.isOnline,
        hasSessionId: !!bot.steamSessionId,
        hasLoginSecure: !!bot.steamLoginSecure,
        loginSuccess: success
      });

      return success;

    } catch (error) {
      console.error(`❌ Error logging in bot ${botId}:`, error);
      return false;
    }
  }

  /**
   * Синхронизация инвентаря бота
   */
  async syncBotInventory(botId: string): Promise<InventorySyncResult> {
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        throw new Error(`Bot with ID ${botId} not found`);
      }

      // Проверяем, есть ли у бота сохраненная сессия
      if (bot.steamSessionId && bot.steamLoginSecure && bot.isOnline) {
        // Используем SteamTradeManagerService для приватного инвентаря
        console.log(`🔄 Using SteamTradeManager for bot ${bot.displayName} with saved session`);
        const manager = await this.getSteamTradeManager(this.getBotId(bot), bot);
        
        // Восстанавливаем сессию
        const sessionRestored = await manager.restoreSession(bot);
        if (sessionRestored) {
          console.log(`✅ Session restored for bot ${bot.displayName}`);
          return await manager.syncBotInventory(bot);
        } else {
          console.log(`❌ Failed to restore session for bot ${bot.displayName}`);
          throw new Error(`Bot ${bot.displayName} session restoration failed. Please login via admin panel.`);
        }
      } else if (bot.steamUsername && bot.steamPassword) {
        // У бота есть креды, но нет сессии - пытаемся залогиниться
        console.log(`🔄 Bot ${bot.displayName} has credentials but no session, attempting login...`);
        const manager = await this.getSteamTradeManager(this.getBotId(bot), bot);
        await manager.loginBot(bot);
        return await manager.syncBotInventory(bot);
      } else {
        // Fallback к публичному API только если нет кредов и сессии
        console.log(`⚠️ Bot ${bot.displayName} has no credentials or session, using public inventory API`);
        return await this.syncPublicInventory(bot);
      }
    } catch (error) {
      console.error(`❌ Error syncing bot inventory:`, error);
      throw error;
    }
  }

  /**
   * Синхронизация публичного инвентаря (fallback метод)
   */
  private async syncPublicInventory(bot: IBotDocument): Promise<InventorySyncResult> {
    try {
      console.log(`🔄 Syncing public inventory for bot ${bot.displayName} (${bot.steamId})`);
      
      // Обновляем статус синхронизации
      bot.syncStatus = 'syncing';
      await bot.save();

      // Получаем инвентарь через SteamService
      const steamInventory = await steamService.getPlayerInventory(bot.steamId, 730, 5000);
      
      if (steamInventory.error) {
        throw new Error(`Steam API error: ${steamInventory.error}`);
      }

      const currentItems = new Map();
      const steamItems = new Map();

      // Создаем карту текущих предметов бота
      bot.inventory.forEach((item: any) => {
        currentItems.set(item.assetId, item);
      });

      // Обрабатываем предметы из Steam
      let added = 0;
      let updated = 0;

      if (steamInventory.rgInventory && steamInventory.descriptions) {
        for (const [assetId, asset] of Object.entries(steamInventory.rgInventory)) {
          const description = steamInventory.descriptions.find((desc: any) => 
            desc.classid === (asset as any).classid && desc.instanceid === (asset as any).instanceid
          );
          
          if (description && description.tradable === 1) {
            const steamItem = {
              itemId: description.classid,
              itemName: description.name,
              steamId: description.classid,
              assetId: (asset as any).id,
              classId: (asset as any).classid,
              instanceId: (asset as any).instanceid,
              marketHashName: description.market_hash_name,
              iconUrl: description.icon_url,
              rarity: this.extractRarity(description.tags),
              exterior: this.extractExterior(description.descriptions)
            };

            steamItems.set((asset as any).id, steamItem);

            if (!currentItems.has((asset as any).id)) {
              // Новый предмет
              await bot.addItem(steamItem);
              added++;
            } else {
              // Обновляем существующий предмет
              const existingItem = currentItems.get((asset as any).id);
              if (this.hasItemChanged(existingItem, steamItem)) {
                await bot.addItem(steamItem);
                updated++;
              }
            }
          }
        }
      }

      // Удаляем предметы, которых больше нет в инвентаре
      let removed = 0;
      for (const [assetId, item] of currentItems) {
        if (!steamItems.has(assetId)) {
          bot.inventory = bot.inventory.filter((invItem: any) => invItem.assetId !== assetId);
          removed++;
        }
      }

      // Обновляем статус синхронизации
      bot.syncStatus = 'idle';
      bot.lastSync = new Date();
      await bot.save();

      console.log(`✅ Public inventory synced for bot ${bot.displayName}: +${added}, -${removed}, ~${updated}`);

      return {
        added,
        removed,
        updated
      };

    } catch (error) {
      console.error(`❌ Error syncing public inventory for bot ${bot.displayName}:`, error);
      
      // Обновляем статус синхронизации на ошибку
      bot.syncStatus = 'error';
      await bot.save();
      
      throw error;
    }
  }

  /**
   * Синхронизация инвентарей всех ботов
   */
  async syncAllBotInventories(): Promise<{ totalBots: number; successCount: number; errorCount: number }> {
    try {
      const bots = await Bot.find({ isActive: true, isOnline: true });
      let successCount = 0;
      let errorCount = 0;

      console.log(`🔄 Starting sync for ${bots.length} online bots...`);

      for (const bot of bots) {
        try {
          // Просто вызываем syncBotInventory - он сам решит, как синхронизировать бота
          await this.syncBotInventory((bot._id as any).toString());
          successCount++;
          console.log(`✅ Successfully synced bot ${bot.displayName}`);
        } catch (error) {
          console.error(`❌ Failed to sync bot ${bot.displayName}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Sync completed: ${successCount} successful, ${errorCount} failed`);
      return { totalBots: bots.length, successCount, errorCount };

    } catch (error) {
      console.error('❌ Error syncing all bot inventories:', error);
      throw error;
    }
  }

  /**
   * Создание Steam трейда
   */
  async createSteamTrade(tradeId: string, botId: string): Promise<string> {
    try {
      const trade = await Trade.findById(tradeId) as ITradeDocument;
      const bot = await Bot.findById(botId) as IBotDocument;

      if (!trade || !bot) {
        throw new Error('Trade or bot not found');
      }

      // Проверяем, что бот залогинен
      const manager = await this.getSteamTradeManager(botId, bot);
      if (!bot.isOnline || !manager['isLoggedIn']) {
        await manager.loginBot(bot);
      }

      // Получаем пользователя для получения Steam ID
      const user = await User.findById(trade.userId) as IUserDocument;
      if (!user) {
        throw new Error('User not found');
      }

      // Определяем предметы для отправки и получения на основе типа трейда
      let itemsToGive: string[] = [];
      let itemsToReceive: string[] = [];

      if (trade.type === 'buy') {
        // Пользователь покупает у бота - бот отдает предметы
        for (const tradeItem of trade.items) {
          const botItem = bot.inventory.find(invItem => invItem.itemId === tradeItem.itemId);
          if (botItem) {
            itemsToGive.push(botItem.assetId);
          }
        }
      } else {
        // Пользователь продает боту - бот получает предметы
        for (const tradeItem of trade.items) {
          itemsToReceive.push(tradeItem.steamId);
        }
      }

      // Создаем трейд через SteamTradeManagerService
      const tradeOfferId = await manager.createTradeOffer(
        bot,
        user.steamId,
        itemsToGive,
        itemsToReceive
      );

      // Обновляем трейд
      trade.botId = bot._id as any;
      trade.steamTradeId = tradeOfferId;
    trade.status = 'processing';
    await trade.save();

      // Обновляем статистику бота
      bot.stats.totalTrades++;
      await bot.save();

      console.log(`✅ Steam trade created: ${tradeOfferId}`);
      return tradeOfferId;

    } catch (error) {
      console.error('❌ Error creating Steam trade:', error);
      throw error;
    }
  }

  /**
   * Проверка статуса Steam трейда
   */
  async checkSteamTradeStatus(tradeId: string): Promise<string> {
    try {
      const trade = await Trade.findById(tradeId) as ITradeDocument;
      if (!trade || !trade.steamTradeId) {
        throw new Error('Trade or Steam trade ID not found');
      }

      const bot = await Bot.findById(trade.botId) as IBotDocument;
      if (!bot) {
        throw new Error('Bot not found');
      }

      // Получаем статус через SteamTradeManagerService
      const manager = await this.getSteamTradeManager(this.getBotId(bot), bot);
      const offers = await manager.getTradeOffers(bot);
      const offer = offers.find(o => o.id === trade.steamTradeId);

      if (!offer) {
        return 'not_found';
      }

      let newStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      
      switch (offer.state) {
        case 1: // ETradeOfferState.Invalid
          newStatus = 'failed';
          break;
        case 2: // ETradeOfferState.Active
          newStatus = 'pending';
          break;
        case 3: // ETradeOfferState.Accepted
          newStatus = 'completed';
          break;
        case 4: // ETradeOfferState.Countered
          newStatus = 'failed';
          break;
        case 5: // ETradeOfferState.Expired
          newStatus = 'cancelled';
          break;
        case 6: // ETradeOfferState.Canceled
          newStatus = 'cancelled';
          break;
        case 7: // ETradeOfferState.Declined
          newStatus = 'failed';
          break;
        case 8: // ETradeOfferState.InvalidItems
          newStatus = 'failed';
          break;
        case 9: // ETradeOfferState.CreatedNeedsConfirmation
          newStatus = 'processing';
          break;
        case 10: // ETradeOfferState.CanceledBySecondFactor
          newStatus = 'cancelled';
          break;
        case 11: // ETradeOfferState.InEscrow
          newStatus = 'processing';
          break;
        default:
          newStatus = 'pending';
      }

      // Обновляем статус трейда
      if (trade.status !== newStatus) {
        trade.status = newStatus;
        await trade.save();

        // Обновляем статистику бота
        if (newStatus === 'completed') {
          bot.stats.successfulTrades++;
        } else if (newStatus === 'failed' || newStatus === 'cancelled') {
          bot.stats.failedTrades++;
        }
        await bot.save();
      }

      return newStatus;

    } catch (error) {
      console.error('❌ Error checking Steam trade status:', error);
      throw error;
    }
  }

  /**
   * Обработка входящих трейдов для всех ботов
   */
  async processAllBotIncomingTrades(): Promise<{
    totalBots: number;
    processedBots: number;
    totalProcessed: number;
    totalAccepted: number;
    totalDeclined: number;
  }> {
    try {
      const bots = await Bot.find({ isActive: true, isOnline: true });
      let processedBots = 0;
      let totalProcessed = 0;
      let totalAccepted = 0;
      let totalDeclined = 0;

      console.log(`🔄 Processing incoming trades for ${bots.length} online bots...`);

      for (const bot of bots) {
        try {
          // Проверяем, что бот действительно залогинен
          const manager = await this.getSteamTradeManager(this.getBotId(bot), bot);
          if (!bot.isOnline || !manager['isLoggedIn']) {
            console.log(`⚠️ Skipping bot ${bot.displayName} - not logged in`);
            continue;
          }
          
          const result = await manager.processIncomingTrades(bot);
          totalProcessed += result.processed;
          totalAccepted += result.accepted;
          totalDeclined += result.declined;
          processedBots++;

          console.log(`✅ Processed ${result.processed} trades for bot ${bot.displayName}: ${result.accepted} accepted, ${result.declined} declined`);

        } catch (error) {
          console.error(`❌ Error processing trades for bot ${bot.displayName}:`, error);
        }
      }

      console.log(`✅ Processed ${totalProcessed} trades: ${totalAccepted} accepted, ${totalDeclined} declined`);

      return {
        totalBots: bots.length,
        processedBots,
        totalProcessed,
        totalAccepted,
        totalDeclined
      };

    } catch (error) {
      console.error('❌ Error processing all bot incoming trades:', error);
      throw error;
    }
  }

  /**
   * Восстановление сессии бота
   */
  async restoreBotSession(bot: IBotDocument): Promise<boolean> {
    try {
      const manager = await this.getSteamTradeManager(this.getBotId(bot), bot);
      return await manager.restoreSession(bot);
    } catch (error) {
      console.error(`❌ Error restoring session for bot ${bot.displayName}:`, error);
      return false;
    }
  }

  /**
   * Получение всех ботов
   */
  async getAllBots(): Promise<IBotDocument[]> {
    try {
      return await Bot.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error getting all bots:', error);
      throw error;
    }
  }

  /**
   * Получение бота по ID
   */
  async getBotById(botId: string): Promise<IBotDocument | null> {
    try {
      return await Bot.findById(botId);
    } catch (error) {
      console.error('❌ Error getting bot by ID:', error);
      throw error;
    }
  }

  /**
   * Обновление бота
   */
  async updateBot(botId: string, updateData: Partial<IBotDocument>): Promise<IBotDocument | null> {
    try {
      return await Bot.findByIdAndUpdate(botId, updateData, { new: true });
    } catch (error) {
      console.error('❌ Error updating bot:', error);
      throw error;
    }
  }

  /**
   * Удаление бота
   */
  async deleteBot(botId: string): Promise<boolean> {
    try {
      const result = await Bot.findByIdAndDelete(botId);
      return !!result;
    } catch (error) {
      console.error('❌ Error deleting bot:', error);
      throw error;
    }
  }

  /**
   * Получение статистики ботов
   */
  async getBotStats(): Promise<{
    totalBots: number;
    activeBots: number;
    onlineBots: number;
    totalInventoryItems: number;
    totalActiveTrades: number;
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
  }> {
    try {
      const bots = await Bot.find();
      
      const stats = {
        totalBots: bots.length,
        activeBots: bots.filter(bot => bot.isActive).length,
        onlineBots: bots.filter(bot => bot.isOnline).length,
        totalInventoryItems: bots.reduce((sum, bot) => sum + bot.inventory.length, 0),
        totalActiveTrades: bots.reduce((sum, bot) => sum + bot.activeTrades.length, 0),
        totalTrades: bots.reduce((sum, bot) => sum + bot.stats.totalTrades, 0),
        successfulTrades: bots.reduce((sum, bot) => sum + bot.stats.successfulTrades, 0),
        failedTrades: bots.reduce((sum, bot) => sum + bot.stats.failedTrades, 0)
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting bot stats:', error);
      throw error;
    }
  }

  /**
   * Обработка входящих трейдов для конкретного бота
   */
  async processBotIncomingTrades(botId: string): Promise<TradeProcessingResult> {
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        throw new Error(`Bot with ID ${botId} not found`);
      }

      const manager = await this.getSteamTradeManager(botId, bot);
      const result = await manager.processIncomingTrades(bot);
      return result;
    } catch (error) {
      console.error(`❌ Error processing incoming trades for bot ${botId}:`, error);
      return { processed: 0, accepted: 0, declined: 0 };
    }
  }

  // Вспомогательные методы

  /**
   * Извлечение редкости предмета
   */
  private extractRarity(tags: any[]): string {
    if (!tags) return 'Common';
    
    const rarityTag = tags.find((tag: any) => tag.category === 'Rarity');
    return rarityTag ? rarityTag.name : 'Common';
  }

  /**
   * Извлечение состояния предмета
   */
  private extractExterior(descriptions: any[]): string {
    if (!descriptions) return '';
    
    const exteriorDesc = descriptions.find((desc: any) => 
      desc.value && desc.value.includes('Exterior:')
    );
    
    if (exteriorDesc) {
      return exteriorDesc.value.replace('Exterior: ', '');
    }
    
    return '';
  }

  /**
   * Проверка, изменился ли предмет
   */
  private hasItemChanged(existingItem: any, newItem: any): boolean {
    return existingItem.itemName !== newItem.itemName ||
           existingItem.marketHashName !== newItem.marketHashName ||
           existingItem.iconUrl !== newItem.iconUrl ||
           existingItem.rarity !== newItem.rarity ||
           existingItem.exterior !== newItem.exterior;
  }
}