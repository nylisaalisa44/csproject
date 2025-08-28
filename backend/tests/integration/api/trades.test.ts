import request from 'supertest';
import { testData, testUtils } from '../../setup';
import { app } from '../../../src/index-test';

describe('Trades API', () => {
  let user: any;
  let authToken: string;

  beforeEach(async () => {
    user = await testUtils.createTestUser();
    authToken = testUtils.generateTestToken(user._id.toString(), user);
  });

  describe('POST /api/trades', () => {
    it('должен создать трейд покупки с валидными данными', async () => {
      const tradeData = {
        type: 'buy',
        items: testData.trades.buy.items,
        totalAmount: testData.trades.buy.totalAmount
      };

      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tradeData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.type).toBe('buy');
      expect(response.body.data.totalAmount).toBe(tradeData.totalAmount);
      expect(response.body.data.status).toBe('pending');
    });

    it('должен создать трейд продажи', async () => {
      const tradeData = {
        type: 'sell',
        items: testData.trades.sell.items,
        totalAmount: testData.trades.sell.totalAmount
      };

      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tradeData);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('sell');
    });

    it('должен вернуть ошибку при недостаточном балансе', async () => {
      const tradeData = {
        type: 'buy',
        items: testData.trades.buy.items,
        totalAmount: 200 // Больше чем баланс пользователя
      };

      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tradeData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient balance');
    });

    it('должен вернуть ошибку без авторизации', async () => {
      const tradeData = {
        type: 'buy',
        items: testData.trades.buy.items,
        totalAmount: testData.trades.buy.totalAmount
      };

      const response = await request(app)
        .post('/api/trades')
        .send(tradeData);

      expect(response.status).toBe(401);
    });

    it('должен вернуть ошибку при невалидных данных', async () => {
      const invalidTradeData = {
        type: 'invalid',
        items: [],
        totalAmount: -10
      };

      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTradeData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/trades', () => {
    beforeEach(async () => {
      // Создаем несколько трейдов для тестирования
      await testUtils.createTestTrade(testData.trades.buy, user._id.toString());
      await testUtils.createTestTrade(testData.trades.sell, user._id.toString());
    });

    it('должен вернуть все трейды пользователя', async () => {
      const response = await request(app)
        .get('/api/trades')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trades).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('должен фильтровать по типу трейда', async () => {
      const response = await request(app)
        .get('/api/trades?type=buy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trades).toHaveLength(1);
      expect(response.body.data.trades[0].type).toBe('buy');
    });

    it('должен поддерживать пагинацию', async () => {
      const response = await request(app)
        .get('/api/trades?limit=1&page=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trades).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
    });

    it('должен вернуть ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/trades');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trades/:id', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade(testData.trades.buy, user._id.toString());
    });

    it('должен вернуть конкретный трейд', async () => {
      const response = await request(app)
        .get(`/api/trades/${trade._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(trade._id.toString());
    });

    it('должен вернуть 404 для несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/trades/${fakeTradeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('должен вернуть 403 для трейда другого пользователя', async () => {
      const otherUser = await testUtils.createTestUser({
        ...testData.users.valid,
        steamId: '76561198037414412'
      });
      const otherUserTrade = await testUtils.createTestTrade(testData.trades.buy, otherUser._id.toString());

      const response = await request(app)
        .get(`/api/trades/${otherUserTrade._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/trades/:id/cancel', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade(testData.trades.buy, user._id.toString());
    });

    it('должен отменить pending трейд', async () => {
      const response = await request(app)
        .put(`/api/trades/${trade._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('должен вернуть 404 для несуществующего трейда', async () => {
      const fakeTradeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/trades/${fakeTradeId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('должен вернуть ошибку при отмене завершенного трейда', async () => {
      // Сначала завершаем трейд
      trade.status = 'completed';
      await trade.save();

      const response = await request(app)
        .put(`/api/trades/${trade._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be cancelled');
    });
  });

  describe('PUT /api/trades/:id/process', () => {
    let trade: any;

    beforeEach(async () => {
      trade = await testUtils.createTestTrade(testData.trades.buy, user._id.toString());
    });

    it('должен перевести трейд в обработку', async () => {
      const response = await request(app)
        .put(`/api/trades/${trade._id}/process`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('processing');
    });

    it('должен вернуть ошибку при обработке завершенного трейда', async () => {
      // Сначала завершаем трейд
      trade.status = 'completed';
      await trade.save();

      const response = await request(app)
        .put(`/api/trades/${trade._id}/process`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be processed');
    });
  });
});
