const defaultState={coins:1000,gems:25,level:1,exp:0,hp:120,maxHp:120,enemyHp:100,weapon:"Кулаки",bonusDamage:0,inventory:["🪓"],alexQuest:0,cityRep:0};
let state=JSON.parse(localStorage.getItem("territory_save_v1")||"null")||structuredClone(defaultState);
state.alexQuest=Number(state.alexQuest||0); state.cityRep=Number(state.cityRep||0); state.merchantRep=Number(state.merchantRep||0); state.marketDay=Number(state.marketDay||Math.floor(Date.now()/86400000));
state.gameDice=Number(state.gameDice??47); state.gameRolls=Number(state.gameRolls??0); state.gameSteps=Number(state.gameSteps??0); state.gameMilestones=Array.isArray(state.gameMilestones)?state.gameMilestones:[]; state.gameTaskClaims=Array.isArray(state.gameTaskClaims)?state.gameTaskClaims:[]; state.gamePanelClaims=Array.isArray(state.gamePanelClaims)?state.gamePanelClaims:[]; state.gameGiftDate=String(state.gameGiftDate||""); state.gameEndsAt=Number(state.gameEndsAt||0); if(!state.gameEndsAt)state.gameEndsAt=Date.now()+2*86400000+14*3600000+45*60000; const GAME_TRACK_CELLS=20; state.gameLap=Math.max(0,Math.floor(state.gameSteps/GAME_TRACK_CELLS)); state.gamePos=((state.gameSteps%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
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
  const dc=$("#diceCount"); if(dc)dc.textContent=Math.max(0,state.gameDice);
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
/* Territory v43 — Game: reference-inspired diamond event board */
const GAME_CELLS=[
 {icon:'🎁',value:'1',type:'start',label:'ПОДАРОК'},
 {icon:'💎',value:'20',type:'purple',label:'КРИСТАЛЛЫ'},
 {icon:'❓',value:'?',type:'quest',label:'СЮРПРИЗ'},
 {icon:'💧',value:'50',type:'blue',label:'РЕСУРС'},
 {icon:'📜',value:'7',type:'special',label:'СВИТОК'},
 {icon:'🧰',value:'1',type:'special',label:'ПРЕДМЕТ'},
 {icon:'❓',value:'?',type:'quest',label:'СЮРПРИЗ'},
 {icon:'🪙',value:'750',label:'МОНЕТЫ'},
 {icon:'💧',value:'30',type:'blue',label:'РЕСУРС'},
 {icon:'💜',value:'5',type:'purple',label:'РЕСУРС'},
 {icon:'🪙',value:'160',label:'МОНЕТЫ'},
 {icon:'❓',value:'?',type:'quest',label:'СЮРПРИЗ'},
 {icon:'📜',value:'10',type:'special',label:'СВИТОК'},
 {icon:'💧',value:'30',type:'blue',label:'РЕСУРС'},
 {icon:'🪙',value:'750',label:'МОНЕТЫ'},
 {icon:'💎',value:'5',type:'purple',label:'КРИСТАЛЛЫ'},
 {icon:'❓',value:'?',type:'quest',label:'СЮРПРИЗ'},
 {icon:'🪙',value:'300',label:'МОНЕТЫ'},
 {icon:'💎',value:'20',type:'purple',label:'КРИСТАЛЛЫ'},
 {icon:'🎁',value:'30',type:'start',label:'КРУГ'}
];
const GAME_REWARDS=[
 {lap:5,icon:'📜',title:'Круг 5',items:[['📜','30','свиток'],['💎','10','кристаллов'],['🪙','500','монет']]},
 {lap:10,icon:'🎒',title:'Круг 10',items:[['🎒','1','особый предмет'],['💎','20','кристаллов'],['🪙','750','монет']]},
 {lap:15,icon:'🟣',title:'Круг 15',items:[['💎','50','кристаллов'],['🧰','2','предмета'],['🪙','1000','монет']]},
 {lap:20,icon:'🧰',title:'Круг 20',items:[['🧰','10','предметов'],['💎','70','кристаллов'],['🪙','1500','монет']]},
 {lap:25,icon:'💎',title:'Круг 25',items:[['💎','30','кристаллов'],['🏆','1','редкая награда'],['🪙','2500','монет']]}
];
let gameMoving=false, gameSkipRequested=false, gameTimerId=null, gameModalTimerId=null;
function gameEventTimer(){
 const el=$("#gameTimer"); if(!el)return;
 const tick=()=>{let left=Math.max(0,state.gameEndsAt-Date.now()); const d=Math.floor(left/86400000); left%=86400000; const h=Math.floor(left/3600000); left%=3600000; const m=Math.floor(left/60000); const sec=Math.floor((left%60000)/1000); el.textContent=`${d}д ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;};
 tick(); clearInterval(gameTimerId); gameTimerId=setInterval(tick,1000);
}
function gameBoardInit(){
 const board=$("#gameBoard"), track=$("#gameRewardTrack"), token=$("#gameToken"); if(!board||!track)return;
 board.innerHTML='';
 const n=GAME_CELLS.length;
 for(let i=0;i<n;i++){
  const cell=document.createElement('button'); cell.type='button'; cell.className='board-cell '+(GAME_CELLS[i].type||'');
  const c=GAME_CELLS[i]; cell.innerHTML=`<span class="tile-content"><span class="tile-icon">${c.icon}</span><b>${c.value}</b><small>${c.label}</small></span>`; cell.dataset.index=i;
  // 20-cell closed diamond track: 5 cells on each side, evenly spaced with safe gaps.
  const side=Math.floor(i/5), k=i%5, t=[0.10,0.30,0.50,0.70,0.90][k];
  const edges=[[[50,8],[92,50]],[[92,50],[50,92]],[[50,92],[8,50]],[[8,50],[50,8]]];
  const a=edges[side][0], b=edges[side][1];
  const x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t;
  cell.style.left=x+'%'; cell.style.top=y+'%';
  cell.style.setProperty('--tile-angle',Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+'deg');
  board.appendChild(cell);
 }
 if(token){ board.appendChild(token); }
 track.innerHTML=GAME_REWARDS.map(r=>{const first=r.items&&r.items[0]?r.items[0]:[r.icon,'','']; return `<button type="button" class="reward-step ${state.gameMilestones.includes(r.lap)?'done':''}" data-lap="${r.lap}"><span class="reward-icon">${first[0]||r.icon}</span><b class="reward-amount">${first[1]||''}</b><small>${r.title}</small></button>`}).join('');
 gamePlaceToken(false); gameTasksInit(); gameUpdateStatus();
}
function gamePlaceToken(animate=true){
 const token=$("#gameToken"), board=$("#gameBoard"); if(!token||!board)return;
 const i=((state.gamePos%GAME_CELLS.length)+GAME_CELLS.length)%GAME_CELLS.length;
 const cell=board.querySelector(`.board-cell[data-index="${i}"]`); if(!cell)return;
 token.style.left=cell.style.left; token.style.top=cell.style.top;
 token.classList.toggle('moving',animate); board.querySelectorAll('.board-cell').forEach((c,n)=>c.classList.toggle('active',n===i));
}
function gameUpdateStatus(){
 const s=$("#gameStatus");
 const lap=Math.floor(state.gameSteps/GAME_TRACK_CELLS);
 const pos=((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
 if(s)s.textContent=`Круг ${lap} · клетка ${pos+1}/20 · ${state.gameMoving?'Идёт движение…':'Брось кубик.'}`;
 const dc=$("#diceCount"); if(dc)dc.textContent=Math.max(0,state.gameDice);
 const roll=$("#spinBtn"); if(roll)roll.disabled=gameMoving || state.gameDice<=0 || document.querySelector('#gameRewardModal.show');
}
function gameAddReward(item){
 const [icon,amount,label]=item;
 const n=Number(amount)||0;
 if(label.includes('монет')) state.coins+=n;
 else if(label.includes('кристалл')) state.gems+=n;
 else state.inventory.push(icon);
}
function gameRandomReward(){
 const pool=[['💎','10','кристаллов'],['🪙','80','монет'],['🪙','140','монет'],['📜','1','свиток'],['🧰','1','предмет']];
 return pool[Math.floor(Math.random()*pool.length)];
}
function gameShowReward(reward,title='Поздравляем!'){
 const modal=$("#gameRewardModal"), items=$("#rewardItems"); if(!modal||!items)return;
 $("#rewardModalTitle").textContent=title; $("#rewardModalText").textContent='Получено';
 items.innerHTML=reward.map(x=>`<div class="reward-item"><i>${x[0]}</i><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
 reward.forEach(gameAddReward); save(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
 let sec=3; $("#modalCloseHint").textContent=`Нажмите, чтобы закрыть (${sec}s)`;
 clearInterval(gameModalTimerId); gameModalTimerId=setInterval(()=>{sec--; const el=$("#modalCloseHint"); if(el)el.textContent=sec>0?`Нажмите, чтобы закрыть (${sec}s)`:'Нажмите, чтобы закрыть'; if(sec<=0)clearInterval(gameModalTimerId)},1000);
 gameUpdateStatus();
}
function gameResolveCell(){
 const cell=GAME_CELLS[((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS];
 const reward=cell.value==='?'?gameRandomReward():[[cell.icon,cell.value,cell.label.toLowerCase()]];
 state.exp+=5;
 while(state.exp>=100){state.exp-=100;state.level++;state.maxHp+=10;state.hp=state.maxHp}
 state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
 const reached=GAME_REWARDS.filter(r=>state.gameLap>=r.lap && !state.gameMilestones.includes(r.lap));
 state.gameTaskProgress=state.gameRolls;
 save();
 gameShowReward(reward,cell.value==='?'?'Сюрприз!':'Получено');
 if(reached.length){
   reached.forEach(r=>state.gameMilestones.push(r.lap));
   save();
   setTimeout(()=>gameShowReward(reached.map(r=>r.items).flat(),`Поздравляем! Круг ${reached[reached.length-1].lap}`),3400);
 }
 gameTasksInit();
}
async function gameRoll(){
 if(gameMoving || document.querySelector('#gameRewardModal.show'))return;
 if(state.gameDice<=0){const s=$("#gameStatus");if(s)s.textContent='Кубики закончились. Получи новые в наградах.';return}
 state.gameDice--; state.gameRolls++; state.gameTaskProgress=state.gameRolls; save();
 gameMoving=true; state.gameMoving=true; gameSkipRequested=false; document.querySelector('#casino').classList.add('rolling');
 const roll=1+Math.floor(Math.random()*6), face=['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1]; $("#diceFace").textContent=face;
 const skip=$("#skipRollBtn"); if(skip)skip.disabled=false;
 gameUpdateStatus();
 for(let step=0;step<roll;step++){
   state.gamePos=(state.gamePos+1)%GAME_TRACK_CELLS;
   if(state.gamePos===0)state.gameLap++;
   state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
   gamePlaceToken(true); gameUpdateStatus();
   if(!gameSkipRequested) await new Promise(r=>setTimeout(r,300));
 }
 gameMoving=false; state.gameMoving=false; document.querySelector('#casino').classList.remove('rolling');
 if(skip)skip.disabled=true;
 save();
 gameResolveCell();
}
$("#spinBtn").onclick=gameRoll;
$("#skipRollBtn").onclick=()=>{ if(gameMoving)gameSkipRequested=true; };
$("#gameModalClose").onclick=()=>{clearInterval(gameModalTimerId);$("#gameRewardModal").classList.remove('show');$("#gameRewardModal").setAttribute('aria-hidden','true');gameUpdateStatus();};
$("#gameRewardModal").addEventListener('click',e=>{if(e.target.id==='gameRewardModal')$("#gameModalClose").click()});
function gameOpenPanel(kind){
 const modal=$("#gamePanelModal"), list=$("#gamePanelList"); if(!modal||!list)return;
 const title=$("#gamePanelTitle"), sub=$("#gamePanelSubtitle"), icon=$("#gamePanelIcon");
 let rows=[];
 if(kind==='special'){
  title.textContent='Монополия'; sub.textContent='Спецпредложение'; icon.textContent='☷';
  rows=[
   {items:[['💎','60'],['🎲','5']],button:'$1',price:1},
   {items:[['💎','180'],['🎲','10']],button:'$2',price:2},
   {items:[['🎟️','2'],['🎲','10']],button:'Бесплатно',free:true,id:'sp1'},
   {items:[['💎','300'],['🎲','15']],button:'$3',price:3},
   {items:[['📜','2'],['🎲','10']],button:'Бесплатно',free:true,id:'sp2'},
   {items:[['💎','500'],['🎲','20']],button:'$4',price:4}
  ];
 }else{
  title.textContent='Монополия'; sub.textContent='Подарок'; icon.textContent='🎁';
  rows=[
   {name:'Подарочный набор 1',items:[['💎','10']],button:'Бесплатно',free:true,id:'gift1'},
   {name:'Подарочный набор 2',items:[['💎','10'],['🎲','2']],button:'3/3',free:true,id:'gift2'},
   {name:'Подарочный набор 3',items:[['🎲','3']],button:'💎 288',price:288,currency:'gems',id:'gift3'},
   {name:'Подарочный набор 4',items:[['💎','100'],['🎲','5']],button:'$1',price:1,id:'gift4'}
  ];
 }
 list.innerHTML=rows.map((r,i)=>`<div class="panel-offer-row"><div class="panel-offer-name">${r.name||'Набор события '+(i+1)}</div><div class="panel-offer-body"><div class="panel-offer-items">${r.items.map(x=>`<span><i>${x[0]}</i><b>${x[1]}</b></span>`).join('')}</div><button type="button" data-panel-buy="${r.id||''}" data-free="${r.free?'1':'0'}" data-price="${r.price||0}" data-currency="${r.currency||'money'}">${r.button}</button></div></div>`).join('');
 modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
}
function gamePanelBuy(b){
 if(b.dataset.free==='1'){
  const id=b.dataset.panelBuy||''; state.gamePanelClaims=Array.isArray(state.gamePanelClaims)?state.gamePanelClaims:[];
  if(state.gamePanelClaims.includes(id)){b.disabled=true;b.textContent='Получено';return;}
  state.gamePanelClaims.push(id); const txt=b.textContent; b.textContent='Получено';
  if(id==='gift1'){state.gems+=10;} else if(id==='gift2'){state.gems+=10;state.gameDice+=2;} else if(id==='sp1'){state.gameDice+=10;} else if(id==='sp2'){state.inventory.push('🎟️');state.gameDice+=10;}
  save(); return;
 }
 const price=Number(b.dataset.price||0), currency=b.dataset.currency||'money';
 if(currency==='gems'){
  if(state.gems<price){b.textContent='Не хватает';return;} state.gems-=price; state.gameDice+=3;
 }else{
  b.textContent='Доступно в событии'; return;
 }
 save(); b.disabled=true; b.textContent='Получено';
}
function gameTasksInit(){
 const list=$("#gameTasksList"); if(!list)return;
 const tasks=[
  {id:'roll3',name:'Сделать 3 броска',goal:3,progress:()=>Math.min(state.gameRolls,3),reward:['🎲','3','кубика']},
  {id:'steps10',name:'Пройти 10 клеток',goal:10,progress:()=>Math.min(state.gameSteps,10),reward:['💎','10','кристаллов']},
  {id:'lap5',name:'Дойти до 5-го круга',goal:5,progress:()=>Math.min(state.gameLap,5),reward:['🪙','750','монет']}
 ];
 list.innerHTML=tasks.map(t=>{const prog=t.progress(),done=prog>=t.goal,claimed=state.gameTaskClaims.includes(t.id);return `<div class="task-row ${claimed?'done':''}"><div><b>${t.name}</b><small>${prog}/${t.goal} · награда ${t.reward[0]} ${t.reward[1]}</small></div><button type="button" data-task-claim="${t.id}" ${!done||claimed?'disabled':''}>${claimed?'Получено':done?'Получить':'В процессе'}</button></div>`}).join('');
}
$("#gameTasksList").addEventListener('click',e=>{
 const b=e.target.closest('[data-task-claim]'); if(!b)return; const id=b.dataset.taskClaim; if(state.gameTaskClaims.includes(id))return;
 const rewards={roll3:['🎲','3','кубика'],steps10:['💎','10','кристаллов'],lap5:['🪙','750','монет']}; const r=rewards[id]; if(!r)return;
 state.gameTaskClaims.push(id); if(r[2].includes('кубик'))state.gameDice+=Number(r[1]); else if(r[2].includes('кристалл'))state.gems+=Number(r[1]); else state.coins+=Number(r[1]); save(); gameTasksInit();
});

$("#gameTasksBtn").onclick=()=>{$("#gameTasksModal").classList.add('show');$("#gameTasksModal").setAttribute('aria-hidden','false');gameTasksInit()};
$("#gameTasksClose").onclick=()=>{$("#gameTasksModal").classList.remove('show');$("#gameTasksModal").setAttribute('aria-hidden','true')};

const gameSpecialBtn=$("#gameSpecialBtn"); if(gameSpecialBtn)gameSpecialBtn.onclick=()=>gameOpenPanel('special');
const gameGiftBtn=$("#gameGiftBtn"); if(gameGiftBtn)gameGiftBtn.onclick=()=>gameOpenPanel('gift');
const gamePanelClose=$("#gamePanelClose"); if(gamePanelClose)gamePanelClose.onclick=()=>{$("#gamePanelModal").classList.remove('show');$("#gamePanelModal").setAttribute('aria-hidden','true');};
const gamePanelList=$("#gamePanelList"); if(gamePanelList)gamePanelList.addEventListener('click',e=>{const b=e.target.closest('[data-panel-buy]');if(b)gamePanelBuy(b);});
gameBoardInit();
gameEventTimer();

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
