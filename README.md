# Territory — Sdolars / s4 GitHub Only

Это версия только для GitHub/static hosting.

## В корне
- `index.html` — единственный файл игры.

## Важно
- Cloudflare не используется.
- `worker.js` удалён.
- `wrangler.jsonc` удалён.
- `package.json` удалён.
- В игре нет зависимости от Cloudflare Worker.
- Telegram Web App подключается напрямую к клиенту.
- Сохранение текущего прототипа выполняется через localStorage.

Загружайте `index.html` в корень репозитория GitHub.

Если используется GitHub Pages, источник должен быть настроен на ветку `main` и папку `/ (root)`.
