Territory G60 — CHARACTER / EQUIPMENT CORE

BASE: G59 CORE / G56 gameplay control.

GLOBAL CHANGE:
- Adds one canonical TerritoryCharacter service for the player character and equipment.
- Creates one shared item registry for weapons and armor.
- Centralizes equipment slots, equipped state, durability, repair, equipment bonuses and derived combat values.
- G56 Inventory / Equipment / Forge now consume the shared Character Core instead of maintaining their own item calculations.
- Equipment durability is spent through the shared service during PvE rounds; broken equipped items are automatically unequipped.
- Existing City visual, Alex interaction, PvE scene and Arena module are preserved.
- Removes the stale Territory_G58_CORE.js loader reference from index.html; G60 is now the final core loader.

ARCHITECTURE:
TerritoryStore = one persistent game state.
TerritoryCharacter = one character/equipment API.
G56 = gameplay/UI consumer.
Arena = separate PvP module.
City artwork = locked.

NOT INCLUDED:
- No 3D / Three.js.
- No server/WebSocket yet.
- No redesign of the Sdolars City artwork.
- No mixing of PvE and Arena.

CHANGED FILES:
- index.html
- Territory_G60_CORE.js (new)
- Territory_G56_GLOBAL.js
- README_G60_CORE.txt

BASE FILES PRESERVED:
- sdolars_clean_scene.png
- app.js
- arena.js / arena.css
- style.css / game.css / Territory_G48_GLOBAL.css
- alex_duke_portrait.jpg

QUALITY GATE:
- JS syntax check required for all JS files.
- ZIP integrity check required.
- Loader order: G60 Store/Character -> app -> Arena -> G56 gameplay.
