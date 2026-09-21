/* TERITORY HOME FINAL 05
   Approved HOME artwork + reliable mobile interaction map.
   No legacy HOME controls are rendered on top of the artwork.
*/
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);

  function go(id) {
    if (typeof window.showScreen === "function") {
      window.showScreen(id);
      return true;
    }
    return false;
  }

  function modal(title, body) {
    document.querySelector(".tr5-modal")?.remove();
    const m = document.createElement("div");
    m.className = "tr5-modal";
    m.innerHTML = `
      <div class="tr5-card" role="dialog" aria-modal="true">
        <button class="tr5-x" type="button" aria-label="Закрыть">×</button>
        <h3></h3><p></p>
        <button class="tr5-ok" type="button">Понятно</button>
      </div>`;
    $("h3", m).textContent = title;
    $("p", m).textContent = body;
    document.body.appendChild(m);
    const close = () => m.remove();
    $(".tr5-x", m).onclick = close;
    $(".tr5-ok", m).onclick = close;
    m.addEventListener("click", e => { if (e.target === m) close(); });
  }

  function action(name) {
    switch (name) {
      // top HUD
      case "profile": return go("inventory");
      case "coins": return modal("🪙 Монеты", "Ресурс героя.");
      case "gems": return modal("💎 Кристаллы", "Ресурс героя.");
      case "redgems": return modal("♦️ Ресурс", "Ресурс героя.");
      case "energy": return modal("⚡ Энергия", "Энергия героя.");
      case "trophy": return modal("🏆 Достижения", "Раздел достижений.");
      case "messages": return modal("✉️ Сообщения", "Центр сообщений.");
      case "settings": return modal("⚙️ Настройки", "Настройки игры.");
      case "chapter": return modal("🗺️ Глава 2", "Северные земли 2-7.");

      // left side
      case "events": return go("districts");
      case "daily": return go("game");
      case "quests": return go("districts");
      case "friends": return modal("👥 Друзья", "Раздел приглашений друзей.");
      case "sea": return modal("⛵ Морской набор", "Морские события.");

      // right side
      case "shop": return go("market");
      case "forge":
        if (typeof window.openForgeV2 === "function") window.openForgeV2();
        else return go("market");
        return;
      case "challenges": return go("arena");
      case "streets": return go("districts");
      case "arena": return go("arena");

      // lower gameplay
      case "hp": return modal("❤️ Здоровье", "Здоровье героя.");
      case "equipment": return go("inventory");
      case "consumable": return go("inventory");
      case "locked": return modal("🔒 Заблокировано", "Этот слот откроется по мере развития героя.");
      case "quest": return go("districts");
      case "speed": return modal("⏩ Скорость", "Переключатель скорости боя.");
      case "refresh": return go("arena");
      case "crown": return modal("👑 Награды", "Боевые награды.");
      case "star": return modal("⭐ Бонус", "Боевой бонус.");

      // bottom navigation
      case "home": return go("home");
      case "inventory": return go("inventory");
      case "hero": return go("inventory");
      case "battle": return go("arena");
      case "game": return go("game");
      case "clan": return modal("🏰 Клан", "Раздел клана готов для подключения.");
    }
  }

  // x, y, width, height as percentages of the approved 942×1670 artwork.
  // Zones do not overlap except where an element is intentionally one button.
  const ZONES = [
    ["profile",   0.5,  0.5, 25.5,  8.0],
    ["coins",    25.5,  0.5, 20.0,  6.8],
    ["gems",     45.5,  0.5, 16.5,  6.8],
    ["redgems",  62.0,  0.5, 16.0,  6.8],
    ["trophy",   78.0,  0.5,  8.5,  6.8],
    ["messages", 86.5,  0.5,  7.0,  6.8],
    ["settings", 93.5,  0.5,  6.0,  6.8],
    ["energy",   27.0,  6.5, 31.0,  6.2],
    ["chapter",  20.0, 10.0, 60.0,  9.0],

    ["events",    0.2,  8.5, 11.8, 10.5],
    ["daily",     0.2, 19.3, 11.8, 10.5],
    ["quests",    0.2, 30.1, 11.8, 10.5],
    ["friends",   0.2, 40.9, 11.8, 10.5],
    ["sea",       0.2, 51.7, 11.8, 10.5],

    ["shop",     88.0,  8.5, 11.8, 10.5],
    ["forge",    88.0, 19.3, 11.8, 10.5],
    ["challenges",88.0,30.1,11.8,10.5],
    ["streets",  88.0, 40.9,11.8,10.5],
    ["arena",    88.0, 51.7,11.8,10.5],

    ["hp",        0.0, 60.0, 16.5,  9.0],
    ["equipment",16.5,59.5,67.0,  9.5],
    ["energy",   83.5,60.0,16.5,  9.0],

    ["consumable", 0.5,69.0,11.7,8.7],
    ["consumable",12.7,69.0,11.7,8.7],
    ["consumable",24.9,69.0,11.7,8.7],
    ["consumable",37.1,69.0,11.7,8.7],
    ["locked",    49.3,69.0,16.0,8.7],
    ["locked",    66.0,69.0,16.0,8.7],
    ["locked",    82.7,69.0,16.8,8.7],

    ["quest",      0.5,77.5,49.0,6.8],
    ["speed",     61.0,77.2,10.0,7.0],
    ["refresh",   71.5,77.2,10.0,7.0],
    ["crown",     82.0,77.2,8.7,7.0],
    ["star",      91.0,77.2,8.7,7.0],

    ["home",       0.0,88.0,14.28,12.0],
    ["inventory", 14.28,88.0,14.28,12.0],
    ["hero",      28.56,88.0,14.28,12.0],
    ["battle",    42.84,87.0,14.32,13.0],
    ["quests",    57.16,88.0,14.28,12.0],
    ["game",      71.44,88.0,14.28,12.0],
    ["clan",      85.72,88.0,14.28,12.0]
  ];

  function buildZones(host) {
    const layer = document.createElement("div");
    layer.className = "home-hitzones";
    layer.setAttribute("aria-label", "Кнопки HOME");

    ZONES.forEach((z, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hz";
      b.dataset.hz = z[0];
      b.dataset.zoneIndex = String(i);
      b.setAttribute("aria-label", z[0]);
      b.style.left = z[1] + "%";
      b.style.top = z[2] + "%";
      b.style.width = z[3] + "%";
      b.style.height = z[4] + "%";
      layer.appendChild(b);
    });

    host.appendChild(layer);

    // One delegated click handler is more reliable on Android than many
    // individual listeners and prevents old document handlers from winning.
    layer.addEventListener("click", e => {
      const b = e.target.closest(".hz");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      action(b.dataset.hz);
    }, true);

    // Telegram/Android can occasionally suppress click after a touch.
    // touchend is a fallback, guarded against double activation.
    let lastTouch = 0;
    layer.addEventListener("touchend", e => {
      const b = e.target.closest(".hz");
      if (!b) return;
      const now = Date.now();
      if (now - lastTouch < 500) return;
      lastTouch = now;
      e.preventDefault();
      e.stopPropagation();
      action(b.dataset.hz);
    }, {capture:true, passive:false});

    return layer;
  }

  function hideLegacy() {
    const selectors = [
      ".hud", ".bottom-nav", ".live-side-ui", ".live-city-title",
      ".live-city-time", ".home-v2-scene", ".g141-photo-controls",
      ".home-v2-scene-image", ".real-home-image"
    ];
    document.querySelectorAll(selectors.join(",")).forEach(el => {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function mount() {
    const home = $("#home");
    if (!home) return;

    home.classList.add("home-reference-active");
    home.innerHTML = `
      <div id="homeReferenceHost" class="home-reference-host">
        <img class="home-reference-image"
             src="territory_reference_bg.png?v=FINAL05"
             alt="Teritory Game HOME"
             draggable="false">
      </div>`;

    const host = $("#homeReferenceHost");
    buildZones(host);
    hideLegacy();

    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor("#07111b");
        window.Telegram.WebApp.setBackgroundColor("#07111b");
      } catch (_) {}
    }
  }

  function boot() {
    mount();
    hideLegacy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, {once:true});
  } else {
    boot();
  }
})();