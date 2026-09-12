import { DurableObject } from "cloudflare:workers";

const ZONES = [0, 1, 2, 3];
const ZONE_NAMES = ["Голова", "Грудь", "Пояс", "Ноги"];
const REGEN_MS = 300000;
const MAX_ENERGY = 500;
const MAX_STATE_BYTES = 900000;

const DISTRICTS = [
  { id: "square", name: "Центральная площадь", level: 1, cost: 0, icon: "🏰" },
  { id: "forest", name: "Северный лес", level: 3, cost: 3, icon: "🌲" },
  { id: "harbor", name: "Порт Sdolars", level: 8, cost: 5, icon: "⚓" },
  { id: "industrial", name: "Промзона", level: 12, cost: 7, icon: "🏭" },
  { id: "fortress", name: "Старая крепость", level: 18, cost: 10, icon: "🏛️" }
];

const ENEMIES = [
  { id: "street", name: "Уличный боец", hp: 90, damage: 8, defense: 3, reward: 90, xp: 25 },
  { id: "merc", name: "Наёмник", hp: 125, damage: 11, defense: 6, reward: 130, xp: 35 },
  { id: "troll", name: "Ледяной тролль", hp: 170, damage: 14, defense: 9, reward: 200, xp: 50 },
  { id: "champion", name: "Чемпион арены", hp: 230, damage: 18, defense: 12, reward: 320, xp: 80 }
];

const CATALOG = {
  knife: { name: "Нож", type: "Оружие", icon: "🔪", damage: 6, defense: 0, price: 220 },
  heavyaxe: { name: "Тяжёлый топор", type: "Оружие", icon: "🪓", damage: 18, defense: 0, price: 700 },
  steel: { name: "Стальная броня", type: "Броня", icon: "🛡️", damage: 0, defense: 15, price: 650 },
  bandage: { name: "Аптечка", type: "Расходник", icon: "🩹", damage: 0, defense: 0, price: 80 }
};

const QUESTS = {
  forge: { name: "Поговори с кузнецом", rewardCoins: 150, rewardXp: 80 },
  scout: { name: "Разведка района", rewardCoins: 90, rewardXp: 40 }
};

const INITIAL_STATE = {
  playerName: "Игрок",
  coins: 1779,
  gems: 330,
  energy: 100,
  hp: 120,
  maxHp: 120,
  level: 3,
  exp: 120,
  maxExp: 150,
  strength: 12,
  agility: 9,
  freePoints: 0,
  wins: 0,
  losses: 0,
  battles: 0,
  rating: 1000,
  district: "square",
  forgeLevel: 0,
  guildId: "",
  guildName: "",
  guildMembers: 1,
  guildContrib: 0,
  materials: { iron: 5, wood: 5, leather: 3, herbs: 3 },
  items: [],
  battle: null,
  dailyClaimed: false,
  bonusClaimed: false,
  eventClaimed: false,
  achievementClaimed: false,
  seasonClaimed: false,
  missionClaimed: false,
  quest: { forge: false, scout: false },
  scoutCount: 0,
  lastEnergyAt: Date.now()
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Content-Type, X-Telegram-Init-Data, X-Guest-Id, X-Guest-Name"
    }
  });
}

function cleanId(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9_:@.-]/g, "").slice(0, 120);
}

