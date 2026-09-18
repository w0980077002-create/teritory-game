Territory G66 — MAP / DISTRICTS CORE

BASE: G65 Events/Economy build.

CHANGED FILES ONLY:
- index.html
- Territory_G66_DISTRICTS.js
- README_G66_DISTRICTS.txt

WHAT CHANGED:
- Added one unified Sdolars map/district hub.
- City visual/artwork remains untouched.
- District access is tied to city level for prototype progression.
- Forge, Tavern, Market, Arena and PvE are routed to their existing systems instead of creating new copies.
- Center/Port/Ruins are district activities; Port unlocks at city level 2, Ruins at level 3.
- Arena remains PvP; Gates routes to ordinary PvE.
- Uses the existing TerritoryStore state.

IMPORTANT:
- This is a client prototype. Real multiplayer remains a future SERVER/WebSocket task.
- Replace only the files listed above in the GAME repo.
