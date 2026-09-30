TERRITORY PvE PASS 02 — ONE COMPLETE PACKAGE

This is ONE package. Do not upload the old PASS 01 fix separately.

REPLACE these files in the ROOT of w0980077002-create/teritory-game:
  index.html
  navigation.js
  navigation.css
  territory-release-candidate-01.js
  territory-pve-authority-01c.js
  territory-pve-authority-01d.js

ADD:
  territory-pve-authority-fix-02.js
  territory-bottom-nav-original-exact-v2.png

The index.html already loads territory-pve-authority-fix-02.js.

IMPORTANT:
- Do NOT upload territory-pve-authority-fix-01.js from the previous package.
- Do NOT delete the existing PvE engine or authority files.
- Do NOT manually edit other game files for this pass.
- This pass keeps guest/demo PvE on the original local continuation path.
- For authenticated Telegram PvE, server completion happens before local stage/chapter progression.
- If a server PvE action failed, completion now surfaces that failure instead of silently pretending it succeeded.

TEST AFTER UPLOAD:
1. Home bottom menu: all 7 buttons.
2. Quests / Shop / Arena: bottom menu stays centered and has all 7 buttons.
3. PvE: attack / skill / AUTO / elixirs still click.
4. Authenticated PvE: Stage 1 win -> loot -> Equip/Keep -> Continue -> Stage 2.
5. Continue through 100% -> Boss -> chapter reward -> next chapter.
6. Guest/demo PvE: Continue still follows the original local flow.

If anything is wrong, stop before changing more files and report exactly which button/screen failed.
