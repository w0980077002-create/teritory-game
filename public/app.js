// ==========================================
// 1. ДАННЫЕ ИГРЫ (ПЕРЕМЕННЫЕ)
// ==========================================
const S = {
    gold: 1250,
    ph: 100,        // Хитпоинты игрока
    eh: 100,        // Хитпоинты врага
    ap: 3,          // Очки действия (ОД)
    def: false,     // Стойка защиты
    log: ["Бандит выходит на арену.", "Твой ход."],
    
    // Предметы в вашей сумке
    items: [
        ["🗡️","Клинок","ATK +18"],
        ["🛡️","Щит","DEF +14"],
        ["⛑️","Шлем","DEF +7"],
        ["💍","Кольцо","ATK +6"],
        ["🧪","Зелье","HP +40"],
        ["🥊","Перчатки","ATK +5"],
        ["🥾","Сапоги","DEF +4"],
        ["💎","Кристалл","Редкий"]
    ]
};

// Ссылки на экран и золото из HTML
const screen = document.getElementById("screen");
const gold = document.getElementById("gold");

// Инициализация при старте страницы
window.onload = () => {
    if(gold) gold.textContent = S.gold;
    home();
};

// Всплывающие подсказки
function toast(t){
    let x = document.getElementById("toast");
    if(!x) return;
    x.textContent = t;
    x.classList.add("show");
    clearTimeout(window.tt);
    window.tt = setTimeout(() => x.classList.remove("show"), 1400);
}

// ==========================================
// 2. ИГРОВЫЕ ЭКРАНЫ (ИНТЕРФЕЙС)
// ==========================================

