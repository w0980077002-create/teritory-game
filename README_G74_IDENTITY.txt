Territory G74 — TELEGRAM IDENTITY / PLAYER ID FOUNDATION

BASE: G73 Party / Social build.

CHANGED/ADDED:
- Territory_G74_IDENTITY.js
- index.html (loader only)

FEATURES:
- Stable local Player ID.
- Reads Telegram WebApp user fields when the WebApp exposes them.
- Stores a local identity snapshot in the existing game state.
- Adds a Telegram ID tab to the existing G72 Social Center.
- Can queue an identity.snapshot event through the existing G70 server-ready outbox.

IMPORTANT:
- Telegram initData is NOT treated as server-verified.
- Real authentication/verification must happen on the future server.
- No separate registration/password/account is introduced.
- City artwork, PvE, Arena, Party and existing social data remain untouched.
