import mongoose, { Schema, Document } from 'mongoose';
import { IItem } from '../types';

import { IItemDocument, IItemModel } from '../types';

const ItemSchema = new Schema<IItemDocument>({
  steamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  marketName: {
    type: String,
    required: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  rarity: {
    type: String,
    required: true,
    index: true
  },
  exterior: {
    type: String,
    required: false,
    index: true
  },
  image: {
    type: String,
    required: true
  },
  game: {
    type: String,
    enum: ['cs2', 'dota2', 'rust', 'other'],
    default: 'cs2',
    index: true
  },
  
  // Цены
  steamPrice: {
    type: Number,
    required: true,
    min: 0
  },
  ourPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'RUB'],
    default: 'USD'
  },
  
  // Статус
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  isTradeable: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Метаданные
  tags: [{
    type: String,
    index: true
  }],
  category: {
    type: String,
    required: true,
    index: true
  },
  itemCollection: {
    type: String,
    required: false,
    index: true
  },
  
  // Статистика
  tradeCount: {
    type: Number,
    default: 0
  },
  lastTradeDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Виртуальные поля
ItemSchema.virtual('priceDifference').get(function() {
  return this.ourPrice - this.steamPrice;
});

ItemSchema.virtual('priceDifferencePercent').get(function() {
  if (this.steamPrice === 0) return 0;
  return ((this.ourPrice - this.steamPrice) / this.steamPrice) * 100;
});

// Методы экземпляра
ItemSchema.methods.updatePrice = async function(newPrice: number): Promise<void> {
  this.ourPrice = newPrice;
  await this.save();
};

ItemSchema.methods.updateQuantity = async function(change: number): Promise<void> {
  this.quantity += change;
  if (this.quantity < 0) this.quantity = 0;
  await this.save();
};

ItemSchema.methods.markAsTraded = async function(): Promise<void> {
  this.tradeCount += 1;
  this.lastTradeDate = new Date();
  await this.save();
};

// Статические методы
ItemSchema.statics.findBySteamId = function(steamId: string) {
  return this.findOne({ steamId });
};

ItemSchema.statics.findByMarketName = function(marketName: string) {
  return this.findOne({ marketName });
};

ItemSchema.statics.findAvailableItems = function(filters: any = {}) {
  const query = { isAvailable: true, quantity: { $gt: 0 }, ...filters };
  return this.find(query).sort({ ourPrice: 1 });
};

ItemSchema.statics.updatePricesFromSteam = async function() {
  // TODO: Реализовать обновление цен через Steam Market API
  console.log('Updating prices from Steam Market...');
};

// Индексы для быстрого поиска
ItemSchema.index({ marketName: 1, game: 1 });
ItemSchema.index({ type: 1, rarity: 1 });
ItemSchema.index({ isAvailable: 1, quantity: 1 });
ItemSchema.index({ ourPrice: 1 });

export const Item = mongoose.model<IItemDocument, IItemModel>('Item', ItemSchema);
