# Territory S78 — REALTIME SERVER

S78 turns the S77 client bridge into a real WebSocket/HTTP server foundation.

## Included
- `index.html` — GitHub Pages client, still works without a server.
- `server.js` — authoritative room/event relay over WebSocket.
- `package.json` — Node.js dependency definition.
- `/health` — server health endpoint.
- `POST /api/room` — creates a room code.
- `/ws` — realtime WebSocket endpoint.
- Room join/leave, presence, game-event broadcast.
- Optional Telegram Web App `initData` HMAC verification through `TELEGRAM_BOT_TOKEN`.
- Maximum 50 connected clients per room.

## Important deployment architecture
GitHub Pages remains the static frontend. It cannot run `server.js` itself. The server therefore has to be deployed separately on a Node.js-capable host, while the game continues to be served from GitHub Pages. No Cloudflare files or dependency are included.

Set the client endpoint before enabling automatic connection:
```html
<script>window.TERRITORY_SERVER_CONFIG={url:'https://YOUR-SERVER.example',auto:true};</script>
```

For Telegram verification, set:
```bash
TELEGRAM_BOT_TOKEN=...
```

The current client deliberately stays in local mode until a real server URL is configured; it does not fake an online connection.
