

const tg = window.Telegram.WebApp;
tg.ready();


const mainColor = '#E6B34A'; 
const headerColor = '#E6B34A';

tg.setHeaderColor(headerColor);
tg.MainButton.setParams({
    color: mainColor
});

const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "SELL. Бежевое худи.", image: "images/essentails.png" },
        
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "IN STOCK. Черное зип-худи.", image: "images/zip-hoofie_ralph.png" },
       
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "SELL. Серое зип-худи.", image: "images/zip-hoodie_burberry.jpg" }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "SELL. Чёрная футболка Bape.", image: "images/bape.png" },
    ],

    // ПУСТЫЕ МАССИВЫ для заполнения пустых категорий
    jackets: [],
    sneakers: [],

    accessories: [
        // Рюкзак 'Supreme' (Серебрянный) 
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "SELL. Металлический цвет.", image: "images/bag_supreme_silver.png" },
        // Рюкзак 'Supreme' (Черный) 
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "SELL. Черный, с белым лого.", image: "images/bag_supreme_black.png" },
        // Ремень 'Gucci'
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "SELL. Черный ремень, черная пряжка.", image: "images/black_gold.png" },
        // Ремень 'Gucci 2'
        { id: 504, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "SELL. Бежевый ремень, золотая пряжка.", image: "images/glasses_black.png" },
        // Сумка 'Lacoste'
        { id: 505, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "SELL. Маленькая сумка-мессенджер.", image: "images/mini_bag_lacoste_black.png" },
        // Очки 'Chrome Hearts1'
        { id: 506, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "SELL. Черная оправа.", image: "images/glasses_black.png" },
        // Очки 'Chrome Hearts2'
        { id: 506, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "SELL. Прозрачная оправа.", image: "images/glasses_white.png" }
    ]
};




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

   
            const imageFileName = product.image ? product.image.toLowerCase() : null;
            const imageUrl = product.image ? baseUrl + imageFileName : null;

            item.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width:100%; height:auto; border-radius: 8px; margin-bottom: 10px;">` : ''}

                <h3>${product.name}</h3>
                <p><strong>Размер:</strong> ${product.size}</p>
                <p>${product.description}</p>
                <p>Цена: **${product.price} руб.**</p>

                <div class="button-group">
                    <button class="buy-button" onclick="buyProduct(${product.id}, \`${product.name}\`, ${product.price})">Купить / Заказать</button>
                    <button class="photo-button" onclick="requestPhotos(${product.id}, \`${product.name}\`)">Запросить детальные фото</button>
                </div>
            `;
            productListDiv.appendChild(item);
        });
    }

    tg.MainButton.setText("← Вернуться к категориям");
    tg.MainButton.show();
}




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


function requestPhotos(id, name) {
    const sellerUsername = 'ulans_sttore'; 
    const messageText = encodeURIComponent(`Здравствуйте! Можно попросить детальные фото товара: ${name} (ID: ${id}). Спасибо!`);
    const telegramUrl = `https://t.me/${sellerUsername}?text=${messageText}`;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(telegramUrl);
        tg.showAlert(`Запрос детальных фото ${name} отправлен продавцу @${sellerUsername}. Откроется чат.`);
    } else {
        window.open(telegramUrl, '_blank');
        tg.showAlert(`Вы запросили фото: ${name}. Откройте чат с продавцом @${sellerUsername}.`);
    }
}



tg.MainButton.onClick(() => {
    document.getElementById('categories').style.display = 'block';
    document.getElementById('product-list').style.display = 'none';
    tg.MainButton.hide();
});