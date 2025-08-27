# CS2 Trading Platform Backend

Бэкенд для платформы торговли игровыми предметами CS2 и других игр.

## 🚀 Возможности

- **Steam аутентификация** - вход через Steam аккаунт с JWT токенами
- **Управление пользователями** - профили, баланс, реферальная система
- **Торговля предметами** - покупка и продажа скинов через Steam Trade
- **Управление ботами** - автоматизация торговых операций с синхронизацией инвентаря
- **Система транзакций** - пополнение и вывод средств
- **Инвентарь** - синхронизация с Steam инвентарем пользователей и ботов
- **Тестовые страницы** - для отладки и тестирования функциональности
- **Rate Limiting** - защита от DDoS атак
- **Логирование** - детальное логирование всех операций

## 🛠 Технологии

- **Node.js** - среда выполнения
- **Express.js** - веб-фреймворк
- **TypeScript** - типизированный JavaScript
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **Passport.js** - аутентификация через Steam
- **JWT** - токены для авторизации
- **Steam API** - интеграция со Steam
- **steam-tradeoffer-manager** - управление торговыми предложениями
- **steam-user** - работа с Steam аккаунтами
- **Jest** - тестирование

## 📋 Требования

- Node.js 18+
- MongoDB 5+
- Steam API Key
- Steam аккаунты для ботов

## 🔧 Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd backend
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp env.example .env
```

Отредактируйте `.env` файл:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cs2_trading

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Steam API Configuration
STEAM_API_KEY=your-steam-api-key
STEAM_RETURN_URL=http://localhost:3000/auth/steam/return
STEAM_REALM=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=300
STATIC_RATE_LIMIT_WINDOW_MS=60000
STATIC_RATE_LIMIT_MAX_REQUESTS=1000

# Bot Sync Service
DISABLE_BOT_SYNC=false
DISABLE_RATE_LIMIT=false
```

4. **Запустите сервер**
```bash
# Разработка
npm run dev

# Тестовый режим
npm run dev:test

# Продакшн
npm run build
npm start
```

## 📊 Структура проекта

```
src/
├── config/          # Конфигурации
│   └── database.ts  # Настройки базы данных
├── controllers/     # Контроллеры API
│   ├── AuthController.ts    # Аутентификация
│   ├── UserController.ts    # Управление пользователями
│   ├── ItemController.ts    # Управление предметами
│   ├── TradeController.ts   # Торговые операции
│   ├── TransactionController.ts # Транзакции
│   └── BotController.ts     # Управление ботами
├── middleware/      # Middleware
│   └── auth.ts      # JWT аутентификация
├── models/          # Модели MongoDB
│   ├── User.ts      # Пользователи
│   ├── Item.ts      # Предметы
│   ├── Trade.ts     # Торговые операции
│   ├── Transaction.ts # Транзакции
│   └── Bot.ts       # Торговые боты
├── services/        # Бизнес-логика
│   ├── SteamService.ts           # Работа со Steam API
│   ├── BotService.ts             # Управление ботами
│   ├── BotSyncService.ts         # Синхронизация ботов
│   ├── ItemSyncService.ts        # Синхронизация предметов
│   ├── TradeService.ts           # Торговая логика
│   ├── TransactionService.ts     # Транзакции
│   └── SteamTradeManagerService.ts # Steam Trade Manager
├── types/           # TypeScript типы
│   ├── index.ts
│   ├── express.d.ts
│   ├── steam-types.d.ts
│   ├── steam-user.d.ts
│   ├── steamcommunity.d.ts
│   └── steam-tradeoffer-manager.d.ts
├── utils/           # Утилиты
│   └── logger.ts    # Логирование
├── scripts/         # Скрипты
│   └── seedItems.ts # Заполнение предметов
├── index.ts         # Основной файл сервера
└── index-test.ts    # Тестовый сервер
```

## 🔐 Аутентификация

### Steam OAuth

1. **Получение Steam API Key**
   - Зайдите на https://steamcommunity.com/dev/apikey
   - Создайте новый API ключ

2. **Настройка callback URL**
   - В Steam API настройте домен: `localhost` (для разработки)
   - Callback URL: `http://localhost:3000/auth/steam/return`

