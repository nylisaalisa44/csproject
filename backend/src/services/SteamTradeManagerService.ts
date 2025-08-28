import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import TradeOfferManager from 'steam-tradeoffer-manager';
import { IBotDocument } from '../types';
import { SteamTradeOffer, SteamInventoryItem, TradeOfferManagerOptions, InventorySyncResult, TradeProcessingResult } from '../types/steam-types';

export class SteamTradeManagerService {
  private steamUser: SteamUser;
  private steamCommunity: SteamCommunity;
  private tradeOfferManager: TradeOfferManager;
  private isLoggedIn: boolean = false;
  private isLoggingIn: boolean = false;
  private isPolling: boolean = false;

  constructor() {
    this.steamUser = new SteamUser();
    this.steamCommunity = new SteamCommunity();
    
    // Инициализируем TradeOfferManager с отключенным автоматическим polling
    this.tradeOfferManager = new TradeOfferManager({
      steam: this.steamUser,
      community: this.steamCommunity,
      domain: 'localhost', // Можно изменить на ваш домен
      language: 'english',
      pollInterval: 0, // Отключаем автоматический polling
      minimumPollInterval: 0, // Отключаем минимальный интервал
      cancelTime: 24 * 60 * 60 * 1000, // 24 часа
      pendingCancelTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
      cancelOfferCount: 5, // Максимум 5 отмененных трейдов
      cancelOfferCountMinAge: 24 * 60 * 60 * 1000 // 24 часа
    });

    this.setupEventHandlers();
  }

