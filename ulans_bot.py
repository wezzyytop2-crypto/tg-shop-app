import telebot
from telebot import types

# 🚨 ОЧЕНЬ ВАЖНО: Замените эту строку на реальный токен вашего бота!
TOKEN = '8482822654:AAGFHCR-0XZTGx82X-YJ0GySPuunM23Pg8o' 
bot = telebot.TeleBot(TOKEN)

# URL вашего Mini App на GitHub Pages
WEB_APP_URL = 'https://wezzyytop2-crypto.github.io/tg-shop-app/'

@bot.message_handler(commands=['start'])
def send_welcome(message):
    # --- 1. Создаем Inline-кнопку, которая открывает Mini App ---
    markup = types.InlineKeyboardMarkup()
    
    # Объявляем, что кнопка должна открыть Web App по указанному URL
    web_app_button = types.WebAppInfo(url=WEB_APP_URL)
    
    # Добавляем кнопку с текстом "U L A N S _ S T O R E"
    markup.add(
        types.InlineKeyboardButton(
            text="U L A N S _ S T O R E", 
            web_app=web_app_button
        )
    )

    # --- 2. Отправляем приветственное сообщение с кнопкой ---
    bot.send_message(
        message.chat.id, 
        "Приветствуем! \n\n"
        "Ваш стиль начинается здесь. Нажмите на кнопку **U L A N S _ S T O R E**, чтобы перейти в полный каталог и начать покупки.",
        parse_mode="Markdown", # Используем Markdown для жирного шрифта
        reply_markup=markup
    )
    
    # КОД ДЛЯ УДАЛЕНИЯ /start (ВНИМАНИЕ: не всегда работает в личных чатах!)
    try:
        bot.delete_message(message.chat.id, message.message_id)
    except Exception as e:
        # Эта ошибка может возникнуть, если бот не имеет прав на удаление
        print(f"Не удалось удалить сообщение /start: {e}")

# Обязательная строка, чтобы бот начал слушать команды 24/7
bot.infinity_polling()