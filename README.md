# TERRITORY — BACK NAVIGATION HOTFIX 10068

Fixes Android/browser Back navigation for game screens opened from HOME.

## What changed
- Adds one controlled history entry when opening HOME sections.
- Android/browser Back now returns from Hero, Inventory, Quests, Shop, Forge fallback, Arena, PvE, Games, Clan and other routed screens to HOME.
- Closes Arena/PvE overlays before returning HOME.
- Avoids adding duplicate history entries during Back handling.
- Does not modify TerritoryStore, combat rules, economy, progression, or save data.

## Install
Overlay `home-router.js` over the current project and replace the old file.

## Version
10068
