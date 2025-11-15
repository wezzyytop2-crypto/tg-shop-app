// app.js (Режим: Telegram Mini App v=4.7 - Галерея + Визуальное выделение "Под заказ")

// --- Глобальные переменные состояния ---
let currentCategoryKey = null; // Хранит ключ текущей категории для фильтрации
// ---------------------------------------

// --- Глобальные переменные для галереи (НОВЫЕ) ---
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
// ВНИМАНИЕ: Поле 'image' заменено на 'images' (МАССИВ СТРОК)
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "Под заказ. Бежевое худи.", images: ["images/essentails.png"], status: "ORDER" },
        // Пример с двумя фотографиями для демонстрации галереи:
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "В наличии. Черное зип-худи.", images: ["images/zip-hoofie_ralph.png", "images/zip-hoofie_ralph_detail.png"], status: "IN STOCK" },
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Под заказ. Серое зип-худи.", images: ["images/zip-hoodie_burberry.jpg"], status: "ORDER" }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "Под заказ. Чёрная футболка Bape.", images: ["images/bape.png"], status: "ORDER" },
    ],

    jackets: [],
    sneakers: [],

    accessories: [
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "Под заказ. Металлический цвет.", images: ["images/bag_supreme_silver.png"], status: "ORDER" },
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Под заказ. Черный, с белым лого.", images: ["images/bag_supreme_black.png"], status: "ORDER" },
        // Исправлен путь к изображению
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Под заказ. Черный ремень, черная пряжка.", images: ["images/belt_black.png"], status: "ORDER" },
        { id: 504, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Под заказ. Бежевый ремень, золотая пряжка.", images: ["images/glasses_black.png"], status: "ORDER" },
        { id: 505, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "Под заказ. Маленькая сумка-мессенджер.", images: ["images/mini_bag_lacoste_black.png"], status: "ORDER" },
        { id: 506, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Под заказ. Черная оправа.", images: ["images/glasses_black.png"], status: "ORDER" },
        { id: 507, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Под заказ. Прозрачная оправа.", images: ["images/glasses_white.png"], status: "ORDER" }
    ]
};


// --- 3. Функционал: Отображение товаров (Только переключение вида) ---

function showCategory(categoryKey, categoryName) {
    currentCategoryKey = categoryKey;

    document.title = `U L A N S _ S T O R E — ${categoryName}`;

    document.getElementById('category-view').style.display = 'none';
    document.getElementById('product-list').style.display = 'block';

    document.getElementById('current-category-title').textContent = categoryName.toUpperCase();
    document.querySelector('footer').style.display = 'none';

    // Активируем фильтр "ВСЕ ТОВАРЫ" по умолчанию
    document.getElementById('filter-all').classList.add('active');
    document.getElementById('filter-stock').classList.remove('active');

    // Показываем все товары при входе в категорию
    filterProducts(categoryKey, 'all');

    // Включаем TWA MainButton для навигации "Назад"
    tg.MainButton.setText("← BACK TO CATEGORIES");
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


// --- 5. ФУНКЦИЯ: РЕНДЕРИНГ ТОВАРОВ (ОБНОВЛЕНА ДЛЯ ГАЛЕРЕИ И ОВЕРЛЕЯ) ---

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

        // Используем первое изображение из массива для превью
        const imageUrl = product.images && product.images.length > 0 ? baseUrl + product.images[0] : null;

        const roundedPmrPrice = roundToNearestTen(product.price);
        const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
        const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

        const isOrder = product.status !== 'IN STOCK';

        const statusText = isOrder ?
                           '<span class="status-order">ПОД ЗАКАЗ</span>' :
                           '<span class="status-stock">В НАЛИЧИИ</span>';

        // Создание контейнера для изображения с обработчиком клика и оверлеем
        let imageHtml = '';
        if (imageUrl) {
            imageHtml = `
                <div class="product-image-container" onclick="openGallery('${currentCategoryKey}', ${product.id})">
                    <img src="${imageUrl}" alt="${product.name}">
                    ${isOrder ? `
                        <div class="product-order-overlay">
                            <span class="order-label">ПОД ЗАКАЗ</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        item.innerHTML = `
            ${imageHtml}

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


// --- 6. Функционал: Обработка действия "Купить" ---
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

    document.title = 'U L A N S _ S T O R E | Fashion Store';

    document.querySelector('footer').style.display = 'flex';

    tg.MainButton.hide();
}

// --- 9. Функционал: Кнопка "Домой" ---
function goHome() {
    goBack();
}


// --- 10. ФУНКЦИОНАЛ: ГАЛЕРЕЯ (НОВЫЙ БЛОК) ---

function openGallery(productKey, productId) {
    // 1. Находим товар по ID
    const category = products[productKey];
    const product = category.find(p => p.id === productId);

    if (!product || !product.images || product.images.length === 0) return;

    // 2. Устанавливаем глобальное состояние галереи
    currentGalleryImages = product.images;
    currentImageIndex = 0;

    // 3. Рендерим галерею
    renderGallery();

    // 4. Показываем модальное окно
    document.getElementById('gallery-modal').style.display = 'block';
}

function closeGallery() {
    document.getElementById('gallery-modal').style.display = 'none';
}

function renderGallery() {
    const mainImg = document.getElementById('modal-main-img');
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";

    // Скрываем навигацию, если фото одно
    const prevBtn = document.querySelector('.prev-img');
    const nextBtn = document.querySelector('.next-img');
    const isSingleImage = currentGalleryImages.length <= 1;
    prevBtn.style.display = isSingleImage ? 'none' : 'block';
    nextBtn.style.display = isSingleImage ? 'none' : 'block';
    thumbnailsContainer.style.display = isSingleImage ? 'none' : 'block';

    // 1. Устанавливаем основное изображение
    mainImg.src = baseUrl + currentGalleryImages[currentImageIndex];

    // 2. Рендерим превью (только если их > 1)
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
// --- КОНЕЦ НОВОГО БЛОКА ---