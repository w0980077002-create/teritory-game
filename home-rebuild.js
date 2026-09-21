/* TERITORY HOME BUTTON CLEANUP 08
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

  function store(){ return window.TerritoryStore && window.TerritoryStore.state ? window.TerritoryStore.state : {}; }
  function saveState(){ if(window.TerritoryStore && typeof window.TerritoryStore.save==='function') window.TerritoryStore.save(); }
  function esc(v){ return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function closePanel(){ document.querySelector('.tr6-panel')?.remove(); }
  function panel(title, subtitle, html, onOpen){
    closePanel();
    const p=document.createElement('div'); p.className='tr6-panel';
    p.innerHTML=`<div class="tr6-card" role="dialog" aria-modal="true"><button class="tr6-close" type="button">×</button><div class="tr6-head"><div class="tr6-icon">⚔️</div><div><small>${esc(subtitle||'SDOLARS')}</small><h3>${esc(title)}</h3></div></div><div class="tr6-body">${html}</div></div>`;
    document.body.appendChild(p);
    const close=()=>p.remove(); p.querySelector('.tr6-close').onclick=close; p.addEventListener('click',e=>{if(e.target===p)close()});
    if(onOpen) onOpen(p,close);
    return p;
  }
  function modal(title, body){ panel(title,'ИНФОРМАЦИЯ',`<p class="tr6-text">${esc(body)}</p><button class="tr6-main" data-close>Понятно</button>`,p=>p.querySelector('[data-close]').onclick=()=>p.remove()); }
  function openVip(){
    const s=store(), level=Math.max(0,Number(s.vipLevel||6));
    const names=['Базовые бонусы','Дополнительные награды','Бонус к энергии','Бонус к опыту','Бонус к добыче','Расширенный инвентарь','Новые слоты','Усиление наград','Особый доступ','VIP-статус'];
    const rows=names.map((name,i)=>{const n=i+1;return `<div class="tr6-row"><b>VIP ${n}</b><span>${name}<small>${n<=level?'Доступно':'Откроется на VIP '+n}</small></span></div>`}).join('');
    panel('VIP','УРОВНИ И ДОСТУП',`<div class="tr6-hero-line"><b>Текущий VIP ${level}</b><span>Здесь видно, что открывается на каждом уровне.</span></div><div class="tr6-list">${rows}</div>`);
  }
  function openResource(kind){
    const s=store(); const data={
      coins:['🪙 Монеты',Number(s.coins||0),'Основная игровая валюта. Используется в магазине и кузнице.'],
      gems:['💎 Кристаллы',Number(s.gems||0),'Премиальная валюта для будущих специальных функций и наград.'],
      redgems:['♦️ Красные кристаллы',Number(s.redGems||0),'Ресурс зарезервирован под будущую систему. Сейчас тратить его нельзя.'],
      energy:['⚡ Энергия',`${Number(s.energy||0)} / 200`,'Текущее количество энергии героя.']
    }[kind];
    panel(data[0],'РЕСУРС',`<div class="tr6-resource"><b>${esc(data[1])}</b><span>${esc(data[2])}</span></div>`);
  }
  function openAchievements(){
    const s=store(), wins=Number(s.arenaWins||s.wins||0), rolls=Number(s.gameRolls||0), inv=Array.isArray(s.inventory)?s.inventory.length:0;
    const a=[['⚔️','Первая победа',wins>=1],['🎲','Первый ход',rolls>=1],['🎒','Первый предмет',inv>=1],['🏆','10 побед',wins>=10],['⭐','50 ходов',rolls>=50]];
    panel('Достижения','ПРОГРЕСС',a.map(x=>`<div class="tr6-row ${x[2]?'done':''}"><b>${x[0]}</b><span>${x[1]}<small>${x[2]?'Получено':'Ещё не получено'}</small></span></div>`).join(''));
  }
  function openMessages(){
    const s=store(); const rows=[`Добро пожаловать, ${esc(s.name||'SSS')}!`,`Уровень героя: ${Number(s.level||1)}`,`Монеты: ${Number(s.coins||0)}`,`Энергия: ${Number(s.energy||0)}/200`];
    panel('Сообщения','ЦЕНТР СООБЩЕНИЙ',`<div class="tr6-list">${rows.map(x=>`<div class="tr6-row"><b>✉️</b><span>${x}<small>Системное сообщение</small></span></div>`).join('')}</div>`);
  }
  function openSettings(){
    const sound=localStorage.getItem('tg_sound')!=='0', vibr=localStorage.getItem('tg_vibration')!=='0';
    panel('Настройки','ИГРОВЫЕ НАСТРОЙКИ',`<div class="tr6-setting"><span>🔊 Звук</span><button class="tr6-toggle" data-setting="tg_sound">${sound?'ВКЛ':'ВЫКЛ'}</button></div><div class="tr6-setting"><span>📳 Вибрация</span><button class="tr6-toggle" data-setting="tg_vibration">${vibr?'ВКЛ':'ВЫКЛ'}</button></div><p class="tr6-muted">Настройки сохраняются на этом устройстве.</p>`,p=>p.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{const k=b.dataset.setting;const on=localStorage.getItem(k)!=='0';localStorage.setItem(k,on?'0':'1');b.textContent=on?'ВЫКЛ':'ВКЛ'}));
  }
  function openDaily(){
    const s=store(), day=new Date().toISOString().slice(0,10), claimed=s.homeDailyClaim===day;
    panel('Ежедневные награды','НАГРАДА ДНЯ',`<div class="tr6-resource"><b>🎁 ${claimed?'Награда уже получена':'Сегодня: +100 🪙 и +10 XP'}</b><span>${claimed?'Возвращайся завтра.':'Забери ежедневную награду одним нажатием.'}</span></div><button class="tr6-main" data-claim ${claimed?'disabled':''}>${claimed?'Получено':'Забрать награду'}</button>`,p=>p.querySelector('[data-claim]')?.addEventListener('click',()=>{s.coins=Number(s.coins||0)+100;s.exp=Number(s.exp||0)+10;s.homeDailyClaim=day;saveState();openDaily()}));
  }
  function openQuests(){
    const s=store(), done=Number(s.gameTaskProgress||0)>=1;
    panel('Задания','ТЕКУЩИЕ ЗАДАНИЯ',`<div class="tr6-resource"><b>2-7 · Пройти Северные земли</b><span>Прогресс: ${done?'1':'0'} / 1</span></div><div class="tr6-resource"><b>Задание Alex</b><span>${Number(s.alexQuest||0)>=1?'Принято':'Поговорить с Alex в городе'}</span></div>`);
  }
  function openFriends(){
    panel('Пригласить друзей','ДРУЗЬЯ',`<div class="tr6-resource"><b>Приглашение</b><span>Поделись игрой с другом. Система приглашений пока не подключена к наградам.</span></div><button class="tr6-main" data-share>Поделиться</button>`,p=>p.querySelector('[data-share]').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Teritory Game',text:'Заходи в Teritory Game'});else if(navigator.clipboard)await navigator.clipboard.writeText('Teritory Game');}catch(_){}});
  }
  function openSea(){ panel('Морской набор','СОБЫТИЯ',`<div class="tr6-resource"><b>⛵ Морской набор</b><span>Морская ветка ещё не реализована. Слот оставлен пустым, как договорились.</span></div>`); }
  function openChapter(){ panel('Глава 2 · Северные земли 2-7','ТЕКУЩИЙ ЭТАП',`<div class="tr6-resource"><b>Информация</b><span>Баннер главы не является кнопкой входа. Для входа используется череп на шкале этапов.</span></div>`); }
  function openBoss(){
    const s=store(), unlocked=Math.max(1,Math.min(10,Number(s.bossUnlocked||1)));
    const rows=Array.from({length:10},(_,i)=>{const n=i+1, ok=n<=unlocked;return `<div class="tr6-boss ${ok?'open':'locked'}">💀 Босс ${n}<small>${ok?'Ветка доступна':'Закрыто'}</small></div>`}).join('');
    panel('Ветка боссов','10 ВЕТКИ',`<p class="tr6-muted">Здесь отображаются боссы, доступные после прохождения ветки.</p><div class="tr6-boss-grid">${rows}</div>`);
  }
  function openExtraSide(){ panel('Дополнительные разделы','СКРЫТАЯ ПАНЕЛЬ',`<div class="tr6-list"><div class="tr6-row"><b>21</b><span>Дополнительная кнопка<small>Пока пусто</small></span></div><div class="tr6-row"><b>22</b><span>Дополнительная кнопка<small>Пока пусто</small></span></div><div class="tr6-row"><b>23</b><span>Дополнительная кнопка<small>Пока пусто</small></span></div></div>`); }

  function openStreets(){
    const s=store(), day=new Date().toISOString().slice(0,10), claims=s.streetClaims&&typeof s.streetClaims==='object'?s.streetClaims:{};
    const streets=[['Северная улица',75],['Рыночный переулок',90],['Портовая улица',110]];
    panel('Захват улиц','ГОРОДСКОЙ КОНТРОЛЬ',`<p class="tr6-muted">Выбирай улицу. Захват расходует 10 энергии и даёт монеты + репутацию города.</p><div class="tr6-list">${streets.map((x,i)=>{const done=claims[i]===day;return `<div class="tr6-row"><b>⚔️</b><span>${x[0]}<small>${done?'Уже захвачена сегодня':'Награда +'+x[1]+' 🪙 · +1 репутация'}</small></span><button class="tr6-toggle" data-street="${i}" ${done?'disabled':''}>${done?'Готово':'Захватить'}</button></div>`}).join('')}</div>`,p=>p.querySelectorAll('[data-street]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.street), cost=10;if(Number(s.energy||0)<cost){b.textContent='Нет энергии';return;}s.energy-=cost;s.coins=Number(s.coins||0)+streets[i][1];s.cityRep=Number(s.cityRep||0)+1;s.streetClaims=claims;s.streetClaims[i]=day;saveState();openStreets()}));
  }
  function openConsumable(){
    const s=store(), inv=Array.isArray(s.inventory)?s.inventory:[];
    panel('Расходники','БОЕВЫЕ СЛОТЫ',`<div class="tr6-resource"><b>🧪 Расходники</b><span>В текущем состоянии игры отдельные зелья ещё не заведены. Здесь будет их полноценная панель, когда система расходников появится.</span></div><div class="tr6-resource"><b>Инвентарь: ${inv.length} предметов</b><span>Открой Инвентарь, чтобы увидеть уже полученные предметы.</span></div><button class="tr6-main" data-inv>Открыть Инвентарь</button>`,p=>p.querySelector('[data-inv]').onclick=()=>{p.remove();go('inventory')});
  }
  function action(name) {
    switch (name) {
      // top HUD
      case "profile": return go("inventory");
      case "vip": return openVip();
      case "coins": return openResource("coins");
      case "gems": return openResource("gems");
      case "redgems": return openResource("redgems");
      case "energy": return openResource("energy");
      case "trophy": return openAchievements();
      case "messages": return openMessages();
      case "settings": return openSettings();
      case "chapter": return openChapter();
      case "boss": return openBoss();

      // left side
      case "events": return panel("События","ГОРОДСКИЕ СОБЫТИЯ",`<div class="tr6-resource"><b>Городские события</b><span>События и награды города доступны через карту районов.</span></div><button class="tr6-main" data-go-districts>Открыть события города</button>`,p=>p.querySelector("[data-go-districts]").onclick=()=>{p.remove();go("districts")});
      case "daily": return openDaily();
      case "quests": return openQuests();
      case "friends": return openFriends();
      case "sea": return openSea();

      // right side
      case "shop": return go("market");
      case "forge":
        if (typeof window.openForgeV2 === "function") window.openForgeV2();
        else return go("market");
        return;
      case "challenges": return go("arena");
      case "streets": return openStreets();
      case "arena": return go("arena");

      // lower gameplay
      case "hp": { const s=store(); return panel("Здоровье","СОСТОЯНИЕ ГЕРОЯ",`<div class="tr6-resource"><b>❤️ ${Number(s.hp||0)} / ${Number(s.maxHp||0)}</b><span>Текущее здоровье героя.</span></div>`); }
      case "equipment": return go("inventory");
      case "consumable": return openConsumable();
      case "locked": return modal("🔒 Слот закрыт", "Этот слот действительно ещё не открыт. Требование отображается в самом слоте.");
      case "quest": return openQuests();
      case "speed": { const s=store(); s.battleSpeed=Number(s.battleSpeed||1); return panel("Скорость боя","БОЕВОЙ РЕЖИМ",`<div class="tr6-setting"><span>Скорость: <b data-speed>${s.battleSpeed}×</b></span><button class="tr6-toggle" data-speed-btn>Переключить</button></div>`,p=>p.querySelector("[data-speed-btn]").onclick=()=>{s.battleSpeed=s.battleSpeed===1?2:1;saveState();p.querySelector("[data-speed]").textContent=s.battleSpeed+"×"}); }
      case "refresh": return go("arena");
      case "crown": return panel("Награды","БОЕВЫЕ НАГРАДЫ",`<div class="tr6-resource"><b>👑 Награды арены</b><span>Победы в бою и игровые события формируют награды.</span></div><button class="tr6-main" data-arena>Открыть Арену</button>`,p=>p.querySelector("[data-arena]").onclick=()=>{p.remove();go("arena")});
      case "star": { const s=store(); return panel("Бонус","БОЕВОЙ БОНУС",`<div class="tr6-resource"><b>⭐ Урон +${Number(s.bonusDamage||0)}</b><span>Текущий бонус зависит от экипированного оружия.</span></div>`); }

      // bottom navigation
      case "home": return go("home");
      case "inventory": return go("inventory");
      case "hero": return go("inventory");
      case "battle": return go("arena");
      case "game": return go("game");
      case "clan": return panel("Клан","СОЮЗ ИГРОКОВ",`<div class="tr6-resource"><b>🏰 Клан</b><span>Клановая система ещё не реализована. Кнопка уже имеет своё место, контент добавим позже.</span></div>`);
    }
  }

  // x, y, width, height as percentages of the approved 942×1670 artwork.
  // Zones do not overlap except where an element is intentionally one button.
  const ZONES = [
    ["profile",   0.5,  0.5, 25.5,  6.2],
    ["vip",       0.5,  6.7, 25.5,  2.0],
    ["coins",    25.5,  0.5, 20.0,  6.8],
    ["gems",     45.5,  0.5, 16.5,  6.8],
    ["redgems",  62.0,  0.5, 16.0,  6.8],
    ["trophy",   78.0,  0.5,  8.5,  6.8],
    ["messages", 86.5,  0.5,  7.0,  6.8],
    ["settings", 93.5,  0.5,  6.0,  6.8],
    ["energy",   27.0,  6.5, 31.0,  6.2],
    ["chapter",  20.0,10.0, 60.0,  9.0],
    ["boss",     55.0,18.7, 10.0,  6.0],

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

    // Coordinate dispatcher: when transparent hit zones touch each other,
    // use the smallest matching zone (the most specific button) instead of
    // whichever invisible DOM layer happens to be on top. This prevents old
    // or broad zones from stealing taps on mobile.
    const pickZone = e => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const hits = ZONES.map((z,i)=>({z,i,area:z[3]*z[4]}))
        .filter(o=>x>=o.z[1]&&x<=o.z[1]+o.z[3]&&y>=o.z[2]&&y<=o.z[2]+o.z[4])
        .sort((a,b)=>a.area-b.area);
      return hits[0]?.z?.[0] || null;
    };
    layer.addEventListener("click", e => {
      const name=pickZone(e);
      if(!name)return;
      e.preventDefault(); e.stopPropagation(); action(name);
    }, true);

    let lastTouch = 0;
    layer.addEventListener("touchend", e => {
      const t=e.changedTouches?.[0]; if(!t)return;
      const now=Date.now(); if(now-lastTouch<500)return; lastTouch=now;
      const name=pickZone(t); if(!name)return;
      e.preventDefault(); e.stopPropagation(); action(name);
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