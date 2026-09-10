const ZONES = ["Голова","Грудь","Живот","Пояс","Ноги"];
const ENEMIES = [
  {name:"Бандит",hp:110,atk:14,def:7,reward:90,xp:35},
  {name:"Наёмник",hp:145,atk:17,def:9,reward:125,xp:50},
  {name:"Варяг",hp:180,atk:21,def:11,reward:170,xp:70},
  {name:"Охотник",hp:210,atk:24,def:13,reward:220,xp:90},
  {name:"Страж крепости",hp:250,atk:28,def:15,reward:300,xp:120},
  {name:"Чемпион арены",hp:300,atk:33,def:18,reward:420,xp:160}
];

const START = {
  name:"Игрок", hp:120, maxHp:120, coins:1000, level:1, xp:0, maxXp:100,
  strength:12, agility:9, defense:5, freePoints:0, energy:20, maxEnergy:20,
  wins:0, losses:0, rating:1000, materials:10, guild:"Sdolars", guildLevel:1,
  guildTreasury:1200, dailyClaimed:false, dailyStreak:1, siege:0,
  inventory:[
    {id:"knife",name:"Нож",type:"Оружие",damage:6,price:220},
    {id:"armor",name:"Стальная броня",type:"Броня",defense:12,price:800},
    {id:"medkit",name:"Аптечка",type:"Расходник",heal:60,price:80,qty:2}
  ],
  equipped:{weapon:"knife",armor:"armor"},
  achievements:{first:false,rich:false,warrior:false},
  quest:{kills:0,done:false},
  heroes:0
};

