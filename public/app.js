// Инициализация Telegram WebApp SDK
const tg = window.Telegram?.WebApp;

// Настройка внешнего вида внутри Telegram
if (tg) {
    tg.ready();
    tg.expand(); // Разворачивает Mini App на весь экран телефона
    tg.setHeaderColor("#15111e"); // Красит верхнюю панель в цвет игры
    tg.setBackgroundColor("#0d0b13");
}

// Помощник для вибрации смартфона
function vibrate(type = "light") {
    if (!tg || !tg.HapticFeedback) return;
    if (type === "light") tg.HapticFeedback.impactOccurred("light");
    if (type === "medium") tg.HapticFeedback.impactOccurred("medium");
    if (type === "error") tg.HapticFeedback.notificationOccurred("error");
    if (type === "success") tg.HapticFeedback.notificationOccurred("success");
}

// Получаем имя из Телеграма или ставим заглушку
function getTelegramName() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        return `${user.first_name} ${user.last_name || ""}`.trim();
    }
    return "Маг Территории"; // Имя по умолчанию вне TG
}

// ==========================================
// 1. ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ (ДАННЫЕ)
// ==========================================
const S = {
    gold: 1250,
    ph: 100,        
    maxPh: 100,     
    eh: 100,        
    maxEh: 100,     
    ap: 3,          
    def: false,     
    enemyName: "Бандит",
    playerName: getTelegramName(), // Динамическое имя из SDK
    log: ["Бандит выходит на арену.", "Твой ход."],
    
    baseStats: {
        atk: 15,
        def: 10,
        crit: 12
    },

    equipped: {
        weapon: 0,   
        armor: 1,    
        helmet: 2,   
        gloves: 5,   
        boots: 6,    
        ring: 3      
    },

    items: [
        ["🗡️", "Клинок", "ATK +18", "atk", 18],
        ["🛡️", "Щит", "DEF +14", "def", 14],
        ["⛑️", "Шлем", "DEF +7", "def", 7],
        ["💍", "Кольцо", "ATK +6", "atk", 6],
        ["🧪", "Зелье HP", "HP +40", "use", 40],
        ["🥊", "Перчатки", "ATK +5", "atk", 5],
        ["🥾", "Сапоги", "DEF +4", "def", 4],
        ["💎", "Кристалл", "Редкий ресурс", "misc", 0]
    ]
};

const screen = document.getElementById("screen");
const gold = document.getElementById("gold");

// ==========================================
// 2. ВСПОМОГАТЕЛЬНЫЕ СИСТЕМНЫЕ ФУНКЦИИ
// ==========================================

window.onload = () => {
    if(gold) gold.textContent = S.gold;
    home();
};

function toast(t) {
    let x = document.getElementById("toast");
    if (!x) return;
    x.textContent = t;
    x.classList.add("show");
    clearTimeout(window.tt);
    window.tt = setTimeout(() => x.classList.remove("show"), 1400);
}

function getFinalStats() {
    let stats = { atk: S.baseStats.atk, def: S.baseStats.def, crit: S.baseStats.crit };
    
    for (let slot in S.equipped) {
        let itemIndex = S.equipped[slot];
        if (itemIndex !== null && S.items[itemIndex]) {
            let item = S.items[itemIndex];
            let statType = item[3];
            let bonusValue = item[4];
            if (stats[statType] !== undefined) {
                stats[statType] += bonusValue;
            }
        }
    }
    return stats;
}

// ==========================================
// 3. ЭКРАНЫ И ИНТЕРФЕЙС
// ==========================================

function home() {
    vibrate("light");
    let current = getFinalStats();
    screen.innerHTML = `
        <section class="hero">
            <h2>⚔️ TERRITORIA ⚔️</h2>
            <p>${S.playerName}</p>
            <div class="herochar">🧙</div>
            <div class="wolf">🐺</div>
            <div class="fire">🔥</div>
            <div class="quick">
                <button onclick="inventory()">🎒<br>Герой</button>
                <button onclick="startBattle()">⚔️<br>Арена</button>
                <button onclick="quests()">📜<br>Задания</button>
                <button onclick="shop()">🛒<br>Магазин</button>
            </div>
        </section>
        <div class="card">
            <b>❤️ Здоровье</b>
            <div class="hp"><span style="width:${(S.ph / S.maxPh) * 100}%"></span></div>
            ${S.ph}/${S.maxPh} HP
        </div>
        <div class="card">
            <b>📊 Характеристики (с экипировкой)</b>
            <div class="stats">
                <div class="stat">⚔️<b>${current.atk}</b>Атака</div>
                <div class="stat">🛡️<b>${current.def}</b>Защита</div>
                <div class="stat">💥<b>${current.crit}%</b>Крит</div>
            </div>
        </div>
    `;
}

