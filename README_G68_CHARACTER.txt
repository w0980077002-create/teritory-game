Territory G68 — CHARACTER / INVENTORY / EQUIPMENT

BASE: G67 progression build.

CHANGED FILES:
- Territory_G68_CHARACTER.js
- index.html
- README_G68_CHARACTER.txt

WHAT CHANGED:
- Added one player-facing Character / Inventory / Equipment hub over the existing TerritoryCharacter core.
- Equipment slots: weapon, helmet, armor, gloves, boots.
- Unified view of equipment bonuses, durability and derived combat stats.
- Equip / unequip and discard actions.
- Broken/zero-durability equipment remains non-effective through the existing Character Core.
- Inventory route now opens the G68 hub before the legacy duplicate inventory UI.
- Existing Forge/repair remains available through the existing core.
- City artwork is untouched.
- PvE and Arena are untouched and remain separate.
- No server or real-money systems added.

G68 is a player-facing consolidation layer; legacy app.js data systems remain in the base for compatibility and are not deleted in this step.
