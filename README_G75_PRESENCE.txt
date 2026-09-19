Territory G75 — PLAYER PRESENCE / PARTY READY

BASE: G74 Telegram Identity / G73 Party.

CHANGED FILES:
- index.html
- Territory_G75_PRESENCE.js
- README_G75_PRESENCE.txt

Adds a local-first player presence foundation:
- online / away state
- local heartbeat timestamp
- ready toggle for future Party / Arena matching
- online friends view when friend records contain online state
- current party member readiness display
- TerritoryPresence API for future server heartbeat integration

IMPORTANT:
- This is NOT real cross-device online presence yet.
- Server heartbeat/WebSocket must be authoritative later.
- City artwork is untouched.
- PvE and Arena gameplay are untouched.
- Telegram identity remains client-readable only until server verification.
