const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// 1. Инициализация персонажа в стиле старой "Территории"
let player = JSON.parse(localStorage.getItem("territory_player")) || {
  hp: 120,
  maxHp: 120,
  coins: 500,
  level: 1,
  power: 5,
  agility: 5,
  victories: 0
};

// Состояние текущего боя
let enemy = {
  name: "Ретивый Бродяга",
  hp: 100,
  maxHp: 100,
  power: 4
};

let selectedAttack = null;
let selectedBlock = null;

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem("territory_player", JSON.stringify(player));
}

// 2. Обновление интерфейса на экране
function render() {
  if ($("coins")) $("coins").textContent = player.coins;
  if ($("playerhp")) $("playerhp").textContent = `${player.hp}/${player.maxHp}`;
  if ($("enemyhp")) $("enemyhp").textContent = `${enemy.hp}/${enemy.maxHp}`;
  if ($("level")) $("level").textContent = `Уровень ${player.level} • Сила [${player.power}] Ловкость [${player.agility}]`;

  // Обновление полосок здоровья (если они есть в HTML)
  const pPhp = document.querySelector(".player-hp-bar");
  if (pPhp) pPhp.style.width = `${Math.max((player.hp / player.maxHp) * 100, 0)}%`;

  const pEhp = document.querySelector(".enemy-hp-bar");
  if (pEhp) pEhp.style.width = `${Math.max((enemy.hp / enemy.maxHp) * 100, 0)}%`;
}

// Вывод системных сообщений в лог боя
function addLog(text) {
  const logBox = $("battle-log"); // Ищет блок с id="battle-log"
  if (logBox) {
    const p = document.createElement("p");
    p.innerHTML = text;
    logBox.insertBefore(p, logBox.firstChild); // Новые сообщения сверху
  } else {
    console.log(text);
  }
}

/* 3. Логика выбора зон УДАРА и БЛОКА */

// Обработка кнопок Атаки (в HTML у кнопок должны быть классы .attack-zone и dataset.zone)
document.querySelectorAll(".attack-zone").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".attack-zone").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    selectedAttack = btn.dataset.zone; // например: 'head', 'torso', 'legs'
  });
});

// Обработка кнопок Блока (в HTML у кнопок должны быть классы .block-zone и dataset.zone)
document.querySelectorAll(".block-zone").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".block-zone").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    selectedBlock = btn.dataset.zone;
  });
});

/* 4. Пошаговый расчет размена ударами */
const attackBtn = $("attack");
if (attackBtn) {
  attackBtn.onclick = () => {
    if (!selectedAttack || !selectedBlock) {
      alert("❌ Выберите зону удара и зону блока!");
      return;
    }

    if (player.hp <= 0 || enemy.hp <= 0) {
      addLog("<b>Бой уже окончен! Начните новый.</b>");
      return;
    }

    const zones = ["head", "torso", "legs"];
    const zoneNames = { head: "Голову", torso: "Корпус", legs: "Ноги" };

    // Простой ИИ врага: выбирает зоны случайно
    const enemyAttack = zones[Math.floor(Math.random() * zones.length)];
    const enemyBlock = zones[Math.floor(Math.random() * zones.length)];

    let roundLog = `<b>--- Раунд ---</b><br>`;

    // ХОД ИГРОКА: Проверяем, угадал ли враг блок
    if (selectedAttack === enemyBlock) {
      roundLog += `🛡️ Вы ударили в ${zoneNames[selectedAttack]}, но ${enemy.name} заблокировал удар.<br>`;
    } else {
      let dmg = Math.floor(Math.random() * 5) + player.power;
      // Шанс критического удара (зависит от ловкости)
      if (Math.random() * 100 < player.agility * 2) {
        dmg = Math.floor(dmg * 1.5);
        roundLog += `💥 Критический удар! Вы пробили ${zoneNames[selectedAttack]} соперника на <b>-${dmg} HP</b>.<br>`;
      } else {
        roundLog += `⚔️ Вы нанесли удар в ${zoneNames[selectedAttack]} соперника на <b>-${dmg} HP</b>.<br>`;
      }
      enemy.hp = Math.max(enemy.hp - dmg, 0);
    }

    // ХОД ВРАГА: Проверяем, угадал ли игрок блок
    if (enemyAttack === selectedBlock) {
      roundLog += `🛡️ ${enemy.name} целился в ${zoneNames[enemyAttack]}, но вы успешно парировали удар.<br>`;
    } else {
      const enemyDmg = Math.floor(Math.random() * 4) + enemy.power;
      roundLog += `🩸 ${enemy.name} провел атаку в ваш ${zoneNames[enemyAttack]} на <b>-${enemyDmg} HP</b>.<br>`;
      player.hp = Math.max(player.hp - enemyDmg, 0);
    }

    addLog(roundLog);
    render();

    // Проверка исхода боя
    if (enemy.hp <= 0 && player.hp <= 0) {
      addLog("<br>💀 <b>Ничья! Оба бойца упали без сил.</b>");
      resetBattle();
    } else if (enemy.hp <= 0) {
      player.victories++;
      const reward = 50 + player.level * 10;
      player.coins += reward;
      addLog(`<br>🏆 <b>Победа! Вы повергли ${enemy.name}. Награда: +${reward} 🪙</b>`);
      
      if (player.victories % 3 === 0) {
        player.level++;
        player.power += 2;
        player.agility += 1;
        player.maxHp += 15;
        addLog(`<br>⬆️ <b>Новый уровень: ${player.level}! Характеристики повышены.</b>`);
      }
      resetBattle();
    } else if (player.hp <= 0) {
      addLog(`<br>☠️ <b>Вы проиграли... ${enemy.name} оказался сильнее. Вы отправлены в больницу.</b>`);
      resetBattle();
    }

    // Сбрасываем выбор кнопок для следующего раунда
    selectedAttack = null;
    selectedBlock = null;
    document.querySelectorAll(".attack-zone, .block-zone").forEach(x => x.classList.remove("active"));
    save();
  };
}

// Восстановление после боя
function resetBattle() {
  save();
  setTimeout(() => {
    player.hp = player.maxHp;
    enemy.hp = 100 + player.level * 15; // С каждым уровнем враги сильнее
    enemy.power = 4 + player.level;
    addLog("<br>🔄 <i>Вы восстановили силы. Готовы к новому бою!</i>");
    render();
  }, 4000);
}

/* Нижнее меню (вкладки) */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    tab.classList.add("active");
    addLog(`📍 Переход в локацию: ${tab.textContent.trim()}`);
  });
});

// Запуск при загрузке страницы
render();