  /**
   * Инициализация состояния при старте приложения
   */
  async initializeState(): Promise<void> {
    try {
      console.log('🔄 Initializing SteamTradeManagerService state...');
      
      // Сбрасываем состояние при старте
      this.isLoggedIn = false;
      this.isLoggingIn = false;
      
      console.log('✅ SteamTradeManagerService state initialized');
    } catch (error) {
      console.error('❌ Error initializing SteamTradeManagerService state:', error);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventHandlers() {
    // Обработчики SteamUser для отслеживания состояния
    this.steamUser.on('disconnected', () => {
      console.log('⚠️ Steam user disconnected');
      this.isLoggedIn = false;
    });

    // Настраиваем обработчики для TradeOfferManager
    this.setupTradeOfferManagerHandlers();
  }

  /**
   * Настройка обработчиков событий TradeOfferManager
   */
  private setupTradeOfferManagerHandlers() {
    // Обработчики TradeOfferManager согласно документации
    this.tradeOfferManager.on('sentOfferChanged', (offer: any, oldState: any) => {
      console.log(`📤 Sent offer ${offer.id} changed from ${oldState} to ${offer.state}`);
    });

    this.tradeOfferManager.on('receivedOfferChanged', (offer: any, oldState: any) => {
      console.log(`📥 Received offer ${offer.id} changed from ${oldState} to ${offer.state}`);
    });

    this.tradeOfferManager.on('newOffer', (offer: any) => {
      console.log(`🎁 New trade offer received: ${offer.id}`);
      this.handleNewOffer(offer);
    });

    this.tradeOfferManager.on('sentOfferCanceled', (offer: any, reason: any) => {
      console.log(`❌ Sent offer ${offer.id} canceled: ${reason}`);
    });

    this.tradeOfferManager.on('receivedOfferCanceled', (offer: any, reason: any) => {
      console.log(`❌ Received offer ${offer.id} canceled: ${reason}`);
    });

    // Дополнительные обработчики
    this.tradeOfferManager.on('pollFailure', (err: any) => {
      console.error('❌ Poll failure:', err);
    });

    this.tradeOfferManager.on('pollSuccess', () => {
      // Убираем спам логов - логируем только если polling активен
      if (this.isPolling) {
        console.log('✅ Poll successful');
      }
    });

    this.tradeOfferManager.on('sessionExpired', (err: any) => {
      console.error('❌ Session expired:', err);
      this.isLoggedIn = false;
    });
  }

  /**
   * Авторизация бота в Steam
   */
  async loginBot(bot: IBotDocument): Promise<boolean> {
    try {
      console.log(`🔐 Attempting to login bot ${bot.displayName} to Steam...`);

      // Проверяем наличие необходимых данных
      if (!bot.steamUsername || !bot.steamPassword) {
        console.error(`❌ Bot ${bot.displayName} missing username or password`);
        return false;
      }

      // Проверяем наличие 2FA кода
      if (!bot.steamGuardCode) {
        console.log(`⚠️ Bot ${bot.displayName} requires 2FA code but none provided`);
        console.log(`💡 Please login through admin panel with 2FA code`);
        return false;
      }

      // Проверяем, не залогинен ли уже SteamUser
      if (this.isLoggedIn) {
        console.log(`⚠️ SteamUser is already logged on, logging off first...`);
        try {
          this.steamUser.logOff();
          this.isLoggedIn = false;
          // Ждем немного для завершения logout
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`✅ SteamUser logged off successfully`);
        } catch (error) {
          console.log(`⚠️ Error during logout:`, error);
          // Сбрасываем флаг в любом случае
          this.isLoggedIn = false;
        }
      }

      // Устанавливаем флаг процесса логина
      this.isLoggingIn = true;

      // Логинимся в Steam с повторными попытками
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          await new Promise<void>((resolve, reject) => {
            // Устанавливаем обработчики ДО вызова logOn
            this.steamUser.once('loggedOn', async () => {
              console.log(`✅ Bot ${bot.displayName} logged in successfully`);
              
              // Сбрасываем флаг процесса логина
              this.isLoggingIn = false;
              
              resolve();
            });

            this.steamUser.once('error', (err: any) => {
              console.error(`❌ Bot ${bot.displayName} login error:`, err);
              this.isLoggingIn = false;
              reject(err);
            });

            // Обработчик для Steam Guard кода
            this.steamUser.once('steamGuard', (domain: string, callback: (code: string) => void) => {
              console.log(`🔐 Steam Guard required for bot ${bot.displayName}, domain: ${domain || 'unknown'}`);
              
              // Если домен null или пустой, это может быть ошибка
              if (!domain) {
                console.log(`⚠️ Steam Guard domain is null/empty, this might be an error`);
                callback(''); // Возвращаем пустую строку для отмены
                return;
              }
              
              // Используем 2FA код из бота
              if (bot.steamGuardCode) {
                console.log(`🔐 Using 2FA code for bot ${bot.displayName}`);
                callback(bot.steamGuardCode);
              } else {
                console.log(`❌ No 2FA code available for bot ${bot.displayName}`);
                callback(''); // Возвращаем пустую строку для отмены
              }
            });

            // Обработчик для получения web session cookies
            this.steamUser.once('webSession', async (sessionID: string, cookies: string[]) => {
              console.log(`🍪 Received web session for bot ${bot.displayName}`);
              console.log(`📋 Session ID: ${sessionID}`);
              console.log(`🍪 Cookies count: ${cookies.length}`);
              console.log(`🍪 Cookies:`, cookies);
              
              // Извлекаем нужные cookies
              const sessionCookie = cookies.find(cookie => cookie.includes('sessionid='));
              const loginSecureCookie = cookies.find(cookie => cookie.includes('steamLoginSecure='));
              
              console.log(`🔍 Found sessionCookie: ${!!sessionCookie}`);
              console.log(`🔍 Found loginSecureCookie: ${!!loginSecureCookie}`);
              
              if (sessionCookie) {
                bot.steamSessionId = sessionCookie.split('=')[1];
                console.log(`💾 Saved sessionid for bot ${bot.displayName}: ${bot.steamSessionId.substring(0, 10)}...`);
              } else {
                console.log(`❌ No sessionid cookie found in:`, cookies);
              }
              
              if (loginSecureCookie) {
                bot.steamLoginSecure = loginSecureCookie.split('=')[1];
                console.log(`💾 Saved steamLoginSecure for bot ${bot.displayName}: ${bot.steamLoginSecure.substring(0, 10)}...`);
              } else {
                console.log(`❌ No steamLoginSecure cookie found in:`, cookies);
              }
              
              console.log(`💾 Session data before save:`, {
                steamSessionId: bot.steamSessionId ? `${bot.steamSessionId.substring(0, 10)}...` : 'NULL',
                steamLoginSecure: bot.steamLoginSecure ? `${bot.steamLoginSecure.substring(0, 10)}...` : 'NULL'
              });
              
              // Обновляем статус бота ВНУТРИ обработчика webSession
              bot.isOnline = true;
              bot.lastLogin = new Date();
              // Сбрасываем счетчики ошибок при успешном логине
              bot.lastLoginError = undefined;
              bot.lastLoginErrorTime = undefined;
              bot.loginAttempts = 0;
              bot.isThrottled = false;
              bot.throttleUntil = undefined;
              
              try {
                await bot.save();
                console.log(`✅ Bot ${bot.displayName} status saved with session data`);
                console.log(`💾 Session data after save:`, {
                  steamSessionId: bot.steamSessionId ? `${bot.steamSessionId.substring(0, 10)}...` : 'NULL',
                  steamLoginSecure: bot.steamLoginSecure ? `${bot.steamLoginSecure.substring(0, 10)}...` : 'NULL'
                });
                
                // Устанавливаем cookies в TradeOfferManager
                console.log(`🍪 Setting cookies in TradeOfferManager for bot ${bot.displayName}...`);
                this.tradeOfferManager.setCookies(cookies);
                console.log(`✅ Cookies set in TradeOfferManager for bot ${bot.displayName}`);
                
              } catch (saveError) {
                console.error(`❌ Error saving bot status:`, saveError);
              }
            });

            // Таймаут на логин
            setTimeout(() => {
              this.isLoggingIn = false;
              reject(new Error('Login timeout'));
            }, 30000);

            // Теперь вызываем logOn
            this.steamUser.logOn({
              accountName: bot.steamUsername,
              password: bot.steamPassword,
              twoFactorCode: bot.steamGuardCode
            });
          });

          console.log(`✅ Bot ${bot.displayName} login completed successfully`);
          return true;

        } catch (error: any) {
          attempts++;
          
          // Проверяем различные типы ошибок
          if (error.message === 'RateLimitExceeded' || error.eresult === 84) {
            console.log(`⚠️ Rate limit exceeded for bot ${bot.displayName}, attempt ${attempts}/${maxAttempts}`);
            
            if (attempts < maxAttempts) {
              // Ждем экспоненциально увеличивающееся время: 30s, 60s, 120s
              const delay = 30 * Math.pow(2, attempts - 1) * 1000;
              console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            } else {
              console.error(`❌ Max attempts reached for bot ${bot.displayName}`);
              break;
            }
          } else if (error.message === 'AccountLoginDeniedThrottle' || error.eresult === 87) {
            console.log(`🚫 Account login denied due to throttle for bot ${bot.displayName}`);
            console.log(`⏳ This account is temporarily blocked. Please wait 1-2 hours before trying again.`);
            
            // Сохраняем информацию о блокировке
            bot.lastLoginError = 'AccountLoginDeniedThrottle';
            bot.lastLoginErrorTime = new Date();
            bot.loginAttempts = (bot.loginAttempts || 0) + 1;
            bot.isThrottled = true;
            bot.throttleUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 часа
            bot.isOnline = false;
            await bot.save();
            
            console.log(`⏳ Bot ${bot.displayName} is now throttled until ${bot.throttleUntil}`);
            return false;
          } else {
            console.error(`❌ Login error for bot ${bot.displayName}:`, error);
            break;
          }
        }
      }

      // Если все попытки исчерпаны
      bot.lastLoginError = 'Login failed after all attempts';
      bot.lastLoginErrorTime = new Date();
      bot.loginAttempts = (bot.loginAttempts || 0) + 1;
      bot.isOnline = false;
      await bot.save();

      console.error(`❌ Failed to login bot ${bot.displayName} after ${maxAttempts} attempts`);
      return false;

    } catch (error) {
      console.error(`❌ Error logging in bot ${bot.displayName}:`, error);
      return false;
    }
  }

  /**
   * Восстановление сессии бота
   */
  async restoreSession(bot: IBotDocument): Promise<boolean> {
    try {
      console.log(`🔄 Checking session for bot ${bot.displayName}...`);

      if (!bot.steamSessionId || !bot.steamLoginSecure) {
        console.log(`⚠️ No saved session found for bot ${bot.displayName}`);
        return false;
      }

      // Проверяем валидность cookies перед установкой
      if (bot.steamSessionId === 'null' || bot.steamLoginSecure === 'null' || 
          bot.steamSessionId === 'undefined' || bot.steamLoginSecure === 'undefined') {
        console.log(`❌ Invalid cookies found for bot ${bot.displayName} - clearing session`);
        bot.steamSessionId = undefined;
        bot.steamLoginSecure = undefined;
        bot.isOnline = false;
        bot.lastLoginError = 'Invalid cookies';
        bot.lastLoginErrorTime = new Date();
        await bot.save();
        return false;
      }

      // Устанавливаем cookies в SteamCommunity
      const cookies = [
        `sessionid=${bot.steamSessionId}`,
        `steamLoginSecure=${bot.steamLoginSecure}`
      ];

      try {
        this.steamCommunity.setCookies(cookies);
        console.log(`✅ Cookies set for bot ${bot.displayName}`);
      } catch (cookieError) {
        console.error(`❌ Error setting cookies for bot ${bot.displayName}:`, cookieError);
        // Очищаем невалидные cookies
        bot.steamSessionId = undefined;
        bot.steamLoginSecure = undefined;
        bot.isOnline = false;
        bot.lastLoginError = 'Cookie setting failed';
        bot.lastLoginErrorTime = new Date();
        await bot.save();
        return false;
      }

      // Проверяем, что сессия действительна, пытаясь получить профиль
      const isValid = await this.validateSession(bot);
      if (isValid) {
        // Инициализируем TradeOfferManager с восстановленной сессией
        console.log(`🔄 Initializing TradeOfferManager with restored session...`);
        
        // Создаем новый экземпляр TradeOfferManager с восстановленной сессией
        this.tradeOfferManager = new TradeOfferManager({
          steam: this.steamUser,
          community: this.steamCommunity,
          domain: 'localhost',
          language: 'english',
          pollInterval: 30000,
          minimumPollInterval: 1000,
          cancelTime: 24 * 60 * 60 * 1000,
          pendingCancelTime: 7 * 24 * 60 * 60 * 1000,
          cancelOfferCount: 5,
          cancelOfferCountMinAge: 24 * 60 * 60 * 1000
        });

        // Устанавливаем cookies в TradeOfferManager
        console.log(`🍪 Setting cookies in TradeOfferManager for bot ${bot.displayName}...`);
        this.tradeOfferManager.setCookies(cookies);
        console.log(`✅ Cookies set in TradeOfferManager for bot ${bot.displayName}`);

        // Настраиваем обработчики событий для нового TradeOfferManager
        this.setupEventHandlers();
        
        this.isLoggedIn = true;
        bot.isOnline = true;
        bot.lastLogin = new Date();
        await bot.save();
        console.log(`✅ Session restored successfully for bot ${bot.displayName}`);
        return true;
      } else {
        console.log(`❌ Session validation failed for bot ${bot.displayName}`);
        // Сбрасываем невалидную сессию
        bot.steamSessionId = undefined;
        bot.steamLoginSecure = undefined;
        bot.isOnline = false;
        bot.lastLoginError = 'Session expired';
        bot.lastLoginErrorTime = new Date();
        await bot.save();
        return false;
      }

    } catch (error) {
      console.error(`❌ Failed to restore session for bot ${bot.displayName}:`, error);
      // Очищаем сессию при ошибке
      bot.steamSessionId = undefined;
      bot.steamLoginSecure = undefined;
      bot.isOnline = false;
      bot.lastLoginError = error instanceof Error ? error.message : 'Restore session failed';
      bot.lastLoginErrorTime = new Date();
      await bot.save();
      return false;
    }
  }

  /**
   * Проверка валидности сессии
   */
  private async validateSession(bot: IBotDocument): Promise<boolean> {
    try {
      // Проверяем наличие cookies
      if (!bot.steamSessionId || !bot.steamLoginSecure) {
        console.log(`❌ Session validation failed - missing cookies`);
        return false;
      }

      // Проверяем длину cookies (должны быть достаточно длинными)
      if (bot.steamSessionId.length < 10 || bot.steamLoginSecure.length < 10) {
        console.log(`❌ Session validation failed - cookies too short`);
        return false;
      }

      console.log(`✅ Session validation successful - cookies present and valid length`);
      return true;
    } catch (error) {
      console.error(`❌ Session validation error for bot ${bot.displayName}:`, error);
      return false;
    }
  }

  /**
   * Получение инвентаря бота используя TradeOfferManager
   */
  async getBotInventory(bot: IBotDocument, appId: number = 730, contextId: string = '2', skipLoginCheck: boolean = false): Promise<SteamInventoryItem[]> {
    try {
      console.log(`📦 Getting inventory for bot ${bot.displayName}...`);

      if (!skipLoginCheck && !this.isLoggedIn) {
        throw new Error('Bot not logged in');
      }

      // Используем TradeOfferManager для получения инвентаря
      const inventory = await new Promise<any[]>((resolve, reject) => {
        this.tradeOfferManager.getInventoryContents(appId, contextId, true, (err: any, items: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });

      console.log(`✅ Got ${inventory.length} items for bot ${bot.displayName}`);
      return inventory;

    } catch (error) {
      console.error(`❌ Error getting inventory for bot ${bot.displayName}:`, error);
      throw error;
    }
  }

  /**
   * Синхронизация инвентаря бота
   */
  async syncBotInventory(bot: IBotDocument): Promise<InventorySyncResult> {
    try {
      console.log(`🔄 Syncing inventory for bot ${bot.displayName}...`);

      // Обновляем статус синхронизации
      bot.syncStatus = 'syncing';
      await bot.save();

      // Получаем инвентарь из Steam
      const steamInventory = await this.getBotInventory(bot);
      console.log(`📦 Got ${steamInventory.length} items from Steam for bot ${bot.displayName}`);
      
      const currentItems = new Map();
      const steamItems = new Map();

      // Создаем карту текущих предметов бота
      console.log(`📋 Current inventory in DB: ${bot.inventory.length} items`);
      bot.inventory.forEach(item => {
        currentItems.set(item.assetId, item);
      });

      // Обрабатываем предметы из Steam
      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const steamItem of steamInventory) {
        console.log(`🔍 Processing Steam item: ${steamItem.name} (assetId: ${steamItem.assetid}, tradable: ${steamItem.tradable})`);
        
        // Проверяем tradable используя Boolean() для обработки разных типов
        const isTradable = Boolean(steamItem.tradable);
        console.log(`🔍 Item tradable check: ${steamItem.tradable} (${typeof steamItem.tradable}) -> isTradable: ${isTradable}`);
        
        if (isTradable) {
          const item = {
            itemId: steamItem.classid,
            itemName: steamItem.name,
            steamId: steamItem.classid,
            assetId: steamItem.assetid,
            classId: steamItem.classid,
            instanceId: steamItem.instanceid,
            marketHashName: steamItem.market_hash_name,
            iconUrl: steamItem.icon_url,
            rarity: this.extractRarity(steamItem.tags),
            exterior: this.extractExterior(steamItem.descriptions)
          };

          console.log(`📝 Created item object: ${item.itemName} (assetId: ${item.assetId})`);
          steamItems.set(steamItem.assetid, item);

          if (!currentItems.has(steamItem.assetid)) {
            // Новый предмет
            console.log(`➕ Adding new item: ${item.itemName} (assetId: ${item.assetId})`);
            await bot.addItem(item);
            added++;
            console.log(`✅ Item added successfully`);
          } else {
            // Обновляем существующий предмет
            const existingItem = currentItems.get(steamItem.assetid);
            if (this.hasItemChanged(existingItem, item)) {
              console.log(`🔄 Updating existing item: ${item.itemName} (assetId: ${item.assetId})`);
              await bot.addItem(item);
              updated++;
              console.log(`✅ Item updated successfully`);
            } else {
              console.log(`⏭️ Item unchanged: ${item.itemName} (assetId: ${item.assetId})`);
            }
          }
        } else {
          console.log(`🚫 Skipping non-tradable item: ${steamItem.name} (assetId: ${steamItem.assetid})`);
          skipped++;
        }
      }

      // Удаляем предметы, которых больше нет в Steam
      let removed = 0;
      for (const [assetId, item] of currentItems) {
        if (!steamItems.has(assetId)) {
          console.log(`🗑️ Removing item not in Steam: ${item.itemName} (assetId: ${assetId})`);
          await bot.removeItem(assetId);
          removed++;
        }
      }

      // Обновляем время последней синхронизации
      bot.lastSync = new Date();
      bot.syncStatus = 'idle';
      await bot.save();

      console.log(`✅ Bot ${bot.displayName} inventory synced: +${added}, -${removed}, ~${updated}, skipped: ${skipped}`);
      console.log(`📊 Final inventory count in DB: ${bot.inventory.length} items`);
      
      return { added, removed, updated };

    } catch (error) {
      console.error(`❌ Error syncing bot ${bot.displayName} inventory:`, error);
      bot.syncStatus = 'error';
      await bot.save();
      throw error;
    }
  }

  /**
   * Создание трейда от бота к пользователю
   */
  async createTradeOffer(bot: IBotDocument, partnerSteamId: string, itemsToGive: string[], itemsToReceive: string[]): Promise<string> {
    try {
      console.log(`🎯 Creating trade offer from bot ${bot.displayName} to user ${partnerSteamId}`);

      if (!this.isLoggedIn) {
        throw new Error('Bot not logged in');
      }

      // Создаем трейд согласно документации
      const offer = this.tradeOfferManager.createOffer(partnerSteamId);

      // Добавляем предметы для отправки
      for (const assetId of itemsToGive) {
        offer.addMyItem({
          appid: 730,
          contextid: '2',
          assetid: assetId
        });
      }

      // Добавляем предметы для получения
      for (const assetId of itemsToReceive) {
        offer.addTheirItem({
          appid: 730,
          contextid: '2',
          assetid: assetId
        });
      }

      // Устанавливаем сообщение
      offer.setMessage('Trade offer from CS2 Trading Platform');

      // Отправляем трейд
      const result = await new Promise<any>((resolve, reject) => {
        offer.send((err: any, status: any) => {
          if (err) {
            reject(err);
          } else {
            resolve({ status, offerId: offer.id });
          }
        });
      });

      if (result.status === 'pending') {
        console.log(`✅ Trade offer created: ${result.offerId}`);
        return result.offerId;
      } else {
        throw new Error(`Failed to create trade offer: ${result.status}`);
      }

    } catch (error) {
      console.error(`❌ Error creating trade offer:`, error);
      throw error;
    }
  }

  /**
   * Получение трейдов бота
   */
  async getTradeOffers(bot: IBotDocument): Promise<any[]> {
    try {
      console.log(`📋 Getting trade offers for bot ${bot.displayName}`);

      if (!this.isLoggedIn) {
        throw new Error('Bot not logged in');
      }

      // Используем EOfferFilter.ActiveOnly (значение 1) для получения только активных трейдов
      const offers = await new Promise<any[]>((resolve, reject) => {
        this.tradeOfferManager.getOffers(
          1, // EOfferFilter.ActiveOnly
          undefined, // historicalCutoff - используем значение по умолчанию
          (err: any, sent: any[], received: any[]) => {
            if (err) {
              reject(err);
            } else {
              // Возвращаем только входящие трейды
              resolve(received || []);
            }
          }
        );
      });

      console.log(`✅ Got ${offers.length} trade offers for bot ${bot.displayName}`);
      return offers;

    } catch (error) {
      console.error(`❌ Error getting trade offers for bot ${bot.displayName}:`, error);
      throw error;
    }
  }

  /**
   * Автоматическая обработка входящих трейдов
   */
  async processIncomingTrades(bot: IBotDocument): Promise<{ processed: number; accepted: number; declined: number }> {
    try {
      console.log(`🔄 Processing incoming trades for bot ${bot.displayName}`);

      if (!bot.isActive || !bot.isOnline) {
        console.log(`⚠️ Bot ${bot.displayName} is not active or online, skipping trade processing`);
        return { processed: 0, accepted: 0, declined: 0 };
      }

      // Проверяем, что бот залогинен
      if (!this.isLoggedIn) {
        console.log(`⚠️ Bot ${bot.displayName} is not logged in, skipping trade processing`);
        return { processed: 0, accepted: 0, declined: 0 };
      }

      const offers = await this.getTradeOffers(bot);
      let processed = 0;
      let accepted = 0;
      let declined = 0;

      // Теперь offers уже содержит только входящие трейды
      console.log(`📋 Found ${offers.length} incoming trade offers for bot ${bot.displayName}`);

      for (const offer of offers) {
        try {
          const shouldAccept = await this.shouldAcceptTrade(bot, offer);
          
          if (shouldAccept) {
            console.log(`✅ Accepting trade offer ${offer.id} for bot ${bot.displayName}`);
            await this.acceptTradeOffer(bot, offer.id);
            accepted++;
          } else {
            console.log(`❌ Declining trade offer ${offer.id} for bot ${bot.displayName}`);
            await this.declineTradeOffer(bot, offer.id);
            declined++;
          }
          
          processed++;
          
          // Добавляем задержку между обработкой трейдов
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error processing trade offer ${offer.id}:`, error);
        }
      }

      console.log(`✅ Processed ${processed} trades: ${accepted} accepted, ${declined} declined`);
      return { processed, accepted, declined };

    } catch (error) {
      console.error(`❌ Error processing incoming trades for bot ${bot.displayName}:`, error);
      return { processed: 0, accepted: 0, declined: 0 };
    }
  }

  /**
   * Принятие трейда
   */
  async acceptTradeOffer(bot: IBotDocument, tradeOfferId: string): Promise<boolean> {
    try {
      console.log(`✅ Accepting trade offer ${tradeOfferId} for bot ${bot.displayName}`);

      const result = await new Promise<any>((resolve, reject) => {
        this.tradeOfferManager.acceptOffer(tradeOfferId, (err: any, status: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(status);
          }
        });
      });

      if (result === 'accepted') {
        console.log(`✅ Trade offer ${tradeOfferId} accepted successfully`);
        return true;
      } else {
        throw new Error(`Failed to accept trade offer: ${result}`);
      }

    } catch (error) {
      console.error(`❌ Error accepting trade offer ${tradeOfferId}:`, error);
      throw error;
    }
  }

  /**
   * Отклонение трейда
   */
  async declineTradeOffer(bot: IBotDocument, tradeOfferId: string): Promise<boolean> {
    try {
      console.log(`❌ Declining trade offer ${tradeOfferId} for bot ${bot.displayName}`);

      const result = await new Promise<any>((resolve, reject) => {
        this.tradeOfferManager.declineOffer(tradeOfferId, (err: any, status: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(status);
          }
        });
      });

      if (result === 'declined') {
        console.log(`✅ Trade offer ${tradeOfferId} declined successfully`);
        return true;
      } else {
        throw new Error(`Failed to decline trade offer: ${result}`);
      }

    } catch (error) {
      console.error(`❌ Error declining trade offer ${tradeOfferId}:`, error);
      throw error;
    }
  }

  /**
   * Выход из Steam
   */
  async logout(): Promise<void> {
    try {
      console.log('🔓 Logging out from Steam...');
      
      // Останавливаем polling перед выходом
      if (this.isPolling) {
        this.stopPolling();
      }
      
      this.steamUser.logOff();
      this.isLoggedIn = false;
      console.log('✅ Logged out from Steam');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  }

  /**
   * Запуск polling для автоматического получения трейдов
   */
  startPolling(): void {
    if (this.isPolling) {
      console.log('⚠️ Polling is already running');
      return;
    }
    
    console.log('🔄 Starting trade offer polling...');
    this.isPolling = true;
    this.tradeOfferManager.doPoll();
  }

  /**
   * Остановка polling
   */
  stopPolling(): void {
    if (!this.isPolling) {
      console.log('⚠️ Polling is not running');
      return;
    }
    
    console.log('⏹️ Stopping trade offer polling...');
    this.isPolling = false;
    this.tradeOfferManager.shutdown();
  }

  /**
   * Проверка статуса polling
   */
  isPollingActive(): boolean {
    return this.isPolling;
  }

  // Вспомогательные методы

  private extractRarity(tags: any[]): string {
    const rarityTag = tags.find(tag => tag.category === 'Rarity');
    return rarityTag ? rarityTag.localized_tag_name : 'Common';
  }

  private extractExterior(descriptions: any[]): string {
    const exteriorDesc = descriptions.find(desc => 
      desc.value && desc.value.includes('Exterior:')
    );
    return exteriorDesc ? exteriorDesc.value.split('Exterior:')[1].trim() : '';
  }

  private hasItemChanged(oldItem: any, newItem: any): boolean {
    return (
      oldItem.marketHashName !== newItem.marketHashName ||
      oldItem.iconUrl !== newItem.iconUrl ||
      oldItem.rarity !== newItem.rarity ||
      oldItem.exterior !== newItem.exterior
    );
  }

  private async shouldAcceptTrade(bot: IBotDocument, tradeOffer: SteamTradeOffer): Promise<boolean> {
    // Проверяем настройки безопасности бота
    if (bot.security.requireConfirmation) {
      return false; // Требуется ручное подтверждение
    }

    // Проверяем заблокированных пользователей
    const partnerSteamId = tradeOffer.partner.getSteamID64();
    if (bot.security.blockedUsers.includes(partnerSteamId)) {
      return false;
    }

    // Проверяем разрешенных пользователей
    if (bot.security.allowedUsers.length > 0 && 
        !bot.security.allowedUsers.includes(partnerSteamId)) {
      return false;
    }

    // Проверяем стоимость трейда
    const totalValue = this.calculateTradeValue(tradeOffer);
    if (totalValue > bot.security.maxTradeValue) {
      return false;
    }

    return true;
  }

  private calculateTradeValue(tradeOffer: SteamTradeOffer): number {
    let totalValue = 0;
    
    // Суммируем стоимость всех предметов
    [...tradeOffer.itemsToGive, ...tradeOffer.itemsToReceive].forEach(item => {
      // Здесь нужно получить реальную стоимость предмета
      // Пока используем базовую логику
      totalValue += 1; // Заглушка
    });
    
    return totalValue;
  }

  private handleNewOffer(offer: any): void {
    console.log(`🎁 New trade offer received: ${offer.id} from ${offer.partner.getSteamID64()}`);
    // Здесь можно добавить логику автоматической обработки новых трейдов
  }
}