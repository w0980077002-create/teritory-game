TERRITORY RELEASE CANDIDATE 01

BASE: current main branch inspected on 2026-10-01.

THIS PACKAGE CHANGES ONLY THE NAVIGATION/OVERLAY INTEGRATION.
It deliberately does not rewrite the existing PvE, Arena, economy or server engines.

REPLACE on GitHub:
1) navigation.js
2) navigation.css
3) territory-bottom-nav-original-exact-v2.png

ADD to the repo:
4) territory-release-candidate-01.js

INDEX.HTML:
Add this script AFTER territory-telegram-profile-ui-18.js:
<script src="territory-release-candidate-01.js"></script>

WHY:
- fixes the 50%-left navigation displacement caused by clean-game.css transform
- keeps one canonical seven-button bar on non-home screens
- removes Arena's legacy duplicate bottom bar
- removes the cloned Live Arena nav
- keeps the canonical bar visible on Arena hub AND Arena combat
- keeps the canonical bar visible during PvE combat
- makes the active button follow the actual open Arena/PvE overlay
- prevents normal navigation from leaving an old Arena/PvE overlay underneath

DO NOT DELETE any other game file for this package.

VALIDATION performed:
- node --check navigation.js: PASS
- node --check territory-release-candidate-01.js: PASS
- navigation.css explicitly resets left/right/width/max-width/transform/margin
- the package is based on the current GitHub main state, not the old 16:25 restore point.

IMPORTANT:
This is the first RELEASE-CANDIDATE integration pass, not a claim that Telegram Stars,
server-side social chat/clans/mail, production deployment, or 240 chapters of content
are already production-complete. Those are separate remaining systems.
