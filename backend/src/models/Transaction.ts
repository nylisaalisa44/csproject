import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction } from '../types';

export interface ITransactionDocument extends ITransaction, Document {}

const TransactionSchema = new Schema<ITransactionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'purchase', 'sale', 'referral'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'RUB', 'CRYPTO'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  tradeId: {
    type: Schema.Types.ObjectId,
    ref: 'Trade',
    required: false,
    index: true
  },
  metadata: {
    cryptoAddress: String,
    cryptoAmount: Number,
    cryptoType: String,
    itemId: Schema.Types.ObjectId,
    itemName: String,
    steamTradeId: String
  }
}, {
  timestamps: true
});

// Виртуальное поле для форматированной суммы
TransactionSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toFixed(2)} ${this.currency}`;
});

// Виртуальное поле для статуса на русском
TransactionSchema.virtual('statusText').get(function() {
  const statusMap = {
    pending: 'В обработке',
    completed: 'Завершено',
    failed: 'Ошибка',
    cancelled: 'Отменено'
  };
  return statusMap[this.status] || this.status;
});

// Виртуальное поле для типа на русском
TransactionSchema.virtual('typeText').get(function() {
  const typeMap = {
    deposit: 'Пополнение',
    withdrawal: 'Вывод',
    purchase: 'Покупка',
    sale: 'Продажа',
    referral: 'Реферальная программа'
  };
  return typeMap[this.type] || this.type;
});

// Методы
TransactionSchema.methods.complete = async function() {
  this.status = 'completed';
  return await this.save();
};

TransactionSchema.methods.fail = async function() {
  this.status = 'failed';
  return await this.save();
};

TransactionSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  return await this.save();
};

// Статические методы
TransactionSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

TransactionSchema.statics.findByType = function(type: string) {
  return this.find({ type }).sort({ createdAt: -1 });
};

TransactionSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

TransactionSchema.statics.findByTrade = function(tradeId: string) {
  return this.find({ tradeId }).populate('tradeId').sort({ createdAt: -1 });
};

TransactionSchema.statics.getUserBalance = async function(userId: string) {
  const transactions = await this.find({ 
    userId, 
    status: 'completed',
    type: { $in: ['deposit', 'withdrawal', 'referral'] }
  });
  
  return transactions.reduce((balance: number, transaction: any) => {
    if (transaction.type === 'deposit' || transaction.type === 'referral') {
      return balance + transaction.amount;
    } else {
      return balance - transaction.amount;
    }
  }, 0);
};

// Индексы
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
