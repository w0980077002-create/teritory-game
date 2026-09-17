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


## Canonical v140
- Sdolars scene: `sdolars_clean_scene.png`
- Arena: 1×1, chaotic, group; 3-minute lobby; 4 attack zones; exactly 2 defense zones.
- Arena close button is bound directly to `#arenaClose`.
- Arena remains a local/client prototype; network multiplayer is not implemented by this package.


## v140 package audit
- Version references synchronized to v140 in `index.html`.
- Arena v140 styles included in `arena.css`.
- Arena close restores the screen that was open before Arena.
- No casino screen is present in `index.html`; old unused casino selectors are not active.
- Package is a client/mobile prototype; `server.js` is not required for GitHub Pages/Telegram static hosting.
