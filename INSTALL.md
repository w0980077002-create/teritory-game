# TERRITORY GAME — PASS 2

Залить эти 4 файла в `teritory-game` с заменой существующих:

- `index.html`
- `territory-complete-pass-2026-09-30.js`
- `territory-complete-pass-2026-09-30.css`
- `territory-live-arena-bridge.js`

В `index.html` теперь ЯВНО подключён `territory-live-arena-bridge.js` и добавлен
cache-buster `?v=20260930-2`, чтобы браузер Render не продолжал брать старый JS.

После push:
1. дождаться deploy Render;
2. открыть игру в приватном/инкогнито окне;
3. проверить, что новая кнопка камней появилась;
4. открыть Arena.

Этот пакет исправляет именно предыдущую ошибку: bridge был загружен в GitHub,
но не был подключён из `index.html`.
