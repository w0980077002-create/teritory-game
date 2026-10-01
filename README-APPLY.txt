# TERRITORY FINAL INTEGRATION PASS — 2026-10-01

This is one coherent pass for the current GitHub state. It does NOT touch the canonical bottom navigation files.

## What this pass fixes

1. Authenticated PvE is server-state driven:
   - every attack/skill/elixir is sent to `/api/pve/action`;
   - the returned server combat snapshot is rendered on the existing PvE screen;
   - local random combat math is bypassed for authenticated players;
   - server win/lose is the only result accepted;
   - `/api/pve/complete` is called only after the server has confirmed victory;
   - server-generated PvE loot/state is applied once; loot choice is shown only after the server has actually issued the item;
   - guest/demo PvE remains on the existing local engine.

2. Removes the previous double-transcript wrapper:
   - `territory-pve-authority-01d.js` is now transport-only;
   - `territory-pve-authority-fix-02.js` owns the authenticated combat input.

3. Exposes the active PvE server session so the final controller cannot lose the nonce/session ID.

4. Keeps the existing navigation/index chain intact except for replacing the three PvE authority files and reusing the same script names already present in `index.html`.

## Files to replace on GitHub

- `index.html`
- `territory-pve-authority-01c.js`
- `territory-pve-authority-01d.js`
- `territory-pve-authority-fix-02.js`

Do not delete the existing navigation files or the live arena bridge.

## Important manual step after upload

The Cloudflare Worker in `territory-sdolars-server` already exposes the required authoritative PvE endpoints. The deployed Worker must be the current `worker.js` from that repository. If the live Worker is older than the repository, deploy the server repository before testing authenticated PvE.

Telegram Stars payments are still an external production setup item: the codebase does not currently contain a complete Stars checkout/fulfillment flow. Do not treat the shop's local/demo purchase UI as real payment processing.

The `territory-sdolars-chat` repository was not accessible from GitHub at the time of this pass, so no chat-repository code was invented or packaged.
