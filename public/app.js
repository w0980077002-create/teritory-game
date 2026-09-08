// Состояние персонажа и врага
var p = { hp: 120, maxHp: 120, coins: 1000, level: 1, freePoints: 0 };
var e = { name: "Местный хулиган", hp: 100, maxHp: 100 };

var selA = null; // Выбранная атака
var selB = null; // Выбранный блок

// Загрузка сохранения из localStorage при старте
try {
    var s = localStorage.getItem("territory_save");
    if (s) p = JSON.parse(s);
} catch (err) { console.error(err); }

function save() {
    try { localStorage.setItem("territory_save", JSON.stringify(p)); } catch (e) {}
}

// Запуск при полной загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    initTabs();        // Навигация по вкладкам
    initBattleUI();    // Логика боевых кнопок
    updateUI();        // Обновляем текст и полоски на старте
});

// 1. НАВИГАЦИЯ ПО ВКЛАДКАМ
function initTabs() {
    var tabs = document.querySelectorAll(".tab");
    // Находим все экраны игры по их ID
    var screens = [
        document.getElementById("page-home"),    // Арена
        document.getElementById("page-map"),     // Районы
        document.getElementById("page-shop"),    // Рынок
        document.getElementById("page-profile")  // Персонаж
    ];

    tabs.forEach(function(t, idx) {
        t.onclick = function() {
            tabs.forEach(tab => tab.classList.remove("active"));
            t.classList.add("active");
            
            screens.forEach(scr => {
                if (scr) scr.style.display = "none";
            });
            if (screens[idx]) screens[idx].style.display = "block";
        };
    });
}

// 2. БОЕВАЯ СИСТЕМА
function initBattleUI() {
    // Находим все блоки выбора зон
    var powersBlocks = document.querySelectorAll(".powers");
    if (powersBlocks.length < 2) {
        console.error("Не найдены блоки .powers для Атаки и Блока!");
        return;
    }

    // Первые три кнопки — это АТАКА, вторые три — БЛОК
    var attackBtns = powersBlocks[0].querySelectorAll("button");
    var blockBtns = powersBlocks[1].querySelectorAll("button");
    var turnBtn = document.getElementById("attack"); // Желтая кнопка "СДЕЛАТЬ ХОД"

    var zones = ["head", "body", "legs"];
    var zoneText = { "head": "Голову", "body": "Корпус", "legs": "Ноги" };

    // Клик по кнопкам АТАКИ
    attackBtns.forEach(function(b, idx) {
        b.onclick = function() {
            attackBtns.forEach(btn => btn.classList.remove("zone-btn-active"));
            b.classList.add("zone-btn-active");
            selA = zones[idx];
            console.log("Игрок выбрал атаку в:", selA);
        };
    });

    // Клик по кнопкам БЛОКА
    blockBtns.forEach(function(b, idx) {
        b.onclick = function() {
            blockBtns.forEach(btn => btn.classList.remove("zone-btn-active"));
            b.classList.add("zone-btn-active");
            selB = zones[idx];
            console.log("Игрок выбрал блок:", selB);
        };
    });

    // Нажатие кнопки "СДЕЛАТЬ ХОД"
    if (turnBtn) {
        turnBtn.onclick = function() {
            if (!selA || !selB) {
                showNotice("Выберите зоны атаки и защиты!");
                return;
            }

            // Рандомный выбор бота
            var enemyA = zones[Math.floor(Math.random() * 3)];
            var enemyB = zones[Math.floor(Math.random() * 3)];
            
            var logs = [];
            var dmg = 15;

            // Считаем урон по хулигану
            if (selA === enemyB) {
                logs.push(`🛡️ Вы ударили в <b>${zoneText[selA]}</b>, но Хулиган заблокировал удар.`);
            } else {
                e.hp = Math.max(0, e.hp - dmg);
                logs.push(`💥 Вы успешно пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${dmg}.`);
            }

            // Считаем урон по игроку
            if (enemyA === selB) {
                logs.push(`🛡️ Хулиган метил в <b>${zoneText[enemyA]}</b>, но вы заблокировали его.`);
            } else {
                p.hp = Math.max(0, p.hp - dmg);
                logs.push(`🥊 Хулиган нанес вам удар в <b>${zoneText[enemyA]}</b>. Урон: -${dmg}.`);
            }

            // Вывод лога в блок истории боя
            var logBox = document.querySelector(".log-container div") || document.querySelector(".log-container");
            if (logBox) {
                if (logBox.innerHTML.includes("Ожидание хода...")) logBox.innerHTML = "";
                logBox.innerHTML = logs.join("<br>") + "<br><hr style='border-color:#2a2a2a'><br>" + logBox.innerHTML;
            }

            // Проверка исхода боя
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

            // Сброс выбора для следующего раунда
            selA = null; selB = null;
            attackBtns.forEach(btn => btn.classList.remove("zone-btn-active"));
            blockBtns.forEach(btn => btn.classList.remove("zone-btn-active"));
            
            updateUI();
        };
    }
}

// 3. УВЕДОМЛЕНИЯ (.notice)
function showNotice(t) {
    var n = document.getElementById("notice");
    if (!n) return;
    n.innerText = t;
    n.style.display = "block";
    setTimeout(function() { n.style.display = "none"; }, 3000);
}

// 4. ОБНОВЛЕНИЕ ЗДОРОВЬЯ И МОНЕТ НА ЭКРАНЕ
function updateUI() {
    // Обновляем золото в шапке
    var coinsEl = document.getElementById("coins");
    if (coinsEl) coinsEl.innerText = p.coins;

    // Обновляем текстовые показатели HP
    var playerText = document.getElementById("hp-text-player");
    var enemyText = document.getElementById("hp-text-enemy");
    
    if (playerText) playerText.innerText = p.hp + "/" + p.maxHp;
    if (enemyText) enemyText.innerText = e.hp + "/" + e.maxHp;

    // Изменяем ширину графических полосок
    var playerFill = document.getElementById("hp-fill-player");
    var enemyFill = document.getElementById("hp-fill-enemy");

    if (playerFill) {
        var playerPct = (p.hp / p.maxHp) * 100;
        playerFill.style.width = playerPct + "%";
    }
    
    if (enemyFill) {
        var enemyPct = (e.hp / e.maxHp) * 100;
        enemyFill.style.width = enemyPct + "%";
    }
}
