Territory G78 — REALTIME GAME CLIENT

BASE: G76 GAME + G75 Presence/Party.

CHANGED FILES ONLY:
- index.html
- Territory_G78_REALTIME.js
- README_G78_REALTIME.txt

WHAT G78 DOES:
- Connects the GAME client to the G77 Cloudflare Worker WebSocket at /api/ws.
- Authenticates the socket with Telegram.WebApp.initData.
- Receives real server Presence updates.
- Sends the player's Ready state to the server.
- Sends Party invites through the server.
- Routes the G72 city chat through the real server when connected.
- Reconnects automatically after a dropped socket.
- Sends heartbeat ping messages.

IMPORTANT:
- This is a GAME/client update. Do NOT upload this ZIP to the SERVER repo.
- G77 SERVER must already be deployed for realtime features to connect.
- If opened outside Telegram, the client remains local and does not invent a fake online connection.
- PvE, Arena rules and the approved City visual are untouched.
