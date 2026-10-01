TERRITORY — ONE-TIME NEW GAME START

This is the single production reset we agreed on.

Run RESET-NEW-GAME-ONCE.sql ONCE in Cloudflare Data Studio against the global TerritoryDB Durable Object.

It:
- resets every existing player to Level 1 / XP 0 / VIP 0;
- clears old test economy, inventory, mail, PvE, Arena and history tables;
- preserves Telegram identity fields;
- gives the clean initial game state and 30 battle stones;
- installs a permanent clean-start trigger for future newly-created players;
- writes a marker so the operation can be verified.

After the SQL succeeds, do not run another reset. From that point onward players start a normal persistent game and their server-owned progress is saved normally.
