Territory G76 — REAL SERVER BRIDGE

BASE: G75 Presence build.

CHANGED:
- index.html
- Territory_G76_SERVER_BRIDGE.js

WHAT THIS DOES:
- Connects the Telegram Mini App to the existing Cloudflare Worker over HTTPS.
- Sends Telegram.WebApp.initData to /api/auth; the server verifies it.
- Loads the verified player's saved state from the server.
- Sends game state to /api/save after queued game events and on manual sync.
- Keeps local mode when Telegram initData is unavailable.
- Uses the existing TerritoryServer/G70 contract and switches to server mode after successful auth.
- Never exposes TELEGRAM_BOT_TOKEN to the client.

SERVER:
https://territory-sdolars-server.w0660077702.workers.dev

IMPORTANT:
- This is a real HTTP server bridge, not a fake online indicator.
- The current Worker does not expose WebSocket endpoints yet, so G76 does not claim real-time multiplayer.
- Do not upload TELEGRAM_BOT_TOKEN to the GAME repository.
- City visual, PvE and Arena rules are untouched.

TEST:
1. Upload the G76 ZIP contents to the GAME repository.
2. Open the game inside Telegram so initData exists.
3. Open the Server panel if needed and confirm Telegram is connected.
4. Change a small non-critical value, wait a few seconds, then reload the game.
5. The saved state should come back from the Worker.
