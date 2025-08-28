import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireBalance, generateToken } from '../../../src/middleware/auth';

// Мокаем JWT
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Мокаем модель User
jest.mock('../../../src/models/User', () => ({
  User: {
    findById: jest.fn()
  }
}));

const { User } = require('../../../src/models/User');
const mockedUser = User as jest.Mocked<typeof User>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Сбрасываем моки
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('должен пропускать запрос с валидным токеном', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        role: 'user',
        isBanned: false
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockedJwt.verify.mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        role: 'user'
      } as any);

      mockedUser.findById.mockResolvedValue(mockUser as any);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('должен возвращать 401 без токена', async () => {
      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('должен возвращать 401 с неправильным форматом токена', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format'
      });
    });

    it('должен возвращать 401 с невалидным токеном', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
    });
  });

  describe('requireBalance', () => {
    it('должен пропускать запрос с достаточным балансом', () => {
      const minBalance = 50;
      const user = {
        _id: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        balance: 100,
        checkBalance: jest.fn().mockReturnValue({
          hasEnough: true,
          currentBalance: 100,
          requiredAmount: 50,
          shortfall: 0
        })
      };

      mockRequest.user = user;

      const middleware = requireBalance(minBalance);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('должен возвращать 401 без авторизации', () => {
      const minBalance = 50;

      const middleware = requireBalance(minBalance);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });

    it('должен возвращать 400 при недостаточном балансе', () => {
      const minBalance = 150;
      const user = {
        _id: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        balance: 100,
        checkBalance: jest.fn().mockReturnValue({
          hasEnough: false,
          currentBalance: 100,
          requiredAmount: 150,
          shortfall: 50
        })
      };

      mockRequest.user = user;

      const middleware = requireBalance(minBalance);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient balance. Required: $150, Available: $100',
        details: {
          currentBalance: 100,
          requiredAmount: 150,
          shortfall: 50
        }
      });
    });
  });

  describe('generateToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret';
    });

    it('должен генерировать валидный токен', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        role: 'user'
      };

      mockedJwt.sign.mockReturnValue('generated-token' as any);

      const token = generateToken(user);

      expect(token).toBe('generated-token');
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        {
          userId: user._id,
          steamId: user.steamId,
          role: user.role
        },
        'test-secret',
        { expiresIn: '7d' }
      );
    });

    it('должен выбрасывать ошибку без JWT_SECRET', () => {
      delete process.env.JWT_SECRET;

      const user = {
        _id: '507f1f77bcf86cd799439011',
        steamId: '76561198037414410',
        role: 'user'
      };

      expect(() => generateToken(user)).toThrow('JWT secret not configured');
    });
  });
});
