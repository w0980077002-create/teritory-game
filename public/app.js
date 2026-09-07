const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

let player = JSON.parse(localStorage.getItem("territory_player")) || {
  coins: 1000,
  diamonds: 50,
  energy: 100,
  level: 1,
  power: 10,
  victories: 0
};

let enemyHp = 100;
let selectedDamage = 10;

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(
    "territory_player",
    JSON.stringify(player)
  );
}

function render() {
  if ($("coins")) $("coins").textContent = player.coins;
  if ($("diamonds")) $("diamonds").textContent = player.diamonds;
  if ($("energy")) $("energy").textContent = player.energy;

  if ($("level")) {
    $("level").textContent =
      `Уровень ${player.level} • Сила ${player.power}`;
  }

  if ($("enemyhp")) {
    $("enemyhp").textContent = enemyHp;
  }

  const hp = document.querySelector(".hp-bar");

  if (hp) {
    hp.style.width = `${Math.max(enemyHp, 0)}%`;
  }
}

function notification(text) {
  const n = $("notice");

  if (!n) {
    alert(text);
    return;
  }

  n.textContent = text;
  n.style.display = "block";

  setTimeout(() => {
    n.style.display = "none";
  }, 2500);
}

/* Выбор оружия */

document.querySelectorAll(".skill").forEach(skill => {

  skill.addEventListener("click", () => {

    document
      .querySelectorAll(".skill")
      .forEach(x => x.classList.remove("active"));

    skill.classList.add("active");

    const damage =
      Number(skill.dataset.damage) ||
      Number(skill.dataset.dmg) ||
      10;

    selectedDamage = damage;

    if (skill.dataset.name) {
      notification(`Выбрано: ${skill.dataset.name}`);
    }
  });

});

/* Атака */

const attack = $("attack");

if (attack) {

  attack.onclick = () => {

    if (player.energy <= 0) {
      notification("⚡ Недостаточно энергии");
      return;
    }

    player.energy -= 10;

    const damage = selectedDamage;

    enemyHp -= damage;

    if (enemyHp < 0) {
      enemyHp = 0;
    }

    notification(`⚔️ Атака нанесла ${damage} урона`);

    render();

    if (enemyHp <= 0) {

      player.victories++;

      const reward = 250 + player.level * 50;

      player.coins += reward;
      player.diamonds += 5;

      notification(
        `🏆 Победа! +${reward} 🪙 и +5 💎`
      );

      setTimeout(() => {

        enemyHp = 100;

        if (player.victories % 3 === 0) {
          player.level++;
          player.power += 5;

          notification(
            `⬆️ Новый уровень: ${player.level}`
          );
        }

        save();
        render();

      }, 1200);
    }

    save();
  };
}

/* Нижнее меню */

document.querySelectorAll(".tab").forEach(tab => {

  tab.addEventListener("click", () => {

    document
      .querySelectorAll(".tab")
      .forEach(x => x.classList.remove("active"));

    tab.classList.add("active");

    const page = tab.dataset.tab;

    if (page === "port") {
      notification("⚓ Порт Территории");
    }

    if (page === "territories") {
      notification("🗺️ Твоя территория №1");
    }

    if (page === "shop") {
      notification(
        "🛒 Магазин: Клинок моря — 500 🪙"
      );
    }

    if (page === "profile") {
      notification(
        `👤 Уровень ${player.level} • Побед: ${player.victories}`
      );
    }
  });

});

/* Восстановление энергии */

setInterval(() => {

  if (player.energy < 100) {

    player.energy++;

    save();
    render();

  }

}, 3000);

/* Запуск */

render();
