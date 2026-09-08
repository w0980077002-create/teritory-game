// Состояние игры (добавили опыт, статы, свободные очки и максимальное здоровье персонажа)
var p = { 
    hp: 120, 
    maxHp: 120, 
    coins: 1000, 
    level: 1, 
    exp: 0,
    maxExp: 100,
    weapon: "Кулаки", 
    bonusDamage: 0,
    strength: 5,
    agility: 5,
    freePoints: 0
};
var e = { name: "Местный хулиган", hp: 100, maxHp: 100 };

var selA = null; // Выбранная атака
var selB = null; // Выбранный блок

// Загрузка сохранения из localStorage
try {
    var s = localStorage.getItem("territory_save");
    if (s) p = JSON.parse(s);
} catch (err) { console.error(err); }

function save() {
    try { localStorage.setItem("territory_save", JSON.stringify(p)); } catch (e) {}
}

// Запуск при полной загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    initTabs();        
    initBattleUI();    
    initShopUI(); 
    initStatsUI(); // Инициализируем кнопки прокачки статов
    updateUI();        
});

// 1. НАВИГАЦИЯ ПО ВКЛАДКАМ
function initTabs() {
    var btnArena = document.getElementById("tab-arena");
    var btnShop = document.getElementById("tab-shop");
    var btnMap = document.getElementById("tab-map");
    var btnProfile = document.getElementById("tab-profile");

    var pageArena = document.getElementById("page-home");
    var pageShop = document.getElementById("page-shop");
    var pageMap = document.getElementById("page-map");
    var pageProfile = document.getElementById("page-profile");

    function switchPage(activeButton, activePage) {
        if (pageArena) pageArena.style.display = "none";
        if (pageShop) pageShop.style.display = "none";
        if (pageMap) pageMap.style.display = "none";
        if (pageProfile) pageProfile.style.display = "none";

        var allTabs = document.querySelectorAll(".tab");
        allTabs.forEach(function(tab) { tab.classList.remove("active"); });

        if (activePage) activePage.style.display = "block";
        if (activeButton) activeButton.classList.add("active");
        
        updateUI();
    }

    if (btnArena) { btnArena.addEventListener("click", function() { switchPage(btnArena, pageArena); }); }
    if (btnShop) { btnShop.addEventListener("click", function() { switchPage(btnShop, pageShop); }); }
    if (btnMap) { btnMap.addEventListener("click", function() { switchPage(btnMap, pageMap); }); }
    if (btnProfile) { btnProfile.addEventListener("click", function() { switchPage(btnProfile, pageProfile); }); }
}

