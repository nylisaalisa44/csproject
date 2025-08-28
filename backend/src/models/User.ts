import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

import { IUserDocument, IUserModel } from '../types';

const UserSchema = new Schema<IUserDocument>({
  steamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  steamProfile: {
    displayName: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  tradeUrl: {
    type: String,
    required: false
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  referralCode: {
    type: String,
    required: false,
    unique: true,
    index: true,
    default: function() {
      return generateReferralCode();
    }
  },
  referredBy: {
    type: String,
    required: false,
    ref: 'User'
  },
  referralEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Виртуальные поля
UserSchema.virtual('totalEarnings').get(function() {
  return this.balance + this.referralEarnings;
});

// Методы экземпляра
UserSchema.methods.updateBalance = async function(amount: number): Promise<void> {
  this.balance += amount;
  if (this.balance < 0) {
    this.balance = 0;
  }
  await this.save();
};

UserSchema.methods.addReferralEarnings = async function(amount: number): Promise<void> {
  this.referralEarnings += amount;
  await this.save();
};

UserSchema.methods.checkBalance = function(requiredAmount: number): { 
  hasEnough: boolean; 
  currentBalance: number; 
  requiredAmount: number; 
  shortfall: number; 
} {
  const hasEnough = this.balance >= requiredAmount;
  const shortfall = hasEnough ? 0 : requiredAmount - this.balance;
  
  return {
    hasEnough,
    currentBalance: this.balance,
    requiredAmount,
    shortfall
  };
};

/**
 * Проверяет, достаточно ли баланса для покупки
 * @param requiredAmount - требуемая сумма
 * @throws Error с деталями, если баланса недостаточно
 */
UserSchema.methods.validateBalanceForPurchase = function(requiredAmount: number): void {
  const balanceCheck = this.checkBalance(requiredAmount);
  
  if (!balanceCheck.hasEnough) {
    const error = new Error('Insufficient balance');
    (error as any).details = {
      currentBalance: balanceCheck.currentBalance,
      requiredAmount: balanceCheck.requiredAmount,
      shortfall: balanceCheck.shortfall
    };
    throw error;
  }
};

/**
 * Безопасно списывает средства с проверкой баланса
 * @param amount - сумма для списания
 * @throws Error если баланса недостаточно
 */
UserSchema.methods.safeDeductBalance = async function(amount: number): Promise<void> {
  this.validateBalanceForPurchase(amount);
  await this.updateBalance(-amount);
};

// Статические методы
UserSchema.statics.findBySteamId = function(steamId: string) {
  return this.findOne({ steamId });
};

UserSchema.statics.findByReferralCode = function(code: string) {
  return this.findOne({ referralCode: code });
};



// Функция генерации referral кода
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
