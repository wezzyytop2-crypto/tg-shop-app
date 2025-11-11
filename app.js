// app.js

// Инициализация Telegram Web App SDK
const tg = window.Telegram.WebApp;
tg.ready();

// --- 1. Данные: Список ваших товаров ---
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "Новое, с бирками. Отличный оверсайз крой." },
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "Черное худи на молнии. Оригинал, новая вещь." },
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Светло-серое, подкладка капюшона в клетку. Очень плотное." }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "Чёрная футболка с клетчатым логотипом Bape. В наличии." },
        { id: 402, name: "Футболка 'Stussy' (Базовая)", price: 3200, size: "S", description: "Черный цвет, новый дроп." }
    ],

    // ПУСТОЙ МАССИВ
    jackets: [],

    // ПУСТОЙ МАССИВ
    sneakers: [],

    accessories: [
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "Продан. Металлический цвет, логотип на фасаде." },
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Продан. Черный, с белым логотипом." },
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Продан. Черный ремень, черная матовая пряжка с GG." },
        { id: 504, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "Продана. Маленькая сумка-мессенджер с узором." },
        { id: 505, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Черная оправа, остались одни белые." }
    ]
};


// --- 2. Функционал: Отображение товаров ---

function showCategory(categoryKey) {
    const categoryProducts = products[categoryKey] || [];

    document.getElementById('categories').style.display = 'none';
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';
    productListDiv.style.display = 'block';

    if (categoryProducts.length === 0) {
        // Если товаров нет
        productListDiv.innerHTML = `
            <div class="product-item" style="text-align: center;">
                <h3>Товаров в этой категории пока нет 😞</h3>
                <p>Мы работаем над пополнением ассортимента. Загляните позже!</p>
            </div>
        `;
    } else {
        // Если товары есть
        categoryProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-item';
            item.innerHTML = `
                <h3>${product.name}</h3>
                <p><strong>Размер:</strong> ${product.size}</p>
                <p>${product.description}</p>
                <p>Цена: **${product.price} руб.**</p>
                <button onclick="buyProduct(${product.id}, '${product.name}', ${product.price})">Купить / Заказать</button>
            `;
            productListDiv.appendChild(item);
        });
    }

    // Настраиваем Главную Кнопку Telegram внизу экрана (кнопка "Назад")
    tg.MainButton.setText("← Вернуться к категориям");
    tg.MainButton.show();
}


// --- 3. Функционал: Обработка действий пользователя ---

// Логика кнопки "Назад"
tg.MainButton.onClick(() => {
    document.getElementById('categories').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    tg.MainButton.hide();
});

// Логика кнопки "Купить" (ФИНАЛЬНАЯ ВЕРСИЯ: С уведомлением и ссылкой для всех товаров)
function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';

    // Формируем сообщение для продавца
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} руб.`);

    // Создаем ссылку для открытия чата
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    // ПРОВЕРКА: Если мы в Telegram Mini App
    if (tg && tg.openTelegramLink) {
        // 1. Открываем чат
        tg.openTelegramLink(telegramUrl);
        // 2. Выводим уведомление
        tg.showAlert(`Запрос на покупку ${name} отправлен продавцу @${sellerUsername}. Откроется чат.`);
    } else {
        // Если запущено вне Telegram (на случай, если открыто в Chrome)
        window.open(telegramUrl, '_blank');
        tg.showAlert(`Вы выбрали: ${name} за ${price} руб. Откройте чат с продавцом @${sellerUsername} для оформления заказа.`);
    }
}