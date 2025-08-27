import axios from 'axios';

export class SteamService {
  private apiKey: string;
  private baseUrl = 'https://api.steampowered.com';

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Steam API key not provided');
    }
  }

  /**
   * Получение инвентаря пользователя
   */
  async getPlayerInventory(steamId: string, appId: number = 730, count: number = 10): Promise<any> {
    // Валидация Steam ID
    if (!this.validateSteamId(steamId)) {
      return { error: 'Invalid Steam ID format' };
    }

    const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/2`;
    const params = {
      l: 'english',
      count: count
    };

    try {
      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Host': 'steamcommunity.com',
          'Connection': 'keep-alive'
        },
        responseType: 'text',
        decompress: true
      });

      // Парсим JSON вручную
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(response.data);
      } catch (parseError) {
        return { error: 'Failed to parse Steam API response' };
      }

      // Проверяем успешность ответа Steam API
      if (parsedData && parsedData.success === 1) {
        // Обрабатываем изображения в описаниях предметов
        if (parsedData.descriptions) {
          parsedData.descriptions = this.processInventoryItems(parsedData.descriptions);
        }
        return parsedData;
      } else if (parsedData && parsedData.success === 0) {
        return { error: 'Steam API returned unsuccessful response' };
      } else if (parsedData && parsedData.rwgrsn === -2) {
        return { error: 'Inventory is private or empty' };
      } else if (parsedData && typeof parsedData === 'object') {
        return parsedData;
      } else {
        return { error: 'Unexpected response format from Steam API' };
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          return { error: 'Invalid Steam ID or inventory is private' };
        } else if (status === 403) {
          return { error: 'Access denied - inventory is private' };
        } else if (status === 404) {
          return { error: 'Steam profile not found' };
        } else if (status === 429) {
          return { error: 'Rate limit exceeded - try again later' };
        } else {
          return { error: `Steam API error: ${status}` };
        }
      } else if (error.request) {
        return { error: 'Network error - could not reach Steam servers' };
      } else {
        return { error: 'Unknown error occurred' };
      }
    }
  }

  /**
   * Получение инвентаря пользователя (алиас для совместимости)
   */
  async getUserInventory(steamId: string, appId: string = '730', count: number = 10): Promise<any> {
    return this.getPlayerInventory(steamId, parseInt(appId), count);
  }

  /**
   * Валидация Steam ID
   */
  validateSteamId(steamId: string): boolean {
    const steamIdRegex = /^[0-9]{17}$/;
    return steamIdRegex.test(steamId);
  }

  /**
   * Получение тестового публичного Steam ID
   */
  getTestSteamId(): string {
    return '76561198037414410'; // Gabe Newell
  }

  /**
   * Преобразование хэша изображения в полный URL
   */
  getImageURL(imageName: string, x: number = 0, y: number = 0, enableHighDPI: boolean = false): string {
    if (!imageName) {
      return 'https://community.fastly.steamstatic.com/public/images/trans.gif';
    }

    let strSize = '';
    if (x !== 0 || y !== 0) {
      strSize = `/${x}x${y}`;
      
      // Поддержка 2x для высокого DPI
      if (enableHighDPI) {
        strSize += 'dpx2x';
      }
    }

    return `https://community.fastly.steamstatic.com/economy/image/${imageName.trim()}${strSize}?allow_animated=1`;
  }

  /**
   * Обработка предметов из инвентаря - добавление полных URL изображений
   */
  processInventoryItems(items: any[]): any[] {
    return items.map(item => {
      // Добавляем полные URL для изображений
      if (item.icon_url) {
        item.icon_url_full = this.getImageURL(item.icon_url);
        item.icon_url_large = this.getImageURL(item.icon_url, 256, 256);
        item.icon_url_medium = this.getImageURL(item.icon_url, 128, 128);
        item.icon_url_small = this.getImageURL(item.icon_url, 64, 64);
      }

      // Обрабатываем описания предметов
      if (item.descriptions) {
        item.descriptions = item.descriptions.map((desc: any) => {
          if (desc.icon_url) {
            desc.icon_url_full = this.getImageURL(desc.icon_url);
            desc.icon_url_large = this.getImageURL(desc.icon_url, 256, 256);
            desc.icon_url_medium = this.getImageURL(desc.icon_url, 128, 128);
            desc.icon_url_small = this.getImageURL(desc.icon_url, 64, 64);
          }
          return desc;
        });
      }

      return item;
    });
  }
}

export const steamService = new SteamService();
