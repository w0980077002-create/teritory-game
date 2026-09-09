
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let token = "";
let state = null;
let ws = null;
const $ = id => document.getElementById(id);

function toast(text) {
  $("toast").textContent = text;
  $("toast").style.display = "block";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => $("toast").style.display="none", 2400);
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

async function auth(demo=false) {
  const initData = tg?.initData || "";
  const r = await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,demo})});
  const data = await r.json();
  if(!r.ok) throw new Error(data.error||"Ошибка входа");
  token=data.token;
  state=data;
  $("login").classList.add("hidden");
  $("game").classList.remove("hidden");
  render();
  connectWS();
  loadPlayers();
}
async function api(type, body={}) {
  const r=await fetch("/api/action",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({type,...body})});
  const data=await r.json();
  if(!r.ok) throw new Error(data.error||"Ошибка");
  state=data;
  render();
  if(data.message) toast(data.message);
  return data;
}
function go(view) {
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  $("view-"+view)?.classList.add("active");
  if(view==="shop") loadShop();
  if(view==="arena") loadEnemies();
  if(view==="players") loadPlayers();
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-go]");
  if(b) go(b.dataset.go);
});

function render(){
  const p=state.player, s=state.stats;
  $("hpTop").textContent=`${p.hp}/${p.maxHp}`;
  $("coinsTop").textContent=p.coins;
  $("onlineTop").textContent=state.online;
  $("nameHome").textContent=p.name;
  $("levelHome").textContent=p.level;
  $("xpText").textContent=`${p.exp} / ${p.nextExp} XP`;
  $("xpBar").style.width=Math.min(100,p.exp/p.nextExp*100)+"%";
  $("hpStat").textContent=`${p.hp} / ${p.maxHp}`;
  $("attackStat").textContent=s.attack;
  $("defStat").textContent=s.defense;
  $("winsStat").textContent=p.wins;
  $("lossStat").textContent=p.losses;
  renderEquipment(); renderInventory(); renderLocations();
}
function item(id){ return stateItems[id]; }
let stateItems={};
async function loadShop(){
  const r=await fetch("/api/shop"); const arr=await r.json();
  stateItems=Object.fromEntries(arr.map(x=>[x.id,x]));
  $("shop").innerHTML=arr.map(x=>`
    <div class="item"><div class="item-icon">${x.icon}</div><div class="item-main"><b>${esc(x.name)}</b><small>${esc(x.desc)} · ${x.price} 🪙</small></div>
    <button class="gold" onclick="buy('${x.id}')">КУПИТЬ</button></div>`).join("");
}
async function loadEnemies(){
  const r=await fetch("/api/enemies"); const arr=await r.json();
  const battle=state.battle;
  if(battle){
    const e=arr.find(x=>x.id===battle.enemyId);
    $("battle").innerHTML=`<div class="battle-box"><div class="fight-icon">${e.icon}</div><h3>${esc(e.name)}</h3><div class="bar"><i style="width:${battle.hp/battle.maxHp*100}%"></i></div><b>${battle.hp}/${battle.maxHp} HP</b><div class="battle-actions"><button class="gold" onclick="attack()">⚔️ УДАР</button><button onclick="useFirstHeal()">🩹 ЛЕЧИТЬ</button></div></div>`;
    $("enemies").innerHTML="";
  } else {
    $("battle").innerHTML="";
    $("enemies").innerHTML=arr.map(e=>`<div class="enemy"><div class="enemy-icon">${e.icon}</div><div><b>${esc(e.name)}</b><small> ❤️${e.hp} · ⚔️${e.attack} · 🛡️${e.defense}<br>Награда: ${e.exp} XP / ${e.coins} 🪙</small></div><button class="gold" onclick="startBattle('${e.id}')">АТАКА</button></div>`).join("");
  }
}
function renderEquipment(){
  const p=state.player;
  const slots=[["weapon","Оружие"],["armor","Броня"]];
  $("equipment").innerHTML=slots.map(([slot,title])=>{
    const id=p.equipment[slot], x=id&&stateItems[id];
    return `<div class="item"><div class="item-icon">${x?x.icon:"⬜"}</div><div class="item-main"><b>${title}: ${x?esc(x.name):"нет"}</b><small>${x?esc(x.desc):"Слот пуст"}</small></div>${x?`<button onclick="unequip('${id}')">СНЯТЬ</button>`:""}</div>`;
  }).join("");
}
function renderInventory(){
  const inv=state.player.inventory;
  if(!Object.keys(stateItems).length){ $("inventory").innerHTML="<p>Загрузка...</p>"; loadShop(); return; }
  $("inventory").innerHTML=inv.length?inv.map(row=>{
    const x=stateItems[row.itemId]; if(!x)return"";
    let actions="";
    if(x.type==="weapon"||x.type==="armor") actions=`<button onclick="equip('${x.id}')">НАДЕТЬ</button>`;
    if(x.type==="consumable") actions=`<button onclick="useItem('${x.id}')">ИСПОЛЬЗОВАТЬ</button>`;
    actions+=`<button onclick="dropItem('${x.id}')">ВЫБРОСИТЬ</button>`;
    return `<div class="item"><div class="item-icon">${x.icon}</div><div class="item-main"><b>${esc(x.name)} ×${row.qty}</b><small>${esc(x.desc)}</small></div><div class="actions">${actions}</div></div>`;
  }).join(""):"<p>Инвентарь пуст.</p>";
}
function renderLocations(){
  const places=[["Город","🏙️","Безопасная зона. Здесь можно восстановить здоровье."],["Тёмный лес","🌲","Здесь водятся крысы и бандиты."],["Старый завод","🏭","Опасное место с редкой добычей."],["Порт","⚓","Торговцы и игроки со всего мира."]];
  $("locations").innerHTML=places.map(x=>`<button onclick="travel('${x[0]}')">${x[1]} <b>${x[0]}</b><br><small>${x[2]}</small></button>`).join("");
}
async function buy(id){try{await api("buy",{itemId:id})}catch(e){toast(e.message)}}
async function equip(id){try{await api("equip",{itemId:id})}catch(e){toast(e.message)}}
async function unequip(id){try{await api("unequip",{itemId:id})}catch(e){toast(e.message)}}
async function dropItem(id){if(confirm("Выбросить предмет?"))try{await api("drop",{itemId:id})}catch(e){toast(e.message)}}
async function useItem(id){try{await api("use",{itemId:id})}catch(e){toast(e.message)}}
async function useFirstHeal(){
  const r=state.player.inventory.find(x=>["bandage","medkit","stim"].includes(x.itemId));
  if(r) useItem(r.itemId); else toast("Нет аптечек");
}
async function startBattle(id){try{await api("battle_start",{enemyId:id});go("arena")}catch(e){toast(e.message)}}
async function attack(){
  try{
    const d=await api("battle_attack");
    if(d.combat){
      const box=document.querySelector(".fight-icon");
      if(d.combat.damage){box?.classList.add("damage");setTimeout(()=>box?.classList.remove("damage"),550)}
      if(d.combat.victory){$("battle").classList.add("win");setTimeout(()=>loadEnemies(),600)}
    }
    go("arena");
  }catch(e){toast(e.message)}
}
async function heal(){try{await api("heal")}catch(e){toast(e.message)}}
async function travel(location){try{await api("travel",{location})}catch(e){toast(e.message)}}