function inventory() {
    vibrate("light");
    let slotsConfig = [
        { key: "weapon", name: "Оружие" },
        { key: "armor", name: "Броня" },
        { key: "helmet", name: "Шлем" },
        { key: "gloves", name: "Перчатки" },
        { key: "boots", name: "Сапоги" },
        { key: "ring", name: "Кольцо" }
    ];

    let slotsHtml = slotsConfig.map(slot => {
        let itemIdx = S.equipped[slot.key];
        let icon = itemIdx !== null && S.items[itemIdx] ? S.items[itemIdx][0] : "❌";
        return `<div class="slot" onclick="unequipSlot('${slot.key}')" style="cursor:pointer;">${icon}<small>${slot.name}</small></div>`;
    }).join("");

    screen.innerHTML = `
        <h2 class="title">🎒 Герой</h2>
        <div class="card">
            <b>Экипировка (Кликните для снятия шмота)</b>
            <div class="grid">${slotsHtml}</div>
        </div>
        <div class="card">
            <b>Предметы в сумке (Кликните для использования/надевания)</b>
            <div class="items">
                ${S.items.map((x, i) => {
                    let isEquipped = Object.values(S.equipped).includes(i);
                    if (isEquipped) {
                        return `<button class="item" style="opacity: 0.4; border-color: #e7b84f;" onclick="toast('Этот предмет уже надет!')">
                            <i>${x[0]}</i><b>${x[1]}</b><small>Надето</small>
                        </button>`;
                    }
                    return `<button class="item" onclick="interactWithItem(${i})">
                        <i>${x[0]}</i><b>${x[1]}</b><small>${x[2]}</small>
                    </button>`;
                }).join("")}
            </div>
        </div>
        <div style="text-align:center; margin-top:15px;">
            <button class="act main" style="padding:10px 20px; display:inline-block; width:auto;" onclick="home()">◀ Назад в город</button>
        </div>
    `;
}

function interactWithItem(index) {
    let item = S.items[index];
    if (!item) return;

    if (item[3] === "use") {
        if (S.ph >= S.maxPh) return toast("У вас уже полное здоровье!");
        vibrate("success");
        S.ph = Math.min(S.maxPh, S.ph + item[4]);
        toast(`Выпито: ${item[1]}. Восстановлено +${item[4]} HP`);
        S.items.splice(index, 1); 
        
        for (let slot in S.equipped) {
            if (S.equipped[slot] !== null && S.equipped[slot] > index) {
                S.equipped[slot]--;
            }
        }
        inventory();
        return;
    }

    let targetSlot = null;
    if (item[0] === "🗡️" || item[0] === "⚔️") targetSlot = "weapon";
    if (item[0] === "🛡️") targetSlot = "armor";
    if (item[0] === "⛑️") targetSlot = "helmet";
    if (item[0] === "🥊") targetSlot = "gloves";
    if (item[0] === "🥾") targetSlot = "boots";
    if (item[0] === "💍") targetSlot = "ring";

    if (targetSlot) {
        vibrate("medium");
        S.equipped[targetSlot] = index;
        toast(`Вы экипировали: ${item[1]}`);
        inventory();
    } else {
        toast("Этот предмет нельзя экипировать!");
    }
}

function unequipSlot(slotKey) {
    if (S.equipped[slotKey] !== null) {
        vibrate("light");
        S.equipped[slotKey] = null;
        toast("Предмет бережно снят в сумку");
        inventory();
    } else {
        toast("Этот слот пуст!");
    }
}

function shop() {
    vibrate("light");
    let g = [
        ["🗡️", "Железный меч", 180, "atk", 22],
        ["🛡️", "Щит стража", 220, "def", 18],
        ["🧪", "Зелье HP", 90, "use", 40],
        ["💍", "Кольцо силы", 350, "atk", 12],
        ["⛑️", "Шлем охотника", 260, "def", 10],
        ["⚔️", "Меч героя", 500, "atk", 35]
    ];
    window.goods = g;
    screen.innerHTML = `
        <h2 class="title">🛒 Магазин</h2>
        <div class="card">
            <div class="shopgrid">
                ${g.map((x, i) => `
                    <div class="shopitem">
                        <div class="icon">${x[0]}</div>
                        <b>${x[1]}</b>
                        <small style="display:block; color:#aaa; font-size:10px; margin-bottom:5px;">
                            ${x[3].toUpperCase()} +${x[4]}
                        </small>
                        <button class="buy" onclick="buy(${i})">🪙 ${x[2]}</button>
                    </div>
                `).join("")}
            </div>
        </div>
        <div style="text-align:center; margin-top:15px;">
            <button class="act main" style="padding:10px 20px; display:inline-block; width:auto;" onclick="home()">◀ Назад в город</button>
        </div>
    `;
}

