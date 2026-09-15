# Territory Sdolars v44 — Game / Monopoly Event

v41 продолжает v40 и добавляет полноценный игровой модуль **Game** по механике и визуальному принципу из предоставленного видео.

- Game остаётся отдельным режимом внутри Territory.
- Старая рулетка/казино заменена на поле с клетками и центральной сценой.
- Добавлен древний стиль кубиков и ограниченный запас бросков.
- Бросок даёт 1–6 клеток; персонаж проходит клетки последовательно.
- Есть «Пропустить анимацию» для мгновенного завершения перемещения.
- Клетки дают монеты, кристаллы, предметы, свитки или случайную награду `?`.
- Есть прогресс кругов и контрольные награды за 5/10/15/20/25 кругов.
- Добавлено окно пакетной награды с коротким обратным отсчётом.
- Добавлен ежедневный подарок без бесконечного фарма.
- Добавлены задания Game с прогрессом и получением наград.
- Состояние Game сохраняется в существующий `localStorage` Territory.
- Arena, рынок, районы, Alex Quest и живой Sdolars сохранены.


## Territory v42
- Game/Монополия: завершён цикл бросок → пошаговое движение → клетка → награда → круг → контрольная награда.
- Добавлены отдельные счётчики бросков и пройденных клеток.
- Исправлена кнопка пропуска анимации.
- Таймер события больше не конфликтует с таймером окна награды.
- Контрольные награды 5/10/15/20/25 кругов выдаются по достижении и отмечаются галочкой.
- Ролл блокируется во время движения и показа награды.
- Улучшена мобильная компоновка Game для коротких экранов.


## Territory v44
- Game board converted to a 24-cell diamond track closer to the supplied reference video.
- Player token is anchored to the actual board and moves cell-by-cell along the track.
- Removed the old 20-cell corner overlap so every board position is unique.
- Central Game scene is kept compact; the board no longer stretches into a large flat panel.
- Added compact Game controls for Special Offer, Gift and Tasks.
- Added event offer panels with free/limited rewards and event task presentation.
- Added the lower “Призы x10” indicator and preserved the ancient dice control.
- Kept the existing Territory save, city, Arena, Market, Districts and Alex systems intact.
- Verified app.js with Node syntax check.


Territory v44: финальная мобильная компоновка Game, восстановлены все игровые панели, 24-клеточная дорожка, движение фишки, награды и контрольные круги.
