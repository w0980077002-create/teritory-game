Territory — Sdolars s29

База: s28.

s29 — серверная игровая версия. В этой версии сделан следующий обязательный слой: Telegram-аутентификация на сервере, серверный профиль игрока, SQLite-хранилище, серверные игровые действия и авторитетный расчёт PvP. Интерфейс s27/s28 сохранён.

Сделано:
- Telegram Web App initData криптографически проверяется Worker через TELEGRAM_BOT_TOKEN.
- Игрок получает стабильный server ID tg_<telegram_id>.
- Профиль игрока хранится в SQLite Durable Object.
- /api/auth — вход/первичная миграция локального прогресса.
- /api/me — получение серверного профиля.
- /api/action — серверные действия: награда PvE, поражение, квест, ежедневный бонус, характеристики, покупка, аптечка, кузница.
- WebSocket /ws требует серверную Telegram-аутентификацию.
- Онлайн игроки и PvP работают через Durable Object.
- PvP-урон, крит, уклонение и награды рассчитываются сервером.
- SQLite таблицы players, guilds, guild_members.
- Клиент не отправляет серверу произвольный playerId для доступа к чужому профилю.

ВАЖНО:
- BOT TOKEN НЕ хранить в index.html, worker.js или GitHub. Использовать Cloudflare Secret.

ДЕПЛОЙ:
1. npm install
2. npx wrangler login
3. npx wrangler secret put TELEGRAM_BOT_TOKEN
   Вставить токен Telegram-бота в появившееся поле.
4. npm run deploy
5. Cloudflare выдаст адрес вида https://territory-sdolars.<subdomain>.workers.dev

После deploy:
- https://ВАШ-ДОМЕН/api/health
- игра: https://ВАШ-ДОМЕН/
- WebSocket: wss://ВАШ-ДОМЕН/ws

Telegram Mini App должен открываться с HTTPS-адреса Worker.

Что ещё осталось до полноценной коммерческой MMO:
- полностью вынести весь PvE-бой и все предметы в серверные battle sessions/tickets, чтобы клиент вообще не мог инициировать награду;
- отдельные таблицы inventory/equipment/quests/matches/ratings/messages/events;
- полноценные гильдии и клановые права;
- рейтинг/ELO и сезонные таблицы;
- антиспам/rate limiting/модерация;
- резервное копирование и восстановление;
- районы Sdolars, NPC, цепочки квестов, контент;
- затем полноценный 3D слой Three.js.

Казино пока НЕ добавлять.
