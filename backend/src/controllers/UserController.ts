import { Request, Response } from 'express';
import { User } from '../models/User';

export class UserController {
  /**
   * Получение списка пользователей
   */
  static getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 }).limit(20);
      res.json({
        success: true,
        message: `Found ${users.length} users`,
        data: {
          users: users.map(user => ({
            id: user._id.toString(),
            steamId: user.steamId,
            displayName: user.steamProfile.displayName,
            avatar: user.steamProfile.avatar,
            email: user.email,
            tradeUrl: user.tradeUrl,
            balance: user.balance,
            referralCode: user.referralCode,
            isVerified: user.isVerified,
            isBanned: user.isBanned,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  };

  /**
   * Получение статистики пользователей
   */
  static getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalUsers = await User.countDocuments();
      const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      });
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const bannedUsers = await User.countDocuments({ isBanned: true });

      res.json({
        success: true,
        data: {
          totalUsers,
          newUsersToday,
          verifiedUsers,
          bannedUsers,
          activeUsers: totalUsers - bannedUsers
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics'
      });
    }
  };

  /**
   * Поиск пользователя по Steam ID
   */
  static getUserBySteamId = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findBySteamId(req.params.steamId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
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
            isBanned: user.isBanned,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user by Steam ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  };

  /**
   * Получение профиля текущего пользователя
   */
  static getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = req.user as any;
      res.json({
        success: true,
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
            isBanned: user.isBanned,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch current user'
      });
    }
  };

  /**
   * Обновление профиля пользователя
   */
  static updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const userId = (req.user as any)._id;
      const { email, tradeUrl } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Обновляем только разрешенные поля
      if (email !== undefined) user.email = email;
      if (tradeUrl !== undefined) user.tradeUrl = tradeUrl;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
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
            isBanned: user.isBanned,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile'
      });
    }
  };
}
