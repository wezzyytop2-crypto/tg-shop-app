// app.js (Режим: Telegram Mini App v=5.8 - Скидка от basePrice + Новинки (72 часа) + ФИЛЬТРЫ NEW/SALE)

// --- Глобальные переменные состояния ---
let currentCategoryKey = null;
let currentGalleryImages = [];
let currentImageIndex = 0;
// -------------------------------------------------


// --- 1. Настройка TWA и Цвета ---
const tg = window.Telegram.WebApp;
tg.ready();

// Цвет Главной кнопки на СЕРЫЙ (#404040)
const mainColor = '#404040';
// Цвет текста кнопки на БЕЛЫЙ
const buttonTextColor = '#ffffff';

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
    // Округляет цену до ближайшего десятка
    return Math.round(price / 10) * 10;
}

// --- УТИЛИТА: Проверка статуса "Новинка" (до 72 часов) ---
function isProductNew(product) {
    // Проверяет, что: 1. Установлен isNew: true 2. Установлена дата newUntil 3. Текущее время МЕНЬШЕ newUntil
    return product.isNew && product.newUntil && (new Date(product.newUntil) > Date.now());
}

// --- УТИЛИТА: Проверка статуса "SALE" ---
function isProductSale(product) {
    // Проверяет, что: 1. Установлен isSale: true 2. Указана базовая цена и процент скидки
    return product.isSale === true && product.basePrice && product.discountPercent > 0;
}


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР). Параметры в столбик для удобства ---
const products = {

    hoodies_sweats: [
        // 1. БЕЖЕВОЕ ХУДИ (ID 101): ОБЫЧНЫЙ ТОВАР
        {
            id: 101,
            name: "Худи Essentials (Бежевое)",
            price: 490,
            size: "XL",
            description: "Под заказ. Бежевое худи.",
            images: ["images/essentails.png"],
            status: "ORDER",
            // Новые поля для Новинок/Скидок 
            isNew: false,
            newUntil: null
        },

        // 2. ЧЕРНОЕ ZIP-ХУДИ (ID 102): СО СКИДКОЙ -20% И НОВИНКА ДО 19.11.2025
        {
            id: 102,
            name: "Zip-худи 'Polo Ralph Lauren'",
            basePrice: 550,          // <-- СТАРАЯ ЦЕНА (Базовая)
            discountPercent: 20,     // <-- Скидка 20%
            size: "L (M)",
            description: "В наличии. Черное зип-худи. СКИДКА -20%!",
            images: ["images/zip-hoofie_ralph.png", "images/zip-hoodie_burberry.jpg"],
            status: "IN STOCK",
            isSale: true, // Флаг для включения логики скидки
            isNew: true, // Активация статуса "Новинка"
            newUntil: '2025-11-19T10:32:00Z' // <-- НОВИНКА АВТОМАТИЧЕСКИ ПРОПАДЕТ ЧЕРЕЗ 72 ЧАСА (19.11.2025, 12:32 EET)
        },

        // 3. СЕРОЕ ХУДИ (ID 103): ОБЫЧНЫЙ ТОВАР
        {
            id: 103,
            name: "Zip-худи 'Burberry'",
            price: 625,
            size: "XL",
            description: "Под заказ. Серое зип-худи.",
            images: ["images/zip-hoodie_burberry.jpg"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        }
    ],
    t_shirts: [
        {
            id: 401,
            name: "Футболка 'Bape' (Black)",
            price: 375,
            size: "L",
            description: "Под заказ. Чёрная футболка Bape.",
            images: ["images/bape.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
    ],

    jackets: [],
    sneakers: [],

    accessories: [
        {
            id: 501,
            name: "Рюкзак 'Supreme' (Серебро)",
            price: 425,
            size: "OS",
            description: "Под заказ. Металлический цвет.",
            images: ["images/bag_supreme_silver.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 502,
            name: "Рюкзак 'Supreme' (Черный)",
            price: 400,
            size: "OS",
            description: "Под заказ. Черный, с белым лого.",
            images: ["images/bag_supreme_black.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 503,
            name: "Ремень 'Gucci'",
            price: 225,
            size: "110cm",
            description: "Под заказ. Черный ремень, черная пряжка.",
            images: ["images/belt_black.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 504,
            name: "Ремень 'Gucci'",
            price: 225,
            size: "110cm",
            description: "Под заказ. Бежевый ремень, золотая пряжка.",
            images: ["images/glasses_black.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 505,
            name: "Сумка 'Lacoste'",
            price: 425,
            size: "OS",
            description: "Под заказ. Маленькая сумка-мессенджер.",
            images: ["images/mini_bag_lacoste_black.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 506,
            name: "Очки 'Chrome Hearts'",
            price: 175,
            size: "OS",
            description: "Под заказ. Черная оправа.",
            images: ["images/glasses_black.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        },
        {
            id: 507,
            name: "Очки 'Chrome Hearts'",
            price: 175,
            size: "OS",
            description: "Под заказ. Прозрачная оправа.",
            images: ["images/glasses_white.png"],
            status: "ORDER",
            isNew: false,
            newUntil: null
        }
    ]
};


// --- 3. Функционал: Отображение товаров ---

function showCategory(categoryKey, categoryName) {
    currentCategoryKey = categoryKey;
    document.title = `U L A N S _ СТОР — ${categoryName}`;
    document.getElementById('category-view').style.display = 'none';
    document.getElementById('product-list').style.display = 'block';
    document.getElementById('current-category-title').textContent = categoryName.toUpperCase();
    document.querySelector('footer').style.display = 'none';

    // Сброс всех фильтров и активация "ВСЕ"
    const filterButtons = ['filter-all', 'filter-stock', 'filter-new', 'filter-sale'];
    filterButtons.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById('filter-all').classList.add('active');

    filterProducts(categoryKey, 'all');
    tg.MainButton.setText("← НАЗАД К КАТЕГОРИЯМ");
    tg.MainButton.show();
}


// --- 4. ФУНКЦИЯ: ФИЛЬТРАЦИЯ ТОВАРОВ (ОБНОВЛЕНО ДЛЯ NEW и SALE) ---

function filterProducts(categoryKey, filterType) {
    const allProducts = products[categoryKey] || [];
    let filteredProducts = allProducts;

    // 1. Управление активной кнопкой
    const filterButtons = ['filter-all', 'filter-stock', 'filter-new', 'filter-sale'];
    filterButtons.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(`filter-${filterType}`).classList.add('active');


    // 2. Логика фильтрации
    if (filterType === 'stock') {
        filteredProducts = allProducts.filter(product => product.status === 'IN STOCK');

    } else if (filterType === 'new') {
        // Фильтр по Новинкам (используем утилиту)
        filteredProducts = allProducts.filter(product => isProductNew(product));

    } else if (filterType === 'sale') {
        // Фильтр по Скидкам (используем утилиту)
        filteredProducts = allProducts.filter(product => isProductSale(product));

    } else { // 'all'
        filteredProducts = allProducts;
    }

    // 3. Рендеринг результата
    renderProducts(filteredProducts);
}


// --- 5. ФУНКЦИЯ: РЕНДЕРИНГ ТОВАРОВ ---

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

        const imageUrl = product.images && product.images.length > 0 ? baseUrl + product.images[0] : null;

        const isOrder = product.status !== 'IN STOCK';

        // --- ЛОГИКА СТАТУСОВ ---

        // 1. Проверка на СКИДКУ (для ярлыка и цены)
        const isSale = isProductSale(product);
        let saleBadgeHtml = '';

        // 2. Проверка на НОВИНКУ (для ярлыка)
        const isNew = isProductNew(product);
        let newBadgeHtml = '';


        const statusText = isOrder ?
                           '<span class="status-order">ПОД ЗАКАЗ</span>' :
                           '<span class="status-stock">В НАЛИЧИИ</span>';

        // --- 5.1. ЛОГИКА ЦЕНЫ И ЯРЛЫКОВ ---
        let priceDisplayHtml = '';
        let actualPrice;
        let roundedPmrPrice;

        // Расчет цены и ярлыка SALE
        if (isSale) {
            const basePrice = product.basePrice;
            const discount = product.discountPercent;

            // 1. Расчет НОВОЙ ЦЕНЫ
            actualPrice = basePrice * (1 - (discount / 100));

            // 2. Округление и конвертация для отображения
            roundedPmrPrice = roundToNearestTen(actualPrice);

            const roundedOldPmrPrice = roundToNearestTen(basePrice);
            const rawOldMdlPrice = roundedOldPmrPrice * PMR_TO_MDL_RATE;
            const roundedOldMdlPrice = roundToNearestTen(rawOldMdlPrice);
            const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
            const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            // Формируем ярлык SALE
            saleBadgeHtml = `<div class="product-badge sale-badge">-${discount}%</div>`;

            priceDisplayHtml = `
                <p class="price-display">
                    <span class="old-price">${roundedOldPmrPrice} PMR / ~${roundedOldMdlPrice} MDL</span>
                    <strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL
                </p>
            `;

        } else {
            // Стандартный расчет для товаров без скидки
            actualPrice = product.price || 0;
            roundedPmrPrice = roundToNearestTen(actualPrice);
            const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
            const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            priceDisplayHtml = `<p class="price-display"><strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL</p>`;
        }

        // Формирование ярлыка NEW
        if (isNew) {
            newBadgeHtml = `<div class="product-badge new-badge">NEW</div>`;
        }

        // Объединяем все ярлыки (NEW будет слева от SALE)
        const combinedBadgeHtml = newBadgeHtml + saleBadgeHtml;
        // ------------------------------------------

        // Для кнопки "Купить" используем фактическую цену
        const buyButtonPrice = roundedPmrPrice;


        let imageHtml = '';
        if (imageUrl) {
            imageHtml = `
                <div class="product-image-container" onclick='openGallery("${currentCategoryKey}", ${product.id})'>
                    <img src="${imageUrl}" alt="${product.name}">
                    ${combinedBadgeHtml} ${isOrder ? `
                        <div class="product-order-overlay">
                            <span class="order-label">ПОД ЗАКАЗ</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const buyButtonClass = isOrder ? 'buy-button order-button' : 'buy-button';

        item.innerHTML = `
            ${imageHtml}

            <div class="product-text-content">
                <h3>${product.name}</h3>
                <p><strong>Size:</strong> ${product.size} ${statusText}</p>
                <p>${product.description}</p>

                ${priceDisplayHtml}

                <div class="button-group">
                    <button class="${buyButtonClass}" onclick="buyProduct(${product.id}, \`${product.name}\`, ${buyButtonPrice})">КУПИТЬ / ЗАКАЗАТЬ</button>
                    <button class="photo-button" onclick="requestPhotos(${product.id}, \`${product.name}\`)">ЗАПРОСИТЬ ФОТО</button>
                </div>
            </div>
        `;
        productsContainer.appendChild(item);
    });
}


// --- 6. Функционал: Обработка действия "Купить" ---
function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';
    // В сообщении указываем рассчитанную цену (price)
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} ПМР.`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
    } else {
        window.open(telegramUrl, '_blank');
    }
}

// --- 7. Функционал: Обработка действия "Запросить детальные фото" ---
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
    currentCategoryKey = null;
    document.getElementById('category-view').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    document.title = 'U L A N S _ СТОР | Fashion Store';
    document.querySelector('footer').style.display = 'flex';
    tg.MainButton.hide();
}

// --- 9. Функционал: Кнопка "Домой" ---
function goHome() {
    goBack();
}


// --- 10. ФУНКЦИОНАЛ: ГАЛЕРЕЯ ---
function openGallery(productKey, productId) {
    const category = products[productKey];
    const product = category.find(p => p.id === productId);

    if (!product || !product.images || product.images.length === 0) {
        console.error("Gallery Error: Product or images not found.");
        return;
    }

    currentGalleryImages = product.images;
    currentImageIndex = 0;
    renderGallery();
    document.getElementById('gallery-modal').style.display = 'block';
}

function closeGallery() {
    document.getElementById('gallery-modal').style.display = 'none';
}

function renderGallery() {
    const mainImg = document.getElementById('modal-main-img');
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";

    const prevBtn = document.querySelector('.prev-img');
    const nextBtn = document.querySelector('.next-img');
    const isSingleImage = currentGalleryImages.length <= 1;
    prevBtn.style.display = isSingleImage ? 'none' : 'block';
    nextBtn.style.display = isSingleImage ? 'none' : 'block';
    thumbnailsContainer.style.display = isSingleImage ? 'none' : 'flex';

    mainImg.src = baseUrl + currentGalleryImages[currentImageIndex];

    thumbnailsContainer.innerHTML = '';
    if (!isSingleImage) {
        currentGalleryImages.forEach((imagePath, index) => {
            const thumb = document.createElement('img');
            thumb.className = 'thumbnail-img';
            thumb.src = baseUrl + imagePath;
            thumb.onclick = (e) => {
                e.stopPropagation();
                showImage(index);
            };
            if (index === currentImageIndex) {
                thumb.classList.add('active');
            }
            thumbnailsContainer.appendChild(thumb);
        });
    }
}

function showImage(index) {
    currentImageIndex = index;
    renderGallery();
}

function nextImage(event) {
    if (event) event.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
    renderGallery();
}

function prevImage(event) {
    if (event) event.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    renderGallery();
}