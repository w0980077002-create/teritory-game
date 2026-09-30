TERRITORY CLIENT FIX 18 — TELEGRAM PROFILE
Surgical overlay for the current client.

REPLACE:
- index.html
- add territory-telegram-profile-ui-18.js

This explicitly loads the profile UI script. It reads the already-authoritative
Telegram identity hydrated by territory-telegram-auth-pass54.js and displays:
photo, name, username, Telegram ID on Home and Hero.

No server/economy/PvE/Arena/combat changes.
