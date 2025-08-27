import { Request, Response } from 'express';
import { TradeService } from '../services/TradeService';
import { logger } from '../utils/logger';

export class TradeController {
  /**
   * Расчет стоимости трейда
   */
  static calculateTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { type, items } = req.body;

      // Валидация данных
      if (!type || !['buy', 'sell'].includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid trade type'
        });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Items array is required'
        });
        return;
      }

      const result = await TradeService.calculateTrade(type, items);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Calculate trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate trade',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Создание нового трейда
   */
  static createTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { type, items, totalAmount } = req.body;
      const userId = (req.user as any)._id;

      // Валидация данных
      if (!type || !['buy', 'sell'].includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid trade type'
        });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Items array is required'
        });
        return;
      }

      if (!totalAmount || totalAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid total amount'
        });
        return;
      }

      const trade = await TradeService.createTrade(userId, type, items, totalAmount);

      res.status(201).json({
        success: true,
        message: 'Trade created successfully',
        data: trade
      });

    } catch (error) {
      logger.error('Create trade error:', error);
      if ((error as Error).message === 'Insufficient balance') {
        const errorDetails = (error as any).details || {};
        const requestedAmount = req.body.totalAmount || 0;
        res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          message: 'Your balance is not sufficient for this trade',
          details: {
            requiredAmount: requestedAmount,
            currentBalance: errorDetails.currentBalance || 0,
            shortfall: errorDetails.shortfall || requestedAmount
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
          error: 'Failed to create trade',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };

  /**
   * Получение истории трейдов пользователя
   */
  static getUserTrades = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;
      const { limit = 50, page = 1, status, type } = req.query;

      const filters = { status: status as string, type: type as string };
      const pagination = { 
        limit: parseInt(limit as string), 
        page: parseInt(page as string) 
      };

      const { trades, total } = await TradeService.getUserTrades(userId, filters, pagination);

      res.json({
        success: true,
        data: {
          trades,
          total,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get user trades error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user trades',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Получение конкретного трейда
   */
  static getTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;

      const trade = await TradeService.getTrade(id, userId);

      if (!trade) {
        // Проверяем, существует ли трейд вообще
        const tradeExists = await TradeService.tradeExists(id);
        if (tradeExists) {
          res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'You do not have permission to access this trade'
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Trade not found'
          });
        }
        return;
      }

      res.json({
        success: true,
        data: trade
      });

    } catch (error) {
      logger.error('Get trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trade',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Отмена трейда
   */
  static cancelTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;

      const trade = await TradeService.cancelTrade(id, userId);

      res.json({
        success: true,
        message: 'Trade cancelled successfully',
        data: trade
      });

    } catch (error) {
      logger.error('Cancel trade error:', error);
      if ((error as Error).message === 'Trade not found') {
        res.status(404).json({
          success: false,
          error: 'Trade not found',
          message: 'Trade not found or you do not have permission to cancel it'
        });
      } else if ((error as Error).message === 'Trade cannot be cancelled') {
        res.status(400).json({
          success: false,
          error: 'Trade cannot be cancelled',
          message: 'Only pending trades can be cancelled. This trade is already in progress or completed.'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to cancel trade',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };

  /**
   * Перевод трейда в обработку
   */
  static processTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const userId = (req.user as any)._id;

      const trade = await TradeService.processTrade(id, userId);

      res.json({
        success: true,
        message: 'Trade processing started',
        data: trade
      });

    } catch (error) {
      logger.error('Process trade error:', error);
      if ((error as Error).message === 'Trade not found') {
        res.status(404).json({
          success: false,
          error: 'Trade not found',
          message: 'Trade not found or you do not have permission to process it'
        });
      } else if ((error as Error).message === 'Trade cannot be processed') {
        res.status(400).json({
          success: false,
          error: 'Trade cannot be processed',
          message: 'Only pending trades can be processed. This trade is already in progress or completed.'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process trade',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };

  /**
   * Завершение трейда с обновлением баланса и предметов
   */
  static completeTrade = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const userId = (req.user as any)._id;

      const result = await TradeService.completeTradeWithProcessing(id, userId);

      res.json({
        success: true,
        message: 'Trade completed successfully',
        data: result
      });

    } catch (error) {
      logger.error('Complete trade error:', error);
      if ((error as Error).message === 'Trade not found') {
        res.status(404).json({
          success: false,
          error: 'Trade not found',
          message: 'Trade not found or you do not have permission to complete it'
        });
      } else if ((error as Error).message === 'Trade already completed') {
        res.status(400).json({
          success: false,
          error: 'Trade already completed',
          message: 'This trade has already been completed and cannot be processed again.'
        });
      } else if ((error as Error).message.includes('Insufficient balance')) {
        const errorDetails = (error as any).details || {};
        res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          message: 'User balance is not sufficient to complete this trade',
          details: errorDetails
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete trade',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };
}
