TERRITORY — TELEGRAM IDENTITY PASS 02

WHY
The previous Telegram identity patch failed too early when Telegram.WebApp.initData was temporarily empty. This pass fixes the bootstrap without changing gameplay/navigation.

CHANGES
1. territory-telegram-auth-pass54.js -> Identity Pass 02.
   - waits up to 15 seconds for Telegram WebApp + signed initData;
   - calls WebApp.ready()/expand() during the wait;
   - reads WebApp.initData first;
   - falls back to the tgWebAppData launch payload from URL hash/query when the SDK has not exposed it yet;
   - sends the raw signed payload unchanged to the server for HMAC validation;
   - never trusts initDataUnsafe as authentication;
   - keeps server state authoritative;
   - never auto-imports anonymous local progress into a Telegram account;
   - reports platform/version diagnostics only if signed initData is genuinely unavailable.

2. index.html
   - cache-busts the auth and gate scripts with ?v=20261001-02 so Telegram WebView cannot keep the old JavaScript cached.

3. territory-telegram-gate-01.js
   - unchanged logic, only cache-busted from index.html.

UPLOAD
Replace/upload these three files as one coherent pass:
- index.html
- territory-telegram-auth-pass54.js
- territory-telegram-gate-01.js

Do NOT modify BotFather.
Do NOT delete other game files for this pass.
Do NOT manually assemble files.

TEST
1. Open the game from @TeritoryGameBot -> Open App.
2. It must show the real Telegram player name/username/ID, not "Игрок / ID не получен".
3. Close and reopen: the same server progress must remain.
4. Test a second Telegram account: it must get a separate player/progress.
5. If auth still fails, send the exact error screen; it will now include a more useful platform/version diagnostic instead of the old generic message.
