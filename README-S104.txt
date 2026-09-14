TERRITORY — S104 VIDEO BATTLE UPDATE

What is included
1. s85-tactical.js
   Drop-in replacement for the current s85-tactical.js.
   It changes the arena into a video-inspired real-time auto battle while keeping
   the existing semi-transparent/dark Territory visual language.

Implemented:
- 30-second battle timer
- automatic player/enemy turns
- live HP bars and power values
- energy/rage meter
- skill cards: Strike, Crushing, Bleed, Recovery
- cooldowns and energy costs
- critical hits and dodge chance
- animated floating damage/healing numbers
- battle log
- victory/end-of-battle overlay
- XP rewards and level-up calculation
- profile XP/level save through the existing /api/profile endpoint
- next-opponent button

Important:
This update is intentionally client-side for the battle simulation. It does not
pretend that client-side rewards are secure against cheating. Before monetization
or competitive PvP, rewards must be validated server-side.

Installation
- In the existing repository, replace the old s85-tactical.js with this file.
- Do NOT delete index.html, worker.js, s102-client.js, s102-integrated.js,
  s84-guild.js, s98-backpack.js, s99-market.js, or the existing assets.
- Hard refresh the Telegram Web App after uploading.

The GitHub connector available in this session allowed repository inspection but
returned HTTP 403 for a write to the repository, so this package is the safe
drop-in update rather than claiming that the live repository was modified.
