# Territory G43 GLOBAL — Sdolars

Current GAME build: G43.

G43 continues the verified G42 City/PvE base without changing the approved Sdolars City artwork or its transparent hit areas.

## G43 pass
- Canonical G48 Arena is restored as the Arena entry point; the old duplicate Arena shell is no longer intercepting the Arena button.
- Arena keeps 1x1, chaos, group up to 20, 3-minute lobby, 4 attack zones, 4 defense zones, target selection, enemy response, combat log, and close-to-City navigation.
- Equipment now has explicit slots: weapon, helmet, armor, gloves, boots.
- Existing G42 inventory/equipment state is migrated into the slot model.
- Equipped damage/defense is used by PvE.
- Durability and Forge repair remain part of the gameplay loop.
- PvE city path, progress, rewards, hunger and boss loop remain intact.

## Working files
index.html, app.js, style.css, game.css, arena.js, arena.css, Territory_G43_GLOBAL.js, Territory_G43_GLOBAL.css plus the required City assets.

## Important
This is still a client-side prototype. Real cross-device Arena multiplayer requires the SERVER/WebSocket layer and server-side validation.

SERVER repo is not changed by this GAME build.
