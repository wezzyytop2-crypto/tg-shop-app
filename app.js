// app.js

// Инициализация Telegram Web App SDK
const tg = window.Telegram.WebApp;
tg.ready();

// --- 0. НАСТРОЙКИ КУРСА ВАЛЮТ ---
// Курс: 1 MDL = 0.94 ПМР
// Для расчета MDL из ПМР, используем обратный коэффициент: 1 / 0.94
const PMR_TO_MDL_RATE = 1 / 0.94;
// ---------------------------------

// --- 1. Настройка UI (Цвета) ---
const mainColor = '#E6B34A';
const headerColor = '#E6B34A';

tg.setHeaderColor(headerColor);
tg.MainButton.setParams({
    color: mainColor
});
// ---------------------------------------------

// --- ФУНКЦИЯ ОКРУГЛЕНИЯ ЦЕНЫ ДО БЛИЖАЙШЕГО ЦЕЛОГО ДЕСЯТКА (Оканчивается на 0) ---
function roundToNearestTen(price) {
    // Math.round(price / 10) * 10:
    // - 464 / 10 = 46.4. Math.round(46.4) = 46. 46 * 10 = 460 (вниз).
    // - 467 / 10 = 46.7. Math.round(46.7) = 47. 47 * 10 = 470 (вверх).
    // - 465 / 10 = 46.5. Math.round(46.5) = 47. 47 * 10 = 470 (половина округляется вверх).
    return Math.round(price / 10) * 10;
}


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР) ---
// ВНИМАНИЕ: Все цены в массивах ниже должны быть в ПМР!
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "SELL. Бежевое худи.", image: "images/essentails.png" },
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "IN STOCK. Черное зип-худи.", image: "images/zip-hoofie_ralph.png" },
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "SELL. Серое зип-худи.", image: "images/zip-hoodie_burberry.jpg" }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "SELL. Чёрная футболка Bape.", image: "images/bape.png" },
    ],

    jackets: [],
    sneakers: [],

    accessories: [
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "SELL. Металлический цвет.", image: "images/bag_supreme_silver.png" },
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "SELL. Черный, с белым лого.", image: "images/bag_supreme_black.png" },
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "SELL. Черный ремень, черная пряжка.", image: "images/black_gold.png" },
        { id: 504, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "SELL. Бежевый ремень, золотая пряжка.", image: "images/glasses_black.png" },
        { id: 505, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "SELL. Маленькая сумка-мессенджер.", image: "images/mini_bag_lacoste_black.png" },
        { id: 506, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "SELL. Черная оправа.", image: "images/glasses_black.png" },
        { id: 507, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "SELL. Прозрачная оправа.", image: "images/glasses_white.png" }
    ]
};


// --- 3. Функционал: Отображение товаров (С ДВУМЯ КНОПКАМИ) ---

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

            const imageUrl = product.image ? baseUrl + product.image : null;

            // 1. Округление цены в ПМР до ближайшего 10
            const roundedPmrPrice = roundToNearestTen(product.price);

            // 2. Расчет цены в MDL (от округленной цены в ПМР)
            const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;

            // 3. Округление расчетной цены MDL до ближайшего 10
            const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            item.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width:100%; height:auto; border-radius: 8px; margin-bottom: 10px;">` : ''}

                <h3>${product.name}</h3>
                <p><strong>Размер:</strong> ${product.size}</p>
                <p>${product.description}</p>

                <p>Цена: **${roundedPmrPrice} ПМР** / ~${roundedMdlPrice} MDL</p>

                <div class="button-group">
                    <button class="buy-button" onclick="buyProduct(${product.id}, \`${product.name}\`, ${roundedPmrPrice})">Купить / Заказать</button>
                    <button class="photo-button" onclick="requestPhotos(${product.id}, \`${product.name}\`)">Запросить детальные фото</button>
                </div>
            `;
            productListDiv.appendChild(item);
        });
    }

    tg.MainButton.setText("← Вернуться к категориям");
    tg.MainButton.show();
}


// --- 4. Функционал: Обработка действия "Купить" (использует ОКРУГЛЕННУЮ цену в ПМР) ---

function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';
    // Цена уже округлена и передается как аргумент price (в ПМР)
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} ПМР.`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
    } else {
        window.open(telegramUrl, '_blank');
    }
}

// --- 5. НОВЫЙ ФУНКЦИОНАЛ: Обработка действия "Запросить детальные фото" ---

function requestPhotos(id, name) {
    const sellerUsername = 'ulans_sttore';
    const messageText = encodeURIComponent(`Здравствуйте! Можно попросить детальные фото товара: ${name} (ID: ${id}). Спасибо!`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
    } else {
        window.open(telegramUrl, '_blank');
    }
}

// --- 6. Функционал: Кнопка "Назад" ---

tg.MainButton.onClick(() => {
    document.getElementById('categories').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    tg.MainButton.hide();
});