### JWT Токены

- Токены генерируются автоматически после успешной Steam аутентификации
- Срок действия: 7 дней
- Передаются в заголовке: `Authorization: Bearer <token>`

## 📈 API Endpoints

### Базовые маршруты
- `GET /` - Информация о API
- `GET /test` - Тестовый endpoint

### Тестовые страницы
- `GET /test-auth` - Тест аутентификации
- `GET /test-images` - Тест изображений
- `GET /test-trading` - Тест торговли
- `GET /test-bots` - Тест ботов

### Аутентификация
- `GET /auth/steam` - Инициация Steam аутентификации
- `GET /auth/steam/return` - Callback после Steam аутентификации
- `POST /auth/logout` - Выход из системы
- `GET /auth/check` - Проверка статуса аутентификации

### Пользователи
- `GET /api/users` - Список пользователей
- `GET /api/users/stats` - Статистика пользователей
- `GET /api/users/steam/:steamId` - Поиск по Steam ID
- `GET /api/users/profile` - Профиль текущего пользователя
- `PUT /api/users/profile` - Обновление профиля

### Предметы и инвентарь
- `GET /api/items` - Список предметов
- `GET /api/items/stats` - Статистика предметов
- `GET /api/items/:id` - Информация о предмете
- `GET /api/items/steam/:steamId` - Предмет по Steam ID
- `GET /api/inventory/user` - Инвентарь текущего пользователя
- `GET /api/inventory/:steamId` - Инвентарь пользователя
- `GET /api/inventory` - Инвентарь ботов
- `PUT /api/items/:id/price` - Обновление цены (админ)
- `PUT /api/items/:id/quantity` - Обновление количества (админ)

### Торговля
- `POST /api/trades/calculate` - Расчет стоимости сделки
- `POST /api/trades` - Создание сделки
- `GET /api/trades` - История сделок пользователя
- `GET /api/trades/:id` - Информация о сделке
- `PUT /api/trades/:id/cancel` - Отмена сделки
- `PUT /api/trades/:id/process` - Обработка сделки
- `PUT /api/trades/:id/complete` - Завершение сделки

### Транзакции
- `POST /api/transactions/deposit` - Создание депозита
- `POST /api/transactions/withdrawal` - Создание вывода
- `GET /api/transactions` - История транзакций пользователя
- `GET /api/transactions/balance` - Баланс пользователя
- `PUT /api/transactions/:transactionId/complete` - Завершение транзакции
- `PUT /api/transactions/:transactionId/cancel` - Отмена транзакции
- `GET /api/transactions/trade/:tradeId` - Транзакции по сделке

### Боты
- `GET /api/bots/stats` - Статистика ботов
- `GET /api/bots/health` - Состояние ботов
- `GET /api/bots/sync/status` - Статус синхронизации
- `GET /api/bots` - Список всех ботов
- `GET /api/bots/:id` - Информация о боте
- `GET /api/bots/:botId/inventory` - Инвентарь бота
- `POST /api/bots` - Создание бота
- `POST /api/bots/create-test` - Создание тестового бота
- `PUT /api/bots/:id` - Обновление бота
- `DELETE /api/bots/:id` - Удаление бота
- `POST /api/bots/:botId/login` - Авторизация бота
- `POST /api/bots/:botId/sync` - Синхронизация инвентаря бота
- `POST /api/bots/sync/all` - Синхронизация всех ботов
- `POST /api/bots/:botId/sync/force` - Принудительная синхронизация
- `POST /api/bots/trades/process` - Обработка входящих сделок
- `POST /api/bots/sync/start` - Запуск сервиса синхронизации
- `POST /api/bots/sync/stop` - Остановка сервиса синхронизации

## 🗄 База данных

### Коллекции MongoDB

1. **users** - Пользователи
   - `steamId` - Steam ID пользователя
   - `steamProfile` - Профиль Steam (displayName, avatar)
   - `email` - Email (опционально)
   - `tradeUrl` - Steam Trade URL
   - `balance` - Баланс на платформе
   - `referralCode` - Реферальный код
   - `referredBy` - Кто пригласил
   - `referralEarnings` - Заработок с рефералов
   - `isVerified` - Верификация
   - `isBanned` - Бан
   - `role` - Роль (user, moderator, admin)

