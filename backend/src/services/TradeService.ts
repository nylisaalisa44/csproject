import { Trade } from '../models/Trade';
import { Item } from '../models/Item';
import { User } from '../models/User';
import { ITradeDocument } from '../types';

export class TradeService {
  /**
   * Расчет стоимости трейда
   */
  static async calculateTrade(type: 'buy' | 'sell', items: any[]): Promise<{
    type: 'buy' | 'sell';
    items: any[];
    totalAmount: number;
    currency: string;
  }> {
    let totalAmount = 0;
    const processedItems = [];

    // Обрабатываем каждый предмет
    for (const item of items) {
      if (type === 'buy') {
        // Покупаем у нас - берем цену из нашей базы
        const dbItem = await Item.findById(item.itemId);
        if (!dbItem || !dbItem.isAvailable || dbItem.quantity <= 0) {
          throw new Error(`Item ${item.itemName} is not available`);
        }
        
        totalAmount += dbItem.ourPrice;
        processedItems.push({
          itemId: dbItem._id,
          itemName: dbItem.displayName,
          price: dbItem.ourPrice,
          steamId: dbItem.steamId
        });
      } else {
        // Продаем нам - используем Steam цену или нашу оценку
        // TODO: Интеграция с Steam Market API для получения актуальных цен
        const estimatedPrice = item.estimatedPrice || 0;
        totalAmount += estimatedPrice;
        processedItems.push({
          itemId: item.itemId,
          itemName: item.itemName,
          price: estimatedPrice,
          steamId: item.steamId
        });
      }
    }

    return {
      type,
      items: processedItems,
      totalAmount,
      currency: 'USD'
    };
  }

  /**
   * Создание нового трейда
   */
  static async createTrade(
    userId: string, 
    type: 'buy' | 'sell', 
    items: any[], 
    totalAmount: number
  ): Promise<ITradeDocument> {
    // Проверяем баланс пользователя для покупки
    if (type === 'buy') {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Используем метод из модели User для проверки баланса
      user.validateBalanceForPurchase(totalAmount);
    }

    // Создаем трейд
    const trade = new Trade({
      userId,
      type,
      items,
      totalAmount,
      status: 'pending'
    });

    await trade.save();

    // TODO: Отправляем запрос боту для создания Steam трейда
    // await BotService.createSteamTrade(trade);

    return trade;
  }

  /**
   * Получение истории трейдов пользователя
   */
  static async getUserTrades(
    userId: string, 
    filters: { status?: string; type?: string } = {},
    pagination: { limit: number; page: number } = { limit: 50, page: 1 }
  ): Promise<{ trades: ITradeDocument[]; total: number }> {
    // Строим фильтр
    const filter: any = { userId };
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    // Пагинация
    const skip = (pagination.page - 1) * pagination.limit;
    
    const trades = await Trade.find(filter)
      .populate('userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit);

    const total = await Trade.countDocuments(filter);

    return { trades, total };
  }

  /**
   * Получение трейда по ID (только для владельца)
   */
  static async getTrade(tradeId: string, userId: string): Promise<ITradeDocument | null> {
    return await Trade.findOne({ _id: tradeId, userId }).populate('userId');
  }

  /**
   * Проверка существования трейда (без проверки владельца)
   */
  static async tradeExists(tradeId: string): Promise<boolean> {
    const trade = await Trade.findById(tradeId);
    return !!trade;
  }

  /**
   * Отмена трейда
   */
  static async cancelTrade(tradeId: string, userId: string): Promise<ITradeDocument> {
    const trade = await Trade.findOne({ _id: tradeId, userId });
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'pending') {
      throw new Error('Trade cannot be cancelled');
    }

    trade.status = 'cancelled';
    return await trade.save();
  }

  /**
   * Завершение трейда
   */
  static async completeTrade(tradeId: string, steamTradeId?: string): Promise<ITradeDocument> {
    const trade = await Trade.findById(tradeId);
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    trade.status = 'completed';
    if (steamTradeId) {
      trade.steamTradeId = steamTradeId;
    }
    return await trade.save();
  }

  /**
   * Перевод трейда в обработку
   */
  static async processTrade(tradeId: string, userId: string): Promise<ITradeDocument> {
    const trade = await Trade.findOne({ _id: tradeId, userId });
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'pending') {
      throw new Error('Trade cannot be processed');
    }

    trade.status = 'processing';
    return await trade.save();
  }

  /**
   * Завершение трейда с полной обработкой (баланс + предметы)
   */
  static async completeTradeWithProcessing(tradeId: string, userId: string): Promise<any> {
    const trade = await Trade.findOne({ _id: tradeId, userId }).populate('userId');
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status === 'completed') {
      throw new Error('Trade already completed');
    }

    const user = trade.userId as any;
    const { TransactionService } = await import('./TransactionService');

    try {
      // Обновляем баланс пользователя
      if (trade.type === 'buy') {
        // Покупатель: списываем деньги
        await user.safeDeductBalance(trade.totalAmount);
        console.log(`💰 Списано $${trade.totalAmount} с баланса пользователя ${user.steamId}`);
      } else {
        // Продавец: добавляем деньги
        await user.updateBalance(trade.totalAmount);
        console.log(`💰 Добавлено $${trade.totalAmount} на баланс пользователя ${user.steamId}`);
      }

      // Создаем транзакцию
      await TransactionService.createTradeTransaction(
        user._id.toString(),
        trade.type === 'buy' ? 'purchase' : 'sale',
        trade.totalAmount,
        (trade._id as any).toString(),
        {
          itemName: trade.items.map(item => item.itemName).join(', '),
          steamTradeId: trade.steamTradeId
        }
      );

      // Завершаем трейд
      trade.status = 'completed';
      await trade.save();

      console.log(`✅ Трейд ${trade._id} завершен успешно`);

      return {
        trade,
        balanceChange: trade.type === 'buy' ? -trade.totalAmount : trade.totalAmount,
        newBalance: user.balance,
        transactionCreated: true
      };

    } catch (error) {
      console.error('❌ Ошибка при завершении трейда:', error);
      throw new Error(`Failed to complete trade: ${(error as Error).message}`);
    }
  }

  /**
   * Обработка завершенного трейда
   */
  static async processCompletedTrade(tradeId: string): Promise<void> {
    const trade = await Trade.findById(tradeId).populate('userId');
    
    if (!trade || trade.status !== 'completed') {
      throw new Error('Trade not found or not completed');
    }

    const user = trade.userId as any;

    if (trade.type === 'buy') {
      // Покупатель: списываем деньги, добавляем предметы
      await user.safeDeductBalance(trade.totalAmount);
      
      // TODO: Добавляем предметы в инвентарь пользователя
      // await UserInventoryService.addItems(user._id, trade.items);
      
    } else {
      // Продавец: добавляем деньги, убираем предметы
      await user.updateBalance(trade.totalAmount);
      
      // TODO: Убираем предметы из инвентаря пользователя
      // await UserInventoryService.removeItems(user._id, trade.items);
    }

    // Создаем транзакцию
    await this.createTradeTransaction(trade);
  }

  /**
   * Создание транзакции для трейда
   */
  private static async createTradeTransaction(trade: ITradeDocument): Promise<void> {
    const { TransactionService } = await import('./TransactionService');
    
    await TransactionService.createTradeTransaction(
      trade.userId.toString(),
      trade.type === 'buy' ? 'purchase' : 'sale',
      trade.totalAmount,
      (trade._id as any).toString(),
      {
        itemName: trade.items.map(item => item.itemName).join(', '),
        steamTradeId: trade.steamTradeId
      }
    );
  }
}