// 2. БОЕВАЯ СИСТЕМА (С расчетом Критов и Уворотов)
function initBattleUI() {
    var allButtons = Array.from(document.querySelectorAll("button"));
    
    var zoneButtons = allButtons.filter(function(btn) {
        var txt = btn.innerText.trim();
        return txt === "Голова" || txt === "Корпус" || txt === "Ноги";
    });

    var attackBtns = zoneButtons.slice(0, 3);
    var blockBtns = zoneButtons.slice(3, 6);
    var turnBtn = document.getElementById("attack");

    var zones = ["head", "body", "legs"];
    var zoneText = { "head": "Голову", "body": "Корпус", "legs": "Ноги" };

    attackBtns.forEach(function(b, idx) {
        b.addEventListener("click", function() {
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selA = zones[idx];
        });
    });

    blockBtns.forEach(function(b, idx) {
        b.addEventListener("click", function() {
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selB = zones[idx];
        });
    });

    if (turnBtn) {
        turnBtn.addEventListener("click", function() {
            if (!selA || !selB) {
                showNotice("Выберите зоны атаки и защиты!");
                return;
            }

            var enemyA = zones[Math.floor(Math.random() * 3)];
            var enemyB = zones[Math.floor(Math.random() * 3)];
            
            var logs = [];
            
            // Расчет базового урона
            var basePlayerDmg = 15 + p.bonusDamage; 
            var baseEnemyDmg = 15 + (p.level * 2); // С каждым твоим уровнем хулиган чуть сильнее

            // Шансы на крит и уворот (зависят от статов персонажа)
            var critChance = p.strength * 3; // Сила 5 = 15% крита
            var dodgeChance = p.agility * 3; // Ловкость 5 = 15% уворота

            // --- ТВОЙ УДАР ПО ХУЛИГАНУ ---
            if (selA === enemyB) {
                logs.push(`🛡️ Вы ударили в <b>${zoneText[selA]}</b>, но Хулиган заблокировал удар.`);
            } else {
                var isCrit = Math.random() * 100 < critChance;
                var finalPlayerDmg = isCrit ? basePlayerDmg * 2 : basePlayerDmg;
                e.hp = Math.max(0, e.hp - finalPlayerDmg);
                
                if (isCrit) {
                    logs.push(`⚡💥 <b>КРИТИЧЕСКИЙ УДАР!</b> Вы жестко пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${finalPlayerDmg}.`);
                } else {
                    logs.push(`💥 Вы успешно пробили Хулигана in <b>${zoneText[selA]}</b>! Урон: -${finalPlayerDmg}.`);
                }
            }

            // --- УДАР ХУЛИГАНА ПО ТЕБЕ ---
            if (enemyA === selB) {
                logs.push(`🛡️ Хулиган метил в <b>${zoneText[enemyA]}</b>, но вы заблокировали его.`);
            } else {
                var isDodge = Math.random() * 100 < dodgeChance;
                if (isDodge) {
                    logs.push(`💨 <b>УВОРОТ!</b> Хулиган пытался пробить вас в <b>${zoneText[enemyA]}</b>, но вы технично уклонились!`);
                } else {
                    p.hp = Math.max(0, p.hp - baseEnemyDmg);
                    logs.push(`🥊 Хулиган нанес вам удар в <b>${zoneText[enemyA]}</b>. Урон: -${baseEnemyDmg}.`);
                }
            }

            var logBox = document.querySelector(".combat-log-text");
            if (logBox) {
                if (logBox.innerHTML.includes("Ожидание хода...")) logBox.innerHTML = "";
                logBox.innerHTML = logs.join("<br>") + "<br><hr style='border-color:#2a2a2a'><br>" + logBox.innerHTML;
            }

            // Конец боя
            if (p.hp <= 0 || e.hp <= 0) {
                turnBtn.disabled = true;
                if (p.hp <= 0 && e.hp <= 0) {
                    logBox.innerHTML = "<b>⚔️ Ничья! Оба упали без сил.</b><br>" + logBox.innerHTML;
                } else if (e.hp <= 0) {
                    var rewardCoins = 200 + (p.level * 20);
                    var rewardExp = 40; // Даем 40 опыта за победу
                    
                    p.coins += rewardCoins;
                    p.exp += rewardExp;
                    
                    logBox.innerHTML = `<b>🎉 Победа! Местный хулиган повержен. Награда: +${rewardCoins} монет, +${rewardExp} опыта!</b><br>` + logBox.innerHTML;
                    
                    // Проверяем поднятие уровня (Level Up)
                    if (p.exp >= p.maxExp) {
                        p.level += 1;
                        p.exp = p.exp - p.maxExp;
                        p.maxExp = Math.floor(p.maxExp * 1.3); // Следующий уровень требует больше опыта
                        p.freePoints += 3; // Даем 3 очка прокачки характеристик!
                        p.maxHp += 20; // Увеличиваем макс здоровье персонажа
                        logBox.innerHTML = `<b style="color: #f1c40f;">🌟 ПОЗДРАВЛЯЕМ! Вы получили ${p.level} уровень! Получено 3 очка характеристик.</b><br>` + logBox.innerHTML;
                    }
                } else {
                    logBox.innerHTML = "<b>💀 Поражение. Вас унесли в госпиталь. Восстановление...</b><br>" + logBox.innerHTML;
                }
                
                // Автоматическое воскрешение/сброс боя через 4 секунды
                setTimeout(function() {
                    p.hp = p.maxHp;
                    e.hp = e.maxHp + (p.level * 10); // Враг тоже растет в силе со временем
                    turnBtn.disabled = false;
                    if (logBox) logBox.innerHTML = "Ожидание хода...";
                    updateUI();
                    save();
                }, 4000);
            }

            selA = null; selB = null;
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            
            updateUI();
            save();
        });
    }
}

// 3. ЛОГИКА РЫНКА
function initShopUI() {
    var buyBrass = document.getElementById("buy-brass");
    var buyKnife = document.getElementById("buy-knife");

    if (buyBrass) {
        buyBrass.addEventListener("click", function() {
            if (p.coins >= 150) {
                p.coins -= 150;
                p.weapon = "Кастеты";
                p.bonusDamage = 5;
                showNotice("Вы купили Кастеты!");
                updateUI();
                save();
            } else {
                showNotice("Не хватает монет!");
            }
        });
    }

    if (buyKnife) {
        buyKnife.addEventListener("click", function() {
            if (p.coins >= 400) {
                p.coins -= 400;
                p.weapon = "Охотничий нож";
                p.bonusDamage = 12;
                showNotice("Вы купили Охотничий нож!");
                updateUI();
                save();
            } else {
                showNotice("Не хватает монет!");
            }
        });
    }
}

// 4. ПРОКАЧКА ХАРАКТЕРИСТИК (СТАТОВ)
function initStatsUI() {
    var addStr = document.getElementById("add-str");
    var addAgi = document.getElementById("add-agi");

    if (addStr) {
        addStr.addEventListener("click", function() {
            if (p.freePoints > 0) {
                p.freePoints--;
                p.strength++;
                updateUI();
                save();
