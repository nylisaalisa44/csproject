import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { SteamService } from '../services/SteamService';

const steamService = new SteamService();

export class ItemController {
  /**
   * Получение всех доступных предметов
   */
  static getItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        game = 'cs2',
        type,
        rarity,
        category,
        minPrice,
        maxPrice,
        search,
        limit = 50,
        page = 1
      } = req.query;

      // Строим фильтр
      const filter: any = { isAvailable: true, quantity: { $gt: 0 } };
      
      if (game) filter.game = game;
      if (type) filter.type = type;
      if (rarity) filter.rarity = rarity;
      if (category) filter.category = category;
      
      if (minPrice || maxPrice) {
        filter.ourPrice = {};
        if (minPrice) filter.ourPrice.$gte = parseFloat(minPrice as string);
        if (maxPrice) filter.ourPrice.$lte = parseFloat(maxPrice as string);
      }

      if (search) {
        filter.$or = [
          { displayName: { $regex: search, $options: 'i' } },
          { marketName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }

      // Пагинация
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const items = await Item.find(filter)
        .sort({ ourPrice: 1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const total = await Item.countDocuments(filter);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });

    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch items',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * Получение конкретного предмета
   */
  static getItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const item = await Item.findById(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { item }
      });

    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch item'
      });
    }
  };

  /**
   * Поиск предметов по Steam ID
   */
  static getItemBySteamId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { steamId } = req.params;
      
      const item = await Item.findBySteamId(steamId);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { item }
      });

    } catch (error) {
      console.error('Get item by Steam ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch item'
      });
    }
  };

  /**
   * Получение инвентаря текущего пользователя
   */
  static getCurrentUserInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 60, offset = 0, appId = '730', sort = 'price-desc', test = false } = req.query;

      // Проверяем, авторизован ли пользователь
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      let steamId = (req.user as any).steamId;
      
      // Если включен тестовый режим, используем публичный профиль
      if (test === 'true') {
        steamId = steamService.getTestSteamId();
      }
      
      // Получаем инвентарь через Steam API
      const inventory = await steamService.getUserInventory(steamId, appId as string, parseInt(limit as string));

      // Проверяем, есть ли ошибка в ответе
      if (inventory && inventory.error) {
        res.status(400).json({
          success: false,
          error: inventory.error,
          data: {
            steamId,
            appId,
            inventory: [],
            totalItems: 0
          }
        });
        return;
      }

      // Если инвентарь не найден или пустой
      if (!inventory || !inventory.descriptions) {
        res.json({
          success: true,
          data: {
            steamId,
            appId,
            inventory: [],
            totalItems: 0,
            message: 'Inventory is empty or not accessible'
          }
        });
        return;
      }

      // Обрабатываем предметы
      let items = inventory.descriptions || [];
      
      // Применяем сортировку
      if (sort === 'price-desc') {
        items = items.sort((a: any, b: any) => {
          const priceA = parseFloat(a.market_hash_name?.split('|')[1]?.trim() || '0');
          const priceB = parseFloat(b.market_hash_name?.split('|')[1]?.trim() || '0');
          return priceB - priceA;
        });
      } else if (sort === 'price-asc') {
        items = items.sort((a: any, b: any) => {
          const priceA = parseFloat(a.market_hash_name?.split('|')[1]?.trim() || '0');
          const priceB = parseFloat(b.market_hash_name?.split('|')[1]?.trim() || '0');
          return priceA - priceB;
        });
      }

      // Применяем пагинацию
      const startIndex = parseInt(offset as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedItems = items.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          steamId,
          appId,
          inventory: paginatedItems,
          totalItems: items.length,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: items.length,
            hasMore: endIndex < items.length
          }
        }
      });

    } catch (error) {
      console.error('Get current user inventory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user inventory'
      });
    }
  };

  /**
   * Получение инвентаря пользователя через Steam API
   */
  static getUserInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { steamId } = req.params;
      const { appId = '730' } = req.query; // CS2 app ID

      // Проверяем, авторизован ли пользователь
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Получаем инвентарь через Steam API
      const inventory = await steamService.getUserInventory(steamId, appId as string, 60);

      // Проверяем, есть ли ошибка в ответе
      if (inventory && inventory.error) {
        res.status(400).json({
          success: false,
          error: inventory.error,
          data: {
            steamId,
            appId,
            inventory: [],
            totalItems: 0
          }
        });
        return;
      }

      // Если инвентарь не найден или пустой
      if (!inventory || !inventory.descriptions) {
        res.json({
          success: true,
          data: {
            steamId,
            appId,
            inventory: [],
            totalItems: 0,
            message: 'Inventory is empty or not accessible'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          steamId,
          appId,
          inventory: inventory.descriptions || [],
          totalItems: inventory.total_inventory_count || 0,
          assets: inventory.assets || []
        }
      });

    } catch (error) {
      console.error('Get user inventory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user inventory'
      });
    }
  };

  /**
   * Получение статистики предметов
   */
  static getItemsStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalItems = await Item.countDocuments();
      const availableItems = await Item.countDocuments({ isAvailable: true, quantity: { $gt: 0 } });
      const totalValue = await Item.aggregate([
        { $match: { isAvailable: true, quantity: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$ourPrice', '$quantity'] } } } }
      ]);

      const itemsByGame = await Item.aggregate([
        { $group: { _id: '$game', count: { $sum: 1 } } }
      ]);

      const itemsByRarity = await Item.aggregate([
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          totalItems,
          availableItems,
          totalValue: totalValue[0]?.total || 0,
          itemsByGame,
          itemsByRarity
        }
      });

    } catch (error) {
      console.error('Get items stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch items statistics'
      });
    }
  };

  /**
   * Обновление цен предметов
   */
  static updateItemPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { price } = req.body;

      if (!price || price < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid price'
        });
        return;
      }

      const item = await Item.findById(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
        return;
      }

      await item.updatePrice(price);

      res.json({
        success: true,
        message: 'Item price updated successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Update item price error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update item price'
      });
    }
  };

  /**
   * Обновление количества предметов
   */
  static updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid quantity'
        });
        return;
      }

      const item = await Item.findById(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
        return;
      }

      const change = quantity - item.quantity;
      await item.updateQuantity(change);

      res.json({
        success: true,
        message: 'Item quantity updated successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Update item quantity error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update item quantity'
      });
          }
    };

  /**
   * Получение инвентаря ботов (доступные предметы для покупки)
   */
  static getBotInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 60, offset = 0, appId = '730', sort = 'price-desc' } = req.query;

      // Строим фильтр для доступных предметов
      const filter: any = { 
        isAvailable: true, 
        quantity: { $gt: 0 },
        game: appId === '730' ? 'cs2' : appId === '570' ? 'dota2' : 'other'
      };

      // Определяем сортировку
      let sortOption: any = {};
      if (sort === 'price-desc') {
        sortOption = { ourPrice: -1 };
      } else if (sort === 'price-asc') {
        sortOption = { ourPrice: 1 };
      } else if (sort === 'name-asc') {
        sortOption = { displayName: 1 };
      } else if (sort === 'name-desc') {
        sortOption = { displayName: -1 };
      } else {
        sortOption = { ourPrice: -1 }; // По умолчанию по цене убывание
      }

      // Получаем предметы с пагинацией
      const items = await Item.find(filter)
        .sort(sortOption)
        .skip(parseInt(offset as string))
        .limit(parseInt(limit as string));

      const total = await Item.countDocuments(filter);

      // Форматируем ответ в том же формате, что и Steam API
      const formattedItems = items.map(item => ({
        classid: item.steamId,
        instanceid: '0',
        market_hash_name: item.marketName,
        name: item.displayName,
        type: item.type,
        rarity: item.rarity,
        exterior: item.exterior,
        icon_url: item.image,
        price: item.ourPrice,
        steam_price: item.steamPrice,
        quantity: item.quantity,
        tags: item.tags,
        category: item.category
      }));

      res.json({
        success: true,
        data: {
          appId,
          inventory: formattedItems,
          totalItems: total,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total,
            hasMore: parseInt(offset as string) + parseInt(limit as string) < total
          }
        }
      });

    } catch (error) {
      console.error('Get bot inventory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bot inventory'
      });
    }
  };
}
