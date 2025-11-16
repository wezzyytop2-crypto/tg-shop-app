// app.js (Режим: Telegram Mini App v=6.6 - Категория jackets пустая, кнопка возвращена, текст "приобрести")

// --- Глобальные переменные состояния ---
let currentCategoryKey = null; 
let currentGalleryImages = [];
let currentImageIndex = 0;
// -------------------------------------------------


// --- 1. Настройка TWA и Цвета ---
const tg = window.Telegram.WebApp;
tg.ready();

const mainColor = '#404040';
const buttonTextColor = '#ffffff';

const headerColor = tg.themeParams.header_bg_color || '#ffffff';
const bgColor = tg.themeParams.bg_color || '#ffffff';

tg.setHeaderColor(headerColor);
tg.setBackgroundColor(bgColor); 

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

// --- УТИЛИТА: Проверка статуса "Новинка" ---
function isProductNew(product) {
    return product.isNew && product.newUntil && (new Date(product.newUntil) > Date.now());
}

// --- УТИЛИТА: Проверка статуса "SALE" ---
function isProductSale(product) {
    return product.isSale === true && product.basePrice && product.discountPercent > 0;
}

// --- УТИЛИТА: Проверка, доступен ли товар в принципе ---
function isProductAvailable(product) {
    return product.status === 'IN STOCK' || product.status === 'ORDER';
}


