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


G40 TRUE FIX: restored the complete embedded Sdolars artwork as the sole visual source on the City screen. The legacy HTML HUD/side labels are hidden on City; invisible touch hotspots remain active.


G40 TRUE BUTTONS FIX
- The city artwork is the approved baked visual reference.
- Added transparent touch hit areas for top HUD controls and left/right city buttons.
- Existing data-screen navigation is preserved for Arena, Market, Districts, Game, Inventory and bottom actions.
- Top utility controls show a small in-game confirmation panel until their full screens are implemented.
