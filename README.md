# Territory — Sdolars · S90 FINAL

Готовая мобильная сборка Territory для текущего Cloudflare Workers backend.

## Состав

- index.html — финальный мобильный интерфейс
- worker.js — текущий серверный GameHub и игровая логика
- wrangler.jsonc — Cloudflare Workers, Durable Objects и Static Assets
- package.json — команды Wrangler
- assets/home-screen.png — фон игровой сцены
- assets/home-screen-full.png — полный исходный арт

## Установка

1. Скопируйте содержимое этой папки в репозиторий.
2. Сохраните worker.js, wrangler.jsonc, package.json и папку assets.
3. Установите зависимости командой `npm install`.
4. Опубликуйте проект командой `npm run deploy`.

Фронтенд использует POST /api/state и POST /api/action. Боевой интерфейс работает с четырьмя зонами сервера: атака — одна зона, защита — две разные зоны. После завершения раунда используются серверные действия battle.reward и battle.loss.
