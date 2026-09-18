Territory G17 — final viewport correction

GAME repo:
w0980077002-create/teritory-game

Upload/replace in the GAME root:
- arena.js
- mobile-layout-fix.js

Do NOT edit index.html.
Do NOT delete other files.

G17 does NOT change the approved G16 artwork.
It fixes the actual problem seen in the screenshot: the previous G12/G16 CSS forced object-fit: cover, which cropped the top HUD and bottom navigation. G17 restores the artwork to fill the complete game viewport without cover-cropping and disables the duplicate HTML reference HUD so the baked approved artwork remains clean.

The approved G16 background image stays as territory_reference_bg.png.
