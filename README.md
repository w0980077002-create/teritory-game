# TERRITORY REAL GAME HOTFIX 65

This patch is built from the actual `teritory-game` files supplied in chat.

## Fixes
- HOME coordinate router now uses a single pointer-up/touch-end activation path instead of firing on touchstart + pointerdown + pointerup.
- HOME router ignores real HTML controls, preventing the coordinate fallback from opening a different screen after a real button tap.
- Duplicate taps are suppressed for a short window.
- Added the 7th equipment slot to the HOME hit map.
- Arena close/back taps get a dedicated pointer/touch fallback and de-duplication.
- PvE battle close/back gets a dedicated pointer/touch fallback and always returns to HOME.
- No gameplay balance or progression changes.

## Overlay
Replace only:
- home-router.js
- arena.js
- pve-battle.js

Do not delete other files.
