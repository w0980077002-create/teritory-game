// Проверяем наличие Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// 1. Инициализация персонажа в стиле оригинальной "Территории"
let player = JSON.parse(localStorage.getItem("territory_player")) || {
  hp: 120,
  maxHp: 120,
  coins: 1000,
  level: 1,
  power: 5,
  agility: 5,
  victories: 0
};

// Состояние текущего противника
let enemy = {
  name: "Уличный Боец",
  hp: 100,
  maxHp: 100,
  power: 4
};

// Переменные для хранения выбора игрока
let selectedAttack = null;
let selectedBlock = null;

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem("territory_player", JSON.stringify(player));
}

// 2. Обновление цифр и полосок здоровья на экране
function render() {
  if ($("coins")) $("coins").textContent = player.coins;
  if ($("playerhp")) $("playerhp").textContent = `${player.hp}/${player.maxHp}`;
  if ($("enemyhp")) $("enemyhp").textContent = `${enemy.hp}/${enemy.maxHp}`;
  if ($("level")) $("level").textContent = `Уровень ${player.level}`;

  // Обновление полосок здоровья
  const pPhp = document.querySelector(".player-hp-bar");
  if (pPhp) pPhp.style.width = `${Math.max((player.hp / player.maxHp) * 100, 0)}%`;

  const pEhp = document.querySelector(".enemy-hp-bar");
  if (pEhp) pEhp.style.width = `${Math.max((enemy.hp / enemy.maxHp) * 100, 0)}%`;
}

// Вывод сообщений в историю боя
function addLog(text) {
  const logBox = $("battle-log");
  if (logBox) {
    const p = document.createElement("p");
    p.innerHTML = text;
    logBox.insertBefore(p, logBox.firstChild); // Новые раунды всегда будут сверху
  }
}

/* 3. НАСТРОЙКА КНОПОК ВЫБОРА ЗОН */

// Кнопки атаки
document.querySelectorAll(".attack-zone").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll(".attack-zone").forEach(x => x.style.background = "#27272e");
    
    // Подсвечиваем выбранную кнопку красным цветом
    btn.style.background = "#e74c3c";
    selectedAttack = btn.getAttribute("data-zone");
  };
});

// Кнопки блока
document.querySelectorAll(".block-zone").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll(".block-zone").forEach(x => x.style.background = "#27272e");
    
    // Подсвечиваем выбранную кнопку зеленым цветом
    btn.style.background = "#2ecc71";
    selectedBlock = btn.getAttribute("data-zone");
  };
});

/* 4. РАСЧЕТ ХОДА ПРИ НАЖАТИИ «СДЕЛАТЬ ХОД» */
const attackBtn = $("attack");
if (attackBtn) {
  attackBtn.onclick = () => {
    // Если игрок забыл что-то выбрать
    if (!selectedAttack || !selectedBlock) {
      alert("Выберите куда атаковать и что блокировать!");
      return;
    }

    if (player.hp <= 0 || enemy.hp <= 0) {
      addLog("<b>Бой окончен. Подождите восстановления сил!</b>");
      return;
    }

    const zones = ["head", "torso", "legs"];
    const zoneNames = { head: "Голову", torso: "Корпус", legs: "Ноги" };

    // Компьютер выбирает зоны атаки и блока случайно
    const enemyAttack = zones[Math.floor(Math.random() * zones.length)];
    const enemyBlock = zones[Math.floor(Math.random() * zones.length)];

    let roundLog = `<b>--- Раунд ---</b><br>`;

    // ХОД ИГРОКА: проверяем, заблокировал ли враг
    if (selectedAttack === enemyBlock) {
      roundLog += `🛡️ Вы ударили в ${zoneNames[selectedAttack]}, но враг выставил блок.<br>`;
    } else {
      let dmg = Math.floor(Math.random() * 5) + player.power;
      // Шанс критического удара
      if (Math.random() * 100 < player.agility * 2) {
        dmg = Math.floor(dmg * 1.5);
        roundLog += `💥 Критический удар! Вы пробили ${zoneNames[selectedAttack]} врага на <b>-${dmg} HP</b>.<br>`;
      } else {
        roundLog += `⚔️ Вы нанесли удар в ${zoneNames[selectedAttack]} на <b>-${dmg} HP</b>.<br>`;
      }
      enemy.hp = Math.max(enemy.hp - dmg, 0);
    }

    // ХОД ВРАГА: проверяем, заблокировали ли вы
    if (enemyAttack === selectedBlock) {
      roundLog += `🛡️ Враг метил в ${zoneNames[enemyAttack]}, но вы заблокировали удар.<br>`;
    } else {
      const enemyDmg = Math.floor(Math.random() * 4) + enemy.power;
      roundLog += `🩸 Враг нанес вам удар в ${zoneNames[enemyAttack]} на <b>-${enemyDmg} HP</b>.<br>`;
      player.hp = Math.max(player.hp - enemyDmg, 0);
    }

    addLog(roundLog);
    render();

    // Проверка результатов поединка
    if (enemy.hp <= 0 && player.hp <= 0) {
      addLog("<br>💀 <b>Ничья! Оба бойца упали без сил.</b>");
      resetBattle();
    } else if (enemy.hp <= 0) {
      player.victories++;
      const reward = 150 + player.level * 50;
      player.coins += reward;
      addLog(`<br>🏆 <b>Победа! Противник повержен. Награда: +${reward} 🪙</b>`);
      
      // Повышение уровня за каждые 3 победы
      if (player.victories % 3 === 0) {
        player.level++;
        player.power += 2;
        player.maxHp += 15;
        addLog(`<br>⬆️ <b>Новый уровень: ${player.level}! Сила возросла.</b>`);
      }
      resetBattle();
    } else if (player.hp <= 0) {
      addLog(`<br>☠️ <b>Вы проиграли поединок и отправлены на восстановление...</b>`);
      resetBattle();
    }

    // Сбрасываем выбор для следующего раунда
    selectedAttack = null;
    selectedBlock = null;
    document.querySelectorAll(".attack-zone, .block-zone").forEach(x => x.style.background = "#27272e");
    save();
  };
}

// Восстановление здоровья для следующего поединка
function resetBattle() {
  save();
  setTimeout(() => {
    player.hp = player.maxHp;
    enemy.hp = 100 + player.level * 15; 
    enemy.power = 4 + player.level;
    
    // Очищаем старый лог и пишем новое приветствие
    const logBox = $("battle-log");
    if (logBox) logBox.innerHTML = '<p class="system-msg">Ожидание вашего хода...</p>';
    
    render();
  }, 4000); // Новая битва начнется через 4 секунды после окончания старой
}

/* Нижнее меню */
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    tab.classList.add("active");
    
    const page = tab.getAttribute("data-tab");
    addLog(`📍 Переход в режим: ${tab.textContent.trim()}`);
  };
});

// Самый первый запуск игры
render();
