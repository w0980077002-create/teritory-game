Territory G60 — CLEAN RUNTIME FIX

BASE:
- G59 control base / approved Sdolars City artwork.
- PvE and Arena remain separate.
- City visual artwork is untouched.

CHANGED:
1. index.html
   - Fixed the runtime initialization order.
   - app.js, arena.js and Territory_G58_GLOBAL.js now load AFTER the HTML body.
   - This fixes the fatal app.js startup error where #shopGrid was still absent from the DOM.
   - Updated page title to G60.
   - Added cache-bust v600.

ROOT CAUSE FOUND IN GITHUB:
app.js was loaded from <head>, but immediately executed:
  $("#shopGrid").addEventListener(...)
while #shopGrid had not yet been parsed. That threw a TypeError and stopped app.js before its global [data-screen] click handler was installed.
The result was exactly what was observed: the City image opened, but the navigation buttons did nothing.

VERIFICATION:
- app.js syntax: OK
- arena.js syntax: OK
- Territory_G58_GLOBAL.js syntax: OK
- index.html has exactly three runtime scripts, all placed immediately before </body>.

INSTALL:
Replace the GAME repo contents with the files from this ZIP.
No SERVER changes.