const HTML = String.raw`<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Territory — Sdolars</title>
<style>
*{box-sizing:border-box}html,body{margin:0;background:#020b12;color:#eef7fb;font-family:Arial,sans-serif;min-height:100%;font-size:14px}
button{font:inherit;cursor:pointer}.app{max-width:520px;margin:auto;min-height:100vh;background:linear-gradient(#061521,#08243a 42%,#04121e);position:relative;overflow:hidden}
.hud{position:sticky;top:0;z-index:20;padding:8px;background:#061522eF;border-bottom:1px solid #17618a;backdrop-filter:blur(8px)}
.hudtop{display:flex;align-items:center;gap:7px}.avatar{width:44px;height:44px;border:2px solid #248ec5;border-radius:10px;display:grid;place-items:center;background:#0a2537;font-size:25px}
.name{font-weight:900;font-size:17px}.sub{font-size:11px;color:#94b7c8;margin-top:2px}
.resources{margin-left:auto;display:flex;gap:4px}.res{border:1px solid #185d80;background:#082b40;border-radius:7px;padding:5px 6px;font-size:10px;white-space:nowrap}
.main{padding:10px 10px 82px}.hero{min-height:190px;border:1px solid #1b6386;border-radius:12px;background:radial-gradient(circle at 50% 20%,#173b4d,#071a28 70%);display:flex;flex-direction:column;align-items:center;justify-content:end;padding:10px;box-shadow:inset 0 0 50px #0007}
.heroart{font-size:82px;filter:drop-shadow(0 8px 8px #000);line-height:1}.citytitle{font-size:19px;font-weight:900;color:#ffd34b}.citysub{font-size:10px;color:#8fb5c7}
.quest{margin-top:8px;border:1px solid #8b691c;border-radius:9px;padding:8px;background:#241c08}.quest b{color:#ffd34b}.bar{height:5px;background:#173449;border-radius:5px;overflow:hidden;margin-top:5px}.fill{height:100%;background:#f0b82f}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:8px}.card{background:#08263a;border:1px solid #1c668a;border-radius:9px;padding:9px}.card h3{margin:0 0 5px;font-size:13px}.card p{margin:3px 0;color:#a8c4d0;font-size:10px;line-height:1.4}.btn{width:100%;border:1px solid #238bc0;border-radius:7px;background:#0b3b55;color:#f1fbff;padding:8px 5px;font-weight:900;font-size:10px}.btn.gold{background:linear-gradient(#ffd95c,#c98812);color:#18202a;border-color:#ffe17d}.btn.red{border-color:#a93652;background:#4a1724}.wide{grid-column:1/-1}.bottom{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(520px,100%);z-index:30;display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:5px;background:#04131eeF;border-top:1px solid #175777}.nav{height:42px;border:1px solid #175b7c;border-radius:7px;background:#082b3e;color:#cfe7f1;font-size:8px;font-weight:900}.nav.active{border-color:#2aa9e6;color:#ffd34b}
.modal{position:fixed;inset:0;z-index:100;background:#000a;display:none;align-items:flex-end}.modal.show{display:flex}.sheet{width:min(520px,100%);max-height:94vh;overflow:auto;background:#061b2b;border:2px solid #238bc0;border-bottom:0;border-radius:16px 16px 0 0;padding:10px;box-shadow:0 -8px 35px #000b}.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.head b{font-size:18px;color:#ffd34b}.x{width:34px;height:32px;border:1px solid #397a98;background:#102f40;color:#fff;border-radius:7px;font-size:19px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.stat{background:#092b40;border:1px solid #1b6384;border-radius:7px;padding:7px;text-align:center;font-size:10px}.stat b{display:block;font-size:15px;color:#ffd34b}.list{display:grid;gap:6px}.item{display:flex;align-items:center;gap:7px;background:#092a3d;border:1px solid #1a5d7d;border-radius:8px;padding:7px}.item .grow{flex:1}.item b{font-size:11px}.item small{display:block;color:#9bb9c5;font-size:9px;margin-top:2px}
.battle{align-items:center}.battle .sheet{max-height:100vh;height:100%;border-radius:0;display:flex;flex-direction:column;padding:10px}.fighttitle{color:#ffd34b;font-size:19px;font-weight:900}.fighters{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0}.fighter{border:2px solid #238bc0;border-radius:11px;background:#071c2b;padding:8px;text-align:center}.fighter.enemy{border-color:#a63d59}.fighter .face{font-size:66px;line-height:1}.fighter b{font-size:13px}.hpbar{height:7px;background:#351722;border-radius:8px;overflow:hidden;margin:5px 0}.hpbar span{display:block;height:100%;background:linear-gradient(90deg,#ff3c59,#ffb13d)}.battleinfo{background:#092942;border:1px solid #1c6688;border-radius:9px;padding:8px;margin-bottom:7px}.turn{font-weight:900;font-size:16px}.pick{background:#092942;border:1px solid #1c6688;border-radius:9px;padding:8px;margin-bottom:7px}.pick h3{margin:0 0 6px;font-size:14px}.zonegrid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.zone{padding:9px 2px;border:1px solid #267fa9;border-radius:6px;background:#0b3a53;color:#edf9ff;font-weight:900;font-size:9px}.zone.sel{background:#1e79a0;border-color:#62cbf4;color:#fff}.log{flex:1;min-height:45px;overflow:auto;background:#061522;border:1px solid #16465f;border-radius:8px;padding:7px;font-size:10px;color:#aac4ce}.fightaction{margin-top:7px}
.toast{position:fixed;left:50%;bottom:66px;transform:translateX(-50%);background:#071b29;border:1px solid #39a9de;border-radius:8px;padding:8px 12px;z-index:200;display:none;font-weight:900;font-size:11px}.toast.show{display:block}
@media(max-width:390px){.resources .res{padding:4px;font-size:9px}.zone{font-size:8px;padding:8px 1px}}
</style></head>
<body><div class="app">
<div class="hud"><div class="hudtop"><div class="avatar">⚔️</div><div><div class="name" id="name">Игрок</div><div class="sub" id="level">Глава 1 · Уровень 1</div></div><div class="resources"><div class="res">🪙 <span id="coins">0</span></div><div class="res">⚡ <span id="energy">0</span></div></div></div></div>
<main class="main">
<section class="hero"><div class="heroart">🧔‍♂️</div><div class="citytitle">Sdolars</div><div class="citysub">Город наёмников и бойцов</div></section>
<section class="quest"><b>📜 Текущее задание</b><div id="quest">Победи 3 противников</div><div class="bar"><div id="questfill" class="fill" style="width:0%"></div></div></section>
<div class="grid">
<div class="card"><h3>⚔️ Арена</h3><p>Тактический бой. 1 атака + 2 зоны защиты.</p><button class="btn gold" onclick="Game.startBattle()">В БОЙ</button></div>
<div class="card"><h3>🗺️ Районы</h3><p>Открывай районы за победы и двигайся по кампании.</p><button class="btn" onclick="Game.open('world')">ОТКРЫТЬ</button></div>
<div class="card"><h3>🛒 Рынок</h3><p>Оружие, броня и расходники.</p><button class="btn" onclick="Game.open('shop')">МАГАЗИН</button></div>
<div class="card"><h3>🔨 Кузница</h3><p>Улучшение экипировки и ресурсы.</p><button class="btn" onclick="Game.open('forge')">КУЗНИЦА</button></div>
<div class="card"><h3>👥 Гильдия</h3><p>Sdolars · казна · осада · вклад.</p><button class="btn" onclick="Game.open('guild')">ГИЛЬДИЯ</button></div>
<div class="card"><h3>💬 Чат</h3><p>Общий чат города.</p><button class="btn" onclick="Game.open('chat')">ЧАТ</button></div>
<div class="card wide"><h3>🏆 Сезонный рейтинг</h3><p id="rating">Арена: 1000 · Сезон 1</p><button class="btn" onclick="Game.open('rating')">РЕЙТИНГ</button></div>
</div>
</main>
<nav class="bottom">
<button class="nav active" onclick="Game.home()">🏙️<br>ГОРОД</button>
<button class="nav" onclick="Game.open('hero')">👤<br>ГЕРОЙ</button>
<button class="nav" onclick="Game.open('inventory')">🎒<br>ИНВЕНТАРЬ</button>
<button class="nav" onclick="Game.open('quests')">📜<br>ЗАДАНИЯ</button>
<button class="nav" onclick="Game.open('more')">☰<br>ЕЩЁ</button>
</nav>
</div>

<div class="modal" id="modal"><div class="sheet"><div class="head"><b id="modalTitle">Territory</b><button class="x" onclick="Game.close()">×</button></div><div id="modalBody"></div></div></div>
<div class="modal battle" id="battle"><div class="sheet"><div class="head"><b class="fighttitle">⚔️ Бой — арена Sdolars</b><button class="x" onclick="Game.closeBattle()">×</button></div>
<div class="fighters"><div class="fighter"><div class="face">🧔‍♂️</div><b id="bfname">Игрок</b><div class="sub" id="bflevel"></div><div class="hpbar"><span id="pfbar"></span></div><small id="pfhp"></small></div>
<div class="fighter enemy"><div class="face">👹</div><b id="bename">Бандит</b><div class="sub">Элитный боец</div><div class="hpbar"><span id="efbar"></span></div><small id="efhp"></small></div></div>
<div class="battleinfo"><div id="enemyinfo">Противник</div></div>
<div class="pick"><h3>Атака — выбери 1 зону</h3><div class="zonegrid" id="attackZones"></div></div>
<div class="pick"><h3>Защита — выбери 2 зоны</h3><div class="zonegrid" id="defenseZones"></div><div style="margin-top:6px">Выбрано: <b id="defcount">0/2</b></div></div>
<button class="btn" id="autobtn" onclick="Game.auto()">▶ АВТОБОЙ</button>
<div class="log" id="battlelog"></div>
<div class="fightaction"><button class="btn gold" onclick="Game.move()">⚔️ СДЕЛАТЬ ХОД</button></div>
</div></div>
<div class="toast" id="toast"></div>

<script>
const tg=window.Telegram?.WebApp; try{tg?.ready();tg?.expand()}catch(e){}
let P=null, B=null;
const api=async(url,opt={})=>{
  const init=tg?.initData||"";
  opt.headers=Object.assign({"Content-Type":"application/json","X-Telegram-Init-Data":init},opt.headers||{});
  const r=await fetch(url,opt); if(!r.ok) throw new Error(await r.text()); return r.json();
};
const toast=s=>{const x=document.getElementById("toast");x.textContent=s;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)};
const saveLocal=p=>{try{localStorage.setItem("territory_clean_cache",JSON.stringify(p))}catch(e){}};
const cached=()=>{try{return JSON.parse(localStorage.getItem("territory_clean_cache")||"null")}catch(e){return null}};

async function load(){
 try{const d=await api("/api/state");P=d.player;saveLocal(P)}
 catch(e){P=cached()||null}
 if(!P){P={name:"Игрок",hp:120,maxHp:120,coins:1000,level:1,xp:0,maxXp:100,strength:12,agility:9,defense:5,energy:20,maxEnergy:20,wins:0,rating:1000,inventory:[],guild:"Sdolars",guildLevel:1,guildTreasury:1200,quest:{kills:0},materials:10}}
 render();
}
function render(){
 if(!P)return;
 document.getElementById("name").textContent=P.name;
 document.getElementById("level").textContent=\`Глава \${Math.min(5,1+Math.floor((P.wins||0)/7))} · Уровень \${P.level}\`;
 document.getElementById("coins").textContent=P.coins;
 document.getElementById("energy").textContent=\`\${P.energy}/\${P.maxEnergy}\`;
 document.getElementById("rating").textContent=\`Арена: \${P.rating} · Сезон 1\`;
 const q=Math.min(3,P.quest?.kills||0);document.getElementById("quest").textContent=q>=3?"Контракт выполнен":"Победи 3 противников";
 document.getElementById("questfill").style.width=(q/3*100)+"%";
}
function post(path,body){return api(path,{method:"POST",body:JSON.stringify(body||{})})}
const Game={
 home(){this.close()},
 close(){document.getElementById("modal").classList.remove("show")},
 closeBattle(){document.getElementById("battle").classList.remove("show");B=null;load()},
 open(tab){
   const b=document.getElementById("modalBody"),t=document.getElementById("modalTitle"); let h="";
   if(tab==="hero"){t.textContent="👤 Герой";h=\`<div class="stats"><div class="stat">Сила<b>\${P.strength}</b></div><div class="stat">Ловкость<b>\${P.agility}</b></div><div class="stat">Защита<b>\${P.defense}</b></div></div><div class="card" style="margin-top:7px"><p>Уровень \${P.level} · XP \${P.xp}/\${P.maxXp} · HP \${P.hp}/\${P.maxHp}</p><p>Победы: \${P.wins} · Поражения: \${P.losses||0}</p><button class="btn" onclick="Game.stat('strength')">＋ СИЛА</button><button class="btn" style="margin-top:5px" onclick="Game.stat('agility')">＋ ЛОВКОСТЬ</button></div>\`}
   else if(tab==="world"){t.textContent="🗺️ Районы Sdolars";const wins=P.wins||0;const z=[["⚓","Старый порт",0],["⚒️","Железный квартал",5],["🗡️","Чёрный рынок",10],["🏰","Крепость Севера",20],["👑","Трон Sdolars",35]];h=\`<div class="list">\${z.map(x=>\`<div class="item"><div>\${x[0]}</div><div class="grow"><b>\${x[1]}</b><small>\${wins>=x[2]?"Открыт":"Нужно побед: "+x[2]}</small></div><button class="btn" style="width:90px" \${wins>=x[2]?"":"disabled"} onclick="Game.startBattle()">ВОЙТИ</button></div>\`).join("")}</div>\`}
   else if(tab==="shop"){t.textContent="🛒 Рынок снаряжения";const a=[["knife2","Боевой нож","Оружие","+10 урона",450],["axe","Тяжёлый топор","Оружие","+16 урона",850],["steel2","Усиленная стальная броня","Броня","+18 защиты",1200],["med2","Аптечка","Расходник","+60 HP",100]];h=\`<div class="list">\${a.map(x=>\`<div class="item"><div class="grow"><b>\${x[1]}</b><small>\${x[2]} · \${x[3]}</small></div><button class="btn" style="width:90px" onclick="Game.buy('\${x[0]}','\${x[1]}',\${x[4]})">\${x[4]} 🪙</button></div>\`).join("")}</div>\`}
   else if(tab==="inventory"){t.textContent="🎒 Инвентарь";h=\`<div class="list">\${(P.inventory||[]).map((x,i)=>\`<div class="item"><div class="grow"><b>\${x.name}</b><small>\${x.type} · \${x.damage?"+ "+x.damage+" урона":x.defense?"+ "+x.defense+" защиты":x.heal?"+ "+x.heal+" HP":""}</small></div>\${x.type==="Расходник"?\`<button class="btn" style="width:80px" onclick="Game.use(\${i})">ИСПОЛЬЗ.</button>\`:\`<button class="btn" style="width:80px" onclick="Game.equip(\${i})">\${P.equipped?.weapon===x.id||P.equipped?.armor===x.id?"СНЯТЬ":"ЭКИП."}</button>\`}</div>\`).join("")||'<div class="card"><p>Инвентарь пуст.</p></div>'}</div>\`}
   else if(tab==="forge"){t.textContent="🔨 Кузница";h=\`<div class="card"><h3>Улучшение снаряжения</h3><p>Материалы: \${P.materials}</p><p>Каждое улучшение повышает боевые характеристики.</p><button class="btn gold" onclick="Game.forge()">УЛУЧШИТЬ · 3 МАТЕРИАЛА</button><button class="btn" style="margin-top:5px" onclick="Game.gather()">⛏ ДОБЫТЬ 2 МАТЕРИАЛА</button></div>\`}
   else if(tab==="guild"){t.textContent="🏰 Гильдия Sdolars";h=\`<div class="card"><h3>\${P.guild||"Sdolars"}</h3><p>Уровень: \${P.guildLevel||1} · Казна: \${P.guildTreasury||0} 🪙</p><button class="btn" onclick="Game.contribute()">ВНЕСТИ 50 🪙</button><button class="btn" style="margin-top:5px" onclick="Game.siege()">⚔️ УЧАСТВОВАТЬ В ОСАДЕ</button></div>\`}
   else if(tab==="rating"){t.textContent="🏆 Рейтинг";h=\`<div class="stats"><div class="stat">Арена<b>\${P.rating}</b></div><div class="stat">Победы<b>\${P.wins}</b></div><div class="stat">Сезон<b>1</b></div></div><div class="card" style="margin-top:7px"><p>Победа в PvP: +25 рейтинга. Поражение: −18.</p><button class="btn gold" onclick="Game.arena()">⚔️ АРЕНА</button></div>\`}
   else if(tab==="quests"){t.textContent="📜 Задания";const q=P.quest?.kills||0;h=\`<div class="card"><h3>Контракт Sdolars</h3><p>Победи 3 противников.</p><p>Прогресс: \${Math.min(3,q)}/3</p>\${q>=3?'<button class="btn gold" onclick="Game.questReward()">ЗАБРАТЬ 120 🪙 + 40 XP</button>':'<button class="btn" onclick="Game.startBattle()">НАЧАТЬ БОЙ</button>'}</div><div class="card" style="margin-top:7px"><h3>🏆 Достижения</h3><p>Первый бой · Богач · Воин Sdolars</p></div>\`}
   else if(tab==="chat"){t.textContent="💬 Чат Sdolars";h=\`<div id="chatlist" class="log" style="height:260px;margin-bottom:6px"></div><input id="chatinput" placeholder="Сообщение..." style="width:100%;padding:10px;border-radius:7px;border:1px solid #286f91;background:#061522;color:white"><button class="btn" style="margin-top:6px" onclick="Game.sendChat()">ОТПРАВИТЬ</button>\`;setTimeout(()=>Game.chatLoad(),0)}
   else {t.textContent="☰ Ещё";h=\`<div class="grid"><div class="card"><h3>🎁 Ежедневная награда</h3><p>150 🪙 за вход.</p><button class="btn gold" onclick="Game.daily()">ЗАБРАТЬ</button></div><div class="card"><h3>🏆 Достижения</h3><p>Первый бой · Богач · Воин Sdolars</p></div><div class="card wide"><h3>⚙️ Настройки</h3><p>RU / EN · звук · эффекты</p><button class="btn" onclick="toast('Настройки подключим в следующем контентном проходе')">ОТКРЫТЬ</button></div></div>\`}
   b.innerHTML=h;document.getElementById("modal").classList.add("show");
 },
 async stat(k){try{const d=await post("/api/action",{type:"stat",stat:k});P=d.player;render();this.open("hero");toast("Характеристика увеличена")}catch(e){toast(e.message)}},
 async buy(id,name,price){try{const d=await post("/api/action",{type:"buy",id,name,price});P=d.player;render();this.open("shop");toast("Куплено: "+name)}catch(e){toast("Недостаточно монет")}},
 async equip(i){try{const d=await post("/api/action",{type:"equip",index:i});P=d.player;render();this.open("inventory");toast("Экипировка изменена")}catch(e){toast("Не удалось экипировать")}},
 async use(i){try{const d=await post("/api/action",{type:"medkit",index:i});P=d.player;render();this.open("inventory");toast("❤️ HP восстановлено")}catch(e){toast(e.message)}},
 async forge(){try{const d=await post("/api/action",{type:"forge"});P=d.player;render();this.open("forge");toast("🔨 Снаряжение улучшено")}catch(e){toast("Нужно 3 материала")}},
 async gather(){try{const d=await post("/api/action",{type:"gather"});P=d.player;render();this.open("forge");toast("⛏️ +2 материала")}catch(e){}},
 async contribute(){try{const d=await post("/api/action",{type:"contribute"});P=d.player;render();this.open("guild");toast("🏰 Вклад внесён")}catch(e){toast("Нужно 50 монет")}},
 async siege(){try{const d=await post("/api/action",{type:"siege"});P=d.player;render();this.open("guild");toast("⚔️ Участие в осаде засчитано")}catch(e){}},
 async arena(){this.close();this.startBattle(true)},
 async daily(){try{const d=await post("/api/action",{type:"daily"});P=d.player;render();this.open("more");toast("🎁 +150 монет")}catch(e){toast("Награда уже получена")}},
 async questReward(){try{const d=await post("/api/action",{type:"questReward"});P=d.player;render();this.open("quests");toast("📜 Награда получена")}catch(e){}},
 async chatLoad(){try{const d=await api("/api/chat");document.getElementById("chatlist").innerHTML=d.messages.map(m=>\`<div><b>\${m.name}</b>: \${m.text}</div>\`).join("")}catch(e){}},
 async sendChat(){const x=document.getElementById("chatinput");if(!x.value.trim())return;try{await post("/api/chat",{text:x.value.trim()});x.value="";this.chatLoad()}catch(e){}},
 async startBattle(pvp=false){
   try{const d=await post("/api/battle/start",{pvp:!!pvp});B=d.battle;document.getElementById("battle").classList.add("show");this.renderBattle();this.log("Выбери 1 зону атаки и 2 зоны защиты.");}
   catch(e){toast(e.message||"Не удалось начать бой")}
 },
 renderBattle(){
   const b=B;document.getElementById("bfname").textContent=P.name;document.getElementById("bflevel").textContent="Уровень "+P.level;
   document.getElementById("bename").textContent=b.enemy.name;document.getElementById("enemyinfo").innerHTML=\`Противник: <b>\${b.enemy.name}</b> · ❤️ \${b.enemy.hp} · ⚔️ \${b.enemy.atk} · 🛡️ \${b.enemy.def}\`;
   document.getElementById("pfbar").style.width=Math.max(0,P.hp/P.maxHp*100)+"%";document.getElementById("efbar").style.width=Math.max(0,b.enemy.hp/b.enemy.maxHp*100)+"%";
   document.getElementById("pfhp").textContent=\`\${P.hp}/\${P.maxHp} HP\`;document.getElementById("efhp").textContent=\`\${b.enemy.hp}/\${b.enemy.maxHp} HP\`;
   document.getElementById("defcount").textContent=(b.defense||[]).length+"/2";
   document.getElementById("attackZones").innerHTML=ZONES.map((z,i)=>\`<button class="zone \${(b.attack===i)?"sel":""}" onclick="Game.attack(\${i})">\${z}</button>\`).join("");
   document.getElementById("defenseZones").innerHTML=ZONES.map((z,i)=>\`<button class="zone \${(b.defense||[]).includes(i)?"sel":""}" onclick="Game.def(\${i})">\${z}</button>\`).join("");
 },
 attack(i){if(!B)return;B.attack=i;this.renderBattle()},
 def(i){if(!B)return;B.defense=B.defense||[];const q=B.defense.indexOf(i);if(q>=0)B.defense.splice(q,1);else if(B.defense.length<2)B.defense.push(i);this.renderBattle()},
 async move(){
   if(!B)return;if(B.attack==null||B.defense.length!==2){toast("Выбери 1 атаку и 2 зоны защиты");return}
   try{const d=await post("/api/battle/move",{battleId:B.id,attack:B.attack,defense:B.defense});P=d.player;B=d.battle;this.renderBattle();this.log(d.event);if(d.finished){toast(d.result==="win"?"🏆 Победа!":"💀 Поражение");setTimeout(()=>{this.closeBattle()},900)}}catch(e){toast(e.message)}
 },
 async auto(){if(!B)return;document.getElementById("autobtn").textContent="⏳ АВТОБОЙ";for(let n=0;n<50&&B&&!B.finished;n++){B.attack=Math.floor(Math.random()*5);B.defense=[Math.floor(Math.random()*5)];let x;while(B.defense.length<2){let q=Math.floor(Math.random()*5);if(!B.defense.includes(q))B.defense.push(q)}try{const d=await post("/api/battle/move",{battleId:B.id,attack:B.attack,defense:B.defense});P=d.player;B=d.battle;this.renderBattle();this.log(d.event);if(d.finished)break;await new Promise(r=>setTimeout(r,180))}catch(e){break}}document.getElementById("autobtn").textContent="▶ АВТОБОЙ"},
 log(s){const l=document.getElementById("battlelog");l.innerHTML+="<div>• "+s+"</div>";l.scrollTop=l.scrollHeight}
};
load();
</script></body></html>`;

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*"}});
}
function uid(req){
  const init=req.headers.get("X-Telegram-Init-Data")||"";
  const m=init.match(/(?:^|&)user=([^&]+)/);
  if(m) try{return "tg_"+JSON.parse(decodeURIComponent(m[1])).id}catch(e){}
  return "guest_"+(req.headers.get("CF-Connecting-IP")||"local");
}
function fresh(){
  return JSON.parse(JSON.stringify(START));
}
function levelUp(p){
  while(p.xp>=p.maxXp){p.xp-=p.maxXp;p.level++;p.maxXp=Math.round(p.maxXp*1.22);p.maxHp+=12;p.hp=p.maxHp;p.freePoints+=3}
}
function calcStats(p){
  let atk=p.strength, def=p.defense;
  for(const x of p.inventory||[]){
    if(x.id===p.equipped?.weapon) atk+=x.damage||0;
    if(x.id===p.equipped?.armor) def+=x.defense||0;
  }
  return {atk,def};
}

