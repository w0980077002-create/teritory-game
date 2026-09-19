Territory G86 — ARENA BATTLE UX

GAME-only patch based on G85.

Replace the current G85 multiplayer module with:
- Territory_G86_MULTIPLAYER.js

Changes:
- Arena battle UI is localized and clearer.
- 4 attack zones and exactly 2 defense zones remain enforced.
- Individual team HP is shown during battle.
- Turn state and optional server turn timer are displayed.
- Submitted turns are locked until the next server battle_state.
- Defeated targets remain unavailable.
- Battle result state is shown when the server marks the battle finished.
- Combat log keeps the latest entries visible.
- City and PvE are untouched.

IMPORTANT:
- This is a GAME patch only.
- No SERVER upload is required for the G86 client improvements.
- The HTML loader must point to Territory_G86_MULTIPLAYER.js?v=860.
