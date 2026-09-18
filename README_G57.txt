Territory G57 — PvE resource/state repair + City hit-area fix

BASE: G56.

ONLY CHANGED FILES IN THIS PATCH:
- Territory_G57_GLOBAL.js
- index.html

Changes:
- Repairs an existing local save whose combatStone was incorrectly left at 0.
- Keeps the shared save keys territory_save_v1 and territory_save synchronized.
- PvE can start directly when the resource is available; the old intermediate screen only appears as a fallback if the resource is genuinely unavailable.
- Adds explicit invisible touch hit-area CSS for the baked City HUD resources and controls, so the visible artwork remains untouched while the underlying buttons receive taps reliably.
- index.html now loads Territory_G57_GLOBAL.js with cache-bust v570.

NOT changed:
- City artwork.
- Arena.
- app.js.
- arena.js / arena.css.
- style.css / game.css.