export default {
  async fetch(req,env){
    const url=new URL(req.url);
    if(url.pathname==="/") return new Response(HTML,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store"}});
    if(url.pathname==="/api/health") return json({ok:true,game:"Territory — Sdolars",build:"CLEAN-FULL"});
    const id=uid(req);
    if(!env.GAME_HUB) return json({error:"GAME_HUB binding missing"},500);
    if(url.pathname==="/ws"){
      return env.GAME_HUB.fetch(new Request("https://game/ws?pid="+encodeURIComponent(id),req));
    }
    return env.GAME_HUB.fetch(new Request(url.toString(),{method:req.method,headers:req.headers,body:req.method==="GET"||req.method==="HEAD"?undefined:req.body}));
  }
};

export class GameHub {
  constructor(state,env){this.state=state;this.env=env}
  async getPlayer(id){
    let p=await this.state.storage.get("p:"+id);
    if(!p){p=fresh();await this.state.storage.put("p:"+id,p)}
    if(!Number(p.maxHp)||p.maxHp<1)p.maxHp=120;
    if(Number(p.hp)<=0)p.hp=p.maxHp;
    if(Number(p.energy)>p.maxEnergy)p.energy=p.maxEnergy;
    return p;
  }
  async putPlayer(id,p){await this.state.storage.put("p:"+id,p);return p}
  async body(req){try{return await req.json()}catch(e){return {}}}
  async fetch(req){
    const url=new URL(req.url),id=url.searchParams.get("pid")||"guest_local";
    if(req.headers.get("Upgrade")==="websocket") return this.ws(req,id);
    if(url.pathname==="/api/state"){const p=await this.getPlayer(id);return json({ok:true,player:p})}
    if(url.pathname==="/api/chat"){
      const messages=(await this.state.storage.get("chat"))||[
        {name:"Система Sdolars",text:"Добро пожаловать в общий чат!",time:Date.now()},
        {name:"Рагнар",text:"Кто идёт на арену?",time:Date.now()}
      ];
      return json({messages});
    }
    if(url.pathname==="/api/chat"&&req.method==="POST") return this.chat(req,id);
    if(url.pathname==="/api/action"&&req.method==="POST") return this.action(req,id);
    if(url.pathname==="/api/battle/start"&&req.method==="POST") return this.start(req,id);
    if(url.pathname==="/api/battle/move"&&req.method==="POST") return this.move(req,id);
    return json({error:"Not found"},404);
  }
  async action(req,id){
    const p=await this.getPlayer(id),b=await this.body(req);
    try{
      if(b.type==="stat"){if(p.freePoints<1)throw Error("Нет свободных очков");if(!["strength","agility"].includes(b.stat))throw Error("bad stat");p[b.stat]++;p.freePoints--}
      else if(b.type==="buy"){
        const price=Number(b.price);if(!Number.isFinite(price)||price<1||p.coins<price)throw Error("Недостаточно монет");
        const catalog={knife2:{name:"Боевой нож",type:"Оружие",damage:10,price},axe:{name:"Тяжёлый топор",type:"Оружие",damage:16,price},steel2:{name:"Усиленная стальная броня",type:"Броня",defense:18,price},med2:{name:"Аптечка",type:"Расходник",heal:60,qty:1,price}};
        const it=catalog[b.id];if(!it)throw Error("Предмет не найден");p.coins-=price;p.inventory.push({id:b.id,...it})
      } else if(b.type==="equip"){const x=p.inventory[b.index];if(!x)throw Error("Нет предмета");if(x.type==="Оружие")p.equipped.weapon=p.equipped.weapon===x.id?null:x.id;else if(x.type==="Броня")p.equipped.armor=p.equipped.armor===x.id?null:x.id}
      else if(b.type==="medkit"){const x=p.inventory[b.index];if(!x||x.type!=="Расходник"||!x.qty)throw Error("Нет аптечки");p.hp=Math.min(p.maxHp,p.hp+(x.heal||60));x.qty--;if(x.qty<=0)p.inventory.splice(b.index,1)}
      else if(b.type==="forge"){if(p.materials<3)throw Error("Нужно 3 материала");p.materials-=3;for(const x of p.inventory){if(x.id===p.equipped.weapon)x.damage=(x.damage||0)+2;if(x.id===p.equipped.armor)x.defense=(x.defense||0)+2}}
      else if(b.type==="gather")p.materials+=2
      else if(b.type==="contribute"){if(p.coins<50)throw Error("Нужно 50 монет");p.coins-=50;p.guildTreasury+=50}
      else if(b.type==="siege"){p.siege++;p.guildTreasury+=20}
      else if(b.type==="daily"){if(p.dailyClaimed)throw Error("Награда уже получена");p.dailyClaimed=true;p.coins+=150;p.dailyStreak++}
      else if(b.type==="questReward"){if((p.quest?.kills||0)<3||p.quest.done)throw Error("Задание не готово");p.quest.done=true;p.coins+=120;p.xp+=40;levelUp(p)}
      else throw Error("Неизвестное действие");
      await this.putPlayer(id,p);return json({ok:true,player:p});
    }catch(e){return json({error:e.message||"Ошибка"},400)}
  }
  async start(req,id){
    const p=await this.getPlayer(id);
    if(p.hp<=0)p.hp=p.maxHp;
    if(p.energy<=0)return json({error:"Нет энергии"},400);
    p.energy--;
    const b=await this.body(req);
    let enemy=ENEMIES[Math.min(ENEMIES.length-1,Math.floor((p.wins||0)/4))];
    if(b.pvp) enemy={name:"Игрок соперник",hp:Math.max(140,p.maxHp),atk:Math.max(18,calcStats(p).atk-3),def:Math.max(8,calcStats(p).def-2),reward:180,xp:80};
    const battle={id:crypto.randomUUID(),enemy:{...enemy,maxHp:enemy.hp},turn:1,attack:null,defense:[],finished:false,pvp:!!b.pvp,created:Date.now()};
    await this.state.storage.put("battle:"+id,battle);await this.putPlayer(id,p);
    return json({ok:true,battle,player:p});
  }
  async move(req,id){
    const p=await this.getPlayer(id),b=await this.body(req);
    const battle=await this.state.storage.get("battle:"+id);
    if(!battle||battle.id!==b.battleId||battle.finished)return json({error:"Бой не найден"},400);
    if(!Number.isInteger(b.attack)||b.attack<0||b.attack>4||!Array.isArray(b.defense)||b.defense.length!==2)return json({error:"Нужна 1 атака и 2 защиты"},400);
    const st=calcStats(p);
    const enemyZone=Math.floor(Math.random()*5);
    const enemyDefense=[Math.floor(Math.random()*5)];let q;do{q=Math.floor(Math.random()*5)}while(enemyDefense.includes(q));enemyDefense.push(q);
    const crit=Math.random()<Math.min(.45,.05+p.strength*.012);
    const dodge=Math.random()<Math.min(.35,.04+p.agility*.012);
    const blocked=enemyDefense.includes(b.attack);
    let dealt=blocked?0:Math.max(1,st.atk-battle.enemy.def+(crit?Math.floor(st.atk*.55):0));
    if(dodge)dealt=0;
    const enemyCrit=Math.random()<.12;
    const playerBlocked=b.defense.includes(enemyZone);
    let taken=playerBlocked?0:Math.max(1,battle.enemy.atk-st.def+(enemyCrit?7:0));
    if(Math.random()<.06)taken=0;
    p.hp=Math.max(0,p.hp-taken);battle.enemy.hp=Math.max(0,battle.enemy.hp-dealt);
    let event=`Ход ${battle.turn}: ты нанёс ${dealt} урона, получил ${taken}.`;
    if(blocked)event+=" Враг закрыл твою атаку.";if(crit)event+=" КРИТ.";if(dodge)event+=" Враг увернулся.";if(playerBlocked)event+=" Ты заблокировал атаку.";
    let result=null;
    if(battle.enemy.hp<=0){
      battle.finished=true;result="win";p.wins++;p.coins+=battle.enemy.reward;p.xp+=battle.enemy.xp;p.materials+=2;p.quest=p.quest||{kills:0,done:false};if(!p.quest.done)p.quest.kills=Math.min(3,(p.quest.kills||0)+1);p.rating+=battle.pvp?25:0;p.hp=p.maxHp;levelUp(p);event+=` Победа! +${battle.enemy.reward} 🪙 +${battle.enemy.xp} XP. HP восстановлено.`;
    } else if(p.hp<=0){
      battle.finished=true;result="loss";p.losses++;p.hp=p.maxHp;p.rating=Math.max(0,p.rating-(battle.pvp?18:0));event+=" Поражение. HP восстановлено до максимума.";
    } else battle.turn++;
    await this.state.storage.put("battle:"+id,battle);await this.putPlayer(id,p);
    return json({ok:true,battle,player:p,event,result,finished:battle.finished});
  }
  async chat(req,id){
    const p=await this.getPlayer(id),b=await this.body(req);const text=String(b.text||"").trim().slice(0,240);if(!text)return json({error:"Пустое сообщение"},400);
    const messages=(await this.state.storage.get("chat"))||[];messages.push({name:p.name||"Игрок",text,time:Date.now()});while(messages.length>80)messages.shift();await this.state.storage.put("chat",messages);return json({ok:true});
  }
  async ws(req,id){
    const pair=new WebSocketPair();const [client,server]=Object.values(pair);server.accept();
    const p=await this.getPlayer(id);server.send(JSON.stringify({type:"hello",name:p.name,online:true}));
    server.addEventListener("message",async ev=>{try{const m=JSON.parse(ev.data);if(m.type==="chat"){const text=String(m.text||"").trim().slice(0,240);if(!text)return;const chat=(await this.state.storage.get("chat"))||[];chat.push({name:p.name||"Игрок",text,time:Date.now()});while(chat.length>80)chat.shift();await this.state.storage.put("chat",chat);server.send(JSON.stringify({type:"chat",message:chat.at(-1)}))}}catch(e){}});return new Response(null,{status:101,webSocket:client});
  }
}
