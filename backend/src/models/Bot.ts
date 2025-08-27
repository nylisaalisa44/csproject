import mongoose, { Schema, Document } from 'mongoose';
import { IBot, IBotDocument, IBotModel } from '../types';

const BotSchema = new Schema<IBotDocument>({
  steamId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  tradeUrl: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Steam API credentials для бота
  steamApiKey: {
    type: String,
    required: false // Больше не обязательное
  },
  // Steam login credentials для node-steam-tradeoffer-manager
  steamUsername: {
    type: String,
    required: true
  },
  steamPassword: {
    type: String,
    required: true
  },
  steamGuardCode: {
    type: String,
    required: false
  },
  steamSessionId: {
    type: String
  },
  steamLoginSecure: {
    type: String
  },
  // Отслеживание ошибок логина
  lastLoginError: {
    type: String
  },
  lastLoginErrorTime: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  isThrottled: {
    type: Boolean,
    default: false
  },
  throttleUntil: {
    type: Date
  },
  // Настройки синхронизации
  syncInterval: {
    type: Number,
    default: 300000, // 5 минут
    min: 60000 // минимум 1 минута
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'error'],
    default: 'idle'
  },
  // Инвентарь бота
  inventory: {
    type: [{
      itemId: {
        type: String,
        required: true
      },
      itemName: {
        type: String,
        required: true
      },
      steamId: {
        type: String,
        required: true
      },
      assetId: {
        type: String,
        required: true
      },
      classId: {
        type: String,
        required: true
      },
      instanceId: {
        type: String,
        default: '0'
      },
      marketHashName: {
        type: String,
        required: true
      },
      iconUrl: {
        type: String
      },
      rarity: {
        type: String
      },
      exterior: {
        type: String
      },
      acquiredAt: {
        type: Date,
        default: Date.now
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  // Активные трейды бота
  activeTrades: {
    type: [{
      tradeId: {
        type: Schema.Types.ObjectId,
        ref: 'Trade'
      },
      steamTradeId: {
        type: String
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      expiresAt: {
        type: Date
      }
    }],
    default: []
  },
  // Статистика бота
  stats: {
    totalTrades: {
      type: Number,
      default: 0
    },
    successfulTrades: {
      type: Number,
      default: 0
    },
    failedTrades: {
      type: Number,
      default: 0
    },
    totalItemsReceived: {
      type: Number,
      default: 0
    },
    totalItemsSent: {
      type: Number,
      default: 0
    },
    lastTradeDate: {
      type: Date
    }
  },
  // Настройки безопасности
  security: {
    maxTradeValue: {
      type: Number,
      default: 1000 // максимальная стоимость трейда в USD
    },
    requireConfirmation: {
      type: Boolean,
      default: true
    },
    allowedUsers: {
      type: [String], // Steam IDs разрешенных пользователей
      default: []
    },
    blockedUsers: {
      type: [String], // Steam IDs заблокированных пользователей
      default: []
    }
  }
}, {
  timestamps: true
});

// Виртуальное поле для количества предметов в инвентаре
BotSchema.virtual('inventoryCount').get(function() {
  return this.inventory.length;
});

// Виртуальное поле для статуса активности
BotSchema.virtual('statusText').get(function() {
  if (!this.isActive) return 'Неактивен';
  if (!this.isOnline) return 'Оффлайн';
  return 'Онлайн';
});

// Виртуальное поле для активных трейдов
BotSchema.virtual('activeTradesCount').get(function() {
  return this.activeTrades.filter(trade => 
    ['pending', 'accepted'].includes(trade.status)
  ).length;
});

// Методы
BotSchema.methods.goOnline = async function() {
  this.isOnline = true;
  this.lastActivity = new Date();
  return await this.save();
};

BotSchema.methods.goOffline = async function() {
  this.isOnline = false;
  this.lastActivity = new Date();
  return await this.save();
};

BotSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  return await this.save();
};

BotSchema.methods.addItem = async function(item: {
  itemId: string;
  itemName: string;
  steamId: string;
  assetId: string;
  classId: string;
  instanceId?: string;
  marketHashName: string;
  iconUrl?: string;
  rarity?: string;
  exterior?: string;
}) {
  console.log(`🔧 Bot.addItem called for: ${item.itemName} (assetId: ${item.assetId})`);
  console.log(`🔧 Current inventory size: ${this.inventory.length}`);
  
  // Проверяем, есть ли уже такой предмет
  const existingItem = this.inventory.find((invItem: any) => 
    invItem.assetId === item.assetId
  );

  if (existingItem) {
    // Обновляем существующий предмет
    console.log(`🔄 Updating existing item: ${item.itemName} (assetId: ${item.assetId})`);
    existingItem.lastUpdated = new Date();
    Object.assign(existingItem, item);
  } else {
    // Добавляем новый предмет
    console.log(`➕ Adding new item: ${item.itemName} (assetId: ${item.assetId})`);
    this.inventory.push({
      ...item,
      instanceId: item.instanceId || '0',
      acquiredAt: new Date(),
      lastUpdated: new Date()
    });
  }
  
  console.log(`💾 Saving bot with ${this.inventory.length} items in inventory`);
  const result = await this.save();
  console.log(`✅ Bot saved successfully. New inventory size: ${result.inventory.length}`);
  return result;
};

BotSchema.methods.removeItem = async function(assetId: string) {
  this.inventory = this.inventory.filter((item: any) => item.assetId !== assetId);
  return await this.save();
};

BotSchema.methods.clearInventory = async function() {
  this.inventory = [];
  return await this.save();
};

BotSchema.methods.addTrade = async function(tradeData: {
  tradeId: string;
  steamTradeId?: string;
  expiresAt?: Date;
}) {
  this.activeTrades.push({
    tradeId: tradeData.tradeId,
    steamTradeId: tradeData.steamTradeId,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: tradeData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
  });
  
  this.stats.totalTrades += 1;
  this.stats.lastTradeDate = new Date();
  
  return await this.save();
};

BotSchema.methods.updateTradeStatus = async function(tradeId: string, status: string) {
  const trade = this.activeTrades.find((t: any) => t.tradeId.toString() === tradeId);
  if (trade) {
    trade.status = status;
    if (status === 'accepted') {
      this.stats.successfulTrades += 1;
    } else if (status === 'declined' || status === 'expired' || status === 'cancelled') {
      this.stats.failedTrades += 1;
    }
  }
  return await this.save();
};

BotSchema.methods.removeExpiredTrades = async function() {
  const now = new Date();
  this.activeTrades = this.activeTrades.filter((trade: any) => {
    if (trade.expiresAt && trade.expiresAt < now && trade.status === 'pending') {
      trade.status = 'expired';
      this.stats.failedTrades += 1;
      return false;
    }
    return true;
  });
  return await this.save();
};

// Статические методы
BotSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ lastActivity: -1 });
};

