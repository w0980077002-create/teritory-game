// Состояние игры
var p = { hp: 120, maxHp: 120, coins: 1000, level: 1, freePoints: 0 };
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
    updateUI();        
});

// 1. НАВИГАЦИЯ ПО ВКЛАДКАМ (Прямая привязка по ID кнопок и экранов)
function initTabs() {
    // Находим кнопки навигации по их ID
    var btnArena = document.getElementById("tab-arena");
    var btnShop = document.getElementById("tab-shop");
    var btnMap = document.getElementById("tab-map");
    var btnProfile = document.getElementById("tab-profile");

    // Находим экраны игры по их ID
    var pageArena = document.getElementById("page-home");
    var pageShop = document.getElementById("page-shop");
    var pageMap = document.getElementById("page-map");
    var pageProfile = document.getElementById("page-profile");

    // Функция для переключения на конкретный экран
    function switchPage(activeButton, activePage) {
        // Прячем все экраны
        if (pageArena) pageArena.style.display = "none";
        if (pageShop) pageShop.style.display = "none";
        if (pageMap) pageMap.style.display = "none";
        if (pageProfile) pageProfile.style.display = "none";

        // Убираем подсветку со всех кнопок меню
        var allTabs = document.querySelectorAll(".tab");
        allTabs.forEach(function(tab) { tab.classList.remove("active"); });

        // Включаем нужный экран и подсвечиваем кнопку
        if (activePage) activePage.style.display = "block";
        if (activeButton) activeButton.classList.add("active");
    }

    // Привязываем клики (работает и на ПК, и на смартфонах)
    if (btnArena) { btnArena.addEventListener("click", function() { switchPage(btnArena, pageArena); }); }
    if (btnShop) { btnShop.addEventListener("click", function() { switchPage(btnShop, pageShop); }); }
    if (btnMap) { btnMap.addEventListener("click", function() { switchPage(btnMap, pageMap); }); }
    if (btnProfile) { btnProfile.addEventListener("click", function() { switchPage(btnProfile, pageProfile); }); }
}

// 2. БОЕВАЯ СИСТЕМА
function initBattleUI() {
    var allButtons = Array.from(document.querySelectorAll("button"));
    
    // Находим боевые кнопки по тексту на них
    var zoneButtons = allButtons.filter(function(btn) {
        var txt = btn.innerText.trim();
        return txt === "Голова" || txt === "Корпус" || txt === "Ноги";
    });

    // Первые 3 кнопки — АТАКА, вторые 3 — БЛОК
    var attackBtns = zoneButtons.slice(0, 3);
    var blockBtns = zoneButtons.slice(3, 6);
    
    // Ищем кнопку хода
    var turnBtn = document.getElementById("attack");

    var zones = ["head", "body", "legs"];
    var zoneText = { "head": "Голову", "body": "Корпус", "legs": "Ноги" };

    // Клик по кнопкам атаки
    attackBtns.forEach(function(b, idx) {
        b.addEventListener("click", function() {
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selA = zones[idx];
        });
    });

    // Клик по кнопкам блока
    blockBtns.forEach(function(b, idx) {
        b.addEventListener("click", function() {
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selB = zones[idx];
        });
    });

    // Нажатие кнопки "СДЕЛАТЬ ХОД"
    if (turnBtn) {
        turnBtn.addEventListener("click", function() {
            if (!selA || !selB) {
                showNotice("Выберите зоны атаки и защиты!");
                return;
            }

            var enemyA = zones[Math.floor(Math.random() * 3)];
            var enemyB = zones[Math.floor(Math.random() * 3)];
            
            var logs = [];
            var dmg = 15;

            // Урон по хулигану
            if (selA === enemyB) {
                logs.push(`🛡️ Вы ударили в <b>${zoneText[selA]}</b>, но Хулиган заблокировал удар.`);
            } else {
                e.hp = Math.max(0, e.hp - dmg);
                logs.push(`💥 Вы успешно пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${dmg}.`);
            }

            // Урон по игроку
            if (enemyA === selB) {
                logs.push(`🛡️ Хулиган метил в <b>${zoneText[enemyA]}</b>, но вы заблокировали его.`);
            } else {
                p.hp = Math.max(0, p.hp - dmg);
                logs.push(`🥊 Хулиган нанес вам удар в <b>${zoneText[enemyA]}</b>. Урон: -${dmg}.`);
            }

            // Вывод лога
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
                    p.coins += 1000;
                    logBox.innerHTML = "<b>🎉 Победа! Получено 1000 монет!</b><br>" + logBox.innerHTML;
                } else {
                    logBox.innerHTML = "<b>💀 Поражение. Вы отправлены в госпиталь.</b><br>" + logBox.innerHTML;
                }
                save();
            }

            // Сброс выбора кнопок
            selA = null; selB = null;
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            
            updateUI();
        });
    }
}

// 3. УВЕДОМЛЕНИЯ
function showNotice(t) {
    var n = document.getElementById("notice");
    if (!n) return;
    n.innerText = t;
    n.style.display = "block";
    setTimeout(function() { n.style.display = "none"; }, 3000);
}

// 4. ОБНОВЛЕНИЕ ЗДОРОВЬЯ И МОНЕТ НА ЭКРАНЕ
function updateUI() {
    var coinsEl = document.getElementById("coins");
    if (coinsEl) coinsEl.innerText = p.coins;

    var playerText = document.getElementById("hp-text-player");
    var enemyText = document.getElementById("hp-text-enemy");
    if (playerText) playerText.innerText = p.hp + "/" + p.maxHp;
    if (enemyText) enemyText.innerText = e.hp + "/" + e.maxHp;

    var playerFill = document.getElementById("hp-fill-player");
    var enemyFill = document.getElementById("hp-fill-enemy");
    if (playerFill) playerFill.style.width = ((p.hp / p.maxHp) * 100) + "%";
    if (enemyFill) enemyFill.style.width = ((e.hp / e.maxHp) * 100) + "%";
}
