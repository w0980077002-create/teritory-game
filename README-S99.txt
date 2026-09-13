TERRITORY S99 — MARKET 2.0

Готовый компактный рынок, связанный с существующим API.

Добавлено:
- рынок Сдоларса;
- фильтры оружие / броня / пояса;
- цены и характеристики;
- покупка предмета через /api/market/buy;
- после покупки можно открыть S98 и сразу увидеть предмет в рюкзаке;
- мобильная верстка без огромных карточек;
- index.html не изменяется.

Подключение:
<script src="s99-market.js"></script>
<script src="s98-backpack.js"></script>
<script src="s98-backpack.css"></script>
<link rel="stylesheet" href="s99-market.css">

Открытие:
openTerritoryS99(playerId)

S99 использует существующие серверные:
GET /api/market
POST /api/market/buy
GET /api/equipment

GitHub автоматически не изменяется.
