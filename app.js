// app.js (Режим: Telegram Mini App v=4.6 - Добавление фильтрации по наличию)

// --- Глобальные переменные состояния ---
let currentCategoryKey = null; // Хранит ключ текущей категории для фильтрации
// ---------------------------------------

// --- 1. Настройка TWA и Цвета ---
const tg = window.Telegram.WebApp;
tg.ready();

// Цвет Главной кнопки на СЕРЫЙ (#404040)
const mainColor = '#404040';
// Цвет текста кнопки на БЕЛЫЙ
const buttonTextColor = '#ffffff';

// Используем цвета темы Telegram для шапки и фона
const headerColor = tg.themeParams.header_bg_color || '#ffffff';

tg.setHeaderColor(headerColor);
tg.MainButton.setParams({
    color: mainColor,
    text_color: buttonTextColor
});
// ---------------------------------


// --- 0. НАСТРОЙКИ КУРСА ВАЛЮТ ---
const PMR_TO_MDL_RATE = 1 / 0.94;
// ---------------------------------

// --- ФУНКЦИЯ ОКРУГЛЕНИЯ ЦЕНЫ ---
function roundToNearestTen(price) {
    return Math.round(price / 10) * 10;
}


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР) ---
// Обновляем структуру, добавляя статус 'status'
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "В наличии. Бежевое худи.", image: "images/essentails.png", status: "IN STOCK" },
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "Под заказ. Черное зип-худи.", image: "images/zip-hoofie_ralph.png", status: "ORDER" },
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Под заказ. Серое зип-худи.", image: "images/zip-hoodie_burberry.jpg", status: "ORDER" }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "В наличии. Чёрная футболка Bape.", image: "images/bape.png", status: "IN STOCK" },
    ],

    jackets: [],
    sneakers: [],

    accessories: [
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "В наличии. Металлический цвет.", image: "images/bag_supreme_silver.png", status: "IN STOCK" },
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Под заказ. Черный, с белым лого.", image: "images/bag_supreme_black.png", status: "ORDER" },
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Под заказ. Черный ремень, черная пряжка.", image: "images/black_gold.png", status: "ORDER" },
        { id: 504, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "В наличии. Бежевый ремень, золотая пряжка.", image: "images/glasses_black.png", status: "IN STOCK" },
        { id: 505, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "В наличии. Маленькая сумка-мессенджер.", image: "images/mini_bag_lacoste_black.png", status: "IN STOCK" },
        { id: 506, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "В наличии. Черная оправа.", image: "images/glasses_black.png", status: "IN STOCK" },
        { id: 507, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "В наличии. Прозрачная оправа.", image: "images/glasses_white.png", status: "IN STOCK" }
    ]
};


// --- 3. Функционал: Отображение товаров (Только переключение вида) ---

function showCategory(categoryKey, categoryName) {
    // Устанавливаем текущий ключ категории
    currentCategoryKey = categoryKey;

    document.title = `U L A N S _ S T O R E — ${categoryName}`;

    document.getElementById('category-view').style.display = 'none';
    document.getElementById('product-list').style.display = 'block';

    document.getElementById('current-category-title').textContent = categoryName.toUpperCase();
    document.querySelector('footer').style.display = 'none'; // Скрываем футер

    // Активируем фильтр "ВСЕ ТОВАРЫ" по умолчанию
    document.getElementById('filter-all').classList.add('active');
    document.getElementById('filter-stock').classList.remove('active');

    // Показываем все товары при входе в категорию
    filterProducts(categoryKey, 'all');

    // Включаем TWA MainButton для навигации "Назад"
    tg.MainButton.setText("← BACK TO CATEGORIES");
    tg.MainButton.show();
}


// --- 4. НОВАЯ ФУНКЦИЯ: ФИЛЬТРАЦИЯ ТОВАРОВ ---

function filterProducts(categoryKey, filterType) {
    const allProducts = products[categoryKey] || [];
    let filteredProducts = [];

    // Логика фильтрации
    if (filterType === 'stock') {
        filteredProducts = allProducts.filter(product => product.status === 'IN STOCK');
        document.getElementById('filter-all').classList.remove('active');
        document.getElementById('filter-stock').classList.add('active');
    } else { // 'all'
        filteredProducts = allProducts;
        document.getElementById('filter-all').classList.add('active');
        document.getElementById('filter-stock').classList.remove('active');
    }

    // Рендеринг отфильтрованных товаров
    renderProducts(filteredProducts);
}


// --- 5. НОВАЯ ФУНКЦИЯ: РЕНДЕРИНГ ТОВАРОВ ---

function renderProducts(productsToRender) {
    const productsContainer = document.getElementById('product-items-container');
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";
    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="product-item" style="text-align: center; border: none; padding: 20px;">
                <h3>Товаров по данному фильтру пока нет 😞</h3>
            </div>
        `;
        return;
    }

    productsToRender.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-item';

        const imageUrl = product.image ? baseUrl + product.image : null;

        const roundedPmrPrice = roundToNearestTen(product.price);
        const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
        const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

        const statusText = product.status === 'IN STOCK' ?
                           '<span class="status-stock">В НАЛИЧИИ</span>' :
                           '<span class="status-order">ПОД ЗАКАЗ</span>';

        item.innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}">` : ''}

            <div class="product-text-content">
                <h3>${product.name}</h3>
                <p><strong>Size:</strong> ${product.size} ${statusText}</p>
                <p>${product.description}</p>

                <p class="price-display"><strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL</p>

                <div class="button-group">
                    <button class="buy-button" onclick="buyProduct(${product.id}, \`${product.name}\`, ${roundedPmrPrice})">BUY / ORDER</button>
                    <button class="photo-button" onclick="requestPhotos(${product.id}, \`${product.name}\`)">REQUEST PHOTOS</button>
                </div>
            </div>
        `;
        productsContainer.appendChild(item);
    });
}


// --- 6. Функционал: Обработка действия "Купить" (Используем TWA openTelegramLink) ---
function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} ПМР.`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
    } else {
        window.open(telegramUrl, '_blank');
    }
}

// --- 7. Функционал: Обработка действия "Запросить детальные фото" (Используем TWA openTelegramLink) ---
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

// --- 8. Функционал: TWA MainButton (Кнопка "Назад") ---
tg.MainButton.onClick(goBack);

function goBack() {
    // Сбрасываем ключ категории
    currentCategoryKey = null;

    document.getElementById('category-view').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';

    document.title = 'U L A N S _ S T O R E | Fashion Store';

    // Футер снова отображается на главной странице
    document.querySelector('footer').style.display = 'flex';

    // Скрываем TWA MainButton на главном экране
    tg.MainButton.hide();
}

// --- 9. Функционал: Кнопка "Домой" (при клике на название магазина в шапке) ---
function goHome() {
    goBack();
}