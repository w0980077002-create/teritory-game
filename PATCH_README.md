# Territory Game — deploy hotfix

This ZIP is intentionally a **small deployment patch**, not a redesign.

## What was verified
- Repository `w0980077002-create/teritory-game`, branch `main`.
- 15 tracked files were present at the audit point.
- `app.js`, `arena.js`, `home-rebuild.js`, and `forge-v2.js` pass JavaScript syntax parsing.
- The approved HOME foundation is implemented in `home-rebuild.js` + `home-rebuild.css` and uses `sdolars_home_bg.png`.
- `game.css` references `harbor_top.jpg` and `ship_only.png`, but neither asset exists in the repository.

## What this patch changes
1. `Dockerfile`
   - uses a deterministic nginx config on port 10000;
   - disables stale caching for `index.html`, JS and CSS;
   - applies the game fallback CSS during the image build;
   - keeps the existing HOME design untouched.
2. `nginx.conf`
   - prevents Telegram/mobile WebView from serving an old HTML/JS/CSS build after Render deploy.
3. `game-runtime-fix.css`
   - replaces the two missing game-art references with assets/fallbacks that actually exist;
   - is appended to `game.css` during Docker build and then removed from the served tree.

## Upload
Unzip this package over the repository root and replace the existing `Dockerfile`. Add `nginx.conf` and `game-runtime-fix.css` at the repository root.

Then commit/push and wait for the Render deploy.

Do not delete the existing HOME assets or rewrite the HOME design in this step.
