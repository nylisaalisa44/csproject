import mongoose, { Schema } from 'mongoose';
import { ITrade, ITradeDocument } from '../types';

const TradeSchema = new Schema<ITradeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
    index: true
  },
  items: [{
    itemId: {
      type: String,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    steamId: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  steamTradeId: {
    type: String,
    sparse: true,
    index: true
  },
  botId: {
    type: Schema.Types.ObjectId,
    ref: 'Bot',
    index: true
  }
}, {
  timestamps: true
});

// Виртуальное поле для количества предметов
TradeSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Виртуальное поле для статуса на русском
TradeSchema.virtual('statusText').get(function() {
  const statusMap = {
    pending: 'Ожидает обработки',
    processing: 'В обработке',
    completed: 'Завершено',
    failed: 'Ошибка',
    cancelled: 'Отменено'
  };
  return statusMap[this.status] || this.status;
});

// Виртуальное поле для типа на русском
TradeSchema.virtual('typeText').get(function() {
  return this.type === 'buy' ? 'Покупка' : 'Продажа';
});

// Виртуальное поле для форматированной суммы
TradeSchema.virtual('formattedAmount').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Методы
TradeSchema.methods.process = async function() {
  this.status = 'processing';
  return await this.save();
};

TradeSchema.methods.complete = async function(steamTradeId?: string) {
  this.status = 'completed';
  if (steamTradeId) {
    this.steamTradeId = steamTradeId;
  }
  return await this.save();
};

TradeSchema.methods.fail = async function() {
  this.status = 'failed';
  return await this.save();
};

TradeSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  return await this.save();
};

TradeSchema.methods.assignBot = async function(botId: string) {
  this.botId = botId;
  return await this.save();
};

// Статические методы
TradeSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).populate('userId').sort({ createdAt: -1 });
};

TradeSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).populate('userId').sort({ createdAt: -1 });
};

TradeSchema.statics.findByType = function(type: string) {
  return this.find({ type }).populate('userId').sort({ createdAt: -1 });
};

TradeSchema.statics.findPendingTrades = function() {
  return this.find({ 
    status: { $in: ['pending', 'processing'] } 
  }).populate('userId').sort({ createdAt: 1 });
};

TradeSchema.statics.getUserTradeHistory = function(userId: string, limit = 50) {
  return this.find({ userId })
    .populate('userId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Индексы
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ status: 1, createdAt: -1 });
TradeSchema.index({ type: 1, createdAt: -1 });
TradeSchema.index({ botId: 1, createdAt: -1 });

export const Trade = mongoose.model<ITradeDocument>('Trade', TradeSchema);
