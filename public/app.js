const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение базы данных SQLite
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    console.log('База данных Territory подключена.');
});

// Создание таблиц при запуске
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        tg_id INTEGER PRIMARY KEY,
        username TEXT,
        lvl INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 300,
        hp_max INTEGER DEFAULT 120,
        damage_bonus INTEGER DEFAULT 0
    )`);
});

// Список товаров для Магазина
const SHOP_ITEMS = [
    { id: 'brass_knuckles', name: 'Стальной кастет', price: 200, bonus: 5, icon: '👊' },
    { id: 'tactical_knife', name: 'Охотничий нож', price: 500, bonus: 12, icon: '🔪' },
    { id: 'baton', name: 'Дубинка', price: 1000, bonus: 25, icon: '🥖' }
];

// 1. Авторизация игрока
app.post('/api/auth', (req, res) => {
    const { tg_id, username } = req.body;
    if (!tg_id) return res.status(400).json({ error: 'No Telegram ID' });

    db.get(`SELECT * FROM users WHERE tg_id = ?`, [tg_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ user: row });
        } else {
            db.run(`INSERT INTO users (tg_id, username) VALUES (?, ?)`, [tg_id, username || 'Игрок'], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.get(`SELECT * FROM users WHERE tg_id = ?`, [tg_id], (err, newRow) => {
                    res.json({ user: newRow });
                });
            });
        }
    });
});

// 2. Расчет раунда боя (Атака + Блок)
app.post('/api/battle/turn', (req, res) => {
    const { tg_id, attackZone, defendZone, enemyHpCurrent, playerHpCurrent } = req.body;

    db.get(`SELECT * FROM users WHERE tg_id = ?`, [tg_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'Игрок не найден' });

        const zones = ['head', 'body', 'legs'];
        const enemyAttack = zones[Math.floor(Math.random() * 3)];
        const enemyDefend = zones[Math.floor(Math.random() * 3)];

        // Базовый урон + бонус от купленного оружия
        let pDamage = Math.floor(Math.random() * 11) + 10 + user.damage_bonus; 
        let eDamage = Math.floor(Math.random() * 9) + 8;

        let pSuccess = true;
        let eSuccess = true;

        // Проверка блока врага
        if (attackZone === enemyDefend) { pDamage = 0; pSuccess = false; }
        else if (attackZone === 'head') { pDamage = Math.floor(pDamage * 1.5); }

        // Проверка блока игрока
        if (enemyAttack === defendZone) { eDamage = 0; eSuccess = false; }
        else if (enemyAttack === 'head') { eDamage = Math.floor(eDamage * 1.5); }

        const nextEnemyHp = Math.max(0, enemyHpCurrent - pDamage);
        const nextPlayerHp = Math.max(0, playerHpCurrent - eDamage);

        let battleOver = false;
        let winner = null;
        let reward = 0;

        if (nextEnemyHp <= 0 && nextPlayerHp <= 0) { battleOver = true; winner = 'draw'; }
        else if (nextEnemyHp <= 0) {
            battleOver = true; winner = 'player';
            reward = Math.floor(Math.random() * 40) + 20;
            db.run(`UPDATE users SET coins = coins + ? WHERE tg_id = ?`, [reward, tg_id]);
        } else if (nextPlayerHp <= 0) { battleOver = true; winner = 'enemy'; }

        res.json({
            pSuccess, pDamage, eSuccess, eDamage,
            enemyAction: { attack: enemyAttack, defend: enemyDefend },
            nextEnemyHp, nextPlayerHp, battleOver, winner, reward
        });
    });
});

// 3. Получить товары рынка
app.get('/api/shop', (req, res) => res.json(SHOP_ITEMS));

// 4. Купить оружие
app.post('/api/shop/buy', (req, res) => {
    const { tg_id, item_id } = req.body;
    const item = SHOP_ITEMS.find(i => i.id === item_id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    db.get(`SELECT coins FROM users WHERE tg_id = ?`, [tg_id], (err, user) => {
        if (user.coins < item.price) return res.status(400).json({ error: 'Недостаточно монет!' });

        db.run(`UPDATE users SET coins = coins - ?, damage_bonus = damage_bonus + ? WHERE tg_id = ?`, 
            [item.price, item.bonus, tg_id], () => {
                res.json({ success: true, newCoins: user.coins - item.price, bonus: item.bonus, name: item.name });
            });
    });
});

app.listen(PORT, () => console.log(`Сервер работает на порту ${PORT}`));
    slot: "feet",
    defense: 2,
    agility: 2,
    dodge: 3,
    weight: 0.7,
    price: 220,
    description: "+2 защита, +2 ловкость, +3% уклонение"
  }

};


/* =========================================================
   ИГРОК
   ========================================================= */

const defaultPlayer = {

  hp: 120,
  maxHp: 120,

  coins: 1000,

  level: 1,
  exp: 0,
  maxExp: 100,

  strength: 5,
  agility: 5,

  freePoints: 0,

  combo: 0,

  inventory: [
    "fists"
  ],

  equipment: {
    head: null,
    body: null,
    hand: "fists",
    legs: null,
    feet: null
  }

};


/* =========================================================
   ВРАГ
   ========================================================= */

let enemy = {

  name: "Местный хулиган",

  hp: 100,
  maxHp: 100

};


/* =========================================================
   ЗАГРУЗКА СОХРАНЕНИЯ
   ========================================================= */

function loadPlayer() {

  let saved = null;

  try {

    saved = JSON.parse(
      localStorage.getItem(SAVE_KEY)
    );

  } catch (error) {

    saved = null;

  }


  const p = {
    ...defaultPlayer,
    ...(saved || {})
  };


  /* -----------------------------------------
     Миграция старого сохранения
     ----------------------------------------- */

  if (!Array.isArray(p.inventory)) {

    p.inventory = ["fists"];

  }


  if (!p.equipment || typeof p.equipment !== "object") {

    p.equipment = {
      head: null,
      body: null,
      hand: "fists",
      legs: null,
      feet: null
    };

  }


  /* Старое оружие */

  if (saved && saved.weapon) {

    if (
      saved.weapon === "Кастеты" &&
      !p.inventory.includes("brass")
    ) {

      p.inventory.push("brass");

      p.equipment.hand = "brass";

    }

    else if (
      saved.weapon === "Нож" &&
      !p.inventory.includes("knife")
    ) {

      p.inventory.push("knife");

      p.equipment.hand = "knife";

    }

  }


  if (!p.inventory.includes("fists")) {

    p.inventory.unshift("fists");

  }


  if (!ITEMS[p.equipment.hand]) {

    p.equipment.hand = "fists";

  }


  if (!p.inventory.includes(p.equipment.hand)) {

    p.inventory.push(p.equipment.hand);

  }


  p.hp = Number(p.hp) || 120;
  p.maxHp = Number(p.maxHp) || 120;

  p.coins = Number(p.coins) || 0;

  p.level = Number(p.level) || 1;
  p.exp = Number(p.exp) || 0;
  p.maxExp = Number(p.maxExp) || 100;

  p.strength = Number(p.strength) || 5;
  p.agility = Number(p.agility) || 5;
  p.freePoints = Number(p.freePoints) || 0;

  p.hp = Math.min(p.hp, p.maxHp);

  return p;

}


let player = loadPlayer();


/* =========================================================
   СОХРАНЕНИЕ
   ========================================================= */

function saveGame() {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(player)
    );

  } catch (error) {

    console.log("Ошибка сохранения", error);

  }

}


/* =========================================================
   ЭКИПИРОВАННЫЕ ПРЕДМЕТЫ
   ========================================================= */

function getEquippedItems() {

  const result = [];

  Object.values(player.equipment).forEach(id => {

    if (id && ITEMS[id]) {

      result.push(ITEMS[id]);

    }

  });

  return result;

}


/* =========================================================
   ХАРАКТЕРИСТИКИ
   ========================================================= */

function getStats() {

  let maxHp = player.maxHp;

  let damage = 10 + player.strength;

  let defense = 0;

  let strength = player.strength;

  let agility = player.agility;

  let crit = 5 + strength * 3;

  let dodge = agility * 3;


  getEquippedItems().forEach(item => {

    maxHp += item.maxHp || 0;

    damage += item.damage || 0;

    defense += item.defense || 0;

    strength += item.strength || 0;

    agility += item.agility || 0;

    crit += item.crit || 0;

    dodge += item.dodge || 0;

  });


  crit = Math.min(50, crit);

  dodge = Math.min(50, dodge);


  return {

    maxHp,
    damage,
    defense,
    strength,
    agility,
    crit,
    dodge

  };

}


/* =========================================================
   СИНХРОНИЗАЦИЯ СТАРЫХ ПОЛЕЙ
   ========================================================= */

function syncLegacyFields() {

  const weaponId = player.equipment.hand || "fists";

  const weapon = ITEMS[weaponId] || ITEMS.fists;

  player.weapon = weapon.name;

  player.bonusDamage = weapon.damage || 0;

}


/* =========================================================
   NOTICE
   ========================================================= */

let noticeTimer = null;

function showNotice(text) {

  const el = $("notice");

  if (!el) return;

  el.textContent = text;

  clearTimeout(noticeTimer);

  noticeTimer = setTimeout(() => {

    el.textContent = "";

  }, 2500);

}


/* =========================================================
   UI
   ========================================================= */

function updateUI() {

  syncLegacyFields();

  const stats = getStats();


  /* Монеты */

  if ($("coins")) {

    $("coins").textContent =
      Math.floor(player.coins);

  }


  /* Уровень */

  if ($("header-level")) {

    $("header-level").textContent =
      player.level;

  }

  if ($("header-level-copy")) {

    $("header-level-copy").textContent =
      player.level;

  }

  if ($("prof-level")) {

    $("prof-level").textContent =
      player.level;

  }


  /* HP */

  player.hp = Math.max(
    0,
    Math.min(player.hp, stats.maxHp)
  );


  if ($("hp-text-player")) {

    $("hp-text-player").textContent =
      `${Math.ceil(player.hp)} / ${stats.maxHp}`;

  }


  if ($("hp-fill-player")) {

    $("hp-fill-player").style.width =
      `${(player.hp / stats.maxHp) * 100}%`;

  }


  if ($("hp-text-enemy")) {

    $("hp-text-enemy").textContent =
      `${Math.ceil(enemy.hp)} / ${enemy.maxHp}`;

  }


  if ($("hp-fill-enemy")) {

    $("hp-fill-enemy").style.width =
      `${(enemy.hp / enemy.maxHp) * 100}%`;

  }


  /* XP */

  if ($("exp-text")) {

    $("exp-text").textContent =
      `${player.exp} / ${player.maxExp}`;

  }


  if ($("exp-fill")) {

    $("exp-fill").style.width =
      `${Math.min(100, player.exp / player.maxExp * 100)}%`;

  }


  /* Статы */

  setText("stat-hp", stats.maxHp);

  setText("stat-damage", stats.damage);

  setText("stat-defense", stats.defense);

  setText("stat-strength", stats.strength);

  setText("stat-agility", stats.agility);

  setText("stat-crit", `${stats.crit}%`);

  setText("stat-dodge", `${stats.dodge}%`);


  /* Свободные очки */

  setText(
    "prof-free",
    player.freePoints
  );


  /* Кнопки очков */

  if ($("add-str")) {

    $("add-str").disabled =
      player.freePoints <= 0;

  }


  if ($("add-agi")) {

    $("add-agi").disabled =
      player.freePoints <= 0;

  }


  renderEquipment();

  renderInventory();

  updateShopButtons();

  updateCharacter3D();

  saveGame();

}


function setText(id, value) {

  const el = $(id);

  if (el) {

    el.textContent = value;

  }

}


/* =========================================================
   ЭКИПИРОВКА
   ========================================================= */

const SLOT_IDS = {

  head: "equip-head",
  body: "equip-body",
  hand: "equip-hand",
  legs: "equip-legs",
  feet: "equip-feet"

};


function renderEquipment() {

  Object.keys(SLOT_IDS).forEach(slot => {

    const el = $(SLOT_IDS[slot]);

    if (!el) return;


    const itemId = player.equipment[slot];

    const item = itemId
      ? ITEMS[itemId]
      : null;


    const icon = el.querySelector(
      ".equip-slot-icon"
    );

    const name = el.querySelector(
      ".equip-slot-item"
    );


    if (item) {

      if (icon) {

        icon.textContent = item.icon;

      }

      if (name) {

        name.textContent = item.name;

      }

      el.classList.add("equipped");

    }

    else {

      const defaultIcons = {

        head: "🧢",
        body: "🧥",
        hand: "🥊",
        legs: "👖",
        feet: "👟"

      };


      if (icon) {

        icon.textContent =
          defaultIcons[slot];

      }

      if (name) {

        name.textContent = "Пусто";

      }

      el.classList.remove("equipped");

    }

  });

}


/* =========================================================
   НАДЕТЬ ПРЕДМЕТ
   ========================================================= */

function equipItem(itemId) {

  const item = ITEMS[itemId];

  if (!item) return;

  if (!player.inventory.includes(itemId)) {

    showNotice("Предмета нет в инвентаре");

    return;

  }


  const slot = item.slot;

  if (!slot) return;


  player.equipment[slot] = itemId;


  if (slot === "hand") {

    showNotice(`Оружие надето: ${item.name}`);

  } else {

    showNotice(`Надето: ${item.name}`);

  }


  updateUI();

}


/* =========================================================
   СНЯТЬ
   ========================================================= */

function unequipItem(itemId) {

  const item = ITEMS[itemId];

  if (!item) return;


  const slot = item.slot;

  if (!slot) return;


  if (player.equipment[slot] === itemId) {

    if (slot === "hand") {

      player.equipment[slot] = "fists";

    } else {

      player.equipment[slot] = null;

    }

  }


  showNotice(`Снято: ${item.name}`);

  updateUI();

}


/* =========================================================
   ВЫБРОСИТЬ
   ========================================================= */

function dropItem(itemId) {

  if (itemId === "fists") {

    showNotice("Кулаки нельзя выбросить");

    return;

  }


  const item = ITEMS[itemId];

  if (!item) return;


  if (
    player.equipment[item.slot] === itemId
  ) {

    if (item.slot === "hand") {

      player.equipment[item.slot] = "fists";

    } else {

      player.equipment[item.slot] = null;

    }

  }


  const index =
    player.inventory.indexOf(itemId);


  if (index !== -1) {

    player.inventory.splice(index, 1);

  }


  showNotice(`Выброшено: ${item.name}`);

  selectedItemId = null;

  updateUI();

}


/* =========================================================
   INVENTORY
   ========================================================= */

let selectedItemId = null;


function renderInventory() {

  const grid = $("inventory-grid");

  if (!grid) return;


  grid.innerHTML = "";


  player.inventory.forEach(itemId => {

    const item = ITEMS[itemId];

    if (!item) return;


    const isEquipped =
      player.equipment[item.slot] === itemId;


    const div =
      document.createElement("button");


    div.className =
      "inventory-item" +
      (isEquipped ? " equipped" : "") +
      (selectedItemId === itemId
        ? " selected"
        : "");


    div.innerHTML = `

      <span class="inventory-icon">
        ${item.icon}
      </span>

      <span class="inventory-name">
        ${item.name}
      </span>

      ${
        isEquipped
          ? `<span class="inventory-equipped">✓</span>`
          : ""
      }

    `;


    div.addEventListener(
      "click",
      () => selectItem(itemId)
    );


    grid.appendChild(div);

  });


  const weight =
    player.inventory.reduce(
      (sum, id) =>
        sum + (ITEMS[id]?.weight || 0),
      0
    );


  setText(
    "inventory-count",
    player.inventory.length
  );


  setText(
    "inventory-weight",
    `${weight.toFixed(1)} / 20`
  );


  updateSelectedItem();

}


/* =========================================================
   ВЫБОР ПРЕДМЕТА
   ========================================================= */

function selectItem(itemId) {

  selectedItemId = itemId;

  renderInventory();

}


/* =========================================================
   ОКНО ПРЕДМЕТА
   ========================================================= */

function updateSelectedItem() {

  const actions = $("item-actions");

  if (!actions) return;


  if (!selectedItemId) {

    actions.classList.add("hidden");

    return;

  }


  const item =
    ITEMS[selectedItemId];


  if (!item) {

    actions.classList.add("hidden");

    return;

  }


  actions.classList.remove("hidden");


  setText(
    "selected-item-name",
    item.name
  );


  setText(
    "selected-item-info",
    item.description
  );


  const icon =
    $("selected-item-icon");

  if (icon) {

    icon.textContent =
      item.icon;

  }


  const equipped =
    player.equipment[item.slot] === item.id;


  const equipBtn =
    $("equip-item");

  const unequipBtn =
    $("unequip-item");

  const dropBtn =
    $("drop-item");


  if (equipBtn) {

    equipBtn.disabled = equipped;

  }


  if (unequipBtn) {

    unequipBtn.disabled =
      !equipped ||
      item.id === "fists";

  }


  if (dropBtn) {

    dropBtn.disabled =
      item.id === "fists";

  }

}


/* =========================================================
   ПОКУПКА
   ========================================================= */

function buyItem(itemId) {

  const item =
    ITEMS[itemId];

  if (!item) return;


  if (player.inventory.includes(itemId)) {

    showNotice(
      `${item.name} уже есть в инвентаре`
    );

    return;

  }


  if (player.coins < item.price) {

    showNotice("Недостаточно монет");

    return;

  }


  player.coins -= item.price;

  player.inventory.push(itemId);


  showNotice(
    `Куплено: ${item.name}`
  );


  updateUI();

}


function updateShopButtons() {

  Object.keys(ITEMS).forEach(id => {

    const item = ITEMS[id];

    const button =
      $(`buy-${id}`);

    if (!button) return;


    if (
      player.inventory.includes(id)
    ) {

      button.classList.add("owned");

      button.textContent = "✓ Есть";

    }

    else {

      button.classList.remove("owned");

      button.textContent =
        `🪙 ${item.price}`;

    }

  });

}


/* =========================================================
   ОЧКИ ХАРАКТЕРИСТИК
   ========================================================= */

function addStrength() {

  if (player.freePoints <= 0) return;


  player.freePoints--;

  player.strength++;


  showNotice(
    "Сила увеличена"
  );


  updateUI();

}


function addAgility() {

  if (player.freePoints <= 0) return;


  player.freePoints--;

  player.agility++;


  showNotice(
    "Ловкость увеличена"
  );


  updateUI();

}


/* =========================================================
   LEVEL UP
   ========================================================= */

function addExperience(amount) {

  player.exp += amount;


  while (
    player.exp >= player.maxExp
  ) {

    player.exp -= player.maxExp;

    player.level++;

    player.maxExp =
      Math.floor(
        player.maxExp * 1.4
      );


    player.freePoints += 3;

    player.maxHp += 20;

    player.hp =
      getStats().maxHp;


    showNotice(
      `🎉 Новый уровень: ${player.level}! +3 очка`
    );

  }

}


/* =========================================================
   БОЙ
   ========================================================= */

let selectedAttack = "body";

let selectedBlock = "body";

let battleLocked = false;


const attackMultipliers = {

  head: 1.35,

  body: 1,

  legs: 0.85

};


const zoneNames = {

  head: "голову",

  body: "тело",

  legs: "ноги"

};


function addLog(text) {

  const log =
    $("combat-log-text");

  if (!log) return;


  const line =
    document.createElement("div");

  line.textContent = text;


  log.prepend(line);


  while (
    log.children.length > 12
  ) {

    log.removeChild(
      log.lastChild
    );

  }

}


/* =========================================================
   ИГРОК АТАКУЕТ
   ========================================================= */

function playerAttack() {

  if (battleLocked) return;

  if (enemy.hp <= 0) return;


  battleLocked = true;


  const stats =
    getStats();


  let damage =
    stats.damage *
    attackMultipliers[selectedAttack];


  let critical = false;


  if (
    Math.random() * 100 <
    stats.crit
  ) {

    critical = true;

    damage *= 2;

  }


  /* Комбо */

  if (player.combo > 0) {

    damage *=
      1 + Math.min(
        0.5,
        player.combo * 0.05
      );

  }


  damage =
    Math.max(
      1,
      Math.round(damage)
    );


  enemy.hp -= damage;


  if (enemy.hp < 0) {

    enemy.hp = 0;

  }


  if (critical) {

    addLog(
      `💥 КРИТ! Ты ударил в ${zoneNames[selectedAttack]} на ${damage} урона!`
    );

  }

  else {

    addLog(
      `👊 Ты ударил в ${zoneNames[selectedAttack]} на ${damage} урона.`
    );

  }


  player.combo++;


  updateUI();


  if (enemy.hp <= 0) {

    winBattle();

    battleLocked = false;

    return;

  }


  setTimeout(
    enemyAttack,
    550
  );

}


/* =========================================================
   АТАКА ВРАГА
   ========================================================= */

function enemyAttack() {

  if (enemy.hp <= 0) {

    battleLocked = false;

    return;

  }


  const stats =
    getStats();


  const zones = [
    "head",
    "body",
    "legs"
  ];


  const zone =
    zones[
      Math.floor(
        Math.random() *
        zones.length
      )
    ];


  let damage =
    8 +
    Math.floor(
      Math.random() * 7
    );


  /* Уклонение */

  if (
    Math.random() * 100 <
    stats.dodge
  ) {

    addLog(
      `💨 Ты уклонился от удара в ${zoneNames[zone]}!`
    );


    player.combo = 0;

    battleLocked = false;

    updateUI();

    return;

  }


  /* Блок */

  if (zone === selectedBlock) {

    damage *= 0.25;

    damage =
      Math.max(
        1,
        Math.round(damage)
      );


    addLog(
      `🛡️ Блок! Ты получил всего ${damage} урона.`
    );

  }

  else {

    damage =
      Math.max(
        1,
        Math.round(
          damage -
          stats.defense * 0.5
        )
      );


    addLog(
      `💢 Враг ударил в ${zoneNames[zone]} на ${damage} урона.`
    );

  }


  player.hp -= damage;


  if (player.hp < 0) {

    player.hp = 0;

  }


  player.combo = 0;


  updateUI();


  if (player.hp <= 0) {

    loseBattle();

    return;

  }


  battleLocked = false;

}


/* =========================================================
   ПОБЕДА
   ========================================================= */

function winBattle() {

  const coinsReward =
    200 +
    player.level * 20;

  const expReward =
    40;


  player.coins +=
    coinsReward;


  addExperience(
    expReward
  );


  const stats =
    getStats();


  player.hp = Math.min(
    stats.maxHp,
    player.hp +
      Math.floor(stats.maxHp * 0.2)
  );


  addLog(
    `🏆 ПОБЕДА! +${coinsReward} монет`
  );


  addLog(
    `⭐ +${expReward} опыта`
  );


  showNotice(
    `🏆 Победа! +${coinsReward} 🪙`
  );


  setTimeout(
    resetEnemy,
    800
  );


  updateUI();

}


/* =========================================================
   ПОРАЖЕНИЕ
   ========================================================= */

function loseBattle() {

  addLog(
    "💀 Ты проиграл этот бой."
  );


  showNotice(
    "💀 Поражение. Восстанавливаем HP."
  );


  setTimeout(() => {

    const stats =
      getStats();

    player.hp =
      Math.floor(
        stats.maxHp * 0.5
      );


    resetEnemy();

    updateUI();

  }, 1000);

}


/* =========================================================
   НОВЫЙ ВРАГ
   ========================================================= */

function resetEnemy() {

  enemy.hp =
    enemy.maxHp;

  battleLocked = false;

  updateUI();

}


/* =========================================================
   3D ARENA
   ========================================================= */

let arenaScene;

let arenaCamera;

let arenaRenderer;

let playerFighter;

let enemyFighter;

let arenaClock =
  new THREE.Clock();


function createMaterial(
  color,
  roughness = 0.75
) {

  return new THREE.MeshStandardMaterial({

    color,

    roughness,

    metalness: 0.05

  });

}


function createFighter(
  playerSide = true
) {

  const group =
    new THREE.Group();


  /* Цвета */

  const skin =
    createMaterial(0xc78f6d);

  const shirt =
    createMaterial(
      playerSide
        ? 0x315fbd
        : 0x9d3038
    );

  const pants =
    createMaterial(0x252a31);

  const shoes =
    createMaterial(0x15181d);


  /* Голова */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.48,
        18,
        14
      ),
      skin
    );

  head.position.y =
    2.75;

  head.name = "head";

  group.add(head);


  /* Тело */

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.95,
        1.25,
        0.55
      ),
      shirt
    );

  body.position.y =
    1.75;

  body.name = "body";

  group.add(body);


  /* Руки */

  const armGeometry =
    new THREE.CapsuleGeometry(
      0.13,
      0.65,
      5,
      10
    );


  const armL =
    new THREE.Mesh(
      armGeometry,
      skin
    );

  armL.position.set(
    -0.7,
    1.75,
    0
  );

  armL.rotation.z =
    -0.15;

  armL.name =
    "armL";

  group.add(armL);


  const armR =
    new THREE.Mesh(
      armGeometry,
      skin
    );

  armR.position.set(
    0.7,
    1.75,
    0
  );

  armR.rotation.z =
    0.15;

  armR.name =
    "armR";

  group.add(armR);


  /* Ноги */

  const legGeometry =
    new THREE.CapsuleGeometry(
      0.16,
      0.75,
      5,
      10
    );


  const legL =
    new THREE.Mesh(
      legGeometry,
      pants
    );

  legL.position.set(
    -0.27,
    0.72,
    0
  );

  legL.name =
    "legL";

  group.add(legL);


  const legR =
    new THREE.Mesh(
      legGeometry,
      pants
    );

  legR.position.set(
    0.27,
    0.72,
    0
  );

  legR.name =
    "legR";

  group.add(legR);


  /* Обувь */

  const shoeGeometry =
    new THREE.BoxGeometry(
      0.36,
      0.18,
      0.65
    );


  const shoeL =
    new THREE.Mesh(
      shoeGeometry,
      shoes
    );

  shoeL.position.set(
    -0.27,
    0.18,
    0.12
  );

  shoeL.name =
    "shoeL";

  group.add(shoeL);


  const shoeR =
    new THREE.Mesh(
      shoeGeometry,
      shoes
    );

  shoeR.position.set(
    0.27,
    0.18,
    0.12
  );

  shoeR.name =
    "shoeR";

  group.add(shoeR);


  return group;

}


/* =========================================================
   ИНИЦИАЛИЗАЦИЯ АРЕНЫ
   ========================================================= */

function initArena3D() {

  const container =
    $("battle-3d");

  if (!container) return;


  arenaScene =
    new THREE.Scene();


  arenaScene.background =
    new THREE.Color(
      0x0b0e12
    );


  arenaCamera =
    new THREE.PerspectiveCamera(
      40,
      container.clientWidth /
      container.clientHeight,
      0.1,
      100
    );


  arenaCamera.position.set(
    0,
    2.1,
    7
  );


  arenaCamera.lookAt(
    0,
    1.5,
    0
  );


  arenaRenderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });


  arenaRenderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );


  arenaRenderer.setSize(
    container.clientWidth,
    container.clientHeight
  );


  container.innerHTML = "";

  container.appendChild(
    arenaRenderer.domElement
  );


  /* Свет */

  const ambient =
    new THREE.AmbientLight(
      0xffffff,
      1.7
    );

  arenaScene.add(
    ambient
  );


  const light =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  light.position.set(
    3,
    6,
    5
  );

  arenaScene.add(
    light
  );


  /* Пол */

  const floor =
    new THREE.Mesh(

      new THREE.CircleGeometry(
        4.5,
        64
      ),

      createMaterial(
        0x1a1f27
      )

    );


  floor.rotation.x =
    -Math.PI / 2;

  floor.position.y =
    0;

  arenaScene.add(
    floor
  );


  /* Кольцо */

  const ring =
    new THREE.Mesh(

      new THREE.RingGeometry(
        2.2,
        2.3,
        64
      ),

      new THREE.MeshBasicMaterial({
        color: 0x39414e,
        side: THREE.DoubleSide
      })

    );


  ring.rotation.x =
    -Math.PI / 2;

  ring.position.y =
    0.01;

  arenaScene.add(
    ring
  );


  /* Бойцы */

  playerFighter =
    createFighter(true);

  enemyFighter =
    createFighter(false);


  playerFighter.position.x =
    -1.35;


  enemyFighter.position.x =
    1.35;


  enemyFighter.rotation.y =
    Math.PI;


  arenaScene.add(
    playerFighter
  );

  arenaScene.add(
    enemyFighter
  );


  animateArena();

}


/* =========================================================
   ANIMATE ARENA
   ========================================================= */

function animateArena() {

  requestAnimationFrame(
    animateArena
  );


  if (!arenaRenderer) return;


  const time =
    arenaClock.getElapsedTime();


  if (playerFighter) {

    playerFighter.position.y =
      Math.sin(time * 2) *
      0.025;

  }


  if (enemyFighter) {

    enemyFighter.position.y =
      Math.sin(time * 2 + 1) *
      0.025;

  }


  arenaRenderer.render(
    arenaScene,
    arenaCamera
  );

}


/* =========================================================
   RESIZE ARENA
   ========================================================= */

function resizeArena() {

  const container =
    $("battle-3d");

  if (
    !container ||
    !arenaRenderer ||
    !arenaCamera
  ) return;


  const width =
    container.clientWidth;

  const height =
    container.clientHeight;


  arenaCamera.aspect =
    width / height;

  arenaCamera.updateProjectionMatrix();


  arenaRenderer.setSize(
    width,
    height
  );

}


/* =========================================================
   3D ПЕРСОНАЖ
   ========================================================= */

let characterScene;

let characterCamera;

let characterRenderer;

let characterFighter;

let characterGear;

let characterClock =
  new THREE.Clock();


function initCharacter3D() {

  const container =
    $("character-3d");

  if (!container) return;


  characterScene =
    new THREE.Scene();


  characterScene.background =
    new THREE.Color(
      0x10151c
    );


  characterCamera =
    new THREE.PerspectiveCamera(
      35,
      container.clientWidth /
      container.clientHeight,
      0.1,
      100
    );


  characterCamera.position.set(
    0,
    2.2,
    7
  );


  characterCamera.lookAt(
    0,
    1.55,
    0
  );


  characterRenderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });


  characterRenderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );


  characterRenderer.setSize(
    container.clientWidth,
    container.clientHeight
  );


  container.innerHTML = "";

  container.appendChild(
    characterRenderer.domElement
  );


  const ambient =
    new THREE.AmbientLight(
      0xffffff,
      1.8
    );

  characterScene.add(
    ambient
  );


  const light =
    new THREE.DirectionalLight(
      0xffffff,
      2.2
    );

  light.position.set(
    3,
    6,
    5
  );

  characterScene.add(
    light
  );


  const floor =
    new THREE.Mesh(

      new THREE.CircleGeometry(
        3.5,
        64
      ),

      createMaterial(
        0x1b212a
      )

    );


  floor.rotation.x =
    -Math.PI / 2;

  characterScene.add(
    floor
  );


  characterFighter =
    createFighter(true);


  characterFighter.position.y =
    0;


  characterScene.add(
    characterFighter
  );


  characterGear =
    new THREE.Group();


  characterFighter.add(
    characterGear
  );


  updateCharacter3D();


  animateCharacter();

}


/* =========================================================
   3D ЭКИПИРОВКА
   ========================================================= */

function updateCharacter3D() {

  if (
    !characterFighter ||
    !characterGear
  ) return;


  /* Удаляем старые предметы */

  while (
    characterGear.children.length
  ) {

    characterGear.remove(
      characterGear.children[0]
    );

  }


  const head =
    characterFighter.getObjectByName(
      "head"
    );

  const body =
    characterFighter.getObjectByName(
      "body"
    );

  const legL =
    characterFighter.getObjectByName(
      "legL"
    );

  const legR =
    characterFighter.getObjectByName(
      "legR"
    );

  const shoeL =
    characterFighter.getObjectByName(
      "shoeL"
    );

  const shoeR =
    characterFighter.getObjectByName(
      "shoeR"
    );


  /* -----------------------------------------
     КЕПКА
     ----------------------------------------- */

  if (
    player.equipment.head === "cap" &&
    head
  ) {

    const cap =
      new THREE.Mesh(

        new THREE.CylinderGeometry(
          0.5,
          0.55,
          0.18,
          24
        ),

        createMaterial(
          0x25395e
        )

      );


    cap.position.set(
      head.position.x,
      head.position.y + 0.42,
      head.position.z
    );


    characterGear.add(
      cap
    );


    const visor =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.42,
          0.06,
          0.28
        ),

        createMaterial(
          0x1b2942
        )

      );


    visor.position.set(
      0,
      head.position.y + 0.32,
      0.3
    );


    characterGear.add(
      visor
    );

  }


  /* -----------------------------------------
     ХУДИ
     ----------------------------------------- */

  if (
    player.equipment.body === "hoodie" &&
    body
  ) {

    const hoodie =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          1.08,
          1.34,
          0.66
        ),

        createMaterial(
          0x394352
        )

      );


    hoodie.position.copy(
      body.position
    );


    characterGear.add(
      hoodie
    );


    const hood =
      new THREE.Mesh(

        new THREE.TorusGeometry(
          0.31,
          0.09,
          8,
          20
        ),

        createMaterial(
          0x303846
        )

      );


    hood.position.set(
      body.position.x,
      body.position.y + 0.63,
      body.position.z
    );


    hood.rotation.x =
      Math.PI / 2;


    characterGear.add(
      hood
    );

  }


  /* -----------------------------------------
     ШТАНЫ
     ----------------------------------------- */

  if (
    player.equipment.legs === "pants"
  ) {

    [legL, legR].forEach(
      leg => {

        if (!leg) return;


        const pants =
          new THREE.Mesh(

            new THREE.CylinderGeometry(
              0.21,
              0.18,
              0.95,
              10
            ),

            createMaterial(
              0x34404b
            )

          );


        pants.position.copy(
          leg.position
        );


        characterGear.add(
          pants
        );

      }
    );

  }


  /* -----------------------------------------
     КРОССОВКИ
     ----------------------------------------- */

  if (
    player.equipment.feet === "shoes"
  ) {

    [shoeL, shoeR].forEach(
      shoe => {

        if (!shoe) return;


        const sneaker =
          new THREE.Mesh(

            new THREE.BoxGeometry(
              0.4,
              0.2,
              0.72
            ),

            createMaterial(
              0x5b6674
            )

          );


        sneaker.position.copy(
          shoe.position
        );


        characterGear.add(
          sneaker
        );

      }
    );

  }


  /* -----------------------------------------
     ОРУЖИЕ
     ----------------------------------------- */

  const weaponId =
    player.equipment.hand;


  const arm =
    characterFighter.getObjectByName(
      "armR"
    );


  if (
    weaponId === "brass" &&
    arm
  ) {

    const knuckle =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.38,
          0.15,
          0.2
        ),

        createMaterial(
          0xb4bbc4
        )

      );


    knuckle.position.set(
      arm.position.x + 0.05,
      arm.position.y - 0.35,
      0.02
    );


    characterGear.add(
      knuckle
    );

  }


  if (
    weaponId === "knife" &&
    arm
  ) {

    const handle =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.08,
          0.32,
          0.08
        ),

        createMaterial(
          0x3b2a20
        )

      );


    handle.position.set(
      arm.position.x + 0.05,
      arm.position.y - 0.38,
      0
    );


    characterGear.add(
      handle
    );


    const blade =
      new THREE.Mesh(

        new THREE.ConeGeometry(
          0.09,
          0.45,
          4
        ),

        createMaterial(
          0xb9c1ca
        )

      );


    blade.rotation.z =
      Math.PI;


    blade.position.set(
      arm.position.x + 0.05,
      arm.position.y - 0.68,
      0
    );


    characterGear.add(
      blade
    );

  }

}


/* =========================================================
   ANIMATE CHARACTER
   ========================================================= */

function animateCharacter() {

  requestAnimationFrame(
    animateCharacter
  );


  if (!characterRenderer) return;


  const time =
    characterClock.getElapsedTime();


  if (characterFighter) {

    characterFighter.rotation.y =
      Math.sin(time * 0.55) *
      0.25;

  }


  characterRenderer.render(
    characterScene,
    characterCamera
  );

}


/* =========================================================
   RESIZE CHARACTER
   ========================================================= */

function resizeCharacter() {

  const container =
    $("character-3d");

  if (
    !container ||
    !characterRenderer ||
    !characterCamera
  ) return;


  const width =
    container.clientWidth;

  const height =
    container.clientHeight;


  characterCamera.aspect =
    width / height;

  characterCamera.updateProjectionMatrix();


  characterRenderer.setSize(
    width,
    height
  );

}


/* =========================================================
   НАВИГАЦИЯ
   ========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;


          document
            .querySelectorAll(".nav-btn")
            .forEach(btn => {

              btn.classList.remove(
                "active"
              );

            });


          button.classList.add(
            "active"
          );


          document
            .querySelectorAll(".game-page")
            .forEach(section => {

              section.classList.remove(
                "active"
              );

            });


          const target =
            $(`page-${page}`);


          if (target) {

            target.classList.add(
              "active"
            );

          }


          if (page === "profile") {

            setTimeout(() => {

              resizeCharacter();

              updateCharacter3D();

            }, 50);

          }


          if (page === "arena") {

            setTimeout(() => {

              resizeArena();

            }, 50);

          }

        }
      );

    });

}


/* =========================================================
   ЗОНЫ АТАКИ
   ========================================================= */

function setupBattleControls() {

  const attackButtons = {

    "btn-att-head": "head",

    "btn-att-body": "body",

    "btn-att-legs": "legs"

  };


  Object.entries(
    attackButtons
  ).forEach(([id, zone]) => {

    const button = $(id);

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        selectedAttack =
          zone;


        Object.keys(
          attackButtons
        ).forEach(key => {

          const btn = $(key);

          if (btn) {

            btn.classList.toggle(
              "selected",
              key === id
            );

          }

        });

      }
    );

  });


  const blockButtons = {

    "btn-blk-head": "head",

    "btn-blk-body": "body",

    "btn-blk-legs": "legs"

  };


  Object.entries(
    blockButtons
  ).forEach(([id, zone]) => {

    const button = $(id);

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        selectedBlock =
          zone;


        Object.keys(
          blockButtons
        ).forEach(key => {

          const btn = $(key);

          if (btn) {

            btn.classList.toggle(
              "selected",
              key === id
            );

          }

        });

      }
    );

  });


  const attack =
    $("attack");


  if (attack) {

    attack.addEventListener(
      "click",
      playerAttack
    );

  }

}


/* =========================================================
   INVENTORY CONTROLS
   ========================================================= */

function setupInventoryControls() {

  const equip =
    $("equip-item");

  if (equip) {

    equip.addEventListener(
      "click",
      () => {

        if (selectedItemId) {

          equipItem(
            selectedItemId
          );

        }

      }
    );

  }


  const unequip =
    $("unequip-item");

  if (unequip) {

    unequip.addEventListener(
      "click",
      () => {

        if (selectedItemId) {

          unequipItem(
            selectedItemId
          );

        }

      }
    );

  }


  const drop =
    $("drop-item");

  if (drop) {

    drop.addEventListener(
      "click",
      () => {

        if (!selectedItemId) return;


        const item =
          ITEMS[selectedItemId];


        if (!item) return;


        const answer =
          confirm(
            `Выбросить ${item.name}?`
          );


        if (answer) {

          dropItem(
            selectedItemId
          );

        }

      }
    );

  }

}


/* =========================================================
   MARKET CONTROLS
   ========================================================= */

function setupMarketControls() {

  Object.keys(ITEMS)
    .forEach(id => {

      const button =
        $(`buy-${id}`);


      if (!button) return;


      button.addEventListener(
        "click",
        () => buyItem(id)
      );

    });

}


/* =========================================================
   CHARACTER EQUIPMENT SLOT CLICK
   ========================================================= */

function setupEquipmentSlots() {

  Object.entries(
    SLOT_IDS
  ).forEach(([slot, id]) => {

    const button =
      $(id);

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        const itemId =
          player.equipment[slot];


        if (itemId) {

          selectItem(itemId);

          document
            .querySelector(
              ".inventory-grid"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

        }

      }
    );

  });

}


/* =========================================================
   POINT CONTROLS
   ========================================================= */

function setupPointControls() {

  if ($("add-str")) {

    $("add-str")
      .addEventListener(
        "click",
        addStrength
      );

  }


  if ($("add-agi")) {

    $("add-agi")
      .addEventListener(
        "click",
        addAgility
      );

  }

}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    resizeArena();

    resizeCharacter();

  }
);


/* =========================================================
   ЗАПУСК
   ========================================================= */

function init() {

  syncLegacyFields();

  setupNavigation();

  setupBattleControls();

  setupInventoryControls();

  setupMarketControls();

  setupEquipmentSlots();

  setupPointControls();


  initArena3D();

  initCharacter3D();


  addLog(
    "⚔️ Бой готов. Выбери зону атаки."
  );


  updateUI();

}


init();   SAVE
   ===================================================== */

try {
    var saved = localStorage.getItem("territory_save");

    if (saved) {
        var oldData = JSON.parse(saved);

        p = Object.assign(
            {},
            defaultPlayer,
            oldData
        );
    }
} catch (err) {}

function save() {
    try {
        localStorage.setItem(
            "territory_save",
            JSON.stringify(p)
        );
    } catch (err) {}
}


/* =====================================================
   3D SYSTEM
   ===================================================== */

var battle3D = {
    scene: null,
    camera: null,
    renderer: null,

    player: null,
    enemy: null,

    playerParts: null,
    enemyParts: null,

    playerBase: null,
    enemyBase: null,

    ready: false,

    playerAction: null,
    enemyAction: null,

    shake: 0,

    cameraBaseX: 0,
    cameraBaseY: 0,
    cameraBaseZ: 0
};


/* =====================================================
   CREATE FIGHTER
   ===================================================== */

function createFighter(isPlayer) {

    var group = new THREE.Group();

    var bodyColor =
        isPlayer ? 0x2463ff : 0xb83232;

    var skinColor = 0xffc08f;
    var pantsColor =
        isPlayer ? 0x202c42 : 0x171717;

    var shoeColor = 0x080808;
    var hairColor = 0x151515;


    /* BODY */

    var body = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.15,
            1.45,
            0.65
        ),
        new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.8
        })
    );

    body.position.y = 2.15;
    body.castShadow = true;

    group.add(body);


    /* HEAD */

    var head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.48,
            20,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        })
    );

    head.position.y = 3.25;
    head.castShadow = true;

    group.add(head);


    /* HAIR */

    var hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.50,
            20,
            10,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.9
        })
    );

    hair.position.y = 3.48;
    hair.castShadow = true;

    group.add(hair);


    /* LEGS */

    var legL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.38,
            1.15,
            0.45
        ),
        new THREE.MeshStandardMaterial({
            color: pantsColor,
            roughness: 0.9
        })
    );

    var legR = legL.clone();

    legL.position.set(
        -0.27,
        0.85,
        0
    );

    legR.position.set(
        0.27,
        0.85,
        0
    );

    legL.castShadow = true;
    legR.castShadow = true;

    group.add(legL);
    group.add(legR);


    /* SHOES */

    var shoeL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.48,
            0.25,
            0.65
        ),
        new THREE.MeshStandardMaterial({
            color: shoeColor,
            roughness: 1
        })
    );

    var shoeR = shoeL.clone();

    shoeL.position.set(
        -0.27,
        0.22,
        0.08
    );

    shoeR.position.set(
        0.27,
        0.22,
        0.08
    );

    shoeL.castShadow = true;
    shoeR.castShadow = true;

    group.add(shoeL);
    group.add(shoeR);


    /* ARMS */

    var armL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.28,
            1.1,
            0.3
        ),
        new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        })
    );

    var armR = armL.clone();

    armL.position.set(
        -0.78,
        2.15,
        0
    );

    armR.position.set(
        0.78,
        2.15,
        0
    );

    group.add(armL);
    group.add(armR);


    /* FISTS */

    var fistL = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.18,
            12,
            10
        ),
        new THREE.MeshStandardMaterial({
            color: skinColor
        })
    );

    var fistR = fistL.clone();

    fistL.position.set(
        -0.78,
        1.60,
        0
    );

    fistR.position.set(
        0.78,
        1.60,
        0
    );

    group.add(fistL);
    group.add(fistR);


    group.userData.parts = {
        body: body,
        head: head,
        armL: armL,
        armR: armR,
        fistL: fistL,
        fistR: fistR,
        legL: legL,
        legR: legR
    };

    return group;
}


/* =====================================================
   ARENA
   ===================================================== */

function init3DArena() {

    var container =
        document.getElementById("battle-3d");

    if (!container) return;

    if (battle3D.ready) {
        resize3DArena();
        return;
    }


    var scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x111119);

    battle3D.scene = scene;


    /* CAMERA */

    var width =
        container.clientWidth || 300;

    var height =
        container.clientHeight || 300;

    var camera =
        new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            100
        );

    camera.position.set(
        0,
        3.8,
        8.8
    );

    camera.lookAt(
        0,
        2,
        0
    );

    battle3D.camera = camera;

    battle3D.cameraBaseX =
        camera.position.x;

    battle3D.cameraBaseY =
        camera.position.y;

    battle3D.cameraBaseZ =
        camera.position.z;


    /* RENDERER */

    var renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderer.setSize(
        width,
        height
    );

    renderer.shadowMap.enabled = true;

    container.innerHTML = "";

    container.appendChild(
        renderer.domElement
    );

    battle3D.renderer = renderer;


    /* LIGHT */

    var hemi =
        new THREE.HemisphereLight(
            0xffffff,
            0x151522,
            2.2
        );

    scene.add(hemi);


    var light =
        new THREE.DirectionalLight(
            0xffffff,
            2.5
        );

    light.position.set(
        4,
        8,
        6
    );

    light.castShadow = true;

    scene.add(light);


    var redLight =
        new THREE.PointLight(
            0xff3030,
            15,
            12
        );

    redLight.position.set(
        0,
        2,
        -3
    );

    scene.add(redLight);


    /* FLOOR */

    var floor =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                4.1,
                4.1,
                0.25,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x292731,
                roughness: 0.9,
                metalness: 0.1
            })
        );

    floor.position.y = -0.05;

    floor.receiveShadow = true;

    scene.add(floor);


    /* INNER RING */

    var ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                3.1,
                0.035,
                10,
                80
            ),
            new THREE.MeshBasicMaterial({
                color: 0x9293a8
            })
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y = 0.10;

    scene.add(ring);


    /* OUTER RING */

    var outerRing =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                3.9,
                0.08,
                12,
                80
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff4038
            })
        );

    outerRing.rotation.x =
        Math.PI / 2;

    outerRing.position.y =
        0.12;

    scene.add(outerRing);


    /* WALL */

    var wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                14,
                8,
                0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a22
            })
        );

    wall.position.set(
        0,
        3.5,
        -3.6
    );

    scene.add(wall);


    /* FIGHTERS */

    var player =
        createFighter(true);

    var enemy =
        createFighter(false);

    player.position.set(
        -1.65,
        0,
        0.1
    );

    enemy.position.set(
        1.65,
        0,
        -0.1
    );


    player.rotation.y =
        -0.12;

    enemy.rotation.y =
        Math.PI + 0.12;


    scene.add(player);
    scene.add(enemy);

    battle3D.player =
        player;

    battle3D.enemy =
        enemy;

    battle3D.playerParts =
        player.userData.parts;

    battle3D.enemyParts =
        enemy.userData.parts;

    battle3D.playerBase =
        player.position.clone();

    battle3D.enemyBase =
        enemy.position.clone();

    battle3D.ready = true;


    window.addEventListener(
        "resize",
        resize3DArena
    );

    animate3DArena();
}


/* =====================================================
   RESIZE
   ===================================================== */

function resize3DArena() {

    var container =
        document.getElementById("battle-3d");

    if (
        !container ||
        !battle3D.renderer ||
        !battle3D.camera
    ) return;

    var w =
        container.clientWidth;

    var h =
        container.clientHeight;

    if (w <= 0 || h <= 0) return;

    battle3D.camera.aspect =
        w / h;

    battle3D.camera.updateProjectionMatrix();

    battle3D.renderer.setSize(
        w,
        h
    );
}


/* =====================================================
   ANIMATION LOOP
   ===================================================== */

function animate3DArena() {

    requestAnimationFrame(
        animate3DArena
    );

    if (!battle3D.ready) return;

    var now =
        performance.now();


    updateFighterAnimation(
        battle3D.player,
        battle3D.playerParts,
        battle3D.playerAction,
        now,
        true
    );


    updateFighterAnimation(
        battle3D.enemy,
        battle3D.enemyParts,
        battle3D.enemyAction,
        now,
        false
    );


    /* CAMERA SHAKE */

    if (battle3D.shake > 0) {

        battle3D.shake *= 0.86;

        battle3D.camera.position.x =
            battle3D.cameraBaseX +
            (Math.random() - 0.5) *
            battle3D.shake;

        battle3D.camera.position.y =
            battle3D.cameraBaseY +
            (Math.random() - 0.5) *
            battle3D.shake;

    } else {

        battle3D.camera.position.x =
            battle3D.cameraBaseX;

        battle3D.camera.position.y =
            battle3D.cameraBaseY;
    }


    battle3D.camera.lookAt(
        0,
        2,
        0
    );


    battle3D.renderer.render(
        battle3D.scene,
        battle3D.camera
    );
}


/* =====================================================
   FIGHT ANIMATION
   ===================================================== */

function updateFighterAnimation(
    fighter,
    parts,
    action,
    now,
    isPlayer
) {

    if (!fighter || !parts)
        return;


    var idle =
        Math.sin(now * 0.002) *
        0.025;

    fighter.position.y =
        idle;


    parts.armL.rotation.set(
        0,
        0,
        0
    );

    parts.armR.rotation.set(
        0,
        0,
        0
    );

    parts.legL.rotation.set(
        0,
        0,
        0
    );

    parts.legR.rotation.set(
        0,
        0,
        0
    );

    fighter.rotation.x = 0;
    fighter.rotation.z = 0;


    if (!action) return;


    var elapsed =
        now - action.start;

    var duration =
        action.duration;


    if (elapsed >= duration) {

        fighter.position.copy(
            isPlayer
                ? battle3D.playerBase
                : battle3D.enemyBase
        );

        fighter.rotation.z = 0;

        if (isPlayer)
            battle3D.playerAction = null;
        else
            battle3D.enemyAction = null;

        return;
    }


    var t =
        elapsed / duration;


    /* ATTACK */

    if (action.type === "attack") {

        var punch =
            Math.sin(t * Math.PI);


        if (action.zone === "head") {

            fighter.position.z =
                (isPlayer ? 0.1 : -0.1) -
                punch * 0.30;

            parts.armR.rotation.z =
                -punch * 1.7;

            parts.armR.rotation.x =
                -punch * 0.8;

        } else if (
            action.zone === "body"
        ) {

            fighter.position.x =
                (isPlayer ? 1 : -1) *
                punch *
                0.55;

            parts.armR.rotation.z =
                -punch * 2.0;

            parts.armL.rotation.z =
                punch * 0.7;

        } else {

            parts.legR.rotation.z =
                -punch * 1.0;

            parts.legL.rotation.z =
                punch * 0.5;

            fighter.rotation.x =
                punch * 0.18;
        }
    }


    /* HIT */

    if (action.type === "hit") {

        var recoil =
            Math.sin(t * Math.PI);

        fighter.position.x +=
            (isPlayer ? -1 : 1) *
            recoil *
            0.55;

        fighter.rotation.z =
            (isPlayer ? -1 : 1) *
            recoil *
            0.18;
    }


    /* BLOCK */

    if (action.type === "block") {

        parts.armL.rotation.z =
            1.1;

        parts.armR.rotation.z =
            -1.1;

        parts.armL.rotation.x =
            -0.5;

        parts.armR.rotation.x =
            -0.5;
    }


    /* DODGE */

    if (action.type === "dodge") {

        var dodge =
            Math.sin(t * Math.PI);

        fighter.position.x +=
            (isPlayer ? -1 : 1) *
            dodge *
            0.9;

        fighter.rotation.z =
            (isPlayer ? -1 : 1) *
            dodge *
            0.22;
    }
}


/* =====================================================
   PLAYER ATTACK
   ===================================================== */

function playPlayerAttack(
    zone,
    critical
) {

    if (!battle3D.ready)
        return;


    battle3D.playerAction = {
        type: "attack",
        zone: zone,
        start: performance.now(),
        duration:
            critical ? 700 : 520
    };


    battle3D.shake =
        critical ? 0.22 : 0.08;


    setTimeout(
        function() {

            if (battle3D.enemy) {

                battle3D.enemyAction = {
                    type: "hit",
                    start: performance.now(),
                    duration:
                        critical
                            ? 600
                            : 400
                };
            }

        },
        critical ? 180 : 220
    );
}


/* =====================================================
   ENEMY ATTACK
   ===================================================== */

function playEnemyAttack(
    zone,
    blocked,
    dodged
) {

    if (!battle3D.ready)
        return;


    battle3D.enemyAction = {
        type: "attack",
        zone: zone,
        start: performance.now(),
        duration: 540
    };


    if (blocked) {

        setTimeout(
            function() {

                if (battle3D.enemy) {

                    battle3D.enemyAction = {
                        type: "hit",
                        start: performance.now(),
                        duration: 380
                    };
                }

            },
            250
        );

    } else if (dodged) {

        setTimeout(
            function() {

                if (battle3D.player) {

                    battle3D.playerAction = {
                        type: "dodge",
                        start: performance.now(),
                        duration: 520
                    };
                }

            },
            250
        );

    } else {

        setTimeout(
            function() {

                if (battle3D.player) {

                    battle3D.playerAction = {
                        type: "hit",
                        start: performance.now(),
                        duration: 430
                    };

                    battle3D.shake =
                        0.11;
                }

            },
            300
        );
    }
}


/* =====================================================
   DAMAGE TEXT
   ===================================================== */

function showDamage(
    text,
    critical,
    enemySide
) {

    var container =
        document.getElementById(
            "battle-3d"
        );

    if (!container)
        return;


    var el =
        document.createElement("div");

    el.innerText = text;

    el.style.position =
        "absolute";

    el.style.left =
        enemySide ? "67%" : "25%";

    el.style.top =
        critical ? "30%" : "38%";

    el.style.zIndex = "20";
    el.style.pointerEvents =
        "none";

    el.style.fontWeight =
        "900";

    el.style.fontSize =
        critical ? "34px" : "25px";

    el.style.color =
        critical
            ? "#ffd21f"
            : "#ffffff";

    el.style.textShadow =
        "0 3px 10px #000, 0 0 15px rgba(255,60,60,.7)";

    el.style.transition =
        "transform .8s ease, opacity .8s ease";

    el.style.transform =
        "translate(-50%, 0) scale(1.15)";

    el.style.opacity = "1";

    container.appendChild(el);


    setTimeout(
        function() {

            el.style.transform =
                "translate(-50%, -90px) scale(1)";

            el.style.opacity = "0";

        },
        30
    );


    setTimeout(
        function() {

            if (el.parentNode)
                el.parentNode.removeChild(el);

        },
        900
    );
}


/* =====================================================
   NOTICE
   ===================================================== */

function showNotice(text) {

    var n =
        document.getElementById(
            "notice"
        );

    if (!n) return;

    n.innerText = text;
    n.style.display = "block";


    setTimeout(
        function() {
            n.style.display = "none";
        },
        2000
    );
}


/* =====================================================
   LOG
   ===================================================== */

function addCombatLog(lines) {

    var logBox =
        document.querySelector(
            ".combat-log-text"
        );

    if (!logBox)
        return;


    if (
        logBox.innerHTML.includes(
            "Ожидание хода..."
        )
    ) {
        logBox.innerHTML = "";
    }


    logBox.innerHTML =
        lines.join("<br>") +
        "<br><hr style='border-color:#2a2a2a'><br>" +
        logBox.innerHTML;
}


/* =====================================================
   DOM READY
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        init3DArena();


        /* =================================================
           TABS
           ================================================= */

        var tArena =
            document.getElementById(
                "tab-arena"
            );

        var tShop =
            document.getElementById(
                "tab-shop"
            );

        var tMap =
            document.getElementById(
                "tab-map"
            );

        var tProfile =
            document.getElementById(
                "tab-profile"
            );


        var pArena =
            document.getElementById(
                "page-home"
            );

        var pShop =
            document.getElementById(
                "page-shop"
            );

        var pMap =
            document.getElementById(
                "page-map"
            );

        var pProfile =
            document.getElementById(
                "page-profile"
            );


        function showPage(
            tab,
            page
        ) {

            if (pArena)
                pArena.style.display =
                    "none";

            if (pShop)
                pShop.style.display =
                    "none";

            if (pMap)
                pMap.style.display =
                    "none";

            if (pProfile)
                pProfile.style.display =
                    "none";


            if (tArena)
                tArena.classList.remove(
                    "active"
                );

            if (tShop)
                tShop.classList.remove(
                    "active"
                );

            if (tMap)
                tMap.classList.remove(
                    "active"
                );

            if (tProfile)
                tProfile.classList.remove(
                    "active"
                );


            if (page)
                page.style.display =
                    "block";

            if (tab)
                tab.classList.add(
                    "active"
                );


            setTimeout(
                resize3DArena,
                50
            );

            updateUI();
        }


        if (tArena) {

            tArena.addEventListener(
                "click",
                function() {
                    showPage(
                        tArena,
                        pArena
                    );
                }
            );
        }


        if (tShop) {

            tShop.addEventListener(
                "click",
                function() {
                    showPage(
                        tShop,
                        pShop
                    );
                }
            );
        }


        if (tMap) {

            tMap.addEventListener(
                "click",
                function() {
                    showPage(
                        tMap,
                        pMap
                    );
                }
            );
        }


        if (tProfile) {

            tProfile.addEventListener(
                "click",
                function() {
                    showPage(
                        tProfile,
                        pProfile
                    );
                }
            );
        }


        /* =================================================
           ATTACK BUTTONS
           ================================================= */

        var attHead =
            document.getElementById(
                "btn-att-head"
            );

        var attBody =
            document.getElementById(
                "btn-att-body"
            );

        var attLegs =
            document.getElementById(
                "btn-att-legs"
            );


        var blkHead =
            document.getElementById(
                "btn-blk-head"
            );

        var blkBody =
            document.getElementById(
                "btn-blk-body"
            );

        var blkLegs =
            document.getElementById(
                "btn-blk-legs"
            );


        function clearAtt() {

            [
                attHead,
                attBody,
                attLegs
            ].forEach(
                function(btn) {

                    if (btn)
                        btn.classList.remove(
                            "zone-btn-active"
                        );
                }
            );
        }


        function clearBlk() {

            [
                blkHead,
                blkBody,
                blkLegs
            ].forEach(
                function(btn) {

                    if (btn)
                        btn.classList.remove(
                            "zone-btn-active"
                        );
                }
            );
        }


        if (attHead) {

            attHead.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attHead.classList.add(
                        "zone-btn-active"
                    );

                    selA = "head";
                }
            );
        }


        if (attBody) {

            attBody.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attBody.classList.add(
                        "zone-btn-active"
                    );

                    selA = "body";
                }
            );
        }


        if (attLegs) {

            attLegs.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attLegs.classList.add(
                        "zone-btn-active"
                    );

                    selA = "legs";
                }
            );
        }


        if (blkHead) {

            blkHead.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkHead.classList.add(
                        "zone-btn-active"
                    );

                    selB = "head";
                }
            );
        }


        if (blkBody) {

            blkBody.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkBody.classList.add(
                        "zone-btn-active"
                    );

                    selB = "body";
                }
            );
        }


        if (blkLegs) {

            blkLegs.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkLegs.classList.add(
                        "zone-btn-active"
                    );

                    selB = "legs";
                }
            );
        }


        /* =================================================
           BATTLE
           ================================================= */

        var turnBtn =
            document.getElementById(
                "attack"
            );


        if (turnBtn) {

            turnBtn.addEventListener(
                "click",
                function() {

                    if (battleLocked)
                        return;


                    if (!selA || !selB) {

                        showNotice(
                            "Выберите зоны атаки и защиты!"
                        );

                        return;
                    }


                    battleLocked = true;

                    turnBtn.disabled = true;


                    var zones = [
                        "head",
                        "body",
                        "legs"
                    ];


                    var zoneText = {
                        head: "Голову",
                        body: "Корпус",
                        legs: "Ноги"
                    };


                    /* ENEMY CHOICES */

                    var enemyA =
                        zones[
                            Math.floor(
                                Math.random() * 3
                            )
                        ];


                    var enemyB =
                        zones[
                            Math.floor(
                                Math.random() * 3
                            )
                        ];


                    var logs = [];


                    /* =================================================
                       PLAYER ATTACK
                       ================================================= */

                    var baseDamage =
                        15 +
                        p.bonusDamage +
                        Math.floor(
                            p.strength * 1.5
                        );


                    var zoneMultiplier = {
                        head: 1.35,
                        body: 1.00,
                        legs: 0.85
                    };


                    var dmg =
                        Math.round(
                            baseDamage *
                            zoneMultiplier[selA]
                        );


                    if (selA === enemyB) {

                        p.combo = 0;


                        logs.push(
                            "🛡️ Вы ударили в <b>" +
                            zoneText[selA] +
                            "</b>, но Хулиган заблокировал удар."
                        );


                        battle3D.enemyAction = {
                            type: "block",
                            start: performance.now(),
                            duration: 520
                        };


                        setTimeout(
                            function() {

                                if (
                                    battle3D.player
                                ) {

                                    battle3D.playerAction = {
                                        type: "hit",
                                        start: performance.now(),
                                        duration: 330
                                    };
                                }

                            },
                            180
                        );


                    } else {

                        p.combo++;


                        var critChance =
                            Math.min(
                                35,
                                5 +
                                p.strength * 3
                            );


                        var isCrit =
                            Math.random() * 100 <
                            critChance;


                        var comboBonus =
                            Math.min(
                                p.combo * 2,
                                12
                            );


                        var finalPlayerDmg =
                            Math.round(
                                dmg +
                                comboBonus
                            );


                        if (isCrit) {

                            finalPlayerDmg *= 2;
                        }


                        finalPlayerDmg =
                            Math.max(
                                1,
                                finalPlayerDmg
                            );


                        e.hp =
                            Math.max(
                                0,
                                e.hp -
                                finalPlayerDmg
                            );


                        playPlayerAttack(
                            selA,
                            isCrit
                        );


                        showDamage(
                            "-" +
                            finalPlayerDmg,
                            isCrit,
                            true
                        );


                        if (isCrit) {

                            logs.push(
                                "⚡💥 <b>КРИТ!</b> Вы пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalPlayerDmg +
                                "."
                            );

                        } else {

                            logs.push(
                                "💥 Вы успешно пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalPlayerDmg +
                                "."
                            );
                        }


                        if (p.combo >= 2) {

                            logs.push(
                                "🔥 <b>КОМБО x" +
                                p.combo +
                                "</b>!"
                            );
                        }
                    }


                    /* =================================================
                       ENEMY ATTACK
                       ================================================= */

                    if (e.hp > 0) {

                        var enemyDamage =
                            15 +
                            p.level * 2;


                        if (enemyA === selB) {

                            p.combo = 0;


                            var blockedDamage =
                                Math.max(
                                    1,
                                    Math.round(
                                        enemyDamage *
                                        0.25
                                    )
                                );


                            p.hp =
                                Math.max(
                                    0,
                                    p.hp -
                                    blockedDamage
                                );


                            logs.push(
                                "🛡️ Хулиган метил в <b>" +
                                zoneText[enemyA] +
                                "</b>, но вы заблокировали удар. Получено: -" +
                                blockedDamage +
                                "."
                            );


                            playEnemyAttack(
                                enemyA,
                                true,
                                false
                            );


                            showDamage(
                                "-" +
                                blockedDamage,
                                false,
                                false
                            );


                        } else {

                            var dodgeChance =
                                Math.min(
                                    40,
                                    p.agility * 3
                                );


                            var isDodge =
                                Math.random() *
                                100 <
                                dodgeChance;


                            if (isDodge) {

                                p.combo = 0;


                                logs.push(
                                    "💨 <b>УВОРОТ!</b> Вы уклонились от удара в <b>" +
                                    zoneText[enemyA] +
                                    "</b>!"
                                );


                                playEnemyAttack(
                                    enemyA,
                                    false,
                                    true
                                );


                            } else {

                                p.combo = 0;


                                p.hp =
                                    Math.max(
                                        0,
                                        p.hp -
                                        enemyDamage
                                    );


                                logs.push(
                                    "🥊 Хулиган нанес вам удар в <b>" +
                                    zoneText[enemyA] +
                                    "</b>. Урон: -" +
                                    enemyDamage +
                                    "."
                                );


                                playEnemyAttack(
                                    enemyA,
                                    false,
                                    false
                                );


                                showDamage(
                                    "-" +
                                    enemyDamage,
                                    false,
                                    false
                                );
                            }
                        }
                    }


                    /* =================================================
                       LOG
                       ================================================= */

                    addCombatLog(logs);


                    updateUI();


                    /* =================================================
                       END OF FIGHT
                       ================================================= */

                    if (
                        p.hp <= 0 ||
                        e.hp <= 0
                    ) {

                        if (
                            p.hp <= 0 &&
                            e.hp <= 0
                        ) {

                            addCombatLog([
                                "<b>⚔️ Ничья!</b>"
                            ]);

                        } else if (
                            e.hp <= 0
                        ) {

                            var reward =
                                200 +
                                p.level * 20;

                            var gainedXP = 40;


                            p.coins += reward;

                            p.exp += gainedXP;


                            addCombatLog([
                                "<b>🎉 ПОБЕДА!</b>",
                                "💰 Награда: +" +
                                reward +
                                " монет",
                                "⭐ Опыт: +" +
                                gainedXP +
                                " XP"
                            ]);


                            /* LEVEL UP */

                            while (
                                p.exp >=
                                p.maxExp
                            ) {

                                p.exp -=
                                    p.maxExp;

                                p.level += 1;

                                p.maxExp =
                                    Math.floor(
                                        p.maxExp *
                                        1.3
                                    );

                                p.freePoints +=
                                    3;

                                p.maxHp +=
                                    20;

                                p.hp =
                                    p.maxHp;


                                addCombatLog([
                                    "<b style='color:#f1c40f'>" +
                                    "🌟 ЛЕВЕЛ АП! " +
                                    p.level +
                                    " УРОВЕНЬ!" +
                                    "</b>",
                                    "❤️ Максимальное HP: " +
                                    p.maxHp,
                                    "📈 Получено очков характеристик: +3"
                                ]);
                            }


                        } else {

                            addCombatLog([
                                "<b>💀 ПОРАЖЕНИЕ</b>",
                                "❤️ Восстановление здоровья..."
                            ]);
                        }


                        setTimeout(
                            function() {

                                p.hp =
                                    p.maxHp;


                                e.maxHp =
                                    100 +
                                    p.level * 10;

                                e.hp =
                                    e.maxHp;


                                battleLocked =
                                    false;

                                turnBtn.disabled =
                                    false;


                                selA = null;
                                selB = null;


                                clearAtt();
                                clearBlk();


                                var logBox =
                                    document.querySelector(
                                        ".combat-log-text"
                                    );


                                if (logBox) {

                                    logBox.innerHTML =
                                        "Ожидание хода...";
                                }


                                updateUI();
                                save();

                            },
                            4000
                        );
                    } else {

                        setTimeout(
                            function() {

                                battleLocked =
                                    false;

                                turnBtn.disabled =
                                    false;

                            },
                            650
                        );
                    }


                    selA = null;
                    selB = null;

                    clearAtt();
                    clearBlk();

                    updateUI();
                    save();
                }
            );
        }


        /* =================================================
           SHOP
           ================================================= */

        var buyBrass =
            document.getElementById(
                "buy-brass"
            );

        var buyKnife =
            document.getElementById(
                "buy-knife"
            );


        if (buyBrass) {

            buyBrass.addEventListener(
                "click",
                function() {

                    if (p.coins >= 150) {

                        p.coins -= 150;

                        p.weapon =
                            "Кастеты";

                        p.bonusDamage =
                            5;


                        showNotice(
                            "🥊 Куплены Кастеты!"
                        );


                        updateUI();
                        save();

                    } else {

                        showNotice(
                            "Не хватает монет!"
                        );
                    }
                }
            );
        }


        if (buyKnife) {

            buyKnife.addEventListener(
                "click",
                function() {

                    if (p.coins >= 400) {

                        p.coins -= 400;

                        p.weapon =
                            "Охотничий нож";

                        p.bonusDamage =
                            12;


                        showNotice(
                            "🔪 Куплен Нож!"
                        );


                        updateUI();
                        save();

                    } else {

                        showNotice(
                            "Не хватает монет!"
                        );
                    }
                }
            );
        }


        /* =================================================
           STATS
           ================================================= */

        var addStr =
            document.getElementById(
                "add-str"
            );

        var addAgi =
            document.getElementById(
                "add-agi"
            );


        if (addStr) {

            addStr.addEventListener(
                "click",
                function() {

                    if (p.freePoints > 0) {

                        p.freePoints--;

                        p.strength++;


                        updateUI();
                        save();
                    }
                }
            );
        }


        if (addAgi) {

            addAgi.addEventListener(
                "click",
                function() {

                    if (p.freePoints > 0) {

                        p.freePoints--;

                        p.agility++;


                        updateUI();
                        save();
                    }
                }
            );
        }


        updateUI();
    }
);


/* =====================================================
   UI
   ===================================================== */

function updateUI() {

    /* COINS */

    var coins =
        document.getElementById(
            "coins"
        );

    if (coins)
        coins.innerText =
            p.coins;


    /* LEVEL */

    var level =
        document.getElementById(
            "header-level"
        );

    if (level)
        level.innerText =
            "Уровень " +
            p.level;


    /* PLAYER HP */

    var pTxt =
        document.getElementById(
            "hp-text-player"
        );

    if (pTxt)
        pTxt.innerText =
            p.hp +
            "/" +
            p.maxHp;


    /* ENEMY HP */

    var eTxt =
        document.getElementById(
            "hp-text-enemy"
        );

    if (eTxt)
        eTxt.innerText =
            e.hp +
            "/" +
            e.maxHp;


    /* PLAYER HP BAR */

    var pFill =
        document.getElementById(
            "hp-fill-player"
        );

    if (pFill)
        pFill.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    (p.hp / p.maxHp) *
                    100
                )
            ) +
            "%";


    /* ENEMY HP BAR */

    var eFill =
        document.getElementById(
            "hp-fill-enemy"
        );

    if (eFill)
        eFill.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    (e.hp / e.maxHp) *
                    100
                )
            ) +
            "%";


    /* PROFILE LEVEL */

    var profLevel =
        document.getElementById(
            "prof-level"
        );

    if (profLevel)
        profLevel.innerText =
            p.level;


    /* WEAPON */

    var profWeapon =
        document.getElementById(
            "prof-weapon"
        );

    if (profWeapon)
        profWeapon.innerText =
            p.weapon;


    /* DAMAGE */

    var profDamage =
        document.getElementById(
            "prof-damage"
        );

    if (profDamage)
        profDamage.innerText =
            15 +
            p.bonusDamage +
            Math.floor(
                p.strength * 1.5
            );


    /* MAX HP */

    var profHp =
        document.getElementById(
            "prof-maxhp"
        );

    if (profHp)
        profHp.innerText =
            p.maxHp +
            " HP";


    /* STRENGTH */

    var profStr =
        document.getElementById(
            "prof-str"
        );

    if (profStr)
        profStr.innerText =
            p.strength;


    /* AGILITY */

    var profAgi =
        document.getElementById(
            "prof-agi"
        );

    if (profAgi)
        profAgi.innerText =
            p.agility;


    /* FREE POINTS */

    var profFree =
        document.getElementById(
            "prof-free"
        );

    if (profFree)
        profFree.innerText =
            p.freePoints;


    var freeBlock =
        document.getElementById(
            "free-points-block"
        );


    var btnS =
        document.getElementById(
            "add-str"
        );

    var btnA =
        document.getElementById(
            "add-agi"
        );


    if (freeBlock) {

        if (p.freePoints > 0) {

            freeBlock.style.display =
                "block";

            if (btnS)
                btnS.style.display =
                    "inline-block";

            if (btnA)
                btnA.style.display =
                    "inline-block";

        } else {

            freeBlock.style.display =
                "none";

            if (btnS)
                btnS.style.display =
                    "none";

            if (btnA)
                btnA.style.display =
                    "none";
        }
    }


    /* XP */

    var expTxt =
        document.getElementById(
            "exp-text"
        );

    if (expTxt)
        expTxt.innerText =
            p.exp +
            " / " +
            p.maxExp +
            " XP";


    var expFill =
        document.getElementById(
            "exp-fill"
        );

    if (expFill)
        expFill.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    (p.exp / p.maxExp) *
                    100
                )
            ) +
            "%";
}
