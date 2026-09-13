Territory S103 clean audit build

Changes prepared locally:
- Removed the three S72/S73/S74 button creation blocks from index.html via patches/remove-s72-s73-s74.js.
- Fixed the S98 backpack syntax error caused by redeclaring `sell`.
- Fixed S102 PvP client so a challenge is not auto-accepted as the target player; incoming challenges are shown and can be accepted by the actual recipient.
- S102 server/client pass node --check.

IMPORTANT:
The GitHub integration currently rejects write operations with HTTP 403, so the live GitHub index.html was NOT modified by this session. The patch script must be run against the exact current index.html before committing it. No claim of a GitHub upload is made.

Runtime package uses s102-integrated.js as main. ws is required for runtime; container could not install it, so runtime WebSocket execution was not claimed as tested. Syntax checks were run.
