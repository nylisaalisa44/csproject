import { Item } from '../models/Item';
import { Bot } from '../models/Bot';
import { IBotDocument } from '../types';
import { IItem } from '../types';

export interface ItemSyncResult {
  totalItems: number;
  newItems: number;
  updatedItems: number;
  errors: number;
}

export class ItemSyncService {
  /**
   * Синхронизация предметов ботов с общей базой предметов
   */
  async syncBotItemsToGlobalInventory(): Promise<ItemSyncResult> {
    try {
      console.log('🔄 Starting bot items sync to global inventory...');
      
      const bots = await Bot.find({ isActive: true, isOnline: true });
      console.log(`📊 Found ${bots.length} online bots to sync`);
      
      let totalItems = 0;
      let newItems = 0;
      let updatedItems = 0;
      let errors = 0;

      for (const bot of bots) {
        console.log(`🔄 Syncing items from bot: ${bot.displayName}`);
        
        for (const botItem of bot.inventory) {
          try {
            totalItems++;
            
            // Проверяем, существует ли предмет в глобальной базе
            let globalItem = await Item.findOne({ steamId: botItem.steamId });
            
            if (!globalItem) {
              // Создаем новый предмет в глобальной базе
              const newItemData: Partial<IItem> = {
                steamId: botItem.steamId,
                marketName: botItem.marketHashName,
                displayName: botItem.itemName,
                type: this.extractItemType(botItem.itemName),
                rarity: botItem.rarity || 'Common',
                exterior: botItem.exterior || '',
                image: botItem.iconUrl || '',
                game: 'cs2',
                steamPrice: 0, // Будет обновлено позже
                ourPrice: 0, // Будет установлено администратором
                currency: 'USD',
                isAvailable: true,
                isTradeable: true,
                quantity: 1, // Каждый бот имеет 1 экземпляр
                tags: this.extractTags(botItem.itemName, botItem.rarity),
                category: this.extractCategory(botItem.itemName),
                itemCollection: this.extractCollection(botItem.itemName)
              };
              
              globalItem = new Item(newItemData);
              await globalItem.save();
              newItems++;
              console.log(`✅ Created new global item: ${botItem.itemName}`);
              
            } else {
              // Обновляем существующий предмет
              const updated = await this.updateGlobalItem(globalItem, botItem);
              if (updated) {
                updatedItems++;
                console.log(`🔄 Updated global item: ${botItem.itemName}`);
              }
            }
            
          } catch (error) {
            console.error(`❌ Error syncing item ${botItem.itemName}:`, error);
            errors++;
          }
        }
      }

      console.log(`✅ Bot items sync completed: ${totalItems} total, ${newItems} new, ${updatedItems} updated, ${errors} errors`);
      
      return {
        totalItems,
        newItems,
        updatedItems,
        errors
      };

    } catch (error) {
      console.error('❌ Error in bot items sync:', error);
      throw error;
    }
  }

  /**
   * Обновление глобального предмета данными от бота
   */
  private async updateGlobalItem(globalItem: any, botItem: any): Promise<boolean> {
    let updated = false;
    
    // Обновляем изображение, если его нет
    if (!globalItem.image && botItem.iconUrl) {
      globalItem.image = botItem.iconUrl;
      updated = true;
    }
    
    // Обновляем редкость, если она изменилась
    if (botItem.rarity && globalItem.rarity !== botItem.rarity) {
      globalItem.rarity = botItem.rarity;
      updated = true;
    }
    
    // Обновляем exterior, если он изменился
    if (botItem.exterior && globalItem.exterior !== botItem.exterior) {
      globalItem.exterior = botItem.exterior;
      updated = true;
    }
    
    // Обновляем marketName, если он изменился
    if (botItem.marketHashName && globalItem.marketName !== botItem.marketHashName) {
      globalItem.marketName = botItem.marketHashName;
      updated = true;
    }
    
    if (updated) {
      await globalItem.save();
    }
    
    return updated;
  }

  /**
   * Извлечение типа предмета из названия
   */
  private extractItemType(itemName: string): string {
    const name = itemName.toLowerCase();
    
    if (name.includes('knife') || name.includes('karambit') || name.includes('butterfly')) return 'knife';
    if (name.includes('gloves')) return 'gloves';
    if (name.includes('ak-47') || name.includes('m4a4') || name.includes('m4a1')) return 'rifle';
    if (name.includes('awp')) return 'sniper';
    if (name.includes('usp') || name.includes('glock') || name.includes('deagle')) return 'pistol';
    if (name.includes('graffiti')) return 'graffiti';
    if (name.includes('sticker')) return 'sticker';
    if (name.includes('case')) return 'case';
    if (name.includes('key')) return 'key';
    
    return 'other';
  }

