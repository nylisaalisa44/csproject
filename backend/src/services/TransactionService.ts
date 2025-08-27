import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

export class TransactionService {
  /**
   * Создание транзакции пополнения
   */
  static async createDeposit(
    userId: string,
    amount: number,
    currency: string = 'USD',
    metadata?: { cryptoAddress?: string; cryptoType?: string }
  ) {
    // Валидация
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!['USD', 'EUR', 'RUB', 'CRYPTO'].includes(currency)) {
      throw new Error('Invalid currency');
    }

    // Создаем транзакцию
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      description: `Deposit ${amount} ${currency}`,
      metadata: {
        cryptoAddress: metadata?.cryptoAddress,
        cryptoType: metadata?.cryptoType
      }
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Создание транзакции вывода
   */
  static async createWithdrawal(
    userId: string,
    amount: number,
    currency: string = 'USD',
    metadata?: { cryptoAddress?: string; cryptoType?: string }
  ) {
    // Проверяем баланс пользователя
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Используем метод из модели User для проверки баланса
    user.validateBalanceForPurchase(amount);

    // Создаем транзакцию
    const transaction = new Transaction({
      userId,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending',
      description: `Withdrawal ${amount} ${currency}`,
      metadata: {
        cryptoAddress: metadata?.cryptoAddress,
        cryptoType: metadata?.cryptoType
      }
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Создание транзакции покупки/продажи
   */
  static async createTradeTransaction(
    userId: string,
    type: 'purchase' | 'sale',
    amount: number,
    tradeId: string,
    metadata?: {
      itemId?: string;
      itemName?: string;
      steamTradeId?: string;
    }
  ) {
    const transaction = new Transaction({
      userId,
      type,
      amount,
      currency: 'USD',
      status: 'completed',
      description: `${type === 'purchase' ? 'Purchase' : 'Sale'} of items`,
      tradeId,
      metadata
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Создание реферальной транзакции
   */
  static async createReferralTransaction(
    userId: string,
    amount: number,
    referrerId: string
  ) {
    const transaction = new Transaction({
      userId,
      type: 'referral',
      amount,
      currency: 'USD',
      status: 'completed',
      description: `Referral bonus from user ${referrerId}`,
      metadata: {
        referrerId
      }
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Получение истории транзакций пользователя
   */
  static async getUserTransactions(
    userId: string,
    filters: { type?: string; status?: string } = {},
    pagination: { limit: number; page: number } = { limit: 50, page: 1 }
  ) {
    // Строим фильтр
    const filter: any = { userId };
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;

    // Пагинация
    const skip = (pagination.page - 1) * pagination.limit;
    
    const transactions = await Transaction.find(filter)
      .populate('tradeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit);

    const total = await Transaction.countDocuments(filter);

    return { transactions, total };
  }

  /**
   * Получение транзакций по трейду
   */
  static async getTransactionsByTrade(tradeId: string) {
    const transactions = await Transaction.find({ tradeId })
      .populate('tradeId')
      .sort({ createdAt: -1 });
    
    return transactions;
  }

  /**
   * Получение баланса пользователя
   */
  static async getUserBalance(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) {
      return 0;
    }

    // Возвращаем текущий баланс пользователя, который уже обновляется при завершении транзакций
    return user.balance;
  }

  /**
   * Завершение транзакции
   */
  static async completeTransaction(transactionId: string) {
    const transaction = await Transaction.findById(transactionId).populate('userId');
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'completed') {
      return transaction; // Уже завершена
    }

    transaction.status = 'completed';
    await transaction.save();

    // Обновляем баланс пользователя
    const user = transaction.userId as any;
    if (user) {
      if (transaction.type === 'deposit' || transaction.type === 'referral') {
        await user.updateBalance(transaction.amount);
      } else if (transaction.type === 'withdrawal') {
        await user.updateBalance(-transaction.amount);
      }
    }

    return transaction;
  }

  /**
   * Отмена транзакции
   */
  static async cancelTransaction(transactionId: string) {
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = 'cancelled';
    return await transaction.save();
  }

  /**
   * Обновление баланса пользователя на основе транзакций
   */
  static async updateUserBalanceFromTransactions(userId: string): Promise<number> {
    const balance = await this.getUserBalance(userId);
    
    const user = await User.findById(userId);
    if (user) {
      user.balance = balance;
      await user.save();
    }

    return balance;
  }
}
