const state={
  gold:1250,gems:240,level:12,hp:74,energy:82,
  inventory:[
    {name:"Клинок тени",icon:"🗡️",type:"Оружие",power:"+18 ATK"},
    {name:"Щит стража",icon:"🛡️",type:"Броня",power:"+14 DEF"},
    {name:"Шлем",icon:"⛑️",type:"Шлем",power:"+7 DEF"},
    {name:"Кольцо силы",icon:"💍",type:"Аксессуар",power:"+6 ATK"},
    {name:"Зелье HP",icon:"🧪",type:"Расходник",power:"+40 HP"},
    {name:"Кристалл",icon:"💎",type:"Ресурс",power:"Редкий"},
    {name:"Перчатки",icon:"🥊",type:"Перчатки",power:"+5 ATK"},
    {name:"Сапоги",icon:"🥾",type:"Ботинки",power:"+4 DEF"}
  ],
  enemyHp:100, playerHp:100, turn:"player", battleLog:["Бандит выходит на арену.","Твой ход."]
};

const $=id=>document.getElementById(id);
function sync(){
  $("gold").textContent=state.gold.toLocaleString("ru-RU");
  $("gems").textContent=state.gems.toLocaleString("ru-RU");
  $("level").textContent=state.level;
}
function toast(t){
  const x=$("toast"); x.textContent=t; x.classList.add("show");
  clearTimeout(window._toast); window._toast=setTimeout(()=>x.classList.remove("show"),1500);
}
function show(name){
  document.querySelectorAll(".bottom button").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
  if(name==="home") home();
  if(name==="inventory") inventory();
  if(name==="shop") shop();
  if(name==="quests") quests();
  if(name==="battle") battle();
}
function home(){
 $("screen").innerHTML=`
 <section class="hero">
   <div class="title">⚔️ TERRITORIA ⚔️</div>
   <div style="text-align:center;color:#d7c6df">Золотой город • Глава 1</div>
   <div class="stage">🧙</div><div class="pet">🐺</div><div class="campfire">🔥</div>
   <div class="quick">
    <button onclick="show('inventory')">🎒<br>Герой</button>
    <button onclick="show('battle')">⚔️<br>Арена</button>
    <button onclick="show('quests')">📜<br>Задания</button>
    <button onclick="show('shop')">🛒<br>Магазин</button>
   </div>
 </section>
 <div class="panel"><h3>❤️ Здоровье</h3><div class="bar"><span style="width:${state.hp}%"></span></div><small>${state.hp}% • Энергия ${state.energy}%</small></div>
 <div class="panel"><h3>📈 Характеристики</h3><div class="stats">
   <div class="stat">⚔️<b>48</b>Атака</div><div class="stat">🛡️<b>35</b>Защита</div><div class="stat">❤️<b>100</b>HP</div>
 </div></div>`;
 sync();
}
function inventory(){
 $("screen").innerHTML=`
 <h2 class="screenTitle">🎒 Инвентарь</h2>
 <div class="panel"><h3>Экипировка</h3><div class="gear">
  <div class="slot">🗡️<small>Оружие</small></div><div class="slot">🛡️<small>Броня</small></div><div class="slot">⛑️<small>Шлем</small></div>
  <div class="slot">🥊<small>Перчатки</small></div><div class="slot">🥾<small>Сапоги</small></div><div class="slot">💍<small>Кольцо</small></div>
 </div></div>
 <div class="panel"><h3>Предметы <span class="badge">${state.inventory.length}/24</span></h3>
 <div class="items">${state.inventory.map((i,n)=>`<button class="item" onclick="equip(${n})"><div class="icon">${i.icon}</div><b>${i.name}</b><small>${i.power}</small></button>`).join("")}</div></div>`;
}
function equip(n){toast(`${state.inventory[n].name}: предмет выбран`)}
function shop(){
 const goods=[
  ["🗡️","Железный клинок",180,"+12 ATK"],
  ["🛡️","Щит рыцаря",220,"+10 DEF"],
  ["🧪","Большое зелье",90,"+60 HP"],
  ["💍","Кольцо удачи",350,"+5 CRIT"],
  ["⛑️","Шлем охотника",260,"+8 DEF"],
  ["⚔️","Меч героя",500,"+24 ATK"]
 ];
 $("screen").innerHTML=`<h2 class="screenTitle">🛒 Магазин</h2><div class="panel"><h3>Снаряжение</h3><div class="shopGrid">${goods.map((g,n)=>`
 <div class="shopItem"><div class="icon">${g[0]}</div><b>${g[1]}</b><small>${g[3]}</small><button class="buy" onclick="buy(${n})">🪙 ${g[2]}</button></div>`).join("")}</div></div>`;
 window.goods=goods;
}
function buy(n){
 const g=window.goods[n]; if(state.gold<g[2]) return toast("Не хватает золота");
 state.gold-=g[2]; state.inventory.push({name:g[1],icon:g[0],type:"Предмет",power:g[3]});
 toast("Куплено: "+g[1]); sync(); shop();
}
function quests(){
 $("screen").innerHTML=`<h2 class="screenTitle">📜 Задания</h2>
 <div class="panel"><div class="quest"><div class="qicon">⚔️</div><div><b>Победи бандита</b><br><small>Одержи победу на арене</small></div><button onclick="show('battle')">В бой</button></div></div>
 <div class="panel"><div class="quest"><div class="qicon">🪙</div><div><b>Собери 1000 золота</b><br><small>Награда: 💎 50</small></div><span class="badge">35%</span></div></div>
 <div class="panel"><div class="quest"><div class="qicon">🎒</div><div><b>Найди редкий предмет</b><br><small>Открой 3 сундука</small></div><span class="badge">1/3</span></div></div>`;
}
function battle(){
 $("screen").innerHTML=`
 <section class="battle">
  <div class="turn"><span>${state.turn==="player"?"ТВОЙ ХОД":"ХОД ВРАГА"}</span></div>
  <div class="fighters">
   <div class="fighter"><div class="body">🧙</div><b>Территорианец</b><div class="hp"><div class="bar"><span style="width:${state.playerHp}%"></span></div><small>${state.playerHp}/100</small></div></div>
   <div class="vs">VS</div>
   <div class="fighter enemy"><div class="body">👹</div><b>Бандит</b><div class="hp"><div class="bar"><span style="width:${state.enemyHp}%"></span></div><small>${state.enemyHp}/100</small></div></div>
  </div>
  <div class="panel"><b>Журнал боя</b><div class="battleLog">${state.battleLog.slice(-5).map(x=>`<div>• ${x}</div>`).join("")}</div></div>
  <div class="actions">
   <button class="action primary" onclick="act('attack')">⚔️ Атака</button>
   <button class="action" onclick="act('skill')">✨ Умение</button>
   <button class="action" onclick="act('defend')">🛡️ Защита</button>
   <button class="action" onclick="act('potion')">🧪 Зелье</button>
  </div>
 </section>`;
}
function act(type){
 if(state.turn!=="player") return;
 if(state.enemyHp<=0||state.playerHp<=0) return;
 let dmg=0,msg="";
 if(type==="attack"){dmg=14+Math.floor(Math.random()*10);msg=`Ты наносишь ${dmg} урона.`}
 if(type==="skill"){dmg=22+Math.floor(Math.random()*12);msg=`Умение наносит ${dmg} урона!`}
 if(type==="defend"){dmg=5;msg="Ты защищаешься. Следующий удар слабее."}
 if(type==="potion"){state.playerHp=Math.min(100,state.playerHp+28);msg="Зелье восстановило 28 HP."}
 state.enemyHp=Math.max(0,state.enemyHp-dmg); state.battleLog.push(msg);
 if(state.enemyHp===0){state.battleLog.push("🏆 Победа! Ты получил 120 золота.");state.gold+=120;state.turn="player";battle();sync();return}
 state.turn="enemy"; battle();
 setTimeout(enemyTurn,650);
}
function enemyTurn(){
 if(state.playerHp<=0)return;
 const dmg=7+Math.floor(Math.random()*9); state.playerHp=Math.max(0,state.playerHp-dmg);
 state.battleLog.push(`Бандит наносит ${dmg} урона.`);
 if(state.playerHp===0){state.battleLog.push("💀 Поражение. Попробуй ещё раз.");state.turn="player"}
 else state.turn="player";
 battle();sync();
}
sync();show("home");