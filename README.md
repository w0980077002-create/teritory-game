# Territory G44 GLOBAL

G44 is the next integrated gameplay pass built directly from the verified G43 GLOBAL working base.

## Preserved
- Sdolars City artwork/composition and existing City navigation.
- Character/economy state from G42/G43.
- G48.1 Arena implementation in `arena.js`.
- 1x1 / Chaos / Group Arena rules.

## G44 gameplay pass
- Reworked PvE battle presentation into a dedicated battle stage.
- Visible hero/enemy HP, round counter and combat stats.
- Four attack zones and exactly two defense zones remain the core tactical choice.
- PvE path/progress is shown during the fight.
- Reward preview is shown before the turn.
- Battle log remains visible.
- PvE equipment bonuses now respect item durability: broken equipment no longer grants its damage/defense bonus.
- Reopening PvE starts a fresh encounter instead of retaining a stale enemy state.
- Equipment repair/durability loop from G42 remains integrated.

## Important
This is still a client-side prototype. Real cross-device Arena multiplayer, authoritative economy, anti-cheat and server validation require the separate SERVER/WebSocket implementation.

Do not upload this package to the SERVER repository.
