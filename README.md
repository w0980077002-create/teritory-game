# Territory G46 GLOBAL

G46 is the next integrated gameplay pass over the verified G45 package.

## Preserved
- Sdolars City artwork, composition and interaction layer.
- Existing City buttons/hit areas.
- PvE tactical 4-zone attack / exactly 2-zone defense.
- Forge, durability, five equipment slots, market and local save.
- Arena duel / chaos / group, 3:00 lobby, up to 20 players, team targeting, individual HP, enemy response, combat log and finish/extend controls.

## G46 global changes
- Unified `TerritoryCore` progression API for PvE/Arena/economy events.
- XP/level rewards now use one leveling function with free-stat points and HP growth.
- PvE victories, Arena victories, purchases and repairs feed persistent quest progress.
- Dynamic achievements are stored instead of being display-only.
- Daily bonus now has a local streak and scales the coin bonus within a capped range.
- Arena combat now reads Agility and Endurance as well as Strength/Defense/Mastery and gear; Agility can evade an incoming response and Endurance reduces it.
- Arena victory hooks into the same progression/achievement system.
- Fixed the HTML integration reference so the loaded global script is the G46 file.

## Changed files
- `Territory_G46_GLOBAL.js`
- `Territory_G46_GLOBAL.css`
- `arena.js`
- `index.html`
- `README.md`

## Unchanged base files
- `app.js`
- `arena.css`
- `game.css`
- `style.css`
- `sdolars_clean_scene.png`

## Prototype boundary
Arena remains a local/client prototype. Cross-device multiplayer, authoritative economy, anti-cheat and server validation still require the separate SERVER/WebSocket implementation.

Do not upload this package to the SERVER repository.
