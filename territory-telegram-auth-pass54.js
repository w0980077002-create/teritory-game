/* Territory — FOUNDATION-01A
 * Canonical Player State bridge.
 *
 * Purpose:
 * - Telegram identity -> server player
 * - safe first-login migration
 * - canonical state load/save
 * - client localStorage remains a cache
 * - economy is NEVER accepted from client state
 *
 * This block intentionally does NOT implement economy rewards yet.
 */
(function () {
  'use strict';

  if (window.TerritoryTelegramAuth?.foundation01a) return;

  const STORE_KEY = 'territory_store_v1';
  const SERVER_KEY = 'territory_server_url_v1';
  const SYNC_KEY = 'territory_auth_sync_v1';

  const tg = () => window.Telegram?.WebApp || null;

  function serverUrl() {
    return String(
      window.TERRITORY_SERVER_URL ||
      localStorage.getItem(SERVER_KEY) ||
      window.location.origin
    ).replace(/\/$/, '');
  }

  function localState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function meaningful(s) {
    if (!s) return false;
    return (
      Number(s.level || 1) > 1 ||
      Number(s.xp || 0) > 0 ||
      Number(s.coins || 0) > 0 ||
      Number(s.gems || 0) > 0 ||
      Number(s.redGems || 0) > 0 ||
      (Array.isArray(s.inventoryItems) && s.inventoryItems.length > 0) ||
      (Array.isArray(s.equipment) && s.equipment.some(Boolean))
    );
  }

  function safeState(s) {
    if (!s || typeof s !== 'object') return null;

    // Economy fields deliberately excluded.
    return {
      level: Math.max(1, Number(s.level) || 1),
      xp: Math.max(0, Number(s.xp) || 0),
      xpNext: Math.max(1, Number(s.xpNext) || 100),
      hp: Math.max(0, Number(s.hp) || 0),
      maxHp: Math.max(1, Number(s.maxHp) || 100),

      energy: Math.max(0, Number(s.energy) || 0),
      maxEnergy: Math.max(1, Number(s.maxEnergy) || 100),
      battleStones: Math.max(0, Number(s.battleStones) || 0),
      battleStonesBonus: Math.max(0, Number(s.battleStonesBonus) || 0),
      battleStonesDate: String(s.battleStonesDate || ''),
      battleStonesCap: Math.max(1, Number(s.battleStonesCap) || 30),

      equipment: Array.isArray(s.equipment) ? s.equipment.slice(0, 7) : [],
      inventoryItems: Array.isArray(s.inventoryItems) ? s.inventoryItems.slice(0, 100) : [],

      followers: s.followers || {},
      activeFollower: s.activeFollower || null,
      consumables: s.consumables || {},

      pve: s.pve || {},
      currentChapter: Math.max(1, Number(s.currentChapter) || 1),
      chapterStage: Math.max(1, Number(s.chapterStage) || 1),
      chapterProgress: Math.max(0, Math.min(100, Number(s.chapterProgress) || 0)),
      chapterBossUnlocked: !!s.chapterBossUnlocked,
      chapterBossDefeated: !!s.chapterBossDefeated,
      chapterCompleted: !!s.chapterCompleted,

      forge: s.forge || {},
      arena: s.arena || {},
      daily: s.daily || {},
      weekly: s.weekly || {},
      story: s.story || {},

      auto: !!s.auto,
      pos: Math.max(0, Number(s.pos) || 0),
      dice: Math.max(0, Number(s.dice) || 0)
    };
  }

  function apply(player, state) {
    const S = window.TerritoryStore?.state;
    if (!S) return;

    if (player) {
      S.profile = S.profile || {};
      S.profile.displayName = player.first_name || player.username || 'Игрок';
      S.profile.username = player.username || '';
      S.profile.telegramId = String(player.telegram_id || '');
      S.profile.photoUrl = player.photo_url || '';
      S.profile.vip = Math.max(0, Number(player.vip) || 0);

      S.level = Math.max(1, Number(player.level) || 1);
      S.xp = Math.max(0, Number(player.xp) || 0);
      S.xpNext = Math.max(1, Number(player.xp_next) || 100);
      S.hp = Math.max(0, Number(player.hp) || 0);
      S.maxHp = Math.max(1, Number(player.max_hp) || 100);

      // Server is authoritative for economy.
      S.coins = Math.max(0, Number(player.coins) || 0);
      S.gems = Math.max(0, Number(player.gems) || 0);
      S.redGems = Math.max(0, Number(player.red_gems) || 0);
    }

    if (state) {
      const economy = {
        coins: S.coins,
        gems: S.gems,
        redGems: S.redGems
      };

      Object.assign(S, state);

      S.coins = economy.coins;
      S.gems = economy.gems;
      S.redGems = economy.redGems;

      S.profile = S.profile || {};
      S.profile.level = S.level;
    }

    window.TerritoryStore?.saveNow?.('foundation-01a-load');
  }

  async function api(path, options) {
    const w = tg();

    const headers = Object.assign(
      {
        'content-type': 'application/json',
        'x-telegram-init-data': w?.initData || ''
      },
      options?.headers || {}
    );

    const response = await fetch(
      serverUrl() + path,
      Object.assign({}, options || {}, { headers })
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || ('HTTP ' + response.status));
    }

    return data;
  }

  let syncTimer = 0;
  let syncing = false;

  async function pushState(force) {
    if (window.TerritoryTelegramAuth.state !== 'authenticated' || syncing) return;

    const state = safeState(localState());
    if (!state) return;

    clearTimeout(syncTimer);

    if (!force) {
      syncTimer = setTimeout(() => pushState(true), 1200);
      return;
    }

    syncing = true;

    try {
      await api('/api/state', {
        method: 'POST',
        body: JSON.stringify({ state })
      });

      localStorage.setItem(SYNC_KEY, String(Date.now()));
      window.TerritoryTelegramAuth.lastSyncError = '';
    } catch (e) {
      window.TerritoryTelegramAuth.lastSyncError = e.message || String(e);
    } finally {
      syncing = false;
    }
  }

  async function authenticate() {
    const w = tg();

    if (!w || !w.initData) {
      window.TerritoryTelegramAuth.state = 'guest';
      return { ok: false, guest: true };
    }

    try {
      w.ready();
      w.expand?.();

      let auth = await api('/api/player');
      const local = localState();

      // First login: import local gameplay progress once.
      // The server decides whether migration is still open.
      if (
        meaningful(local) &&
        auth.player?.legacy_imported === false &&
        auth.player?.has_server_progress === false
      ) {
        await api('/api/migrate', {
          method: 'POST',
          body: JSON.stringify({
            state: safeState(local)
          })
        });

        auth = await api('/api/player');
      }

      apply(auth.player, auth.state || null);

      window.TerritoryTelegramAuth.state = 'authenticated';
      window.TerritoryTelegramAuth.player = auth.player;

      return auth;
    } catch (e) {
      window.TerritoryTelegramAuth.state = 'error';
      window.TerritoryTelegramAuth.error = e.message || String(e);
      return { ok: false, error: e };
    }
  }

  async function refresh() {
    if (window.TerritoryTelegramAuth.state !== 'authenticated') return null;
    const data = await api('/api/player');
    apply(data.player, data.state || null);
    return data;
  }

  window.TerritoryTelegramAuth = Object.assign(
    window.TerritoryTelegramAuth || {},
    {
      foundation01a: true,
      state: 'idle',
      player: null,
      error: null,
      lastSyncError: '',
      authenticate,
      refresh,
      pushState,
      setServerUrl(value) {
        localStorage.setItem(SERVER_KEY, String(value || ''));
      },
      getServerUrl: serverUrl
    }
  );

  window.addEventListener('territory:state-changed', () => pushState(false));

  function boot() {
    setTimeout(async () => {
      const result = await authenticate();
      if (result?.ok) {
        const script = document.createElement('script');
        script.src = 'territory-pve-authority-01c.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
