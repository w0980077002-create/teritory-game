Territory G58 — GLOBAL CORE STABILIZATION

BASE: G56 control version + existing G57 Alex interaction fix.

GLOBAL CHANGE:
- City visual remains locked to sdolars_clean_scene.png.
- Replaced the visible City interaction surface with ONE generated hit layer.
- Legacy City hotspot/UI layers are disabled from pointer input so the same tap is not routed by multiple systems.
- Added TerritoryApp bridge with a single City routing gateway.
- Existing PvE, Arena, equipment, quests and economy implementations are not rewritten in this version; this pass establishes the migration boundary for the next global consolidation.
- Alex keeps the existing transparent interaction target and quest dialogue.

IMPORTANT:
- This is a global architecture/stability pass, not a visual redesign.
- No 3D / Three.js.
- PvE and Arena remain separate.
- SERVER is untouched; real multiplayer still requires WebSocket/server work.

CHANGED FILES:
- index.html
- Territory_G58_CORE.js
- README_G58_CORE.txt

BASE FILES PRESERVED:
- sdolars_clean_scene.png
- app.js
- Territory_G56_GLOBAL.js
- arena.js / arena.css
- style.css / game.css / Territory_G48_GLOBAL.css
- alex_duke_portrait.jpg
