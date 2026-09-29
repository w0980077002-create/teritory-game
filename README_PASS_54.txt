TERRITORY PASS 54 — TELEGRAM AUTH FOUNDATION

Adds Telegram WebApp SDK loading, client auth bridge, and server-backed identity.
No premium currency or combat authority is moved to the client.

INSTALL
1. Overlay these files onto the teritory-game repository.
2. Ensure index.html loads telegram-web-app.js, territory-progression-core.css, territory-progression-core.js and territory-telegram-auth-pass54.js.
3. If server is deployed separately, set window.TERRITORY_SERVER_URL before the auth bridge script.

IMPORTANT
The one-time legacy migration preserves an existing local guest profile, but the server cannot cryptographically prove old localStorage values. It is a compatibility bridge only. After migration, authoritative progression must be implemented server-side in later passes.
