// API базовый URL
const API_BASE = '';

// Утилиты для работы с API
const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      ui.showError(`API Error (GET ${endpoint}): ${error.message}`);
      throw error;
    }
  },

  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      ui.showError(`API Error (POST ${endpoint}): ${error.message}`);
      throw error;
    }
  },

  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      ui.showError(`API Error (PUT ${endpoint}): ${error.message}`);
      throw error;
    }
  }
};

// Функции для работы с ботами
const botManager = {
  // Загрузка списка ботов
  async loadBots() {
    try {
      console.log('🔄 Loading bots...');
      const response = await api.get('/api/bots');
      console.log('📡 Bots response:', response);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        console.log('✅ Bots loaded successfully, data:', response.data);
        // Проверяем структуру данных
        const bots = response.data.bots || response.data;
        console.log('🤖 Extracted bots:', bots);
        this.displayBots(bots);
      } else {
        console.error('❌ Failed to load bots:', response.error);
        ui.showError('Failed to load bots: ' + response.error);
      }
    } catch (error) {
      console.error('❌ Error loading bots:', error);
      ui.showError('Error loading bots: ' + error.message);
    }
  },

  // Отображение списка ботов
  displayBots(bots) {
    console.log('🎨 Displaying bots:', bots);
    const container = document.getElementById('bots-list');
    if (!container) {
      console.error('❌ Container bots-list not found');
      return;
    }

    // Убеждаемся, что bots - это массив
    if (!Array.isArray(bots)) {
      console.error('❌ Bots is not an array:', typeof bots, bots);
      container.innerHTML = `
        <div class="status error">
          <h3>❌ Ошибка данных</h3>
          <p>Получены некорректные данные о ботах: ${typeof bots}</p>
        </div>
      `;
      return;
    }

    if (bots.length === 0) {
      console.log('📭 No bots found, showing empty state');
      container.innerHTML = `
        <div class="status info">
          <h3>🤖 Боты не найдены</h3>
          <p>В базе данных нет ботов. Создайте тестового бота, используя форму ниже.</p>
        </div>
      `;
      return;
    }

    console.log('🎯 Rendering', bots.length, 'bots');
    const html = bots.map(bot => {
      // Проверяем, что у бота есть ID
      if (!bot._id) {
        console.error('❌ Bot missing _id:', bot);
        return `
          <div class="bot-card">
            <div class="status error">
              <h3>❌ Ошибка данных бота</h3>
              <p>У бота ${bot.displayName || 'Unknown'} отсутствует ID</p>
            </div>
          </div>
        `;
      }
      
      return `
        <div class="bot-card">
          <div class="bot-header">
            <img src="${bot.avatar || 'https://via.placeholder.com/50'}" alt="${bot.displayName}" class="bot-avatar">
            <div class="bot-info">
              <h3>${bot.displayName || 'Unknown Bot'}</h3>
              <p>Steam ID: ${bot.steamId || 'N/A'}</p>
              <p>Status: <span class="status ${bot.isOnline ? 'online' : 'offline'}">${bot.isOnline ? 'Online' : 'Offline'}</span></p>
            </div>
          </div>
          <div class="bot-stats">
            <div class="stat">
              <span class="label">Inventory:</span>
              <span class="value">${bot.inventoryCount || 0} items</span>
            </div>
            <div class="stat">
              <span class="label">Active Trades:</span>
              <span class="value">${bot.activeTradesCount || 0}</span>
            </div>
            <div class="stat">
              <span class="label">Last Sync:</span>
              <span class="value">${bot.lastSync ? new Date(bot.lastSync).toLocaleString() : 'Never'}</span>
            </div>
          </div>
          <div class="bot-actions">
            <button class="btn btn-primary" data-action="sync-bot" data-bot-id="${bot._id}">Sync Inventory</button>
            <button class="btn btn-secondary" data-action="process-trades" data-bot-id="${bot._id}">Process Trades</button>
            <button class="btn btn-info" data-action="view-inventory" data-bot-id="${bot._id}">View Inventory</button>
            <button class="btn ${bot.isOnline ? 'btn-warning' : 'btn-success'}" data-action="toggle-status" data-bot-id="${bot._id}" data-online="${!bot.isOnline}">
              ${bot.isOnline ? 'Go Offline' : 'Go Online'}
            </button>
            <div class="login-section" style="display: flex; align-items: center; gap: 8px;">
              <input type="text" placeholder="2FA Code" class="twofa-input" data-bot-id="${bot._id}" style="width: 80px; padding: 4px 8px; font-size: 12px;">
              <button class="btn btn-success" data-action="login-bot" data-bot-id="${bot._id}">Login to Steam</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    console.log('📝 Generated HTML length:', html.length);
    container.innerHTML = html;
    console.log('✅ Bots displayed successfully');
  },

  // Синхронизация инвентаря бота
  async syncBot(botId) {
    try {
      ui.showLoading('Syncing bot inventory...');
      const response = await api.post(`/api/bots/${botId}/sync`);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        ui.showSuccess('Bot inventory synced successfully');
        this.loadBots(); // Перезагружаем список
      } else {
        ui.showError('Failed to sync bot: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error syncing bot: ' + error.message);
    }
  },

  // Обработка трейдов бота
  async processTrades(botId) {
    try {
      ui.showLoading('Processing bot trades...');
      const response = await api.post(`/api/bots/trades/process`);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        ui.showSuccess('Bot trades processed successfully');
        this.loadBots(); // Перезагружаем список
      } else {
        ui.showError('Failed to process trades: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error processing trades: ' + error.message);
    }
  },

  // Просмотр инвентаря бота
  async viewInventory(botId) {
    try {
      ui.showLoading('Loading bot inventory...');
      const response = await api.get(`/api/bots/${botId}/inventory`);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        this.displayInventory(response.data);
      } else {
        ui.showError('Failed to load inventory: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error loading inventory: ' + error.message);
    }
  },

  // Отображение инвентаря
  displayInventory(data) {
    const modal = document.getElementById('inventory-modal');
    const content = document.getElementById('inventory-content');
    
    if (!modal || !content) return;

    // Извлекаем инвентарь из структуры ответа
    const inventory = data.inventory || data;
    const botName = data.botName || 'Unknown Bot';
    const totalItems = data.totalItems || 0;

    if (!inventory || !Array.isArray(inventory) || inventory.length === 0) {
      content.innerHTML = `
        <h3>📦 Инвентарь пуст</h3>
        <p>У бота ${botName} нет предметов в инвентаре.</p>
        <p>Количество предметов: ${totalItems}</p>
      `;
    } else {
      content.innerHTML = `
        <h3>Bot Inventory: ${botName} (${inventory.length} items)</h3>
        <div class="inventory-grid">
          ${inventory.map(item => `
            <div class="inventory-item">
              <img src="${item.icon_url_full || item.icon_url_large || item.icon_url_medium || item.icon_url || '/placeholder-item.png'}" alt="${item.name || item.market_hash_name}" class="item-icon">
              <div class="item-info">
                <h4>${item.name || item.market_hash_name || 'Unknown Item'}</h4>
                <p>Asset ID: ${item.assetid || 'N/A'}</p>
                <p>Market Name: ${item.market_hash_name || 'N/A'}</p>
                ${item.rarity ? `<p>Rarity: ${item.rarity}</p>` : ''}
                ${item.exterior ? `<p>Exterior: ${item.exterior}</p>` : ''}
                ${item.classid ? `<p>Class ID: ${item.classid}</p>` : ''}
                ${item.instanceid ? `<p>Instance ID: ${item.instanceid}</p>` : ''}
                ${item.type ? `<p>Type: ${item.type}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.style.display = 'block';
  },

  // Переключение статуса бота
  async toggleStatus(botId, isOnline) {
    try {
      ui.showLoading(`Setting bot ${isOnline ? 'online' : 'offline'}...`);
      const response = await api.put(`/api/bots/${botId}/status`, {
        isOnline: isOnline
      });
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        ui.showSuccess(`Bot ${isOnline ? 'went online' : 'went offline'} successfully`);
        this.loadBots(); // Перезагружаем список
      } else {
        ui.showError('Failed to update bot status: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error updating bot status: ' + error.message);
    }
  },

  // Логин бота в Steam
  async loginBot(botId) {
    try {
      // Получаем 2FA код из поля ввода
      const twofaInput = document.querySelector(`input[data-bot-id="${botId}"]`);
      const twofaCode = twofaInput ? twofaInput.value.trim() : '';
      
      ui.showLoading('Logging bot into Steam...');
      const response = await api.post(`/api/bots/${botId}/login`, {
        steamGuardCode: twofaCode || undefined
      });
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        ui.showSuccess('Bot logged into Steam successfully');
        // Очищаем поле 2FA кода после успешного логина
        if (twofaInput) {
          twofaInput.value = '';
        }
        this.loadBots(); // Перезагружаем список
      } else {
        ui.showError('Failed to login bot: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error logging in bot: ' + error.message);
    }
  }
};

// Функции для управления сервисом синхронизации
const syncService = {
  // Получение статуса сервиса
  async getStatus() {
    try {
      console.log('🔄 Getting service status...');
      const response = await api.get('/api/bots/sync/status');
      console.log('📡 Service status response:', response);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        console.log('✅ Service status loaded successfully, data:', response.data);
        // Проверяем структуру данных
        const status = response.data.status || response.data;
        console.log('🔄 Extracted status:', status);
        this.displayStatus(status);
      } else {
        console.error('❌ Failed to get service status:', response.error);
        ui.showError('Failed to get service status: ' + response.error);
      }
    } catch (error) {
      console.error('❌ Error getting service status:', error);
      ui.showError('Error getting service status: ' + error.message);
    }
  },

  // Отображение статуса сервиса
  displayStatus(status) {
    console.log('🔄 Displaying service status:', status);
    const statusElement = document.getElementById('service-status');
    if (!statusElement) {
      console.error('❌ Container service-status not found');
      return;
    }

    if (!status) {
      console.log('📭 No status data, showing unknown state');
      statusElement.innerHTML = `
        <div class="status-indicator stopped">
          <span class="dot"></span>
          <span class="text">Unknown</span>
        </div>
        <div class="status-details">
          <p>Status: Unknown</p>
        </div>
      `;
      return;
    }

    console.log('🎯 Rendering service status');
    const html = `
      <div class="status-indicator ${status.isRunning ? 'running' : 'stopped'}">
        <span class="dot"></span>
        <span class="text">${status.isRunning ? 'Running' : 'Stopped'}</span>
      </div>
      <div class="status-details">
        <p>Sync Interval: ${status.hasSyncInterval ? 'Active' : 'Inactive'}</p>
        <p>Trade Processing: ${status.hasTradeProcessingInterval ? 'Active' : 'Inactive'}</p>
        <p>Cleanup: ${status.hasCleanupInterval ? 'Active' : 'Inactive'}</p>
      </div>
    `;
    
    console.log('📝 Generated status HTML length:', html.length);
    statusElement.innerHTML = html;
    console.log('✅ Service status displayed successfully');
  },

  // Запуск сервиса
  async startService() {
    try {
      ui.showLoading('Starting sync service...');
      const response = await api.post('/api/bots/sync/start');
      if (response.success) {
        ui.showSuccess('Sync service started successfully');
        this.getStatus();
      } else {
        ui.showError('Failed to start service: ' + response.error);
      }
    } catch (error) {
      ui.showError('Error starting service: ' + error.message);
    }
  },

  // Остановка сервиса
  async stopService() {
    try {
      ui.showLoading('Stopping sync service...');
      const response = await api.post('/api/bots/sync/stop');
      if (response.success) {
        ui.showSuccess('Sync service stopped successfully');
        this.getStatus();
      } else {
        ui.showError('Failed to stop service: ' + response.error);
      }
    } catch (error) {
      ui.showError('Error stopping service: ' + error.message);
    }
  },

  // Перезапуск сервиса
  async restartService() {
    try {
      ui.showLoading('Restarting sync service...');
      const response = await api.post('/api/bots/sync/start');
      if (response.success) {
        ui.showSuccess('Sync service restarted successfully');
        this.getStatus();
      } else {
        ui.showError('Failed to restart service: ' + response.error);
      }
    } catch (error) {
      ui.showError('Error restarting service: ' + error.message);
    }
  },

  // Принудительная синхронизация
  async forceSync() {
    try {
      ui.showLoading('Force syncing all bots...');
      const response = await api.post('/api/bots/sync/all');
      if (response.success) {
        ui.showSuccess('Force sync completed successfully');
        botManager.loadBots(); // Перезагружаем список ботов
      } else {
        ui.showError('Failed to force sync: ' + response.error);
      }
    } catch (error) {
      ui.showError('Error force syncing: ' + error.message);
    }
  }
};

// Функции для статистики
const stats = {
  // Загрузка статистики
  async loadStats() {
    try {
      console.log('📊 Loading stats...');
      const response = await api.get('/api/bots/stats');
      console.log('📡 Stats response:', response);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        console.log('✅ Stats loaded successfully, data:', response.data);
        // Проверяем структуру данных
        const stats = response.data.stats || response.data;
        console.log('📊 Extracted stats:', stats);
        this.displayStats(stats);
      } else {
        console.error('❌ Failed to load stats:', response.error);
        ui.showError('Failed to load stats: ' + response.error);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      ui.showError('Error loading stats: ' + error.message);
    }
  },

  // Отображение статистики
  displayStats(data) {
    console.log('📊 Displaying stats:', data);
    const container = document.getElementById('stats-container');
    if (!container) {
      console.error('❌ Container stats-container not found');
      return;
    }

    if (!data) {
      console.log('📭 No stats data, showing empty state');
      container.innerHTML = `
        <div class="status info">
          <h3>📊 Статистика недоступна</h3>
          <p>Данные статистики не найдены.</p>
        </div>
      `;
      return;
    }

    console.log('🎯 Rendering stats');
    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Bots</h3>
          <p class="stat-value">${data.totalBots || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Online Bots</h3>
          <p class="stat-value">${data.onlineBots || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Total Items</h3>
          <p class="stat-value">${data.totalItems || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Active Trades</h3>
          <p class="stat-value">${data.activeTrades || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Successful Trades</h3>
          <p class="stat-value">${data.successfulTrades || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Failed Trades</h3>
          <p class="stat-value">${data.failedTrades || 0}</p>
        </div>
      </div>
    `;
    
    console.log('📝 Generated stats HTML length:', html.length);
    container.innerHTML = html;
    console.log('✅ Stats displayed successfully');
  },

  // Загрузка статуса здоровья
  async loadHealth() {
    try {
      console.log('🏥 Loading health status...');
      const response = await api.get('/api/bots/health');
      console.log('📡 Health response:', response);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        console.log('✅ Health status loaded successfully, data:', response.data);
        // Проверяем структуру данных
        const health = response.data.health || response.data;
        console.log('🏥 Extracted health:', health);
        this.displayHealth(health);
      } else {
        console.error('❌ Failed to load health status:', response.error);
        ui.showError('Failed to load health status: ' + response.error);
      }
    } catch (error) {
      console.error('❌ Error loading health status:', error);
      ui.showError('Error loading health status: ' + error.message);
    }
  },

  // Отображение статуса здоровья
  displayHealth(data) {
    const container = document.getElementById('health-container');
    if (!container) return;

    if (!data) {
      container.innerHTML = `
        <div class="status info">
          <h3>🏥 Статус здоровья недоступен</h3>
          <p>Данные о здоровье ботов не найдены.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="health-summary">
        <div class="health-item healthy">
          <span class="label">Healthy:</span>
          <span class="value">${data.healthyBots || 0}</span>
        </div>
        <div class="health-item problematic">
          <span class="label">Problematic:</span>
          <span class="value">${data.problematicBots || 0}</span>
        </div>
        <div class="health-item offline">
          <span class="label">Offline:</span>
          <span class="value">${data.offlineBots || 0}</span>
        </div>
        <div class="health-item error">
          <span class="label">With Errors:</span>
          <span class="value">${data.botsWithErrors || 0}</span>
        </div>
      </div>
      <div class="health-details">
        ${(data.details || []).map(bot => `
          <div class="health-bot ${bot.status}">
            <h4>${bot.displayName}</h4>
            <p>Status: ${bot.status}</p>
            <p>Last Sync: ${new Date(bot.lastSync).toLocaleString()}</p>
            <p>Inventory: ${bot.inventoryCount || 0} items</p>
            <p>Active Trades: ${bot.activeTradesCount || 0}</p>
            ${(bot.issues || []).length > 0 ? `
              <div class="issues">
                <strong>Issues:</strong>
                <ul>
                  ${bot.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
};

// Функции для создания ботов
const botCreator = {
  // Создание тестового бота
  async createTestBot() {
    const form = document.getElementById('create-bot-form');
    if (!form) {
      ui.showError('Form not found');
      return;
    }

    const formData = new FormData(form);
    const botData = {
      steamId: formData.get('steamId'),
      displayName: formData.get('displayName'),
      steamUsername: formData.get('steamUsername'),
      steamPassword: formData.get('steamPassword'),
      steamGuardCode: formData.get('steamGuardCode') || undefined,
      tradeUrl: formData.get('tradeUrl'),
      avatar: formData.get('avatar') || 'https://via.placeholder.com/150'
    };

    // Проверяем обязательные поля
    if (!botData.steamId || !botData.displayName || !botData.steamUsername || !botData.steamPassword || !botData.tradeUrl) {
      ui.showError('Please fill in all required fields');
      return;
    }

    try {
      ui.showLoading('Creating test bot...');
      const response = await api.post('/api/bots/create-test', botData);
      ui.showResponse(response); // Показываем ответ для отладки
      
      if (response.success) {
        ui.showSuccess('Test bot created successfully');
        form.reset();
        botManager.loadBots(); // Перезагружаем список
      } else {
        ui.showError('Failed to create bot: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      ui.showError('Error creating bot: ' + error.message);
    }
  }
};

// Утилиты для отображения сообщений
const ui = {
  showSuccess(message) {
    this.showMessage(message, 'success');
  },

  showError(message) {
    this.showMessage(message, 'error');
  },

  showLoading(message) {
    this.showMessage(message, 'loading');
  },

  showMessage(message, type) {
    const responseDiv = document.getElementById('response');
    if (!responseDiv) return;

    responseDiv.innerHTML = `
      <div class="message ${type}">
        <span class="message-text">${message}</span>
        ${type === 'loading' ? '<div class="spinner"></div>' : ''}
      </div>
    `;

    // Автоматически скрываем сообщения через 5 секунд (кроме loading)
    if (type !== 'loading') {
      setTimeout(() => {
        responseDiv.innerHTML = '';
      }, 5000);
    }
  },

  showResponse(data) {
    console.log('📄 Showing response:', data);
    const responseDiv = document.getElementById('response');
    if (!responseDiv) {
      console.error('❌ Response container not found');
      return;
    }

    const html = `
      <div class="message response">
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
    
    console.log('📝 Generated response HTML length:', html.length);
    responseDiv.innerHTML = html;
    console.log('✅ Response displayed successfully');

    // Автоматически скрываем ответ через 10 секунд
    setTimeout(() => {
      responseDiv.innerHTML = '';
      console.log('🕐 Response auto-cleared');
    }, 10000);
  },

  clearMessage() {
    const responseDiv = document.getElementById('response');
    if (responseDiv) {
      responseDiv.innerHTML = '';
    }
  }
};

// Глобальные функции для вызова из HTML
window.botManager = botManager;
window.syncService = syncService;
window.stats = stats;
window.botCreator = botCreator;
window.ui = ui;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Page loaded, initializing bot management interface...');
  
  // Проверяем наличие необходимых элементов
  const requiredElements = [
    'service-status',
    'stats-container', 
    'health-container',
    'bots-list',
    'response',
    'create-bot-form'
  ];
  
  console.log('🔍 Checking required elements...');
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ Element '${id}' found`);
    } else {
      console.error(`❌ Element '${id}' not found`);
    }
  });

  // Загружаем начальные данные
  console.log('📡 Loading initial data...');
  botManager.loadBots();
  syncService.getStatus();
  stats.loadStats();
  stats.loadHealth();

  // Обработчики событий для кнопок (с делегированием событий)
  document.addEventListener('click', function(e) {
    // Проверяем, является ли элемент кнопкой или содержит data-action
    let target = e.target;
    let action = target.getAttribute('data-action');
    
    // Если у текущего элемента нет data-action, проверяем родительский
    if (!action && target.closest('[data-action]')) {
      target = target.closest('[data-action]');
      action = target.getAttribute('data-action');
    }
    
    if (!action) return;

    console.log('🖱️ Button clicked:', action, 'target:', target);

    switch (action) {
      // Сервис синхронизации
      case 'start-service':
        console.log('▶️ Starting service...');
        syncService.startService();
        break;
      case 'stop-service':
        console.log('⏹️ Stopping service...');
        syncService.stopService();
        break;
      case 'restart-service':
        console.log('🔄 Restarting service...');
        syncService.restartService();
        break;
      case 'force-sync':
        console.log('⚡ Force syncing...');
        syncService.forceSync();
        break;

      // Статистика
      case 'load-stats':
        console.log('📊 Loading stats...');
        stats.loadStats();
        break;
      case 'load-health':
        console.log('🏥 Loading health...');
        stats.loadHealth();
        break;

      // Боты
      case 'load-bots':
        console.log('🤖 Loading bots...');
        botManager.loadBots();
        break;

      // Действия с конкретными ботами
      case 'sync-bot':
        const syncBotId = target.getAttribute('data-bot-id');
        console.log('🔄 Syncing bot:', syncBotId);
        if (syncBotId) {
          botManager.syncBot(syncBotId);
        }
        break;
      case 'process-trades':
        const processBotId = target.getAttribute('data-bot-id');
        console.log('💼 Processing trades for bot:', processBotId);
        if (processBotId) {
          botManager.processTrades(processBotId);
        }
        break;
      case 'view-inventory':
        const viewBotId = target.getAttribute('data-bot-id');
        console.log('📦 Viewing inventory for bot:', viewBotId);
        if (viewBotId) {
          botManager.viewInventory(viewBotId);
        }
        break;
      case 'toggle-status':
        const toggleBotId = target.getAttribute('data-bot-id');
        const isOnline = target.getAttribute('data-online') === 'true';
        console.log('🔄 Toggling status for bot:', toggleBotId, 'online:', isOnline);
        if (toggleBotId) {
          botManager.toggleStatus(toggleBotId, isOnline);
        }
        break;
      case 'login-bot':
        const loginBotId = target.getAttribute('data-bot-id');
        console.log('🔑 Logging bot into Steam:', loginBotId);
        if (loginBotId && loginBotId !== 'undefined') {
          botManager.loginBot(loginBotId);
        } else {
          ui.showError('Invalid bot ID for login');
        }
        break;

      default:
        console.log('❓ Unknown action:', action);
    }
  });

  // Обработчики событий для форм
  const createBotForm = document.getElementById('create-bot-form');
  if (createBotForm) {
    createBotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      botCreator.createTestBot();
    });
  }

  // Обработчик для закрытия модального окна
  const inventoryModal = document.getElementById('inventory-modal');
  if (inventoryModal) {
    inventoryModal.addEventListener('click', function(e) {
      if (e.target === inventoryModal) {
        inventoryModal.style.display = 'none';
      }
    });
  }

  // Обработчик для кнопки закрытия модального окна
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
      const modal = document.getElementById('inventory-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  }

  console.log('🤖 Bot management interface initialized');
});