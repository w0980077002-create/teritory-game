Territory S103 — index integration fix

This package is based on the current S102 integrated runtime.

Changes:
1. Fixed duplicate loadIncoming() declaration in s102-client.js.
2. Added runtime cleanup of legacy S72/S73/S74 buttons and their legacy UI nodes.
3. The cleanup runs during boot, so the existing index.html can remain untouched while the current server injects s102-client.js.
4. Tactical PvP remains 4 zones: Head / Chest / Belt / Legs, with 1 attack + 2 defense zones.

IMPORTANT:
The GitHub connector rejected the attempted write to main with HTTP 403, so this package is ready to upload but has NOT been falsely claimed as committed to GitHub.
The existing GitHub index.html was not overwritten.
