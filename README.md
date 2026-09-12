# Territory — Sdolars / s2

Эта версия исправляет конфликт двух интерфейсов.

## Структура
- `assets/index.html` — единственный клиент игры.
- `worker.js` — API, Telegram auth и Durable Object.
- `wrangler.jsonc` — Cloudflare Workers + Assets.
- `package.json` — команды запуска.
- `README.md` — инструкция.

## Установка
1. Заменить содержимое репозитория этими файлами.
2. Убедиться, что `assets/index.html` находится именно в папке `assets`.
3. В Cloudflare Worker использовать этот `wrangler.jsonc`.
4. Для Telegram можно добавить секрет `TELEGRAM_BOT_TOKEN`.
5. Deploy: `npm install` затем `npm run deploy`.

## Что уже есть
- единый клиент вместо дублированного HTML;
- 3D-сцена Sdolars на Three.js;
- тактический бой: 1 зона атаки + 2 зоны защиты;
- HP, XP, уровни, сила, ловкость, победы/поражения;
- инвентарь, экипировка и выбрасывание;
- рынок;
- районы с уровнями доступа;
- квесты и ежедневная награда;
- казино;
- гильдия;
- RU/EN переключатель;
- сохранение в localStorage;
- серверное состояние через Durable Object;
- Telegram WebApp API.
