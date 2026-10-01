BEGIN TRANSACTION;

-- ONE-TIME Territory production reset.
-- Run once against the GLOBAL TerritoryDB Durable Object in Cloudflare Data Studio.
-- Telegram identity fields are preserved.

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

UPDATE players
SET
  level=1, exp=0, hp=100, max_hp=100,
  coins=0, gems=0, red_gems=0, vip=0,
  strength=5, agility=5, defense=0, weapon='Кулаки',
  banned=0, ban_reason='',
  state_json='{"currentChapter":1,"chapterStage":1,"chapterProgress":0,"chapterBossUnlocked":false,"chapterBossDefeated":false,"chapterCompleted":false,"battleStones":30,"battleStonesBonus":0,"pve":{"chapter":1,"stage":1,"progress":0,"bossPending":false,"bossActive":false,"wins":0,"bossDefeated":0},"lootFound":0,"inventoryItems":[],"equipment":[null,null,null,null,null,null,null],"consumables":{},"forge":{"materials":0,"successes":0,"failStreak":0,"selectedId":null},"followers":{"activeFollower":"liabro","items":{"liabro":{"id":"liabro","owned":true,"level":1,"xp":0,"awakened":false,"awakeningClaimed":false}}},"activeFollower":"liabro","arena":{"rating":1000,"wins":0,"losses":0,"battles":0},"story":{"arc01":{"step":0,"flags":{}}},"rewardProgress":{}}',
  updated_at=strftime('%s','now')*1000;

DROP TRIGGER IF EXISTS territory_fresh_player_defaults;
CREATE TRIGGER territory_fresh_player_defaults
AFTER INSERT ON players
FOR EACH ROW
BEGIN
  UPDATE players SET
    level=1, exp=0, hp=100, max_hp=100,
    coins=0, gems=0, red_gems=0, vip=0,
    strength=5, agility=5, defense=0, weapon='Кулаки',
    banned=0, ban_reason='',
    state_json=CASE
      WHEN NEW.state_json IS NULL OR NEW.state_json='{}' OR NEW.state_json=''
      THEN '{"currentChapter":1,"chapterStage":1,"chapterProgress":0,"chapterBossUnlocked":false,"chapterBossDefeated":false,"chapterCompleted":false,"battleStones":30,"battleStonesBonus":0,"pve":{"chapter":1,"stage":1,"progress":0,"bossPending":false,"bossActive":false,"wins":0,"bossDefeated":0},"lootFound":0,"inventoryItems":[],"equipment":[null,null,null,null,null,null,null],"consumables":{},"forge":{"materials":0,"successes":0,"failStreak":0,"selectedId":null},"followers":{"activeFollower":"liabro","items":{"liabro":{"id":"liabro","owned":true,"level":1,"xp":0,"awakened":false,"awakeningClaimed":false}}},"activeFollower":"liabro","arena":{"rating":1000,"wins":0,"losses":0,"battles":0},"story":{"arc01":{"step":0,"flags":{}}},"rewardProgress":{}}'
      ELSE NEW.state_json END,
    updated_at=NEW.updated_at
  WHERE telegram_id=NEW.telegram_id;
END;

CREATE TABLE IF NOT EXISTS territory_meta(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO territory_meta(key,value,updated_at)
VALUES('game_start','NEW-GAME-STARTED',strftime('%s','now')*1000)
ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at;

COMMIT;

-- VERIFY CURRENT PLAYERS
SELECT COUNT(*) AS players_total,
       SUM(CASE WHEN level=1 AND exp=0 AND vip=0 AND coins=0 AND gems=0 AND hp=100 AND max_hp=100 AND banned=0 THEN 1 ELSE 0 END) AS players_clean,
       MIN(level) AS min_level, MAX(level) AS max_level,
       MIN(vip) AS min_vip, MAX(vip) AS max_vip,
       COALESCE(SUM(coins),0) AS total_coins,
       COALESCE(SUM(gems),0) AS total_gems
FROM players;

-- VERIFY OLD TEST DATA IS EMPTY
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

-- VERIFY PERMANENT CLEAN START FOR FUTURE PLAYERS
SELECT name FROM sqlite_master WHERE type='trigger' AND name='territory_fresh_player_defaults';
SELECT key,value FROM territory_meta WHERE key='game_start';
