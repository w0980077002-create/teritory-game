TERRITORY — NAVIGATION / HOME REPAIR PACK
===========================================

Source checked against the current main branch of:
w0980077002-create/teritory-game

This is an OVERLAY package. Copy these files over the existing repository files.
Do NOT delete the existing game folder.

Replaced:
- index.html
- home-rebuild.js
- navigation.js
- navigation.css

What this repair does:
- Restores a working HOME hit-area layer over home-master.png.
- Gives every visible HOME control a real click/tap route.
- Restores working bottom navigation.
- Keeps Arena as a separate mode and keeps its own battle controls.
- Adds missing script/style links for follower/combat-item modules.
- Centralizes HOME/panel navigation in navigation.js.
- Prevents silent clicks: unsupported HOME modules show an explicit information modal.
- Keeps PvE, Arena, Forge and existing TerritoryStore untouched.

Important:
The package does not replace app.js, arena.js, pve-battle.js, pve-flow.js or economy logic.
Those remain the current repository versions.

Smoke checks performed:
- JavaScript syntax check passed for navigation.js and home-rebuild.js.
- Every HOME action declared in home-rebuild.js has a route in navigation.js.
