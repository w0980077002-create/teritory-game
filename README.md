# Territory — canonical mobile base

Canonical mobile frontend base for Territory / Sdolars.

## Core systems
- Mobile city scene for Sdolars
- Profile and persistent player state
- Districts
- Equipment Market and Inventory
- Game board with 27 cells, dice, x10 mode, rewards, tasks and jackpot preview
- Tactical Arena with 1×1, chaotic and group rooms, 3-minute lobby, 4 attack zones, 4 defense zones and compact VIP-only Auto Battle
- Separate `server.js` backend for Telegram/PvP features; backend integration remains isolated from the client base

## Frontend
- `index.html` — screens and UI
- `style.css` — main mobile UI
- `game.css` — Game board styling
- `app.js` — core client state and systems
- `arena.css` / `arena.js` — Arena implementation

Develop new systems from this base instead of mixing older versions.


## Arena v144
- Added a compact «Автобой» checkbox in combat.
- When enabled, the game automatically selects an attack zone and two defense zones and executes turns without manual button presses.
- Auto Battle is off by default and can be switched on/off at any time during the fight.

- Auto Battle is a small checkbox in combat and is clickable only when the player has VIP. Without VIP it is visibly locked and cannot be enabled.
