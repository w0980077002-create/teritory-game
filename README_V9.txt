Territory Telegram Profile V9

Based on the working V8 FIX profile.

Profile identity:
- Uses Telegram photo_url when the Mini App is opened inside Telegram.
- Uses Telegram first_name + last_name as the visible player name.
- Falls back to @username, then Territory.
- If Telegram provides no usable photo, profile_avatar.png is used.
- Outside Telegram, no previous Telegram user's cached photo/name is reused.

Important: this version only reads Telegram identity on the client for display.
Server-side authentication and cross-device saves still require backend validation of Telegram.WebApp.initData.
