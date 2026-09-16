# Territory v140 — canonical continuation base

This patch keeps the current working Territory/Sdolars frontend as the base and replaces the incorrect S98 Arena layer.

## Arena v140
- 3 modes: 1×1, chaotic, group
- 3-minute room timer with automatic start
- group mode up to 20 players
- team 1 / team 2 selection in group mode
- 4 attack zones: head, chest, waist, legs
- 4 defense zones, with 2 selected per turn
- turn-based combat
- collapsible combat log
- finish / extend fight controls
- leaving a room prevents re-entry to that room
- local test-player button for checking the flow before real multiplayer backend integration

## Canonical base preserved
- Sdolars city scene
- profile and persistent state
- districts
- equipment market / inventory
- Game board
- existing server.js remains isolated

The supplied gameplay video is the visual/process reference for the next development stages. Features visible in the video that are not yet implemented in the current base should be added incrementally from this base rather than mixing older versions.
