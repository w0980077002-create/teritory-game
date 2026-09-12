# Territory — Sdolars — S81

S81 fixes the two issues visible in the S80 phone screenshot at source level.

1. Bottom yellow active-tab stripe:
   - forced off with border/background/box-shadow/outline overrides.

2. Main Battle button and navigation:
   - the previous delegated selector was removed;
   - direct inline handlers now call an EARLY mobile bridge defined before the main application script;
   - the bridge calls the real `battle()` / `openP()` functions at tap time and retries once if the app script has not finished initializing;
   - battle errors are caught instead of silently leaving the user on the city screen.

Other invariants:
- 4 battle zones only: Голова / Грудь / Пояс / Ноги.
- Attack 1, defense 2.
- Worker embeds exact index.html.
- Worker version s81.
- Node syntax checks pass.
