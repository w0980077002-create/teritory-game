# Territory — Sdolars — S88

Base: confirmed working S83.

S88 changes:
- Casino is removed completely from the game client.
- "Ещё" no longer duplicates City systems.
- "Ещё" contains only unique secondary systems: Сезон, Чат, Достижения, Настройки.
- "Ещё" buttons have Territory dark/blue styling and do not use default browser-white buttons.
- Core City buttons remain in the City screen.
- Battle remains 4 zones: Голова / Грудь / Пояс / Ноги; attack 1, defense 2.
- Worker embeds the exact same index.html.

QA:
- all inline scripts pass node --check;
- worker.js passes node --check;
- no casino references remain in index.html;
- embedded Worker HTML equals project index.html.
