// --- САМОДЕЛЬНЫЙ ПЕРЕХВАТЧИК ОШИБОК ДЛЯ ТЕЛЕФОНА ---
window.onerror = function(message, source, lineno, colno, error) {
    var logBox = document.querySelector(".log-container div") || document.querySelector(".log-container");
    if (logBox) {
        logBox.innerHTML = `<b style="color: #e74c3c;">🔴 Ошибка JS (Строка ${lineno}): ${message}</b><br>` + logBox.innerHTML;
    } else {
        alert(`Ошибка на строке ${lineno}: ${message}`);
    }
    return false;
};

// Состояние игры (точно по твоей структуре)
var p = { hp: 120, maxHp: 120, coins: 1000, level: 1, freePoints: 0 };
var e = { name: "Местный хулиган", hp: 100, maxHp: 100 };

var selA = null; // Выбранная атака
var selB = null; // Выбранный блок

// Загрузка сохранения
try {
    var s = localStorage.getItem("territory_save");
    if (s) p = JSON.parse(s);
} catch (err) { console.error(err); }

function save() {
    try { localStorage.setItem("territory_save", JSON.stringify(p)); } catch (e) {}
}

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    initTabs();        
    initBattleUI();    
    updateUI();        
});

// 1. НАВИГАЦИЯ ПО ВКЛАДКАМ
function initTabs() {
    var tabs = document.querySelectorAll(".tab");
    var screens = [
        document.getElementById("page-home"),    
        document.getElementById("page-map"),     
        document.getElementById("page-shop"),    
        document.getElementById("page-profile")  
    ];

    tabs.forEach(function(t, idx) {
        t.onclick = function() {
            tabs.forEach(function(tab) { tab.classList.remove("active"); });
            t.classList.add("active");
            
            screens.forEach(function(scr) {
                if (scr) scr.style.display = "none";
            });
            if (screens[idx]) screens[idx].style.display = "block";
        };
    });
}

// 2. БОЕВАЯ СИСТЕМА (Максимально безопасный поиск кнопок)
function initBattleUI() {
    // Чтобы код не падал, если структура .powers сложная, находим кнопки напрямую по их тексту!
    var allButtons = Array.from(document.querySelectorAll("button"));
    
    // Находим кнопки, текст которых равен "Голова", "Корпус" или "Ноги"
    var zoneButtons = allButtons.filter(function(btn) {
        var txt = btn.innerText.trim();
        return txt === "Голова" || txt === "Корпус" || txt === "Ноги";
    });

    // Если кнопок меньше 6, значит HTML еще не до конца загрузился или имена другие
    if (zoneButtons.length < 6) {
        console.log("Найдено кнопок зон: " + zoneButtons.length);
    }

    // Первые 3 кнопки — это КУДА АТАКУЕМ, вторые 3 — ЧТО БЛОКИРУЕМ
    var attackBtns = zoneButtons.slice(0, 3);
    var blockBtns = zoneButtons.slice(3, 6);
    
    // Ищем кнопку "СДЕЛАТЬ ХОД" по ID или по тексту
    var turnBtn = document.getElementById("attack") || allButtons.find(function(b) { 
        return b.innerText.includes("СДЕЛАТЬ ХОД"); 
    });

    var zones = ["head", "body", "legs"];
    var zoneText = { "head": "Голову", "body": "Корпус", "legs": "Ноги" };

    // Навешиваем клики на АТАКУ
    attackBtns.forEach(function(b, idx) {
        b.onclick = function() {
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selA = zones[idx];
        };
    });

    // Навешиваем клики на БЛОК
    blockBtns.forEach(function(b, idx) {
        b.onclick = function() {
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            b.classList.add("zone-btn-active");
            selB = zones[idx];
        };
    });

    // Логика кнопки ХОДА
    if (turnBtn) {
        turnBtn.onclick = function() {
            if (!selA || !selB) {
                showNotice("Выберите зоны атаки и защиты!");
                return;
            }

            var enemyA = zones[Math.floor(Math.random() * 3)];
            var enemyB = zones[Math.floor(Math.random() * 3)];
            
            var logs = [];
            var dmg = 15;

            if (selA === enemyB) {
                logs.push(`🛡️ Вы ударили в <b>${zoneText[selA]}</b>, но Хулиган заблокировал удар.`);
            } else {
                e.hp = Math.max(0, e.hp - dmg);
                logs.push(`💥 Вы успешно пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${dmg}.`);
            }

            if (enemyA === selB) {
                logs.push(`🛡️ Хулиган метил в <b>${zoneText[enemyA]}</b>, но вы заблокировали его.`);
            } else {
                p.hp = Math.max(0, p.hp - dmg);
                logs.push(`🥊 Хулиган нанес вам удар in <b>${zoneText[enemyA]}</b>. Урон: -${dmg}.`);
            }

            // Выводим текст боя
            var logBox = document.querySelector(".log-container div") || document.querySelector(".log-container");
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

            selA = null; selB = null;
            attackBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            blockBtns.forEach(function(btn) { btn.classList.remove("zone-btn-active"); });
            
            updateUI();
        };
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

// 4. ОБНОВЛЕНИЕ ЭКРАНА
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