// Экран: Город
function home(){
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
            <div class="hp"><span style="width:${S.ph}%"></span></div>
            ${S.ph}/100 HP
        </div>
        <div class="card">
            <b>📊 Характеристики</b>
            <div class="stats">
                <div class="stat">⚔️<b>48</b>Атака</div>
                <div class="stat">🛡️<b>35</b>Защита</div>
                <div class="stat">💥<b>12%</b>Крит</div>
            </div>
        </div>
    `;
}

// Экран: Инвентарь персонажа
function inventory(){
    screen.innerHTML = `
        <h2 class="title">🎒 Герой</h2>
        <div class="card">
            <b>Экипировка</b>
            <div class="grid">
                ${["🗡️","🛡️","⛑️","🥊","🥾","💍"].map((x,i) => `
                    <div class="slot">${x}<small>${["Оружие","Броня","Шлем","Перчатки","Сапоги","Кольцо"][i]}</small></div>
                `).join("")}
            </div>
        </div>
        <div class="card">
            <b>Предметы</b>
            <div class="items">
                ${S.items.map((x,i) => `
                    <button class="item" onclick="toast('${x[1]} выбран')">
                        <i>${x[0]}</i><b>${x[1]}</b><small>${x[2]}</small>
                    </button>
                `).join("")}
            </div>
        </div>
    `;
}

// Экран: Магазин
function shop(){
    let g = [
        ["🗡️","Железный меч",180],
        ["🛡️","Щит стража",220],
        ["🧪","Зелье HP",90],
        ["💍","Кольцо силы",350],
        ["⛑️","Шлем охотника",260],
        ["⚔️","Меч героя",500]
    ];
    window.goods = g; // Сохраняем товары для функции покупки
    
    screen.innerHTML = `
        <h2 class="title">🛒 Магазин</h2>
        <div class="card">
            <div class="shopgrid">
                ${g.map((x,i) => `
                    <div class="shopitem">
                        <div class="icon">${x[0]}</div>
                        <b>${x[1]}</b>
                        <button class="buy" onclick="buy(${i})">🪙 ${x[2]}</button>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

// Логика покупки предметов
function buy(i){
    let x = goods[i];
    if(S.gold < x[2]) return toast("Не хватает золота");
    
    S.gold -= x[2];
    if(gold) gold.textContent = S.gold;
    
    // Добавляем купленный предмет в инвентарь игрока
    S.items.push([x[0], x[1], "Куплено"]);
    toast("Куплено: " + x[1]);
}

// Экран: Задания
function quests(){
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
            <div><b>Собери 5 предметов</b><small>Прогресс: ${S.items.length}/5</small></div>
        </div>
    `;
}

// ==========================================
// 3. БОЕВАЯ ЛОГИКА (АРЕНА)
// ==========================================

// Старт боя
function startBattle(){
    S.ph = 100;
    S.eh = 100;
    S.ap = 3;
    S.def = false;
    S.log = ["Бандит выходит на арену.", "Твой ход."];
    battle();
}

// Отрисовка арены
function battle(){
    screen.innerHTML = `
        <section class="battle">
            <div class="turn">
                <span>${S.ap > 0 ? "ТВОЙ ХОД" : "НЕТ ОЧКОВ ДЕЙСТВИЯ"}</span>
            </div>
            <div class="arena">
                <div class="line"></div>
                <div class="unit you">
                    <div class="pic">🧙</div>
                    <b>Территорианец</b>
                    <div class="hp"><span style="width:${S.ph}%"></span></div>
                    <small>${S.ph}/100</small>
                    <div class="ap">
                        ${[0,1,2].map(i => `<i class="${i < S.ap ? "" : "off"}"></i>`).join("")}
                    </div>
                </div>
                <div class="unit enemy">
                    <div class="pic">👹</div>
                    <b>Бандит</b>
                    <div class="hp"><span style="width:${S.eh}%"></span></div>
                    <small>${S.eh}/100</small>
                </div>
            </div>
            <div class="card">
                <b>📜 Журнал боя</b>
                <div class="battlelog">
                    ${S.log.slice(-5).map(x => `<div>• ${x}</div>`).join("")}
                </div>
            </div>
            <div class="actions">
                <button class="act main" onclick="act('attack')">⚔️ Атака<br><small>1 ОД</small></button>
                <button class="act" onclick="act('skill')">✨ Сильный удар<br><small>2 ОД</small></button>
                <button class="act" onclick="act('def')">🛡️ Защита<br><small>1 ОД</small></button>
                <button class="act heal" onclick="act('heal')">🧪 Зелье<br><small>1 ОД</small></button>
            </div>
        </section>
    `;
}

// Обработка действий игрока во время боя
function act(a){
    if(S.eh <= 0 || S.ph <= 0) return toast("Бой завершен");
    
    let cost = a === "skill" ? 2 : 1;
    if(S.ap < cost) return toast("Недостаточно очков действия");
    
    S.ap -= cost;
    
    if(a === "attack"){
        let d = 15 + Math.floor(Math.random() * 9);
        S.eh = Math.max(0, S.eh - d);
        S.log.push(`Ты атаковал и нанёс ${d} урона.`);
    }
    if(a === "skill"){
        let d = 28 + Math.floor(Math.random() * 13);
        S.eh = Math.max(0, S.eh - d);
        S.log.push(`✨ Сильный удар! ${d} урона.`);
    }
    if(a === "def"){
        S.def = true;
        S.log.push("🛡️ Ты занял защитную стойку.");
    }
    if(a === "heal"){
        S.ph = Math.min(100, S.ph + 30);
        S.log.push("🧪 Ты восстановил 30 HP.");
    }
    
    // Проверка победы игрока
    if(S.eh <= 0){
        S.log.push("🏆 Победа! +120 золота.");
        S.gold += 120;
        if(gold) gold.textContent = S.gold;
        renderEndControls();
        return;
    }
    
    // Передача хода монстру, если кончились ОД
    if(S.ap === 0){
        battle();
        setTimeout(enemyTurn, 800);
    } else {
        battle();
    }
}

// Ход Бандита
function enemyTurn(){
    if(S.eh <= 0 || S.ph <= 0) return;
    
    let d = 8 + Math.floor(Math.random() * 8);
    if(S.def){
        d = Math.ceil(d / 2);
        S.def = false;
        S.log.push(`👹 Бандит атакует в щит: -${d} HP.`);
    } else {
        S.log.push(`👹 Бандит атакует: -${d} HP.`);
    }
    
    S.ph = Math.max(0, S.ph - d);
    
    // Проверка смерти игрока
    if(S.ph <= 0){
        S.log.push("💀 Поражение. Нажми «Бой», чтобы начать снова.");
        S.ap = 0;
        renderEndControls();
        return;
    }
    
    S.ap = 3;
    S.log.push("Твой ход.");
    battle();
}

// Замена кнопок управления на кнопку возврата в город
function renderEndControls() {
    battle();
    let actionsBlock = document.querySelector(".actions");
    if (actionsBlock) {
        actionsBlock.innerHTML = `
            <button class="act main" style="grid-column: span 2; background: linear-gradient(#e7bb54,#94491d);" onclick="home()">
                Вернуться в город
            </button>
        `;
    }
}
        }
    }
    return html;
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

    if (item[3] === "use") {
        if (S.ph >= S.maxPh) return toast("У вас уже полное здоровье!");
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
        S.equipped[targetSlot] = index;
        toast(`Вы экипировали: ${item[1]}`);
        inventory();
    } else {
        toast("Этот предмет нельзя экипировать!");
    }
}

function unequipSlot(slotKey) {
    if (S.equipped[slotKey] !== null) {
        S.equipped[slotKey] = null;
        toast("Предмет снят в сумку");
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

function buy(i) {
    let x = goods[i];
    if (S.gold < x[2]) return toast("Не хватает золота");
    
    S.gold -= x[2];
    if(gold) gold.textContent = S.gold;
    
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
        <div style="text-align:center; margin-top:15px;">
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
            <div><b>Накопи 2000 золота</b><small>Прогресс: ${S.gold}/2000</small></div>
        </div>
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
