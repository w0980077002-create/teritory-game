TERRITORY FIX 01 — CORRECTED ROOT PATCH

ВАЖНО: все файлы этого ZIP лежат В КОРНЕ игрового репозитория.
Не создавай папку game/ и не загружай сам ZIP как вложенную папку.

Пакет содержит только файлы, которые нужно добавить/заменить в корне текущего teritory-game:
- index.html
- territory-telegram-auth-pass55.js
- territory-home-canonical-guard-03.js
- territory-live-home-hud-02.js
- territory-live-home-hud-02.css
- territory-profile-details-04.js
- territory-profile-details-04.css
- territory-telegram-only-hardening-01.js

Причина предыдущего белого экрана: предыдущий ZIP был ошибочно упакован с путём game/index.html, хотя ожидалась загрузка файлов в корень репозитория. Из-за этого зависимости index.html не находились по правильным путям.

Этот пакет НЕ содержит копию всего репозитория и НЕ удаляет существующие игровые файлы. Он рассчитан на добавление/замену файлов выше поверх текущего teritory-game.
