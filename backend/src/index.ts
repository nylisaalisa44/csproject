import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import SteamStrategy from 'passport-steam';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Загружаем переменные окружения
dotenv.config();

// Импортируем конфигурации и сервисы
import { connectDatabase } from './config/database';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { ItemController } from './controllers/ItemController';
import { TradeController } from './controllers/TradeController';
import { TransactionController } from './controllers/TransactionController';
import { BotController } from './controllers/BotController';
import { authenticateToken } from './middleware/auth';
import { botSyncService } from './services/BotSyncService';

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Настройка rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // увеличили до 1000 запросов
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Возвращает rate limit info в заголовках
  legacyHeaders: false, // Отключает старые заголовки
  skipSuccessfulRequests: false, // Не пропускаем успешные запросы
  skipFailedRequests: false, // Не пропускаем неудачные запросы
  keyGenerator: (req) => {
    // Используем IP + User-Agent для более точного определения клиента
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  }
});

// Более мягкий rate limiter для API запросов
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'), // 1 минута
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '300'), // 300 запросов в минуту
  message: {
    success: false,
    error: 'API rate limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Очень мягкий rate limiter для статических файлов
const staticLimiter = rateLimit({
  windowMs: parseInt(process.env.STATIC_RATE_LIMIT_WINDOW_MS || '60000'), // 1 минута
  max: parseInt(process.env.STATIC_RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 запросов в минуту
  message: {
    success: false,
    error: 'Too many requests for static files, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"], // Разрешаем inline event handlers
      imgSrc: [
        "'self'", 
        "data:", 
        "https://community.fastly.steamstatic.com", 
        "https://steamcommunity.com",
        "https://steamcdn-a.akamaihd.net",
        "https://cdn.cloudflare.steamstatic.com",
        "https://steamstatic.com",
        "https://*.steamstatic.com",
        "https://*.steamcdn-a.akamaihd.net",
        "https://*.steamcommunity.com",
        "https://via.placeholder.com",
        "https://*.akamaihd.net",
        "https://*.fastly.steamstatic.com",
        "https://*.cloudflare.steamstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.steampowered.com",
        "https://steamcommunity.com",
        "https://community.fastly.steamstatic.com"
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Применяем rate limiting только к API маршрутам, не к статическим файлам
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  app.use('/api', apiLimiter); // Более мягкий лимитер для API
  app.use('/test-', staticLimiter); // Очень мягкий лимитер для тестовых страниц
  
  // Middleware для логирования rate limit событий
  app.use((req, res, next) => {
    const remaining = res.getHeader('X-RateLimit-Remaining');
    const limit = res.getHeader('X-RateLimit-Limit');
    const reset = res.getHeader('X-RateLimit-Reset');
    
    if (remaining !== undefined && limit !== undefined) {
      const remainingNum = parseInt(remaining as string);
      const limitNum = parseInt(limit as string);
      const usagePercent = ((limitNum - remainingNum) / limitNum) * 100;
      
      if (usagePercent > 80) {
        console.log(`⚠️ Rate limit warning: ${usagePercent.toFixed(1)}% used (${remaining}/${limit}) for ${req.ip}`);
      }
    }
    
    next();
  });
  
  console.log('🔒 Rate limiting enabled');
} else {
  console.log('⚠️ Rate limiting disabled for development');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Настройка Passport
app.use(passport.initialize());

// Настройка Steam Strategy
passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:3000/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:3000',
  apiKey: process.env.STEAM_API_KEY || ''
}, (identifier: string, profile: any, done: any) => {
  return done(null, profile);
}));

// Сериализация пользователя (для Passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Десериализация пользователя (для Passport)
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// ==================== БАЗОВЫЕ МАРШРУТЫ ====================

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CS2 Trading Platform API',
    version: '1.0.0',
    status: 'running',
    env: {
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV,
      steamApiKey: process.env.STEAM_API_KEY ? 'Configured' : 'Not configured',
      jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured'
    }
  });
});

// Тестовый маршрут для проверки
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      steamApiKey: process.env.STEAM_API_KEY ? 'Configured' : 'Not configured',
      steamReturnUrl: process.env.STEAM_RETURN_URL,
      steamRealm: process.env.STEAM_REALM
    }
  });
});

// ==================== ТЕСТОВЫЕ СТРАНИЦЫ ====================

// Тестовые страницы
app.get('/test-auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-auth.html'));
});



app.get('/test-images', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-images.html'));
});

app.get('/test-trading', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-trading.html'));
});

app.get('/test-bots', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-bots.html'));
});

// ==================== АУТЕНТИФИКАЦИЯ ====================

// Steam аутентификация
app.get('/auth/steam', AuthController.steamAuth);
app.get('/auth/steam/return', AuthController.steamCallback);

// Аутентификация
app.post('/auth/logout', AuthController.logout);
app.get('/auth/check', AuthController.checkAuth);

// ==================== ПОЛЬЗОВАТЕЛИ ====================

// Получение списка пользователей
app.get('/api/users', UserController.getUsers);

// Статистика пользователей
app.get('/api/users/stats', UserController.getUserStats);

// Поиск пользователя по Steam ID
app.get('/api/users/steam/:steamId', UserController.getUserBySteamId);

