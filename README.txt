TERRITORY — NEW GAME RESET / ALL EXISTING PLAYERS

This is the one-time production reset for the current test phase.

What it does:
- resets ALL existing player accounts to Level 1 / XP 0 / VIP 0;
- clears coins, gems and old test progress;
- clears old inventory, mail, PvE sessions, Arena reward claims, anti-cheat state,
  finance/test ledger, daily/tournament records and player events;
- resets PvE, forge, followers, equipment, consumables, story and Arena state;
- preserves Telegram identity: Telegram ID, username, first name, last name,
  photo and account creation timestamp;
- does NOT touch shop_catalog.

After this reset, the game starts from a clean server-authoritative baseline.
Future level/XP/VIP changes must come from real game systems. VIP remains 0 until
a real payment/Stars system is actually connected and a purchase is completed.

Run the SQL file in Cloudflare Durable Objects Data Studio against the production
TerritoryDB object. Execute the statements in order and check both verification
queries at the end.

Do not delete the players table or player rows.
