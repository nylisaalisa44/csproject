// Тест функции преобразования URL
async function testImageURL() {
    const imageHashInput = document.getElementById('imageHash');
    const sizeSelect = document.getElementById('imageSize');
    
    if (!imageHashInput || !sizeSelect) {
        console.error('Не найдены необходимые элементы формы');
        return;
    }
    
    const imageHash = imageHashInput.value.trim();
    const size = sizeSelect.value;
    
    if (!imageHash) {
        showError('Введите хэш изображения');
        return;
    }

    try {
        let x = 0, y = 0;
        switch(size) {
            case '256x256':
                x = 256; y = 256;
                break;
            case '128x128':
                x = 128; y = 128;
                break;
            case '64x64':
                x = 64; y = 64;
                break;
            default:
                x = 0; y = 0;
        }

        const response = await fetch(`/api/test-image-url?imageHash=${encodeURIComponent(imageHash)}&x=${x}&y=${y}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            const resultDiv = document.getElementById('imageTestResult');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="success">
                        <h4>✅ URL сгенерирован через API:</h4>
                        <p><strong>Оригинальный хэш:</strong> ${escapeHtml(data.data.originalHash)}</p>
                        <p><strong>Сгенерированный URL:</strong> ${escapeHtml(data.data.imageUrl)}</p>
                        <p><strong>Параметры:</strong> x=${data.data.parameters.x}, y=${data.data.parameters.y}</p>
                        <div style="margin-top: 10px;">
                            <img src="${escapeHtml(data.data.imageUrl)}" alt="Тестовое изображение" style="max-width: 200px; border: 1px solid #ddd;" class="test-image">
                        </div>
                    </div>
                `;
                
                // Добавляем обработчик ошибок для тестового изображения
                const testImage = resultDiv.querySelector('.test-image');
                if (testImage) {
                    testImage.addEventListener('error', function() {
                        this.style.display = 'none';
                    });
                }
            }
        } else {
            showError('Ошибка API: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при тестировании URL:', error);
        showError('Ошибка при генерации URL: ' + error.message);
    }
}

// Функция для получения JWT токена из localStorage
function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

// Функция для удаления токена
function removeAuthToken() {
    localStorage.removeItem('jwt_token');
}

// Функция для проверки статуса авторизации
async function checkAuthStatus() {
    const token = getAuthToken();
    const authInfo = document.getElementById('authInfo');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!authInfo) {
        console.error('Не найден элемент для отображения статуса авторизации');
        return;
    }
    
    if (!token) {
        authInfo.innerHTML = '<span style="color: #dc3545;">❌ Не авторизован</span>';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
                authInfo.innerHTML = `<span style="color: #28a745;">✅ Авторизован как: ${escapeHtml(data.data.user.displayName)}</span>`;
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
            } else {
                throw new Error('Invalid response');
            }
        } else {
            throw new Error('Auth check failed');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        authInfo.innerHTML = '<span style="color: #dc3545;">❌ Токен недействителен</span>';
        removeAuthToken();
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Функция для входа через Steam
function loginWithSteam() {
    window.location.href = '/auth/steam';
}

// Функция для выхода
function logout() {
    removeAuthToken();
    checkAuthStatus();
}

// Функция для получения данных текущего пользователя
async function getCurrentUser() {
    const token = getAuthToken();
    if (!token) {
        return null;
    }

    try {
        const response = await fetch('/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
                return data.data.user;
            }
        }
        return null;
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        return null;
    }
}

// Функция для использования Steam ID текущего пользователя
async function useCurrentUser() {
    const user = await getCurrentUser();
    const steamIdInput = document.getElementById('steamId');
    
    if (!steamIdInput) {
        console.error('Не найдено поле Steam ID');
        return;
    }
    
    if (user && user.steamId) {
        steamIdInput.value = user.steamId;
        showError('Steam ID текущего пользователя установлен: ' + user.displayName);
    } else {
        showError('Не удалось получить данные текущего пользователя');
    }
}

