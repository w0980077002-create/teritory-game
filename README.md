# TERITORY — готовый каркас Telegram Mini App

## Что уже сделано

- Telegram Mini App интерфейс в стиле мобильной игры.
- Авторизация через Telegram `initData` с серверной проверкой подписи.
- Игрок: уровень, XP, сила, территория.
- Ресурсы: монеты, кристаллы, энергия.
- Бой с противником и 4 способности.
- Награды за победу и захват территории.
- Магазинные предметы и серверная покупка.
- PostgreSQL схема для игроков, инвентаря и боёв.
- Telegram-бот на grammY.
- Кнопка запуска Mini App.
- HTTPS готов через Render.
- Dockerfile.
- render.yaml для деплоя.

## Запуск локально

1. Установить Node.js 20+.
2. Скопировать `.env.example` в `.env`.
3. Заполнить `BOT_TOKEN`.
4. Для локального теста можно добавить `DEV_MODE=true`.
5. Выполнить:
   `npm install`
   `npm start`
6. Открыть `http://localhost:3000`.

## Публикация

Самый простой вариант — Render.

1. Создать GitHub-репозиторий и загрузить эту папку.
2. Создать Web Service из репозитория.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Добавить переменные:
   `BOT_TOKEN` — токен от @BotFather
   `BOT_USERNAME` — username бота без @
   `WEBAPP_URL` — HTTPS адрес Render
   `DATABASE_URL` — PostgreSQL connection string
6. После первого запуска открыть HTTPS URL.
7. В @BotFather настроить кнопку Menu / Web App на этот HTTPS URL.

## Важно

Никому не передавать BOT_TOKEN. Не вставлять его в HTML/JavaScript.

## Следующая большая версия

Можно добавить: PvP, кланы, торговлю, полноценную карту, строительство базы, экипировку, ежедневные задания, реферальную систему, лидерборд, админ-панель, платежи Telegram Stars и push-уведомления.
