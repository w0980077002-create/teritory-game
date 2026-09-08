window.onload = function() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (e) {}

  var playerHp = 120, playerMaxHp = 120, enemyHp = 100, enemyMaxHp = 100, coins = 1000;
  var level = 1, victories = 0, basePower = 5, agility = 5, weaponBonus = 0, freePoints = 0;
  var weaponName = "Кулаки", currentEnemyType = "thug", enemyName = "Местный хулиган", enemyPower = 4, enemyPrize = 200;
  var selectedAttack = null, selectedBlock = null;

  try {
    var saved = localStorage.getItem("territory_final_save_v1");
    if (saved) {
      var p = JSON.parse(saved);
      if (p && typeof p.basePower === "number") {
        playerHp = p.playerHp; playerMaxHp = p.playerMaxHp; coins = p.coins;
        level = p.level; victories = p.victories; basePower = p.basePower;
        agility = p.agility; weaponBonus = p.weaponBonus; weaponName = p.weaponName;
        freePoints = p.freePoints; enemyName = p.enemyName; enemyHp = p.enemyHp;
        enemyMaxHp = p.enemyMaxHp; enemyPower = p.enemyPower; enemyPrize = p.enemyPrize;
        currentEnemyType = p.currentEnemyType || "thug";
      }
    }
  } catch(e) {}

  function saveGame() {
    try {
      var data = {
        playerHp: playerHp, playerMaxHp: playerMaxHp, coins: coins, level: level, victories: victories,
        basePower: basePower, agility: agility, weaponBonus: weaponBonus, weaponName: weaponName,
        freePoints: freePoints, enemyName: enemyName, enemyHp: enemyHp, enemyMaxHp: enemyMaxHp,
        enemyPower: enemyPower, enemyPrize: enemyPrize, currentEnemyType: currentEnemyType
      };
      localStorage.setItem("territory_final_save_v1", JSON.stringify(data));
    } catch(e) {}
  }

  function showNotice(text) {
    var n = document.getElementById("notice");
    if (n) { n.textContent = text; n.style.display = "block"; setTimeout(function() { n.style.display = "none"; }, 2000); }
  }

  function updateUI() {
    if (document.getElementById("coins")) document.getElementById("coins").textContent = coins;
    if (document.getElementById("playerhp")) document.getElementById("playerhp").textContent = playerHp + "/" + playerMaxHp;
    if (document.getElementById("enemyhp")) document.getElementById("enemyhp").textContent = enemyHp + "/" + enemyMaxHp;
    if (document.getElementById("level")) document.getElementById("level").textContent = "Уровень " + level;
    if (document.getElementById("arena-title")) document.getElementById("arena-title").textContent = enemyName;

    var nameLabel = document.querySelector(".enemyname");
    if (nameLabel) nameLabel.innerHTML = "⚔️ Противник: <span>" + enemyHp + "/" + enemyMaxHp + "</span>";

    if (document.getElementById("prof-victories")) document.getElementById("prof-victories").textContent = victories;
    if (document.getElementById("prof-power")) document.getElementById("prof-power").textContent = basePower + " (+" + weaponBonus + ")";
    if (document.getElementById("prof-agility")) document.getElementById("prof-agility").textContent = agility;
    if (document.getElementById("prof-weapon")) document.getElementById("prof-weapon").textContent = weaponName;

    var ptsBox = document.getElementById("prof-points-box"), btnP = document.getElementById("up-power"), btnA = document.getElementById("up-agility");
    if (freePoints > 0) {
      if (ptsBox) ptsBox.style.display = "block";
      if (document.getElementById("prof-points")) document.getElementById("prof-points").textContent = freePoints;
      if (btnP) btnP.style.display = "block"; if (btnA) btnA.style.display = "block";
    } else {
      if (ptsBox) ptsBox.style.display = "none"; if (btnP) btnP.style.display = "none"; if (btnA) btnA.style.display = "none";
    }

    var pPhp = document.querySelector(".player-hp-bar"); if (pPhp) pPhp.style.width = ((playerHp / playerMaxHp) * 100) + "%";
    var pEhp = document.querySelector(".enemy-hp-bar"); if (pEhp) pEhp.style.width = ((enemyHp / enemyMaxHp) * 100) + "%";
  }

  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function(tab) {
    tab.onclick = function() {
      tabs.forEach(function(x) { x.classList.remove("active"); }); tab.classList.add("active");
      document.querySelectorAll(".game-page").forEach(function(page) { page.style.display = "none"; });
      var targetPage = "page-" + tab.getAttribute("data-tab");
      if (document.getElementById(targetPage)) document.getElementById(targetPage).style.display = "block";
      updateUI();
    };
  });

  var enemySelectBtns = document.querySelectorAll(".select-enemy");
  enemySelectBtns.forEach(function(btn) {
    btn.onclick = function() {
      var type = btn.getAttribute("data-type"); currentEnemyType = type;
      if (type === "rat") { enemyName = "Бродячая крыса"; enemyMaxHp = 40; enemyHp = 40; enemyPower = 2; enemyPrize = 60; }
      else if (type === "thug") { enemyName = "Местный хулиган"; enemyMaxHp = 100; enemyHp = 100; enemyPower = 4; enemyPrize = 200; }
      else if (type === "boss") { enemyName = "Главарь промзоны [БОСС]"; enemyMaxHp = 220; enemyHp = 220; enemyPower = 9; enemyPrize = 600; }
      saveGame(); updateUI();
      tabs.forEach(function(x) { x.classList.remove("active"); });
      document.querySelector("[data-tab='home']").classList.add("active");
      document.querySelectorAll(".game-page").forEach(function(p) { p.style.display = "none"; });
      document.getElementById("page-home").style.display = "block";
      var logBox = document.getElementById("battle-log");
      if (logBox) logBox.innerHTML = "<p>Вы выследили новую цель: " + enemyName + ". Бой начался!</p>";
      showNotice("🎯 Цель выбрана!");
    };
  });

  var attackBtns = document.querySelectorAll(".attack-zone");
  attackBtns.forEach(function(btn) {
    btn.onclick = function() { attackBtns.forEach(function(x) { x.style.backgroundColor = "#27272e"; }); btn.style.backgroundColor = "#e74c3c"; selectedAttack = btn.getAttribute("data-zone"); };
  });

  var blockBtns = document.querySelectorAll(".block-zone");
  blockBtns.forEach(function(btn) {
    btn.onclick = function() { blockBtns.forEach(function(x) { x.style.backgroundColor = "#27272e"; }); btn.style.backgroundColor = "#2ecc71"; selectedBlock = btn.getAttribute("data-zone"); };
  });

  document.getElementById("attack").onclick = function() {
    if (!selectedAttack || !selectedBlock) { alert("Выберите зоны Атаки и Блока!"); return; }
    if (playerHp <= 0 || enemyHp <= 0) { alert("Поединок завершен!"); return; }

    var zones = ["head", "torso", "legs"], zoneNames = { head: "Голову", torso: "Корпус", legs: "Ноги" };
    var enemyAttack = zones[Math.floor(Math.random() * zones.length)], enemyBlock = zones[Math.floor(Math.random() * zones.length)];
    var logText = "<b>--- Раунд ---</b><br>";

    if (selectedAttack === enemyBlock) { logText += "🛡️ Враг заблокировал ваш удар.<br>"; }
    else {
      var dmg = Math.floor(Math.random() * 4) + basePower + weaponBonus;
      if (Math.random() * 100 < (agility * 2.5)) { dmg = Math.floor(dmg * 1.5); logText += "💥 Крит! Пробита " + zoneNames[selectedAttack] + " на <b>-" + dmg + " HP</b>.<br>"; }
      else { logText += "⚔️ Вы ударили в " + zoneNames[selectedAttack] + " на <b>-" + dmg + " HP</b>.<br>"; }
      enemyHp = Math.max(enemyHp - dmg, 0);
    }

    if (enemyAttack === selectedBlock) { logText += "🛡️ Вы заблокировали удар противника.<br>"; }
    else {
      var finalEnemyDmg = Math.floor(Math.random() * 4) + enemyPower;
      playerHp = Math.max(playerHp - finalEnemyDmg, 0);
      logText += "🩸 Враг провел атаку в " + zoneNames[enemyAttack] + " на <b>-" + finalEnemyDmg + " HP</b>.<br>";
    }

    var p = document.createElement("p"); p.innerHTML = logText;
    var logBox = document.getElementById("battle-log"); if (logBox) logBox.insertBefore(p, logBox.firstChild);
    updateUI();

    if (enemyHp <= 0) {
      victories++; coins += enemyPrize;
      var p = document.createElement("p"); p.innerHTML = "<br>🏆 <b>Победа! Получено +" + enemyPrize + " 🪙</b>"; if (logBox) logBox.insertBefore(p, logBox.firstChild);
      if (victories % 3 === 0) { level++; freePoints += 3; playerMaxHp += 15; var p2 = document.createElement("p"); p2.innerHTML = "<br>⬆️ <b>Новый Уровень: " + level + "! Получено 3 очка прокачки.</b>"; if (logBox) logBox.insertBefore(p2, logBox.firstChild); }
      autoResetBattle();
    } else if (playerHp <= 0) {
      var p = document.createElement("p"); p.innerHTML = "<br>☠️ <b>Вы проиграли этот бой. Восстановление...</b>"; if (logBox) logBox.insertBefore(p, logBox.firstChild);
      autoResetBattle();
    }
    selectedAttack = null; selectedBlock = null;
    attackBtns.forEach(function(x) { x.style.backgroundColor = "#27272e"; }); blockBtns.forEach(function(x) { x.style.backgroundColor = "#27272e"; });
    saveGame();
  };

  function autoResetBattle() {
    saveGame();
    setTimeout(function() {
      playerHp = playerMaxHp;
      if (currentEnemyType === "rat") enemyHp = 40; else if (currentEnemyType === "thug") enemyHp = 100; else if (currentEnemyType === "boss") enemyHp = 220;
      var logBox = document.getElementById("battle-log"); if (logBox) logBox.innerHTML = "<p>Ожидание вашего хода...</p>";
      updateUI();
    }, 3500);
  }

  document.getElementById("buy-knuckles").onclick = function() {
    if (coins >= 500) { coins -= 500; weaponName = "Кожаные кастеты"; weaponBonus = 3; saveGame(); updateUI(); showNotice("🥊 Кастеты куплены!"); }
    else { showNotice("❌ Недостаточно монет!"); }
  };

  document.getElementById("buy-knife").onclick = function() {
    if (coins >= 1200) { coins -= 1200; weaponName = "Охотничий нож"; weaponBonus = 8; saveGame(); updateUI(); showNotice("🔪 Нож куплен!"); }
    else { showNotice("❌ Недостаточно монет!"); }
  };

  document.getElementById("up-power").onclick = function() { if (freePoints > 0) { freePoints--; basePower++; saveGame(); updateUI(); } };
