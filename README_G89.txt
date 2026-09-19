Territory G89 — Arena foundation fix

BASE:
- Built from the exact uploaded current GitHub files.
- app.js SHA: d9eff671e0d8d580a2b6257d54ec4f580fc30b27
- index.html SHA: 751267826eb3eb7b4ae59396bfca4271fda4442f

FIXES:
1. Fixed the real Arena navigation bug in app.js:
   showScreen('arena') is handled before the legacy #arena lookup.
2. index.html now loads Territory_G87_MULTIPLAYER.js?v=870 instead of G86.
3. G87 queues room_create/room_join until room_authenticated, removing the old 500ms auth race.
4. G88 is NOT required for this build.

UPLOAD:
Replace app.js and index.html in GitHub and add Territory_G87_MULTIPLAYER.js.
Do not delete arena.js or arena.css.
The City layout is not intentionally changed.

CONTROL:
This package does not include unrelated project changes.
