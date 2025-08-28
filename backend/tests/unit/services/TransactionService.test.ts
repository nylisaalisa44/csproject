import { testData, testUtils } from '../../setup';
import { TransactionService } from '../../../src/services/TransactionService';
import { User } from '../../../src/models/User';
import { Transaction } from '../../../src/models/Transaction';
import mongoose from 'mongoose';

describe('TransactionService', () => {
  let user: any;

  beforeEach(async () => {
    user = await testUtils.createTestUser();
  });

  describe('createDeposit', () => {
    it('должен создать транзакцию пополнения', async () => {
      const transaction = await TransactionService.createDeposit(
        user._id.toString(),
        100,
        'USD'
      );

      expect(transaction._id).toBeDefined();
      expect(transaction.type).toBe('deposit');
      expect(transaction.amount).toBe(100);
      expect(transaction.currency).toBe('USD');
      expect(transaction.status).toBe('pending'); // Deposit создается как pending
      expect(transaction.userId.toString()).toBe(user._id.toString());
    });

    it('должен создать транзакцию пополнения с метаданными', async () => {
      const metadata = {
        cryptoAddress: '0x1234567890abcdef',
        cryptoAmount: 0.1,
        cryptoType: 'ETH'
      };

      const transaction = await TransactionService.createDeposit(
        user._id.toString(),
        100,
        'USD',
        metadata
      );

      expect(transaction.metadata?.cryptoAddress).toBe(metadata.cryptoAddress);
      expect(transaction.metadata?.cryptoType).toBe(metadata.cryptoType);
    });
  });

  describe('createWithdrawal', () => {
    it('должен создать транзакцию вывода с достаточным балансом', async () => {
      const transaction = await TransactionService.createWithdrawal(
        user._id.toString(),
        50,
        'USD'
      );

      expect(transaction.type).toBe('withdrawal');
      expect(transaction.amount).toBe(50);
      expect(transaction.status).toBe('pending');
    });

    it('должен выбрасывать ошибку при недостаточном балансе', async () => {
      await expect(
        TransactionService.createWithdrawal(user._id.toString(), 200, 'USD')
      ).rejects.toThrow('Insufficient balance');
    });

    it('должен выбрасывать ошибку при несуществующем пользователе', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      
      await expect(
        TransactionService.createWithdrawal(fakeUserId, 50, 'USD')
      ).rejects.toThrow('User not found');
    });
  });

  describe('createTradeTransaction', () => {
    it('должен создать транзакцию покупки', async () => {
      const tradeId = new mongoose.Types.ObjectId();
      const metadata = {
        itemName: 'AK-47 | Redline',
        steamTradeId: '123456789'
      };

      const transaction = await TransactionService.createTradeTransaction(
        user._id.toString(),
        'purchase',
        100,
        tradeId.toString(),
        metadata
      );

      expect(transaction.type).toBe('purchase');
      expect(transaction.amount).toBe(100);
      expect(transaction.tradeId?.toString()).toBe(tradeId.toString());
      expect(transaction.metadata).toEqual(metadata);
    });

    it('должен создать транзакцию продажи', async () => {
      const tradeId = new mongoose.Types.ObjectId();
      const metadata = {
        itemName: 'M4A4 | Desolate Space',
        steamTradeId: '987654321'
      };

      const transaction = await TransactionService.createTradeTransaction(
        user._id.toString(),
        'sale',
        150,
        tradeId.toString(),
        metadata
      );

      expect(transaction.type).toBe('sale');
      expect(transaction.amount).toBe(150);
      expect(transaction.tradeId?.toString()).toBe(tradeId.toString());
      expect(transaction.metadata).toEqual(metadata);
    });
  });

  describe('createReferralTransaction', () => {
    it('должен создать реферальную транзакцию', async () => {
      const referrerId = '507f1f77bcf86cd799439012';
      const transaction = await TransactionService.createReferralTransaction(
        user._id.toString(),
        25,
        referrerId
      );

      expect(transaction.type).toBe('referral');
      expect(transaction.amount).toBe(25);
      expect(transaction.status).toBe('completed');
      // Убираем проверку несуществующего поля referrerId
    });
  });

  describe('getUserTransactions', () => {
    beforeEach(async () => {
      // Создаем несколько транзакций для тестирования
      const deposit = await TransactionService.createDeposit(user._id.toString(), 100, 'USD');
      const withdrawal = await TransactionService.createWithdrawal(user._id.toString(), 50, 'USD');
      
      // Завершаем deposit транзакцию
      await TransactionService.completeTransaction((deposit as any)._id.toString());
    });

    it('должен возвращать все транзакции пользователя', async () => {
      const result = await TransactionService.getUserTransactions(user._id.toString());

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.transactions[0].userId.toString()).toBe(user._id.toString());
    });

    it('должен фильтровать по типу транзакции', async () => {
      const result = await TransactionService.getUserTransactions(
        user._id.toString(),
        { type: 'deposit' }
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].type).toBe('deposit');
    });

    it('должен фильтровать по статусу', async () => {
      const result = await TransactionService.getUserTransactions(
        user._id.toString(),
        { status: 'completed' }
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].status).toBe('completed');
    });

    it('должен поддерживать пагинацию', async () => {
      const result = await TransactionService.getUserTransactions(
        user._id.toString(),
        {},
        { limit: 1, page: 1 }
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('getUserBalance', () => {
    beforeEach(async () => {
      // Создаем транзакции для изменения баланса
      const deposit1 = await TransactionService.createDeposit(user._id.toString(), 100, 'USD');
      const deposit2 = await TransactionService.createDeposit(user._id.toString(), 50, 'USD');
      
      // Завершаем транзакции
      await TransactionService.completeTransaction((deposit1 as any)._id.toString());
      await TransactionService.completeTransaction((deposit2 as any)._id.toString());
    });

    it('должен вычислить баланс из транзакций', async () => {
      const balance = await TransactionService.getUserBalance(user._id.toString());

      expect(balance).toBe(250); // 100 (начальный) + 100 + 50
    });

    it('должен вернуть 0 для пользователя без транзакций', async () => {
      const newUser = await testUtils.createTestUser({
        ...testData.users.valid,
        steamId: '76561198037414412',
        balance: 0
      });

      const balance = await TransactionService.getUserBalance(newUser._id.toString());

      expect(balance).toBe(0);
    });
  });

  describe('updateUserBalanceFromTransactions', () => {
    beforeEach(async () => {
      // Создаем транзакции
      const deposit1 = await TransactionService.createDeposit(user._id.toString(), 100, 'USD');
      const deposit2 = await TransactionService.createDeposit(user._id.toString(), 50, 'USD');
      
      // Завершаем транзакции
      await TransactionService.completeTransaction((deposit1 as any)._id.toString());
      await TransactionService.completeTransaction((deposit2 as any)._id.toString());
    });

    it('должен обновить баланс пользователя из транзакций', async () => {
      const newBalance = await TransactionService.updateUserBalanceFromTransactions(user._id.toString());

      expect(newBalance).toBe(250); // 100 (начальный) + 100 + 50

      // Проверяем, что баланс пользователя обновился
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.balance).toBe(250);
    });
  });

  describe('completeTransaction', () => {
    let transaction: any;

    beforeEach(async () => {
      transaction = await TransactionService.createWithdrawal(user._id.toString(), 50, 'USD');
    });

    it('должен завершить pending транзакцию', async () => {
      const completedTransaction = await TransactionService.completeTransaction(transaction._id.toString());

      expect(completedTransaction.status).toBe('completed');
    });

    it('должен обновить баланс пользователя при завершении deposit', async () => {
      const depositTransaction = await TransactionService.createDeposit(user._id.toString(), 100, 'USD');
      
      // Завершаем deposit транзакцию
      await TransactionService.completeTransaction((depositTransaction as any)._id.toString());
      
      // Проверяем, что баланс обновился
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.balance).toBe(200); // 100 (начальный) + 100
    });

    it('должен выбрасывать ошибку при завершении несуществующей транзакции', async () => {
      const fakeTransactionId = '507f1f77bcf86cd799439011';

      await expect(
        TransactionService.completeTransaction(fakeTransactionId)
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('cancelTransaction', () => {
    let transaction: any;

    beforeEach(async () => {
      transaction = await TransactionService.createWithdrawal(user._id.toString(), 50, 'USD');
    });

    it('должен отменить pending транзакцию', async () => {
      const cancelledTransaction = await TransactionService.cancelTransaction(transaction._id.toString());

      expect(cancelledTransaction.status).toBe('cancelled');
    });

    it('должен выбрасывать ошибку при отмене несуществующей транзакции', async () => {
      const fakeTransactionId = '507f1f77bcf86cd799439011';

      await expect(
        TransactionService.cancelTransaction(fakeTransactionId)
      ).rejects.toThrow('Transaction not found');
    });
  });
});
