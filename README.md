# Territory S80 — REAL CLAN DATABASE

S80 adds a persistent server-side clan database on top of S79.

## Server
- Node.js + ws
- Persistent JSON database (`territory-data.json`)
- Clan create / list / join / leave
- Server-side clan membership and roles
- Telegram initData verification when `TELEGRAM_BOT_TOKEN` is configured
- `/health` endpoint

## Client
- Online clan panel
- Create or join a clan
- Member roster
- Server refresh
- Leave clan

GitHub Pages remains the static game client. The Node server must be hosted separately for cross-device online functionality. Cloudflare is not required.
