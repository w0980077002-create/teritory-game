TERRITORY FORGE V18 — REAL HUD/ARENA ISOLATION

V17 did not change the observed behavior, so V18 fixes the actual ownership of events instead of adding another coordinate layer.

Changes:
- removed legacy global coordinate hit-testing from the home header; native button events are authoritative;
- rebuilt the home HUD as a stable two-column row: profile left, resources right;
- Arena now has explicit open/close state: aria-hidden, display and pointer-events are synchronized;
- showScreen() forcibly hides Arena whenever another screen is selected;
- hidden Arena is inert and cannot cover the city;
- Arena combat logic itself is unchanged;
- backend untouched.

Install: replace frontend files, commit, wait for Render, fully close/reopen Telegram Mini App.
