// Глобальные переменные
let authToken = null;
let currentUser = null;

// Утилиты
function getAuthToken() {
    const token = localStorage.getItem('jwt_token');
    console.log('🔍 Getting auth token:', token ? 'token exists' : 'token not found');
    return token;
}

function setAuthToken(token) {
    console.log('💾 Setting auth token:', token ? 'token exists' : 'token is null/undefined');
    localStorage.setItem('jwt_token', token);
    authToken = token;
    console.log('✅ Token saved to localStorage and authToken variable');
}

function removeAuthToken() {
    localStorage.removeItem('jwt_token');
    authToken = null;
    currentUser = null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showResponse(data) {
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = JSON.stringify(data, null, 2);
    responseDiv.style.display = 'block';
}

function updateAuthStatus(status, message) {
    const authStatus = document.getElementById('auth-status');
    authStatus.className = `status ${status}`;
    authStatus.innerHTML = message;
}

function updateBalance(balance) {
    const balanceDisplay = document.getElementById('balance-display');
    const balanceAmount = document.getElementById('balance-amount');
    balanceAmount.textContent = balance.toFixed(2);
    balanceDisplay.style.display = 'block';
}

// API функции
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    try {
        // Не добавляем /api к роутам, которые уже начинаются с /auth
        const url = endpoint.startsWith('/auth') ? endpoint : `/api${endpoint}`;
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            // Если сервер вернул детали ошибки, включаем их в сообщение
            if (data.details) {
                throw new Error(JSON.stringify({
                    error: data.error || `HTTP ${response.status}`,
                    message: data.message,
                    details: data.details
                }));
            } else {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Авторизация
async function checkAuthStatus() {
    const token = getAuthToken();
    console.log('Checking auth status, token:', token ? 'exists' : 'not found');
    
    if (!token) {
        updateAuthStatus('warning', 'Не авторизован. Войдите через Steam для тестирования функций.');
        return false;
    }

    try {
        console.log('Making API call to /auth/check');
        const data = await apiCall('/auth/check');
        console.log('Auth check response:', data);
        currentUser = data.data.user;
        updateAuthStatus('success', `Авторизован как: ${currentUser.displayName} (${currentUser.steamId})`);
        if (currentUser.balance !== undefined) {
            updateBalance(currentUser.balance);
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        
        // Проверяем тип ошибки - удаляем токен только при 401/403 ошибках
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
            updateAuthStatus('error', 'Токен недействителен. Попробуйте войти снова.');
            removeAuthToken();
        } else {
            updateAuthStatus('warning', 'Ошибка проверки авторизации. Токен сохранен.');
        }
        return false;
    }
}

function loginWithSteam() {
    window.location.href = '/auth/steam';
}

function logout() {
    removeAuthToken();
    updateAuthStatus('info', 'Вы вышли из системы');
    document.getElementById('balance-display').style.display = 'none';
}

// Обработка авторизации из URL
function handleAuthFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const user = urlParams.get('user');

    console.log('🔍 handleAuthFromUrl - URL params:', { 
        token: token ? 'exists' : 'not found', 
        success, 
        user: user ? 'exists' : 'not found',
        currentUrl: window.location.href
    });

    if (token && success === 'true') {
        console.log('✅ Processing auth from URL');
        setAuthToken(token);
        console.log('💾 Token saved to localStorage');
        
        if (user) {
            try {
                currentUser = JSON.parse(decodeURIComponent(user));
                console.log('👤 User data parsed:', currentUser);
                updateAuthStatus('success', `Авторизован как: ${currentUser.displayName} (${currentUser.steamId})`);
                updateBalance(currentUser.balance || 0);
            } catch (e) {
                console.error('❌ Error parsing user data:', e);
            }
        }
        
        // Очищаем URL
        window.history.pushState({}, document.title, window.location.pathname);
        console.log('🧹 URL cleaned, token saved');
        return true; // Указываем, что авторизация была обработана
    } else {
        console.log('❌ No auth data in URL or success !== true');
        return false; // Указываем, что авторизация не была обработана
    }
}

// Транзакции
async function createDeposit() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const currency = document.getElementById('deposit-currency').value;
    const cryptoAddress = document.getElementById('deposit-crypto-address').value;

    if (!amount || amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }

    try {
        const data = await apiCall('/transactions/deposit', {
            method: 'POST',
            body: JSON.stringify({
                amount,
                currency,
                cryptoAddress: cryptoAddress || undefined,
                cryptoType: currency === 'CRYPTO' ? 'ETH' : undefined
            })
        });
        
        showResponse(data);
        alert('Транзакция пополнения создана!');
    } catch (error) {
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

async function createWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const currency = document.getElementById('withdrawal-currency').value;
    const cryptoAddress = document.getElementById('withdrawal-crypto-address').value;

    if (!amount || amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }

    if (currency === 'CRYPTO' && !cryptoAddress) {
        alert('Для криптовалюты необходимо указать адрес');
        return;
    }

    // Проверяем текущий баланс перед попыткой вывода
    try {
        const balanceData = await apiCall('/transactions/balance');
        const currentBalance = balanceData.data.balance;
        
        if (currentBalance < amount) {
            alert(`❌ Недостаточно средств!\n\nТекущий баланс: $${currentBalance.toFixed(2)}\nТребуется: $${amount.toFixed(2)}\nНедостает: $${(amount - currentBalance).toFixed(2)}`);
            return;
        }
    } catch (error) {
        console.error('Error checking balance:', error);
        // Продолжаем без проверки баланса, если не удалось его получить
    }

    try {
        const data = await apiCall('/transactions/withdrawal', {
            method: 'POST',
            body: JSON.stringify({
                amount,
                currency,
                cryptoAddress: cryptoAddress || undefined,
                cryptoType: currency === 'CRYPTO' ? 'ETH' : undefined
            })
        });
        
        showResponse(data);
        alert('Транзакция вывода создана!');
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибки недостаточного баланса
        if (error.message.includes('Insufficient balance')) {
            alert('❌ Недостаточно средств для вывода!\n\nПополните баланс перед выводом средств.');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function getTransactions() {
    try {
        const data = await apiCall('/transactions');
        showResponse(data);
        
        // Обновляем статистику
        const statsDiv = document.getElementById('transactions-stats');
        const transactions = data.data.transactions;
        const total = data.data.pagination.total;
        
        const stats = {
            total: total,
            deposits: transactions.filter(t => t.type === 'deposit').length,
            withdrawals: transactions.filter(t => t.type === 'withdrawal').length,
            purchases: transactions.filter(t => t.type === 'purchase').length,
            sales: transactions.filter(t => t.type === 'sale').length
        };
        
        statsDiv.innerHTML = `
            <strong>Всего транзакций:</strong> ${stats.total}<br>
            <strong>Пополнения:</strong> ${stats.deposits}<br>
            <strong>Выводы:</strong> ${stats.withdrawals}<br>
            <strong>Покупки:</strong> ${stats.purchases}<br>
            <strong>Продажи:</strong> ${stats.sales}
        `;
        statsDiv.className = 'status success';
    } catch (error) {
        showResponse({ error: error.message });
    }
}

async function getBalance() {
    try {
        const data = await apiCall('/transactions/balance');
        showResponse(data);
        updateBalance(data.data.balance);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

async function quickDeposit() {
    try {
        const data = await apiCall('/transactions/deposit', {
            method: 'POST',
            body: JSON.stringify({
                amount: 10,
                currency: 'USD'
            })
        });
        
        showResponse(data);
        alert('✅ Баланс пополнен на $10!');
        
        // Обновляем отображение баланса
        await getBalance();
    } catch (error) {
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

// Управление транзакциями
async function loadTransactions() {
    try {
        const data = await apiCall('/transactions?limit=20');
        showResponse(data);
        
        // Отображаем транзакции в виде карточек
        displayTransactions(data.data.transactions);
        
        // Обновляем статистику
        updateTransactionsStats(data.data.transactions, data.data.pagination.total);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    
    if (!container) {
        console.error('Container transactions-list not found');
        return;
    }
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="status info">Транзакций не найдено</div>';
        return;
    }
    
    const transactionsHtml = transactions.map(transaction => {
        const date = new Date(transaction.createdAt).toLocaleString('ru-RU');
        const amount = transaction.amount.toFixed(2);
        const isPositive = transaction.type === 'deposit' || transaction.type === 'referral';
        
        return `
            <div class="transaction-card" data-transaction-id="${transaction._id}">
                <div class="transaction-header">
                    <span class="transaction-type ${transaction.type}">${getTransactionTypeLabel(transaction.type)}</span>
                    <span class="transaction-status ${transaction.status}">${getTransactionStatusLabel(transaction.status)}</span>
                </div>
                <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : '-'}$${amount}
                </div>
                <div class="transaction-details">
                    <strong>ID:</strong> ${transaction._id}<br>
                    <strong>Дата:</strong> ${date}<br>
                    <strong>Валюта:</strong> ${transaction.currency}<br>
                    <strong>Описание:</strong> ${transaction.description}
                    ${transaction.tradeId ? `<br><strong>Трейд ID:</strong> <a href="#" onclick="showTradeDetails('${transaction.tradeId._id || transaction.tradeId}')" style="color: #007bff; text-decoration: underline;">${transaction.tradeId._id || transaction.tradeId}</a>` : ''}
                </div>
                ${transaction.status === 'pending' ? `
                    <div class="transaction-actions">
                        <button class="btn btn-success btn-sm complete-btn" data-transaction-id="${transaction._id}">
                            ✅ Завершить
                        </button>
                        <button class="btn btn-danger btn-sm cancel-btn" data-transaction-id="${transaction._id}">
                            ❌ Отменить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = transactionsHtml;
}

function getTransactionTypeLabel(type) {
    const labels = {
        'deposit': 'Пополнение',
        'withdrawal': 'Вывод',
        'purchase': 'Покупка',
        'sale': 'Продажа',
        'referral': 'Реферал'
    };
    return labels[type] || type;
}

function getTransactionStatusLabel(status) {
    const labels = {
        'pending': 'Ожидает',
        'completed': 'Завершена',
        'cancelled': 'Отменена',
        'failed': 'Ошибка'
    };
    return labels[status] || status;
}

function updateTransactionsStats(transactions, total) {
    const statsDiv = document.getElementById('transactions-stats');
    
    const stats = {
        total: total,
        deposits: transactions.filter(t => t.type === 'deposit').length,
        withdrawals: transactions.filter(t => t.type === 'withdrawal').length,
        purchases: transactions.filter(t => t.type === 'purchase').length,
        sales: transactions.filter(t => t.type === 'sale').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        completed: transactions.filter(t => t.status === 'completed').length
    };
    
    statsDiv.innerHTML = `
        <strong>Всего транзакций:</strong> ${stats.total}<br>
        <strong>Пополнения:</strong> ${stats.deposits}<br>
        <strong>Выводы:</strong> ${stats.withdrawals}<br>
        <strong>Покупки:</strong> ${stats.purchases}<br>
        <strong>Продажи:</strong> ${stats.sales}<br>
        <strong>Ожидают:</strong> ${stats.pending}<br>
        <strong>Завершены:</strong> ${stats.completed}
    `;
    statsDiv.className = 'status success';
}

async function completeTransaction(transactionId) {
    console.log('🔧 completeTransaction called with ID:', transactionId);
    
    if (!transactionId) {
        transactionId = document.getElementById('transaction-id').value;
        console.log('🔧 Using transaction ID from input:', transactionId);
    }
    
    if (!transactionId) {
        alert('Введите ID транзакции');
        return;
    }
    
    try {
        console.log('🔧 Making API call to complete transaction:', transactionId);
        const data = await apiCall(`/transactions/${transactionId}/complete`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('✅ Транзакция завершена!');
        
        // Обновляем отображение
        await loadTransactions();
        await getBalance();
    } catch (error) {
        console.error('❌ Error completing transaction:', error);
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

async function cancelTransaction(transactionId) {
    console.log('🔧 cancelTransaction called with ID:', transactionId);
    
    if (!transactionId) {
        transactionId = document.getElementById('transaction-id').value;
        console.log('🔧 Using transaction ID from input:', transactionId);
    }
    
    if (!transactionId) {
        alert('Введите ID транзакции');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите отменить эту транзакцию?')) {
        return;
    }
    
    try {
        console.log('🔧 Making API call to cancel transaction:', transactionId);
        const data = await apiCall(`/transactions/${transactionId}/cancel`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('❌ Транзакция отменена!');
        
        // Обновляем отображение
        await loadTransactions();
        await getBalance();
    } catch (error) {
        console.error('❌ Error cancelling transaction:', error);
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

async function cancelTrade(tradeId) {
    if (!confirm('Вы уверены, что хотите отменить этот трейд?')) {
        return;
    }
    
    try {
        const data = await apiCall(`/trades/${tradeId}/cancel`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('❌ Трейд отменен!');
        
        // Обновляем отображение
        await getTrades();
        await loadTradesManagement();
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибок отмены трейда
        if (error.message.includes('Trade cannot be cancelled')) {
            alert('❌ Трейд нельзя отменить!\n\nТолько ожидающие трейды можно отменить. Этот трейд уже в обработке или завершен.');
        } else if (error.message.includes('Trade not found')) {
            alert('❌ Трейд не найден!\n\nТрейд не существует или у вас нет прав для его отмены.');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Управление трейдами
async function loadTradesManagement() {
    try {
        const data = await apiCall('/trades?limit=20');
        showResponse(data);
        
        // Отображаем трейды для управления
        displayTradesManagement(data.data.trades);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

function displayTradesManagement(trades) {
    const container = document.getElementById('trades-management-list');
    
    if (!container) {
        console.error('Container trades-management-list not found');
        return;
    }
    
    if (!trades || trades.length === 0) {
        container.innerHTML = '<div class="status info">Трейдов не найдено</div>';
        return;
    }
    
    const tradesHtml = trades.map(trade => {
        const date = new Date(trade.createdAt).toLocaleString('ru-RU');
        const amount = trade.totalAmount.toFixed(2);
        const itemsCount = trade.items ? trade.items.length : 0;
        const typeLabel = trade.type === 'buy' ? 'Покупка' : 'Продажа';
        
        // Формируем список предметов
        const itemsList = trade.items.map(item => `
            <div class="trade-item">
                <span>${escapeHtml(item.itemName)}</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `).join('');
        
        return `
            <div class="transaction-card" data-trade-id="${trade._id}">
                <div class="transaction-header">
                    <span class="transaction-type ${trade.type}">${typeLabel}</span>
                    <span class="transaction-status ${trade.status}">${getTradeStatusLabel(trade.status)}</span>
                </div>
                <div class="transaction-amount">
                    $${amount}
                </div>
                <div class="transaction-details">
                    <strong>ID:</strong> ${trade._id}<br>
                    <strong>Дата:</strong> ${date}<br>
                    <strong>Предметов:</strong> ${itemsCount}<br>
                    <strong>Бот ID:</strong> ${trade.botId || 'Не назначен'}
                </div>
                <div class="trade-details">
                    <strong>Предметы в трейде:</strong>
                    <div class="trade-items-list">
                        ${itemsList}
                    </div>
                </div>
                ${trade.status === 'pending' ? `
                    <div class="trade-actions">
                        <button class="btn btn-success btn-sm process-trade-btn" data-trade-id="${trade._id}">
                            🔄 В обработку
                        </button>
                        <button class="btn btn-success btn-sm complete-trade-btn" data-trade-id="${trade._id}">
                            ✅ Завершить
                        </button>
                        <button class="btn btn-danger btn-sm cancel-trade-btn" data-trade-id="${trade._id}">
                            ❌ Отменить
                        </button>
                    </div>
                ` : trade.status === 'processing' ? `
                    <div class="trade-actions">
                        <button class="btn btn-success btn-sm complete-trade-btn" data-trade-id="${trade._id}">
                            ✅ Завершить
                        </button>
                        <button class="btn btn-danger btn-sm cancel-trade-btn" data-trade-id="${trade._id}">
                            ❌ Отменить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = tradesHtml;
}

async function processTrade(tradeId) {
    if (!confirm('Перевести трейд в обработку?')) {
        return;
    }
    
    try {
        const data = await apiCall(`/trades/${tradeId}/process`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('🔄 Трейд переведен в обработку!');
        
        // Обновляем отображение
        await loadTradesManagement();
        await getTrades();
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибок обработки трейда
        if (error.message.includes('Trade cannot be processed')) {
            alert('❌ Трейд нельзя обработать!\n\nТолько ожидающие трейды можно перевести в обработку. Этот трейд уже в обработке или завершен.');
        } else if (error.message.includes('Trade not found')) {
            alert('❌ Трейд не найден!\n\nТрейд не существует или у вас нет прав для его обработки.');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function completeTradeManagement(tradeId) {
    if (!confirm('Завершить трейд? Это приведет к:\n- Списанию/начислению баланса\n- Перемещению предметов\n- Созданию транзакции')) {
        return;
    }
    
    try {
        const data = await apiCall(`/trades/${tradeId}/complete`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('✅ Трейд завершен! Баланс и предметы обновлены.');
        
        // Обновляем отображение
        await loadTradesManagement();
        await getTrades();
        await getBalance();
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибок завершения трейда
        if (error.message.includes('Trade already completed')) {
            alert('❌ Трейд уже завершен!\n\nЭтот трейд уже был завершен и не может быть обработан повторно.');
        } else if (error.message.includes('Trade not found')) {
            alert('❌ Трейд не найден!\n\nТрейд не существует или у вас нет прав для его завершения.');
        } else if (error.message.includes('Insufficient balance')) {
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.details) {
                    alert(`❌ Недостаточно средств для завершения трейда!\n\nТребуется: $${errorData.details.requiredAmount}\nДоступно: $${errorData.details.currentBalance}\nНе хватает: $${errorData.details.shortfall}`);
                } else {
                    alert('❌ Недостаточно средств для завершения трейда. Пополните баланс.');
                }
            } catch {
                alert('❌ Недостаточно средств для завершения трейда. Пополните баланс.');
            }
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function cancelTradeManagement(tradeId) {
    if (!confirm('Отменить трейд? Это вернет все в исходное состояние.')) {
        return;
    }
    
    try {
        const data = await apiCall(`/trades/${tradeId}/cancel`, {
            method: 'PUT'
        });
        
        showResponse(data);
        alert('❌ Трейд отменен!');
        
        // Обновляем отображение
        await loadTradesManagement();
        await getTrades();
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибок отмены трейда
        if (error.message.includes('Trade cannot be cancelled')) {
            alert('❌ Трейд нельзя отменить!\n\nТолько ожидающие трейды можно отменить. Этот трейд уже в обработке или завершен.');
        } else if (error.message.includes('Trade not found')) {
            alert('❌ Трейд не найден!\n\nТрейд не существует или у вас нет прав для его отмены.');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Глобальные переменные для выбранных предметов
let selectedItems = [];
let availableItems = [];

// Функция для показа деталей трейда
async function showTradeDetails(tradeId) {
    try {
        const data = await apiCall(`/trades/${tradeId}`);
        if (data.success && data.data.trade) {
            const trade = data.data.trade;
            const itemsList = trade.items.map(item => 
                `• ${item.itemName} - $${item.price.toFixed(2)}`
            ).join('\n');
            
            alert(`📋 Детали трейда ${tradeId}\n\n` +
                  `Тип: ${trade.type === 'buy' ? 'Покупка' : 'Продажа'}\n` +
                  `Статус: ${getTradeStatusLabel(trade.status)}\n` +
                  `Общая сумма: $${trade.totalAmount.toFixed(2)}\n` +
                  `Дата: ${new Date(trade.createdAt).toLocaleString('ru-RU')}\n\n` +
                  `Предметы:\n${itemsList}`);
        } else {
            alert('Трейд не найден');
        }
    } catch (error) {
        alert('Ошибка при загрузке деталей трейда: ' + error.message);
    }
}

// Трейды
async function loadItems() {
    try {
        console.log('🔍 Loading items from bot inventory...');
        const data = await apiCall('/inventory?limit=50');
        console.log('📦 Bot inventory response:', data);
        
        // Проверяем разные возможные форматы ответа
        availableItems = data.data.items || data.data.inventory || [];
        console.log('📦 Available items count:', availableItems.length);
        
        if (availableItems.length === 0) {
            console.log('⚠️ No items found in bot inventory');
            showResponse({ 
                message: 'No items found in bot inventory. This might be because:',
                reasons: [
                    'No bots have been set up yet',
                    'No items have been added to bot inventories',
                    'All items are marked as unavailable'
                ],
                suggestion: 'Try adding some test items to bot inventories first'
            });
        }
        
        displayAvailableItems(availableItems);
    } catch (error) {
        console.error('❌ Error loading items:', error);
        showResponse({ error: error.message });
    }
}

function displayAvailableItems(items) {
    const container = document.getElementById('available-items');
    
    if (!container) {
        console.error('Container available-items not found');
        return;
    }
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="status info">Предметы не найдены</div>';
        return;
    }
    
    const itemsHtml = items.map(item => {
        const isSelected = selectedItems.some(selected => selected._id === item._id || selected.classid === item.classid);
        
        // Обрабатываем разные форматы данных
        const itemId = item._id || item.classid;
        const itemName = item.name || item.displayName || item.market_hash_name || 'Unknown Item';
        const imageUrl = item.imageUrl || item.icon_url || `https://community.fastly.steamstatic.com/economy/image/${item.icon_url}` || 'https://via.placeholder.com/60x60?text=No+Image';
        const price = item.price || item.ourPrice || item.estimatedPrice || 0;
        const rarity = item.rarity || 'Common';
        const quantity = item.quantity || 1;
        
        return `
            <div class="item-card ${isSelected ? 'selected' : ''}" data-item-id="${itemId}">
                <img src="${imageUrl}" alt="${itemName}" class="item-image" onerror="this.src='https://via.placeholder.com/60x60?text=Error'">
                <div class="item-info">
                    <div class="item-name">${escapeHtml(itemName)}</div>
                    <div class="item-price">$${price.toFixed(2)}</div>
                    <div class="item-rarity">${rarity} (${quantity} шт.)</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = itemsHtml;
    
    // Добавляем обработчики кликов
    container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            toggleItemSelection(itemId);
        });
    });
}

function toggleItemSelection(itemId) {
    const item = availableItems.find(item => (item._id === itemId) || (item.classid === itemId));
    if (!item) {
        console.error('❌ Item not found:', itemId);
        return;
    }
    
    const isSelected = selectedItems.some(selected => 
        (selected._id === itemId) || (selected.classid === itemId) ||
        (selected._id === item._id) || (selected.classid === item.classid)
    );
    
    if (isSelected) {
        // Убираем предмет из выбранных
        selectedItems = selectedItems.filter(selected => 
            (selected._id !== itemId) && (selected.classid !== itemId) &&
            (selected._id !== item._id) && (selected.classid !== item.classid)
        );
        console.log('🗑️ Removed item from selection:', itemId);
    } else {
        // Добавляем предмет в выбранные
        selectedItems.push(item);
        console.log('✅ Added item to selection:', itemId);
    }
    
    // Обновляем отображение
    displayAvailableItems(availableItems);
    displaySelectedItems();
    updateTradeSummary();
}

function displaySelectedItems() {
    const container = document.getElementById('selected-items-list');
    const tradeContainer = document.getElementById('trade-items-display');
    
    if (!container || !tradeContainer) {
        console.error('Selected items containers not found');
        return;
    }
    
    if (selectedItems.length === 0) {
        container.innerHTML = '<div class="status info">Предметы не выбраны</div>';
        tradeContainer.innerHTML = '<div class="status info">Сначала выберите предметы слева</div>';
        return;
    }
    
    const itemsHtml = selectedItems.map(item => {
        const itemId = item._id || item.classid;
        const itemName = item.name || item.displayName || item.market_hash_name || 'Unknown Item';
        const imageUrl = item.imageUrl || item.icon_url || `https://community.fastly.steamstatic.com/economy/image/${item.icon_url}` || 'https://via.placeholder.com/40x40?text=No+Image';
        const price = item.price || item.ourPrice || item.estimatedPrice || 0;
        
        return `
            <div class="selected-item">
                <div class="selected-item-info">
                    <img src="${imageUrl}" 
                         alt="${itemName}" 
                         class="item-image" 
                         style="width: 40px; height: 40px;"
                         onerror="this.src='https://via.placeholder.com/40x40?text=Error'">
                    <div>
                        <div class="item-name">${escapeHtml(itemName)}</div>
                        <div class="item-price">$${price.toFixed(2)}</div>
                    </div>
                </div>
                <button class="selected-item-remove" data-item-id="${itemId}">✕</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = itemsHtml;
    tradeContainer.innerHTML = itemsHtml;
    
    // Добавляем обработчики для кнопок удаления
    container.querySelectorAll('.selected-item-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-item-id');
            console.log('🔧 Remove item button clicked, item ID:', itemId);
            toggleItemSelection(itemId);
        });
    });
    
    tradeContainer.querySelectorAll('.selected-item-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-item-id');
            console.log('🔧 Remove item button clicked, item ID:', itemId);
            toggleItemSelection(itemId);
        });
    });
}

function updateTradeSummary() {
    const summaryDiv = document.getElementById('trade-summary');
    const totalAmountSpan = document.getElementById('total-amount');
    const createAmountInput = document.getElementById('create-trade-amount');
    
    if (!summaryDiv || !totalAmountSpan || !createAmountInput) {
        console.error('Trade summary elements not found');
        return;
    }
    
    if (selectedItems.length === 0) {
        summaryDiv.style.display = 'none';
        createAmountInput.value = '';
        return;
    }
    
    const totalAmount = selectedItems.reduce((sum, item) => {
        return sum + (item.price || item.ourPrice || item.estimatedPrice || 0);
    }, 0);
    
    totalAmountSpan.textContent = totalAmount.toFixed(2);
    createAmountInput.value = totalAmount.toFixed(2);
    summaryDiv.style.display = 'block';
}

async function calculateTrade() {
    if (selectedItems.length === 0) {
        alert('Выберите предметы для расчета');
        return;
    }

    const type = document.getElementById('trade-type').value;
    
    // Преобразуем выбранные предметы в формат для API
    const items = selectedItems.map(item => ({
        itemId: item._id || item.classid,
        itemName: item.name || item.displayName || item.market_hash_name,
        estimatedPrice: item.price || item.ourPrice || item.estimatedPrice || 0,
        steamId: item.steamId || item.classid
    }));

    try {
        const data = await apiCall('/trades/calculate', {
            method: 'POST',
            body: JSON.stringify({ type, items })
        });
        
        showResponse(data);
        
        // Показываем результат расчета
        const result = data.data;
        alert(`Расчет завершен!\nТип: ${result.type === 'buy' ? 'Покупка' : 'Продажа'}\nОбщая сумма: $${result.totalAmount.toFixed(2)}\nПредметов: ${result.items.length}`);
    } catch (error) {
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

async function createTrade() {
    if (selectedItems.length === 0) {
        alert('Выберите предметы для трейда');
        return;
    }

    const type = document.getElementById('create-trade-type').value;
    const totalAmount = parseFloat(document.getElementById('create-trade-amount').value);

    if (!totalAmount || totalAmount <= 0) {
        alert('Некорректная сумма');
        return;
    }

    try {
        // Преобразуем выбранные предметы в формат для API
        const items = selectedItems.map(item => ({
            itemId: item._id || item.classid,
            itemName: item.name || item.displayName || item.market_hash_name,
            price: item.price || item.ourPrice || item.estimatedPrice || 0,
            steamId: item.steamId || item.classid
        }));

        const data = await apiCall('/trades', {
            method: 'POST',
            body: JSON.stringify({ type, items, totalAmount })
        });
        
        showResponse(data);
        alert('Трейд создан успешно!');
        
        // Очищаем выбранные предметы после создания трейда
        selectedItems = [];
        displayAvailableItems(availableItems);
        displaySelectedItems();
        updateTradeSummary();
    } catch (error) {
        showResponse({ error: error.message });
        
        // Специальная обработка ошибки недостаточного баланса
        if (error.message.includes('Insufficient balance')) {
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.details) {
                    alert(`❌ Недостаточно средств!\n\nТребуется: $${errorData.details.requiredAmount}\nДоступно: $${errorData.details.currentBalance}\nНе хватает: $${errorData.details.shortfall}\n\nПополните баланс для продолжения.`);
                } else {
                    alert('❌ Недостаточно средств для создания трейда. Пополните баланс.');
                }
            } catch {
                alert('❌ Недостаточно средств для создания трейда. Пополните баланс.');
            }
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function getTrades() {
    try {
        const data = await apiCall('/trades');
        showResponse(data);
        
        // Отображаем трейды в виде карточек
        displayTrades(data.data.trades);
        
        // Обновляем статистику
        updateTradesStats(data.data.trades, data.data.pagination.total);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

function displayTrades(trades) {
    const container = document.getElementById('trades-stats');
    
    if (!container) {
        console.error('Container trades-stats not found');
        return;
    }
    
    if (!trades || trades.length === 0) {
        container.innerHTML = '<div class="status info">Трейдов не найдено</div>';
        return;
    }
    
    const tradesHtml = trades.map(trade => {
        const date = new Date(trade.createdAt).toLocaleString('ru-RU');
        const amount = trade.totalAmount.toFixed(2);
        const itemsCount = trade.items ? trade.items.length : 0;
        const typeLabel = trade.type === 'buy' ? 'Покупка' : 'Продажа';
        
        // Формируем список предметов
        const itemsList = trade.items.map(item => `
            <div class="trade-item">
                <span>${escapeHtml(item.itemName)}</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `).join('');
        
        return `
            <div class="transaction-card" data-trade-id="${trade._id}">
                <div class="transaction-header">
                    <span class="transaction-type ${trade.type}">${typeLabel}</span>
                    <span class="transaction-status ${trade.status}">${getTradeStatusLabel(trade.status)}</span>
                </div>
                <div class="transaction-amount">
                    $${amount}
                </div>
                <div class="transaction-details">
                    <strong>ID:</strong> ${trade._id}<br>
                    <strong>Дата:</strong> ${date}<br>
                    <strong>Предметов:</strong> ${itemsCount}<br>
                    <strong>Бот ID:</strong> ${trade.botId || 'Не назначен'}
                </div>
                <div class="trade-details">
                    <strong>Предметы в трейде:</strong>
                    <div class="trade-items-list">
                        ${itemsList}
                    </div>
                </div>
                ${trade.status === 'pending' ? `
                    <div class="transaction-actions">
                        <button class="btn btn-success btn-sm cancel-trade-btn" data-trade-id="${trade._id}">
                            ❌ Отменить трейд
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = tradesHtml;
}

function getTradeStatusLabel(status) {
    const labels = {
        'pending': 'Ожидает',
        'processing': 'В обработке',
        'completed': 'Завершен',
        'cancelled': 'Отменен',
        'failed': 'Ошибка'
    };
    return labels[status] || status;
}

function updateTradesStats(trades, total) {
    const statsDiv = document.getElementById('trades-stats');
    
    const stats = {
        total: total,
        pending: trades.filter(t => t.status === 'pending').length,
        processing: trades.filter(t => t.status === 'processing').length,
        completed: trades.filter(t => t.status === 'completed').length,
        buy: trades.filter(t => t.type === 'buy').length,
        sell: trades.filter(t => t.type === 'sell').length
    };
    
    statsDiv.innerHTML = `
        <strong>Всего трейдов:</strong> ${stats.total}<br>
        <strong>Ожидают:</strong> ${stats.pending}<br>
        <strong>В обработке:</strong> ${stats.processing}<br>
        <strong>Завершены:</strong> ${stats.completed}<br>
        <strong>Покупки:</strong> ${stats.buy}<br>
        <strong>Продажи:</strong> ${stats.sell}
    `;
    statsDiv.className = 'status success';
}

// Боты
async function getBots() {
    try {
        const data = await apiCall('/bots');
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

async function getBotInventory() {
    const botId = document.getElementById('bot-id').value;
    
    if (!botId) {
        alert('Введите ID бота');
        return;
    }

    try {
        const data = await apiCall(`/bots/${botId}/inventory`);
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

async function createSteamTrade() {
    const tradeId = document.getElementById('steam-trade-id').value;
    const botId = document.getElementById('steam-bot-id').value;
    
    if (!tradeId || !botId) {
        alert('Введите ID трейда и ID бота');
        return;
    }

    try {
        const data = await apiCall('/bots/trade', {
            method: 'POST',
            body: JSON.stringify({ tradeId, botId })
        });
        
        showResponse(data);
        alert('Steam трейд создан!');
    } catch (error) {
        showResponse({ error: error.message });
        alert('Ошибка: ' + error.message);
    }
}

async function checkTradeStatus() {
    const tradeId = document.getElementById('steam-trade-id').value;
    
    if (!tradeId) {
        alert('Введите ID трейда');
        return;
    }

    try {
        const data = await apiCall(`/bots/trade/${tradeId}/status`);
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message });
    }
}

// Автоматическая загрузка данных при загрузке страницы
async function autoLoadData() {
    console.log('🚀 Starting automatic data loading...');
    
    try {
        // Проверяем авторизацию
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
            console.log('✅ User is authenticated, loading data...');
            
            // Загружаем данные параллельно для ускорения
            const loadPromises = [
                getBalance().catch(err => console.log('⚠️ Failed to load balance:', err.message)),
                getTransactions().catch(err => console.log('⚠️ Failed to load transactions:', err.message)),
                getTrades().catch(err => console.log('⚠️ Failed to load trades:', err.message)),
                getBots().catch(err => console.log('⚠️ Failed to load bots:', err.message)),
                loadItems().catch(err => console.log('⚠️ Failed to load items:', err.message))
            ];
            
            // Ждем завершения всех загрузок
            await Promise.allSettled(loadPromises);
            
            console.log('✅ Automatic data loading completed');
        } else {
            console.log('⚠️ User not authenticated, skipping data loading');
        }
    } catch (error) {
        console.error('❌ Error during automatic data loading:', error);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 CS2 Trading Test Page loading...');
    
    // Обрабатываем авторизацию из URL
    const authProcessed = handleAuthFromUrl();
    
    // Если авторизация не была обработана из URL, проверяем localStorage
    if (!authProcessed) {
        const token = getAuthToken();
        if (token) {
            console.log('🔍 Token found in localStorage, checking auth status...');
            checkAuthStatus();
        } else {
            console.log('❌ No token found, showing login prompt');
            updateAuthStatus('warning', 'Не авторизован. Войдите через Steam для тестирования функций.');
        }
    } else {
        console.log('✅ Auth processed from URL, skipping localStorage check');
    }
    
    // Привязываем события к кнопкам
    document.getElementById('login-btn').addEventListener('click', loginWithSteam);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Транзакции
    document.getElementById('create-deposit-btn').addEventListener('click', createDeposit);
    document.getElementById('create-withdrawal-btn').addEventListener('click', createWithdrawal);
    document.getElementById('get-transactions-btn').addEventListener('click', getTransactions);
    document.getElementById('get-balance-btn').addEventListener('click', getBalance);
    document.getElementById('quick-deposit-btn').addEventListener('click', quickDeposit);
    
    // Управление транзакциями
    document.getElementById('load-transactions-btn').addEventListener('click', loadTransactions);
    document.getElementById('complete-transaction-btn').addEventListener('click', () => completeTransaction());
    document.getElementById('cancel-transaction-btn').addEventListener('click', () => cancelTransaction());
    
    // Управление трейдами
    document.getElementById('load-trades-management-btn').addEventListener('click', loadTradesManagement);
    document.getElementById('complete-trade-btn').addEventListener('click', () => completeTradeManagement());
    document.getElementById('process-trade-btn').addEventListener('click', () => processTrade());
    document.getElementById('cancel-trade-btn').addEventListener('click', () => cancelTradeManagement());
    
    // Делегирование событий для динамически созданных кнопок
    document.addEventListener('click', function(e) {
        console.log('🔍 Click event on:', e.target.className);
        
        // Кнопки завершения транзакций
        if (e.target.classList.contains('complete-btn')) {
            const transactionId = e.target.getAttribute('data-transaction-id');
            console.log('🔧 Complete button clicked, transaction ID:', transactionId);
            completeTransaction(transactionId);
        }
        
        // Кнопки отмены транзакций
        if (e.target.classList.contains('cancel-btn')) {
            const transactionId = e.target.getAttribute('data-transaction-id');
            console.log('🔧 Cancel button clicked, transaction ID:', transactionId);
            cancelTransaction(transactionId);
        }
        
        // Кнопки отмены трейдов
        if (e.target.classList.contains('cancel-trade-btn')) {
            const tradeId = e.target.getAttribute('data-trade-id');
            console.log('🔧 Cancel trade button clicked, trade ID:', tradeId);
            cancelTrade(tradeId);
        }
        
        // Кнопки управления трейдами
        if (e.target.classList.contains('process-trade-btn')) {
            const tradeId = e.target.getAttribute('data-trade-id');
            console.log('🔧 Process trade button clicked, trade ID:', tradeId);
            processTrade(tradeId);
        }
        
        if (e.target.classList.contains('complete-trade-btn')) {
            const tradeId = e.target.getAttribute('data-trade-id');
            console.log('🔧 Complete trade button clicked, trade ID:', tradeId);
            completeTradeManagement(tradeId);
        }
        
        if (e.target.classList.contains('cancel-trade-btn')) {
            const tradeId = e.target.getAttribute('data-trade-id');
            console.log('🔧 Cancel trade management button clicked, trade ID:', tradeId);
            cancelTradeManagement(tradeId);
        }
        
        // Кнопки удаления предметов
        if (e.target.classList.contains('selected-item-remove')) {
            e.stopPropagation();
            const itemId = e.target.getAttribute('data-item-id');
            console.log('🔧 Remove item button clicked, item ID:', itemId);
            toggleItemSelection(itemId);
        }
    });
    
    // Трейды
    document.getElementById('load-items-btn').addEventListener('click', loadItems);
    document.getElementById('calculate-trade-btn').addEventListener('click', calculateTrade);
    document.getElementById('create-trade-btn').addEventListener('click', createTrade);
    document.getElementById('get-trades-btn').addEventListener('click', getTrades);
    
    // Боты
    document.getElementById('get-bots-btn').addEventListener('click', getBots);
    document.getElementById('get-bot-inventory-btn').addEventListener('click', getBotInventory);
    document.getElementById('create-steam-trade-btn').addEventListener('click', createSteamTrade);
    document.getElementById('check-trade-status-btn').addEventListener('click', checkTradeStatus);
    
    console.log('🎮 CS2 Trading Test Page loaded!');
    
    // Автоматическая загрузка данных
    setTimeout(() => {
        autoLoadData();
    }, 1000); // Небольшая задержка для полной загрузки страницы
});
