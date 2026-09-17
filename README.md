# Territory — Clean Base v2

Единая мобильная frontend-база Territory / Sdolars.

## Рабочая структура
- index.html
- style.css
- game.css
- arena.css
- app.js
- arena.js
- sdolars_scene.png
- README.md
- VERSION.txt

## Главный экран
- portrait-сцена Sdolars
- верхний HUD
- видимые кнопки Арена / Рынок / Районы / Game
- Alex и Торговец
- нижняя навигация Город / Арена / Районы / Профиль / Магазин
- без невидимых перекрывающих hotspot-кнопок

## Убрано
- server.js из frontend-базы
- Casino
- VIP
- командный штаб
- осада
- логистика
- старые world/final CSS-поколения
- старые inline CSS поколения
- декоративные автособытия на главном экране

## Arena
Текущее Arena-ядро является локальным PvE frontend-прототипом. Настоящий multiplayer с lobby, таймером 3 минуты, 1x1, хаотическим распределением, группой до 20 игроков и запретом повторного входа будет отдельным сетевым этапом.

## Game
Сохраняется Game с 27 клетками, кубиками, x10, наградами и заданиями.

Для GitHub Pages / статического Telegram Web App отдельный server.js в этой базе не нужен.
