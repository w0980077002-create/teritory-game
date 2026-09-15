/* Territory v93 — item rewards now grant their full quantity */
const defaultState={coins:1000,gems:25,level:1,exp:0,hp:120,maxHp:120,enemyHp:100,weapon:"Кулаки",bonusDamage:0,inventory:["🪓"],alexQuest:0,cityRep:0};
function gameLoadState(){
  try{
    const raw=localStorage.getItem("territory_save_v1");
    if(!raw)return structuredClone(defaultState);
    const parsed=JSON.parse(raw);
    return parsed&&typeof parsed==="object"?parsed:structuredClone(defaultState);
  }catch(e){
    console.warn("Territory save is damaged; using safe defaults",e);
    return structuredClone(defaultState);
  }
}
let state=gameLoadState();
state.alexQuest=Number(state.alexQuest||0); state.cityRep=Number(state.cityRep||0); state.merchantRep=Number(state.merchantRep||0); state.marketDay=Number(state.marketDay||Math.floor(Date.now()/86400000));
state.gameDice=Math.max(0,Number(state.gameDice??47)||0); state.gameRolls=Math.max(0,Number(state.gameRolls??0)||0); state.gameSteps=Math.max(0,Number(state.gameSteps??0)||0); state.gameEventVersion=Number(state.gameEventVersion??1)||1; state.gameTaskProgress=Math.max(0,Number(state.gameTaskProgress??state.gameRolls??0)||0); state.gameMilestones=Array.isArray(state.gameMilestones)?[...new Set(state.gameMilestones.map(Number).filter(Number.isFinite))]:[]; state.gameTaskClaims=Array.isArray(state.gameTaskClaims)?[...new Set(state.gameTaskClaims.map(String))]:[]; state.gamePanelClaims=Array.isArray(state.gamePanelClaims)?[...new Set(state.gamePanelClaims.map(String))]:[]; state.gameJackpotClaims=Array.isArray(state.gameJackpotClaims)?[...new Set(state.gameJackpotClaims.map(Number).filter(Number.isFinite))]:[]; state.gameGiftDate=String(state.gameGiftDate||""); state.gameEndsAt=Number(state.gameEndsAt||0); if(!state.gameEndsAt)state.gameEndsAt=Date.now()+2*86400000+14*3600000+45*60000; const GAME_TRACK_CELLS=27; state.gameLap=Math.max(0,Math.floor(state.gameSteps/GAME_TRACK_CELLS)); state.gamePos=((state.gameSteps%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS; state.gameSaveVersion=2;
const zones=["head","chest","stomach","waist","legs"];
const names={head:"Голова",chest:"Грудь",stomach:"Живот",waist:"Пояс",legs:"Ноги"};
const weapons=[
 {name:"Боевой топор",icon:"🪓",damage:12,cost:300},
 {name:"Стальной меч",icon:"⚔️",damage:18,cost:650},
 {name:"Молот",icon:"🔨",damage:25,cost:1000},
 {name:"Арбалет",icon:"🏹",damage:31,cost:1500}
];
const $=s=>document.querySelector(s);
function save(){
  state.gameSteps=Math.max(0,Math.floor(state.gameLap*GAME_TRACK_CELLS+state.gamePos));
  state.gamePos=((Math.floor(state.gamePos)%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
  state.gameLap=Math.max(0,Math.floor(state.gameSteps/GAME_TRACK_CELLS));
  state.gameTaskProgress=Math.max(0,Number(state.gameTaskProgress??state.gameRolls??0)||0);
  state.gameSaveVersion=2;
  try{ localStorage.setItem("territory_save_v1",JSON.stringify(state)); }catch(e){ console.warn("Territory save failed",e); }
  render();
}
window.addEventListener("pagehide",()=>{try{state.gameMoving=false; save();}catch(e){}});
window.addEventListener("beforeunload",()=>{try{state.gameMoving=false; save();}catch(e){}});
window.addEventListener("storage",e=>{
  if(e.key!=="territory_save_v1"||state.gameMoving||!e.newValue)return;
  try{
    const incoming=JSON.parse(e.newValue);
    if(incoming&&typeof incoming==="object"){
      state={...state,...incoming};
      state.gameSteps=Math.max(0,Number(state.gameSteps)||0);
      state.gameLap=Math.max(0,Math.floor(state.gameSteps/GAME_TRACK_CELLS));
      state.gamePos=((state.gameSteps%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
      render(); gameBoardInit?.(); gameUpdateStatus?.();
    }
  }catch(err){console.warn("Territory external save ignored",err);}
});
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
 {icon:'🏁',value:'СТАРТ',type:'start',label:'НАЧАЛО ПУТЕШЕСТВИЯ'},
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
 {icon:'💧',value:'40',type:'blue',label:'РЕСУРС'},
 {icon:'📜',value:'5',type:'special',label:'СВИТОК'},
 {icon:'🪙',value:'500',label:'МОНЕТЫ'},
 {icon:'❓',value:'?',type:'quest',label:'СЮРПРИЗ'},
 {icon:'💎',value:'10',type:'purple',label:'КРИСТАЛЛЫ'},
 {icon:'🧰',value:'1',type:'special',label:'ПРЕДМЕТ'},
 {icon:'💧',value:'60',type:'blue',label:'РЕСУРС'},
 {icon:'🏁',value:'ФИНИШ',type:'start',label:'КОНЕЦ КРУГА'}
];
const GAME_REWARDS=[
 {lap:15,icon:'💎',title:'Круг 15',items:[['💎','50','кристаллов'],['🧰','2','предмета'],['🪙','1050','монет']]},
 {lap:20,icon:'🧰',title:'Круг 20',items:[['🧰','10','предметов'],['💎','70','кристаллов'],['🪙','1500','монет']]},
 {lap:25,icon:'📜',title:'Круг 25',items:[['📜','30','свитков'],['💎','30','кристаллов'],['🪙','2000','монет']]},
 {lap:30,icon:'🧰',title:'Круг 30',items:[['🧰','10','предметов'],['💎','80','кристаллов'],['🪙','2200','монет']]},
 {lap:35,icon:'📜',title:'Круг 35',items:[['📜','30','свитков'],['🏆','1','редкая награда'],['🪙','3000','монет']]}
];
let gameMoving=false, gameSkipRequested=false, gameTimerId=null, gameModalTimerId=null;
function gameEventTimer(){
 const el=$("#gameTimer"); if(!el)return;
 const tick=()=>{const raw=state.gameEndsAt-Date.now(); const left=Math.max(0,raw); const d=Math.floor(left/86400000); const remD=left%86400000; const h=Math.floor(remD/3600000); const remH=remD%3600000; const m=Math.floor(remH/60000); const sec=Math.floor((remH%60000)/1000); el.textContent=raw<=0?'ЗАВЕРШЕНО':`${d}д ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; if(raw<=0){const r=$("#spinBtn");if(r)r.disabled=true;const st=$("#gameStatus");if(st&&!gameMoving)st.textContent='Событие завершено. Дождитесь следующего события.';}};
 tick(); clearInterval(gameTimerId); gameTimerId=setInterval(tick,1000);
}
function gameBoardInit(){
 const board=$("#gameBoard"), track=$("#gameRewardTrack"); if(!board||!track)return;
 board.innerHTML='';
 const n=GAME_CELLS.length;
 for(let i=0;i<n;i++){
  const c=GAME_CELLS[i];
  const cell=document.createElement('button');
  cell.type='button';
  cell.className='board-cell '+(c.type||'')+(i===0?' start':'')+(i===n-1?' finish':'');
  cell.dataset.index=i;
  cell.innerHTML=`<span class="tile-content"><span class="tile-icon">${c.icon}</span><b>${c.value}</b><small>${c.label}</small></span>`;
  const pos=gameGridPosition(i,n);
  cell.style.left=pos.x+'%';
  cell.style.top=pos.y+'%';
  cell.style.setProperty('--tile-rot',pos.rot+'deg');
  cell.addEventListener('click',()=>gameSelectCell(i));
  board.appendChild(cell);
 }
 track.innerHTML=GAME_REWARDS.map(r=>{
   const first=r.items&&r.items[0]?r.items[0]:[r.icon,'',''];
   return `<button type="button" class="reward-step ${state.gameMilestones.includes(r.lap)?'done':''}" data-lap="${r.lap}"><span class="reward-icon">${first[0]||r.icon}</span><b class="reward-amount">${first[1]||''}</b><small>${r.title}</small></button>`;
 }).join('');
 gamePlaceToken(false);
 gameTasksInit();
 gameUpdateStatus();
 gameSelectCell(state.gamePos);
}
function gameGridPosition(i,n){
 // One continuous perimeter. 27 fixed points are spaced by equal path distance
 // around a diamond, so corners are never duplicated and tiles cannot stack.
 const vertices=[{x:50,y:7},{x:93,y:50},{x:50,y:93},{x:7,y:50}];
 const lengths=[]; let perimeter=0;
 for(let k=0;k<4;k++){
   const a=vertices[k],b=vertices[(k+1)%4];
   const len=Math.hypot(b.x-a.x,b.y-a.y);
   lengths.push(len); perimeter+=len;
 }
 const d=(i/n)*perimeter;
 let acc=0;
 for(let k=0;k<4;k++){
   const a=vertices[k],b=vertices[(k+1)%4],len=lengths[k];
   if(d<=acc+len || k===3){
     const t=Math.max(0,Math.min(1,(d-acc)/len));
     const x=a.x+(b.x-a.x)*t, y=a.y+(b.y-a.y)*t;
     const nextD=((i+1)/n)*perimeter;
     let nd=nextD;
     if(nd>=acc+len && k<3){
       const nb=vertices[k+1], nl=lengths[k+1];
       const nt=Math.min(1,(nd-(acc+len))/nl);
       return {x,y,rot:Math.atan2(nb.y-b.y,nb.x-b.x)*180/Math.PI+90};
     }
     const nt=Math.min(1,Math.max(0,(nextD-acc)/len));
     const nx=a.x+(b.x-a.x)*nt, ny=a.y+(b.y-a.y)*nt;
     return {x,y,rot:Math.atan2(ny-y,nx-x)*180/Math.PI+90};
   }
   acc+=len;
 }
 return {x:50,y:7,rot:45};
}
function gameSelectCell(index){
 const c=GAME_CELLS[index]; if(!c)return;
 const info=$("#gameCellInfo");
 if(info){ const title=info.querySelector('b'), sub=info.querySelector('span'); if(title)title.textContent=`Клетка ${index+1}${index===0?' · СТАРТ':''}${index===GAME_CELLS.length-1?' · ФИНИШ':''}`; if(sub)sub.textContent=index===0?'Отправная точка · начни путешествие':(c.value==='?'?'Случайная награда · нажми после хода':`${c.label} · награда ${c.value}`); }
}
function gamePlaceToken(animate=true){
 const token=$("#gameToken"), board=$("#gameBoard"); if(!token||!board)return;
 const i=((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
 const cell=board.querySelector(`.board-cell[data-index="${i}"]`); if(!cell)return;
 token.style.left=cell.offsetLeft+cell.offsetWidth/2+'px';
 token.style.top=cell.offsetTop+cell.offsetHeight/2+'px';
 token.classList.toggle('moving',animate);
 board.querySelectorAll('.board-cell').forEach((c,n)=>{
   const passed=state.gameLap>0 || n<i;
   c.classList.toggle('active',n===i);
   c.classList.toggle('passed',passed);
 });
 gameSelectCell(i);
}
function gameUpdateStatus(){
 const s=$("#gameStatus"), badge=$("#gameLapBadge"), turn=$("#gameTurnNo"), cellNo=$("#gameCellNo");
 const lap=Math.floor(state.gameSteps/GAME_TRACK_CELLS);
 const pos=((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS;
 if(s)s.textContent=`ХОД · Круг ${lap} · клетка ${pos+1}/${GAME_TRACK_CELLS} · ${state.gameMoving?'идёт движение…':'брось кубик'}`;
 if(badge)badge.textContent=lap; if(turn)turn.textContent=`Ход ${state.gameRolls}`; if(cellNo)cellNo.textContent=pos+1;
 const dc=$("#diceCount"); if(dc)dc.textContent=Math.max(0,state.gameDice);
 const center=document.querySelector('#game .game-center'); if(center)center.dataset.lap=lap;
 const roll=$("#spinBtn"); if(roll)roll.disabled=gameMoving || state.gameDice<=0 || document.querySelector('#gameRewardModal.show');
}
function gameAddReward(item){
 const [icon,amount,label]=item;
 const n=Number(amount)||0;
 if(label.includes('монет')) state.coins+=n;
 else if(label.includes('кристалл')) state.gems+=n;
 else {
   const count=Math.max(1,Math.floor(n));
   for(let i=0;i<count;i++) state.inventory.push(icon);
 }
}
function gameRandomReward(){
 const pool=[['💎','10','кристаллов'],['🪙','80','монет'],['🪙','140','монет'],['📜','1','свиток'],['🧰','1','предмет']];
 return pool[Math.floor(Math.random()*pool.length)];
}
let gameRewardQueue=[];
function gameShowReward(reward,title='Поздравляем!',grant=true){
 const modal=$("#gameRewardModal"), items=$("#rewardItems"); if(!modal||!items||!Array.isArray(reward)||!reward.length)return;
 const alreadyOpen=modal.classList.contains('show');
 const batch=document.querySelector('#gameBatchModal.show');
 if(grant){ reward.forEach(gameAddReward); save(); }
 if(alreadyOpen){ gameRewardQueue.push({reward,title,grant:false}); return; }
 if(batch){ batch.classList.remove('show'); batch.setAttribute('aria-hidden','true'); }
 $("#rewardModalTitle").textContent=title; $("#rewardModalText").textContent=grant?'Получено':'Предпросмотр';
 items.innerHTML=reward.map(x=>`<div class="reward-item"><i>${x[0]}</i><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
 modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
 let sec=3; $("#modalCloseHint").textContent=`Нажмите, чтобы закрыть (${sec}s)`;
 clearInterval(gameModalTimerId); gameModalTimerId=setInterval(()=>{sec--; const el=$("#modalCloseHint"); if(el)el.textContent=sec>0?`Нажмите, чтобы закрыть (${sec}s)`:'Нажмите, чтобы закрыть'; if(sec<=0)clearInterval(gameModalTimerId)},1000);
 gameUpdateStatus();
}
function gameShowNextQueuedReward(){
 const modal=$("#gameRewardModal");
 if(modal&&modal.classList.contains('show'))return;
 const next=gameRewardQueue.shift();
 if(next)gameShowReward(next.reward,next.title,false);
}
function gameClaimNewMilestones(){
 state.gameMilestones=Array.isArray(state.gameMilestones)?state.gameMilestones:[];
 const reached=GAME_REWARDS.filter(r=>state.gameLap>=r.lap && !state.gameMilestones.includes(r.lap));
 reached.forEach(r=>state.gameMilestones.push(r.lap));
 return reached;
}
function gameGrantExp(amount=5){
 state.exp+=amount;
 while(state.exp>=100){
   state.exp-=100;
   state.level++;
   state.maxHp+=10;
   state.hp=state.maxHp;
 }
}
function gameResolveCell(){
 const cell=GAME_CELLS[((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS];
 const reward=cell.value==='?'?gameRandomReward():[[cell.icon,cell.value,cell.label.toLowerCase()]];
 gameGrantExp(5);
 state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
 state.gameTaskProgress=state.gameRolls;
 const reached=gameClaimNewMilestones();
 const jackpotReached=gameClaimJackpotRounds();
 save();
 gameShowReward(reward,cell.value==='?'?'Сюрприз!':'Клетка пройдена');
 if(reached.length){
   const milestoneItems=reached.flatMap(r=>r.items||[]);
   setTimeout(()=>gameShowReward(milestoneItems,`Награда за круг ${reached[reached.length-1].lap}`),3600);
 }
 if(jackpotReached.length){
   const last=jackpotReached[jackpotReached.length-1];
   const items=last.reward?[last.reward]:[];
   const delay=reached.length?7200:3600;
   setTimeout(()=>{if(items.length)gameShowReward(items,`Награда за круг ${last.round}`)},delay);
 }
 gameTasksInit();
 gameBoardInit();
}
function gameClaimJackpotRounds(){
  state.gameJackpotClaims=Array.isArray(state.gameJackpotClaims)?state.gameJackpotClaims:[];
  const maxRound=Math.min(235,Math.max(0,Math.floor(state.gameLap)));
  const newly=[];
  for(let round=1;round<=maxRound;round++){
    if(state.gameJackpotClaims.includes(round))continue;
    const group=JACKPOT_GROUPS_V79.find(g=>round>=g.from&&round<=g.to);
    if(!group)continue;
    const reward=group.items[round-group.from];
    if(reward){
      // Mark the jackpot round as claimed here, but do NOT grant the item yet.
      // gameRoll/gameRoll10 will pass the newly claimed rewards to gameShowReward(),
      // which is the single place responsible for actually adding the reward.
      state.gameJackpotClaims.push(round);
      newly.push({round,reward});
    }
  }
  if(newly.length) state.gameJackpotClaims.sort((a,b)=>a-b);
  return newly;
}

async function gameRoll(){
 if(gameMoving || document.querySelector('#gameRewardModal.show'))return;
 if(state.gameEndsAt && Date.now() >= state.gameEndsAt){ const st=$("#gameStatus"); if(st)st.textContent='Событие завершено. Дождитесь следующего события.'; gameUpdateStatus(); return; }
 if(state.gameDice<=0){const s=$("#gameStatus");if(s)s.textContent='Кубики закончились. Получи новые в наградах.';return}
 state.gameDice--; state.gameRolls++; state.gameTaskProgress=state.gameRolls; save();
 gameMoving=true; state.gameMoving=true; gameSkipRequested=false; document.querySelector('#game').classList.add('rolling');
 const roll=1+Math.floor(Math.random()*6), face=['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1]; $("#diceFace").textContent=face;
 const skip=$("#skipRollBtn"); if(skip)skip.disabled=false;
 gameUpdateStatus();
 for(let step=0;step<roll;step++){
   state.gamePos=(state.gamePos+1)%GAME_TRACK_CELLS;
   if(state.gamePos===0)state.gameLap++;
   state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
   save();
   gamePlaceToken(true); gameUpdateStatus();
   if(!gameSkipRequested) await new Promise(r=>setTimeout(r,300));
 }
 gameMoving=false; state.gameMoving=false; document.querySelector('#game').classList.remove('rolling');
 if(skip)skip.disabled=true;
 save();
 gameResolveCell();
}
$("#spinBtn").onclick=gameRoll;
$("#skipRollBtn").onchange=()=>{ if($("#skipRollBtn").checked)gameSkipRequested=true; };
$("#gameModalClose").onclick=()=>{clearInterval(gameModalTimerId);$("#gameRewardModal").classList.remove('show');$("#gameRewardModal").setAttribute('aria-hidden','true');gameUpdateStatus();setTimeout(gameShowNextQueuedReward,80);};
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
   {name:'Ежедневный подарок',items:[['💎','10'],['🎲','1']],button:(state.gameGiftDate===new Date().toISOString().slice(0,10)?'Получено сегодня':'Бесплатно'),free:true,id:'giftDaily'},
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
  if(state.gamePanelClaims.includes(id) && id!=='giftDaily'){b.disabled=true;b.textContent='Получено';return;}
  if(id==='giftDaily' && state.gameGiftDate===new Date().toISOString().slice(0,10)){b.disabled=true;b.textContent='Получено сегодня';return;}
  state.gamePanelClaims.push(id); const txt=b.textContent; b.textContent='Получено';
  if(id==='giftDaily'){state.gems+=10;state.gameDice+=1;state.gameGiftDate=new Date().toISOString().slice(0,10);} else if(id==='gift2'){state.gems+=10;state.gameDice+=2;} else if(id==='sp1'){state.gameDice+=10;} else if(id==='sp2'){state.inventory.push('🎟️');state.gameDice+=10;}
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
  {id:'lap15',name:'Дойти до 15-го круга',goal:15,progress:()=>Math.min(state.gameLap,15),reward:['🪙','750','монет']}
 ];
 list.innerHTML=tasks.map(t=>{const prog=t.progress(),done=prog>=t.goal,claimed=state.gameTaskClaims.includes(t.id);return `<div class="task-row ${claimed?'done':''}"><div><b>${t.name}</b><small>${prog}/${t.goal} · награда ${t.reward[0]} ${t.reward[1]}</small></div><button type="button" data-task-claim="${t.id}" ${!done||claimed?'disabled':''}>${claimed?'Получено':done?'Получить':'В процессе'}</button></div>`}).join('');
}
$("#gameTasksList").addEventListener('click',e=>{
 const b=e.target.closest('[data-task-claim]'); if(!b)return; const id=b.dataset.taskClaim; if(state.gameTaskClaims.includes(id))return;
 const rewards={roll3:['🎲','3','кубика'],steps10:['💎','10','кристаллов'],lap15:['🪙','750','монет']}; const r=rewards[id]; if(!r)return;
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

/* Territory v54 — Game finished interactions */
(function finishGameBlock(){
  const track=$('#gameRewardTrack');
  if(track) track.addEventListener('click',e=>{
    const b=e.target.closest('[data-lap]'); if(!b)return;
    const lap=Number(b.dataset.lap), r=GAME_REWARDS.find(x=>x.lap===lap); if(!r)return;
    if(state.gameMilestones.includes(lap)) gameShowReward(r.items,`Круг ${lap} · награда получена`,false);
    else { const s=$('#gameStatus'); if(s)s.textContent=`Круг ${lap}: пройди ещё ${Math.max(0,lap-state.gameLap)} круг(а).`; }
  });
  const prize=$('.game-prize-badge');
  if(prize){ prize.setAttribute('role','button'); prize.tabIndex=0; prize.addEventListener('click',()=>gameShowReward([['🎁','10','призовых попыток']], 'Призы x10', false)); }
  document.addEventListener('click',e=>{
    const c=e.target.closest('.game-modal,.game-panel-modal,.game-tasks-modal');
    if(!c || e.target!==c)return;
    const close=c.querySelector('.game-modal-close'); if(close)close.click();
  });
  const closeAll=()=>{
    ['#gameRewardModal','#gameTasksModal','#gamePanelModal'].forEach(id=>{const el=$(id);if(el){el.classList.remove('show');el.setAttribute('aria-hidden','true')}});
    gameUpdateStatus();
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
})();

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


/* Territory v78 — real x10 roll: 10 independent throws + 10-reward summary */
function gameEnsureBatchModal(){
  if(document.querySelector('#gameBatchModal')) return;
  const m=document.createElement('div');
  m.id='gameBatchModal'; m.className='game-modal'; m.setAttribute('aria-hidden','true');
  m.innerHTML=`<div class="game-modal-card" style="max-height:82vh;overflow:auto">
    <button type="button" id="gameBatchClose" aria-label="Закрыть">✕</button>
    <h3>Результат · Бросок ×10</h3>
    <p id="gameBatchSummary">10 бросков · 10 наград</p>
    <div id="batchResults" style="display:grid;gap:8px"></div>
  </div>`;
  const host=document.querySelector('#game') || document.body;
  host.appendChild(m);
  const c=m.querySelector('#gameBatchClose');
  c.onclick=()=>{m.classList.remove('show');m.setAttribute('aria-hidden','true');gameUpdateStatus()};
  m.addEventListener('click',e=>{if(e.target===m)c.click()});
}
function gameShowBatchResults(results){
  gameEnsureBatchModal();
  const m=$('#gameBatchModal'), list=$('#batchResults'), summary=$('#gameBatchSummary');
  if(!m||!list)return;
  if(summary)summary.textContent=`${results.length} бросков · ${results.length} наград`;
  const rows=results.map((r,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.07)">
    <span><b>Бросок ${i+1}</b> · ${r.face}</span><span>${r.icon} <b>${r.amount}</b> ${r.label}</span>
  </div>`).join('');
  const totals={}; results.forEach(r=>{const k=`${r.icon}|${r.label}`; totals[k]=(totals[k]||0)+(Number(r.amount)||0)});
  const totalRows=Object.entries(totals).map(([k,n])=>{const [icon,label]=k.split('|');return `<div style="padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.12);font-weight:700">Итого: ${icon} ${n} ${label}</div>`}).join('');
  list.innerHTML=totalRows+rows;
  m.classList.add('show'); m.setAttribute('aria-hidden','false');
}
function gameApplyCellRewardSilent(){
  const cell=GAME_CELLS[((state.gamePos%GAME_TRACK_CELLS)+GAME_TRACK_CELLS)%GAME_TRACK_CELLS];
  const reward=cell.value==='?'?gameRandomReward():[[cell.icon,cell.value,cell.label.toLowerCase()]];
  reward.forEach(gameAddReward);
  state.exp+=5;
  while(state.exp>=100){state.exp-=100;state.level++;state.maxHp+=10;state.hp=state.maxHp}
  return {cell,reward};
}
async function gameRoll10(){
  if(gameMoving || document.querySelector('#gameRewardModal.show') || document.querySelector('#gameBatchModal.show'))return;
  if(state.gameEndsAt && Date.now()>=state.gameEndsAt){gameUpdateStatus();return}
  if(state.gameDice<10){const s=$('#gameStatus');if(s)s.textContent='Нужно минимум 10 кубиков для режима ×10.';return}
  gameEnsureBatchModal();
  state.gameDice-=10;
  gameMoving=true; state.gameMoving=true; gameSkipRequested=false;
  document.querySelector('#game').classList.add('rolling');
  const results=[];
  const jackpotResults=[];
  const skip=$('#skipRollBtn'); if(skip)skip.disabled=false;
  for(let i=0;i<10;i++){
    const roll=1+Math.floor(Math.random()*6);
    const face=['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1];
    const faceEl=$('#diceFace'); if(faceEl)faceEl.textContent=face;
    for(let step=0;step<roll;step++){
      state.gamePos=(state.gamePos+1)%GAME_TRACK_CELLS;
      if(state.gamePos===0)state.gameLap++;
      state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
      save();
      gamePlaceToken(true); gameUpdateStatus();
      if(!gameSkipRequested)await new Promise(r=>setTimeout(r,120));
    }
      const got=gameApplyCellRewardSilent();
    const newJackpots=gameClaimJackpotRounds();
    if(newJackpots.length)jackpotResults.push(...newJackpots);
    const item=got.reward[0];
    results.push({face,icon:item[0],amount:item[1],label:item[2]});
    state.gameRolls++;
    save();
    state.gameTaskProgress=state.gameRolls;
    if(!gameSkipRequested)await new Promise(r=>setTimeout(r,120));
  }
  state.gameTaskProgress=state.gameRolls;
  state.gameSteps=state.gameLap*GAME_TRACK_CELLS+state.gamePos;
  state.gameMilestones=Array.isArray(state.gameMilestones)?state.gameMilestones:[];
  const newlyReached=gameClaimNewMilestones();
  const finalJackpots=gameClaimJackpotRounds();
  if(finalJackpots.length)jackpotResults.push(...finalJackpots);
  gameMoving=false; state.gameMoving=false; document.querySelector('#game').classList.remove('rolling');
  if(skip)skip.disabled=true;
  save(); gameTasksInit(); gameBoardInit(); gameShowBatchResults(results); gameUpdateStatus();
  if(newlyReached.length){
    const bonusItems=newlyReached.flatMap(r=>r.items||[]);
    setTimeout(()=>gameShowReward(bonusItems,`Награда за круг ${newlyReached[newlyReached.length-1].lap}`),900);
  }
  if(jackpotResults.length){
    const jackpotItems=jackpotResults.map(x=>x.reward).filter(Boolean);
    const first=jackpotResults[0], last=jackpotResults[jackpotResults.length-1];
    const title=jackpotResults.length===1
      ? `Награда за круг ${last.round}`
      : `Награды за круги ${first.round}–${last.round}`;
    setTimeout(()=>gameShowReward(jackpotItems,title),newlyReached.length?4500:900);
  }
}
function gameRollUnified(){
  const x10=$('#roll10Btn');
  if(x10&&x10.checked)return gameRoll10();
  return gameRoll();
}
const unifiedRollButton=$('#spinBtn');
if(unifiedRollButton)unifiedRollButton.onclick=gameRollUnified;

/* Territory v79 — restore/finalize reward preview after x10 update */
const JACKPOT_GROUPS_V79=Array.from({length:47},(_,i)=>{
  const from=i*5+1, to=from+4;
  const patterns=[
    [['🧰','1','предмет'],['💜','5','ресурса'],['🧰','10','предметов'],['📜','10','свитков'],['🪙','15000','монет']],
    [['🧰','1','редкий предмет'],['💜','5','ресурса'],['💎','25','кристаллов'],['📜','10','свитков'],['🪙','15000','монет']],
    [['❤️','1','особая награда'],['🧰','1','редкий предмет'],['💎','25','кристаллов'],['🧰','10','предметов'],['🪙','15000','монет']],
    [['🎁','1','подарок'],['🧰','1','предмет'],['💎','25','кристаллов'],['📜','10','свитков'],['🪙','15000','монет']]
  ];
  return {from,to,items:patterns[i%patterns.length]};
});
function gameOpenJackpotPreviewV79(){
  const modal=$('#gameJackpotModal'), list=$('#jackpotList');
  if(!modal||!list)return;
  // v95: focus the next unclaimed jackpot round. If every round up to the
  // current lap is already claimed, keep the current lap centered.
  const claims=Array.isArray(state.gameJackpotClaims)?state.gameJackpotClaims:[];
  const lap=Math.max(1,Math.min(235,state.gameLap||1));
  const nextUnclaimed=JACKPOT_GROUPS_V79.flatMap(g=>g.items.map((_,idx)=>g.from+idx))
    .find(round=>round<=Math.min(235,lap+1)&&!claims.includes(round));
  const current=nextUnclaimed||lap;
  list.innerHTML=JACKPOT_GROUPS_V79.map(g=>{
    const active=current>=g.from&&current<=g.to;
    const cards=g.items.map((r,idx)=>{
      const round=g.from+idx;
      const claimed=Array.isArray(state.gameJackpotClaims)&&state.gameJackpotClaims.includes(round);
      const isCurrent=round===current;
      return `<div class="jackpot-reward ${claimed?'claimed':''} ${isCurrent?'current':''}" data-round="${round}"><span>${claimed?'✓':r[0]}</span><b>${r[1]}</b><small>Осталось: ${claimed?'0':'1'}</small></div>`;
    }).join('');
    return `<section class="jackpot-group ${active?'current-group':''}"><div class="jackpot-group-title">Круги ${g.from}–${g.to}${active?' · СЕЙЧАС':''}</div><div class="jackpot-row">${cards}</div></section>`;
  }).join('');
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>{const el=list.querySelector('.jackpot-reward.current'); if(el)el.scrollIntoView({block:'center',behavior:'auto'});});
}
function gameCloseJackpotPreviewV79(){const modal=$('#gameJackpotModal');if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}}
const rewardPreviewBtnV79=$('#gameRewardPreviewBtn');
if(rewardPreviewBtnV79)rewardPreviewBtnV79.onclick=gameOpenJackpotPreviewV79;
const jackpotCloseV79=$('#jackpotClose');
if(jackpotCloseV79)jackpotCloseV79.onclick=gameCloseJackpotPreviewV79;
const jackpotModalV79=$('#gameJackpotModal');
if(jackpotModalV79)jackpotModalV79.addEventListener('click',e=>{if(e.target===jackpotModalV79)gameCloseJackpotPreviewV79()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')gameCloseJackpotPreviewV79()});
