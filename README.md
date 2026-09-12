# Territory — Sdolars — S88 FIXED

Исправленная версия для ручной загрузки в GitHub.

## Что исправлено
- Убран сломанный `worker.js` с `const ZONES =;`.
- Бой приведён к 4 зонам: Голова / Грудь / Пояс / Ноги.
- Атака: 1 зона. Защита: 2 разные зоны.
- Убрана вторая копия `index.html` из Worker: теперь Worker отдаёт реальный `index.html` из Static Assets.
- Исправлен Telegram Web App script URL.
- Добавлен `assets` binding в `wrangler.jsonc`.
- `index.html` и Worker используют одну и ту же 4-зонную боевую логику.
- API/ Durable Object маршруты сохранены.

## Загрузка
Загрузить содержимое этой папки в корень репозитория GitHub и заменить старые:
`worker.js`, `index.html`, `wrangler.jsonc`, `package.json`.

После Deploy Cloudflare Worker должен отдавать `/index.html` именно из Static Assets.