BotSchema.statics.findOnline = function() {
  return this.find({ isActive: true, isOnline: true }).sort({ lastActivity: -1 });
};

BotSchema.statics.findAvailable = function() {
  return this.find({ 
    isActive: true, 
    isOnline: true,
    'inventory.0': { $exists: true } // Есть предметы в инвентаре
  }).sort({ lastActivity: -1 });
};

BotSchema.statics.findBySteamId = function(steamId: string) {
  return this.findOne({ steamId });
};

BotSchema.statics.findByTradeUrl = function(tradeUrl: string) {
  return this.findOne({ tradeUrl });
};

BotSchema.statics.findReadyForSync = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    isActive: true,
    $or: [
      { lastSync: { $lt: fiveMinutesAgo } },
      { lastSync: { $exists: false } }
    ]
  });
};

// Индексы
BotSchema.index({ isActive: 1, isOnline: 1 });
BotSchema.index({ lastActivity: -1 });
BotSchema.index({ 'inventory.assetId': 1 });
BotSchema.index({ 'inventory.steamId': 1 });
BotSchema.index({ lastSync: 1 });
BotSchema.index({ 'activeTrades.tradeId': 1 });
BotSchema.index({ 'activeTrades.steamTradeId': 1 });

export const Bot = mongoose.model<IBotDocument, IBotModel>('Bot', BotSchema);
