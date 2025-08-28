import mongoose, { Document } from 'mongoose';

// User Types
export interface IUser {
  steamId: string;
  steamProfile: {
    displayName: string;
    avatar: string;
  };
  email?: string;
  tradeUrl?: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  isVerified: boolean;
  isBanned: boolean;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface ITransaction {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'referral';
  amount: number;
  currency: 'USD' | 'EUR' | 'RUB' | 'CRYPTO';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  tradeId?: mongoose.Types.ObjectId; // Ссылка на трейд для purchase/sale транзакций
  metadata?: {
    cryptoAddress?: string;
    cryptoAmount?: number;
    cryptoType?: string;
    itemId?: mongoose.Types.ObjectId;
    itemName?: string;
    steamTradeId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Item Types
export interface IItem {
  steamId: string; // Steam ID предмета
  marketName: string; // Название на маркете
  displayName: string; // Отображаемое название
  type: string; // Тип предмета (weapon, knife, glove, etc.)
  rarity: string; // Редкость (Consumer Grade, Industrial Grade, etc.)
  exterior?: string; // Состояние (Factory New, Minimal Wear, etc.)
  image: string; // URL изображения
  game: 'cs2' | 'dota2' | 'rust' | 'other';
  
  // Цены
  steamPrice: number; // Цена на Steam Market
  ourPrice: number; // Наша цена (может отличаться от Steam)
  currency: 'USD' | 'EUR' | 'RUB';
  
  // Статус
  isAvailable: boolean; // Доступен ли для покупки
  isTradeable: boolean; // Можно ли обменивать
  quantity: number; // Количество в наличии
  
  // Метаданные
  tags: string[]; // Теги для поиска
  category: string; // Категория
  itemCollection?: string; // Коллекция
  
  // Статистика
  tradeCount: number; // Количество сделок
  lastTradeDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Trade Types
export interface ITrade {
  userId: mongoose.Types.ObjectId;
  type: 'buy' | 'sell';
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    steamId: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  steamTradeId?: string;
  botId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}



// Document Types (для Mongoose)
export interface IUserDocument extends IUser, Document {
  _id: string;
  updateBalance(amount: number): Promise<void>;
  addReferralEarnings(amount: number): Promise<void>;
  checkBalance(requiredAmount: number): { 
    hasEnough: boolean; 
    currentBalance: number; 
    requiredAmount: number; 
    shortfall: number; 
  };
  validateBalanceForPurchase(requiredAmount: number): void;
  safeDeductBalance(amount: number): Promise<void>;
}

export interface IItemDocument extends IItem, Document {
  updatePrice(newPrice: number): Promise<void>;
  updateQuantity(change: number): Promise<void>;
  markAsTraded(): Promise<void>;
}

export interface ITradeDocument extends ITrade, Document {
  _id: mongoose.Types.ObjectId;
}

export interface ITransactionDocument extends ITransaction, Document {}

export interface IBotDocument extends IBot, Document {
  // Виртуальные поля
  inventoryCount: number;
  statusText: string;
  activeTradesCount: number;
  
  // Методы
  goOnline(): Promise<IBotDocument>;
  goOffline(): Promise<IBotDocument>;
  updateActivity(): Promise<IBotDocument>;
  addItem(item: {
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
  }): Promise<IBotDocument>;
  removeItem(assetId: string): Promise<IBotDocument>;
  clearInventory(): Promise<IBotDocument>;
  addTrade(tradeData: {
    tradeId: string;
    steamTradeId?: string;
    expiresAt?: Date;
  }): Promise<IBotDocument>;
  updateTradeStatus(tradeId: string, status: string): Promise<IBotDocument>;
  removeExpiredTrades(): Promise<IBotDocument>;
}

// Model Types (для Mongoose)
export interface IUserModel extends mongoose.Model<IUserDocument> {
  findBySteamId(steamId: string): Promise<IUserDocument | null>;
  findByReferralCode(code: string): Promise<IUserDocument | null>;
}

export interface IItemModel extends mongoose.Model<IItemDocument> {
  findBySteamId(steamId: string): Promise<IItemDocument | null>;
  findByMarketName(marketName: string): Promise<IItemDocument | null>;
  findAvailableItems(filters?: any): Promise<IItemDocument[]>;
  updatePricesFromSteam(): Promise<void>;
}

export interface IBotModel extends mongoose.Model<IBotDocument> {
  findActive(): Promise<IBotDocument[]>;
  findOnline(): Promise<IBotDocument[]>;
  findAvailable(): Promise<IBotDocument[]>;
  findBySteamId(steamId: string): Promise<IBotDocument | null>;
  findByTradeUrl(tradeUrl: string): Promise<IBotDocument | null>;
  findReadyForSync(): Promise<IBotDocument[]>;
}

// Bot Types
export interface IBot {
  displayName: string;
  steamId: string;
  steamUsername: string; // Добавляем поле для логина
  steamPassword: string; // Добавляем поле для пароля
  steamGuardCode?: string; // Код Steam Guard
  steamApiKey?: string;
  steamSessionId?: string;
  steamLoginSecure?: string;
  // Отслеживание ошибок логина
  lastLoginError?: string;
  lastLoginErrorTime?: Date;
  loginAttempts: number;
  isThrottled: boolean;
  throttleUntil?: Date;
  avatar?: string;
  tradeUrl: string;
  isActive: boolean;
  isOnline: boolean;
  lastActivity?: Date;
  lastLogin?: Date;
  syncInterval: number;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  inventory: Array<{
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
  }>;
  activeTrades: Array<{
    tradeId: string;
    steamTradeId?: string;
    status: string;
    expiresAt: Date;
  }>;
  stats: {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    totalValue: number;
  };
  security: {
    maxTradeValue: number;
    requireConfirmation: boolean;
    allowedUsers: string[];
    blockedUsers: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}
