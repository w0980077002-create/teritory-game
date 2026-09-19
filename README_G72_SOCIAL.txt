Territory G72 — SOCIAL / PROFILE / CHAT FOUNDATION

BASE: G71 Battle Contract.

CHANGES:
- Added a local-first Social Center for Profile, Friends, City Chat and Notifications.
- Profile uses the existing character/game state; no second player database is created.
- Friends/chat are prototype-local and stored inside territory_save_v1.
- Intercepts existing profile/messages city hit targets before legacy overlays so there is one social entry point.
- Prepared a small API: window.TerritorySocial.
- No real multiplayer, Telegram messaging or WebSocket transport is claimed yet.
- City artwork is untouched.
- PvE and Arena battle rules are untouched.

INSTALL:
Replace/add the G72 files from this package. Keep the existing G71 files.
