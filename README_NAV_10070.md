# TERRITORY NAVIGATION 10070 — FRESH REBUILD

This overlay replaces the old HOME input stack instead of layering another touch fix on top.

## Replace these files
- `home-router.js`
- `home-router.css`
- `newnav10070.js`
- `battle-button-stones-fix-10052.js` (now inert; prevents old global touch/pointer handlers)

## What changed
- New explicit DOM buttons for the bottom navigation.
- Bottom navigation stays visible on normal screens: HOME, Inventory, Hero, Quests, Games, Clan, Shop, etc.
- Full-screen PvE/Arena hide the bottom nav so combat controls are not blocked.
- New HOME hit zones are real buttons, not a global coordinate event router.
- No `touchstart + pointerdown + pointerup + click` global stack.
- Android Back uses browser history: screen -> previous screen/HOME without reloading the page.
- The old 10052 router is replaced with an inert compatibility file.
- Game Store, battle logic, Arena logic, PvE logic and economy are not modified.

## Important
After overlaying the files, do a full browser refresh once so the old JavaScript bundle is no longer cached.
