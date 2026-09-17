# Territory — Clean Base

Clean mobile frontend base for Territory / Sdolars.

## Included
- Portrait mobile city scene
- Persistent player state
- Districts
- Equipment Market / Inventory
- 27-cell game board, dice, x10, rewards, tasks and jackpot preview
- Stable tactical Arena combat core
- Full, uncropped Sdolars scene asset (`sdolars_scene.png`)

## Explicitly removed from this base
- Casino
- Command HQ
- Siege
- Logistics
- VIP
- Old embedded Base64 city background
- Obsolete city/world generations
- Duplicate version layers

## Important
This is the clean frontend foundation. The current Arena combat file is the stable tactical PvE core from the audited base; real multiplayer Arena (1x1, chaotic teams, group up to 20, 3-minute lobby, leave/re-entry rule) requires a network/backend layer and is not falsely presented as implemented here.

## GitHub
Upload the contents of this folder to the repository root. For GitHub Pages/static hosting, no server.js is required for the frontend.

## Files
- index.html
- style.css
- game.css
- arena.css
- app.js
- arena.js
- sdolars_scene.jpg
