# Territory v64 — Sdolars Winter Game

Mobile Game screen rebuilt around the supplied Sdolars winter harbor artwork.

- `harbor_top.jpg` is used as the real winter harbor scene instead of a CSS imitation.
- `ship_only.png` is used as the central S$S ship artwork.
- The playable board remains a real 20-cell DOM board.
- The token still moves between real cells after a dice roll.
- Reward rail, gifts, tasks, special offers, countdown and dice logic remain functional.
- Game styling is isolated in `game.css` under `#game`; old `#casino` rules in the legacy stylesheet do not control this screen.
- Cache-busting query versions are aligned to v64 in `index.html`.
