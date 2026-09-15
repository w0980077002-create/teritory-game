const defaultState={coins:1000,gems:25,level:1,exp:0,hp:120,maxHp:120,enemyHp:100,weapon:"Кулаки",bonusDamage:0,inventory:["🪓"]};
let state=JSON.parse(localStorage.getItem("territory_save_v1")||"null")||structuredClone(defaultState);
const zones=["head","chest","stomach","waist","legs"];
const names={head:"Голова",chest:"Грудь",stomach:"Живот",waist:"Пояс",legs:"Ноги"};
const weapons=[
 {name:"Боевой топор",icon:"🪓",damage:12,cost:300},
 {name:"Стальной меч",icon:"⚔️",damage:18,cost:650},
 {name:"Молот",icon:"🔨",damage:25,cost:1000},
 {name:"Арбалет",icon:"🏹",damage:31,cost:1500}
];
const $=s=>document.querySelector(s);
function save(){localStorage.setItem("territory_save_v1",JSON.stringify(state));render();}
function render(){
 $("#coins").textContent=state.coins; $("#gems").textContent=state.gems; $("#level").textContent=state.level;
 $("#playerHp").textContent=`${state.hp}/${state.maxHp}`; $("#enemyHp").textContent=`${state.enemyHp}/100`;
 $("#playerHpBar").style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`; $("#enemyHpBar").style.width=`${Math.max(0,state.enemyHp/100*100)}%`;
 $("#weaponName").textContent=state.weapon; $("#weaponStats").textContent=`Урон +${state.bonusDamage}`;
 renderShop(); renderInventory();
}
function showScreen(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id));
 document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));
 if(id==="arena") resetTactical();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-screen]");if(b)showScreen(b.dataset.screen)});
function resetTactical(){
 document.querySelectorAll(".zones button").forEach(b=>b.classList.remove("selected"));
 $("#fightBtn").disabled=true; $("#combatLog").textContent="Выберите зону атаки и две зоны защиты.";
}
$("#attackZones").addEventListener("click",e=>{
 const b=e.target.closest("button"); if(!b)return;
 document.querySelectorAll("#attackZones button").forEach(x=>x.classList.remove("selected")); b.classList.add("selected"); updateFight();
});
$("#defenseZones").addEventListener("click",e=>{
 const b=e.target.closest("button"); if(!b)return;
 b.classList.toggle("selected");
 const selected=[...document.querySelectorAll("#defenseZones button.selected")];
 if(selected.length>2) selected[0].classList.remove("selected");
 updateFight();
});
function updateFight(){
 const a=$("#attackZones button.selected"); const d=document.querySelectorAll("#defenseZones button.selected");
 $("#fightBtn").disabled=!(a&&d.length===2);
}
$("#fightBtn").onclick=()=>{
 const attack=$("#attackZones button.selected").dataset.zone;
 const defense=[...document.querySelectorAll("#defenseZones button.selected")].map(x=>x.dataset.zone);
 const enemyDefense=zones[Math.floor(Math.random()*5)];
 const damage=state.bonusDamage+10+(attack==="head"?4:attack==="legs"?2:0);
 let dealt=enemyDefense===attack?Math.max(3,Math.floor(damage*.35)):damage;
 state.enemyHp=Math.max(0,state.enemyHp-dealt);
 const enemyAttack=zones[Math.floor(Math.random()*5)];
 const enemyDamage=10;
 const blocked=defense.includes(enemyAttack);
 const taken=blocked?0:enemyDamage;
 state.hp=Math.max(0,state.hp-taken);
 $("#combatLog").textContent=`Вы: ${names[attack]} → −${dealt} HP. Враг атакует: ${names[enemyAttack]}${blocked?" — БЛОК!":" — −"+taken+" HP."}`;
 $("#turnLabel").textContent="ХОД "+(Number($("#turnLabel").textContent.replace(/\D/g,""))+1);
 if(state.enemyHp<=0){state.coins+=150;state.exp+=40;$("#combatLog").textContent+=" Победа! +150 🪙 +40 XP.";state.enemyHp=100;}
 if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-100);$("#combatLog").textContent+=" Вы проиграли. Восстановление −100 🪙.";}
 if(state.exp>=100){state.level++;state.exp-=100;state.maxHp+=10;state.hp=state.maxHp;$("#combatLog").textContent+=" Новый уровень!";}
 save(); resetTactical();
};
function renderShop(){
 $("#shopGrid").innerHTML=weapons.map(w=>`<div class="item"><div class="pic">${w.icon}</div><b>${w.name}</b><span>Урон +${w.damage}</span><button data-buy="${w.name}">${w.cost} 🪙 · КУПИТЬ</button></div>`).join("");
}
$("#shopGrid").addEventListener("click",e=>{
 const b=e.target.closest("[data-buy]");if(!b)return;const w=weapons.find(x=>x.name===b.dataset.buy);
 if(state.coins<w.cost){$("#worldMessage").textContent="Не хватает монет.";return}
 state.coins-=w.cost;state.weapon=w.name;state.bonusDamage=w.damage;state.inventory.push(w.icon);save();
});
function renderInventory(){
 $("#inventoryGrid").innerHTML=state.inventory.map((x,i)=>`<div class="item"><div class="pic">${x}</div><b>Предмет ${i+1}</b><span>Экипировка</span></div>`).join("");
}
$("#spinBtn").onclick=()=>{
 if(state.coins<100){$("#casinoMsg").textContent="Не хватает монет.";return}
 state.coins-=100; const win=Math.random()<.35;
 if(win){const prize=300+Math.floor(Math.random()*500);state.coins+=prize;$("#casinoMsg").textContent=`Удача! Вы выиграли ${prize} 🪙`; }
 else $("#casinoMsg").textContent="Не повезло. Попробуй ещё.";
 $("#wheel").style.transform=`rotate(${720+Math.random()*720}deg)`;save();
};
render();
showScreen("home");
/* Territory v30 — живой игровой город */
(function initLivingCity(){
  const home=document.querySelector('.real-home');
  if(!home || home.dataset.lifeReady==='1') return;
  home.dataset.lifeReady='1';
  const action=home.querySelector('#sceneAction');
  const center=home.querySelector('.hs-city');
  const weapon=home.querySelector('.hs-weapon');
  const guard=home.querySelector('.guard-label');
  const trader=home.querySelector('.trader-label');
  const messages=[
    'Ворота Sdolars охраняются. В городе спокойно.',
    'К городским воротам прибыл вечерний караван.',
    'На рынке продолжается торговля.',
    'Страж проверяет прибывающих в город.',
    'В центральном квартале становится оживлённее.'
  ];
  let msg=0, timer;
  function notify(text){
    if(!action) return;
    action.textContent=text;
    action.classList.remove('show');
    void action.offsetWidth;
    action.classList.add('show');
    clearTimeout(timer);
    timer=setTimeout(()=>action.classList.remove('show'),3600);
  }
  function ambient(){
    if(document.querySelector('#home.active')) notify(messages[msg++%messages.length]);
  }
  setTimeout(ambient,1800);
  setInterval(ambient,12000);

  // Небольшой отклик на реальные игровые точки города.
  [[center,'Центральный квартал Sdolars'],[weapon,'Оружейная: покупка и ремонт'],[guard,'Страж: охрана города'],[trader,'Торговец: покупка / продажа']]
    .forEach(([el,text])=>el&&el.addEventListener('click',()=>notify(text)));

  // Ночной цикл: лёгкое изменение яркости без "плавления" изображения.
  let night=false;
  setInterval(()=>{
    night=!night;
    home.classList.toggle('night-pulse',night);
  },26000);
})();

/* Territory v32 — scene interactions */
(function sceneInteractions(){
  const home=document.querySelector('.real-home'); if(!home)return;
  const action=document.querySelector('#sceneAction');
  const notes={
    '.hs-city':'Центральный квартал: город открыт для исследования.',
    '.hs-weapon':'Оружейная готова: выбирай оружие и улучшай снаряжение.',
    '.guard-label':'Страж: «В городе спокойно. Будь внимателен.»',
    '.trader-label':'Торговец: «Посмотри товары, странник.»'
  };
  Object.entries(notes).forEach(([sel,text])=>{
    const el=home.querySelector(sel); if(!el)return;
    el.addEventListener('click',()=>{
      if(!action)return;
      action.textContent=text; action.classList.add('show');
      clearTimeout(el._t); el._t=setTimeout(()=>action.classList.remove('show'),3000);
    });
  });
})();
