10051 — DIRECT HOME BATTLE

Replace these files at repository root:
index.html
pve-battle.js
battle-flow-10051.js
battle-flow-10051.css

Flow: HOME -> Бой -> full-screen run scene -> bot -> PvE. No intermediate start button. PvE has no timer. 1 hit = 1 combat stone. After victory the next bot starts automatically. At 100% the skull opens the Boss; only Boss keeps the timer.


10052 FIX: center HOME battle button has a dedicated mobile touch target; combat stones are visible as ⚔️ count; when count is 0 tapping Battle shows a clear message instead of silently doing nothing.

10053: Bots are sequential until 100%. Skull opens boss only at 100%. Losing boss returns HOME; boss remains undefeated. Battle starts farming ordinary bots for XP/coins and can retry the same boss after reaching 100% again.

10054: fixed recursive Battle router; stable HOME -> run; two bots approach; boss loss returns to HOME and preserves undefeated boss for farming.
