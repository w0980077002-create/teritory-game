# Territory — Sdolars · S90 GitHub/Cloudflare READY

Эта папка предназначена для загрузки **содержимого целиком в корень GitHub-репозитория** `teritory-game`.

Структура корня:
- index.html
- worker.js
- wrangler.jsonc
- package.json
- assets/home-screen.png
- assets/home-screen-full.png

Важно: **не загружать саму папку `Territory-S90-GITHUB-READY` внутрь репозитория**. На GitHub должны быть видны `index.html`, `worker.js`, `wrangler.jsonc`, `package.json` и `assets` непосредственно в корне.

Cloudflare Workers конфиг использует `main: worker.js` и Static Assets `directory: .`.

Для ручного деплоя:
`npm install`
`npm run deploy`