// --- 2. Данные: Список ваших товаров (ЦЕНЫ В ПМР). ---
const products = {

    hoodies_sweats: [
        { 
            id: 101, 
            name: "Худи Essentials (Бежевое)", 
            price: 490, 
            size: "XL", 
            description: "Под заказ. Бежевое худи.", 
            images: ["images/essentails.png"], 
            status: "ORDER",
            isNew: false, 
            newUntil: null 
        }, 
        { 
            id: 102, 
            name: "Zip-худи 'Polo Ralph Lauren'", 
            basePrice: 550,          
            discountPercent: 20,     
            size: "L (M)", 
            description: "В наличии. Черное зип-худи. СКИДКА -20%!", 
            images: ["images/zip-hoofie_ralph.png", "images/zip-hoodie_burberry.jpg"], 
            status: "IN STOCK", 
            isSale: true,
            isNew: false, 
            newUntil: null
        },
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

    // Категория "Куртки" (jackets) - ПУСТО
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


// --- 3. ФУНКЦИЯ: ФИЛЬТРАЦИЯ ТОВАРОВ ---

function filterProducts(categoryKey, filterType, categoryName = null) {
    
    currentCategoryKey = categoryKey;
    
    document.getElementById('category-view').style.display = 'none';
    document.getElementById('product-list').style.display = 'block';
    document.querySelector('footer').style.display = 'none'; 
    
    if (categoryName) {
        document.getElementById('current-category-title').textContent = categoryName.toUpperCase();
        document.title = `U L A N S _ S T O R E — ${categoryName}`;
    }

    const allProducts = products[categoryKey] || [];
    let filteredProducts = allProducts;
    
    const filterButtons = ['filter-all', 'filter-stock', 'filter-new', 'filter-sale'];
    filterButtons.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`filter-${filterType}`);
    if(activeBtn) activeBtn.classList.add('active');


    if (filterType === 'stock') {
        filteredProducts = allProducts.filter(product => product.status === 'IN STOCK');
        
    } else if (filterType === 'new') {
        filteredProducts = allProducts.filter(product => isProductNew(product));

    } else if (filterType === 'sale') {
        filteredProducts = allProducts.filter(product => isProductSale(product));

    } else { // 'all'
        filteredProducts = allProducts;
    }
    
    renderProducts(filteredProducts);

    tg.MainButton.setText("← НАЗАД К КАТЕГОРИЯМ");
    tg.MainButton.show();
}


    // --- 5. ФУНКЦИЯ: РЕНДЕРИНГ ТОВАРОВ ---

    function renderProducts(productsToRender) {
        const productsContainer = document.getElementById('product-items-container');
        const baseUrl = "https://wezzyytop2-crypto.github.io/tg-shop-app/";
        productsContainer.innerHTML = '';

        if (productsToRender.length === 0) {
            // Сообщение для пустой категории или пустого фильтра
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

            const isAvailable = isProductAvailable(product); 
            const isOrder = product.status === 'ORDER';
        
            // --- ЛОГИКА СТАТУСОВ ---
            const isSale = isProductSale(product); 
            let saleBadgeHtml = '';
            const isNew = isProductNew(product);
            let newBadgeHtml = '';
        
            let statusText = '';
            if (product.status === 'IN STOCK') {
                statusText = '<span class="status-stock">В НАЛИЧИИ</span>';
            } else if (product.status === 'ORDER') {
                statusText = '<span class="status-order">ПОД ЗАКАЗ</span>';
            } else {
                statusText = '<span class="status-unavailable">НЕДОСТУПЕН</span>'; 
            }
        
            // --- 5.1. ЛОГИКА ЦЕНЫ И ЯРЛЫКОВ ---
            let priceDisplayHtml = '';
            let actualPrice; 
            let roundedPmrPrice;

            if (isSale) {
                const basePrice = product.basePrice;
                const discount = product.discountPercent;
                actualPrice = basePrice * (1 - (discount / 100));
                roundedPmrPrice = roundToNearestTen(actualPrice);
            
                const roundedOldPmrPrice = roundToNearestTen(basePrice);
                const rawOldMdlPrice = roundedOldPmrPrice * PMR_TO_MDL_RATE;
                const roundedOldMdlPrice = roundToNearestTen(rawOldMdlPrice);
                const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
                const roundedMdlPrice = roundToNearestTen(rawMdlPrice);

                saleBadgeHtml = `<div class="product-badge sale-badge">-${discount}%</div>`;
                priceDisplayHtml = `
                <p class="price-display">
                    <span class="old-price">${roundedOldPmrPrice} PMR / ~${roundedOldMdlPrice} MDL</span>
                    <strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL
                </p>
            `;
            } else {
                actualPrice = product.price || 0; 
                roundedPmrPrice = roundToNearestTen(actualPrice);
                const rawMdlPrice = roundedPmrPrice * PMR_TO_MDL_RATE;
                const roundedMdlPrice = roundToNearestTen(rawMdlPrice);
                priceDisplayHtml = `<p class="price-display"><strong>${roundedPmrPrice} PMR</strong> / ~${roundedMdlPrice} MDL</p>`;
            }
        
            if (isNew) {
                newBadgeHtml = `<div class="product-badge new-badge">NEW</div>`;
            }
        
            const combinedBadgeHtml = newBadgeHtml + saleBadgeHtml;
            const buyButtonPrice = roundedPmrPrice;

            let imageHtml = '';
            if (imageUrl) {
                imageHtml = `
                <div class="product-image-container" onclick='${isAvailable ? `openGallery("${currentCategoryKey}", ${product.id})` : ''}'>
                    <img src="${imageUrl}" alt="${product.name}">
                    ${combinedBadgeHtml}
                    ${!isAvailable ? `
                        <div class="product-unavailable-overlay">
                            <span class="unavailable-label">НЕДОСТУПЕН</span>
                        </div>
                    ` : isOrder ? `
                         <div class="product-order-overlay">
                            <span class="order-label">ПОД ЗАКАЗ</span>
                        </div>
                    ` : ''}
                </div>
            `;
            }
        
            // Логика кнопки. 
            let buyButtonText = isOrder ? 'ЗАКАЗАТЬ' : 'КУПИТЬ';
            let buyButtonHtml;
        
            if (isAvailable) {
                const buyButtonClass = isOrder ? 'buy-button order-button' : 'buy-button';
                buyButtonHtml = `
                <button class="${buyButtonClass}" onclick="buyProduct(${product.id}, \`${product.name}\`, ${buyButtonPrice})">
                    ${buyButtonText}
                </button>
            `;
            } else {
                // Кнопка недоступна (disabled)
                buyButtonHtml = `
                <button class="buy-button unavailable-button" disabled>
                    НЕДОСТУПЕН
                </button>
            `;
            }


            item.innerHTML = `
            ${imageHtml}
            <div class="product-text-content">
                <h3>${product.name}</h3>
                <p><strong>Size:</strong> ${product.size} ${statusText}</p>
                <p>${product.description}</p>
                ${priceDisplayHtml} 
                <div class="button-group">
                    ${buyButtonHtml}
                    <button class="photo-button" onclick="requestPhotos(${product.id}, \`${product.name}\`)">ЗАПРОСИТЬ ФОТО</button>
                </div>
            </div>
        `;
            productsContainer.appendChild(item);
        });
    }


    // --- 6. Функционал: Обработка действия "Купить" (Измененный текст) ---
    function buyProduct(id, name, price) {
        const sellerUsername = 'ulans_sttore';
        // ФИНАЛЬНЫЙ ТЕКСТ: "Хочу приобрести товар"
        const messageText = encodeURIComponent(`Здравствуйте! Хочу приобрести товар: ${name} (ID: ${id}) за ${price} ПМР.`);
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

    // --- 9. Функционал: Кнопка "Домой" (Клик по лого) ---
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