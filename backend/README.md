# CS2 Trading Platform Backend

Бэкенд для платформы торговли игровыми предметами CS2 и других игр.

## 🚀 Возможности

- **Steam аутентификация** - вход через Steam аккаунт
- **Управление пользователями** - регистрация, профили, верификация
- **Торговля предметами** - покупка и продажа скинов
- **Криптоплатежи** - пополнение и вывод средств через криптовалюты
- **Реферальная система** - приглашение друзей и получение бонусов
- **Управление ботами** - автоматизация торговых операций
- **Админ панель** - управление платформой
- **История транзакций** - полный учет всех операций

## 🛠 Технологии

- **Node.js** - среда выполнения
- **Express.js** - веб-фреймворк
- **TypeScript** - типизированный JavaScript
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **Passport.js** - аутентификация
- **JWT** - токены для авторизации
- **Steam API** - интеграция со Steam

## 📋 Требования

- Node.js 18+
- MongoDB 5+
- Steam API Key

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

# Crypto Payment Configuration
CRYPTO_PAYMENT_API_KEY=your-crypto-payment-api-key
CRYPTO_PAYMENT_SECRET=your-crypto-payment-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin Panel
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Запустите сервер**
```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## 📊 Структура проекта

```
src/
├── config/          # Конфигурации
│   └── database.ts  # Настройки базы данных
├── controllers/     # Контроллеры
│   └── AuthController.ts
├── middleware/      # Middleware
│   └── auth.ts      # Аутентификация
├── models/          # Модели MongoDB
│   ├── User.ts
│   ├── Transaction.ts
│   ├── Item.ts
│   ├── Trade.ts
│   └── Bot.ts
├── routes/          # Маршруты (будут добавлены)
├── services/        # Бизнес-логика
│   ├── SteamService.ts
│   └── CryptoPaymentService.ts
├── types/           # TypeScript типы
│   └── index.ts
├── utils/           # Утилиты
└── index.ts         # Точка входа
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

### Аутентификация
- `GET /auth/steam` - Инициация Steam аутентификации
- `GET /auth/steam/return` - Callback после Steam аутентификации
- `GET /auth/profile` - Получение профиля пользователя
- `PUT /auth/profile` - Обновление профиля
- `POST /auth/logout` - Выход из системы
- `GET /auth/check` - Проверка статуса аутентификации

### Пользователи (Coming Soon)
- `GET /api/users` - Список пользователей
- `GET /api/users/:id` - Информация о пользователе
- `PUT /api/users/:id` - Обновление пользователя

### Предметы (Coming Soon)
- `GET /api/items` - Список предметов
- `GET /api/items/:id` - Информация о предмете
- `POST /api/items` - Создание предмета
- `PUT /api/items/:id` - Обновление предмета

### Торговля (Coming Soon)
- `GET /api/trades` - История торгов
- `POST /api/trades/buy` - Покупка предмета
- `POST /api/trades/sell` - Продажа предмета
- `GET /api/trades/:id` - Информация о сделке

### Платежи (Coming Soon)
- `POST /api/payments/deposit` - Пополнение баланса
- `POST /api/payments/withdraw` - Вывод средств
- `GET /api/payments/history` - История платежей

### Боты (Coming Soon)
- `GET /api/bots` - Список ботов
- `GET /api/bots/:id` - Информация о боте
- `POST /api/bots` - Создание бота
- `PUT /api/bots/:id` - Обновление бота

### Админ панель (Coming Soon)
- `GET /admin/dashboard` - Статистика
- `GET /admin/users` - Управление пользователями
- `GET /admin/trades` - Управление сделками
- `GET /admin/bots` - Управление ботами

## 🗄 База данных

### Коллекции MongoDB

1. **users** - Пользователи
   - steamId, steamProfile, email, tradeUrl
   - balance, referralCode, referralEarnings
   - isVerified, isBanned, role

2. **transactions** - Транзакции
   - userId, type, amount, currency
   - status, description, metadata

3. **items** - Предметы
   - name, marketName, type, rarity
   - price, steamPrice, isAvailable
   - steamId, game

4. **trades** - Торговые операции
   - userId, type, items, totalAmount
   - status, steamTradeId, botId

5. **bots** - Торговые боты
   - steamId, displayName, tradeUrl
   - isActive, isOnline, inventory

## 🔒 Безопасность

- **Helmet** - защита заголовков
- **CORS** - настройка cross-origin запросов
- **Rate Limiting** - ограничение частоты запросов
- **JWT** - безопасная аутентификация
- **Input Validation** - валидация входных данных
- **SQL Injection Protection** - защита от инъекций (MongoDB)

## 🧪 Разработка

### Скрипты
```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка TypeScript
npm run start    # Запуск в продакшн режиме
```

### Логирование
- Morgan для HTTP запросов
- Console.log для ошибок и важных событий
- Структурированные логи в продакшн

### Обработка ошибок
- Глобальный обработчик ошибок
- Graceful shutdown
- Валидация входных данных

## 🚀 Деплой

### Docker (Coming Soon)
```bash
docker build -t cs2-trading-backend .
docker run -p 3000:3000 cs2-trading-backend
```

### Environment Variables
- `NODE_ENV=production`
- `MONGODB_URI` - продакшн база данных
- `JWT_SECRET` - секретный ключ
- `STEAM_API_KEY` - Steam API ключ

## 📝 TODO

- [ ] Реализовать все API endpoints
- [ ] Добавить валидацию входных данных
- [ ] Создать админ панель
- [ ] Добавить тесты
- [ ] Настроить Docker
- [ ] Добавить WebSocket для real-time уведомлений
- [ ] Интеграция с реальными криптоплатежами
- [ ] Система уведомлений
- [ ] Логирование в файлы
- [ ] Мониторинг и метрики

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

MIT License
