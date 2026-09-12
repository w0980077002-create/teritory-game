# Territory — S90 GitHub Pages

Это **полностью статическая версия Territory**, предназначенная для запуска напрямую с GitHub Pages.

Структура:
- `index.html`
- `assets/home-screen.png`
- `assets/home-screen-full.png`

Что изменено:
- убраны обращения к `/api/state` и `/api/action`;
- убран WebSocket `/ws`;
- состояние игрока, магазин, инвентарь, экипировка, задания, бонус, районы и тактический бой работают локально через `localStorage`;
- тактический бой сохранён: 1 зона атаки + 2 разные зоны защиты;
- Cloudflare Worker больше не требуется для запуска этой версии;
- версия помечена `S90-GITHUB-PAGES`.

## Запуск

Включить GitHub Pages для репозитория и выбрать ветку `main`, папку `/ (root)`.

Важно: Telegram WebApp должен использовать URL GitHub Pages, а не старый Cloudflare URL.
