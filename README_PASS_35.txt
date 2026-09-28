TERRITORY PASS 35 — REAL HOME EQUIPMENT VISUALS

Overlay replaces the already-loaded territory-progression-core.js/css from PASS 33.
It preserves the level-unlock progression layer and adds visible equipment to the living hero.

Uses canonical TerritoryStore.equipment (7 slots): weapon, helmet, armor, belt, boots, ring, amulet.
No new inventory, loot generator, combat math, or premium economy is introduced.

After a real PvE equip, territory:state-changed refreshes the living hero. Weapon icon/type, armor, helmet, boots, belt, ring, amulet and rarity glow become visible.
