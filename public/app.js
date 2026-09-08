(() => {
"use strict";
const TG = window.Telegram?.WebApp;
try{TG?.ready();TG?.expand?.()}catch(e){}

const KEY="territory_classic_save_v3";
const zones=["Голова","Грудь","Живот","Пояс","Ноги"];
const blocks=[["Голова","Грудь"],["Грудь","Живот"],["Живот","Пояс"],["Пояс","Ноги"]];
const SHOP=[
 {id:"knife",name:"Нож новичка",price:50,level:1,damage:5,hp:0,slot:"weapon",icon:"🔪"},
 {id:"knuckles",name:"Кастет",price:120,level:1,damage:12,hp:0,slot:"weapon",icon:"🥊"},
 {id:"jacket",name:"Кожаная куртка",price:200,level:1,damage:0,hp:40,slot:"armor",icon:"🧥"},
 {id:"sword",name:"Меч Наемника",price:450,level:2,damage:25,hp:0,slot:"weapon",icon:"⚔️"}
];
const BOTS=[
 {id:"rat",name:"Сумасшедшая Крыса",short:"Крыса",level:1,hp:50,maxHp:50,damage:7,xp:15,ria:20,drop:"knife",dropChance:.20,icon:"🐀"},
 {id:"thief",name:"Мародер Окраины",short:"Мародер",level:2,hp:120,maxHp:120,damage:11,xp:35,ria:50,drop:"knuckles",dropChance:.15,icon:"🗡️"},
 {id:"boss",name:"Главарь Банды",short:"Главарь",level:3,hp:250,maxHp:250,damage:16,xp:70,ria:100,drop:"jacket",dropChance:.10,icon:"☠️"}
];
const defaultState={
 name:"Странник",level:1,xp:0,ria:500,gold:0,hp:100,energy:100,
 base:{strength:10,agility:5,endurance:5},points:0,
 inventory:[],equipped:{weapon:null,armor:null},location:"square",view:"home",
 chat:[
  {t:"02:00",u:"Админ",m:"Добро пожаловать в Территорию!"},
  {t:"02:01",u:"Странник",m:"Кто в бой?"}
 ],combat:null,combatLog:[]
};
let S=load();

function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaultState}}}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function now(){return new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function item(id){return SHOP.find(x=>x.id===id)}
function bonusDamage(){const i=item(S.equipped.weapon);return i?.damage||0}
function bonusHp(){const i=item(S.equipped.armor);return i?.hp||0}
function maxHp(){return 100+S.base.endurance*5+bonusHp()}
function strength(){return S.base.strength}
function playerDamage(){return Math.max(1,Math.floor(strength()+bonusDamage()))}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>e.classList.remove("show"),1800)}
function renderTop(){
 document.getElementById("topName").textContent=S.name;
 document.getElementById("topLevel").textContent=S.level;
 document.getElementById("topRia").textContent=S.ria;
 document.getElementById("topGold").textContent=S.gold;
 const mh=maxHp(); S.hp=Math.min(S.hp,mh);
 document.getElementById("hpText").textContent=`${S.hp} / ${mh}`;
 document.getElementById("energyText").textContent=`${S.energy} / 100`;
 document.getElementById("xpText").textContent=`${S.xp} / 100`;
 document.getElementById("hpBar").style.width=(S.hp/mh*100)+"%";
 document.getElementById("energyBar").style.width=S.energy+"%";
 document.getElementById("xpBar").style.width=S.xp+"%";
}
function go(view,location=S.location){S.view=view;S.location=location;save();render()}
function layout(body){
 document.getElementById("screen").innerHTML=body;
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===S.view));
 renderTop();bind();
}
function render(){
 if(S.combat)return renderCombat();
 if(S.view==="character")return renderCharacter();
 if(S.view==="inventory")return renderInventory();
 if(S.view==="shop")return renderShop();
 if(S.view==="arena")return renderArena();
 renderHome();
}
function renderHome(){
 const loc=S.location;
 const data={
  square:{title:"Центральная площадь",desc:"Старый центр города. Здесь сходятся торговцы, бойцы и наёмники.",art:"ЦЕНТРАЛЬНЫЙ РАЙОН",players:["Wanderer","Shadow","Striker"]},
  outskirts:{title:"Окраина",desc:"Пыльная дорога заканчивается высокой травой. Здесь лучше не задерживаться.",art:"ОКРАИНА",players:["Shadow","Raven"]},
  hospital:{title:"Госпиталь",desc:"Тихое место, где можно восстановить силы после тяжёлого боя.",art:"ГОСПИТАЛЬ",players:["Медик"]},
  bank:{title:"Банк",desc:"Хранилище города. Ваш баланс Ria защищён.",art:"ГОРОДСКОЙ БАНК",players:["Кассир"]},
  shop:{title:"Лавка торговца",desc:"Старый торговец раскладывает оружие и броню на прилавке.",art:"МАГАЗИН",players:["Торговец"]}
 }[loc];
 const links= loc==="square" ? `
  <button class="link" data-action="arena">→ Перейти на Арену</button>
  <button class="link" data-action="shop">→ Зайти в Магазин</button>
  <button class="link" data-action="bank">→ Пойти в Банк</button>
  <button class="link" data-action="outskirts">→ Выйти на Окраину</button>
  <button class="link" data-action="hospital">→ В Госпиталь</button>` :
 loc==="outskirts" ? `<button class="link" data-action="search">→ Искать врагов в траве</button><button class="link" data-action="home">→ Вернуться на площадь</button>` :
 loc==="hospital" ? `<button class="link" data-action="rest">→ Отдохнуть и восстановить силы</button><button class="link" data-action="home">→ На площадь</button>` :
 loc==="bank" ? `<button class="link" data-action="home">→ На площадь</button>` :
 `<button class="link" data-action="shop">→ Смотреть товары</button><button class="link" data-action="home">→ На площадь</button>`;
 layout(`
  <section class="panel">
   <div class="panel-title">${esc(data.title)}</div><div class="panel-body">
    <div class="location-art"><div class="art-sign">${esc(data.art)}</div><div class="buildings">
      <div class="building"><b>🏛</b>Арена</div><div class="building"><b>⚒</b>Лавка</div><div class="building"><b>🏦</b>Банк</div>
    </div></div>
    <p><b>Описание:</b> ${esc(data.desc)}</p>
    <p class="muted">В этой локации сейчас:</p><div class="players">${data.players.map(x=>`<span class="player">${esc(x)}</span>`).join("")}</div>
    <h3 style="margin-top:9px">Куда пойти:</h3><div class="links">${links}</div>
   </div>
  </section>
  ${loc==="bank"?`<section class="panel"><div class="panel-title">Счёт</div><div class="panel-body"><b>${S.ria} Ria</b> — доступный баланс</div></section>`:""}
  ${loc==="hospital"?`<section class="panel"><div class="panel-title">Лечение</div><div class="panel-body"><p>Здесь вы полностью восстанавливаете HP и энергию.</p><button class="btn" data-action="rest">ОТДОХНУТЬ</button></div></section>`:""}
  <section class="panel"><div class="panel-title">Игровой чат</div><div class="panel-body"><div class="chat">
   <div class="chatlog" id="chatlog">${S.chat.map(m=>`<div class="msg">[${esc(m.t)}] <b data-user="${esc(m.u)}">${esc(m.u)}</b>: ${esc(m.m)}</div>`).join("")}</div>
   <form class="chatform" id="chatform"><input id="chatinput" maxlength="160" placeholder="Сообщение..."><button class="btn">Отправить</button></form>
  </div></div></section>
 `);
 const c=document.getElementById("chatlog");if(c)c.scrollTop=c.scrollHeight;
}
function renderShop(){
 layout(`<section class="panel"><div class="panel-title">Лавка торговца</div><div class="panel-body">
 <p class="muted">Ваш кошелёк: <b>${S.ria} Ria</b>. Все купленные вещи попадают в Инвентарь.</p>
 <div class="grid">${SHOP.map(i=>`<div class="item"><div class="item-head"><b>${i.icon} ${esc(i.name)}</b><span class="price">${i.price} Ria</span></div>
 <div class="req">Требуется уровень ${i.level}. ${i.damage?`+${i.damage} к Урону.`:""} ${i.hp?`+${i.hp} к Макс. HP.`:""}</div>
 <div class="item-actions"><button class="btn" data-buy="${i.id}" ${S.level<i.level||S.ria<i.price?"disabled":""}>Купить</button></div></div>`).join("")}</div>
 </div></section>`);
}
function renderInventory(){
 const inv=S.inventory.map(id=>item(id)).filter(Boolean);
 layout(`<section class="panel"><div class="panel-title">Инвентарь</div><div class="panel-body">
 <div class="equip">${["weapon","armor"].map(slot=>{const id=S.equipped[slot],it=item(id);return `<div class="slot"><b>${slot==="weapon"?"⚔ Оружие":"🛡 Броня"}</b>${it?`${it.icon} ${esc(it.name)}<br><button class="btn alt" data-unequip="${slot}">Снять</button>`:"— пусто"}</div>`}).join("")}</div>
 <h3 style="margin-top:10px">Сумка</h3>
 ${inv.length?`<div class="grid">${inv.map(i=>`<div class="item"><div class="item-head"><b>${i.icon} ${esc(i.name)}</b><span>${i.damage?`+${i.damage} урон`:`+${i.hp} HP`}</span></div><div class="item-actions"><button class="btn" data-equip="${i.id}">${S.equipped[i.slot]===i.id?"Надето":"Надеть"}</button></div></div>`).join("")}`:"<div class='empty'>Сумка пуста. Купите вещь в Магазине или получите её в бою.</div>"}
 </div></section>`);
}
function renderCharacter(){
 layout(`<section class="panel"><div class="panel-title">Персонаж — ${esc(S.name)}</div><div class="panel-body">
 <div class="notice">Уровень <b>${S.level}</b>. Свободных очков характеристик: <b>${S.points}</b></div>
 ${[["strength","Сила","Увеличивает урон"],["agility","Ловкость","Шанс уклонения"],["endurance","Выносливость","+5 максимального HP"]].map(([k,n,d])=>`<div class="statrow"><span><b>${n}</b><br><small class="muted">${d}</small></span><span><b>${S.base[k]}</b> <button class="btn stat-plus" data-stat="${k}" ${S.points<=0?"disabled":""}>+</button></span></div>`).join("")}
 <p style="margin-top:9px">Макс. HP: <b>${maxHp()}</b> · Урон: <b>${playerDamage()}</b></p>
 </div></section>`);
}
function renderArena(){
 layout(`<section class="panel"><div class="panel-title">Арена — список противников</div><div class="panel-body">
 <p class="muted">Выберите противника. После нажатия «Атаковать» начинается пошаговый бой.</p>
 <div class="grid">${BOTS.map(b=>`<div class="item"><div class="item-head"><b>${b.icon} [Бот] ${esc(b.name)}</b><span>ур. ${b.level}</span></div>
 <p>HP: <b>${b.hp}</b> · Урон: ${b.damage}</p><div class="req">Награда: ${b.xp} опыта, ${b.ria} Ria. Дроп ${Math.round(b.dropChance*100)}%: ${esc(item(b.drop).name)}.</div>
 <div class="item-actions"><button class="btn danger" data-fight="${b.id}">⚔ АТАКОВАТЬ</button></div></div>`).join("")}</div>
 </div></section>`);
}
function renderCombat(){
 const c=S.combat,b=BOTS.find(x=>x.id===c.botId);
 if(!b){S.combat=null;return renderArena()}
 layout(`<section class="panel"><div class="panel-title">⚔ БОЙ — ${esc(b.name)}</div><div class="panel-body">
 <div class="combatants">
  <div class="fighter"><div class="avatar">♙</div><b>${esc(S.name)}</b> · ур. ${S.level}<div class="bar hp"><i style="width:${S.hp/maxHp()*100}%"></i></div><small>${S.hp}/${maxHp()} HP</small></div>
  <div class="fighter enemy"><div class="avatar">${b.icon}</div><b>${esc(b.name)}</b> · ур. ${b.level}<div class="bar hp"><i style="width:${b.hp/b.maxHp*100}%"></i></div><small>${b.hp}/${b.maxHp} HP</small></div>
 </div>
 <div class="panel" style="margin-top:9px"><div class="panel-title">1. Куда ударить?</div><div class="panel-body"><div class="zones">${zones.map(z=>`<label class="zone ${c.strike===z?"active":""}"><input type="radio" name="strike" value="${esc(z)}" ${c.strike===z?"checked":""}>${esc(z)}</label>`).join("")}</div></div></div>
 <div class="panel"><div class="panel-title">2. Как блокировать?</div><div class="panel-body"><div class="zones">${blocks.map((z,i)=>`<label class="zone ${c.block===i?"active":""}"><input type="radio" name="block" value="${i}" ${c.block===i?"checked":""}>${z[0]} + ${z[1]}</label>`).join("")}</div></div></div>
 <button class="btn danger" data-strike-button ${c.strike&&c.block!==null?"":"disabled"}>⚔ УДАРИТЬ</button>
 <h3 style="margin-top:9px">Боевой лог</h3><div class="log" id="combatlog">${S.combatLog.map(x=>`<div class="${x.cls||""}">${x.html||esc(x)}</div>`).join("")}</div>
 </div></section>`);
 const l=document.getElementById("combatlog");if(l)l.scrollTop=l.scrollHeight;
}
function startFight(id){const b=BOTS.find(x=>x.id===id);S.combat={botId:id,strike:null,block:null};S.combatLog=[`[${now()}] Вы вступили в бой с ${b.name}.`];save();render()}
function log(text,cls=""){S.combatLog.push({html:text,cls});}
function attack(){
 const c=S.combat,b=BOTS.find(x=>x.id===c.botId);if(!c?.strike||c.block===null)return;
 const enemyStrike=zones[Math.floor(Math.random()*zones.length)];
 const enemyBlock=blocks[Math.floor(Math.random()*blocks.length)];
 let pdmg=0;
 const blocked=enemyBlock.includes(c.strike);
 if(blocked){pdmg=Math.random()<.35?1:0;log(`[${now()}] Вы ударили ${b.short} в ${c.strike} — БЛОК. Урон: -${pdmg} HP.`)}
 else if(Math.random()<.10){pdmg=playerDamage()*2;log(`[${now()}] <span class="crit">CRIT! Вы сокрушили ${b.short} в ${c.strike} на -${pdmg} HP!</span>`)}
 else if(Math.random()<.10){pdmg=0;log(`[${now()}] <span class="evade">${b.short} уклонился от вашего удара!</span>`)}
 else{pdmg=playerDamage();log(`[${now()}] Вы ударили ${b.short} в ${c.strike} на -${pdmg} HP.`)}
 b.hp=Math.max(0,b.hp-pdmg);
 if(b.hp<=0)return winFight(b);
 const playerBlock=blocks[c.block];
 let edmg=0;
 if(playerBlock.includes(enemyStrike)){edmg=0;log(`[${now()}] ${b.short} ударил вас в ${enemyStrike} (Блок) на -0 HP.`)}
 else if(Math.random()<.10){edmg=0;log(`[${now()}] <span class="evade">Вы уклонились от удара ${b.short}!</span>`)}
 else{edmg=Math.max(1,b.damage+Math.floor(Math.random()*5)-Math.floor(S.base.endurance/3));log(`[${now()}] ${b.short} ударил вас в ${enemyStrike} на -${edmg} HP.`)}
 S.hp=Math.max(0,S.hp-edmg);
 if(S.hp<=0){log(`[${now()}] <span class="defeat">Поражение. Вы отправлены в Госпиталь.</span>`,"defeat");S.hp=1;S.energy=Math.max(0,S.energy-15);S.combat={...c,ended:"defeat",strike:null,block:null};save();return render()}
 c.strike=null;c.block=null;S.combat=c;save();render()
}
function winFight(b){
 S.xp+=b.xp;S.ria+=b.ria;let drop=null;
 if(Math.random()<b.dropChance){drop=b.drop;S.inventory.push(drop)}
 log(`[${now()}] <span class="victory">ПОБЕДА! Вы получили ${b.xp} опыта и ${b.ria} Ria${drop?`. Выпал предмет: ${item(drop).name}!`:"."}</span>`,"victory");
 while(S.xp>=100){S.xp-=100;S.level++;S.points+=3;toast(`Новый уровень! Теперь уровень ${S.level}`)}
 S.combat={botId:b.id,ended:"victory",strike:null,block:null,reward:`Победа! +${b.xp} XP, +${b.ria} Ria${drop?`, дроп: ${item(drop).name}`:""}`};save();render()
}
function buy(id){const i=item(id);if(!i||S.level<i.level||S.ria<i.price)return;S.ria-=i.price;S.inventory.push(id);save();toast(`Куплено: ${i.name}`);render()}
function equip(id){const i=item(id);if(!i)return;S.equipped[i.slot]=id;save();toast(`Надето: ${i.name}`);render()}
function unequip(slot){S.equipped[slot]=null;save();render()}
function addStat(k){if(S.points<=0)return;S.base[k]++;S.points--;S.hp=Math.min(S.hp,maxHp());save();render()}
function searchEnemy(){const b=BOTS[Math.floor(Math.random()*BOTS.length)];toast(`В траве появился ${b.name}!`);startFight(b.id)}
function rest(){S.hp=maxHp();S.energy=100;save();toast("Силы полностью восстановлены");render()}
function sendChat(){
 const input=document.getElementById("chatinput"),m=input?.value.trim();if(!m)return;
 S.chat.push({t:now(),u:S.name,m});if(S.chat.length>80)S.chat.shift();save();render();
}
function bind(){
 document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>go(b.dataset.nav));
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(b.dataset.buy));
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equip(b.dataset.equip));
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequip(b.dataset.unequip));
 document.querySelectorAll("[data-stat]").forEach(b=>b.onclick=()=>addStat(b.dataset.stat));
 document.querySelectorAll("[data-fight]").forEach(b=>b.onclick=()=>startFight(b.dataset.fight));
 document.querySelectorAll("[data-user]").forEach(b=>b.onclick=()=>{const i=document.getElementById("chatinput");if(i)i.value="@"+b.dataset.user+" "});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{
  const a=b.dataset.action;
  if(a==="home")go("home","square"); else if(a==="arena")go("arena","arena"); else if(a==="shop")go("shop","shop");
  else if(a==="bank")go("home","bank"); else if(a==="outskirts")go("home","outskirts"); else if(a==="hospital")go("home","hospital");
  else if(a==="rest")rest(); else if(a==="search")searchEnemy();
 });
 document.querySelectorAll('input[name="strike"]').forEach(x=>x.onchange=()=>{S.combat.strike=x.value;save();render()});
 document.querySelectorAll('input[name="block"]').forEach(x=>x.onchange=()=>{S.combat.block=Number(x.value);save();render()});
 const sb=document.querySelector("[data-strike-button]");if(sb)sb.onclick=attack;
 const form=document.getElementById("chatform");if(form)form.onsubmit=e=>{e.preventDefault();sendChat()};
}
render();
})();