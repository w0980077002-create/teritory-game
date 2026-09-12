# Territory — Sdolars — S80

S80 is a direct repair of the current Territory build.

Fixed from the phone screenshot:
- Removed the yellow active-tab underline from the bottom navigation.
- Fixed bottom navigation selector: the real buttons are `.bottom button`, not `.nav-item`.
- Added one capture-phase delegated mobile click handler for the four large action buttons.
- The first large action button explicitly calls the real `window.battle()` function.
- Worker embeds the exact same index.html.
- Worker version = s80.
- 4 combat zones remain: Голова / Грудь / Пояс / Ноги.
- Attack = 1 zone; Defense = 2 zones.
- S80 marker is shown on the city screen so deployment can be verified.

If the phone still shows `S78`, it is not loading this build.
