# Territory — Sdolars S91 MERGED

This package starts from the approved working GitHub-connected base and merges the later gameplay systems without replacing the working base.

## Included
- Existing approved Sdolars city/mobile UI preserved
- Tactical PvE battle: 1 attack zone + 2 defense zones
- 4-zone combat layout (Head, Chest, Waist, Legs), automatic strike after both selections
- 15-second turn timeout
- Auto-battle
- Character progression, XP, HP, Strength, Agility and persistent stats
- Districts with level gates, enemies, rewards and win counters
- Inventory/equipment, buying, equipping, using and discarding items
- Forge upgrades
- Crafting and resource gathering
- Daily reward and daily missions
- Quests and achievements
- Tavern heroes and hero training
- Guild create/join/leave/contribution
- Market item selling
- Season rating and leaderboard
- Global/clan chat with WebSocket when the same-origin server is available, local fallback otherwise
- RU/EN language toggle
- Telegram WebApp identity support
- Virtual-coin casino only; no real-money payments
- Server API with local fallback so the same frontend remains playable when opened as a static GitHub Pages build

## Run
- `npm run dev` — local Wrangler development
- `npm run deploy` — deploy Worker + Durable Object

The Worker serves the same `index.html` embedded in `worker.js`, so the frontend and backend are kept in sync.
