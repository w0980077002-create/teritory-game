Territory G69 — GAMEPLAY LOOP CORE

BASE: G68 Character / Inventory / Equipment.

CHANGED/ADDED:
- Territory_G69_LOOP.js
- index.html loader

PURPOSE:
Connect the existing PvE, Arena, economy, quests, character and city progression into one visible gameplay-loop summary without replacing their engines.

Daily loop counters:
- PvE: 3 victories
- Arena: 2 battles
- Buy: 1 purchase

The module exposes window.TerritoryLoop and listens for territory:loop-mark events. Existing systems remain authoritative; no new combat engine is introduced.

CITY LOCK: sdolars_clean_scene.png and the City visual layout are untouched.
ARENA/PVE: separate systems remain untouched.
SERVER: no server/WebSocket functionality is claimed by this prototype.
