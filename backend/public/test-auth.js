const API_BASE = 'http://localhost:3000';

// Функции для работы с JWT токеном
function saveToken(token) {
    localStorage.setItem('jwt_token', token);
    document.getElementById('token').value = token;
    console.log('JWT token saved:', token);
}

function loadToken() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        document.getElementById('token').value = token;
        console.log('JWT token loaded from localStorage');
        
        // Показываем статус загруженного токена
        showTokenStatus();
    }
    return token;
}

function showTokenStatus() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        showResponse({
            message: '🔑 JWT токен найден в localStorage и автоматически подставлен',
            status: 'Token loaded',
            note: 'Можете сразу тестировать защищенные эндпоинты'
        });
    }
}

function clearToken() {
    localStorage.removeItem('jwt_token');
    document.getElementById('token').value = '';
    console.log('JWT token cleared');
}

function showResponse(data, isError = false) {
    const responseDiv = document.getElementById('response');
    responseDiv.style.display = 'block';
    responseDiv.style.background = isError ? '#f8d7da' : '#d4edda';
    responseDiv.style.color = isError ? '#721c24' : '#155724';
    responseDiv.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
    responseDiv.textContent = JSON.stringify(data, null, 2);
    
    // Если это успешная авторизация, сохраняем токен
    if (!isError && data.success && data.data && data.data.token) {
        saveToken(data.data.token);
        
        // Показываем улучшенное сообщение
        const enhancedData = {
            message: '✅ Авторизация успешна! JWT токен автоматически сохранен и подставлен в поле выше.',
            originalResponse: data,
            tokenSaved: true,
            note: 'Теперь можете тестировать защищенные эндпоинты'
        };
        
        responseDiv.textContent = JSON.stringify(enhancedData, null, 2);
    }
}

async function testAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message }, true);
    }
}

async function testWithToken(endpoint) {
    let token = document.getElementById('token').value;
    if (!token) {
        // Пытаемся загрузить токен из localStorage
        token = loadToken();
        if (!token) {
            showResponse({ error: 'JWT токен не найден. Сначала авторизуйтесь через Steam.' }, true);
            return;
        }
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message }, true);
    }
}

function testSteamAuth() {
    console.log('Steam auth button clicked!'); // Отладочная информация
    
    // Перенаправляем на Steam авторизацию
    window.location.href = `${API_BASE}/auth/steam`;
}

// Проверка всех пользователей
function checkAllUsers() {
    console.log('Checking all users...');
    testAPI('/api/users');
}

// Проверка статистики пользователей
function checkUserStats() {
    console.log('Checking user stats...');
    testAPI('/api/users/stats');
}

// Поиск пользователя по Steam ID
function searchUserBySteamId() {
    const steamId = prompt('Enter Steam ID (e.g., 76561199045438526):');
    if (steamId) {
        console.log(`Searching user by Steam ID: ${steamId}`);
        testAPI(`/api/users/steam/${steamId}`);
    }
}

// Добавляем обработчики событий
function addEventListeners() {
    console.log('Adding event listeners...'); // Отладочная информация
    
    // Steam авторизация
    const steamBtn = document.getElementById('steamAuthBtn');
    if (steamBtn) {
        steamBtn.addEventListener('click', testSteamAuth);
        console.log('Steam auth button listener added');
    } else {
        console.error('Steam auth button not found!');
    }
    
    // API тесты
    document.getElementById('testMainBtn').addEventListener('click', () => testAPI('/'));
    document.getElementById('testEndpointBtn').addEventListener('click', () => testAPI('/test'));
    document.getElementById('testUsersBtn').addEventListener('click', () => testAPI('/api/users'));
    document.getElementById('testItemsBtn').addEventListener('click', () => testAPI('/api/items'));
    document.getElementById('testTradesBtn').addEventListener('click', () => testAPI('/api/trades'));
    document.getElementById('testPaymentsBtn').addEventListener('click', () => testAPI('/api/payments'));
    document.getElementById('testBotsBtn').addEventListener('click', () => testAPI('/api/bots'));
    document.getElementById('testAdminBtn').addEventListener('click', () => testAPI('/admin'));
    
    // Тесты с токеном
    document.getElementById('testProfileBtn').addEventListener('click', () => testWithToken('/auth/profile'));
    document.getElementById('testCheckBtn').addEventListener('click', () => testWithToken('/auth/check'));
    
    // Управление пользователями
    document.getElementById('checkUsersBtn').addEventListener('click', checkAllUsers);
    document.getElementById('checkStatsBtn').addEventListener('click', checkUserStats);
    document.getElementById('searchUserBtn').addEventListener('click', searchUserBySteamId);
    
    // Управление токеном
    document.getElementById('clearTokenBtn').addEventListener('click', clearToken);
    
    console.log('All event listeners added');
}

// Функция для получения параметров из URL
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        token: urlParams.get('token'),
        success: urlParams.get('success'),
        user: urlParams.get('user')
    };
}

// Функция для очистки URL от параметров
function cleanUrl() {
    if (window.history && window.history.pushState) {
        window.history.pushState({}, document.title, window.location.pathname);
    }
}

// Обработка авторизации из URL
function handleAuthFromUrl() {
    const params = getUrlParams();
    
    if (params.token && params.success === 'true') {
        try {
            // Сохраняем токен
            saveToken(params.token);
            
            // Парсим данные пользователя
            const userData = params.user ? JSON.parse(decodeURIComponent(params.user)) : null;
            
            // Показываем сообщение об успешной авторизации
            showResponse({
                message: '✅ Steam авторизация успешна! JWT токен автоматически сохранен.',
                user: userData,
                tokenSaved: true,
                note: 'Теперь можете тестировать защищенные эндпоинты'
            });
            
            // Очищаем URL от параметров
            cleanUrl();
            
            console.log('Token saved from URL parameters');
        } catch (error) {
            console.error('Error processing auth from URL:', error);
            showResponse({ error: 'Ошибка обработки авторизации' }, true);
        }
    }
}

// Инициализация при загрузке страницы
window.onload = function() {
    console.log('Page loaded, initializing...'); // Отладочная информация
    addEventListeners();
    
    // Сначала проверяем URL параметры (авторизация)
    handleAuthFromUrl();
    
    // Затем загружаем сохраненный токен (если нет в URL)
    const params = getUrlParams();
    if (!params.token) {
        loadToken();
    }
    
    testAPI('/');
    console.log('Initialization complete');
};
