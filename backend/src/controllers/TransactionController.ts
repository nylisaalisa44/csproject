import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

export class TransactionController {
  /**
   * Создание транзакции пополнения
   */
  static createDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { amount, currency = 'USD', cryptoAddress, cryptoType } = req.body;
      const userId = (req.user as any)._id;

      const transaction = await TransactionService.createDeposit(
        userId, 
        amount, 
        currency, 
        { cryptoAddress, cryptoType }
      );

      res.status(201).json({
        success: true,
        message: 'Deposit transaction created',
        data: { transaction }
      });

    } catch (error) {
      console.error('Create deposit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create deposit',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Создание транзакции вывода
   */
  static createWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { amount, currency = 'USD', cryptoAddress, cryptoType } = req.body;
      const userId = (req.user as any)._id;

      const transaction = await TransactionService.createWithdrawal(
        userId, 
        amount, 
        currency, 
        { cryptoAddress, cryptoType }
      );

      res.status(201).json({
        success: true,
        message: 'Withdrawal transaction created',
        data: { transaction }
      });

    } catch (error) {
      console.error('Create withdrawal error:', error);
      
      // Проверяем тип ошибки для правильного HTTP статуса
      if ((error as Error).message === 'Insufficient balance') {
        const errorDetails = (error as any).details || {};
        res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          message: 'Your balance is not sufficient for this withdrawal',
          details: {
            requiredAmount: req.body.amount,
            currentBalance: errorDetails.currentBalance || 0,
            shortfall: errorDetails.shortfall || req.body.amount
          }
        });
      } else if ((error as Error).message === 'User not found') {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create withdrawal',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };

  /**
   * Получение истории транзакций пользователя
   */
  static getUserTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;
      const { limit = 50, page = 1, type, status } = req.query;

      const filters = { type: type as string, status: status as string };
      const pagination = { 
        limit: parseInt(limit as string), 
        page: parseInt(page as string) 
      };

      const { transactions, total } = await TransactionService.getUserTransactions(
        userId, 
        filters, 
        pagination
      );

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user transactions',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Получение баланса пользователя
   */
  static getUserBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;

      const balance = await TransactionService.getUserBalance(userId);

      res.json({
        success: true,
        data: { balance }
      });

    } catch (error) {
      console.error('Get user balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user balance',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Завершение транзакции (админ функция)
   */
  static completeTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { transactionId } = req.params;
      const userId = (req.user as any)._id;

      const transaction = await TransactionService.completeTransaction(transactionId);
      
      // Обновляем баланс пользователя
      await TransactionService.updateUserBalanceFromTransactions(userId);

      res.json({
        success: true,
        message: 'Transaction completed successfully',
        data: { transaction }
      });

    } catch (error) {
      console.error('Complete transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Отмена транзакции (админ функция)
   */
  static cancelTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { transactionId } = req.params;
      const userId = (req.user as any)._id;

      const transaction = await TransactionService.cancelTransaction(transactionId);
      
      // Обновляем баланс пользователя
      await TransactionService.updateUserBalanceFromTransactions(userId);

      res.json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: { transaction }
      });

    } catch (error) {
      console.error('Cancel transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Получение транзакций по трейду
   */
  static getTransactionsByTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { tradeId } = req.params;
      const userId = (req.user as any)._id;

      const transactions = await TransactionService.getTransactionsByTrade(tradeId);

      res.json({
        success: true,
        data: { transactions }
      });

    } catch (error) {
      console.error('Get transactions by trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions by trade',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
}
