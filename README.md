# Territory — Sdolars — S78

S78 is a functional cleanup of the existing Territory build, not a replacement game.

Verified:
- 4 combat zones only: Голова / Грудь / Пояс / Ноги.
- Attack = 1 zone.
- Defense = 2 zones.
- Old 5-zone battle UI is absent from the active source.
- Mobile world content scrolls instead of being clipped.
- Existing city buttons remain functional.
- Guild view uses the functional guild system.
- Worker embeds the exact same index.html.
- Worker health version = s78.
- index.html and worker.js pass Node syntax checks.

Deployment marker:
The city screen contains a small S78 marker. If Telegram still shows 5 combat zones, Telegram is loading an older deployment/endpoint rather than this Worker build.
