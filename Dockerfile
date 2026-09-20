# Territory G112 — SERVER fix

## What is fixed
- Telegram WebApp `initData` is accepted from the JSON body (`{ "initData": "..." }`) as used by the current Territory frontend.
- The request body is read from `request.clone()`, so `/api/progress` can still read the original body.
- Telegram `/start` and `/game` webhook support is preserved.
- Game button uses the canonical bot link: `https://t.me/TeritoryGameBot?startapp` (one `r` in `Teritory`).
- Existing Durable Object classes and the existing database code are preserved from the supplied SERVER worker source.
- `wrangler.toml` is intentionally not changed.

## Install
1. In `w0980077002-create/territory-sdolars-server`, replace **only** `worker.js` with the included `worker.js`.
2. Keep the existing `wrangler.toml` and Cloudflare secrets unchanged.
3. Let the GitHub → Cloudflare deployment finish.
4. Do not upload this ZIP directly into the Cloudflare Worker editor.

## Telegram checks after deployment
Open:
- `/api/telegram-webhook-info`
- `/api/setup-telegram-webhook` once if the webhook is not set

Then open `@TeritoryGameBot` and send `/start`.
