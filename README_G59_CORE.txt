Territory G59 — GAME CORE CONSOLIDATION

BASE: G58 CORE / G56 control gameplay.

GLOBAL CHANGE:
- Introduces one canonical in-memory TerritoryStore for the whole client.
- City, PvE, Arena and progression modules now share the same state object.
- Legacy PvE engine inside app.js is removed; canonical fullscreen PvE remains in Territory_G56_GLOBAL.js.
- App save and Global save write through the same canonical state.
- Cross-tab storage updates merge into the shared state instead of replacing module-local objects.
- G58 City interaction layer remains in place.
- City artwork, Arena module and visual reference are preserved.

NOT CHANGED:
- No 3D / Three.js.
- No server/WebSocket implementation yet.
- Inventory/Market legacy duplication is intentionally left for the next consolidation pass.
- Alex visual artwork and quest remain preserved.

CHANGED FILES:
- index.html
- app.js
- Territory_G56_GLOBAL.js
- Territory_G59_CORE.js (new)
- README_G59_CORE.txt

QUALITY GATE:
- JavaScript syntax checked.
- ZIP integrity checked.
- Loader order checked: G59 store -> app -> Arena -> G56 gameplay -> G58 City gateway.
