/* TERITORY HOME UNIFIED 10
   HOME is the single source of truth.
   All HOME popups use one visual format.
   Bottom buttons 42-48 are always mounted on HOME.
*/
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const store=()=>window.TerritoryStore?.state||{};
  const save=()=>window.TerritoryStore?.save?.();
  const go=id=>typeof window.showScreen==="function" ? (window.showScreen(id),true) : false;
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function close(){document.querySelector(".tr10-panel")?.remove()}
  function panel(title,sub,body,after){
    close();
    const p=document.createElement("div");
    p.className="tr10-panel";
    p.innerHTML=`<div class="tr10-card" role="dialog" aria-modal="true">
      <button class="tr10-x" type="button" aria-label="Закрыть">×</button>
      <div class="tr10-head"><small>${esc(sub||"TERITORY")}</small><h2>${esc(title)}</h2></div>
      <div class="tr10-body">${body}</div>
    </div>`;
    document.body.appendChild(p);
    const done=()=>p.remove();
    $(".tr10-x",p).onclick=done;
    p.addEventListener("click",e=>{if(e.target===p)done()});
    if(after)after(p,done);
    return p;
  }
  const btn=(label,attr="")=>`<button class="tr10-main" type="button" ${attr}>${label}</button>`;
  function launch(title,sub,icon,text,button,labelAction){
    panel(title,sub,
      `<div class="tr10-resource"><b>${icon} ${esc(text)}</b><span>Все разделы HOME открываются в одном формате. Кнопка ниже запускает именно указанный раздел.</span></div>${btn(button,"data-launch")}`,
      p=>{$("[data-launch]",p).onclick=()=>{p.remove();labelAction()}}
    );
  }
  function resource(title,value,desc){panel(title,"РЕСУРС",`<div class="tr10-resource"><b>${esc(value)}</b><span>${esc(desc)}</span></div>`)}
  function quests(){
    const s=store();
    panel("Квесты","ТЕКУЩИЕ ЗАДАНИЯ",
      `<div class="tr10-row"><b>📜</b><span>2-7 · Пройти Северные земли<small>${Number(s.gameTaskProgress||0)>=1?"Выполнено":"Прогресс 0 / 1"}</small></span></div>
       <div class="tr10-row"><b>🛡️</b><span>Задание Alex<small>${Number(s.alexQuest||0)>=1?"Активно":"Можно начать в городе"}</small></span></div>
       ${btn("Открыть карту районов","data-go-districts")}`,
      p=>{$("[data-go-districts]",p).onclick=()=>{p.remove();go("districts")}}
    );
  }
  function daily(){
    const s=store(), day=new Date().toISOString().slice(0,10), claimed=s.homeDailyClaim===day;
    panel("Ежедневные награды","НАГРАДА",
      `<div class="tr10-resource"><b>🎁 ${claimed?"Получено сегодня":"+100 🪙 · +10 XP"}</b><span>${claimed?"Следующая награда будет доступна завтра.":"Забери награду одним нажатием."}</span></div>
       ${btn(claimed?"Получено":"Забрать награду","data-claim "+(claimed?"disabled":""))}`,
      p=>{$("[data-claim]",p)?.addEventListener("click",()=>{s.coins=Number(s.coins||0)+100;s.exp=Number(s.exp||0)+10;s.homeDailyClaim=day;save();daily()})}
    );
  }
  function friends(){
    panel("Пригласить друзей","ДРУЗЬЯ",
      `<div class="tr10-resource"><b>👥 Приглашение</b><span>Отправь ссылку на Teritory Game через Telegram или системное меню.</span></div>${btn("Поделиться","data-share")}`,
      p=>{$("[data-share]",p).onclick=async()=>{try{if(navigator.share)await navigator.share({title:"Teritory Game",text:"Заходи в Teritory Game"});else if(navigator.clipboard)await navigator.clipboard.writeText("Teritory Game")}catch(_){}}}
    );
  }
  function achievements(){
    const s=store(), wins=Number(s.arenaWins||s.wins||0), rolls=Number(s.gameRolls||0);
    const rows=[["⚔️","Первая победа",wins>=1],["🎲","Первый бросок",rolls>=1],["🎒","Первый предмет",Array.isArray(s.inventory)&&s.inventory.length>0],["🏆","10 побед",wins>=10]];
    panel("Достижения","ПРОГРЕСС",rows.map(x=>`<div class="tr10-row ${x[2]?"done":""}"><b>${x[0]}</b><span>${x[1]}<small>${x[2]?"Получено":"Ещё не получено"}</small></span></div>`).join(""));
  }
  function messages(){
    const s=store();
    panel("Сообщения","ЦЕНТР СООБЩЕНИЙ",
      `<div class="tr10-row"><b>✉️</b><span>Добро пожаловать, ${esc(s.name||"SSS")}!<small>Уровень ${Number(s.level||1)}</small></span></div>
       <div class="tr10-row"><b>🎯</b><span>Текущая глава: Северные земли 2-7<small>Продолжай прохождение</small></span></div>`
    );
  }
  function settings(){
    const sound=localStorage.getItem("tg_sound")!=="0", vibr=localStorage.getItem("tg_vibration")!=="0";
    panel("Настройки","ИГРОВЫЕ НАСТРОЙКИ",
      `<div class="tr10-setting"><span>🔊 Звук</span><button class="tr10-toggle" data-k="tg_sound">${sound?"ВКЛ":"ВЫКЛ"}</button></div>
       <div class="tr10-setting"><span>📳 Вибрация</span><button class="tr10-toggle" data-k="tg_vibration">${vibr?"ВКЛ":"ВЫКЛ"}</button></div>`,
      p=>p.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{const k=b.dataset.k,on=localStorage.getItem(k)!=="0";localStorage.setItem(k,on?"0":"1");b.textContent=on?"ВЫКЛ":"ВКЛ"})
    );
  }
  function chapter(stage=2){
    panel("Глава 2 · Северные земли","ПРОХОЖДЕНИЕ",
      `<div class="tr10-resource"><b>Этап ${stage} · Северные земли</b><span>${stage<6?"Этап открыт для просмотра.":"Боссовый этап."}</span></div>
       ${btn(stage>=6?"Войти в бой":"Открыть этап","data-stage-go")}`,
      p=>{$("[data-stage-go]",p).onclick=()=>{p.remove();go("arena")}}
    );
  }
  function combat(){launch("Бой","БОЕВОЙ ЭКРАН","⚔️","Текущий боевой режим","Открыть бой",()=>go("arena"))}
  function streets(){
    const s=store(), day=new Date().toISOString().slice(0,10);
    s.streetClaims=s.streetClaims&&typeof s.streetClaims==="object"?s.streetClaims:{};
    const data=[["Северная улица",75],["Рыночный переулок",90],["Портовая улица",110]];
    panel("Захват улиц","ГОРОД",
      `<p class="tr10-muted">Захват расходует 10 энергии и даёт монеты + репутацию.</p>
       <div class="tr10-list">${data.map((x,i)=>{const done=s.streetClaims[i]===day;return `<div class="tr10-row"><b>⚔️</b><span>${x[0]}<small>${done?"Уже захвачена сегодня":"+"+x[1]+" 🪙 · +1 репутация"}</small></span><button class="tr10-toggle" data-street="${i}" ${done?"disabled":""}>${done?"Готово":"Захватить"}</button></div>`}).join("")}</div>`,
      p=>p.querySelectorAll("[data-street]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.street);if(Number(s.energy||0)<10){b.textContent="Нет энергии";return}s.energy-=10;s.coins=Number(s.coins||0)+data[i][1];s.cityRep=Number(s.cityRep||0)+1;s.streetClaims[i]=day;save();streets()})
    );
  }
  function consumable(slot){
    const s=store(), defs=[["Красное зелье","Восстановить 30 HP","hp",30],["Синее зелье","Восстановить 25 энергии","energy",25],["Большое синее зелье","Восстановить 50 энергии","energy",50],["Щит","Восстановить 15 HP","hp",15]];
    const d=defs[slot]||defs[0];
    panel(d[0],"РАСХОДНИК",`<div class="tr10-resource"><b>🧪 ${d[1]}</b><span>Слот ${slot+1}. Использование применяет эффект к текущему герою.</span></div>${btn("Использовать")}`,
      p=>p.querySelector(".tr10-main").onclick=()=>{if(d[2]==="hp")s.hp=Math.min(Number(s.maxHp||120),Number(s.hp||0)+d[3]);else s.energy=Math.min(200,Number(s.energy||0)+d[3]);save();p.querySelector(".tr10-resource span").textContent="Эффект применён."});
  }
  function locked(title){panel(title||"Слот закрыт","ЭКИПИРОВКА",`<div class="tr10-resource"><b>🔒 Пока закрыто</b><span>Этот слот остаётся закрытым до подключения соответствующей системы.</span></div>`)}
  function speed(){
    const s=store();s.battleSpeed=Number(s.battleSpeed||1);
    panel("Скорость боя","БОЙ",`<div class="tr10-setting"><span>Скорость: <b data-speed>${s.battleSpeed}×</b></span><button class="tr10-toggle" data-speed-btn>Переключить</button></div>`,
      p=>{$("[data-speed-btn]",p).onclick=()=>{s.battleSpeed=s.battleSpeed===1?2:1;save();$("[data-speed]",p).textContent=s.battleSpeed+"×"}})
  }
  function star(){const s=store();resource("Боевой бонус","⭐ Урон +"+Number(s.bonusDamage||0),"Бонус зависит от экипированного оружия.")}
  function vip(){resource("VIP","VIP 6","Текущий VIP-уровень.")}
  function sea(){panel("Морской набор","СОБЫТИЕ",`<div class="tr10-resource"><b>⛵ Морской набор</b><span>Раздел подготовлен под отдельную морскую систему.</span></div>`)}
  function clan(){panel("Клан","СОЮЗ",`<div class="tr10-resource"><b>🏰 Клан</b><span>Клановая система будет подключаться отдельно. Старые элементы не используются.</span></div>`)}
  function resourceInfo(k){
    const s=store(), d={
      coins:["Монеты",Number(s.coins||0)+" 🪙","Используются в рынке, кузнице и городских наградах."],
      gems:["Кристаллы",Number(s.gems||0)+" 💎","Премиальный ресурс текущего события."],
      redgems:["Красные кристаллы",Number(s.redGems||0)+" ♦️","Ресурс пока не расходуется в подключённых системах."],
      energy:["Энергия",Number(s.energy||0)+" / 200","Расходуется в городских действиях и восстанавливается расходниками."],
      hp:["Здоровье",Number(s.hp||0)+" / "+Number(s.maxHp||0),"Текущее здоровье героя."]
    };
    const x=d[k]||d.coins;resource(x[0],x[1],x[2]);
  }
  function action(n){
    switch(n){
      case"profile":return launch("Профиль","ГЕРОЙ","🧙","Профиль героя и экипировка","Открыть героя",()=>go("inventory"));
      case"vip":return vip();
      case"coins":return resourceInfo("coins");
      case"gems":return resourceInfo("gems");
      case"redgems":return resourceInfo("redgems");
      case"energy":return resourceInfo("energy");
      case"trophy":return achievements();
      case"messages":return messages();
      case"settings":return settings();
      case"attack":return combat();
      case"chapter":return chapter(2);
      case"stage1":return chapter(1); case"stage2":return chapter(2); case"stage3":return chapter(3); case"stage4":return chapter(4); case"stage5":return chapter(5); case"boss":return chapter(6);
      case"events":return launch("События","ГОРОД","🎪","Городские районы и события","Открыть город",()=>go("districts"));
      case"daily":return daily(); case"quests":return quests(); case"friends":return friends(); case"sea":return sea();
      case"shop":return launch("Магазин","ТОРГОВЛЯ","🛒","Магазин снаряжения","Открыть магазин",()=>go("market"));
      case"forge":return launch("Кузница","СНАРЯЖЕНИЕ","🔨","Покупка и экипировка оружия", "Открыть кузницу",()=>{if(typeof window.openForgeV2==="function")window.openForgeV2();else go("market")});
      case"challenges":return launch("Испытания","БОЙ","🏆","Боевые испытания","Открыть испытания",()=>go("arena"));
      case"streets":return streets();
      case"arena":return launch("Арена","БОЙ","⚔️","Арена и сражения","Открыть арену",()=>go("arena"));
      case"hp":return resourceInfo("hp"); case"equipment":return launch("Экипировка","ГЕРОЙ","🛡️","Текущий комплект героя","Открыть героя",()=>go("inventory"));
      case"consumable1":return consumable(0); case"consumable2":return consumable(1); case"consumable3":return consumable(2); case"consumable4":return consumable(3);
      case"lock1":return locked("Слот · уровень 90"); case"lock2":return locked("Слот · Арена"); case"lock3":return locked("Слот · позже");
      case"quest":return quests(); case"speed":return speed(); case"refresh":return combat(); case"crown":return combat(); case"star":return star();
      case"home":return go("home");
      case"inventory":return launch("Инвентарь","ГЕРОЙ","🎒","Предметы и экипировка","Открыть инвентарь",()=>go("inventory"));
      case"hero":return launch("Герой","ГЕРОЙ","🛡️","Характеристики и экипировка","Открыть героя",()=>go("inventory"));
      case"battle":return launch("Бой","БОЙ","⚔️","Арена и боевой экран","Открыть бой",()=>go("arena"));
      case"bottomQuests":return quests();
      case"game":return launch("Игры","СОБЫТИЕ","🎲","Монополия · зимнее событие","Открыть игры",()=>go("game"));
      case"clan":return clan();
    }
  }

  /* 41 visual/side controls. Bottom 42-48 are mounted separately and always exist. */
  const Z=[
    ["profile",0,0,27.5,6.5],["coins",27.5,0,18,5.8],["gems",45.5,0,18,5.8],["redgems",63.5,0,16,5.8],["trophy",79.5,0,6.5,5.8],["messages",86,0,7,5.8],["settings",93,0,7,5.8],
    ["vip",2,4,17,4.5],["energy",30,4.5,28,5.2],["attack",64,4.2,34,6.3],
    ["chapter",30,9,41,5.5],["stage1",37.5,13,4.2,3.8],["stage2",42,13,4.2,3.8],["stage3",46.5,13,4.2,3.8],["stage4",51,13,4.2,3.8],["stage5",55.5,13,4.2,3.8],["boss",59.5,12.3,5.2,5],
    ["events",0,9,13,8],["daily",0,16.2,13,8],["quests",0,23.4,13,8],["friends",0,30.6,13,8],["sea",0,38,13,8],
    ["shop",87,9,13,8],["forge",87,16.2,13,8],["challenges",87,23.4,13,8],["streets",87,30.6,13,8],["arena",87,38,13,8],
    ["hp",0,64,18,12],["equipment",18,64,65,12],["energy",83,64,17,12],
    ["consumable1",0,76.2,14.4,8],["consumable2",14.5,76.2,14.4,8],["consumable3",29,76.2,14.4,8],["consumable4",43.5,76.2,14.4,8],
    ["lock1",58,76.2,13.5,8],["lock2",72,76.2,13.5,8],["lock3",86,76.2,14,8],
    ["quest",0,84.2,51,7.2],["speed",61,83.7,8.5,7],["refresh",70.5,83.7,8.5,7],["crown",80,83.7,8.5,7],["star",89.5,83.7,10.5,7]
  ];
  const BOTTOM=[
    ["home",0,91,14.28,9],["inventory",14.28,91,14.28,9],["hero",28.56,91,14.28,9],
    ["battle",42.84,90,14.32,10],["bottomQuests",57.16,91,14.28,9],["game",71.44,91,14.28,9],["clan",85.72,91,14.28,9]
  ];
  const MAIN_MENU=[
    ["home","🏰","Город"],["inventory","👜","Инвентарь"],["hero","🛡️","Герой"],["battle","⚔️","Бой"],
    ["bottomQuests","📜","Квесты"],["game","🎲","Игры"],["clan","🚩","Клан"]
  ];
  function hideLegacy(){
    const sels=[".hud",".live-side-ui",".live-city-title",".live-city-time",".home-v2-scene",".g141-photo-controls",".home-v2-scene-image",".real-home-image",".scene-hotspots",".home-v2-scene-overlay"];
    document.querySelectorAll(sels.join(",")).forEach(e=>{e.style.setProperty("display","none","important");e.style.setProperty("pointer-events","none","important");e.style.setProperty("visibility","hidden","important")});
  }
  function addZone(layer,z,i,cls){
    const b=document.createElement("button");b.type="button";b.className="hz "+(cls||"");b.dataset.hz=z[0];b.dataset.i=i;b.setAttribute("aria-label",z[0]);
    b.style.left=z[1]+"%";b.style.top=z[2]+"%";b.style.width=z[3]+"%";b.style.height=z[4]+"%";layer.appendChild(b);
  }
  function mount(){
    const home=$("#home");if(!home)return;
    home.classList.add("home-reference-active");
    home.innerHTML=`<div class="home-reference-host" id="homeReferenceHost"><img class="home-reference-image" src="territory_reference_bg.png?v=UNIFIED10" alt="Teritory Game HOME" draggable="false"><div class="home-hitzones"></div><div class="home-bottom-zones" aria-label="Нижнее меню 42-48"></div></div>`;
    const layer=$(".home-hitzones",home), bottom=$(".home-bottom-zones",home);
    Z.forEach((z,i)=>addZone(layer,z,i));
    BOTTOM.forEach((z,i)=>addZone(bottom,z,42+i,"home-bottom-hz"));
    const handle=e=>{const b=e.target.closest(".hz");if(!b)return;e.preventDefault();e.stopPropagation();action(b.dataset.hz)};
    layer.addEventListener("click",handle,true);bottom.addEventListener("click",handle,true);
    let last=0;
    const touch=e=>{const b=e.target.closest(".hz");if(!b)return;const n=Date.now();if(n-last<450)return;last=n;e.preventDefault();e.stopPropagation();action(b.dataset.hz)};
    layer.addEventListener("touchend",touch,{capture:true,passive:false});bottom.addEventListener("touchend",touch,{capture:true,passive:false});
    hideLegacy();
    if(window.Telegram?.WebApp){try{Telegram.WebApp.expand();Telegram.WebApp.setHeaderColor("#07111b");Telegram.WebApp.setBackgroundColor("#07111b")}catch(_){}}
  }

  function mountPersistentMenu(){
    let nav=document.getElementById("tr10-main-menu");
    if(nav) return nav;
    nav=document.createElement("nav");
    nav.id="tr10-main-menu";
    nav.className="tr10-main-menu";
    nav.setAttribute("aria-label","Главное меню");
    nav.innerHTML=MAIN_MENU.map((x,i)=>`<button type="button" class="tr10-menu-btn ${i===3?"is-battle":""}" data-menu="${x[0]}" aria-label="${esc(x[2])}"><span class="tr10-menu-icon">${x[1]}</span><b>${esc(x[2])}</b></button>`).join("");
    document.body.appendChild(nav);
    nav.addEventListener("click",e=>{
      const b=e.target.closest("[data-menu]");
      if(!b)return;
      e.preventDefault(); e.stopPropagation();
      action(b.dataset.menu);
    },true);
    let last=0;
    nav.addEventListener("touchend",e=>{
      const b=e.target.closest("[data-menu]");
      if(!b)return;
      const now=Date.now();
      if(now-last<450)return;
      last=now;
      e.preventDefault(); e.stopPropagation();
      action(b.dataset.menu);
    },{capture:true,passive:false});
    return nav;
  }
  function syncPersistentMenu(){
    const nav=mountPersistentMenu();
    const home=$("#home");
    nav.classList.toggle("on-home",!!(home&&home.classList.contains("active")));
  }

  function boot(){mount();hideLegacy();mountPersistentMenu();syncPersistentMenu();
    const mo=new MutationObserver(syncPersistentMenu); mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();