const defaultState={coins:1000,gems:25,level:1,exp:0,hp:120,maxHp:120,enemyHp:100,weapon:"Кулаки",bonusDamage:0,inventory:["🪓"],alexQuest:0,cityRep:0};
let state=JSON.parse(localStorage.getItem("territory_save_v1")||"null")||structuredClone(defaultState);
state.alexQuest=Number(state.alexQuest||0); state.cityRep=Number(state.cityRep||0); state.merchantRep=Number(state.merchantRep||0); state.marketDay=Number(state.marketDay||Math.floor(Date.now()/86400000));
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
 const q=document.querySelector('#alexQuestBadge'); if(q){q.textContent=state.alexQuest===1?'ЗАДАНИЕ ALEX':'Город'; q.classList.toggle('active',state.alexQuest===1);}
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
 const day=Math.floor(Date.now()/86400000);
 if(state.marketDay!==day){ state.marketDay=day; }
 const shift=day%weapons.length;
 const stock=[0,1,2,3].map((_,i)=>weapons[(i+shift)%weapons.length]).map((w,i)=>({...w,cost:Math.max(180,w.cost+(i%2?50:-30))}));
 const mood=state.merchantRep>=5?'«Для тебя цена будет лучше.»':state.merchantRep>=2?'«Мы уже знаем друг друга.»':'«Сегодня хороший товар.»';
 const moodEl=$("#merchantMood"); if(moodEl)moodEl.textContent=mood;
 const repEl=$("#merchantRep"); if(repEl)repEl.textContent=`Репутация ${state.merchantRep}`;
 const resetEl=$("#marketReset"); if(resetEl){const left=86400000-(Date.now()%86400000);resetEl.textContent=`Новый ассортимент примерно через ${Math.max(1,Math.ceil(left/3600000))} ч.`;}
 $("#shopGrid").innerHTML=stock.map(w=>{const finalCost=state.merchantRep>=5?Math.floor(w.cost*.9):state.merchantRep>=2?Math.floor(w.cost*.95):w.cost;return `<div class="item"><div class="pic">${w.icon}</div><b>${w.name}</b><span>Урон +${w.damage}</span><button data-buy="${w.name}" data-cost="${finalCost}">${finalCost} 🪙 · КУПИТЬ</button></div>`}).join('');
}

$("#shopGrid").addEventListener("click",e=>{
 const b=e.target.closest("[data-buy]"); if(!b)return;
 const w=weapons.find(x=>x.name===b.dataset.buy); const cost=Number(b.dataset.cost||w.cost);
 if(state.coins<cost){const l=$("#merchantLog");if(l)l.textContent="Торговец: «Не хватает монет.»";return;}
 state.coins-=cost;state.weapon=w.name;state.bonusDamage=w.damage;state.inventory.push(w.icon);state.merchantRep+=1;
 const l=$("#merchantLog");if(l)l.textContent=`Торговец: «Хорошая покупка. ${w.name} теперь твой.» +1 репутация`;
 save();
});
const sellBtn=$("#sellItemBtn");
if(sellBtn)sellBtn.onclick=()=>{
 if(!state.inventory.length){$("#merchantLog").textContent='Торговец: «У тебя пока нечего продавать.»';return;}
 const icon=state.inventory.pop(); const price=40+Math.floor(Math.random()*41)+(state.merchantRep>=5?15:0);
 state.coins+=price;state.merchantRep+=1;
 $("#merchantLog").textContent=`Торговец купил предмет ${icon}: +${price} 🪙 · +1 репутация`;
 save();
};

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
/* Territory v35 — живой игровой город: без навязчивого автоспама */
(function initLivingCity(){
  const home=document.querySelector('.real-home');
  if(!home || home.dataset.lifeReady==='1') return;
  home.dataset.lifeReady='1';
  const action=home.querySelector('#sceneAction');
  const center=home.querySelector('.hs-city');
  const weapon=home.querySelector('.hs-weapon');
  const guard=home.querySelector('.guard-label');
  const trader=home.querySelector('.trader-label');
  let timer;
  function notify(text){
    if(!action)return;
    action.textContent=text;
    action.classList.remove('show');
    void action.offsetWidth;
    action.classList.add('show');
    clearTimeout(timer);
    timer=setTimeout(()=>action.classList.remove('show'),3000);
  }
  [[center,'Центральный квартал Sdolars'],[weapon,'Оружейная: покупка и ремонт'],[guard,'Alex: «В городе спокойно. Будь внимателен.»'],[trader,'Торговец: «Посмотри товары, странник.»']]
    .forEach(([el,text])=>el&&el.addEventListener('click',()=>notify(text)));
})();

