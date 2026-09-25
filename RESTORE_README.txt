TERITORY GAME — CLEAN RESTORE

Purpose:
Restore the game to the CLEAN MASTER 9100 control build after later changes broke the UI.

Replace these files on GitHub:
- index.html
- app.js
- home-rebuild.js
- home-rebuild.css
- arena.js
- arena.css
- follower-arena.js
- follower-arena.css
- followers.js
- combat-items.js
- forge-v2.js
- forge-v2.css
- hero.js
- hero.css
- reference-ui.js
- reference-ui.css
- style.css
- Dockerfile
- nginx.conf

Also replace the entire arena-assets/ folder with the included folder contents.

DO NOT delete or replace the existing HOME artwork asset:
- territory_reference_bg.png
If it already exists in the repository, keep the original file untouched.

Important recovery rules:
1. Do not mix later G57/G58/G59/G60 GLOBAL files into this build.
2. Do not add generated character/"stickman" DOM layers over the HOME artwork.
3. HOME hit zones must remain transparent click targets.
4. Arena uses the approved player/opponent artwork from arena-assets/.
5. Keep the existing original art assets untouched unless a file is explicitly included here.
6. This package is intended to be unpacked on a phone and used to overwrite the listed files.

Verification performed before packaging:
- JavaScript syntax checked with Node.js.
- No files from the later 9300/9400 HOME inline override were mixed in.
