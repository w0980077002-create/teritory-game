Territory G61 — PvE BATTLE SCENE v2

BASE: G60 CHARACTER GLOBAL.

GLOBAL PASS:
- Replaced the older G56 PvE runtime with Territory_G61_BATTLE.js.
- Keeps PvE separate from Arena.
- Keeps the approved Sdolars City artwork untouched.
- Keeps the unified TerritoryStore / Character Core from G60.
- Adds a dedicated PvE battle control strip inspired by the supplied video reference: manual/auto mode, pause, battle log, and 1x/2x/3x speed.
- Adds battle streak feedback and tighter mobile controls.
- Preserves city progression, boss timer, rewards, hunger loss, durability and quest hooks.

FILES:
- CHANGED: index.html, Territory_G61_BATTLE.js, README_G61_BATTLE.txt
- BASE: Territory_G60_CORE.js, app.js, arena.js, arena.css, style.css, game.css, Territory_G48_GLOBAL.css, Territory_G56_GLOBAL.js, sdolars_clean_scene.png

IMPORTANT:
- 2D/mobile scene architecture only; no Three.js/3D.
- Arena remains a separate PvP system.
- Real cross-device multiplayer still requires a server/WebSocket layer.
