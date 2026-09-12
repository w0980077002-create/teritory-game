import { DurableObject } from "cloudflare:workers";

const ZONES = [0, 1, 2, 3];
const ATTACK_ZONES = ZONES;
const MAX_NAME = 40;
const MAX_STATE_BYTES = 900_000;

const START = {
  coins: 1779, gems: 1330, energy: 100, hp: 120, maxHp: 120,
  level: 3, exp: 120, maxExp: 150, strength: 12, agility: 9,
  freePoints: 0, wins: 0, losses: 0, battles: 0
};

const DISTRICTS = [
  { id: "square", name: "Центральная площадь", level: 1, cost: 0, icon: "🏰" },
  { id: "forest", name: "Северный лес", level: 3, cost: 3, icon: "🌲" },
  { id: "harbor", name: "Порт Sdolars", level: 8, cost: 5, icon: "⚓" },
  { id: "industrial", name: "Промзона", level: 12, cost: 7, icon: "🏭" },
  { id: "fortress", name: "Старая крепость", level: 18, cost: 10, icon: "🏛️" }
];

const ENEMIES = [
  { name: "Уличный боец", hp: 90, damage: 8, def: 3, reward: 90, xp: 25 },
  { name: "Наёмник", hp: 125, damage: 11, def: 6, reward: 130, xp: 35 },
  { name: "Ледяной тролль", hp: 170, damage: 14, def: 9, reward: 200, xp: 50 },
  { name: "Арена чемпион", hp: 230, damage: 18, def: 12, reward: 320, xp: 80 }
];

const CATALOG = {
  knife: { name: "Нож", type: "Оружие", icon: "🔪", damage: 6, price: 220 },
  heavyaxe: { name: "Тяжёлый топор", type: "Оружие", icon: "🪓", damage: 18, price: 700 },
  steel: { name: "Стальная броня", type: "Броня", icon: "🛡️", defense: 15, price: 650 },
  bandage: { name: "Аптечка", type: "Расходник", icon: "🩹", qty: 1, price: 80 }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "Content-Type,Authorization,X-Telegram-Init-Data,X-Guest-Id,X-Guest-Name",
      "access-control-allow-methods": "GET,POST,OPTIONS"
    }
  });
}

function cleanId(v) {
  return String(v ?? "").replace(/[^a-zA-Z0-9_:@.-]/g, "").slice(0, 120);
}

function safeName(v) {
  return String(v ?? "Игрок").replace(/[<>]/g, "").slice(0, MAX_NAME) || "Игрок";
}

function validMove(move) {
  const attack = Number(move?.attack);
  const defs = Array.isArray(move?.defs) ? move.defs.map(Number) : [];
  return Number.isInteger(attack)
    && ATTACK_ZONES.includes(attack)
    && defs.length === 2
    && defs[0] !== defs[1]
    && defs.every((x) => Number.isInteger(x) && ZONES.includes(x));
}

