# Territory — Sdolars — S79

S79 fixes two concrete UI problems from S78:
- The yellow strip under the City tab is removed; it was the active-tab indicator.
- The main four action buttons and bottom navigation receive reliable capture-phase mobile click handlers, so the Battle button opens the battle panel even if inline handlers are unreliable.

Also:
- Worker embeds the exact current index.html.
- Worker version = s79.
- 4 combat zones remain: Голова / Грудь / Пояс / Ноги.
- Attack = 1 zone; Defense = 2 zones.
- Mobile world/action layer has explicit z-index.
- JS syntax checks pass.
