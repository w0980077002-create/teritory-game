G3 — GAME patch
1. Upload/extract these files into the root of the GAME repo:
   - arena.js
   - arena-core.js
   - vip.js
2. No index.html editing is required.
3. arena.js is a loader that starts the preserved Arena code from arena-core.js,
   then starts the VIP module from vip.js.
4. Existing index.html already loads arena.js?v=140, so the patch activates VIP
   without changing the approved City layout.
