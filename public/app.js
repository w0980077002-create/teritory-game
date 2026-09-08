// Состояние игры
var p = { 
    hp: 120, maxHp: 120, coins: 1000, level: 1, exp: 0, maxExp: 100,
    weapon: "Кулаки", bonusDamage: 0, strength: 5, agility: 5, freePoints: 0
};
var e = { name: "Местный хулиган", hp: 100, maxHp: 100 };

var selA = null; // Выбранная атака
var selB = null; // Выбранный блок

// Загрузка сохранения
try {
    var s = localStorage.getItem("territory_save");
    if (s) p = JSON.parse(s);
} catch (err) {}

function save() {
    try { localStorage.setItem("territory_save", JSON.stringify(p)); } catch (e) {}
}

document.addEventListener("DOMContentLoaded", function() {
    // === 1. ПРЯМОЕ ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ===
    var tArena = document.getElementById("tab-arena");
    var tShop = document.getElementById("tab-shop");
    var tMap = document.getElementById("tab-map");
    var tProfile = document.getElementById("tab-profile");

    var pArena = document.getElementById("page-home");
    var pShop = document.getElementById("page-shop");
    var pMap = document.getElementById("page-map");
    var pProfile = document.getElementById("page-profile");

    function showPage(tab, page) {
        if(pArena) pArena.style.display = "none";
        if(pShop) pShop.style.display = "none";
        if(pMap) pMap.style.display = "none";
        if(pProfile) pProfile.style.display = "none";
        
        if(tArena) tArena.classList.remove("active");
        if(tShop) tShop.classList.remove("active");
        if(tMap) tMap.classList.remove("active");
        if(tProfile) tProfile.classList.remove("active");

        if(page) page.style.display = "block";
        if(tab) tab.classList.add("active");
        updateUI();
    }

    if(tArena) tArena.addEventListener("click", function() { showPage(tArena, pArena); });
    if(tShop) tShop.addEventListener("click", function() { showPage(tShop, pShop); });
    if(tMap) tMap.addEventListener("click", function() { showPage(tMap, pMap); });
    if(tProfile) tProfile.addEventListener("click", function() { showPage(tProfile, pProfile); });

    // === 2. ВЫБОР БОЕВЫХ ЗОН ПО ИХ ID ===
    var attHead = document.getElementById("btn-att-head");
    var attBody = document.getElementById("btn-att-body");
    var attLegs = document.getElementById("btn-att-legs");

    var blkHead = document.getElementById("btn-blk-head");
    var blkBody = document.getElementById("btn-blk-body");
    var blkLegs = document.getElementById("btn-blk-legs");

    function clearAtt() {
        if(attHead) attHead.classList.remove("zone-btn-active");
        if(attBody) attBody.classList.remove("zone-btn-active");
        if(attLegs) attLegs.classList.remove("zone-btn-active");
    }
    function clearBlk() {
        if(blkHead) blkHead.classList.remove("zone-btn-active");
        if(blkBody) blkBody.classList.remove("zone-btn-active");
        if(blkLegs) blkLegs.classList.remove("zone-btn-active");
    }

    if(attHead) attHead.addEventListener("click", function() { clearAtt(); attHead.classList.add("zone-btn-active"); selA = "head"; });
    if(attBody) attBody.addEventListener("click", function() { clearAtt(); attBody.classList.add("zone-btn-active"); selA = "body"; });
    if(attLegs) attLegs.addEventListener("click", function() { clearAtt(); attLegs.classList.add("zone-btn-active"); selA = "legs"; });

    if(blkHead) blkHead.addEventListener("click", function() { clearBlk(); blkHead.classList.add("zone-btn-active"); selB = "head"; });
    if(blkBody) blkBody.addEventListener("click", function() { clearBlk(); blkBody.classList.add("zone-btn-active"); selB = "body"; });
    if(blkLegs) blkLegs.addEventListener("click", function() { clearBlk(); blkLegs.classList.add("zone-btn-active"); selB = "legs"; });

    // === 3. КНОПКА СДЕЛАТЬ ХОД ===
    var turnBtn = document.getElementById("attack");
    if (turnBtn) {
        turnBtn.addEventListener("click", function() {
            if (!selA || !selB) {
                showNotice("Выберите зоны атаки и защиты!");
                return;
            }

            var zones = ["head", "body", "legs"];
            var zoneText = { "head": "Голову", "body": "Корпус", "legs": "Ноги" };
            var enemyA = zones[Math.floor(Math.random() * 3)];
            var enemyB = zones[Math.floor(Math.random() * 3)];
            
            var logs = [];
            var dmg = 15 + p.bonusDamage; 
            var baseEnemyDmg = 15 + (p.level * 2);

            // Наш удар
            if (selA === enemyB) {
                logs.push(`🛡️ Вы ударили в <b>${zoneText[selA]}</b>, но Хулиган заблокировал удар.`);
            } else {
                var isCrit = (Math.random() * 100) < (p.strength * 3);
                var finalPlayerDmg = isCrit ? dmg * 2 : dmg;
                e.hp = Math.max(0, e.hp - finalPlayerDmg);
                if (isCrit) logs.push(`⚡💥 <b>КРИТ!</b> Вы пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${finalPlayerDmg}.`);
                else logs.push(`💥 Вы успешно пробили Хулигана в <b>${zoneText[selA]}</b>! Урон: -${finalPlayerDmg}.`);
            }

            // Удар хулигана
            if (enemyA === selB) {
                logs.push(`🛡️ Хулиган метил в <b>${zoneText[enemyA]}</b>, но вы заблокировали его.`);
            } else {
                var isDodge = (Math.random() * 100) < (p.agility * 3);
                if (isDodge) logs.push(`💨 <b>УВОРОТ!</b> Вы уклонились от удара в <b>${zoneText[enemyA]}</b>!`);
                else {
                    p.hp = Math.max(0, p.hp - baseEnemyDmg);
                    logs.push(`🥊 Хулиган нанес вам удар в <b>${zoneText[enemyA]}</b>. Урон: -${baseEnemyDmg}.`);
                }
            }

            var logBox = document.querySelector(".combat-log-text");
            if (logBox) {
                if (logBox.innerHTML.includes("Ожидание хода...")) logBox.innerHTML = "";
                logBox.innerHTML = logs.join("<br>") + "<br><hr style='border-color:#2a2a2a'><br>" + logBox.innerHTML;
            }

            // Проверка смерти
            if (p.hp <= 0 || e.hp <= 0) {
                turnBtn.disabled = true;
                if (p.hp <= 0 && e.hp <= 0) logBox.innerHTML = "<b>⚔️ Ничья!</b><br>" + logBox.innerHTML;
                else if (e.hp <= 0) {
                    p.coins += (200 + p.level * 20); p.exp += 40;
                    logBox.innerHTML = "<b>🎉 Победа! Награда получена!</b><br>" + logBox.innerHTML;
                    if (p.exp >= p.maxExp) {
                        p.level += 1; p.exp -= p.maxExp; p.maxExp = Math.floor(p.maxExp * 1.3);
                        p.freePoints += 3; p.maxHp += 20;
                        logBox.innerHTML = `<b style="color: #f1c40f;">🌟 ЛЕВЕЛ АП! Вы получили ${p.level} уровень!</b><br>` + logBox.innerHTML;
                    }
                } else logBox.innerHTML = "<b>💀 Поражение. Восстановление...</b><br>" + logBox.innerHTML;
                
                setTimeout(function() {
                    p.hp = p.maxHp; e.hp = e.maxHp + (p.level * 10);
                    turnBtn.disabled = false;
                    if (logBox) logBox.innerHTML = "Ожидание хода...";
                    updateUI(); save();
                }, 4000);
            }

            selA = null; selB = null;
            clearAtt(); clearBlk();
            updateUI(); save();
        });
    }

    // === 4. ЛОГИКА ОРУЖЕЙНОЙ ЛАВКИ ===
    var buyBrass = document.getElementById("buy-brass");
    var buyKnife = document.getElementById("buy-knife");

    if (buyBrass) {
        buyBrass.addEventListener("click", function() {
            if (p.coins >= 150) { p.coins -= 150; p.weapon = "Кастеты"; p.bonusDamage = 5; showNotice("Куплены Кастеты!"); updateUI(); save(); }
            else showNotice("Не хватает монет!");
        });
    }
    if (buyKnife) {
        buyKnife.addEventListener("click", function() {
            if (p.coins >= 400) { p.coins -= 400; p.weapon = "Охотничий нож"; p.bonusDamage = 12; showNotice("Куплен Нож!"); updateUI(); save(); }
            else showNotice("Не хватает монет!");
        });
    }

    // === 5. ПРОКАЧКА ХАРАКТЕРИСТИК ===
    var addStr = document.getElementById("add-str");
    var addAgi = document.getElementById("add-agi");

    if (addStr) { addStr.addEventListener("click", function() { if (p.freePoints > 0) { p.freePoints--; p.strength++; updateUI(); save(); } }); }
    if (addAgi) { addAgi.addEventListener("click", function() { if (p.freePoints > 0) { p.freePoints--; p.agility++; updateUI(); save(); } }); }

    updateUI();
});

