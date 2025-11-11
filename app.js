// app.js

// Инициализация Telegram Web App SDK
const tg = window.Telegram.WebApp;
tg.ready();

// --- НОВЫЙ БЛОК: УСТАНОВКА МЯГКИХ ЦВЕТОВ ---
const mainColor = '#E6B34A'; // Спокойный золотисто-желтый
const headerColor = '#E6B34A';

tg.setHeaderColor(headerColor);
tg.MainButton.setParams({
    color: mainColor
});
// ---------------------------------------------

// --- 1. Данные: Список ваших товаров (С ИСПРАВЛЕННЫМИ ИМЕНАМИ ФАЙЛОВ) ---
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "Новое, с бирками." },
        // Zip-худи 'Polo Ralph Lauren' - Исправлено имя файла
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "Черное худи на молнии.", image: "images/zip-hoofie_ralph.png" },
        // Zip-худи 'Burberry' - Исправлено имя файла
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Светло-серое, подкладка в клетку.", image: "images/zip-hoodie_burberry.jpg" }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "Чёрная футболка Bape." },
        { id: 402, name: "Футболка 'Stussy' (Базовая)", price: 3200, size: "S", description: "Черный цвет, новый дроп." }
    ],

    // ПУСТЫЕ МАССИВЫ
    jackets: [],
    sneakers: [],

    accessories: [
        // Рюкзак 'Supreme' (Серебро) - Исправлено имя файла
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "Продан. Металлический цвет.", image: "images/bag_supreme_silver.png" },
        // Рюкзак 'Supreme' (Черный) - Исправлено имя файла
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Продан. Черный, с белым лого.", image: "images/bag_supreme_black.png" },
        // Ремень 'Gucci'
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Продан. Черный ремень, черная пряжка." },
        // Сумка 'Lacoste' - Исправлено имя файла
        { id: 504, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "Продана. Маленькая сумка-мессенджер.", image: "images/mini_bag_lacoste_black.png" },
        // Очки 'Chrome Hearts'
        { id: 505, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Черная оправа." }
    ]
};

// --- 2. Функционал: Отображение товаров (С ФОТО) ---

function showCategory(categoryKey) {
    const categoryProducts = products[categoryKey] || [];
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";

    document.getElementById('categories').style.display = 'none';
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';
    productListDiv.style.display = 'block';

    if (categoryProducts.length === 0) {
        productListDiv.innerHTML = `
            <div class="product-item" style="text-align: center;">
                <h3>Товаров в этой категории пока нет 😞</h3>
            </div>
        `;
    } else {
        categoryProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-item';

            // Формируем ПОЛНЫЙ URL. Если product.image не существует, imageUrl будет null
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

tg.MainButton.onClick(() => {
    document.getElementById('categories').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    tg.MainButton.hide();
});

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