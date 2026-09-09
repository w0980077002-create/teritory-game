
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const DB_FILE = path.join(__dirname, "data", "players.json");
const sessions = new Map();
const sockets = new Map();

const ITEMS = {
  knife:   { id:"knife", name:"Ржавый нож", type:"weapon", stat:4, price:40, icon:"🔪", desc:"+4 атака" },
  sword:   { id:"sword", name:"Стальной меч", type:"weapon", stat:10, price:180, icon:"⚔️", desc:"+10 атака" },
  axe:     { id:"axe", name:"Тяжёлый топор", type:"weapon", stat:16, price:420, icon:"🪓", desc:"+16 атака" },
  jacket:  { id:"jacket", name:"Кожаная куртка", type:"armor", stat:4, price:50, icon:"🧥", desc:"+4 защита" },
  vest:    { id:"vest", name:"Бронежилет", type:"armor", stat:10, price:220, icon:"🦺", desc:"+10 защита" },
  armor:   { id:"armor", name:"Стальная броня", type:"armor", stat:18, price:520, icon:"🛡️", desc:"+18 защита" },
  medkit:  { id:"medkit", name:"Аптечка", type:"consumable", stat:35, price:45, icon:"🩹", desc:"+35 HP" },
  stim:    { id:"stim", name:"Стимулятор", type:"consumable", stat:70, price:120, icon:"💉", desc:"+70 HP" },
  bandage: { id:"bandage", name:"Бинт", type:"consumable", stat:15, price:20, icon:"🩸", desc:"+15 HP" }
};

const ENEMIES = {
  rat:    { id:"rat", name:"Гигантская крыса", hp:40, attack:6, defense:1, exp:25, coins:18, icon:"🐀" },
  bandit: { id:"bandit", name:"Бандит", hp:85, attack:12, defense:4, exp:60, coins:55, icon:"🥷" },
  boss:   { id:"boss", name:"Босс руин", hp:180, attack:20, defense:8, exp:160, coins:140, icon:"👹" }
};

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
}
let db = loadDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function newPlayer(tg) {
  const id = String(tg.id);
  const name = String(tg.username || [tg.first_name, tg.last_name].filter(Boolean).join(" ") || `Игрок${id.slice(-4)}`).slice(0,24);
  return {
    id, name,
    level:1, exp:0, nextExp:100,
    hp:100, maxHp:100,
    baseAttack:5, baseDefense:2,
    coins:250,
    inventory:[
      { itemId:"knife", qty:1 },
      { itemId:"jacket", qty:1 },
      { itemId:"bandage", qty:3 }
    ],
    equipment:{ weapon:"knife", armor:"jacket" },
    location:"Город",
    wins:0, losses:0, createdAt:Date.now(), lastSeen:Date.now()
  };
}

function publicPlayer(p) {
  return JSON.parse(JSON.stringify(p));
}

function stats(p) {
  let attack = p.baseAttack + p.level - 1;
  let defense = p.baseDefense + Math.floor((p.level - 1)/2);
  for (const slot of ["weapon","armor"]) {
    const id = p.equipment[slot];
    if (id && ITEMS[id]) {
      if (ITEMS[id].type === "weapon") attack += ITEMS[id].stat;
      if (ITEMS[id].type === "armor") defense += ITEMS[id].stat;
    }
  }
  return { attack, defense };
}

function addItem(p, itemId, qty=1) {
  let row = p.inventory.find(x => x.itemId === itemId);
  if (!row) { row = {itemId, qty:0}; p.inventory.push(row); }
  row.qty += qty;
}

function removeItem(p, itemId, qty=1) {
  const row = p.inventory.find(x => x.itemId === itemId);
  if (!row || row.qty < qty) return false;
  row.qty -= qty;
  p.inventory = p.inventory.filter(x => x.qty > 0);
  return true;
}

function levelUp(p) {
  const logs = [];
  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level++;
    p.nextExp = Math.floor(p.nextExp * 1.35);
    p.maxHp += 12;
    p.hp = p.maxHp;
    p.baseAttack += 2;
    p.baseDefense += 1;
    logs.push(`Уровень повышен до ${p.level}!`);
  }
  return logs;
}

