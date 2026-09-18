Territory G60 — CITY INTERACTION + PVE RESTORE

BASE: G59 ALEX + PvE FIXED.

FIXED:
- Exposed the existing Alex quest handler as window.TerritoryAlexTalk so the dedicated city touch layer can actually open Alex.
- Connected the dedicated city touch buttons for Profile, Battle and Arena to their real routes.
- Battle now calls the fullscreen G55/G56 PvE renderer instead of falling through to the legacy embedded G49 #pve screen.
- Added a fallback route for Battle/Arena if the global function is unavailable.
- Disabled the legacy embedded #pve screen so the old G49 tactical panel cannot appear as the city Battle destination.
- Cache-busted app/arena/global scripts to v600.

PRESERVED:
- Approved Sdolars city artwork.
- Alex portrait asset.
- Arena module.
- G56 character/economy/save core.
- PvE and Arena remain separate.

INSTALL:
Replace the current GAME files with this complete ZIP.
Do not upload to SERVER.
G56 remains the rollback/control backup.
