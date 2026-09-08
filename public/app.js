const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const KEY = "teritory_save_v3";
const defaultState = {
  page:"home", coins:1000, level:1, exp:0, maxExp:100,
  hp:100, maxHp:100, energy:100, maxEnergy:100,
  strength:10, agility:10, defense:5, damage:5, accuracy:50, crit:5,
  equipment:{head:null, armor:null, weapon:null, second:null, clothes:null, shoes:null},
  inventory:[],
  wins:0, losses:0, freePoints:0,
  enemy:{name:"Уличный хулиган", hp:100, maxHp:100, damage:12},
  attackZone:null, blockZone:null,
  tasks:{fight:false,buy:false,upgrade:false}
};
let state = load();

function load(){
  try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")};}
  catch(e){return {...defaultState};}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function toast(t){const el=document.getElementById("toast");el.textContent=t;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),1700)}
function money(n){return n.toLocaleString("ru-RU")}
function setPage(p){state.page=p;save();render();window.scrollTo({top:0,behavior:"smooth"})}

const menu = [
 ["character","👤","Персонаж","Боец и характеристики"],
 ["inventory","🎒","Инвентарь","Экипировка и предметы"],
 ["arena","⚔️","Арена","Сражения и награды"],
 ["shop","🏪","Магазин","Оружие и броня"],
 ["territory","🗺️","Территории","Районы города","2 ур."],
 ["tasks","📋","Задания","Получай награды"],
 ["rating","🏆","Рейтинг","Лучшие игроки"],
 ["clan","👥","Клан","Команда и война"],
 ["settings","⚙️","Настройки","Параметры игры"]
];

function shell(title, body){
 return `<div class="page"><div class="page-head"><h1>${title}</h1></div>${body}</div>`
}
function render(){
 document.getElementById("topLevel").textContent=`Уровень ${state.level}`;
 document.getElementById("topCoins").textContent=money(state.coins);
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 let html="";
 if(state.page==="home") html=home();
 else if(state.page==="character") html=character();
 else if(state.page==="inventory") html=inventory();
 else if(state.page==="arena") html=arena();
 else if(state.page==="shop") html=shop();
 else if(state.page==="territory") html=territory();
 else if(state.page==="tasks") html=tasks();
 else if(state.page==="rating") html=rating();
 else if(state.page==="clan") html=clan();
 else if(state.page==="settings") html=settings();
 document.getElementById("content").innerHTML=html;
 bind();
}

function home(){
 const cards=menu.map(x=>`<button class="menu-card" data-open="${x[0]}">
   <span class="menu-icon">${x[1]}</span><span class="menu-name">${x[2]}</span>
   <span class="menu-desc">${x[3]}</span>${x[4]?`<span class="badge">${x[4]}</span>`:""}
 </button>`).join("");
 return `<div class="page">
  <section class="hero"><h1>Город возможностей</h1><p>Выбери направление и развивай своего бойца.</p></section>
  <div class="section-title">🏙️ Город</div>
  <div class="city"><div class="city-label">Твоя территория</div><div class="city-icon">🏙️</div><div class="city-name">Центральный район</div></div>
  <div class="section-title">Разделы игры</div>
  <div class="grid">${cards}</div>
  <div class="section-title">Состояние бойца</div>
  <div class="stats">
   <div class="stat-card"><div class="stat-label">❤️ Здоровье</div><div class="stat-value">${state.hp}/${state.maxHp}</div><div class="progress"><i style="width:${state.hp/state.maxHp*100}%"></i></div></div>
   <div class="stat-card"><div class="stat-label">⚡ Энергия</div><div class="stat-value">${state.energy}/${state.maxEnergy}</div><div class="progress blue"><i style="width:${state.energy/state.maxEnergy*100}%"></i></div></div>
  </div>
 </div>`
}