function verifyTelegramInitData(initData) {
  if (!BOT_TOKEN) throw new Error("BOT_TOKEN_NOT_SET");
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("NO_HASH");
  params.delete("hash");
  const pairs = [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`);
  const dataCheckString = pairs.join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const calc = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) throw new Error("BAD_HASH");
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now()/1000 - authDate > 86400) throw new Error("EXPIRED");
  const user = JSON.parse(params.get("user") || "{}");
  if (!user.id) throw new Error("NO_USER");
  return user;
}

function createSession(playerId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { playerId, lastAction:0, battle:null });
  return token;
}

function getPlayer(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const s = sessions.get(token);
  if (!s) return null;
  const p = db[s.playerId];
  if (!p) return null;
  p.lastSeen = Date.now();
  return { p, s, token };
}

function actionAllowed(s, ms=350) {
  const now = Date.now();
  if (now - s.lastAction < ms) return false;
  s.lastAction = now;
  return true;
}

function responseFor(p, extra={}) {
  return { player: publicPlayer(p), stats: stats(p), online: sockets.size, ...extra };
}

app.use(express.json({limit:"32kb"}));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/auth", (req,res) => {
  try {
    const initData = String(req.body.initData || "");
    let tg;
    if (initData) tg = verifyTelegramInitData(initData);
    else if (!BOT_TOKEN && req.body.demo === true) {
      tg = { id:"demo", username:"demo", first_name:"Демо" };
    } else return res.status(401).json({error:"Открой игру внутри Telegram или включи DEMO без BOT_TOKEN."});

    const id = String(tg.id);
    if (!db[id]) db[id] = newPlayer(tg);
    else {
      db[id].name = String(tg.username || [tg.first_name,tg.last_name].filter(Boolean).join(" ") || db[id].name).slice(0,24);
      db[id].lastSeen = Date.now();
    }
    saveDB();
    const token = createSession(id);
    res.json(responseFor(db[id], { token, telegram:true }));
  } catch (e) {
    res.status(401).json({error:"Telegram авторизация не прошла: " + e.message});
  }
});

app.get("/api/state", (req,res) => {
  const auth = getPlayer(req);
  if (!auth) return res.status(401).json({error:"Сессия истекла"});
  res.json(responseFor(auth.p));
});

app.post("/api/action", (req,res) => {
  const auth = getPlayer(req);
  if (!auth) return res.status(401).json({error:"Сессия истекла"});
  if (!actionAllowed(auth.s)) return res.status(429).json({error:"Слишком быстро"});
  const { p, s } = auth;
  const { type, itemId, enemyId, location, result, amount } = req.body;
  let message = "";

  if (type === "equip") {
    const item = ITEMS[itemId];
    if (!item || !p.inventory.some(x=>x.itemId===itemId) || !["weapon","armor"].includes(item.type))
      return res.status(400).json({error:"Предмет нельзя надеть"});
    p.equipment[item.type] = itemId;
    message = `${item.icon} ${item.name} надет`;
  }
  else if (type === "unequip") {
    const item = ITEMS[itemId];
    if (!item) return res.status(400).json({error:"Нет предмета"});
    if (p.equipment[item.type] !== itemId) return res.status(400).json({error:"Предмет не надет"});
    p.equipment[item.type] = null;
    message = `${item.name} снят`;
  }
  else if (type === "drop") {
    if (p.equipment.weapon === itemId) p.equipment.weapon = null;
    if (p.equipment.armor === itemId) p.equipment.armor = null;
    if (!removeItem(p,itemId,1)) return res.status(400).json({error:"Предмет отсутствует"});
    message = "Предмет выброшен";
  }
  else if (type === "use") {
    const item = ITEMS[itemId];
    if (!item || item.type !== "consumable") return res.status(400).json({error:"Это нельзя использовать"});
    if (!removeItem(p,itemId,1)) return res.status(400).json({error:"Предмет отсутствует"});
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + item.stat);
    message = `${item.icon} +${p.hp-before} HP`;
  }
  else if (type === "buy") {
    const item = ITEMS[itemId];
    if (!item) return res.status(400).json({error:"Нет такого товара"});
    if (p.coins < item.price) return res.status(400).json({error:"Не хватает монет"});
    p.coins -= item.price; addItem(p,itemId,1);
    message = `${item.icon} Куплено: ${item.name}`;
  }
  else if (type === "travel") {
    const places = ["Город","Тёмный лес","Старый завод","Порт"];
    if (!places.includes(location)) return res.status(400).json({error:"Неизвестная локация"});
    p.location = location;
    message = `Вы прибыли: ${location}`;
  }
  else if (type === "heal") {
    const cost = 25;
    if (p.hp >= p.maxHp) return res.status(400).json({error:"HP уже полное"});
    if (p.coins < cost) return res.status(400).json({error:"Нужно 25 монет"});
    p.coins -= cost; p.hp = p.maxHp;
    message = "🏥 Здоровье полностью восстановлено";
  }
  else if (type === "battle_start") {
    const e = ENEMIES[enemyId];
    if (!e) return res.status(400).json({error:"Враг не найден"});
    if (p.hp <= 0) return res.status(400).json({error:"Персонаж без сознания"});
    if (s.battle) return res.status(400).json({error:"Бой уже идёт"});
    s.battle = { enemyId, hp:e.hp, maxHp:e.hp, turn:0 };
    message = `${e.icon} Вы вступили в бой с ${e.name}`;
  }
  else if (type === "battle_attack") {
    if (!s.battle) return res.status(400).json({error:"Нет боя"});
    const e = ENEMIES[s.battle.enemyId];
    const st = stats(p);
    const crit = Math.random() < Math.min(.35, .08 + p.level*.01);
    let damage = Math.max(1, st.attack - e.defense + Math.floor(Math.random()*5));
    if (crit) damage *= 2;
    s.battle.hp = Math.max(0, s.battle.hp - damage);
    s.battle.turn++;
    let enemyDamage = 0;
    let victory = false, defeat = false, rewards = {};
    if (s.battle.hp <= 0) {
      victory = true;
      p.wins++;
      p.exp += e.exp; p.coins += e.coins;
      rewards = { exp:e.exp, coins:e.coins };
      const logs = levelUp(p);
      message = `Победа! ${crit?"КРИТИЧЕСКИЙ удар! ":""}-${damage} HP врага. +${e.exp} XP, +${e.coins} монет.${logs.length?" "+logs.join(" "):""}`;
      s.battle = null;
    } else {
      enemyDamage = Math.max(1, e.attack - st.defense + Math.floor(Math.random()*4));
      p.hp = Math.max(0, p.hp - enemyDamage);
      if (p.hp <= 0) {
        defeat = true;
        p.losses++;
        p.hp = 1;
        message = `Поражение. Враг нанёс ${enemyDamage} урона.`;
        s.battle = null;
      } else {
        message = `${crit?"КРИТ! ":""}Вы нанесли ${damage}. Враг ответил ${enemyDamage}.`;
      }
    }
    saveDB();
    return res.json(responseFor(p,{message,battle:s.battle, combat:{damage,enemyDamage,crit,victory,defeat,rewards}}));
  }
  else if (type === "casino") {
    const bet = Math.max(1, Math.min(500, Number(amount)||0));
    if (p.coins < bet) return res.status(400).json({error:"Не хватает монет"});
    p.coins -= bet;
    if (result === "dice") {
      const roll = 1 + Math.floor(Math.random()*6);
      const won = roll >= 4;
      if (won) p.coins += bet*2;
      message = `🎲 Выпало ${roll}. ${won?"Победа! +"+bet:"Проигрыш -"+bet}`;
      saveDB();
      return res.json(responseFor(p,{message,casino:{roll,won,payout:won?bet*2:0}}));
    }
    if (result === "slots") {
      const syms=["🍒","🍋","🔔","⭐","💎","7️⃣"];
      const reels=[0,0,0].map(()=>syms[Math.floor(Math.random()*syms.length)]);
      let mult=0;
      if (reels[0]===reels[1] && reels[1]===reels[2]) mult = reels[0]==="7️⃣"?10:5;
      else if (reels[0]===reels[1] || reels[1]===reels[2] || reels[0]===reels[2]) mult=2;
      const payout=bet*mult;
      p.coins += payout;
      message = `🎰 ${reels.join(" ")} — ${mult?`Выигрыш x${mult}!`:"Мимо!"}`;
      saveDB();
      return res.json(responseFor(p,{message,casino:{reels,mult,payout}}));
    }
    p.coins += bet;
    return res.status(400).json({error:"Неизвестная игра"});
  }
  else return res.status(400).json({error:"Неизвестное действие"});

  saveDB();
  res.json(responseFor(p,{message,battle:s.battle}));
});

app.get("/api/shop", (req,res) => res.json(Object.values(ITEMS)));
app.get("/api/enemies", (req,res) => res.json(Object.values(ENEMIES)));

app.get("/api/players", (req,res) => {
  const list = Object.values(db).sort((a,b)=>b.level-a.level || b.wins-a.wins).slice(0,50)
    .map(p=>({id:p.id,name:p.name,level:p.level,wins:p.wins,location:p.location,online: sockets.has(p.id)}));
  res.json(list);
});

wss.on("connection", ws => {
  let playerId = null;
  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "auth") {
        const s = sessions.get(String(msg.token));
        if (!s) return;
        playerId = s.playerId;
        sockets.set(playerId, ws);
        ws.send(JSON.stringify({type:"system",text:"Вы подключены к онлайн-чату"}));
        broadcastOnline();
      }
      if (msg.type === "chat" && playerId) {
        const text = String(msg.text||"").trim().slice(0,240);
        if (!text) return;
        const p=db[playerId];
        broadcast({type:"chat",name:p.name,text,at:Date.now()});
      }
    } catch {}
  });
  ws.on("close",()=> {
    if (playerId && sockets.get(playerId)===ws) sockets.delete(playerId);
    broadcastOnline();
  });
});

function broadcast(obj) {
  const data=JSON.stringify(obj);
  for (const ws of wss.clients) if (ws.readyState===WebSocket.OPEN) ws.send(data);
}
function broadcastOnline() { broadcast({type:"online",count:sockets.size}); }

setInterval(()=> {
  for (const p of Object.values(db)) {
    if (Date.now()-p.lastSeen>60000) {}
  }
  saveDB();
},15000);

app.get("*", (req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

server.listen(PORT,()=>console.log(`TERITORY server: http://localhost:${PORT}`));
