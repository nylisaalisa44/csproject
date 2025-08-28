const mongoose = require('mongoose');
require('dotenv').config();

// Подключаемся к базе данных
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cs2trading');

// Схема бота
const botSchema = new mongoose.Schema({
  steamId: String,
  displayName: String,
  avatar: String,
  tradeUrl: String,
  isActive: Boolean,
  isOnline: Boolean,
  lastActivity: Date,
  steamApiKey: String,
  steamSessionId: String,
  steamLoginSecure: String,
  syncInterval: Number,
  lastSync: Date,
  syncStatus: String,
  inventory: [{
    itemId: String,
    itemName: String,
    steamId: String,
    assetId: String,
    classId: String,
    instanceId: String,
    marketHashName: String,
    iconUrl: String,
    rarity: String,
    exterior: String,
    acquiredAt: Date,
    lastUpdated: Date
  }],
  activeTrades: [{
    tradeId: mongoose.Schema.Types.ObjectId,
    steamTradeId: String,
    status: String,
    createdAt: Date,
    expiresAt: Date
  }],
  stats: {
    totalTrades: Number,
    successfulTrades: Number,
    failedTrades: Number,
    totalItemsReceived: Number,
    totalItemsSent: Number,
    lastTradeDate: Date
  },
  security: {
    maxTradeValue: Number,
    requireConfirmation: Boolean,
    allowedUsers: [String],
    blockedUsers: [String]
  }
}, {
  timestamps: true
});

const Bot = mongoose.model('Bot', botSchema);

// Тестовые боты
const testBots = [
  {
    steamId: '76561198037414410',
    displayName: 'CS2 Trading Bot #1',
    avatar: 'https://via.placeholder.com/150',
    tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=test_token_1',
    isActive: true,
    isOnline: true,
    lastActivity: new Date(),
    steamApiKey: 'test_api_key_1',
    steamSessionId: 'test_session_1',
    steamLoginSecure: 'test_login_secure_1',
    syncInterval: 300000, // 5 минут
    lastSync: new Date(),
    syncStatus: 'idle',
    inventory: [
      {
        itemId: 'test_ak47_redline',
        itemName: 'AK-47 | Redline',
        steamId: 'test_ak47_redline',
        assetId: 'asset_ak47_redline_1',
        classId: 'class_ak47_redline',
        instanceId: '0',
        marketHashName: 'AK-47 | Redline (Field-Tested)',
        iconUrl: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
        rarity: 'Classified',
        exterior: 'Field-Tested',
        acquiredAt: new Date(),
        lastUpdated: new Date()
      },
      {
        itemId: 'test_m4a4_desolate',
        itemName: 'M4A4 | Desolate Space',
        steamId: 'test_m4a4_desolate',
        assetId: 'asset_m4a4_desolate_1',
        classId: 'class_m4a4_desolate',
        instanceId: '0',
        marketHashName: 'M4A4 | Desolate Space (Minimal Wear)',
        iconUrl: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
        rarity: 'Covert',
        exterior: 'Minimal Wear',
        acquiredAt: new Date(),
        lastUpdated: new Date()
      }
    ],
    activeTrades: [],
    stats: {
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalItemsReceived: 0,
      totalItemsSent: 0
    },
    security: {
      maxTradeValue: 1000,
      requireConfirmation: true,
      allowedUsers: [],
      blockedUsers: []
    }
  },
  {
    steamId: '76561198037414411',
    displayName: 'CS2 Trading Bot #2',
    avatar: 'https://via.placeholder.com/150',
    tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=123456790&token=test_token_2',
    isActive: true,
    isOnline: true,
    lastActivity: new Date(),
    steamApiKey: 'test_api_key_2',
    steamSessionId: 'test_session_2',
    steamLoginSecure: 'test_login_secure_2',
    syncInterval: 300000, // 5 минут
    lastSync: new Date(),
    syncStatus: 'idle',
    inventory: [
      {
        itemId: 'test_awp_dragon_lore',
        itemName: 'AWP | Dragon Lore',
        steamId: 'test_awp_dragon_lore',
        assetId: 'asset_awp_dragon_lore_1',
        classId: 'class_awp_dragon_lore',
        instanceId: '0',
        marketHashName: 'AWP | Dragon Lore (Factory New)',
        iconUrl: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
        rarity: 'Contraband',
        exterior: 'Factory New',
        acquiredAt: new Date(),
        lastUpdated: new Date()
      },
      {
        itemId: 'test_glock_fade',
        itemName: 'Glock-18 | Fade',
        steamId: 'test_glock_fade',
        assetId: 'asset_glock_fade_1',
        classId: 'class_glock_fade',
        instanceId: '0',
        marketHashName: 'Glock-18 | Fade (Factory New)',
        iconUrl: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
        rarity: 'Covert',
        exterior: 'Factory New',
        acquiredAt: new Date(),
        lastUpdated: new Date()
      }
    ],
    activeTrades: [],
    stats: {
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalItemsReceived: 0,
      totalItemsSent: 0
    },
    security: {
      maxTradeValue: 1000,
      requireConfirmation: true,
      allowedUsers: [],
      blockedUsers: []
    }
  }
];

async function addTestBots() {
  try {
    console.log('🔄 Adding test bots to database...');
    
    // Очищаем существующие тестовые боты
    await Bot.deleteMany({ steamId: { $in: testBots.map(bot => bot.steamId) } });
    console.log('🗑️ Cleared existing test bots');
    
    // Добавляем новых тестовых ботов
    const result = await Bot.insertMany(testBots);
    console.log(`✅ Added ${result.length} test bots to database`);
    
    // Показываем добавленных ботов
    result.forEach(bot => {
      console.log(`🤖 ${bot.displayName} (${bot.steamId}) - ${bot.inventory.length} items`);
    });
    
    console.log('🎉 Test bots added successfully!');
    console.log('💡 Now you can test the bot synchronization system');
    console.log('📊 Use the following endpoints to test:');
    console.log('   - GET /api/bots - List all bots');
    console.log('   - GET /api/bots/stats - Get bot statistics');
    console.log('   - GET /api/bots/health - Get bot health status');
    console.log('   - POST /api/bots/sync/all - Sync all bot inventories');
    console.log('   - POST /api/bots/sync-service - Manage sync service');
    
  } catch (error) {
    console.error('❌ Error adding test bots:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Запускаем скрипт
addTestBots();