function character(){
 return shell("Персонаж",`
 <div class="card">
  <div class="row"><div><b style="font-size:21px">Игрок</b><div class="muted">Уличный боец</div></div><div style="font-size:28px">⭐ ${state.level}</div></div>
  <div class="muted" style="margin-top:15px">Опыт ${state.exp} / ${state.maxExp}</div>
  <div class="progress purple"><i style="width:${state.exp/state.maxExp*100}%"></i></div>
 </div>
 <div class="card"><div class="section-title" style="margin-top:0">👤 Персонаж</div><div class="character">🧍</div></div>
 <div class="section-title">Характеристики</div>
 <div class="stats">
  ${stat("💪","Сила",state.strength,"str")}
  ${stat("🏃","Ловкость",state.agility,"agi")}
  ${stat("🛡️","Защита",state.defense,"def")}
  ${stat("⚔️","Урон",state.damage,"dmg")}
  ${stat("🎯","Точность",state.accuracy,"acc")}
  ${stat("💥","Крит",state.crit+"%","crit")}
 </div>
 ${state.freePoints?`<div class="notice">✨ Свободные очки прокачки: <b>${state.freePoints}</b></div>`:""}
 `)
}
function stat(icon,name,val,key){
 return `<div class="stat-card"><div class="stat-label">${icon} ${name}</div><div class="stat-value">${val}</div>
 ${["str","agi","def"].includes(key)&&state.freePoints?`<button class="action gold" data-up="${key}" style="margin-top:8px;padding:6px 10px">+</button>`:""}</div>`
}

function inventory(){
 const slots=[["head","🪖","Голова"],["armor","🛡️","Броня"],["weapon","🔫","Оружие"],["second","🔪","Второе"],["clothes","👕","Одежда"],["shoes","👟","Обувь"]];
 return shell("Инвентарь",`
 <div class="hero"><h1>🎒 Экипировка</h1><p>Снаряжение напрямую влияет на характеристики.</p></div>
 <div class="equipment" style="margin-top:12px">${slots.map(s=>`<div class="slot"><div class="slot-icon">${s[1]}</div><div class="slot-name">${s[2]}</div><div class="slot-value">${state.equipment[s[0]]||"Пусто"}</div></div>`).join("")}</div>
 <div class="section-title">Предметы</div>
 ${state.inventory.length?`<div class="list">${state.inventory.map((it,i)=>`<div class="list-row row"><div class="item"><span class="item-icon">${it.icon}</span><div><b>${it.name}</b><div class="muted">${it.desc}</div></div></div><button class="action" data-equip="${i}">Надеть</button></div>`).join("")}</div>`:`<div class="card muted">Инвентарь пуст. Загляни в магазин.</div>`}
 `)
}

function arena(){
 const e=state.enemy;
 return shell("Арена",`
 <div class="arena">
  <div class="row"><div><b style="font-size:22px">🥊 Бойцовская арена</b><div class="muted">${e.name}</div></div><span>Награда: 💰 200</span></div>
  <div class="fighters">
   <div class="fighter"><div class="emoji">🧍</div><b>Ты</b><div class="muted">${state.hp}/${state.maxHp}</div><div class="hpbar"><i style="width:${state.hp/state.maxHp*100}%"></i></div></div>
   <div class="fighter enemy"><div class="emoji">🥊</div><b>${e.name}</b><div class="muted">${e.hp}/${e.maxHp}</div><div class="hpbar"><i style="width:${e.hp/e.maxHp*100}%"></i></div></div>
  </div>
  <div class="muted">Куда атакуем?</div>
  <div class="zones">${["head","body","legs"].map(z=>`<button class="zone ${state.attackZone===z?"active":""}" data-attack-zone="${z}">${z==="head"?"🧠 Голова":z==="body"?"🎯 Корпус":"🦵 Ноги"}</button>`).join("")}</div>
  <div class="muted">Что блокируем?</div>
  <div class="zones">${["head","body","legs"].map(z=>`<button class="zone ${state.blockZone===z?"active":""}" data-block-zone="${z}">${z==="head"?"🧠 Голова":z==="body"?"🎯 Корпус":"🦵 Ноги"}</button>`).join("")}</div>
  <button class="action" data-fight style="width:100%;padding:14px">⚔️ Сделать ход</button>
  <div class="log" id="combatLog">Выбери атаку и блок, затем сделай ход.</div>
 </div>
 `)
}

