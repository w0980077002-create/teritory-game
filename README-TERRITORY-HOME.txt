TERRITORY — CANONICAL HOME PACKAGE

This is one coherent Home package for the existing teritory-game repository.
Copy the files from this archive into the repository root and replace files with the same names.

Included:
- index.html — removes the retired duplicate Home/VIP renderers and loads one Home renderer.
- territory-home.js — the only Home renderer; keeps the canonical home-master.png scene and binds live Telegram/server data.
- territory-home.css — Home layout, live values and hit zones.
- territory-profile-details-04.js — profile is the detailed character/VIP screen; no extra Home VIP badge.
- territory-profile-details-04.css — profile/VIP presentation.
- home-master.png — canonical Home artwork used by the game.

Removed from runtime by index.html:
- home-life renderer
- home-rebuild renderer
- live-home-hud renderer
- canonical Home guard
- Telegram profile overlay that duplicated the Home profile

Server remains the source of truth after Telegram authentication. Before hydration the Home shows safe fresh-player values (Lv.1 / VIP 0 / zero currencies), never the demo numbers baked into the reference artwork.
