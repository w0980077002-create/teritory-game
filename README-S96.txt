S96 — LIVE EQUIPMENT IN PvP
============================

Теперь PvP передаёт реальную экипировку персонажа.

В объекте attacker/defender появляются:
- equipment.weapon
- equipment.armor
- equipment.belt
- stats.power
- stats.maxHp
- stats.crit
- stats.level

Это связывает:
РЮКЗАК → ЭКИПИРОВКА → ПРОФИЛЬ БОЙЦА → PvP → ВИЗУАЛЬНОЕ ОРУЖИЕ.

Также:
- HP нового боя берётся из актуальных боевых характеристик;
- S95 может определить настоящее оружие бойца;
- существующий pvpPublic заменяется на S96-сериализацию;
- остальные системы сервера не удаляются.

Перед изменением server.js создаётся server.js.s95-backup.

Порядок для клиента:
S92 → S93 → S94 → S95.
После S96 S95 получает equipment прямо из match.attacker/defender.