function fight(){
 if(state.energy<10){toast("Недостаточно энергии");return}
 if(!state.attackZone||!state.blockZone){toast("Выбери атаку и блок");return}
 state.energy-=10;
 const enemyAttack=["head","body","legs"][Math.floor(Math.random()*3)];
 const hit=Math.random()<0.88;
 const blocked=enemyAttack===state.blockZone;
 let log=[];
 if(hit){
   let dmg=state.damage+Math.floor(state.strength/4);
   if(Math.random()*100<state.crit){dmg=Math.floor(dmg*1.8);log.push("💥 Критический удар!");}
   state.enemy.hp=Math.max(0,state.enemy.hp-dmg); log.push(`⚔️ Ты ударил в ${zoneName(state.attackZone)} на ${dmg} урона.`);
 }else log.push("💨 Ты промахнулся.");
 if(state.enemy.hp>0){
   if(blocked) log.push(`🛡️ Ты заблокировал удар в ${zoneName(enemyAttack)}.`);
   else {let d=Math.max(1,state.enemy.damage-state.defense);state.hp=Math.max(0,state.hp-d);log.push(`🥊 Враг нанес ${d} урона.`);}
 }
 if(state.enemy.hp<=0){
   state.wins++;state.coins+=200;state.exp+=40;state.tasks.fight=true;log.push("🎉 Победа! +200 💰, +40 XP");
   if(state.exp>=state.maxExp){state.exp-=state.maxExp;state.level++;state.maxExp=Math.floor(state.maxExp*1.3);state.freePoints+=3;state.maxHp+=10;state.hp=state.maxHp;log.push(`🌟 Новый уровень: ${state.level}`)}
   resetEnemy();
 }else if(state.hp<=0){state.losses++;log.push("💀 Поражение. Здоровье восстановлено.");state.hp=state.maxHp}
 state.attackZone=null;state.blockZone=null;save();render();setTimeout(()=>{const l=document.getElementById("combatLog");if(l)l.innerHTML=log.join("<br>")},0)
}
function zoneName(z){return z==="head"?"голову":z==="body"?"корпус":"ноги"}
function resetEnemy(){state.enemy={name:["Уличный хулиган","Дворовый боец","Грабитель"][Math.floor(Math.random()*3)],hp:100+state.level*15,maxHp:100+state.level*15,damage:12+state.level*2}}

function shop(){
 const items=[
  {id:"brass",icon:"🥊",name:"Кастеты",desc:"Урон +5",price:150,slot:"weapon"},
  {id:"knife",icon:"🔪",name:"Нож",desc:"Урон +12",price:400,slot:"weapon"},
  {id:"helmet",icon:"🪖",name:"Шлем",desc:"Защита +4",price:250,slot:"head"},
  {id:"armor",icon:"🛡️",name:"Лёгкая броня",desc:"Защита +8",price:600,slot:"armor"},
  {id:"shoes",icon:"👟",name:"Кроссовки",desc:"Ловкость +4",price:300,slot:"shoes"},
  {id:"shirt",icon:"👕",name:"Тактическая одежда",desc:"HP +20",price:350,slot:"clothes"}
 ];
 return shell("Магазин",`<div class="shop-grid">${items.map((it,i)=>`<div class="shop-card"><div class="item"><span class="item-icon">${it.icon}</span><b>${it.name}</b></div><div class="muted" style="margin-top:8px">${it.desc}</div><div class="shop-price">💰 ${it.price}</div><button class="action" data-buy="${i}" style="width:100%">Купить</button></div>`).join("")}</div>`)
}
function buy(i){
 const items=[
  ["🥊","Кастеты","Урон +5",150,"weapon"],["🔪","Нож","Урон +12",400,"weapon"],["🪖","Шлем","Защита +4",250,"head"],
  ["🛡️","Лёгкая броня","Защита +8",600,"armor"],["👟","Кроссовки","Ловкость +4",300,"shoes"],["👕","Тактическая одежда","HP +20",350,"clothes"]
 ];
 const x=items[i]; if(state.coins<x[3]){toast("Не хватает денег");return}
 state.coins-=x[3];state.inventory.push({icon:x[0],name:x[1],desc:x[2],slot:x[4]});state.tasks.buy=true;save();toast("Предмет куплен");render()
}

