# Territory — Sdolars / S88 FIXED

Release replacement files for GitHub.

Files:
- worker.js
- index.html
- wrangler.jsonc

Critical fixes:
- server-side energy regeneration runs at the beginning of every GameHub.action()
- district.travel rejects insufficient energy with `no_energy`
- tactical battle uses exactly 4 zones
- attack = 1 numeric zone
- defs = exactly 2 different numeric zones
- client sends `defs: [0, 2]`-style payload
- `/ws` WebSocket chat route
- Static Assets binding configured in wrangler.jsonc