2. **items** - Предметы
   - `steamId` - Steam ID предмета
   - `marketName` - Название на рынке
   - `displayName` - Отображаемое название
   - `type` - Тип предмета
   - `rarity` - Редкость
   - `exterior` - Состояние (для ножей)
   - `image` - URL изображения
   - `game` - Игра (cs2, dota2, rust, other)
   - `steamPrice` - Цена в Steam
   - `ourPrice` - Наша цена
   - `currency` - Валюта
   - `isAvailable` - Доступность
   - `isTradeable` - Возможность торговли
   - `quantity` - Количество
   - `tags` - Теги
   - `category` - Категория
   - `itemCollection` - Коллекция
   - `tradeCount` - Количество сделок

3. **trades** - Торговые операции
   - `userId` - ID пользователя
   - `type` - Тип (buy, sell)
   - `items` - Массив предметов
   - `totalAmount` - Общая сумма
   - `status` - Статус (pending, processing, completed, failed, cancelled)
   - `steamTradeId` - ID сделки в Steam
   - `botId` - ID бота

4. **transactions** - Транзакции
   - `userId` - ID пользователя
   - `type` - Тип (deposit, withdrawal, purchase, sale, referral)
   - `amount` - Сумма
   - `currency` - Валюта
   - `status` - Статус (pending, completed, failed, cancelled)
   - `description` - Описание
   - `tradeId` - ID сделки (опционально)
   - `metadata` - Дополнительные данные

5. **bots** - Торговые боты
   - `steamId` - Steam ID бота
   - `displayName` - Имя бота
   - `avatar` - Аватар
   - `tradeUrl` - Trade URL
   - `isActive` - Активность
   - `isOnline` - Онлайн статус
   - `lastActivity` - Последняя активность
   - `steamUsername` - Логин Steam
   - `steamPassword` - Пароль Steam
   - `steamGuardCode` - Steam Guard код
   - `syncInterval` - Интервал синхронизации
   - `lastSync` - Последняя синхронизация
   - `syncStatus` - Статус синхронизации
   - `inventory` - Инвентарь бота

## 🔒 Безопасность

- **Helmet** - защита заголовков с CSP
- **CORS** - настройка cross-origin запросов
- **Rate Limiting** - многоуровневое ограничение частоты запросов
- **JWT** - безопасная аутентификация
- **Input Validation** - валидация входных данных
- **MongoDB Injection Protection** - защита от инъекций

## 🧪 Тестирование

### Запуск тестов
```bash
npm test              # Все тесты
npm run test:watch    # Тесты в режиме наблюдения
npm run test:coverage # Тесты с покрытием
npm run test:unit     # Только unit тесты
npm run test:integration # Только integration тесты
```

### Структура тестов
```
tests/
├── setup.ts          # Настройка тестов
├── testSequencer.js  # Последовательность тестов
├── unit/             # Unit тесты
│   ├── middleware/
│   ├── models/
│   └── services/
└── integration/      # Integration тесты
    └── api/
```

## 🚀 Деплой

### Environment Variables для продакшн
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
STEAM_API_KEY=your-steam-api-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Скрипты
```bash
npm run dev      # Запуск в режиме разработки
npm run dev:test # Запуск тестового сервера
npm run build    # Сборка TypeScript
npm run start    # Запуск в продакшн режиме
npm run seed:items # Заполнение предметов
npm run seed:bots  # Добавление тестовых ботов
```

## 📝 TODO

- [x] Реализовать Steam аутентификацию
- [x] Создать модели данных
- [x] Реализовать API endpoints
- [x] Добавить управление ботами
- [x] Реализовать синхронизацию инвентаря
- [x] Добавить систему транзакций
- [x] Создать тестовые страницы
- [x] Настроить rate limiting
- [x] Добавить логирование
- [ ] Создать админ панель
- [ ] Добавить WebSocket для real-time уведомлений
- [ ] Интеграция с реальными криптоплатежами
- [ ] Система уведомлений
- [ ] Мониторинг и метрики
- [ ] Docker контейнеризация

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

MIT License
