-- TERRITORY — NEW GAME RESET / ALL EXISTING PLAYERS
-- Purpose:
--   Reset every existing player to the real starting state.
--   Telegram identity is preserved (telegram_id, username, first_name,
--   last_name, photo_url, created_at).
--   Gameplay/economy/test history is cleared so no old level/VIP/items/
--   rewards/mail/progress leak into the new game.
--
-- IMPORTANT:
--   Run the statements below in order in Cloudflare Durable Objects Data Studio
--   for the TerritoryDB object that stores the players.
--   Do NOT delete the players table/rows themselves.

-- 1) Clear old gameplay/session/economy/test records.
DELETE FROM inventory;
DELETE FROM player_mail;
DELETE FROM daily_scores;
DELETE FROM tournament_awards;
DELETE FROM finance;
DELETE FROM anti_cheat;
DELETE FROM economy_ledger;
DELETE FROM player_events;
DELETE FROM arena_reward_claims;
DELETE FROM pve_sessions;
DELETE FROM mail_broadcasts;

-- 2) Reset every existing account while preserving Telegram identity.
UPDATE players
SET
  level = 1,
  exp = 0,
  hp = 100,
  max_hp = 100,
  coins = 0,
  gems = 0,
  red_gems = 0,
  vip = 0,
  strength = 5,
  agility = 5,
  defense = 0,
  weapon = 'Кулаки',
  banned = 0,
  ban_reason = '',
  state_json = '{"currentChapter":1,"chapterStage":1,"chapterProgress":0,"chapterBossUnlocked":false,"chapterBossDefeated":false,"chapterCompleted":false,"battleStones":30,"battleStonesBonus":0,"battleStonesDate":"","battleStonesCap":30,"pve":{"chapter":1,"stage":1,"progress":0,"wins":0,"bossDefeated":0,"bossPending":false,"bossActive":false},"lootFound":0,"totalChaptersCompleted":0,"rewardProgress":{"dailyDate":"","daily":{"wins":0,"loot":0,"forge":0,"bosses":0,"chapters":0},"weekly":{"wins":0,"loot":0,"forge":0,"bosses":0,"chapters":0}},"forge":{"materials":0,"successes":0,"failStreak":0,"selectedId":null},"followers":{"activeFollower":"liabro","items":{"liabro":{"id":"liabro","owned":true,"level":1,"xp":0,"awakened":false,"awakeningClaimed":false}}},"activeFollower":"liabro","inventoryItems":[],"equipment":[null,null,null,null,null,null,null],"consumables":{},"arena":{"rating":1000,"wins":0,"losses":0,"battles":0},"story":{"arc01":0,"step":0,"claimed":{},"started":false}}',
  updated_at = CAST(strftime('%s','now') AS INTEGER);

-- 3) Verification: this should show only clean starting values.
SELECT
  COUNT(*) AS players_total,
  SUM(CASE WHEN level = 1 AND exp = 0 AND vip = 0 AND coins = 0 AND gems = 0
            AND hp = 100 AND max_hp = 100 AND banned = 0 THEN 1 ELSE 0 END) AS players_clean,
  MIN(level) AS min_level,
  MAX(level) AS max_level,
  MIN(vip) AS min_vip,
  MAX(vip) AS max_vip,
  SUM(coins) AS total_coins,
  SUM(gems) AS total_gems
FROM players;

-- 4) Verification: no old per-player gameplay records remain.
SELECT
  (SELECT COUNT(*) FROM inventory) AS inventory_rows,
  (SELECT COUNT(*) FROM player_mail) AS mail_rows,
  (SELECT COUNT(*) FROM daily_scores) AS daily_score_rows,
  (SELECT COUNT(*) FROM tournament_awards) AS tournament_rows,
  (SELECT COUNT(*) FROM finance) AS finance_rows,
  (SELECT COUNT(*) FROM anti_cheat) AS anti_cheat_rows,
  (SELECT COUNT(*) FROM economy_ledger) AS ledger_rows,
  (SELECT COUNT(*) FROM player_events) AS event_rows,
  (SELECT COUNT(*) FROM arena_reward_claims) AS arena_reward_rows,
  (SELECT COUNT(*) FROM pve_sessions) AS pve_session_rows,
  (SELECT COUNT(*) FROM mail_broadcasts) AS broadcast_rows;
