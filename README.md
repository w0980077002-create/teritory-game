# Territory — Sdolars S89 FINAL

Готовая GitHub/Cloudflare сборка Telegram Mini App.

## Файлы
- `index.html` — мобильный клиент.
- `worker.js` — Cloudflare Worker + Durable Object + SQLite.
- `wrangler.jsonc` — Static Assets + GAME_HUB + SQLite migration v1.
- `package.json` — Wrangler scripts.
- `assets/home-screen.png` — единая полноэкранная сцена.

## Деплой
1. Распаковать ZIP.
2. Загрузить содержимое в GitHub.
3. В Cloudflare выполнить `npm install`, затем `npm run deploy`.

## Сервер
Энергия: +1 каждые 5 минут, cap 500. Обновляется в начале каждого `action()`.
Бой: 4 зоны, 1 атака + ровно 2 разные защиты. Сервер валидирует и рассчитывает урон/крит/блок/уклонение.
Все перечисленные игровые экшены обрабатываются на сервере.
Игроки хранятся в SQLite Durable Object.
