Territory — Telegram Server Save V10

Основа: рабочая Territory_Telegram_PROFILE_V9.
Добавлено только серверное сохранение через Cloudflare Worker.

Frontend server:
https://territory-sdolars-server.w0660077702.workers.dev

Что сделано:
- Telegram Mini App initData отправляется на /api/auth.
- Для нового Telegram-пользователя локальный прогресс переносится на сервер, если локальный save принадлежит тому же Telegram ID.
- Для существующего игрока серверный state загружается при входе.
- Изменения сохраняются локально сразу и на сервер с короткой задержкой.
- Если сервер временно недоступен, игра продолжает работать на localStorage.
- Визуал и рабочие экраны V9 не переделывались.

Важно:
- TELEGRAM_BOT_TOKEN не хранится во frontend и не должен попадать в GitHub.
- Секрет уже должен быть добавлен в Cloudflare Runtime variables and secrets.
