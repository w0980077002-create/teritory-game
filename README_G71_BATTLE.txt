Territory G71 — UNIFIED BATTLE CONTRACT

BASE: G70 SERVER-READY / G69 loop / G68 character / G67 progression / G66 districts.

CHANGED:
- Territory_G71_BATTLE.js
- index.html
- README_G71_BATTLE.txt

WHAT THIS DOES:
- Adds one normalized technical battle-event contract for PvE and Arena.
- Event types: start, turn, attack, defense, damage, victory, defeat, reward.
- Bridges existing PvE/Arena result counters into the contract.
- Keeps PvE rules and Arena rules separate; this is only an integration layer.
- Sends normalized local battle events into the existing G70 server-ready outbox.
- No network calls and no WebSocket are introduced.
- City artwork is untouched.

IMPORTANT:
- This is a local/server-ready preparation step, not real multiplayer.
- Do not upload to SERVER yet.
