import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Отключаем BotSyncService в тестах
process.env.DISABLE_BOT_SYNC = 'true';

// Устанавливаем JWT_SECRET для тестов
process.env.JWT_SECRET = 'test-secret-key';

// Подключение к тестовой базе данных
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/cs2_trading_test';

let isConnected = false;

beforeAll(async () => {
  try {
    // Проверяем, не подключены ли мы уже
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Уже подключены к базе данных');
      isConnected = true;
      return;
    }

    await mongoose.connect(TEST_MONGODB_URI);
    isConnected = true;
    console.log('✅ Подключение к тестовой базе данных установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к тестовой базе данных:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('🔌 Соединение с тестовой базой данных закрыто');
    }
  } catch (error) {
    console.error('❌ Ошибка закрытия соединения:', error);
  }
});

// Очищаем базу данных перед каждым тестом
beforeEach(async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    // Очищаем все коллекции
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
        // Сбрасываем счетчики автоинкремента если есть
        if (collection.collectionName === 'counters') {
          await collection.deleteMany({});
        }
      } catch (error) {
        console.warn(`Ошибка при очистке коллекции ${key}:`, error);
      }
    }
    
    // Сбрасываем счетчик steamId для уникальности
    steamIdCounter = 0;
    
    // Ждем немного для завершения операций
    await new Promise(resolve => setTimeout(resolve, 100));
  }
});

// Глобальные моки для Steam API
jest.mock('steam-user', () => {
  return jest.fn().mockImplementation(() => ({
    logOn: jest.fn(),
    logOff: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    steamID: { getSteamID64: () => '76561198037414410' },
    isOnline: false,
  }));
});

jest.mock('steamcommunity', () => {
  return jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    setCookies: jest.fn(),
    getInventoryContents: jest.fn(),
  }));
});

jest.mock('steam-tradeoffer-manager', () => {
  return jest.fn().mockImplementation(() => ({
    setCookies: jest.fn(),
    getOffers: jest.fn(),
    getInventoryContents: jest.fn(),
    on: jest.fn(),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
  }));
});

// Глобальные тестовые данные
let steamIdCounter = 0;

const generateUniqueSteamId = () => {
  steamIdCounter++;
  return `7656119803741441${steamIdCounter.toString().padStart(3, '0')}`;
};

export const testData = {
  users: {
    valid: {
      steamId: generateUniqueSteamId(),
      steamProfile: {
        displayName: 'Test User',
        avatar: 'https://via.placeholder.com/150'
      },
      balance: 100.00
    },
    withItems: {
      steamId: generateUniqueSteamId(),
      steamProfile: {
        displayName: 'User With Items',
        avatar: 'https://via.placeholder.com/150'
      },
      balance: 500.00
    }
  },
  bots: {
    valid: {
      displayName: 'Test Bot',
      steamId: generateUniqueSteamId(),
      steamUsername: 'testbot',
      steamPassword: 'testpass',
      tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=test',
      isActive: true,
      isOnline: false
    }
  },
  items: {
    valid: {
      name: 'AK-47 | Redline',
      marketHashName: 'AK-47 | Redline (Field-Tested)',
      steamId: generateUniqueSteamId(),
      assetId: '123456789',
      classId: '310776272',
      instanceId: '188530139',
      iconUrl: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97m',
      price: 15.50,
      rarity: 'Classified',
      exterior: 'Field-Tested',
      isTradable: true
    }
  },
  trades: {
    buy: {
      type: 'buy' as const,
      items: [
        {
          itemId: '1',
          itemName: 'AK-47 | Redline',
          price: 15.50,
          steamId: generateUniqueSteamId()
        }
      ],
      totalAmount: 15.50
    },
    sell: {
      type: 'sell' as const,
      items: [
        {
          itemId: '2',
          itemName: 'M4A4 | Desolate Space',
          price: 25.00,
          steamId: generateUniqueSteamId()
        }
      ],
      totalAmount: 25.00
    }
  },
  transactions: {
    deposit: {
      type: 'deposit' as const,
      amount: 100.00,
      currency: 'USD'
    },
    withdrawal: {
      type: 'withdrawal' as const,
      amount: 50.00,
      currency: 'USD'
    }
  }
};

// Утилиты для тестов
export const testUtils = {
  // Создание тестового пользователя
  async createTestUser(userData = testData.users.valid) {
    const { User } = require('../src/models/User');
    const uniqueUserData = {
      ...userData,
      steamId: userData.steamId || generateUniqueSteamId()
    };
    const user = new User(uniqueUserData);
    return await user.save();
  },

  // Создание тестового бота
  async createTestBot(botData = testData.bots.valid) {
    const { Bot } = require('../src/models/Bot');
    const bot = new Bot(botData);
    return await bot.save();
  },

  // Создание тестового предмета
  async createTestItem(itemData = testData.items.valid) {
    const { Item } = require('../src/models/Item');
    const item = new Item(itemData);
    return await item.save();
  },

  // Создание тестового трейда
  async createTestTrade(tradeData: any, userId: string) {
    const { Trade } = require('../src/models/Trade');
    const trade = new Trade({
      ...tradeData,
      userId,
      status: 'pending'
    });
    return await trade.save();
  },

  // Создание тестовой транзакции
  async createTestTransaction(transactionData: any, userId: string) {
    const { Transaction } = require('../src/models/Transaction');
    const transaction = new Transaction({
      ...transactionData,
      userId,
      status: 'completed'
    });
    return await transaction.save();
  },

  // Генерация JWT токена для тестов
  generateTestToken(userId: string, user?: any) {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'test-secret';
    const steamId = user?.steamId || '76561198037414410';
    return jwt.sign({ userId, steamId, role: 'user' }, secret, { expiresIn: '1h' });
  }
};
