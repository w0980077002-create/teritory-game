Territory G83 — GAME AUTHORITY GATEWAY

BASE: G81 GAME.

GLOBAL PASS:
- Adds Territory_G83_AUTHORITY.js.
- Existing G81 daily/shop calls are upgraded to include unique server action IDs.
- GAME periodically reconciles server-authoritative economy fields:
  coins, gems, combatStone, inventory.
- Existing UI entry points remain compatible.
- PvE and Arena are intentionally NOT claimed to be server-authoritative yet.
- City artwork and gameplay visuals are untouched.

INSTALL:
Upload the GAME files as a normal GAME update to:
w0980077002-create/teritory-game

The SERVER side for this build is G83. If G83 SERVER is not deployed yet, the GAME falls back to its existing local state until server sync succeeds.
