Territory G81 — SERVER ACTION BRIDGE

BASE: G79 GAME + G80 SERVER contract.

CHANGED:
- Territory_G81_SERVER_ACTIONS.js — new client bridge to G80 /api/action.
- Territory_G65_EVENTS.js — daily reward now delegates to the server when G81 is loaded.
- index.html — loads G81 after the existing G76 server bridge.

SERVER-AUTHORITATIVE ACTIONS AVAILABLE:
- daily_claim
- shop_buy (API ready; UI migration can be done item-by-item after the daily flow is verified)

The client sends Telegram.WebApp.initData; the bot token never reaches the browser.
If Telegram initData is unavailable, the server action is rejected instead of silently awarding a local authoritative reward.

City visual, PvE, Arena, Social and Party rules are untouched.
The existing G80 SERVER remains the authority for supported actions.

INSTALL:
Upload the changed/new GAME files from this package to the GAME repo.
Do NOT upload this package to SERVER.
