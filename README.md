# Territory — Sdolars · S89 VISUAL FINAL

Финальная мобильная сборка для Cloudflare Workers + Durable Objects + SQLite + Static Assets.

## Структура
- `index.html` — мобильный фронтенд S89 VISUAL
- `worker.js` — GameHub, Durable Object, игровая логика и 4-зонный бой
- `wrangler.jsonc` — конфигурация Workers/Assets/DO SQLite
- `package.json` — Wrangler scripts
- `assets/home-screen.png` — world backdrop для мобильной сцены
- `assets/home-screen-full.png` — исходный полный арт S89

## Деплой
```bash
npm install
npm run deploy
```

Static Assets настроены на корень проекта: `directory: "."`.
