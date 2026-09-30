TERRITORY PvE PASS 01 — ONE COMPLETE PACKAGE

This is ONE package for the next upload. Do not upload the old one-file PvE fix separately.

Replace these files in the ROOT of teritory-game:
  index.html
  navigation.js
  navigation.css
  territory-release-candidate-01.js
  territory-pve-authority-01d.js

Add:
  territory-pve-authority-fix-01.js
  territory-bottom-nav-original-exact-v2.png

The index.html in this package already contains:
  <script src="territory-pve-authority-fix-01.js"></script>

Do NOT delete any existing PvE files.
Do NOT change other files manually for this pass.

Purpose:
- keep the canonical bottom navigation package intact;
- complete PvE server session before local continuation advances chapter/stage;
- wait for the PvE action transcript queue before completion;
- apply the server-issued loot/state after completion so local random loot is not retained;
- preserve the existing combat UI/math and normal navigation.

After upload test:
Chapter -> Stage 1 -> win -> loot -> equip/keep -> Continue -> Stage 2 -> 50% -> 75% -> 100% -> Boss -> chapter reward -> next chapter.

If anything is wrong, stop and report what happened before changing more files.
