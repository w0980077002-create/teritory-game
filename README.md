# Territory — canonical mobile base

Canonical mobile frontend base for Territory / Sdolars.

## Core systems
- Mobile city scene for Sdolars
- Profile and persistent player state
- Districts
- Equipment Market and Inventory
- Game board with 27 cells, dice, x10 mode, rewards, tasks and jackpot preview
- Tactical Arena based on the S98 combat implementation
- Separate `server.js` backend for Telegram/PvP features; backend integration remains isolated from the client base

## Frontend
- `index.html` — screens and UI
- `style.css` — main mobile UI
- `game.css` — Game board styling
- `app.js` — core client state and systems
- `arena.css` / `arena.js` — Arena implementation

Develop new systems from this base instead of mixing older versions.
