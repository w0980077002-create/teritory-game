Territory G85 — ARENA ONLINE LOBBY

BASE: G84 GAME patch.

GAME-only patch. Replace the G84 multiplayer client with Territory_G85_MULTIPLAYER.js and update index.html.

Changes:
- Arena online lobby is clearer: mode, room code, owner, ready state and player limit.
- 3:00 server countdown is displayed when the room provides startAt/countdownEndsAt.
- Start is restricted in the UI to the room owner.
- Room code can be copied.
- Telegram/browser share invitation is available.
- Ready state can be toggled.
- Online battle keeps server room/battle authority from G84.
- Arena tactical attack selection is now 4 zones: head, chest, stomach, legs.
- Defense remains exactly 2 selected from 4 zones.
- City and PvE files are not included and are not changed.

INSTALL:
1. In GAME replace index.html.
2. Replace Territory_G84_MULTIPLAYER.js with Territory_G85_MULTIPLAYER.js (the G84 file is replaced by the G85 file).
3. Do not upload this patch to SERVER.
