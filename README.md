# Territory v61 — Game real working board

Game was rebuilt as a real functional DOM board instead of hiding the previous board elements.

- 20 actual clickable cells in a non-overlapping 6×6 perimeter.
- START is cell 1; FINISH is cell 20.
- Token position is calculated from the real cell geometry.
- Clicking a cell updates the cell information panel.
- Dice roll/movement, rewards, tasks, gift and special-offer panels keep the existing game logic.
- Gift / Tasks / Special Offer are separate controls and do not sit on the board.
- Real S$S ship artwork is used in the center.
- Mobile layout is isolated in `game.css`; old Game CSS is not used to position the board.
- `style.css` is intentionally not included because it was not changed.
