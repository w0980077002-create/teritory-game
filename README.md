TERRITORY — LIVE HOME FIX 02

Я нашёл точную причину в актуальном home-life.js:
init() делает:
  bind();bindBattleBridge();bindPvEAutoBridge();paint();

Но bind() в этом файле отсутствует. Поэтому на DOMContentLoaded возникает
ReferenceError и нормальный запуск HomeLife обрывается.

Этот пакет чинит именно это место через отдельный совместимый runtime-файл,
который загружается ДО home-life.js и предоставляет пустой bind(). После
запуска дополнительно вызывает безопасный HomeLife.refresh().

В ZIP:
1) territory-home-bind-fix.js — новый фикс.
2) index.html — уже изменённый порядок загрузки.

Что загрузить в GitHub:
- заменить index.html этим;
- добавить territory-home-bind-fix.js в корень репозитория.

Другие файлы не трогать.

После GitHub:
Render → Deploy → дождаться Deploy succeeded → открыть игру в Telegram.

Cloudflare, Telegram auth, экономика и боевая математика НЕ изменяются.
