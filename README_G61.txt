Territory G61 — ALEX DIALOG FIX

BASE: G60 FIXED.

ONLY FUNCTIONAL CHANGE:
- Alex now opens a real separate dialog window after tapping Alex.
- The dialog no longer writes quest text into the main City sceneAction area.
- The existing Alex quest state/reward logic is preserved.
- A global TerritoryAlexTalk() is exposed so the City touch layer can call Alex reliably.
- Accepting the quest updates alexQuest/cityRep and saves normally.

PROTECTED:
- City artwork and its geometry are untouched.
- City navigation/hitboxes are untouched.
- PvE is untouched.
- Arena is untouched.
- Existing G60 files remain unchanged except app.js.

TEST:
1. Open City.
2. Tap directly on Duke Alex.
3. A separate dialog must appear over the City.
4. The City itself must not move.
5. Close the dialog and verify the City buttons remain where they were.
