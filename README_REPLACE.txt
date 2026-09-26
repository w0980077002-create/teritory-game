TERRITORY GAME — CLICK REPAIR V3

Replace exactly these 3 files:
- index.html
- home-rebuild.js
- navigation-final.js

Important: do NOT delete the existing game CSS/JS/assets. This ZIP contains the corrected input layer only.

Fixes:
- HOME host no longer intercepts touches.
- HOME hitzones remain transparent but clickable.
- Touchend/pointerup coordinate fallback works on Android/iPhone WebView.
- HOME coordinate fallback uses the real host element.
- Global navigation remains deterministic without disabling native buttons.