function buy(i) {
    let x = goods[i];
    if (S.gold < x[2]) {
        vibrate("error");
        return toast("Не хватает золота");
    }
    
    vibrate("success");
    S.gold -= x[2];
    if(gold) gold.textContent = S.gold;
    
    S.items.push([x[0], x[1], `${x[3].toUpperCase()} +${x[4]}`, x[3], x[4]]);
    toast("Куплено и положено в сумку: " + x[1]);
}

function quests() {
    vibrate("light");
    screen.innerHTML = `
        <h2 class="title">📜 Задания</h2>
        <div class="card quest">
            <i>⚔️</i>
            <div><b>Победи бандита</b><small>Награда: 🪙 120</small></div>
            <button onclick="startBattle()">В бой</button>
        </div>
        <div class="card quest">
            <i>🪙</i>
            if (stats[statType] !== undefined) {
                stats[statType] += bonusValue;
            }
        }
    }
    return stats;
}

// ==========================================
// 3. ЭКРАНЫ И ИНТЕРФЕЙС
// ==========================================

// Главный экран (Город)
function home() {
    let current = getFinalStats();
    screen.innerHTML = `
        <section class="hero">
            <h2>⚔️ TERRITORIA ⚔️</h2>
            <p>Золотой город</p>
            <div class="herochar">🧙</div>
            <div class="wolf">🐺</div>
            <div class="fire">🔥</div>
            <div class="quick">
                <button onclick="inventory()">🎒<br>Герой</button>
                <button onclick="startBattle()">⚔️<br>Арена</button>
                <button onclick="quests()">📜<br>Задания</button>
                <button onclick="shop()">🛒<br>Магазин</button>
            </div>
        </section>
        <div class="card">
            <b>❤️ Здоровье</b>
            <div class="hp"><span style="width:${(S.ph / S.maxPh) * 100}%"></span></div>
            ${S.ph}/${S.maxPh} HP
        </div>
        <div class="card">
            <b>📊 Характеристики (с экипировкой)</b>
            <div class="stats">
                <div class="stat">⚔️<b>${current.atk}</b>Атака</div>
                <div class="stat">🛡️<b>${current.def}</b>Защита</div>
                <div class="stat">💥<b>${current.crit}%</b>Крит</div>
            </div>
        </div>
    `;
}

// Экран персонажа и инвентаря
function inventory() {
    let slotsConfig = [
        { key: "weapon", name: "Оружие" },
        { key: "armor", name: "Броня" },
        { key: "helmet", name: "Шлем" },
        { key: "gloves", name: "Перчатки" },
        { key: "boots", name: "Сапоги" },
        { key: "ring", name: "Кольцо" }
    ];

    let slotsHtml = slotsConfig.map(slot => {
        let itemIdx = S.equipped[slot.key];
        let icon = itemIdx !== null && S.items[itemIdx] ? S.items[itemIdx][0] : "❌";
        return `<div class="slot" onclick="unequipSlot('${slot.key}')" style="cursor:pointer;">${icon}<small>${slot.name}</small></div>`;
    }).join("");

    screen.innerHTML = `
        <h2 class="title">🎒 Герой</h2>
        <div class="card">
            <b>Экипировка (Кликните для снятия шмота)</b>
            <div class="grid">${slotsHtml}</div>
        </div>
        <div class="card">
            <b>Предметы в сумке (Кликните для использования/надевания)</b>
            <div class="items">
                ${S.items.map((x, i) => {
                    // Проверяем, надет ли этот предмет прямо сейчас
                    let isEquipped = Object.values(S.equipped).includes(i);
                    if (isEquipped) {
                        return `<button class="item" style="opacity: 0.4; border-color: #e7b84f;" onclick="toast('Этот предмет уже надет!')">
                            <i>${x[0]}</i><b>${x[1]}</b><small>Надето</small>
                        </button>`;
                    }
                    return `<button class="item" onclick="interactWithItem(${i})">
                        <i>${x[0]}</i><b>${x[1]}</b><small>${x[2]}</small>
                    </button>`;
                }).join("")}
            </div>
        </div>
        <div style="text-align:center; margin-top:15px;">
            <button class="act main" style="padding:10px 20px; display:inline-block; width:auto;" onclick="home()">◀ Назад в город</button>
        </div>
    `;
}

// Взаимодействие с вещью из инвентаря (Надеть или выпить банку)
function interactWithItem(index) {
    let item = S.items[index];
    if (!item) return;

    // Если это зелье лечения
    if (item[3] === "use") {
        if (S.ph >= S.maxPh) return toast("У вас уже полное здоровье!");
        S.ph = Math.min(S.maxPh, S.ph + item[4]);
        toast(`Выпито: ${item[1]}. Восстановлено +${item[4]} HP`);
        S.items.splice(index, 1); // Удаляем банку из сумки после выпивания
        
        // Корректируем индексы одетых вещей, так как массив сместился после удаления элемента
        for (let slot in S.equipped) {
            if (S.equipped[slot] !== null && S.equipped[slot] > index) {
                S.equipped[slot]--;
            }
        }
        inventory();
        return;
    }

    // Если это шмот, определяем слот на кукле персонажа
    let targetSlot = null;
    if (item[0] === "🗡️" || item[0] === "⚔️") targetSlot = "weapon";
    if (item[0] === "🛡️") targetSlot = "armor";
    if (item[0] === "⛑️") targetSlot = "helmet";
    if (item[0] === "🥊") targetSlot = "gloves";
    if (item[0] === "🥾") targetSlot = "boots";
    if (item[0] === "💍") targetSlot = "ring";

    if (targetSlot) {
        S.equipped[targetSlot] = index;
        toast(`Вы экипировали: ${item[1]}`);
        inventory();
    } else {
        toast("Этот предмет нельзя экипировать!");
    }
}

// Функция для снятия шмота в инвентаре
function unequipSlot(slotKey) {
    if (S.equipped[slotKey] !== null) {
        S.equipped[slotKey] = null;
        toast("Предмет бережно снят в сумку");
        inventory();
    } else {
        toast("Этот слот пуст!");
    }
}

// Экран магазина
function shop() {
    let g = [
        ["🗡️", "Железный меч", 180, "atk", 22],
        ["🛡️", "Щит стража", 220, "def", 18],
        ["🧪", "Зелье HP", 90, "use", 40],
        ["💍", "Кольцо силы", 350, "atk", 12],
        ["⛑️", "Шлем охотника", 260, "def", 10],
        ["⚔️", "Меч героя", 500, "atk", 35]
    ];
    window.goods = g;
    screen.innerHTML = `
        <h2 class="title">🛒 Магазин</h2>
        <div class="card">
            <div class="shopgrid">
                ${g.map((x, i) => `
                    <div class="shopitem">
                        <div class="icon">${x[0]}</div>
                        <b>${x[1]}</b>
                        <small style="display:block; color:#aaa; font-size:10px; margin-bottom:5px;">
                            ${x[3].toUpperCase()} +${x[4]}
                        </small>
                        <button class="buy" onclick="buy(${i})">🪙 ${x[2]}</button>
                    </div>
                `).join("")}
            </div>
        </div>
        <div style="text-align:center; margin-top:15px;">
            <button class="act main" style="padding:10px 20px; display:inline-block; width:auto;" onclick="home()">◀ Назад в город</button>
        </div>
    `;
}

// Покупка предмета
function buy(i) {
    let x = goods[i];
    if (S.gold < x[2]) return toast("Не хватает золота");
    
    S.gold -= x[2];
    if(gold) gold.textContent = S.gold;
    
    // Пушим вещь в массив предметов игрока
    S.items.push([x[0], x[1], `${x[3].toUpperCase()} +${x[4]}`, x[3], x[4]]);
    toast("Куплено и положено в сумку: " + x[1]);
}

// Экран заданий
function quests() {
    screen.innerHTML = `
        <h2 class="title">📜 Задания</h2>
        <div class="card quest">
            <i>⚔️</i>
            <div><b>Победи бандита</b><small>Награда: 🪙 120</small></div>
            <button onclick="startBattle()">В бой</button>
        </div>
        <div class="card quest">
            <i>🪙</i>
            <div><b>Накопи 2000 золота</b><small>Прогресс: ${S.gold}/2000</small></div>
        </div>
        <div class="card quest">
            <i>🎒</i>
            <div><b>Собери шмотки</b><small>Прогресс: ${S.items.length}/10 предметов</small></div>
        </div>