function showNotice(t) {
    var n = document.getElementById("notice");
    if (!n) return;
    n.innerText = t; n.style.display = "block";
    setTimeout(function() { n.style.display = "none"; }, 2000);
}

function updateUI() {
    var coinsEl = document.getElementById("coins"); if (coinsEl) coinsEl.innerText = p.coins;
    var lvlEl = document.getElementById("header-level"); if (lvlEl) lvlEl.innerText = "Уровень " + p.level;

    var pTxt = document.getElementById("hp-text-player"); if (pTxt) pTxt.innerText = p.hp + "/" + p.maxHp;
    var eTxt = document.getElementById("hp-text-enemy"); if (eTxt) eTxt.innerText = e.hp + "/" + e.maxHp;

    var pFill = document.getElementById("hp-fill-player"); if (pFill) pFill.style.width = ((p.hp / p.maxHp) * 100) + "%";
    var eFill = document.getElementById("hp-fill-enemy"); if (eFill) eFill.style.width = ((e.hp / e.maxHp) * 100) + "%";

    var prLvl = document.getElementById("prof-level"); if (prLvl) prLvl.innerText = p.level;
    var prWpn = document.getElementById("prof-weapon"); if (prWpn) prWpn.innerText = p.weapon;
    var prDmg = document.getElementById("prof-damage"); if (prDmg) prDmg.innerText = (15 + p.bonusDamage);
    var prMhp = document.getElementById("prof-maxhp"); if (prMhp) prMhp.innerText = p.maxHp + " HP";
    var prStr = document.getElementById("prof-str"); if (prStr) prStr.innerText = p.strength;
