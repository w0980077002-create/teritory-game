# Territory FIRST LIVE TEST 03

## Purpose
Show the authenticated Telegram profile in the Hero screen using the server-loaded player data, with Telegram WebApp data as a fallback.

## Replace / add
- Replace `index.html` with the included file.
- Add `territory-telegram-profile.js`.
- Add `territory-telegram-profile.css`.

No Cloudflare Worker change is included. Telegram webhook/auth backend remains untouched.

## Expected result
Hero screen shows:
- Telegram photo (when Telegram provides `photo_url`)
- Telegram first name / username
- Telegram ID
- copy button for the player's own Telegram ID

The existing server profile bridge remains authoritative for the loaded player; the Telegram WebApp user object is only a fallback for UI when a field is not present yet.
