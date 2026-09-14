Territory S105 — working base + video-inspired Arena

BASE:
This package starts from the uploaded working base, not from the previous GitHub version.

CHANGES:
- Keeps the existing index.html and all supplied JS/server files.
- Replaces the active window.openBattle() entry with a new video-inspired auto battle.
- 30-second timer.
- Two fighters with HP bars and levels.
- Automatic turns.
- Skills: Удар, Сокрушение, Точный, Лечение.
- Energy/rage resource.
- Critical hits and dodge.
- Floating damage/heal numbers.
- Battle log.
- Victory/defeat result.
- Coins and XP progression are saved through the existing localStorage/saveState system.
- Existing tactical PvP remains accessible from the Arena as "Тактический PvP".
- No Cloudflare dependency added.
- No new external libraries.

IMPORTANT:
This is a client-side gameplay layer for testing the visual/gameplay loop. Existing server.js is preserved unchanged.