/* Territory v32 — scene interactions */
(function sceneInteractions(){
  const home=document.querySelector('.real-home'); if(!home)return;
  const action=document.querySelector('#sceneAction');
  const notes={
    '.hs-city':'Центральный квартал: город открыт для исследования.',
    '.hs-weapon':'Оружейная готова: выбирай оружие и улучшай снаряжение.',
    '.guard-label':'Alex: «В городе спокойно. Будь внимателен.»',
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


/* Territory v38 — Alex becomes a real city NPC with a persistent quest */
(function alexQuest(){
  const home=document.querySelector('.real-home'); const guard=home&&home.querySelector('.guard-label'); const action=home&&home.querySelector('#sceneAction');
  if(!home||!guard||!action)return;
  function msg(text){ action.innerHTML=text; action.classList.add('show'); clearTimeout(action._alexTimer); action._alexTimer=setTimeout(()=>action.classList.remove('show'),5000); }
  guard.addEventListener('click',function(ev){
    ev.preventDefault(); ev.stopImmediatePropagation();
    if(state.alexQuest===0){
      state.alexQuest=1; save();
      msg('<b>Alex:</b> «Нужен патруль у ворот. Следи за городом и помогай, если начнётся тревога.»<br><button id="alexAccept" class="alex-mini-btn">Принято</button>');
    }else if(state.alexQuest===1){
      msg('<b>Alex:</b> «Патруль продолжается. Следи за событиями города.»');
    }else{
      msg('<b>Alex:</b> «Хорошая работа. Город может на тебя рассчитывать.»');
    }
  },true);
  action.addEventListener('click',function(ev){
    const b=ev.target.closest('#alexAccept'); if(!b)return;
    b.textContent='Задание принято'; b.disabled=true; state.cityRep+=1; save();
    setTimeout(()=>action.classList.remove('show'),900);
  });
})();

/* Territory v36 — живой автоматический поток городских событий */
(function cityEvents(){
  const home=document.querySelector('.real-home');
  const event=document.querySelector('#cityEvent');
  if(!home||!event)return;
  const title=document.querySelector('#cityEventTitle');
  const text=document.querySelector('#cityEventText');
  const kicker=document.querySelector('#cityEventKicker');
  let timer=null, nextTimer=null, opened=false, lastIndex=-1;
  const events=[
    {k:'СОБЫТИЕ ГОРОДА',t:'Вечерний караван',d:'У ворот Sdolars появился торговый караван.',help:'Караванщики отблагодарили тебя: +60 🪙',trade:'Удачный торг: +35 🪙',h:60,tr:35,xp:10},
    {k:'ЗАДАНИЕ ALEX',t:'Сигнал у ворот',d:'Alex подал знак: у городских ворот нужна помощь.',help:'Ты помог Alex отбить нападение: +150 🪙 +25 XP',trade:'Alex: «Сейчас не до торговли.»',h:150,tr:0,xp:25,alex:true},
    {k:'ГОРОДСКАЯ СЛУЖБА',t:'Тревога у ворот',d:'Alex заметил подозрительное движение за стеной.',help:'Ты помог стражу. +45 🪙 +10 XP',trade:'Сейчас не до торговли.',h:45,tr:0,xp:10},
    {k:'СЛУЧАЙНАЯ ВСТРЕЧА',t:'Потерянный кошелёк',d:'На площади кто-то обронил кошелёк с монетами.',help:'Ты вернул кошелёк хозяину: +80 🪙',trade:'Ты оставил находку себе: +25 🪙',h:80,tr:25,xp:8},
    {k:'СЛУХИ ГОРОДА',t:'Странник у таверны',d:'Незнакомец шепчет о дороге, которая открылась за стеной.',help:'Ты выслушал странника: +30 🪙 +12 XP',trade:'Ты обменялся новостями: +20 🪙',h:30,tr:20,xp:12},
    {k:'ГОРОДСКАЯ ЖИЗНЬ',t:'Ссора на рынке',d:'Двое торговцев спорят прямо посреди площади.',help:'Ты помог уладить спор: +50 🪙 +10 XP',trade:'Ты сделал ставку на исход: +40 🪙',h:50,tr:40,xp:10},
    {k:'ТОРГОВЫЙ СЛУЧАЙ',t:'Срочный заказ торговца',d:'Торговец ищет покупателя на редкое оружие до закрытия рынка.',help:'Ты помог с заказом: +70 🪙 +12 XP',trade:'Ты поторговался жёстко: +55 🪙',h:70,tr:55,xp:12,trader:true},
    {k:'РЕДКОЕ СОБЫТИЕ',t:'Посыльный из-за стен',d:'В город прибыл раненый посыльный с важной вестью.',help:'Ты помог посыльному: +120 🪙 +20 XP',trade:'Ты получил плату за доставку: +70 🪙',h:120,tr:70,xp:20}
  ];
  function close(){
    event.classList.remove('show');
    home.classList.remove('city-event-active');
    opened=false;
    clearTimeout(timer);
    scheduleNext(9000+Math.random()*10000);
  }
  function pickEvent(){
    if(state.alexQuest===1 && Math.random()<0.42){
      const ai=events.findIndex(x=>x.alex); if(ai>=0 && ai!==lastIndex){ lastIndex=ai; return events[ai]; }
    }
    let i=Math.floor(Math.random()*events.length);
    if(events.length>1 && i===lastIndex) i=(i+1)%events.length;
    lastIndex=i; return events[i];
  }
  function open(){
    if(opened || !document.querySelector('#home.active')) return;
    opened=true; home.classList.add('city-event-active');
    const e=pickEvent(); event._current=e;
    kicker.textContent=e.k; title.textContent=e.t; text.textContent=e.d;
    event.querySelector('.city-event-actions').innerHTML='<button data-event="help">Помочь</button><button data-event="trade">Торговать</button><button data-event="close">Позже</button>';
    event.classList.add('show');
    clearTimeout(timer);
    timer=setTimeout(()=>close(),15000);
  }
  function scheduleNext(ms){
    clearTimeout(nextTimer);
    nextTimer=setTimeout(open,ms);
  }
  event.addEventListener('click',e=>{
    const b=e.target.closest('[data-event]'); if(!b)return;
    const cur=event._current;
    if(b.dataset.event==='close'){close();return;}
    const reward=b.dataset.event==='help'?cur.h:cur.tr;
    if(reward){
      state.coins+=reward;
      state.exp+=cur.xp||10;
      if(cur.alex && state.alexQuest===1){state.alexQuest=2; state.cityRep+=2;}
      if(cur.trader){state.merchantRep+=1;}
      while(state.exp>=100){state.exp-=100;state.level++;state.maxHp+=10;state.hp=state.maxHp;}
      save();
    }
    text.textContent=b.dataset.event==='help'?cur.help:cur.trade;
    event.querySelector('.city-event-actions').innerHTML='<button data-event="close">Продолжить</button>';
    clearTimeout(timer); timer=setTimeout(close,2600);
  });
  // Город начинает жить сам: первое событие — быстро, затем новые встречи появляются регулярно.
  scheduleNext(7000);
})();

/* Territory v40 — районы становятся игровыми локациями */
(function livingDistricts(){
  const screen=document.querySelector('#districts'); if(!screen)return;
  const info=document.querySelector('#districtInfo'), kicker=document.querySelector('#districtKicker'), title=document.querySelector('#districtTitle'), text=document.querySelector('#districtText'), action=document.querySelector('#districtAction'), log=document.querySelector('#districtLog');
  const data={
    center:{k:'ЦЕНТРАЛЬНЫЙ КВАРТАЛ',t:'Центр Sdolars',d:'Главная площадь города. Здесь чаще всего происходят городские события и встречается Alex.',r:35,xp:8,msg:'Ты прошёл через центральную площадь. Город кипит жизнью.'},
    port:{k:'ПОРТ',t:'Старый порт',d:'Причалы, грузчики и приезжие. Иногда здесь появляются выгодные сделки и редкие товары.',r:55,xp:12,msg:'У причала найден груз с наградой.'},
    ruins:{k:'РУИНЫ',t:'Старые руины',d:'Опасный район за стеной. Здесь можно найти добычу, но иногда встречаются противники.',r:75,xp:18,msg:'В руинах найдена старая тайная кладка.'}
  };
  let current='center';
  function select(id){
    const d=data[id]; if(!d)return; current=id;
    screen.querySelectorAll('.map-point[data-district]').forEach(b=>b.classList.toggle('selected',b.dataset.district===id));
    kicker.textContent=d.k; title.textContent=d.t; text.textContent=d.d; action.textContent=`ОТПРАВИТЬСЯ · +${d.r} 🪙`;
  }
  screen.addEventListener('click',e=>{
    const point=e.target.closest('.map-point[data-district]'); if(point){select(point.dataset.district);return;}
    if(e.target.closest('#districtAction')){
      const d=data[current]; state.coins+=d.r; state.exp+=d.xp; state.cityRep+=1;
      while(state.exp>=100){state.exp-=100;state.level++;state.maxHp+=10;state.hp=state.maxHp;}
      save(); log.textContent=`${d.msg} +${d.r} 🪙 · +${d.xp} XP · +1 репутация города.`;
    }
  });
  select('center');
})();
