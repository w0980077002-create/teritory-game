Territory G70 — SERVER-READY ARCHITECTURE

BASE: G69 Gameplay Loop.

CHANGED / NEW:
- Territory_G70_SERVER_READY.js — client/server contract layer.
- index.html — loads G70 before the G69 loop.
- README_G70_SERVER_READY.txt — build notes.

WHAT G70 DOES:
- Creates a persistent session id and monotonic event sequence.
- Queues gameplay events in a local outbox for future server/WebSocket delivery.
- Provides snapshot(), stateDigest(), drain(), ack() and applyServerPatch().
- Supports local/server mode flag without requiring a server today.
- Keeps the existing localStorage game playable.
- Does not replace PvE, Arena, Character, Economy, Districts or City visuals.

IMPORTANT:
- No real network connection is included in G70.
- The server must eventually become authoritative for economy, inventory, progression and PvP.
- This build intentionally prepares the contract before introducing a backend.