function safeName(value) {
  return String(value ?? "Игрок").replace(/[<>]/g, "").trim().slice(0, 40) || "Игрок";
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function validMove(move) {
  const attack = Number(move?.attack);
  const defs = Array.isArray(move?.defs) ? move.defs.map(Number) : [];
  return (
    Number.isInteger(attack) &&
    ZONES.includes(attack) &&
    defs.length === 2 &&
    defs[0] !== defs[1] &&
    defs.every((zone) => Number.isInteger(zone) && ZONES.includes(zone))
  );
}

function equipmentStats(state) {
  let damage = 0;
  let defense = 0;
  for (const item of state.items || []) {
    if (!item.equipped) continue;
    damage += Number(item.damage || 0);
    defense += Number(item.defense || 0);
  }
  return { damage, defense };
}

function createState(name) {
  return {
    ...INITIAL_STATE,
    playerName: safeName(name),
    materials: { ...INITIAL_STATE.materials },
    items: [],
    quest: { forge: false, scout: false },
    lastEnergyAt: Date.now()
  };
}

function normalizeState(input, name) {
  const source = input && typeof input === "object" ? input : {};
  const state = createState(name || source.playerName || "Игрок");

  // Stored state is server-owned. These bounds only protect old/corrupt records.
  state.coins = Math.max(0, Math.min(10000000, Number(source.coins) || state.coins));
  state.gems = Math.max(0, Math.min(1000000, Number(source.gems) || state.gems));
  state.energy = Math.max(0, Math.min(MAX_ENERGY, Number(source.energy) || 0));
  state.maxHp = Math.max(100, Math.min(2000, Number(source.maxHp) || state.maxHp));
  state.hp = Math.max(1, Math.min(state.maxHp, Number(source.hp) || state.hp));
  state.level = Math.max(1, Math.min(100, Number(source.level) || state.level));
  state.exp = Math.max(0, Math.min(100000000, Number(source.exp) || 0));
  state.maxExp = Math.max(100, Math.min(100000000, Number(source.maxExp) || state.maxExp));
  state.strength = Math.max(1, Math.min(500, Number(source.strength) || state.strength));
  state.agility = Math.max(1, Math.min(100, Number(source.agility) || state.agility));
  state.freePoints = Math.max(0, Math.min(1000, Number(source.freePoints) || 0));
  state.wins = Math.max(0, Number(source.wins) || 0);
  state.losses = Math.max(0, Number(source.losses) || 0);
  state.battles = Math.max(0, Number(source.battles) || 0);
  state.rating = Math.max(0, Math.min(100000, Number(source.rating) || 1000));
  state.district = DISTRICTS.some((d) => d.id === source.district) ? source.district : "square";
  state.forgeLevel = Math.max(0, Math.min(30, Number(source.forgeLevel) || 0));
  state.guildId = cleanId(source.guildId || "");
  state.guildName = safeName(source.guildName || "");
  state.guildMembers = Math.max(1, Math.min(100, Number(source.guildMembers) || 1));
  state.guildContrib = Math.max(0, Number(source.guildContrib) || 0);

  for (const key of Object.keys(state.materials)) {
    state.materials[key] = Math.max(0, Math.min(100000, Number(source.materials?.[key]) || state.materials[key]));
  }

  state.items = Array.isArray(source.items)
    ? source.items.slice(0, 100).map((item) => ({
        id: cleanId(item.id || crypto.randomUUID()),
        name: safeName(item.name || "Предмет"),
        type: safeName(item.type || "Предмет"),
        icon: String(item.icon || "🎒").slice(0, 8),
        damage: Math.max(0, Math.min(500, Number(item.damage) || 0)),
        defense: Math.max(0, Math.min(500, Number(item.defense) || 0)),
        qty: Math.max(1, Math.min(999, Number(item.qty) || 1)),
        equipped: Boolean(item.equipped)
      }))
    : [];

  state.dailyClaimed = Boolean(source.dailyClaimed);
  state.bonusClaimed = Boolean(source.bonusClaimed);
  state.eventClaimed = Boolean(source.eventClaimed);
  state.achievementClaimed = Boolean(source.achievementClaimed);
  state.seasonClaimed = Boolean(source.seasonClaimed);
  state.missionClaimed = Boolean(source.missionClaimed);
  state.quest = {
    forge: Boolean(source.quest?.forge),
    scout: Boolean(source.quest?.scout)
  };
  state.scoutCount = Math.max(0, Number(source.scoutCount) || 0);
  state.battle = source.battle && typeof source.battle === "object" ? source.battle : null;
  state.lastEnergyAt = Number(source.lastEnergyAt) || Date.now();
  return state;
}

function publicState(state) {
  return {
    ...state,
    districts: DISTRICTS.map((district) => ({
      ...district,
      unlocked: state.level >= district.level
    })),
    catalog: Object.entries(CATALOG).map(([id, item]) => ({ id, ...item })),
    zoneNames: ZONE_NAMES
  };
}

async function authenticate(request, env) {
  const initData = request.headers.get("X-Telegram-Init-Data") || "";
  const botToken = env.TELEGRAM_BOT_TOKEN || "";

  if (!botToken) {
    return {
      playerId: cleanId(request.headers.get("X-Guest-Id") || "guest_default"),
      name: safeName(request.headers.get("X-Guest-Name") || "Игрок"),
      guest: true
    };
  }

  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDate = Number(params.get("auth_date") || 0);
  if (!hash || !authDate || Date.now() / 1000 - authDate > 86400) return null;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const encoder = new TextEncoder();

  const secretKey = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    encoder.encode(botToken)
  );

  const signingKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    signingKey,
    encoder.encode(dataCheckString)
  );

  const calculated = [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (calculated !== hash) return null;

  let user = {};
  try {
    user = JSON.parse(params.get("user") || "{}");
  } catch {
    return null;
  }

  if (!user.id) return null;

  return {
    playerId: `tg_${user.id}`,
    name: safeName([user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Игрок")
  };
}

export class GameHub extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  updateEnergy(state) {
    const now = Date.now();
    const last = Number(state.lastEnergyAt) || now;
    const elapsed = Math.max(0, now - last);
    const ticks = Math.floor(elapsed / REGEN_MS);

    if (ticks > 0) {
      state.energy = Math.min(MAX_ENERGY, Number(state.energy || 0) + ticks);
      state.lastEnergyAt = last + ticks * REGEN_MS;
    }

    return state;
  }

  async getState(pid, name) {
    const row = this.ctx.storage.sql
      .exec("SELECT state FROM players WHERE id = ?", pid)
      .one();

    let state;
    if (row?.state) {
      state = normalizeState(JSON.parse(row.state), name);
    } else {
      state = createState(name);
    }

    state = this.updateEnergy(state);
    state.playerName = safeName(name || state.playerName);
    await this.saveState(pid, state);
    return state;
  }

  async saveState(pid, state) {
    const serialized = JSON.stringify(state);
    if (serialized.length > MAX_STATE_BYTES) {
      throw new Error("state_too_large");
    }

    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO players(id, state, updated_at) VALUES (?, ?, ?)",
      pid,
      serialized,
      Date.now()
    );
  }

  levelUp(state) {
    while (state.exp >= state.maxExp && state.level < 100) {
      state.exp -= state.maxExp;
      state.level += 1;
      state.maxExp = Math.round(state.maxExp * 1.25);
      state.maxHp += 8;
      state.hp = state.maxHp;
      state.freePoints += 2;
    }
  }

  async action(pid, name, a) {
    let state = await this.getState(pid, name);

    // Required real-time energy tick: always before any action is processed.
    state = this.updateEnergy(state);

    const type = String(a?.type || "");

    if (type === "district.travel") {
      const district = DISTRICTS.find((item) => item.id === a.district);
      if (!district) return json({ ok: false, error: "unknown_district" }, 400);
      if (state.level < district.level) return json({ ok: false, error: "level_required" }, 400);

      const cost = Number(district.cost) || 0;

      // Required server-side energy guard.
      if ((state.energy || 0) < cost) {
        await this.saveState(pid, state);
        return json({ ok: false, error: "no_energy" }, 400);
      }

      state.energy -= cost;
      state.district = district.id;
      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state), player: publicState(state) });
    }

    if (type === "stat.add") {
      const stat = String(a.stat || "");
      if (!["strength", "agility"].includes(stat) || state.freePoints < 1) {
        return json({ ok: false, error: "invalid_stat" }, 400);
      }

      state[stat] += 1;
      state.freePoints -= 1;
      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "item.buy") {
      const catalogItem = CATALOG[String(a.item || "")];
      if (!catalogItem) return json({ ok: false, error: "item_not_found" }, 404);
      if (state.coins < catalogItem.price) return json({ ok: false, error: "not_enough_coins" }, 400);

      state.coins -= catalogItem.price;

      if (catalogItem.type === "Расходник") {
        const existing = state.items.find((item) => item.name === catalogItem.name && !item.equipped);
        if (existing) {
          existing.qty += 1;
        } else {
          state.items.push({
            id: crypto.randomUUID(),
            ...catalogItem,
            qty: 1,
            equipped: false
          });
        }
      } else {
        state.items.push({
          id: crypto.randomUUID(),
          ...catalogItem,
          qty: 1,
          equipped: false
        });
      }

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "item.equip" || type === "item.unequip") {
      const item = state.items.find((entry) => entry.id === String(a.id || ""));
      if (!item) return json({ ok: false, error: "item_not_found" }, 404);

      if (type === "item.equip" && ["Оружие", "Броня"].includes(item.type)) {
        for (const other of state.items) {
          if (other.type === item.type) other.equipped = false;
        }
      }

      item.equipped = type === "item.equip";
      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "item.use") {
      const item = state.items.find((entry) => entry.id === String(a.id || ""));
      if (!item || item.type !== "Расходник" || item.qty < 1) {
        return json({ ok: false, error: "item_not_usable" }, 400);
      }

      const healed = Math.min(35, state.maxHp - state.hp);
      state.hp += healed;
      item.qty -= 1;

      if (item.qty <= 0) {
        state.items = state.items.filter((entry) => entry.id !== item.id);
      }

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state), healed });
    }

    if (type === "daily.claim" || type === "bonus.claim") {
      if (state.dailyClaimed || state.bonusClaimed) {
        return json({ ok: false, error: "already_claimed" }, 409);
      }

      state.dailyClaimed = true;
      state.bonusClaimed = true;
      state.coins += 250;
      state.energy = Math.min(MAX_ENERGY, state.energy + 10);
      state.exp += 20;
      this.levelUp(state);

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { coins: 250, energy: 10, xp: 20 }
      });
    }

    if (type === "event.fight") {
      if (state.eventClaimed) return json({ ok: false, error: "already_claimed" }, 409);

      const cost = 3;
      if (state.energy < cost) return json({ ok: false, error: "no_energy" }, 400);

      state.energy -= cost;
      state.eventClaimed = true;

      const coins = 70 + randomInt(81);
      state.coins += coins;
      state.exp += 15;
      this.levelUp(state);

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state), reward: { coins, xp: 15 } });
    }

    if (type === "tavern.recruit") {
      const cost = 300;
      if (state.coins < cost) return json({ ok: false, error: "not_enough_coins" }, 400);

      state.coins -= cost;
      state.rating += 25;
      state.guildMembers = Math.min(100, state.guildMembers + 1);

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        recruit: { name: "Наёмник Sdolars", power: 12 }
      });
    }

    if (type === "craft") {
      const required = { iron: 2, wood: 2, leather: 1 };

      for (const key of Object.keys(required)) {
        if ((state.materials[key] || 0) < required[key]) {
          return json({ ok: false, error: "not_enough_materials" }, 400);
        }
      }

      for (const key of Object.keys(required)) {
        state.materials[key] -= required[key];
      }

      state.forgeLevel = Math.min(30, state.forgeLevel + 1);
      state.items.push({
        id: crypto.randomUUID(),
        name: "Кованый клинок",
        type: "Оружие",
        icon: "⚔️",
        damage: 12 + state.forgeLevel,
        defense: 0,
        qty: 1,
        equipped: false
      });

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "guild.contribute") {
      const amount = Math.floor(Number(a.amount) || 0);

      if (amount < 1 || amount > 1000 || state.coins < amount) {
        return json({ ok: false, error: "invalid_contribution" }, 400);
      }

      state.coins -= amount;
      state.guildContrib += amount;
      state.rating += Math.floor(amount / 20);

      if (!state.guildId) {
        state.guildId = "sdolars";
        state.guildName = "Sdolars";
      }

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "achievement.claim") {
      if (state.achievementClaimed || state.wins < 1) {
        return json({ ok: false, error: "achievement_locked" }, 400);
      }

      state.achievementClaimed = true;
      state.gems += 25;
      state.coins += 100;

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { gems: 25, coins: 100 }
      });
    }

    if (type === "resource.gather") {
      const cost = 2;
      if (state.energy < cost) return json({ ok: false, error: "no_energy" }, 400);

      state.energy -= cost;

      const reward = {
        iron: 1 + randomInt(2),
        wood: 1 + randomInt(2),
        leather: randomInt(2),
        herbs: randomInt(2)
      };

      for (const key of Object.keys(reward)) {
        state.materials[key] += reward[key];
      }

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state), reward });
    }

    if (type === "rest") {
      if (state.hp >= state.maxHp) return json({ ok: false, error: "full_hp" }, 400);

      const cost = 1;
      if (state.energy < cost) return json({ ok: false, error: "no_energy" }, 400);

      state.energy -= cost;
      const healed = Math.min(30, state.maxHp - state.hp);
      state.hp += healed;

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state), healed });
    }

    if (type === "season.claim") {
      if (state.seasonClaimed || state.level < 5) {
        return json({ ok: false, error: "season_locked" }, 400);
      }

      state.seasonClaimed = true;
      state.gems += 50;
      state.coins += 500;

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { gems: 50, coins: 500 }
      });
    }

    if (type === "mission.claim") {
      if (state.missionClaimed || state.wins < 3) {
        return json({ ok: false, error: "mission_locked" }, 400);
      }

      state.missionClaimed = true;
      state.coins += 300;
      state.exp += 120;
      this.levelUp(state);

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { coins: 300, xp: 120 }
      });
    }

    if (type === "quest.start") {
      const questId = String(a.quest || "");
      if (!QUESTS[questId]) return json({ ok: false, error: "unknown_quest" }, 400);

      return json({
        ok: true,
        state: publicState(state),
        quest: { id: questId, ...QUESTS[questId] }
      });
    }

    if (type === "quest.progress") {
      const questId = String(a.quest || "");

      if (questId === "forge") {
        state.quest.forge = true;
      } else if (questId === "scout") {
        state.quest.scout = true;
      } else {
        return json({ ok: false, error: "unknown_quest" }, 400);
      }

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    if (type === "quest.claim") {
      const questId = String(a.quest || "");
      const quest = QUESTS[questId];

      if (!quest) return json({ ok: false, error: "unknown_quest" }, 400);
      if (!state.quest[questId]) return json({ ok: false, error: "quest_not_complete" }, 400);

      state.quest[questId] = false;
      state.coins += quest.rewardCoins;
      state.exp += quest.rewardXp;
      this.levelUp(state);

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { coins: quest.rewardCoins, xp: quest.rewardXp }
      });
    }

    if (type === "scout") {
      const cost = 2;
      if (state.energy < cost) return json({ ok: false, error: "no_energy" }, 400);

      state.energy -= cost;
      state.scoutCount += 1;
      state.quest.scout = true;

      const reward = 25 + randomInt(51);
      state.coins += reward;
      state.exp += 10;
      this.levelUp(state);

      await this.saveState(pid, state);
      return json({
        ok: true,
        state: publicState(state),
        reward: { coins: reward, xp: 10 }
      });
    }

    if (type === "battle.start") {
      if (state.battle?.status === "active") {
        return json({ ok: false, error: "battle_active" }, 409);
      }

      const cost = 5;
      if (state.energy < cost) return json({ ok: false, error: "no_energy" }, 400);

      const enemy = ENEMIES[Math.min(ENEMIES.length - 1, Math.floor(state.wins / 3))];

      state.energy -= cost;
      state.battle = {
        id: crypto.randomUUID(),
        enemyId: enemy.id,
        enemyHp: enemy.hp,
        turn: 1,
        status: "active"
      };

      await this.saveState(pid, state);

      return json({
        ok: true,
        state: publicState(state),
        battle: {
          id: state.battle.id,
          enemy: {
            id: enemy.id,
            name: enemy.name,
            hp: enemy.hp,
            damage: enemy.damage
          },
          enemyHp: enemy.hp,
          playerHp: state.hp,
          turn: 1
        }
      });
    }

    if (type === "battle.turn") {
      if (!validMove(a)) return json({ ok: false, error: "invalid_move" }, 400);
      if (!state.battle || state.battle.status !== "active") {
        return json({ ok: false, error: "no_active_battle" }, 409);
      }

      const enemy = ENEMIES.find((item) => item.id === state.battle.enemyId);
      if (!enemy) return json({ ok: false, error: "enemy_not_found" }, 500);

      const attack = Number(a.attack);
      const defs = a.defs.map(Number);
      const enemyAttack = randomInt(4);
      const enemyDefs = [...ZONES].sort(() => Math.random() - 0.5).slice(0, 2);

      const stats = equipmentStats(state);
      const critChance = Math.min(0.5, state.strength / 120);
      const dodgeChance = Math.min(0.45, state.agility / 100);
      const crit = Math.random() < critChance;
      const dodge = Math.random() < dodgeChance;
      const hit = !enemyDefs.includes(attack);
      const blocked = defs.includes(enemyAttack);

      const rawPlayerDamage = Math.max(
        1,
        Math.round(7 + state.strength * 0.7 + stats.damage - enemy.defense * 0.35)
      );
      const playerDamage = hit ? rawPlayerDamage * (crit ? 2 : 1) : 0;

      const rawEnemyDamage = Math.max(
        1,
        Math.round(enemy.damage - stats.defense * 0.35)
      );
      const enemyDamage = blocked || dodge ? 0 : rawEnemyDamage;

      state.battle.enemyHp = Math.max(0, state.battle.enemyHp - playerDamage);
      state.hp = Math.max(0, state.hp - enemyDamage);
      state.battle.turn += 1;

      let result = "continue";
      if (state.battle.enemyHp <= 0) {
        state.battle.status = "won";
        result = "win";
      } else if (state.hp <= 0) {
        state.battle.status = "lost";
        result = "loss";
      }

      const round = {
        attack,
        defs,
        enemyAttack,
        enemyDefs,
        hit,
        crit,
        blocked,
        dodge,
        playerDamage,
        enemyDamage,
        playerHp: state.hp,
        enemyHp: state.battle.enemyHp,
        turn: state.battle.turn
      };

      await this.saveState(pid, state);

      return json({
        ok: true,
        state: publicState(state),
        result,
        round
      });
    }

    if (type === "battle.reward") {
      if (!state.battle || state.battle.status !== "won") {
        return json({ ok: false, error: "reward_locked" }, 400);
      }

      const enemy = ENEMIES.find((item) => item.id === state.battle.enemyId);
      if (!enemy) return json({ ok: false, error: "enemy_not_found" }, 500);

      state.coins += enemy.reward;
      state.exp += enemy.xp;
      state.wins += 1;
      state.battles += 1;
      state.hp = state.maxHp;
      state.battle = null;
      this.levelUp(state);

      await this.saveState(pid, state);

      return json({
        ok: true,
        state: publicState(state),
        reward: { coins: enemy.reward, xp: enemy.xp }
      });
    }

    if (type === "battle.loss") {
      if (!state.battle || state.battle.status !== "lost") {
        return json({ ok: false, error: "loss_locked" }, 400);
      }

      state.losses += 1;
      state.battles += 1;
      state.hp = Math.max(1, Math.round(state.maxHp * 0.35));
      state.battle = null;

      await this.saveState(pid, state);
      return json({ ok: true, state: publicState(state) });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return json({ ok: true });

    const auth = await authenticate(request, this.env);
    if (!auth) return json({ ok: false, error: "unauthorized" }, 401);

    if (url.pathname === "/api/state" && request.method === "POST") {
      const state = await this.getState(auth.playerId, auth.name);
      return json({ ok: true, state: publicState(state), player: publicState(state) });
    }

    if (url.pathname === "/api/action" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return this.action(auth.playerId, auth.name, body);
    }

    return json({ ok: false, error: "not_found" }, 404);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return json({ ok: true });

    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        build: "S89-FINAL-CLEAN",
        sqlite: true,
        zones: 4,
        energyRegenMs: REGEN_MS
      });
    }

    if (url.pathname.startsWith("/api/")) {
      const auth = await authenticate(request, env);
      if (!auth) return json({ ok: false, error: "unauthorized" }, 401);

      const objectId = env.GAME_HUB.idFromName(auth.playerId);
      return env.GAME_HUB.get(objectId).fetch(request);
    }

    if (url.pathname === "/ws") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      server.accept();
      server.send(JSON.stringify({
        type: "system",
        text: "Чат Territory подключён",
        time: new Date().toISOString()
      }));

      server.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== "chat") return;

          const text = String(message.text || "").trim().slice(0, 500);
          if (!text) return;

          server.send(JSON.stringify({
            type: "chat",
            name: safeName(message.name || "Игрок"),
            text,
            time: new Date().toISOString()
          }));
        } catch {
          // Ignore malformed chat packets.
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);

      if (url.pathname === "/" || url.pathname === "/index.html") {
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
        headers.set("Pragma", "no-cache");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }

      return response;
    }

    return new Response("Territory — Sdolars", { status: 404 });
  }
};
