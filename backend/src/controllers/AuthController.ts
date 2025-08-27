import { Request, Response } from 'express';
import passport from 'passport';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';

export class AuthController {
  /**
   * Инициация Steam авторизации
   */
  static steamAuth = passport.authenticate('steam');

  /**
   * Обработка callback от Steam
   */
  static steamCallback = (req: Request, res: Response): void => {
    passport.authenticate('steam', async (err: any, profile: any) => {
      try {
        if (err) {
          console.error('Steam auth error:', err);
          res.status(400).json({
            success: false,
            error: 'Steam authentication failed'
          });
          return;
        }

        if (!profile || !profile.id) {
          console.error('No profile received from Steam');
          res.status(400).json({
            success: false,
            error: 'Steam profile not received'
          });
          return;
        }

        console.log('Steam profile received:', profile);

        // Ищем пользователя по Steam ID
        let user = await User.findBySteamId(profile.id);

        if (!user) {
          // Создаем нового пользователя
          user = new User({
            steamId: profile.id,
            steamProfile: {
              displayName: profile.displayName || 'Unknown',
              avatar: profile._json?.avatarfull || profile._json?.avatar || ''
            },
            balance: 0,
            referralEarnings: 0,
            isVerified: false,
            isBanned: false,
            role: 'user'
          });

          await user.save();
          console.log(`New user created: ${user.steamId} (${user.steamProfile.displayName})`);
        } else {
          // Обновляем профиль существующего пользователя
          user.steamProfile = {
            displayName: profile.displayName || user.steamProfile.displayName,
            avatar: profile._json?.avatarfull || profile._json?.avatar || user.steamProfile.avatar
          };
          await user.save();
          console.log(`User logged in: ${user.steamId} (${user.steamProfile.displayName})`);
        }

        // Генерируем JWT токен
        const token = generateToken(user);

        // Определяем страницу для перенаправления на основе referrer
        let redirectPage = '/test-auth';
        const referer = req.get('Referer');
        if (referer && referer.includes('test-images')) {
          redirectPage = '/test-images';
        } else if (referer && referer.includes('test-trading')) {
          redirectPage = '/test-trading';
        }

        // Перенаправляем обратно на тестовую страницу с токеном в URL
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${redirectPage}?token=${encodeURIComponent(token)}&success=true&user=${encodeURIComponent(JSON.stringify({
          id: user._id.toString(),
          steamId: user.steamId,
          displayName: user.steamProfile.displayName,
          avatar: user.steamProfile.avatar,
          email: user.email,
          tradeUrl: user.tradeUrl,
          balance: user.balance,
          referralCode: user.referralCode,
          isVerified: user.isVerified,
          role: user.role,
          createdAt: user.createdAt
        }))}`;

        res.redirect(redirectUrl);

      } catch (error) {
        console.error('Steam callback error:', error);
        res.status(500).json({
          success: false,
          error: 'Authentication failed'
        });
      }
    })(req, res);
  };



  /**
   * Выход пользователя
   */
  static logout = (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  };

  /**
   * Проверка авторизации
   */
  static checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // Проверяем, есть ли токен в заголовке
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'No authorization token provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Invalid authorization header'
        });
        return;
      }

      // Декодируем токен и получаем пользователя
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        res.status(500).json({
          success: false,
          error: 'JWT secret not configured'
        });
        return;
      }

      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User is authenticated',
        data: {
          user: {
            id: user._id.toString(),
            steamId: user.steamId,
            displayName: user.steamProfile.displayName,
            avatar: user.steamProfile.avatar,
            email: user.email,
            tradeUrl: user.tradeUrl,
            balance: user.balance,
            referralCode: user.referralCode,
            isVerified: user.isVerified,
            role: user.role,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Check auth error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };
}
