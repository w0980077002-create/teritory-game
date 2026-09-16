# Territory — Sdolars · v145

Canonical mobile frontend package for Territory / Sdolars.

## Base preserved
- Mobile Sdolars city scene
- Profile and persistent player state
- Districts
- Equipment Market and Inventory
- 27-cell Game board with dice, x10, rewards, tasks and jackpot preview
- Tactical Arena: 1×1, chaotic and group modes
- Arena: 3-minute lobby, group up to 20, 4 attack zones, 4 defense zones, 2 defenses per turn
- Local test bots remain enabled for testing before real players arrive
- Collapsible combat journal
- Finish / extend fight controls
- Leaving a room blocks re-entry to that same room
- Existing `server.js` remains the multiplayer backend foundation in the repository

## v145 additions
- Daily login streak and daily reward
- Achievements with coin/gem/stat rewards
- Hunger 0–100%; Arena defeat removes 5%
- Equipment durability 0–300; each completed tactical turn consumes 1 point
- Paid full repair with coins
- Free attribute points for level progression
- Strength, Agility and Defense point spending
- Reward history
- Unified frontend cache-busting to v145
- Systems are isolated from Arena UI; Arena bots were not removed

## Files in this ZIP
- `index.html`
- `style.css`
- `game.css`
- `app.js`
- `systems-v145.js`
- `systems-v145.css`
- `arena.css`
- `arena.js`
- `README.md`
- `sdolars_clean_scene.png`
- `harbor_top.jpg`
- `ship_only.png`

**Important:** this ZIP was assembled from the frontend files supplied in the chat. Keep the repository's existing `server.js` when replacing/uploading the frontend; it is not overwritten by this package.

Develop from this base instead of mixing older versions.
