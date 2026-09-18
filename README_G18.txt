Territory G18 — side-button tap fix

GAME repo:
w0980077002-create/teritory-game

Upload/replace in the GAME root:
- arena.js
- mobile-layout-fix.js

Do NOT edit index.html.
Do NOT delete other files.
Keep territory_reference_bg.png and the approved artwork.

Fix:
The old transparent v5 hitboxes were still sitting over the visible side buttons. Their coordinates no longer matched the final background, so tapping Tavern could trigger Forge.

G18 disables those old hitboxes on the home screen and routes the visible buttons:
- Кузница → equipment/forge panel
- Таверна → Sdolars districts panel
- Магазин → market panel

The visual composition is not changed.
