window.onload = function() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (e) {
    console.log("Telegram API не найден");
  }

  // Базовый шаблон персонажа
  let defaultPlayer = {
    hp: 120,
    maxHp: 120,
    coins: 1000,
    level: 1,
    power: 5,
    agility: 5,
    victories: 0
  };

  let player = defaultPlayer;

  // Безопасная загрузка сохранений с исправлением старых багов (NaN)
  try {
    let saved = localStorage.getItem("territory_player");
    if (saved) {
      let parsed = JSON.parse(saved);
      // Если старое сохранение сломано или в нем нет HP, чиним его
      if (!parsed || typeof parsed.hp !== "number" || isNaN(parsed.hp)) {
        localStorage.clear(); // Стираем старый сломанный кэш кликера
        player = defaultPlayer;
      } else {
        player = parsed;
      }
    }
  } catch(e) {
    player = defaultPlayer;
  }

  let enemy = { name: "Уличный Боец", hp: 100, maxHp: 100, power: 4 };
  let selectedAttack = null;
  let selectedBlock = null;

  function save() {
    try {
      localStorage.setItem("territory_player", JSON.stringify(player));
    } catch(e) {}
  }

  function render() {
    // Двойная проверка, чтобы не выводить NaN
    if (isNaN(player.hp) || player.hp === undefined) player.hp = player.maxHp;
    if (isNaN(player.maxHp) || player.maxHp === undefined) player.maxHp = 120;

    if (document.getElementById("coins")) document.getElementById("coins").textContent = player.coins;
    if (document.getElementById("playerhp")) document.getElementById("playerhp").textContent = player.hp + "/" + player.maxHp;
    if (document.getElementById("enemyhp")) document.getElementById("enemyhp").textContent = enemy.hp + "/" + enemy.maxHp;
    if (document.getElementById("level")) document.getElementById("level").textContent = "Уровень " + player.level;

    let pPhp = document.querySelector(".player-hp-bar");
    if (pPhp) pPhp.style.width = Math.max((player.hp / player.maxHp) * 100, 0) + "%";

    let pEhp = document.querySelector(".enemy-hp-bar");
    if (pEhp) pEhp.style.width = Math.max((enemy.hp / enemy.maxHp) * 100, 0) + "%";
  }

  function addLog(text) {
    let logBox = document.getElementById("battle-log");
    if (logBox) {
      let p = document.createElement("p");
      p.innerHTML = text;
      logBox.insertBefore(p, logBox.firstChild);
    }
  }

  // Клик на зоны АТАКИ
  let attackButtons = document.querySelectorAll(".attack-zone");
  attackButtons.forEach(function(btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      attackButtons.forEach(function(x) { x.style.backgroundColor = "#27272e"; });
      btn.style.backgroundColor = "#e74c3c"; 
      selectedAttack = btn.getAttribute("data-zone");
    };
  });

  // Клик на зоны БЛОКА
  let blockButtons = document.querySelectorAll(".block-zone");
  blockButtons.forEach(function(btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      blockButtons.forEach(function(x) { x.style.backgroundColor = "#27272e"; });
      btn.style.backgroundColor = "#2ecc71"; 
      selectedBlock = btn.getAttribute("data-zone");
    };
  });

  // Логика кнопки «СДЕЛАТЬ ХОД»
  let attackBtn = document.getElementById("attack");
  if (attackBtn) {
    attackBtn.onclick = function() {
      if (!selectedAttack || !selectedBlock) {
        alert("Пожалуйста, выберите зону удара и зону блока перед ходом!");
        return;
      }

      if (player.hp <= 0 || enemy.hp <= 0) {
        alert("Бой окончен! Дождитесь восстановления сил.");
        return;
      }

      let zones = ["head", "torso", "legs"];
      let zoneNames = { head: "Голову", torso: "Корпус", legs: "Ноги" };

      let enemyAttack = zones[Math.floor(Math.random() * zones.length)];
      let enemyBlock = zones[Math.floor(Math.random() * zones.length)];

      let roundLog = "<b>--- Раунд ---</b><br>";

      // Наш удар
      if (selectedAttack === enemyBlock) {
        roundLog += "🛡️ Вы ударили в " + zoneNames[selectedAttack] + ", но враг заблокировал удар.<br>";
      } else {
        let dmg = Math.floor(Math.random() * 5) + player.power;
        roundLog += "⚔️ Вы нанесли удар в " + zoneNames[selectedAttack] + " на <b>-" + dmg + " HP</b>.<br>";
        enemy.hp = Math.max(enemy.hp - dmg, 0);
      }

      // Удар врага
      if (enemyAttack === selectedBlock) {
        roundLog += "🛡️ Враг метил в " + zoneNames[enemyAttack] + ", но вы отбили удар.<br>";
      } else {
        let enemyDmg = Math.floor(Math.random() * 4) + enemy.power;
        roundLog += "🩸 Враг попал вам в " + zoneNames[enemyAttack] + " на <b>-" + enemyDmg + " HP</b>.<br>";
        player.hp = Math.max(player.hp - enemyDmg, 0);
      }

      addLog(roundLog);
      render();

      // Финал боя
      if (enemy.hp <= 0) {
        player.victories++;
        player.coins += 200;
        addLog("<br>🏆 <b>Победа! Вы победили уличного бойца! Получено +200 🪙</b>");
        resetBattle();
      } else if (player.hp <= 0) {
        addLog("<br>☠️ <b>Вы проиграли. Персонаж отправлен отдыхать.</b>");
        resetBattle();
      }

      // Сброс выбора
      selectedAttack = null;
      selectedBlock = null;
      attackButtons.forEach(function(x) { x.style.backgroundColor = "#27272e"; });
      blockButtons.forEach(function(x) { x.style.backgroundColor = "#27272e"; });
      save();
    };
  }

  function resetBattle() {
    save();
    setTimeout(function() {
      player.hp = player.maxHp;
      enemy.hp = 100;
      let logBox = document.getElementById("battle-log");
      if (logBox) logBox.innerHTML = '<p class="system-msg">Ожидание вашего хода...</p>';
      render();
    }, 4000);
  }

  render();
};
