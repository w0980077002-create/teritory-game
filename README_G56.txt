Territory G56 — PvE resource/save synchronization fix

Replace these files in the GAME repo:
- Territory_G56_GLOBAL.js
- index.html

G56 fixes the combat-stone state so PvE and the resource panel use the same saved value.
If the newer save has an empty/zero combatStone while the legacy save contains a real value, the legacy value is migrated.
If there is no save at all, the prototype starts with 20 combat stones.
The HUD updater now also syncs energy and combat stones where matching HTML elements exist.
index.html now loads Territory_G56_GLOBAL.js?v=560.

City artwork and Arena mechanics are not changed.
SERVER is not changed.
