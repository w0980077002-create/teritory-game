# Territory v62 — Game rebuilt as a real working mobile field

Game is rebuilt as a self-contained functional Monopoly-style event screen.

- Real 20-cell DOM board, not a static board image.
- Cell 1 is START; cell 20 is FINISH.
- The token moves between actual cells after a dice roll.
- Cell labels stay readable while the path follows a diamond.
- Tapping a cell updates the cell information panel.
- Gift, Tasks and Special Offer are separate controls above the board.
- Ancient winter harbor visual background with S$S / SDOLARS branding.
- S$S sailing ship is the center artwork.
- Existing rewards, tasks, gift and offer logic remain functional.
- Event countdown and dice count remain functional.

The Game layout is isolated in `game.css` so legacy styles do not overlay the rebuilt board.
