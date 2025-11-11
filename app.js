// app.js (Обновлено: Категории 'jackets' и 'sneakers' теперь пусты)

// --- 1. Данные: Список ваших товаров ---
const products = {

    hoodies_sweats: [
        { id: 101, name: "Худи Essentials (Бежевое)", price: 575, size: "XL", description: "Новое, с бирками. Отличный оверсайз крой." },
        { id: 102, name: "Zip-худи 'Polo Ralph Lauren'", price: 550, size: "L (M)", description: "Черное худи на молнии. Оригинал, новая вещь." },
        { id: 103, name: "Zip-худи 'Burberry'", price: 625, size: "XL", description: "Светло-серое, подкладка капюшона в клетку. Очень плотное." }
    ],
    t_shirts: [
        { id: 401, name: "Футболка 'Bape' (Black)", price: 375, size: "L", description: "Чёрная футболка с клетчатым логотипом Bape. В наличии." },
        { id: 402, name: "Футболка 'Stussy' (Базовая)", price: 3200, size: "S", description: "Черный цвет, новый дроп." }
    ],

    // ПУСТОЙ МАССИВ
    jackets: [],

    // ПУСТОЙ МАССИВ
    sneakers: [],

    accessories: [
        { id: 501, name: "Рюкзак 'Supreme' (Серебро)", price: 425, size: "OS", description: "Продан. Металлический цвет, логотип на фасаде." },
        { id: 502, name: "Рюкзак 'Supreme' (Черный)", price: 400, size: "OS", description: "Продан. Черный, с белым логотипом." },
        { id: 503, name: "Ремень 'Gucci'", price: 225, size: "110cm", description: "Продан. Черный ремень, черная матовая пряжка с GG." },
        { id: 504, name: "Сумка 'Lacoste'", price: 425, size: "OS", description: "Продана. Маленькая сумка-мессенджер с узором." },
        { id: 505, name: "Очки 'Chrome Hearts'", price: 175, size: "OS", description: "Черная оправа, остались одни белые." }
    ]
};