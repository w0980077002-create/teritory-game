TERRITORY CLIENT FIX 17 — TELEGRAM PROFILE UI

Patch overlay for the current client.

Adds:
- Telegram photo, name, @username and Telegram ID on the Home screen.
- Same identity data on the Hero screen.
- Tap the Home identity card to open a full profile popup.
- Copy Telegram ID button.

Data source:
- Uses the authoritative profile already hydrated by territory-telegram-auth-pass54.js.
- Falls back to Telegram WebApp initDataUnsafe only when needed for display.

No changes to combat, economy, progression, purchases, PvE or Arena math.

Upload these files to the client repository:
- territory-telegram-profile-ui-17.js
- add the script tag to index.html after territory-session-guard-16.js:
  <script src="territory-telegram-profile-ui-17.js"></script>
