Territory S90 FINAL FRONTEND

index.html is the complete final frontend built against the existing S89 worker.js API.
Copy index.html into the existing project root so assets/home-screen.png and worker.js remain in place.

Supported server actions used by this frontend:
/api/state
/api/action: lang.set, stat.add, bonus.claim, quest.complete, item.buy, item.equip, item.unequip, item.use, district.travel, battle.start, battle.turn, battle.reward, battle.loss

The frontend does not invent unsupported forge/tavern/VIP server actions.
