Territory — Sdolars
s47 recovery/fix package

Состав:
- worker.js — сервер/Cloudflare Worker
- index.html — сохранённая версия интерфейса s47
- package.json — Wrangler
- wrangler.jsonc — Cloudflare Worker config
- .github/workflows/deploy.yml — исправленный GitHub Actions deploy

Критическое исправление:
command: deploy worker.js --config wrangler.jsonc

Это устраняет ошибку Wrangler Missing entry-point.
