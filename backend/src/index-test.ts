import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from './middleware/auth';
import { logger } from './utils/logger';

// Импортируем контроллеры
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { TradeController } from './controllers/TradeController';
import { TransactionController } from './controllers/TransactionController';
import { BotController } from './controllers/BotController';
import { ItemController } from './controllers/ItemController';

// Создаем Express приложение
const app = express();

// Настройка middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов (только для не-API запросов в тестовом режиме)
app.use((req, res, next) => {
  // Логируем только не-API запросы в тестовом режиме
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/auth/')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Статические файлы
app.use('/public', express.static('public'));

// Тестовые страницы
app.get('/test', (req, res) => {
  res.json({
    message: 'CS2 Trading Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/test-auth', (req, res) => {
  res.sendFile('test-auth.html', { root: './public' });
});

app.get('/test-trading', (req, res) => {
  res.sendFile('test-trading.html', { root: './public' });
});

app.get('/test-bots', (req, res) => {
  res.sendFile('test-bots.html', { root: './public' });
});

app.get('/test-images', (req, res) => {
  res.sendFile('test-images.html', { root: './public' });
});

// API маршруты
// Steam аутентификация
app.get('/auth/steam', AuthController.steamAuth);
app.get('/auth/steam/return', AuthController.steamCallback);

// Аутентификация
app.post('/auth/logout', AuthController.logout);
app.get('/auth/check', AuthController.checkAuth);

// Пользователи
app.get('/api/users', UserController.getUsers);
app.get('/api/users/stats', UserController.getUserStats);
app.get('/api/users/steam/:steamId', UserController.getUserBySteamId);
app.get('/api/users/profile', authenticateToken, UserController.getCurrentUser);
app.put('/api/users/profile', authenticateToken, UserController.updateUserProfile);

// Предметы
app.get('/api/items', ItemController.getItems);
app.get('/api/items/stats', ItemController.getItemsStats);
app.get('/api/items/:id', ItemController.getItem);
app.get('/api/items/steam/:steamId', ItemController.getItemBySteamId);
app.get('/api/inventory/user', authenticateToken, ItemController.getCurrentUserInventory);
app.get('/api/inventory/:steamId', authenticateToken, ItemController.getUserInventory);
app.get('/api/inventory', ItemController.getBotInventory);
app.put('/api/items/:id/price', authenticateToken, ItemController.updateItemPrice);
app.put('/api/items/:id/quantity', authenticateToken, ItemController.updateItemQuantity);

// Трейды
app.post('/api/trades/calculate', authenticateToken, TradeController.calculateTrade);
app.post('/api/trades', authenticateToken, TradeController.createTrade);
app.get('/api/trades', authenticateToken, TradeController.getUserTrades);
app.get('/api/trades/:id', authenticateToken, TradeController.getTrade);
app.put('/api/trades/:id/cancel', authenticateToken, TradeController.cancelTrade);
app.put('/api/trades/:id/process', authenticateToken, TradeController.processTrade);
app.put('/api/trades/:id/complete', authenticateToken, TradeController.completeTrade);

// Транзакции
app.post('/api/transactions/deposit', authenticateToken, TransactionController.createDeposit);
app.post('/api/transactions/withdrawal', authenticateToken, TransactionController.createWithdrawal);
app.get('/api/transactions', authenticateToken, TransactionController.getUserTransactions);
app.get('/api/transactions/balance', authenticateToken, TransactionController.getUserBalance);
app.put('/api/transactions/:transactionId/complete', authenticateToken, TransactionController.completeTransaction);
app.put('/api/transactions/:transactionId/cancel', authenticateToken, TransactionController.cancelTransaction);
app.get('/api/transactions/trade/:tradeId', authenticateToken, TransactionController.getTransactionsByTrade);

// Боты
app.get('/api/bots/stats', BotController.getBotStats);
app.get('/api/bots/health', BotController.getBotHealth);
app.get('/api/bots/sync/status', BotController.getSyncStatus);
app.get('/api/bots', BotController.getAllBots);
app.get('/api/bots/:id', BotController.getBotById);
app.get('/api/bots/:botId/inventory', BotController.getBotInventory);
app.get('/api/bots/inventory/all', BotController.getAllBotsInventory);
app.post('/api/bots', BotController.createBot);
app.post('/api/bots/:id/login', BotController.loginBot);
app.post('/api/bots/sync/all', BotController.forceSyncBot);

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('❌ Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate key error',
      details: 'A record with this information already exists'
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

export { app };