async function hmacHex(keyBytes, data) {
  const key = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function telegramAuth(initData, botToken, maxAge = 86400) {
  if (!initData || !botToken) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  if (!hash) return null;

  const authDate = Number(p.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAge) return null;

  p.delete("hash");
  const dataCheck = [...p.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw", new TextEncoder().encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    ),
    new TextEncoder().encode(botToken)
  );

  if (await hmacHex(secret, dataCheck) !== hash) return null;

  let user;
  try { user = JSON.parse(p.get("user") || "{}"); } catch { return null; }
  if (!user?.id) return null;

  return {
    playerId: `tg_${user.id}`,
    name: safeName([user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Игрок"),
    telegramId: String(user.id),
    username: safeName(user.username || "")
  };
}

async function authRequest(request, env) {
  const initData =
    request.headers.get("X-Telegram-Init-Data") ||
    new URL(request.url).searchParams.get("initData");

  if (env.TELEGRAM_BOT_TOKEN) return telegramAuth(initData, env.TELEGRAM_BOT_TOKEN);

  const gid = cleanId(request.headers.get("X-Guest-Id") || "guest_default");
  return {
    playerId: gid || "guest_default",
    name: safeName(request.headers.get("X-Guest-Name") || "Игрок"),
    telegramId: null,
    username: "",
    guest: true
  };
}

function sanitize(seed, auth) {
  const s = seed && typeof seed === "object" ? seed : {};
  const items = Array.isArray(s.items) ? s.items.slice(0, 80).map((x) => ({
    id: String(x.id || ""),
    name: safeName(x.name || "Предмет"),
    type: safeName(x.type || "Предмет"),
    icon: String(x.icon || "🎒").slice(0, 8),
    damage: Math.max(0, Math.min(100, Number(x.damage) || 0)),
    defense: Math.max(0, Math.min(100, Number(x.defense) || 0)),
    qty: Math.max(1, Math.min(99, Number(x.qty) || 1)),
    equipped: !!x.equipped
  })) : [];

  return {
    ...START,
    playerName: auth.name,
    coins: Math.max(0, Math.min(5000, Number(s.coins) || START.coins)),
    gems: Math.max(0, Math.min(5000, Number(s.gems) || START.gems)),
    energy: Math.max(0, Math.min(500, Number(s.energy) || START.energy)),
    hp: Math.max(1, Math.min(Number(s.maxHp) || START.maxHp, Number(s.hp) || START.hp)),
    maxHp: Math.max(100, Math.min(500, Number(s.maxHp) || START.maxHp)),
    level: Math.max(1, Math.min(50, Number(s.level) || START.level)),
    exp: Math.max(0, Math.min(9999, Number(s.exp) || START.exp)),
    maxExp: Math.max(100, Math.min(9999, Number(s.maxExp) || START.maxExp)),
    strength: Math.max(1, Math.min(100, Number(s.strength) || START.strength)),
    agility: Math.max(1, Math.min(100, Number(s.agility) || START.agility)),
    freePoints: Math.max(0, Math.min(100, Number(s.freePoints) || 0)),
    wins: Math.max(0, Number(s.wins) || 0),
    losses: Math.max(0, Number(s.losses) || 0),
    battles: Math.max(0, Number(s.battles) || 0),
    items,
    lang: s.lang === "EN" ? "EN" : "RU",
    district: DISTRICTS.some((d) => d.id === s.district) ? s.district : "square",
    questDone: !!s.questDone,
    bonusClaimed: !!s.bonusClaimed,
    completedQuests: Array.isArray(s.completedQuests) ? s.completedQuests.slice(0, 50) : [],
    achievements: Array.isArray(s.achievements) ? s.achievements.slice(0, 50) : [],
    guildId: safeName(s.guildId || ""),
    guildName: safeName(s.guildName || ""),
    guildMembers: Math.max(1, Math.min(100, Number(s.guildMembers) || 1)),
    rating: Math.max(0, Math.min(5000, Number(s.rating) || 1000)),
    forgeLevel: Math.max(0, Math.min(20, Number(s.forgeLevel) || 0)),
    materials: { iron: 3, wood: 2, leather: 2, herbs: 2 },
    lastEnergyAt: Number(s.lastEnergyAt) || Date.now()
  };
}

export class GameHub extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
  }

  // One energy every 300000 ms, capped at 500.
  updateEnergy(state) {
    const now = Date.now();
    const last = Number(state.lastEnergyAt) || now;
    const elapsed = Math.max(0, now - last);
    const ticks = Math.floor(elapsed / 300000);

    if (ticks > 0) {
      state.energy = Math.min(500, Number(state.energy || 0) + ticks);
      state.lastEnergyAt = last + ticks * 300000;
    }
    return state;
  }

  async putState(pid, state) {
    state.lastEnergyAt = Number(state.lastEnergyAt) || Date.now();
    if (JSON.stringify(state).length > MAX_STATE_BYTES) throw new Error("state_too_large");
    await this.ctx.storage.put(`player:${pid}`, state);
    return state;
  }

  level(state) {
    while (state.exp >= state.maxExp && state.level < 50) {
      state.exp -= state.maxExp;
      state.level++;
      state.maxExp = Math.round(state.maxExp * 1.25);
      state.maxHp += 8;
      state.hp = state.maxHp;
      state.freePoints += 2;
    }
    return state;
  }

  async getState(pid, name, seed) {
    let state = await this.ctx.storage.get(`player:${pid}`);
    if (!state) state = sanitize(seed, { name });

    state = this.updateEnergy(state);
    state.playerName = name || state.playerName;
    await this.putState(pid, state);
    return state;
  }

  async action(pid, name, a) {
    let state = await this.ctx.storage.get(`player:${pid}`);
    if (!state) state = sanitize({}, { name });

    // IMPORTANT: tick energy before every action, not only getState().
    state = this.updateEnergy(state);
    state.playerName = name || state.playerName;

    const type = String(a?.type || "");

    if (type === "district.travel") {
      const district = DISTRICTS.find((d) => d.id === a.district);
      if (!district) return json({ ok: false, error: "unknown_district" }, 400);
      if (state.level < district.level) return json({ ok: false, error: "level_required" }, 400);

      const cost = Number(district.cost) || 0;

      // IMPORTANT: never permit negative energy.
      if ((state.energy || 0) < cost) {
        await this.putState(pid, state);
        return json({ ok: false, error: "no_energy" }, 400);
      }

      state.energy -= cost;
      state.district = district.id;
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "stat.add") {
      const stat = a.stat;
      if (!["strength", "agility"].includes(stat) || state.freePoints <= 0) {
        return json({ ok: false, error: "invalid_stat" }, 400);
      }
      state[stat]++;
      state.freePoints--;
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "bonus.claim") {
      if (state.bonusClaimed) return json({ ok: false, error: "already_claimed" }, 409);
      state.bonusClaimed = true;
      state.coins += 250;
      state.exp += 20;
      this.level(state);
      await this.putState(pid, state);
      return json({ ok: true, player: state, reward: { coins: 250, xp: 20 } });
    }

    if (type === "quest.complete") {
      if (state.questDone) return json({ ok: false, error: "already_claimed" }, 409);
      state.questDone = true;
      state.coins += 150;
      state.exp += 80;
      this.level(state);
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "item.buy") {
      const item = CATALOG[a.item];
      if (!item || state.coins < item.price) {
        return json({ ok: false, error: "not_enough_or_unknown" }, 400);
      }

      state.coins -= item.price;
      const old = (state.items || []).find((x) => x.name === item.name);

      if (old && item.qty) old.qty++;
      else {
        state.items = [
          ...(state.items || []),
          { id: `${a.item}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, ...item, equipped: false }
        ];
      }

      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "item.equip" || type === "item.unequip") {
      const item = (state.items || []).find((x) => x.id === String(a.id));
      if (!item) return json({ ok: false, error: "item_not_found" }, 404);
      item.equipped = type === "item.equip";
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "item.use") {
      const item = (state.items || []).find((x) => x.id === String(a.id));
      if (!item || item.type !== "Расходник" || item.qty < 1) {
        return json({ ok: false, error: "item_not_usable" }, 400);
      }
      state.hp = Math.min(state.maxHp, state.hp + 35);
      item.qty--;
      if (item.qty <= 0) state.items = state.items.filter((x) => x.id !== item.id);
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    if (type === "battle.start") {
      if (state.energy < 5) return json({ ok: false, error: "no_energy" }, 400);
      const enemy = ENEMIES[Math.min(ENEMIES.length - 1, Math.floor((state.wins || 0) / 3))];
      state.energy -= 5;
      await this.putState(pid, state);
      return json({
        ok: true,
        player: state,
        battle: { id: crypto.randomUUID(), turn: 1, enemy, enemyHp: enemy.hp, playerHp: state.hp }
      });
    }

    if (type === "battle.turn") {
      if (!validMove(a)) return json({ ok: false, error: "invalid_move" }, 400);

      const enemy = ENEMIES[Math.min(ENEMIES.length - 1, Math.floor((state.wins || 0) / 3))];
      const enemyAttack = Math.floor(Math.random() * 4);
      const enemyDefs = [...ZONES].sort(() => Math.random() - 0.5).slice(0, 2);

      const weaponDamage = (state.items || [])
        .filter((x) => x.equipped)
        .reduce((n, x) => n + Number(x.damage || 0), 0);

      const armor = (state.items || [])
        .filter((x) => x.equipped)
        .reduce((n, x) => n + Number(x.defense || 0), 0);

      const attack = Number(a.attack);
      const defs = a.defs.map(Number);
      const playerHitsEnemy = !enemyDefs.includes(attack);
      const playerDamage = playerHitsEnemy
        ? Math.max(1, Math.round(7 + state.strength * 0.7 + weaponDamage - enemy.def * 0.35))
        : 0;

      const blocked = defs.includes(enemyAttack);
      const dodge = Math.random() < Math.min(0.45, state.agility / 100);
      const enemyDamage = blocked || dodge ? 0 : Math.max(1, Math.round(enemy.damage - armor * 0.35));

      const enemyHp = Math.max(0, enemy.hp - playerDamage);
      const playerHp = Math.max(0, state.hp - enemyDamage);
      const result = enemyHp <= 0 ? "win" : playerHp <= 0 ? "loss" : "continue";

      return json({
        ok: true,
        battle: {
          turn: 2, enemyHp, playerHp, enemyAttack, enemyDefs,
          attack, defs, hit: playerHitsEnemy, dodge, blocked,
          playerDamage, enemyDamage, result
        }
      });
    }

    if (type === "battle.reward") {
      const enemy = ENEMIES[Math.min(ENEMIES.length - 1, Math.floor((state.wins || 0) / 3))];
      state.coins += enemy.reward;
      state.exp += enemy.xp;
      state.wins++;
      state.battles++;
      state.hp = state.maxHp;
      this.level(state);
      await this.putState(pid, state);
      return json({ ok: true, player: state, reward: { coins: enemy.reward, xp: enemy.xp } });
    }

    if (type === "battle.loss") {
      state.losses++;
      state.battles++;
      state.hp = Math.max(1, Math.round(state.maxHp * 0.35));
      await this.putState(pid, state);
      return json({ ok: true, player: state });
    }

    await this.putState(pid, state);
    return json({ ok: false, error: "unknown_action" }, 400);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") return this.chatWebSocket(request);

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405);
    }

    const auth = await authRequest(request, this.env);
    if (!auth) return json({ ok: false, error: "unauthorized" }, 401);

    const body = await request.json().catch(() => ({}));

    if (url.pathname === "/api/state") {
      return json({ ok: true, player: await this.getState(auth.playerId, auth.name, body.seed) });
    }

    if (url.pathname === "/api/action") {
      return this.action(auth.playerId, auth.name, body);
    }

    return json({ ok: false, error: "not_found" }, 404);
  }

  chatWebSocket() {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();
    server.send(JSON.stringify({
      type: "system",
      text: "Чат Sdolars подключён",
      time: new Date().toISOString()
    }));

    server.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type !== "chat" || !String(message.text || "").trim()) return;

        server.send(JSON.stringify({
          type: "chat",
          name: safeName(message.name || "Игрок"),
          text: String(message.text).slice(0, 500),
          time: new Date().toISOString()
        }));
      } catch {}
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return json({ ok: true });

    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, build: "s88-fixed", zones: 4, energyRegenMs: 300000 });
    }

    if (url.pathname.startsWith("/api/")) {
      const auth = await authRequest(request, env);
      if (!auth) return json({ ok: false, error: "unauthorized" }, 401);

      const id = env.GAME_HUB.idFromName(auth.playerId);
      return env.GAME_HUB.get(id).fetch(request);
    }

    if (url.pathname === "/ws") {
      const auth = await authRequest(request, env);
      if (!auth) return json({ ok: false, error: "unauthorized" }, 401);

      const id = env.GAME_HUB.idFromName(`chat:${auth.playerId}`);
      return env.GAME_HUB.get(id).fetch(request);
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Territory Sdolars", { status: 404 });
  }
};
