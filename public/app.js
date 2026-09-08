(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    try { tg.setHeaderColor("#211812"); tg.setBackgroundColor("#d9c7a8"); } catch(e) {}
  }

  const state = {
    page: "home",
    hp: 86,
    energy: 72,
    gold: 1250,
    level: 1,
    messages: [
      {time:"01:46", name:"Странник", text:"Всем привет! Кто в бой?"},
      {time:"01:47", name:"Админ", text:"Добро пожаловать в Территорию!", system:true},
      {time:"01:48", name:"Ворон", text:"Кто-нибудь видел торговца?"}
    ]
  };

  const page = document.getElementById("page");
  const nav = document.getElementById("mainNav");
  const menuButton = document.getElementById("menuButton");

  const pages = {
    character: ["Персонаж", "Уровень 1 · Городской боец", "Здесь будет карточка персонажа, характеристики и экипировка."],
    inventory: ["Инвентарь", "Ваши вещи", "Оружие, броня, аптечки и другие предметы будут отображаться здесь."],
    arena: ["Арена", "Центральная арена", "Выберите соперника и отправляйтесь в бой."],
    shop: ["Магазин", "Лавка у Центральной площади", "Покупайте экипировку и расходники за золото."],
    bank: ["Банк", "Городской банк", "Здесь можно управлять балансом и хранить свои средства."]
  };

  function setStats() {
    document.getElementById("hpText").textContent = `${state.hp}/100`;
    document.getElementById("energyText").textContent = `${state.energy}/100`;
    document.getElementById("gold").textContent = state.gold;
    document.getElementById("level").textContent = state.level;
    document.getElementById("hpBar").style.width = `${state.hp}%`;
    document.getElementById("energyBar").style.width = `${state.energy}%`;
  }

  function renderChat() {
    const log = document.getElementById("chatLog");
    log.innerHTML = state.messages.map(m =>
      `<div class="chat-line ${m.system ? "system":""}">
        <span class="time">[${escapeHtml(m.time)}]</span>
        <span class="name">${escapeHtml(m.name)}:</span>
        <span>${escapeHtml(m.text)}</span>
      </div>`
    ).join("");
    log.scrollTop = log.scrollHeight;
  }

  function renderPage(target) {
    state.page = target;
    document.querySelectorAll("[data-page]").forEach(el => {
      el.classList.toggle("active", el.dataset.page === target);
    });

    if (target === "home") {
      page.innerHTML = homeTemplate();
      bindHome();
      renderChat();
      return;
    }

    const p = pages[target] || pages.character;
    page.innerHTML = `
      <section class="page-box">
        <div class="crumbs">Центральный район → ${p[0]}</div>
        <h1>${p[0]}</h1>
        <p><b>${p[1]}</b></p>
        <p>${p[2]}</p>
        <p><button class="back-link" data-page="home">← Вернуться на Главную</button></p>
      </section>`;
    page.querySelector("[data-page]").addEventListener("click", () => renderPage("home"));
  }

  function homeTemplate() {
    return `
      <section class="location-page">
        <div class="crumbs">Вы здесь: <b>Центральный район</b> · Вечер</div>
        <section class="location-card">
          <div class="street-scene">
            <div class="sky"></div><div class="moon"></div>
            <div class="city-back"><span class="building b1"></span><span class="building b2"></span><span class="building b3"></span><span class="building b4"></span><span class="building b5"></span></div>
            <div class="road"></div><div class="lamp l1"></div><div class="lamp l2"></div>
            <div class="sign shop-sign">МАГАЗИН</div><div class="sign bank-sign">БАНК</div><div class="sign arena-sign">АРЕНА</div>
            <div class="scene-caption"><strong>ЦЕНТРАЛЬНЫЙ РАЙОН</strong><span>Главная улица города</span></div>
          </div>
          <div class="location-info">
            <div><h1>Центральный район</h1><p>Здесь кипит городская жизнь. Игроки встречаются, торгуют и ищут соперников.</p></div>
            <div class="online"><b>В этой локации сейчас:</b><br><span>Странник</span><span>Ворон</span><span class="you">Вы</span></div>
          </div>
          <div class="go-list"><span class="go-title">Куда пойти:</span>
            <button data-page="arena">→ Перейти на Арену</button>
            <button data-page="shop">→ Зайти в Магазин</button>
            <button data-page="bank">→ Пойти в Банк</button>
          </div>
        </section>
        <section class="chat">
          <div class="chat-head"><span>ИГРОВОЙ ЧАТ</span><span class="chat-status">● онлайн: <b id="onlineCount">3</b></span></div>
          <div class="chat-log" id="chatLog"></div>
          <form class="chat-form" id="chatForm">
            <input id="chatInput" maxlength="180" autocomplete="off" placeholder="Введите сообщение...">
            <button type="submit">Отправить</button>
          </form>
        </section>
      </section>`;
  }

  function bindHome() {
    page.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => renderPage(btn.dataset.page));
    });
    document.getElementById("chatForm").addEventListener("submit", sendMessage);
  }

  function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;
    const d = new Date();
    const time = d.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
    let name = "Вы";
    try {
      const user = tg?.initDataUnsafe?.user;
      if (user) name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Вы";
    } catch(e) {}
    state.messages.push({time, name, text});
    input.value = "";
    renderChat();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }

  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => renderPage(btn.dataset.page));
  });

  menuButton?.addEventListener("click", () => nav.classList.toggle("open"));
  document.getElementById("moreTab")?.addEventListener("click", () => nav.classList.toggle("open"));

  setStats();
  renderChat();
  bindHome();
})();