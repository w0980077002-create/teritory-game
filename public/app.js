const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaultState={gold:1779,gems:1330,energy:191.38,level:3,xp:120,hp:100,maxHp:100,attack:38,defense:24,inventory:[
{id:"iron",name:"Железный топор",icon:"🪓",type:"Оружие",atk:12,price:240,equipped:true},
{id:"fur",name:"Волчья шкура",icon:"🧥",type:"Броня",def:8,price:180,equipped:true},
{id:"helm",name:"Шлем викинга",icon:"⛑️",type:"Шлем",def:6,price:150,equipped:false},
{id:"potion",name:"Зелье здоровья",icon:"🧪",type:"Расходник",heal:30,price:80,equipped:false}
],questDone:false,claimed:false};
let state=JSON.parse(localStorage.getItem("sdolars_state")||"null")||structuredClone(defaultState);
function save(){localStorage.setItem("sdolars_state",JSON.stringify(state));}
function render(){
  $("#gold").textContent=Math.floor(state.gold);$("#gems").textContent=state.gems;$("#energy").textContent=state.energy.toFixed(2);
  $("#level").textContent=state.level;$("#avatarLevel").textContent=state.level;$("#xpText").textContent=state.xp;$("#xpBar").style.width=(state.xp/300*100)+"%";
  $("#invBadge").style.display=state.inventory.some(x=>!x.equipped&&x.type!=="Расходник")?"block":"none";
  if(state.questDone){$("#questTitle").textContent="Отнеси заказ в таверну";} 
  save();
}
function toast(t){let x=$("#toast");x.textContent=t;x.className="show";clearTimeout(window.tt);window.tt=setTimeout(()=>x.className="",2200)}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
$("#closeModal").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
function statsHtml(){return `<h2>🧔 Герой — Викинг</h2><div class="statGrid">
<div class="stat">❤️ Здоровье<br><b>${state.hp}/${state.maxHp}</b><div class="bar"><i style="width:${state.hp/state.maxHp*100}%"></i></div></div>
<div class="stat">⚔️ Атака<br><b>${state.attack}</b></div><div class="stat">🛡️ Защита<br><b>${state.defense}</b></div><div class="stat">⭐ Уровень<br><b>${state.level}</b></div></div>
<p class="muted">Снаряжение влияет на характеристики. Побеждай врагов и выполняй задания, чтобы получать опыт.</p>`}
function inventoryHtml(){return `<h2>🎒 Инвентарь</h2><div class="itemGrid">${state.inventory.map((x,i)=>`<div class="item"><div class="icon">${x.icon}</div><div><b>${x.name}</b><br><small>${x.type} ${x.atk?`· +${x.atk} ⚔️`:""} ${x.def?`· +${x.def} 🛡️`:""}</small><br>${x.equipped?'<span class="muted">Надето</span>':`<button data-equip="${i}">${x.type==="Расходник"?"Использовать":"Надеть"}</button>`}</div></div>`).join("")}</div>`}
function questsHtml(){return `<h2>📜 Задания</h2><div class="battleCard"><b>${state.questDone?"Доставить заказ":"Поговори с кузнецом"}</b><p>${state.questDone?"Награда: 250 🪙 + 60 XP":"Кузнец ждёт тебя в кузнице. Нажми кнопку ниже, чтобы начать диалог."}</p><button class="actionBtn success" id="doQuest">${state.questDone?"Завершить задание":"Поговорить с кузнецом"}</button></div>`}
function shopHtml(){let items=[{name:"Стальной меч",icon:"⚔️",price:500,atk:18},{name:"Кольчуга",icon:"🥋",price:420,def:15},{name:"Большое зелье",icon:"🧪",price:160,heal:60},{name:"Щит стражника",icon:"🛡️",price:380,def:12}];return `<h2>👜 Магазин</h2><div class="shopGrid">${items.map((x,i)=>`<div class="item"><div class="icon">${x.icon}</div><div><b>${x.name}</b><br><span class="price">${x.price} 🪙</span><br><button class="actionBtn" data-buy="${i}">Купить</button></div></div>`).join("")}</div>`}
function forgeHtml(){return `<h2>🔨 Кузница</h2><p>Улучши своё основное оружие за золото.</p><div class="battleCard"><b>🪓 Железный топор</b><p>Атака: ${state.attack}</p><button class="actionBtn" id="upgrade">Улучшить · 300 🪙</button></div>`}
function tavernHtml(){return `<h2>🍺 Таверна</h2><p>Здесь можно нанять союзника.</p><div class="battleCard">🧙 Следопыт — +8 к атаке<br><button class="actionBtn" id="hire">Нанять · 600 🪙</button></div>`}
function battleHtml(){return `<h2>⚔️ Бой против Бандита</h2><div class="battleCard"><div class="battleArena"><div><div class="fighter">🧔</div><b>Викинг</b><div class="hp"><i id="pHp" style="width:${state.hp}%"></i></div><small>${state.hp}/${state.maxHp}</small></div><div><div class="fighter">🥷</div><b>Бандит</b><div class="hp"><i id="eHp" style="width:${window.enemyHp??100}%"></i></div><small id="enemyText">${window.enemyHp??100}/100</small></div></div><div class="moves"><button data-move="attack">⚔️ Быстрый удар</button><button data-move="heavy">💥 Сильный удар</button><button data-move="defend">🛡️ Защита</button><button data-move="potion">🧪 Зелье</button></div><div class="log" id="battleLog">Выберите действие.</div></div>`}
function show(action){
 if(action==="city"){closeModal();return}
 if(action==="hero")openModal(statsHtml());
 if(action==="inventory"||action==="equipment")openModal(inventoryHtml());
 if(action==="quests")openModal(questsHtml());
 if(action==="shop")openModal(shopHtml());
 if(action==="forge")openModal(forgeHtml());
 if(action==="tavern")openModal(tavernHtml());
 if(action==="battle"){window.enemyHp=100;openModal(battleHtml())}
 if(["bonuses","events","vip","messages","achievements","settings","guild","more"].includes(action)){
   let map={bonuses:"🎁 Бонусы",events:"🗓️ События",vip:"👑 VIP",messages:"✉️ Сообщения",achievements:"🏆 Достижения",settings:"⚙️ Настройки",guild:"👥 Гильдия",more:"☰ Ещё"};
   openModal(`<h2>${map[action]}</h2><p class="muted">Раздел уже подключён. Здесь будут реальные игровые функции следующего этапа.</p><button class="actionBtn" id="ok">Понятно</button>`);
 }
}
document.addEventListener("click",e=>{
 let a=e.target.closest("[data-action]");if(a){show(a.dataset.action);return}
 let add=e.target.closest("[data-add]");if(add){let k=add.dataset.add;if(k==="gold")state.gold+=100;if(k==="gems")state.gems+=50;if(k==="energy")state.energy+=10;render();toast("Ресурс пополнен");return}
 let eq=e.target.closest("[data-equip]");if(eq){let i=+eq.dataset.equip,x=state.inventory[i];if(x.heal){state.hp=Math.min(state.maxHp,state.hp+x.heal);state.inventory.splice(i,1);toast("Зелье использовано");}else{x.equipped=true;if(x.atk)state.attack+=x.atk;if(x.def)state.defense+=x.def;toast(x.name+" надет");}render();openModal(inventoryHtml());return}
 let buy=e.target.closest("[data-buy]");if(buy){let items=[["Стальной меч","⚔️",500,18,0],["Кольчуга","🥋",420,0,15],["Большое зелье","🧪",160,0,60],["Щит стражника","🛡️",380,0,12]],x=items[+buy.dataset.buy];if(state.gold<x[2])return toast("Недостаточно золота");state.gold-=x[2];state.inventory.push({id:Date.now(),name:x[0],icon:x[1],type:x[3]?"Броня":"Оружие",atk:x[3],def:x[4],heal:x[4]===0&&x[3]===0?x[4]:undefined,price:x[2]});render();toast("Куплено: "+x[0]);openModal(shopHtml());return}
 if(e.target.id==="doQuest"){if(!state.questDone){state.questDone=true;state.gold+=120;state.xp+=60;toast("Кузнец дал тебе награду!");}else{state.gold+=250;state.xp+=60;toast("Задание завершено!");}if(state.xp>=300){state.level++;state.xp-=300;toast("Новый уровень!")}render();openModal(questsHtml());}
 if(e.target.id==="upgrade"){if(state.gold<300)return toast("Нужно 300 золота");state.gold-=300;state.attack+=8;toast("Оружие улучшено!");render();openModal(forgeHtml())}
 if(e.target.id==="hire"){if(state.gold<600)return toast("Нужно 600 золота");state.gold-=600;state.attack+=8;toast("Следопыт присоединился!");render();openModal(tavernHtml())}
 if(e.target.id==="claimReward"){if(state.claimed)return toast("Награда уже получена");state.claimed=true;state.gold+=250;state.gems+=25;render();toast("🎁 Получено: 250 золота и 25 кристаллов")}
 if(e.target.id==="ok")closeModal();
 let move=e.target.closest("[data-move]");if(move){battle(move.dataset.move)}
});
function battle(move){let log=$("#battleLog");if(!log)return;if(window.enemyHp<=0)return;
 if(move==="potion"){let p=state.inventory.find(x=>x.heal);if(!p)return log.textContent="Нет зелий.";state.hp=Math.min(100,state.hp+p.heal);state.inventory.splice(state.inventory.indexOf(p),1);log.textContent="Вы восстановили здоровье."; }
 else if(move==="defend"){log.textContent="Вы подняли щит. Урон врага уменьшен.";state.hp=Math.min(100,state.hp+3);}
 else {let dmg=move==="heavy"?Math.max(5,state.attack+8-Math.floor(Math.random()*8)):Math.max(4,state.attack-Math.floor(Math.random()*12));window.enemyHp=Math.max(0,window.enemyHp-dmg);log.textContent=`Вы нанесли ${dmg} урона.`;}
 if(window.enemyHp<=0){state.gold+=180;state.xp+=80;log.textContent+=" 🏆 Бандит побеждён! +180 🪙 +80 XP";if(state.xp>=300){state.level++;state.xp-=300;log.textContent+=" Новый уровень!";}render();setTimeout(()=>openModal(battleHtml()),500);return}
 let enemyDmg=Math.floor(Math.random()*10)+5;state.hp=Math.max(0,state.hp-enemyDmg);log.textContent+=` Бандит наносит ${enemyDmg}.`;render();
 if(state.hp<=0){log.textContent="💀 Вы проиграли. Восстановление здоровья бесплатно.";state.hp=100;render()}
 $("#pHp").style.width=state.hp+"%";$("#eHp").style.width=window.enemyHp+"%";$("#enemyText").textContent=window.enemyHp+"/100";
}
let sec=23*3600+45*60+12;function timer(){sec=Math.max(0,sec-1);let h=String(Math.floor(sec/3600)).padStart(2,"0"),m=String(Math.floor(sec%3600/60)).padStart(2,"0"),s=String(sec%60).padStart(2,"0");$("#timer").textContent=`${h}:${m}:${s}`}
setInterval(timer,1000);render();
