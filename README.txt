# Territory G88 — Arena navigation fix

BASE: current repository version with `arena.js` + `Territory_G86_MULTIPLAYER.js`

## What this fixes

The City contains several working Arena hotspots with `data-screen="arena"`.
The Arena itself is a modal (`#arenaModal`), not a `<section id="arena">`.

The old `app.js` routing function first looked for `#arena`, did not find it,
and returned before `window.openArena()` could run. Result: the Arena button
could be pressed, but nothing opened.

G88 adds a capture-phase router that opens the existing Arena modal directly.
It does NOT replace City, PvE, the Arena battle logic, or the multiplayer
server.

## Files

Upload this file to the repository root:

- `Territory_G88_ARENA_ROUTER_FIX.js`

Then add this script line to `index.html` AFTER `Territory_G86_MULTIPLAYER.js`:

<script src="Territory_G88_ARENA_ROUTER_FIX.js?v=880"></script>

Do not remove the existing Arena files.

## Expected result

City → Arena button → Arena Hub opens.

This is the first G88 gate. Once this works, we continue building the
full Arena instead of testing with a second player yet.

## Important

The GitHub integration available to this session currently returns HTTP 403
for repository writes, so this package is prepared for manual upload.
