# Territory S90 — Cloudflare FIX

Загружать содержимое этого архива непосредственно в корень GitHub-репозитория.

В корне должны быть:
- index.html
- worker.js
- wrangler.jsonc
- package.json
- assets/

Исправлено:
- Worker `/api/health` теперь показывает `s90-final`.
- Для HTML/JS/CSS/JSON добавлены `no-store/no-cache`, чтобы старый интерфейс не удерживался кэшем Cloudflare/браузера.
- Статический frontend остаётся S90.
