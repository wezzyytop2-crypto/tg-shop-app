// app.js (Режим: Стандартный Веб-сайт v=3.1 - LoveCross Style)

// --- 0. НАСТРОЙКИ КУРСА ВАЛЮТ ---
const PMR_TO_MDL_RATE = 1 / 0.94;
// ---------------------------------

// --- ФУНКЦИЯ ОКРУГЛЕНИЯ ЦЕНЫ ДО БЛИЖАЙШЕГО ЦЕЛОГО ДЕСЯТКА ---
function roundToNearestTen(price) {
    return Math.round(price / 10) * 10;
}


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР) ---
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


// --- 3. Функционал: Отображение товаров ---

function showCategory(categoryKey, categoryName) {
    const categoryProducts = products[categoryKey] || [];
    const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";

    document.title = `U L A N S _ S T O R E — ${categoryName}`;

    document.getElementById('category-view').style.display = 'none';
    const productListDiv = document.getElementById('product-list');
    const productsContainer = document.getElementById('product-items-container');
    const currentCategoryTitle = document.getElementById('current-category-title');

    currentCategoryTitle.textContent = categoryName.toUpperCase(); // Устанавливаем заголовок категории

    productsContainer.innerHTML = '';
    productListDiv.style.display = 'block';

    document.querySelector('footer').style.display = 'none'; // Скрываем футер в режиме просмотра товаров

    if (categoryProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="product-item" style="text-align: center; border: none; padding: 20px;">
                <h3>Товаров в этой категории пока нет 😞</h3>
            </div>
        `;
    } else {
        categoryProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-item';

            const imageUrl = product.image ? baseUrl + product.image : null;

            const roundedPmrPrice = roundToNearestTen(product.price);
            const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
            const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

            item.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}">` : ''}

                <div class="product-text-content">
                    <h3>${product.name}</h3>
                    <p><strong>Size:</strong> ${product.size}</p>
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
}


// --- 4. Функционал: Обработка действия "Купить" ---
function buyProduct(id, name, price) {
    const sellerUsername = 'ulans_sttore';
    const messageText = encodeURIComponent(`Здравствуйте! Хочу заказать товар: ${name} (ID: ${id}) за ${price} ПМР.`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    window.open(telegramUrl, '_blank');
}

// --- 5. Функционал: Обработка действия "Запросить детальные фото" ---
function requestPhotos(id, name) {
    const sellerUsername = 'ulans_sttore';
    const messageText = encodeURIComponent(`Здравствуйте! Можно попросить детальные фото товара: ${name} (ID: ${id}). Спасибо!`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    window.open(telegramUrl, '_blank');
}

// --- 6. Функционал: Кнопка "Назад" ---
function goBack() {
    document.getElementById('category-view').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';

    document.title = 'U L A N S _ S T O R E | Fashion Store'; // Восстанавливаем основной заголовок

    document.querySelector('footer').style.display = 'block'; // Показываем футер
}

// --- 7. Функционал: Кнопка "Домой" (при клике на название магазина в шапке) ---
function goHome() {
    goBack(); // Используем ту же логику, что и для кнопки "Назад"
}