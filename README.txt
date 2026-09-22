TERITORY GAME — ARENA ONLINE BOTS v21

This package replaces ONLY:
  arena.js
  arena.css

Do NOT replace home-rebuild.js or home-rebuild.css.

What is implemented:
- Human-first 1v1 matchmaking simulation.
- 3v3 team matchmaking simulation.
- Chaos mode explicitly DOES NOT insert bots.
- Bot profiles look like normal players: name, flag, level, class, rating, wins/losses, play style.
- Classes: Tank, Berserker, Assassin, Duelist, Support.
- AI tactics differ by class/style.
- Rating, streak, wins/losses and battle history persist locally.
- Background bot-vs-bot server activity is simulated locally to keep the arena alive.
- actionId and turnSeq are included in the client battle state as the foundation for server-authoritative transport.
- Mobile-first UI uses the existing arena modal and does not alter HOME artwork/background.

Important:
This is the frontend/gameplay foundation. True cross-player real-time PvP and server-authoritative persistence require a backend/WebSocket/API. The UI and state model are prepared so that transport can be connected without redesigning the arena.