// Тест инвентаря с изображениями
async function testInventoryImages() {
    const steamIdInput = document.getElementById('steamId');
    const limitInput = document.getElementById('limit');
    
    if (!steamIdInput || !limitInput) {
        console.error('Не найдены необходимые элементы формы');
        return;
    }
    
    const steamId = steamIdInput.value.trim();
    const limit = limitInput.value;
    
    if (!steamId) {
        showError('Введите Steam ID');
        return;
    }

    // Проверяем наличие токена
    const token = getAuthToken();
    if (!token) {
        showError('Необходима авторизация. Пожалуйста, войдите через Steam сначала.');
        return;
    }

    try {
        const response = await fetch(`/api/inventory/${steamId}?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('Токен авторизации недействителен. Пожалуйста, войдите заново.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            displayInventoryWithImages(data.data.inventory);
        } else {
            showError('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка при получении инвентаря:', error);
        showError('Ошибка при получении инвентаря: ' + error.message);
    }
}

// Отображение инвентаря с изображениями
function displayInventoryWithImages(inventory) {
    const resultDiv = document.getElementById('inventoryResult');
    
    if (!resultDiv) {
        console.error('Не найден элемент для отображения результатов');
        return;
    }
    
    if (!inventory || inventory.length === 0) {
        resultDiv.innerHTML = '<div class="error">Инвентарь пуст или недоступен</div>';
        return;
    }

    let html = '<div class="success"><h4>✅ Инвентарь получен:</h4>';
    html += '<div class="image-test">';

    inventory.forEach((item, index) => {
        const imageUrl = item.icon_url_full || item.icon_url;
        const name = item.market_hash_name || item.name || `Предмет ${index + 1}`;
        
        html += `
            <div class="image-item">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" class="inventory-image" data-fallback="https://community.fastly.steamstatic.com/public/images/trans.gif">
                <h4>${escapeHtml(name)}</h4>
                <p><strong>Хэш:</strong> ${escapeHtml(item.icon_url || 'Нет')}</p>
                <p><strong>URL:</strong> ${escapeHtml(imageUrl)}</p>
            </div>
        `;
    });

    html += '</div></div>';
    resultDiv.innerHTML = html;
    
    // Добавляем обработчики ошибок для изображений
    document.querySelectorAll('.inventory-image').forEach(img => {
        img.addEventListener('error', function() {
            this.src = this.dataset.fallback;
        });
    });
}

// Загрузка примеров изображений
function loadExampleImages() {
    const examples = [
        {
            name: 'AK-47 | Redline',
            hash: 'IzMF03bi9WpSBq-S-ekoE33L-iLqGFHVaU25ZzQNQcXdB2ozio1RrlIWFK3UfvMYB8UsvjiMXojflsZalyxSh31CIyHz2GZ-KuFpPsrTzBG0pu6FGjrzPGOTKyPbSgs4TbpWMm_YqzOk5OuWQDjIFO59EQ1Re_BS8zYbb8_bIVJjg5FYpGm3hUloEgIhYslfLQ3qnnBHNYEfDt0H'
        },
        {
            name: 'AWP | Dragon Lore',
            hash: 'IzMF03bi9WpSBq-S-ekoE33L-iLqGFHVaU25ZzQNQcXdB2ozio1RrlIWFK3UfvMYB8UsvjiMXojflsZalyxSh31CIyHz2GZ-KuFpPsrTzBG0pu6FGjrzPGOTKyPbSgs4TbpWMm_YqzOk5OuWQDjIFO59EQ1Re_BS8zYbb8_bIVJjg5FYpGm3hUloEgIhYslfLQ3qnnBHNYEfDt0H'
        }
    ];

    const container = document.getElementById('exampleImages');
    if (!container) {
        console.error('Не найден контейнер для примеров изображений');
        return;
    }
    
    examples.forEach(example => {
        const url = `https://community.fastly.steamstatic.com/economy/image/${example.hash}?allow_animated=1`;
        container.innerHTML += `
            <div class="image-item">
                <img src="${escapeHtml(url)}" alt="${escapeHtml(example.name)}" class="example-image" data-fallback="https://community.fastly.steamstatic.com/public/images/trans.gif">
                <h4>${escapeHtml(example.name)}</h4>
                <p><strong>Хэш:</strong> ${escapeHtml(example.hash.substring(0, 20))}...</p>
                <p><strong>URL:</strong> ${escapeHtml(url.substring(0, 50))}...</p>
            </div>
        `;
    });
    
    // Добавляем обработчики ошибок для примеров изображений
    document.querySelectorAll('.example-image').forEach(img => {
        img.addEventListener('error', function() {
            this.src = this.dataset.fallback;
        });
    });
}

// Функция для экранирования HTML
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const resultDiv = document.getElementById('imageTestResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="error">❌ ${escapeHtml(message)}</div>`;
    }
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
            localStorage.setItem('jwt_token', params.token);
            
            // Парсим данные пользователя
            const userData = params.user ? JSON.parse(decodeURIComponent(params.user)) : null;
            
            // Показываем сообщение об успешной авторизации и обновляем кнопки
            const authInfo = document.getElementById('authInfo');
            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (authInfo && userData) {
                authInfo.innerHTML = `<span style="color: #28a745;">✅ Steam авторизация успешна! Добро пожаловать, ${escapeHtml(userData.displayName)}!</span>`;
            }
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            
            // Очищаем URL от параметров
            cleanUrl();
            
            console.log('Token saved from URL parameters');
            return true;
        } catch (error) {
            console.error('Error processing auth from URL:', error);
            showError('Ошибка обработки авторизации');
        }
    }
    return false;
}

// Загружаем примеры при загрузке страницы
window.onload = function() {
    try {
        // Сначала проверяем URL параметры (авторизация)
        const authFromUrl = handleAuthFromUrl();
        
        // Если авторизация не из URL, проверяем статус авторизации
        if (!authFromUrl) {
            checkAuthStatus();
        }
        
        // Загружаем примеры изображений
        loadExampleImages();
        
        // Добавляем обработчики событий для кнопок авторизации
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', loginWithSteam);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Добавляем обработчики событий для функциональных кнопок
        const testImageBtn = document.getElementById('testImageBtn');
        const testInventoryBtn = document.getElementById('testInventoryBtn');
        const useCurrentUserBtn = document.getElementById('useCurrentUserBtn');
        
        if (testImageBtn) {
            testImageBtn.addEventListener('click', testImageURL);
        } else {
            console.error('Не найдена кнопка тестирования изображений');
        }
        
        if (testInventoryBtn) {
            testInventoryBtn.addEventListener('click', testInventoryImages);
        } else {
            console.error('Не найдена кнопка тестирования инвентаря');
        }
        
        if (useCurrentUserBtn) {
            useCurrentUserBtn.addEventListener('click', useCurrentUser);
        }
    } catch (error) {
        console.error('Ошибка при инициализации страницы:', error);
    }
};
