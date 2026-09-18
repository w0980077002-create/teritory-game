Territory G12 — FINAL mobile framing fix

GAME repo:
w0980077002-create/teritory-game

Upload/replace in the GAME root:
- arena.js
- mobile-layout-fix.js

Do NOT edit index.html.
Do NOT delete existing files.

G12 fixes the actual problem seen on Samsung A23:
the artwork was confined to an inner 78px/64px area, creating large black bands.
The new CSS makes the existing city artwork fill the complete game viewport.

Also:
- hides the temporary floating Alex button;
- adds an invisible touch area over the full-body Alex on the LEFT, so tapping Alex still opens his quest dialog;
- keeps the existing game logic and buttons.