// Профиль текущего пользователя
app.get('/api/users/profile', authenticateToken, UserController.getCurrentUser);

// Обновление профиля пользователя
app.put('/api/users/profile', authenticateToken, UserController.updateUserProfile);

// ==================== ПРЕДМЕТЫ И ИНВЕНТАРЬ ====================

// Предметы
app.get('/api/items', ItemController.getItems);
app.get('/api/items/stats', ItemController.getItemsStats);
app.get('/api/items/:id', ItemController.getItem);
app.get('/api/items/steam/:steamId', ItemController.getItemBySteamId);

// Инвентарь
app.get('/api/inventory/user', authenticateToken, ItemController.getCurrentUserInventory);
app.get('/api/inventory/:steamId', authenticateToken, ItemController.getUserInventory);
app.get('/api/inventory', ItemController.getBotInventory);

// Админ управление предметами
app.put('/api/items/:id/price', authenticateToken, ItemController.updateItemPrice);
app.put('/api/items/:id/quantity', authenticateToken, ItemController.updateItemQuantity);

// ==================== ТРЕЙДЫ ====================

app.post('/api/trades/calculate', authenticateToken, TradeController.calculateTrade);
app.post('/api/trades', authenticateToken, TradeController.createTrade);
app.get('/api/trades', authenticateToken, TradeController.getUserTrades);
app.get('/api/trades/:id', authenticateToken, TradeController.getTrade);
app.put('/api/trades/:id/cancel', authenticateToken, TradeController.cancelTrade);
app.put('/api/trades/:id/process', authenticateToken, TradeController.processTrade);
app.put('/api/trades/:id/complete', authenticateToken, TradeController.completeTrade);

// ==================== ТРАНЗАКЦИИ ====================

app.post('/api/transactions/deposit', authenticateToken, TransactionController.createDeposit);
app.post('/api/transactions/withdrawal', authenticateToken, TransactionController.createWithdrawal);
app.get('/api/transactions', authenticateToken, TransactionController.getUserTransactions);
app.get('/api/transactions/balance', authenticateToken, TransactionController.getUserBalance);
app.put('/api/transactions/:transactionId/complete', authenticateToken, TransactionController.completeTransaction);
app.put('/api/transactions/:transactionId/cancel', authenticateToken, TransactionController.cancelTransaction);
app.get('/api/transactions/trade/:tradeId', authenticateToken, TransactionController.getTransactionsByTrade);

// ==================== БОТЫ ====================

// Bot statistics and status (должны быть перед /:id)
app.get('/api/bots/stats', BotController.getBotStats);
app.get('/api/bots/health', BotController.getBotHealth);
app.get('/api/bots/sync/status', BotController.getSyncStatus);

// Bot routes
app.get('/api/bots', BotController.getAllBots);
app.get('/api/bots/:id', BotController.getBotById);
app.get('/api/bots/:botId/inventory', BotController.getBotInventory);
app.post('/api/bots', BotController.createBot);
app.post('/api/bots/create-test', BotController.createBot); // Алиас для создания тестового бота
app.put('/api/bots/:id', BotController.updateBot);
app.delete('/api/bots/:id', BotController.deleteBot);

// Bot authentication
app.post('/api/bots/:botId/login', BotController.loginBot);

// Bot synchronization
app.post('/api/bots/:botId/sync', BotController.syncBotInventory);
app.post('/api/bots/sync/all', BotController.syncAllBots);
app.post('/api/bots/:botId/sync/force', BotController.forceSyncBot);

// Trade processing
app.post('/api/bots/trades/process', BotController.processIncomingTrades);

// Sync service management
app.post('/api/bots/sync/start', BotController.startSync);
app.post('/api/bots/sync/stop', BotController.stopSync);

// ==================== ТЕСТИРОВАНИЕ ====================

// ==================== АДМИН ПАНЕЛЬ ====================

app.get('/admin', (req, res) => {
  res.json({ message: 'Admin Panel - Coming soon' });
});

// ==================== ОБРАБОТКА ОШИБОК ====================

// Обработка ошибок 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Глобальный обработчик ошибок
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// ==================== ЗАПУСК СЕРВЕРА ====================

// Экспортируем app для тестов
export { app };

const startServer = async () => {
  try {
    // Подключаемся к базе данных
    await connectDatabase();
    
    // Запускаем сервис синхронизации ботов только если не в тестах
    if (process.env.DISABLE_BOT_SYNC !== 'true') {
      console.log('🤖 Starting bot sync service...');
      botSyncService.startAutoSync({
        syncIntervalMs: 5 * 60 * 1000, // 5 минут
        tradeProcessingIntervalMs: 2 * 60 * 1000, // 2 минуты
        cleanupIntervalMs: 10 * 60 * 1000 // 10 минут
      });
    } else {
      console.log('🤖 Bot sync service disabled for tests');
    }
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🎮 Steam API: ${process.env.STEAM_API_KEY ? 'Configured' : 'Not configured'}`);
      console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
      console.log(`🤖 Bot Sync Service: ${process.env.DISABLE_BOT_SYNC === 'true' ? 'Disabled' : 'Started'}`);
      console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`🧪 Test pages: http://localhost:${PORT}/test-auth, /test-trading, /test-bots`);
      console.log(`🎮 Steam auth: http://localhost:${PORT}/auth/steam`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();
