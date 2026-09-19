Territory G79 — SOCIAL REALTIME INTEGRATION

BASE: G78 REALTIME GAME.

CHANGES:
- Restores the existing G72 Social Center and G73 Party module in the G78 loader chain.
- Adds a Realtime tab showing current WebSocket connection/authentication and online count.
- Adds a Group tab connected to the existing G73 Party state and realtime presence.
- Bridges server party invites into the Social Center notification/party state.
- Adds safe notification/party methods required by the older G73 module.
- Keeps G78 WebSocket transport and G76 HTTP server bridge intact.
- City visual, PvE and Arena rules are untouched.

IMPORTANT:
- Real online/party/chat require the G77 Worker to be deployed and G78 GAME to be installed.
- This module does not invent a second player database or second network transport.