async function casino(kind){
  const bet=Math.max(1,Math.min(500,Number($("bet").value)||1));
  try{
    if(kind==="slots"){
      $("reels").classList.add("spin");
      setTimeout(()=>$("reels").classList.remove("spin"),650);
    }
    const d=await api("casino",{result:kind,amount:bet});
    if(d.casino?.reels) $("reels").textContent=d.casino.reels.join(" ");
    if(d.casino?.roll) $("diceResult").textContent="🎲 "+d.casino.roll;
  }catch(e){toast(e.message)}
}
$("slotsBtn").onclick=()=>casino("slots");
$("diceBtn").onclick=()=>casino("dice");
$("healBtn").onclick=heal;

async function loadPlayers(){
  try{
    const r=await fetch("/api/players"); const arr=await r.json();
    $("players").innerHTML=arr.map((p,i)=>`<div class="player"><div class="item-icon">${p.online?"🟢":"⚪"}</div><div class="item-main"><b>#${i+1} ${esc(p.name)}</b><small>Уровень ${p.level} · Победы ${p.wins} · ${esc(p.location)}</small></div></div>`).join("");
  }catch{}
}
function connectWS(){
  if(ws) ws.close();
  const proto=location.protocol==="https:"?"wss":"ws";
  ws=new WebSocket(`${proto}://${location.host}`);
  ws.onopen=()=>ws.send(JSON.stringify({type:"auth",token}));
  ws.onmessage=e=>{
    const m=JSON.parse(e.data);
    if(m.type==="online"){state.online=m.count;$("onlineTop").textContent=m.count}
    if(m.type==="chat") addChat(m.name,m.text);
    if(m.type==="system") addChat("SYSTEM",m.text);
  };
}
function addChat(name,text){
  const d=document.createElement("div");d.className="msg";d.innerHTML=`<b>${esc(name)}</b>: ${esc(text)}`;
  $("chatLog").appendChild(d);$("chatLog").scrollTop=$("chatLog").scrollHeight;
}
$("sendChat").onclick=sendChat;
$("chatInput").onkeydown=e=>{if(e.key==="Enter")sendChat()};
function sendChat(){
  const text=$("chatInput").value.trim(); if(!text||!ws||ws.readyState!==1)return;
  ws.send(JSON.stringify({type:"chat",text}));$("chatInput").value="";
}

$("playBtn").onclick=()=>auth(false).catch(e=>{toast(e.message);$("loginText").textContent=e.message});
$("demoBtn").onclick=()=>auth(true).catch(e=>{$("loginText").textContent=e.message});
if(tg?.initData){
  $("loginText").textContent="Telegram подтверждён. Можно играть.";
  $("playBtn").disabled=false;
  $("demoBtn").style.display="none";
  auth(false).catch(e=>{$("loginText").textContent=e.message;$("playBtn").disabled=false});
}else{
  $("loginText").textContent="Открой игру внутри Telegram. Для проверки на телефоне можно включить демо.";
  $("playBtn").disabled=false;
}