function equip(i){
 const it=state.inventory[i];if(!it)return;
 const old=state.equipment[it.slot];state.equipment[it.slot]=it.name;state.inventory.splice(i,1);if(old)state.inventory.push({icon:"📦",name:old,desc:"Снятый предмет",slot:it.slot});
 if(it.name==="Кастеты")state.damage+=5;if(it.name==="Нож")state.damage+=12;if(it.name==="Шлем")state.defense+=4;if(it.name==="Лёгкая броня")state.defense+=8;if(it.name==="Кроссовки")state.agility+=4;if(it.name==="Тактическая одежда"){state.maxHp+=20;state.hp+=20}
 save();toast("Экипировано");render()
}

function territory(){return shell("Территории",`
 <div class="card lock"><div class="item"><span class="item-icon">🗺️</span><div><b>Районы города</b><div class="muted">Захватывай территории и получай доход.</div></div></div><div class="notice">🔒 Открывается с 2 уровня.</div></div>
 <div class="list" style="margin-top:12px">
 ${["Центр","Промзона","Порт","Старый район"].map((x,i)=>`<div class="list-row row lock"><div><b>${["🏙️","🏭","⚓","🏚️"][i]} ${x}</b><div class="muted">Доход: ${100+i*75} 💰/час</div></div><span>🔒</span></div>`).join("")}
 </div>`)}
function tasks(){return shell("Задания",`
 <div class="list">
 ${taskRow("⚔️","Проведи бой","Сразись на арене один раз",state.tasks.fight,100)}
 ${taskRow("🏪","Первая покупка","Купи любой предмет",state.tasks.buy,150)}
 ${taskRow("⭐","Развитие","Получи новый уровень",state.tasks.upgrade,state.level*200)}
 </div>`)}
function taskRow(icon,title,desc,done,reward){
 return `<div class="list-row row"><div class="item"><span class="item-icon">${icon}</span><div><b>${title}</b><div class="muted">${desc}</div></div></div>${done?`<span style="color:var(--green);font-weight:900">✓ Выполнено</span>`:`<span style="color:var(--gold);font-weight:900">+${reward} 💰</span>`}</div>`
}
function rating(){return shell("Рейтинг",`<div class="card"><div class="row"><b>🏆 Твой рейтинг</b><b>#${Math.max(1,100-state.wins*3)}</b></div><div class="muted" style="margin-top:6px">Побед: ${state.wins} · Поражений: ${state.losses}</div></div><div class="list" style="margin-top:12px">${["Legend","StreetKing","Shadow","Hunter","Player"].map((n,i)=>`<div class="list-row row"><div class="item"><span style="font-size:22px">${["🥇","🥈","🥉","🏅","🎖️"][i]}</span><b>${n}</b></div><span>${120-i*11} ур.</span></div>`).join("")}</div>`)}
function clan(){return shell("Клан",`<div class="hero"><h1>👥 Клан</h1><p>Создай свою команду и вместе захватывайте город.</p><button class="action" style="margin-top:14px" onclick="toast('Скоро будет доступно')">Создать клан</button></div><div class="card"><b>Война кланов</b><p class="muted">Функция готовится. Здесь появятся бои кланов, общий банк и территории.</p></div>`)}
function settings(){return shell("Настройки",`<div class="list">
 <div class="list-row row"><div><b>📱 Telegram WebApp</b><div class="muted">Игра готова для запуска внутри Telegram</div></div><span>✓</span></div>
 <button class="list-row row" data-reset><b>♻️ Сбросить прогресс</b><span>›</span></button>
 </div>`)}
function bind(){
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>setPage(b.dataset.page));
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>setPage(b.dataset.open));
 document.querySelectorAll("[data-attack-zone]").forEach(b=>b.onclick=()=>{state.attackZone=b.dataset.attackZone;render()});
 document.querySelectorAll("[data-block-zone]").forEach(b=>b.onclick=()=>{state.blockZone=b.dataset.blockZone;render()});
 const f=document.querySelector("[data-fight]");if(f)f.onclick=fight;
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(+b.dataset.buy));
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equip(+b.dataset.equip));
 document.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>upgrade(b.dataset.up));
 const r=document.querySelector("[data-reset]");if(r)r.onclick=()=>{if(confirm("Удалить весь прогресс?")){localStorage.removeItem(KEY);state=load();render();toast("Прогресс сброшен")}}
}
function upgrade(k){
 if(!state.freePoints)return;
 state[k==="str"?"strength":k==="agi"?"agility":"defense"]++;state.freePoints--;state.tasks.upgrade=state.freePoints===0;save();render()
}
render();
