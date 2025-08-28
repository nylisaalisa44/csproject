import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface JWTPayload {
  userId: string;
  steamId: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware для проверки JWT токена
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
      return;
    }

    const token = parts[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Получаем пользователя из базы данных
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Проверяем, не забанен ли пользователь
    if (user.isBanned) {
      res.status(403).json({
        success: false,
        error: 'Account is banned'
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
};

/**
 * Middleware для проверки роли пользователя
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const user = req.user as any;
    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware для проверки админа
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware для проверки модератора или админа
 */
export const requireModerator = requireRole(['admin', 'moderator']);

/**
 * Middleware для проверки верификации пользователя
 */
export const requireVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const user = req.user as any;
  if (!user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Account verification required'
    });
    return;
  }

  next();
};

/**
 * Middleware для проверки наличия trade URL
 */
export const requireTradeUrl = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const user = req.user as any;
  if (!user.tradeUrl) {
    res.status(400).json({
      success: false,
      error: 'Trade URL is required'
    });
    return;
  }

  next();
};

/**
 * Middleware для проверки достаточного баланса
 */
export const requireBalance = (minBalance: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const user = req.user as any;
    const balanceCheck = user.checkBalance(minBalance);
    
    if (!balanceCheck.hasEnough) {
      res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: $${minBalance}, Available: $${balanceCheck.currentBalance}`,
        details: {
          currentBalance: balanceCheck.currentBalance,
          requiredAmount: balanceCheck.requiredAmount,
          shortfall: balanceCheck.shortfall
        }
      });
      return;
    }

    next();
  };
};

/**
 * Генерация JWT токена
 */
export const generateToken = (user: any): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not configured');
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user._id.toString(),
    steamId: user.steamId,
    role: user.role
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

/**
 * Обновление JWT токена
 */
export const refreshToken = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  try {
    const user = req.user as any;
    const newToken = generateToken(user);
    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id.toString(),
          steamId: user.steamId,
          displayName: user.steamProfile.displayName,
          avatar: user.steamProfile.avatar,
          balance: user.balance,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};