  /**
   * Извлечение тегов из названия и редкости
   */
  private extractTags(itemName: string, rarity?: string): string[] {
    const tags: string[] = [];
    const name = itemName.toLowerCase();
    
    // Добавляем редкость как тег
    if (rarity) {
      tags.push(rarity.toLowerCase());
    }
    
    // Добавляем теги на основе названия
    if (name.includes('stattrak')) tags.push('stattrak');
    if (name.includes('souvenir')) tags.push('souvenir');
    if (name.includes('factory new')) tags.push('factory-new');
    if (name.includes('minimal wear')) tags.push('minimal-wear');
    if (name.includes('field-tested')) tags.push('field-tested');
    if (name.includes('well-worn')) tags.push('well-worn');
    if (name.includes('battle-scarred')) tags.push('battle-scarred');
    
    return tags;
  }

  /**
   * Извлечение категории из названия
   */
  private extractCategory(itemName: string): string {
    const name = itemName.toLowerCase();
    
    if (name.includes('knife') || name.includes('karambit') || name.includes('butterfly')) return 'knives';
    if (name.includes('gloves')) return 'gloves';
    if (name.includes('ak-47')) return 'ak47';
    if (name.includes('m4a4') || name.includes('m4a1')) return 'm4';
    if (name.includes('awp')) return 'awp';
    if (name.includes('usp')) return 'usp';
    if (name.includes('glock')) return 'glock';
    if (name.includes('deagle')) return 'deagle';
    if (name.includes('graffiti')) return 'graffiti';
    if (name.includes('sticker')) return 'stickers';
    if (name.includes('case')) return 'cases';
    if (name.includes('key')) return 'keys';
    
    return 'other';
  }

  /**
   * Извлечение коллекции из названия
   */
  private extractCollection(itemName: string): string {
    const name = itemName.toLowerCase();
    
    // Определяем коллекцию по названию
    if (name.includes('urban ddpat')) return 'Urban DDPAT';
    if (name.includes('battle green')) return 'Battle Green';
    if (name.includes('desert storm')) return 'Desert Storm';
    if (name.includes('forest ddpat')) return 'Forest DDPAT';
    if (name.includes('arctic camo')) return 'Arctic Camo';
    if (name.includes('jungle ddpat')) return 'Jungle DDPAT';
    if (name.includes('winter forest')) return 'Winter Forest';
    if (name.includes('blue steel')) return 'Blue Steel';
    if (name.includes('case hardened')) return 'Case Hardened';
    if (name.includes('fade')) return 'Fade';
    if (name.includes('doppler')) return 'Doppler';
    if (name.includes('marble fade')) return 'Marble Fade';
    if (name.includes('tiger tooth')) return 'Tiger Tooth';
    if (name.includes('damascus steel')) return 'Damascus Steel';
    if (name.includes('ultraviolet')) return 'Ultraviolet';
    if (name.includes('crimson web')) return 'Crimson Web';
    if (name.includes('night')) return 'Night';
    if (name.includes('safari mesh')) return 'Safari Mesh';
    if (name.includes('boreal forest')) return 'Boreal Forest';
    if (name.includes('scorched')) return 'Scorched';
    
    return 'Default';
  }

  /**
   * Получение статистики предметов
   */
  async getItemsStats(): Promise<{
    totalItems: number;
    availableItems: number;
    tradeableItems: number;
    itemsByType: Record<string, number>;
    itemsByRarity: Record<string, number>;
  }> {
    try {
      const totalItems = await Item.countDocuments();
      const availableItems = await Item.countDocuments({ isAvailable: true });
      const tradeableItems = await Item.countDocuments({ isTradeable: true });
      
      const itemsByType = await Item.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      const itemsByRarity = await Item.aggregate([
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]);
      
      return {
        totalItems,
        availableItems,
        tradeableItems,
        itemsByType: itemsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        itemsByRarity: itemsByRarity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>)
      };
      
    } catch (error) {
      console.error('❌ Error getting items stats:', error);
      throw error;
    }
  }
}
