// app.js

// Инициализация Telegram Web App SDK
const tg = window.Telegram.WebApp;
tg.ready();

// --- НОВЫЙ БЛОК: УСТАНОВКА ФИРМЕННЫХ ЦВЕТОВ ---

// Фирменный Оранжевый цвет вашего логотипа
const mainColor = '#FF9900';
const headerColor = '#FF9900';

tg.setHeaderColor(headerColor);
tg.MainButton.setParams({
    color: mainColor
});

// ---------------------------------------------


// --- 1. Данные: Список ваших товаров (С ПОЛЕМ image ТОЛЬКО ДЛЯ 5 ТОВАРОВ) ---
const products = {

    hoodies_sweats: [
        // Худи Essentials - ФОТО НЕТ
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "Новое, с бирками." },
        // Черное Zip-Худи Polo - ФОТО ЕСТЬ
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "Черное худи на молнии.", image: "images/polo_zip_hoodie.jpg" },
        // Серое Zip-Худи Burberry - ФОТО ЕСТЬ
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Светло-серое, подкладка в клетку.", image: "images/burberry_zip_hoodie.jpg" }
    ],
    t_shirts: [
        // Футболка Bape - ФОТО НЕТ (ХОТЯ ФОТО image_f53370.jpg БЫЛО ЗАГРУЖЕНО, Я ЕГО НЕ ВКЛЮЧАЮ ПО ЗАПРОСУ)
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "Чёрная футболка Bape." },
        // Футболка Stussy - ФОТО НЕТ
        { id: 402, name: "Футболка 'Stussy' (Базовая)", price: 3200, size: "S", description: "Черный цвет, новый дроп." }
    ],

    // ПУСТЫЕ МАССИВЫ
    jackets: [],
    sneakers: [],

    accessories: [
        // Рюкзак Supreme (Серебро) - ФОТО ЕСТЬ
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "Продан. Металлический цвет.", image: "images/supreme_backpack_silver.jpg" },
        // Рюкзак Supreme (Черный) - ФОТО ЕСТЬ
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Продан. Черный, с белым лого.", image: "images/supreme_backpack_black.jpg" },
        // Ремень Gucci - ФОТО НЕТ
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Продан. Черный ремень, черная пряжка." },
        // Сумка Lacoste - ФОТО ЕСТЬ
        { id: 504, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "Продана. Маленькая сумка-мессенджер.", image: "images/lacoste_bag.jpg" },
        // Очки Chrome Hearts - ФОТО НЕТ
        { id: 505, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Черная оправа." }
    ]
};

// --- 2. Функционал: Отображение товаров (С ФОТО) ---

function showCategory(categoryKey) {
    const categoryProducts = products[categoryKey] || [];
    // Базовый URL вашего сайта на GitHub Pages
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";

    document.getElementById('categories').style.display = 'none';
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';
    productListDiv.style.display = 'block';

    if (categoryProducts.length === 0) {
        // ... (блок пустых товаров)
        productListDiv.innerHTML = `
            <div class="product-item" style="text-align: center;">
                <h3>Товаров в этой категории пока нет 😞</h3>
            </div>
        `;
    } else {
        // Если товары есть
        categoryProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-item';

            // Проверяем наличие фото и формируем URL
            const imageUrl = product.image ? baseUrl + product.image : null;

            item.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width:100%; height:auto; border-radius: 8px; margin-bottom: 10px;">` : ''}

                <h3>${product.name}</h3>
                <p><strong>Размер:</strong> ${product.size}</p>
                <p>${product.description}</p>
                <p>Цена: **${product.price} руб.**</p>

                <button onclick="buyProduct(${product.id}, \`${product.name}\`, ${product.price})">Купить / Заказать</button>
            `;
            productListDiv.appendChild(item);
        });
    }

    tg.MainButton.setText("← Вернуться к категориям");
    tg.MainButton.show();
}


// --- 3. Функционал: Обработка действий пользователя (Кнопка Купить) ---

// Логика кнопки "Назад"
tg.MainButton.onClick(() => {
    document.getElementById('categories').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    tg.MainButton.hide();
});

// Логика кнопки "Купить" (Финальная версия, работает для всех товаров)
function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} руб.`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
        tg.showAlert(`Запрос на покупку ${name} отправлен продавцу @${sellerUsername}. Откроется чат.`);
    } else {
        window.open(telegramUrl, '_blank');
        tg.showAlert(`Вы выбрали: ${name} за ${price} руб. Откройте чат с продавцом @${sellerUsername} для оформления заказа.`);
    }
}