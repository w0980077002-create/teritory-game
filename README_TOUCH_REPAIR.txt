TERRITORY — TOUCH CALIBRATION REPAIR v2
========================================

This is an OVERLAY package.

Replace ONLY:
  navigation.css

Why:
The previous hitboxes were placed too low. For example, the "Ежедневные награды"
button occupied roughly 18–26% of the actual game viewport, while the old hitbox
started at 25%, so a tap could land in the "События" hit area.

This version calibrates the transparent touch zones against the supplied home
screen reference:
- События / Лавка
- Ежедневные награды / Кузница
- Задания / Испытания
- Пригласить друзей / Захват улиц
- Морской набор / Арена
- chapter banner
- top profile/trophy/mail/settings
- bottom 7 navigation buttons

No game logic, economy, PvE or Arena files are changed.

IMPORTANT:
This is a touch-hitbox correction only. It is intentionally small so we do not
introduce another large patch over the working game.
