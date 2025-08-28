import { SteamService } from '../../../src/services/SteamService';
import axios from 'axios';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SteamService', () => {
  let steamService: SteamService;

  beforeEach(() => {
    steamService = new SteamService();
    jest.clearAllMocks();
  });

  describe('validateSteamId', () => {
    it('должен валидировать правильный Steam ID', () => {
      const validSteamId = '76561198037414410';
      expect(steamService.validateSteamId(validSteamId)).toBe(true);
    });

    it('должен отклонять неправильный Steam ID', () => {
      const invalidSteamIds = [
        '123456789', // Слишком короткий
        '76561198037414410a', // Содержит буквы
        '7656119803741441', // Неправильная длина
        '', // Пустой
        'abc123' // Неправильный формат
      ];

      invalidSteamIds.forEach(steamId => {
        expect(steamService.validateSteamId(steamId)).toBe(false);
      });
    });
  });

  describe('getTestSteamId', () => {
    it('должен возвращать валидный Steam ID', () => {
      const testSteamId = steamService.getTestSteamId();
      expect(steamService.validateSteamId(testSteamId)).toBe(true);
    });
  });

  describe('getImageURL', () => {
    it('должен генерировать правильный URL изображения', () => {
      const imageName = 'test-image';
      const url = steamService.getImageURL(imageName);
      
      expect(url).toBe('https://community.fastly.steamstatic.com/economy/image/test-image?allow_animated=1');
    });

    it('должен генерировать URL с размерами', () => {
      const imageName = 'test-image';
      const url = steamService.getImageURL(imageName, 256, 256);
      
      expect(url).toBe('https://community.fastly.steamstatic.com/economy/image/test-image/256x256?allow_animated=1');
    });

    it('должен генерировать URL с высоким DPI', () => {
      const imageName = 'test-image';
      const url = steamService.getImageURL(imageName, 256, 256, true);
      
      expect(url).toBe('https://community.fastly.steamstatic.com/economy/image/test-image/256x256dpx2x?allow_animated=1');
    });

    it('должен возвращать placeholder для пустого имени изображения', () => {
      const url = steamService.getImageURL('');
      
      expect(url).toBe('https://community.fastly.steamstatic.com/public/images/trans.gif');
    });
  });

  describe('processInventoryItems', () => {
    it('должен обрабатывать предметы с изображениями', () => {
      const items = [
        {
          icon_url: 'test-icon',
          name: 'Test Item 1'
        },
        {
          icon_url: 'test-icon-2',
          name: 'Test Item 2',
          descriptions: [
            {
              icon_url: 'desc-icon'
            }
          ]
        }
      ];

      const processedItems = steamService.processInventoryItems(items);

      expect(processedItems).toHaveLength(2);
      expect(processedItems[0].icon_url_full).toBeDefined();
      expect(processedItems[0].icon_url_large).toBeDefined();
      expect(processedItems[0].icon_url_medium).toBeDefined();
      expect(processedItems[0].icon_url_small).toBeDefined();
      expect(processedItems[1].descriptions[0].icon_url_full).toBeDefined();
    });

    it('должен обрабатывать предметы без изображений', () => {
      const items = [
        {
          name: 'Test Item 1'
        }
      ];

      const processedItems = steamService.processInventoryItems(items);

      expect(processedItems).toHaveLength(1);
      expect(processedItems[0].name).toBe('Test Item 1');
    });
  });

  describe('getPlayerInventory', () => {
    const mockSteamId = '76561198037414410';

    beforeEach(() => {
      // Сбрасываем переменную окружения для тестов
      delete process.env.STEAM_API_KEY;
    });

    it('должен возвращать ошибку для невалидного Steam ID', async () => {
      const result = await steamService.getPlayerInventory('invalid-steam-id');

      expect(result.error).toBe('Invalid Steam ID format');
    });

    it('должен успешно получать инвентарь', async () => {
      const mockInventoryData = {
        success: 1,
        assets: [
          {
            assetid: '123456789',
            classid: '310776272',
            instanceid: '188530139'
          }
        ],
        descriptions: [
          {
            classid: '310776272',
            instanceid: '188530139',
            name: 'AK-47 | Redline',
            icon_url: 'test-icon'
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: JSON.stringify(mockInventoryData)
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.success).toBe(1);
      expect(result.assets).toBeDefined();
      expect(result.descriptions).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://steamcommunity.com/inventory/${mockSteamId}/730/2`,
        expect.objectContaining({
          params: {
            l: 'english',
            count: 10
          }
        })
      );
    });

    it('должен обрабатывать ошибку парсинга JSON', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: 'invalid json'
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Failed to parse Steam API response');
    });

    it('должен обрабатывать неуспешный ответ Steam API', async () => {
      const mockResponse = {
        success: 0
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: JSON.stringify(mockResponse)
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Steam API returned unsuccessful response');
    });

    it('должен обрабатывать приватный инвентарь', async () => {
      const mockResponse = {
        rwgrsn: -2
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: JSON.stringify(mockResponse)
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Inventory is private or empty');
    });

    it('должен обрабатывать HTTP ошибки', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 400
        }
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Invalid Steam ID or inventory is private');
    });

    it('должен обрабатывать сетевые ошибки', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        request: {}
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Network error - could not reach Steam servers');
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unknown error'));

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Unknown error occurred');
    });

    it('должен обрабатывать rate limit ошибки', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 429
        }
      });

      const result = await steamService.getPlayerInventory(mockSteamId);

      expect(result.error).toBe('Rate limit exceeded - try again later');
    });
  });

  describe('getUserInventory', () => {
    it('должен вызывать getPlayerInventory с правильными параметрами', async () => {
      const mockSteamId = '76561198037414410';
      const mockAppId = '730';
      const mockCount = 20;

      const mockInventoryData = {
        success: 1,
        assets: [],
        descriptions: []
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: JSON.stringify(mockInventoryData)
      });

      await steamService.getUserInventory(mockSteamId, mockAppId, mockCount);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://steamcommunity.com/inventory/${mockSteamId}/730/2`,
        expect.objectContaining({
          params: {
            l: 'english',
            count: 20
          }
        })
      );
    });
  });
});
