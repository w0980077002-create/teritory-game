Territory S102 — INTEGRATED BUILD
================================

S102 is the first consolidated runtime build after S84-S99.

Server:
- Telegram auth preserved;
- real profile / character progression;
- equipment + backpack API;
- market/economy;
- quests and rewards;
- Sdolars districts;
- PvP with EXACTLY 1 attack zone + EXACTLY 2 defense zones;
- Strength / Agility / crit / dodge;
- live equipment and HP in PvP;
- clans, player list and WebSocket compatibility;
- serves index.html and automatically injects s102-client.js.

Client:
- compact mobile bottom navigation;
- Character;
- Backpack;
- Market;
- Quests;
- Sdolars districts;
- tactical Arena.

The previous server.js is intentionally kept untouched as a rollback baseline.
Package start now uses s102-integrated.js.
