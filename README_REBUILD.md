# Territory Game — Arena/PvE/Followers Rebuild

Target repository: `w0980077002-create/teritory-game`, branch `main`.

## Files in this replacement package

- `index.html`
- `app.js`
- `followers.js`
- `hero.js`
- `arena.js`
- `arena.css`
- `follower-arena.js`
- `home-rebuild.js`
- `nginx.conf`

These are complete replacement files, not patches.

## What was rebuilt

1. Followers use only `window.Followers`.
2. Active follower ID is `TerritoryStore.state.followers.activeFollower`.
3. Character screen reads the active follower and displays its name/icon.
4. Only one follower can be active.
5. `TerritoryStore.getDerivedStats()` adds active follower attack/defense/hp to the hero in real time.
6. HOME `Бой` is a separate PvE runner runtime (`runnerBattle`).
7. Arena is a separate 1×1 runtime with the required variable `arenaBattle`.
8. Arena zone controls remain clickable during cooldown; cooldown blocks `УДАР`, not zone selection.
9. `УДАР` is enabled only with exactly 2 defense zones + 1 attack zone and no cooldown.
10. Player and opponent follower visuals are handled by `follower-arena.js`.
11. Opponent follower is randomly selected from a class-compatible pool.
12. Arena/PvE state cannot overwrite each other's battle variable.
13. Nginx `sub_filter` targets the real `reference-ui.css` and `reference-ui.js` names.
14. JavaScript files pass `node --check`.

## IMPORTANT ASSET BLOCKER

The current GitHub `main` branch was checked before preparing this package. These three binary files are still missing from `main`:

- `arena-assets/arena-night-approved.png`
- `arena-assets/player-viking-approved.png`
- `arena-assets/opponent-viking-approved.png`

The rebuilt code intentionally references those exact approved paths. The package does NOT invent replacement artwork.

Until those three approved PNG files are uploaded under exactly `arena-assets/`, the Arena/Viking and PvE runner art cannot be fully visible.

## Upload

Unpack this ZIP and replace the listed files in the repository. Also upload the three approved PNG files into:

`arena-assets/`

Do not rename the assets and do not move them out of that directory.

## FINAL FIX V2
- Telegram bot handle is fixed to `@TeritoryGameBot` (one `r`).
- `follower-core.js` is removed; canonical file is `followers.js`.
- Canonical follower API is `window.Followers`.
- `HeroScreen.activeFollower()` reads `TerritoryStore.state.followers.activeFollower` through `window.Followers`.
- PvE runner remains isolated from Arena; Arena uses `arenaBattle`, HOME uses `runnerBattle`.
- Follower stats are included by `TerritoryStore.getDerivedStats()` and consumed by the runner for strength, defense and effective max HP.
- Nginx cache-busting references are `reference-ui.css` and `reference-ui.js` with V2 query versions.

IMPORTANT: the current GitHub working tree inspected for this rebuild did not contain the three approved Arena PNG files. The `arena-assets/` directory is therefore retained in the package, but no replacement artwork was invented or substituted.
