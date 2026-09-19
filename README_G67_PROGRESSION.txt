Territory G67 — PROGRESSION CORE

BASE: G66 DISTRICTS.

CHANGED / NEW:
- Territory_G67_PROGRESSION.js — unified progression contract for player level, city level and district unlocks.
- Territory_G66_DISTRICTS.js — now asks the G67 progression core for district unlock status and exposes a Progression button.
- index.html — loads G67 before G66 and updates the build title.

GAME RULES:
- Existing City artwork is untouched.
- PvE and Arena remain separate.
- Existing TerritoryStore state remains the source of data.
- Player level-up awards 3 free points per gained level when the progression API is explicitly used.
- City advancement resets PvE progress and records a city milestone; existing PvE flow remains responsible for deciding when the city actually advances.
- Districts: base districts at city level 1, Old Port at level 2, Old Ruins at level 3.
- Level 4 is a future-content placeholder, not a fake finished area.

INSTALL:
Replace/add the files from this ZIP over the G66 base.
No SERVER files are included.
