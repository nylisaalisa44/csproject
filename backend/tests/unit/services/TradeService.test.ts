import { testData, testUtils } from '../../setup';
import { TradeService } from '../../../src/services/TradeService';
import { User } from '../../../src/models/User';
import { Trade } from '../../../src/models/Trade';

describe('TradeService', () => {
  let user: any;

  beforeEach(async () => {
    // Создаем пользователя с достаточным балансом
    user = await testUtils.createTestUser({
      ...testData.users.valid,
      balance: 1000, // Увеличиваем баланс для тестов
      steamId: `7656119803741441${Math.floor(Math.random() * 1000)}` // Уникальный steamId
    });
  });

  describe('createTrade', () => {
    it('должен создать трейд покупки с достаточным балансом', async () => {
      const tradeData = {
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      };
      
      const trade = await TradeService.createTrade(
        user._id.toString(),
        tradeData.type,
        tradeData.items,
        tradeData.totalAmount
      );

      expect(trade._id).toBeDefined();
      expect(trade.userId.toString()).toBe(user._id.toString());
      expect(trade.type).toBe(tradeData.type);
      expect(trade.items).toHaveLength(tradeData.items.length);
      expect(trade.items[0].itemName).toBe(tradeData.items[0].itemName);
      expect(trade.totalAmount).toBe(tradeData.totalAmount);
      expect(trade.status).toBe('pending');
    });

    it('должен создать трейд продажи без проверки баланса', async () => {
      const tradeData = {
        ...testData.trades.sell,
        items: [
          {
            itemId: '2',
            itemName: 'M4A4 | Desolate Space',
            price: 25.00,
            steamId: '76561198037414410'
          }
        ]
      };
      
      const trade = await TradeService.createTrade(
        user._id.toString(),
        tradeData.type,
        tradeData.items,
        tradeData.totalAmount
      );

      expect(trade._id).toBeDefined();
      expect(trade.type).toBe(tradeData.type);
      expect(trade.status).toBe('pending');
    });

    it('должен выбрасывать ошибку при недостаточном балансе для покупки', async () => {
      const tradeData = {
        ...testData.trades.buy,
        totalAmount: 2000, // Больше чем баланс пользователя (1000)
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 2000,
            steamId: '76561198037414410'
          }
        ]
      };

      await expect(
        TradeService.createTrade(
          user._id.toString(),
          tradeData.type,
          tradeData.items,
          tradeData.totalAmount
        )
      ).rejects.toThrow('Insufficient balance');
    });

    it('должен выбрасывать ошибку при несуществующем пользователе', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      
      await expect(
        TradeService.createTrade(
          fakeUserId,
          testData.trades.buy.type,
          testData.trades.buy.items,
          testData.trades.buy.totalAmount
        )
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserTrades', () => {
    beforeEach(async () => {
      // Создаем несколько трейдов для тестирования
      await testUtils.createTestTrade({
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
      
      await testUtils.createTestTrade({
        ...testData.trades.sell,
        type: 'sell' as const,
        items: [
          {
            itemId: '2',
            itemName: 'M4A4 | Desolate Space',
            price: 25.00,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
    });

    it('должен возвращать все трейды пользователя', async () => {
      const result = await TradeService.getUserTrades(user._id.toString());

      expect(result.trades).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.trades[0].userId?._id?.toString()).toBe(user._id.toString());
    });

    it('должен фильтровать по типу трейда', async () => {
      const result = await TradeService.getUserTrades(user._id.toString(), { type: 'buy' });

      expect(result.trades).toHaveLength(1);
      expect(result.trades[0].type).toBe('buy');
    });

    it('должен фильтровать по статусу', async () => {
      const result = await TradeService.getUserTrades(user._id.toString(), { status: 'pending' });

      expect(result.trades).toHaveLength(2);
      expect(result.trades[0].status).toBe('pending');
    });

    it('должен поддерживать пагинацию', async () => {
      const result = await TradeService.getUserTrades(
        user._id.toString(),
        {},
        { limit: 1, page: 1 }
      );

      expect(result.trades).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('getTrade', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade({
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
    });

    it('должен найти трейд по ID', async () => {
      const foundTrade = await TradeService.getTrade(trade._id.toString(), user._id.toString());

      expect(foundTrade).toBeDefined();
      expect(foundTrade?._id.toString()).toBe(trade._id.toString());
    });

    it('должен вернуть null для несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';
      const foundTrade = await TradeService.getTrade(fakeTradeId, user._id.toString());

      expect(foundTrade).toBeNull();
    });

    it('должен вернуть null для трейда другого пользователя', async () => {
      const otherUser = await testUtils.createTestUser({
        ...testData.users.valid,
        steamId: `7656119803741442${Math.floor(Math.random() * 1000)}`
      });

      const foundTrade = await TradeService.getTrade(trade._id.toString(), otherUser._id.toString());

      expect(foundTrade).toBeNull();
    });
  });

  describe('cancelTrade', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade({
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
    });

    it('должен отменить pending трейд', async () => {
      const cancelledTrade = await TradeService.cancelTrade(trade._id.toString(), user._id.toString());

      expect(cancelledTrade.status).toBe('cancelled');
    });

    it('должен выбрасывать ошибку при отмене несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';

      await expect(
        TradeService.cancelTrade(fakeTradeId, user._id.toString())
      ).rejects.toThrow('Trade not found');
    });

    it('должен выбрасывать ошибку при отмене завершенного трейда', async () => {
      // Сначала завершаем трейд
      trade.status = 'completed';
      await trade.save();

      await expect(
        TradeService.cancelTrade(trade._id.toString(), user._id.toString())
      ).rejects.toThrow('Trade cannot be cancelled');
    });
  });

  describe('completeTrade', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade({
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
    });

    it('должен завершить трейд', async () => {
      const completedTrade = await TradeService.completeTrade(trade._id.toString());

      expect(completedTrade.status).toBe('completed');
    });

    it('должен завершить трейд с Steam Trade ID', async () => {
      const steamTradeId = '123456789';
      const completedTrade = await TradeService.completeTrade(trade._id.toString(), steamTradeId);

      expect(completedTrade.status).toBe('completed');
      expect(completedTrade.steamTradeId).toBe(steamTradeId);
    });

    it('должен выбрасывать ошибку при завершении несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';

      await expect(
        TradeService.completeTrade(fakeTradeId)
      ).rejects.toThrow('Trade not found');
    });
  });

  describe('processTrade', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade({
        ...testData.trades.buy,
        items: [
          {
            itemId: '1',
            itemName: 'AK-47 | Redline',
            price: 15.50,
            steamId: '76561198037414410'
          }
        ]
      }, user._id.toString());
    });

    it('должен перевести pending трейд в processing', async () => {
      const processedTrade = await TradeService.processTrade(trade._id.toString(), user._id.toString());

      expect(processedTrade.status).toBe('processing');
    });

    it('должен выбрасывать ошибку при обработке несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';

      await expect(
        TradeService.processTrade(fakeTradeId, user._id.toString())
      ).rejects.toThrow('Trade not found');
    });

    it('должен выбрасывать ошибку при обработке завершенного трейда', async () => {
      // Сначала завершаем трейд
      trade.status = 'completed';
      await trade.save();

      await expect(
        TradeService.processTrade(trade._id.toString(), user._id.toString())
      ).rejects.toThrow('Trade cannot be processed');
    });
  });
});
