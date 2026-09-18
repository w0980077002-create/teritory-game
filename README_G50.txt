Territory G50 — PvE battle reliability / global continuation

BASE: verified G48 GLOBAL + installed G49 Arena patch.

ONLY CHANGED FILES IN THIS GLOBAL PATCH:
- Territory_G50_GLOBAL.js
- index.html
- README_G50.txt

G50 fixes the ordinary city Fight (PvE) so it is actually playable:
- PvE is strictly separate from Arena.
- City Fight is bots -> 100% -> city boss.
- PvE uses a simple manual combat action; it does NOT use Arena attack/defense zones.
- Each PvE turn consumes 1 Combat Stone and the enemy answers.
- Bot victories advance city progress; 100% unlocks the boss.
- Boss keeps its own 60-second timer; victory opens the next city and resets progress.
- PvE defeat keeps the city/progress and applies the existing hunger penalty.
- Arena files are not changed in G50.
- City visual/base assets are not changed.

Install: add Territory_G50_GLOBAL.js, replace index.html, and keep the existing Arena files from G49.
Do not upload this patch to SERVER.
