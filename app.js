// app.js (Режим: Telegram Mini App v=5.5 - Скидка рассчитывается ОТ basePrice. Дизайн - СЕТКА)

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


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР). Параметры в столбик для удобства ---
const products = {

    hoodies_sweats: [
        // 1. БЕЖЕВОЕ ХУДИ (ID 101): БЕЗ СКИДКИ
        {
            id: 101,
            name: "Худи Essentials (Бежевое)",
            price: 490,
            size: "XL",
            description: "Под заказ. Бежевое худи.",
            images: ["images/essentails.png"],
            status: "ORDER"
        },

        // 2. ЧЕРНОЕ ZIP-ХУДИ (ID 102): СО СКИДКОЙ -20%
        {
            id: 102,
            name: "Zip-худи 'Polo Ralph Lauren'",
            basePrice: 550,          // <-- СТАРАЯ ЦЕНА (Базовая)
            discountPercent: 20,     // <-- Скидка 20%
            size: "L (M)",
            description: "В наличии. Черное зип-худи. СКИДКА -20%!",
            images: ["images/zip-hoofie_ralph.png", "images/zip-hoodie_burberry.jpg"],
            status: "IN STOCK",
            isSale: true // Флаг для включения логики скидки
        },

        // 3. СЕРОЕ ХУДИ (ID 103): БЕЗ СКИДКИ
        {
            id: 103,
            name: "Zip-худи 'Burberry'",
            price: 625,
            size: "XL",
            description: "Под заказ. Серое зип-худи.",
            images: ["images/zip-hoodie_burberry.jpg"],
            status: "ORDER"
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
            status: "ORDER"
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
            status: "ORDER"
        },
        {
            id: 502,
            name: "Рюкзак 'Supreme' (Черный)",
            price: 400,
            size: "OS",
            description: "Под заказ. Черный, с белым лого.",
            images: ["images/bag_supreme_black.png"],
            status: "ORDER"
        },
        {
            id: 503,
            name: "Ремень 'Gucci'",
            price: 225,
            size: "110cm",
            description: "Под заказ. Черный ремень, черная пряжка.",
            images: ["images/belt_black.png"],
            status: "ORDER"
        },
        {
            id: 504,
            name: "Ремень 'Gucci'",
            price: 225,
            size: "110cm",
            description: "Под заказ. Бежевый ремень, золотая пряжка.",
            images: ["images/glasses_black.png"],
            status: "ORDER"
        },
        {
            id: 505,
            name: "Сумка 'Lacoste'",
            price: 425,
            size: "OS",
            description: "Под заказ. Маленькая сумка-мессенджер.",
            images: ["images/mini_bag_lacoste_black.png"],
            status: "ORDER"
        },
        {
            id: 506,
            name: "Очки 'Chrome Hearts'",
            price: 175,
            size: "OS",
            description: "Под заказ. Черная оправа.",
            images: ["images/glasses_black.png"],
            status: "ORDER"
        },
        {
            id: 507,
            name: "Очки 'Chrome Hearts'",
            price: 175,
            size: "OS",
            description: "Под заказ. Прозрачная оправа.",
            images: ["images/glasses_white.png"],
            status: "ORDER"
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
    document.getElementById('filter-all').classList.add('active');
    document.getElementById('filter-stock').classList.remove('active');
    filterProducts(categoryKey, 'all');
    tg.MainButton.setText("← НАЗАД К КАТЕГОРИЯМ");
    tg.MainButton.show();
}


// --- 4. ФУНКЦИЯ: ФИЛЬТРАЦИЯ ТОВАРОВ ---

function filterProducts(categoryKey, filterType) {
    const allProducts = products[categoryKey] || [];
    let filteredProducts = [];

    if (filterType === 'stock') {
        filteredProducts = allProducts.filter(product => product.status === 'IN STOCK');
        document.getElementById('filter-all').classList.remove('active');
        document.getElementById('filter-stock').classList.add('active');
    } else { // 'all'
        filteredProducts = allProducts;
        document.getElementById('filter-all').classList.add('active');
        document.getElementById('filter-stock').classList.remove('active');
    }
    renderProducts(filteredProducts);
}


// --- 5. ФУНКЦИЯ: РЕНДЕРИНГ ТОВАРОВ (Обновлено для работы с basePrice) ---

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
        // Проверка на скидку: isSale: true И есть basePrice, discountPercent
        const isSale = product.isSale === true && product.basePrice && product.discountPercent > 0;


        const statusText = isOrder ?
                           '<span class="status-order">ПОД ЗАКАЗ</span>' :
                           '<span class="status-stock">В НАЛИЧИИ</span>';

        // --- 5.1. ЛОГИКА ЦЕНЫ И ЯРЛЫКА СКИДКИ ---
        let priceDisplayHtml = '';
        let saleBadgeHtml = '';

        let actualPrice; // Фактическая (новая) цена
        let roundedPmrPrice;
        let rawMdlPrice;
        let roundedMdlPrice;

        if (isSale) {
            const basePrice = product.basePrice;
            const discount = product.discountPercent;

            // 1. Расчет НОВОЙ ЦЕНЫ: Actual Price = Base Price * (1 - Discount / 100)
            actualPrice = basePrice * (1 - (discount / 100));

            // 2. Округление и конвертация для отображения
            roundedPmrPrice = roundToNearestTen(actualPrice);
            rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
            roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            // Старая цена для отображения
            const roundedOldPmrPrice = roundToNearestTen(basePrice);

            // Формируем ярлык и HTML
            const badgeText = `-${discount}%`;
            const rawOldMdlPrice = roundedOldPmrPrice * PMR_TO_MDL_RATE;
            const roundedOldMdlPrice = roundToNearestTen(rawOldMdlPrice);

            saleBadgeHtml = `<div class="product-badge sale-badge">${badgeText}</div>`;

            priceDisplayHtml = `
                <p class="price-display">
                    <span class="old-price">${roundedOldPmrPrice} PMR / ~${roundedOldMdlPrice} MDL</span>
                    <strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL
                </p>
            `;

            // --- Если товар без скидки, используем стандартную логику (price) ---
        } else {
            actualPrice = product.price || 0; // Используем 'price'
            roundedPmrPrice = roundToNearestTen(actualPrice);
            rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
            roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            priceDisplayHtml = `<p class="price-display"><strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL</p>`;
        }
        // ------------------------------------------

        // Для кнопки "Купить" используем фактическую цену, которая была рассчитана (roundedPmrPrice)
        const buyButtonPrice = roundedPmrPrice;


        let imageHtml = '';
        if (imageUrl) {
            imageHtml = `
                <div class="product-image-container" onclick='openGallery("${currentCategoryKey}", ${product.id})'>
                    <img src="${imageUrl}" alt="${product.name}">
                    ${saleBadgeHtml} ${isOrder ? `
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