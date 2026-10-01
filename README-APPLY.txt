TERRITORY — TELEGRAM RESTORE WORKING 01

ЦЕЛЬ:
Вернуть Telegram-вход к рабочей схеме, которая была до нынешнего Identity Pass:
Telegram Mini App -> Telegram.WebApp.initData -> Cloudflare Worker -> профиль игрока.

ЗАМЕНИТЬ:
- index.html
- territory-telegram-auth-pass54.js

ВАЖНО:
- BotFather НЕ менять.
- Main App URL НЕ менять: https://teritory-game.onrender.com/
- Cloudflare вручную НЕ деплоить.
- Другие игровые файлы НЕ менять.

ЧТО УБРАНО ИЗ ЦЕПОЧКИ:
- territory-telegram-gate-01.js больше не подключается.
- Новый ожидатель Telegram/initData из Identity Pass 02 больше не используется.

ЧТО ВОЗВРАЩЕНО:
- старая Foundation Complete 07 авторизация;
- Telegram.WebApp.initData;
- серверная авторизация через /api/player;
- отображение Telegram имени/фото через существующий profile UI;
- повторный вход в Mini App;
- существующий серверный state sync и migration.

ПРОВЕРКА:
1. Загрузить два файла из ZIP в GitHub с заменой.
2. Ничего больше не удалять.
3. Подождать автоматический деплой.
4. Открыть игру именно через @TeritoryGameBot.
5. Проверить имя и фото Telegram на главной.
6. Выйти из Mini App и открыть снова.

Это НЕ откат всей игры. Это точечный возврат только Telegram transport/auth к проверенному рабочему состоянию.
