/* Territory Arena v141 — stable mobile build
   Replaces arena.js. Keeps existing v140 save key for compatibility.
   Includes Alex VIP quest so index.html does NOT need a new script line.
*/
(()=>{'use strict';

const ATTACK_ZONES=[
 ['head','Голова','🎯'],['chest','Грудь','🫀'],['waist','Пояс','🛡️'],['legs','Ноги','🦵']
];
const DEF_ZONES=[
 ['head','Голова','⬆️'],['chest','Грудь','🛡️'],['waist','Пояс','↔️'],['legs','⬇️']
];
const MODES=[
 {id:'duel',title:'1×1 бой',icon:'⚔️',desc:'Один против одного. Автостарт через 3 минуты.'},
 {id:'chaos',title:'Хаотичный бой',icon:'🎲',desc:'Все входят в одну комнату. Команды распределяются случайно.'},
 {id:'group',title:'Групповой бой',icon:'👥',desc:'Выбор команды 1 или 2. До 20 игроков.'}
];
const ARENA_KEY='territory_arena_v140';
const VIP_KEY='territory_vip_v4';
const QUEST_KEY='territory_alex_vip_quest_v4';
const DAY=86400000;

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const read=(key,fallback={})=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(e){return fallback}};
const write=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v))}catch(e){}};
const getState=()=>{try{return state}catch(e){return {name:'SSS',level:1,hp:120,maxHp:120,strength:5,bonusDamage:0,coins:0,exp:0}}};
const saveGame=()=>{try{window.save?.()}catch(e){}};
const toast=t=>{const x=document.getElementById('arenaToast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(window.__arena141Toast);window.__arena141Toast=setTimeout(()=>x.classList.remove('show'),1800)};

let stats=read(ARENA_KEY,{});
stats.wins=Math.max(0,Number(stats.wins||0));
stats.losses=Math.max(0,Number(stats.losses||0));
stats.battles=Math.max(0,Number(stats.battles||0));
stats.history=Array.isArray(stats.history)?stats.history:[];
stats.history=stats.history.slice(-20);

let lobby=null,battle=null,lobbyTimer=null,battleTimer=null;
let logCollapsed=false;

function ensureModal(){
 let m=document.getElementById('arenaModal');
 if(m)return m;
 m=document.createElement('div');
 m.id='arenaModal';
 m.setAttribute('aria-hidden','true');
 m.innerHTML='<div class="arena-sheet"><div class="arena-modal-head"><b id="arenaModalTitle">⚔️ Арена</b><button class="arena-close" type="button" data-arena-close>×</button></div><div class="arena-modal-body" id="arenaModalBody"></div></div>';
 document.body.appendChild(m);
 m.addEventListener('click',e=>{if(e.target===m) closeModal()});
 return m;
}
function modalBody(){return document.getElementById('arenaModalBody')}
function showModal(title,html){
 const m=ensureModal(),t=document.getElementById('arenaModalTitle'),b=modalBody();
 if(t)t.textContent=title;
 if(b)b.innerHTML=html;
 m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function closeModal(){
 if(battle&&!battle.ended){toast('Сначала заверши бой');return}
 clearInterval(lobbyTimer);clearInterval(battleTimer);
 lobby=null;battle=null;logCollapsed=false;
 const m=document.getElementById('arenaModal');
 if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}
}
window.closeArenaModal=closeModal;

function playerName(){return String(getState().name||'SSS').trim()||'SSS'}
function playerLevel(){return Math.max(1,Number(getState().level||1))}
function zoneName(id,list){const z=list.find(x=>x[0]===id);return z?z[1]:id}

function renderHome(){
 clearInterval(lobbyTimer);clearInterval(battleTimer);lobby=null;battle=null;logCollapsed=false;
 const rows=stats.history.slice(-5).reverse().map(h=>`<div class="arena140-history-row"><span>${h.win?'🏆':'💀'}</span><span>${esc(h.mode||'Бой')}</span><span>${esc(h.result||'завершён')}</span></div>`).join('')||'<div class="arena140-empty">Пока нет завершённых боёв.</div>';
 showModal('⚔️ Арена',`<div class="arena140">
  <section class="arena140-hero"><div><div class="arena140-kicker">SDOLARS · ARENA</div><h2>Бой начинается здесь</h2><p>Тактические ходы, 4 зоны атаки и 4 зоны защиты.</p></div><div class="arena140-stat"><b>${stats.wins}</b><span>побед</span></div></section>
  <section class="arena140-modes">${MODES.map(m=>`<button type="button" class="arena140-mode" data-mode="${m.id}"><span class="mode-icon">${m.icon}</span><span><b>${m.title}</b><small>${m.desc}</small></span><strong>›</strong></button>`).join('')}</section>
  <section class="arena140-rules"><b>Правила Arena</b><div><span>⏱️ 3:00</span><span>👥 до 20</span><span>🎯 4 атаки</span><span>🛡️ 4 защиты</span></div><p>Вышедший игрок не возвращается в этот бой.</p></section>
  <section class="arena140-history"><div class="arena140-section-head"><b>Последние бои</b><span>${stats.battles}</span></div>${rows}</section>
 </div>`);
 modalBody().querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>createLobby(b.dataset.mode));
}

function createLobby(mode){
 const valid=MODES.some(m=>m.id===mode)?mode:'duel';
 const team=valid==='group'?1:null;
 lobby={id:'A'+Date.now().toString(36),mode:valid,createdAt:Date.now(),endsAt:Date.now()+180000,players:[{name:playerName(),level:playerLevel(),team,owner:true}],left:false,started:false};
 renderLobby();
}
function addTestPlayer(){
 if(!lobby||lobby.started)return;
 const max=lobby.mode==='duel'?2:20;
 if(lobby.players.length>=max){toast('Комната заполнена');return}
 const bots=['Варг','Рагнар','Стальной Волк','Тёмный рыцарь','Наёмник','Берсерк','Охотник','Гвардеец'];
 const i=lobby.players.length-1;
 const team=lobby.mode==='group'?(i%2)+1:null;
 lobby.players.push({name:`${bots[i%bots.length]} ${i+2}`,level:Math.max(1,playerLevel()+Math.floor(Math.random()*3)-1),team,bot:true});
 renderLobby();
}
function chooseTeam(n){
 if(!lobby||lobby.mode!=='group'||lobby.started)return;
 lobby.players[0].team=n;
 renderLobby();
}
function startLobbyNow(){
 if(!lobby||lobby.started)return;
 if(lobby.players.length<2){toast('Нужно минимум 2 игрока');return}
 startBattle();
}
function renderLobby(){
 clearInterval(lobbyTimer);if(!lobby)return;
 const m=MODES.find(x=>x.id===lobby.mode)||MODES[0];
 const remain=Math.max(0,lobby.endsAt-Date.now());
 const mm=String(Math.floor(remain/60000)).padStart(2,'0'),ss=String(Math.floor(remain/1000)%60).padStart(2,'0');
 const max=lobby.mode==='duel'?2:20;
 const players=lobby.players.map(p=>`<div class="arena140-player"><span class="avatar">${p.bot?'⚔️':'🧔'}</span><span><b>${esc(p.name)}</b><small>ур. ${p.level}${p.owner?' · создатель':''}</small></span>${lobby.mode==='group'?`<em class="team team-${p.team}">Команда ${p.team}</em>`:''}</div>`).join('');
 showModal(`${m.icon} ${m.title}`,`<div class="arena140">
  <section class="arena140-lobby-head"><div><span class="arena140-kicker">КОМНАТА БОЯ</span><h2>Ожидание игроков</h2><p>${esc(m.desc)}</p></div><div class="arena140-countdown"><small>Автостарт</small><b id="arenaLobbyTimer">${mm}:${ss}</b></div></section>
  <section class="arena140-lobby-card"><div class="arena140-section-head"><b>Игроки</b><span>${lobby.players.length}/${max}</span></div><div class="arena140-players">${players}</div></section>
  ${lobby.mode==='group'?`<section class="arena140-team-choice"><b>Твоя команда</b><div><button type="button" data-team="1" class="${lobby.players[0].team===1?'selected':''}">⚔️ Команда 1</button><button type="button" data-team="2" class="${lobby.players[0].team===2?'selected':''}">🛡️ Команда 2</button></div></section>`:''}
  <section class="arena140-actions"><button type="button" class="arena140-secondary" data-add>＋ Добавить игрока для теста</button><button type="button" class="arena140-primary" data-start ${lobby.players.length>1?'':'disabled'}>⚔️ Начать сейчас</button><button type="button" class="arena140-leave" data-leave>Выйти из комнаты</button></section>
  <p class="arena140-note">Создатель запускает таймер 3:00. После окончания бой стартует автоматически.</p>
 </div>`);
 modalBody().querySelector('[data-add]')?.addEventListener('click',addTestPlayer);
 modalBody().querySelector('[data-start]')?.addEventListener('click',startLobbyNow);
 modalBody().querySelector('[data-leave]')?.addEventListener('click',()=>{lobby.left=true;lobby=null;toast('Ты вышел. Повторный вход запрещён.');setTimeout(renderHome,450)});
 modalBody().querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>chooseTeam(Number(b.dataset.team))));
 const tick=()=>{
   if(!lobby)return;
   const left=Math.max(0,lobby.endsAt-Date.now());
   const el=document.getElementById('arenaLobbyTimer');
   if(el)el.textContent=`${String(Math.floor(left/60000)).padStart(2,'0')}:${String(Math.floor(left/1000)%60).padStart(2,'0')}`;
   if(left<=0){clearInterval(lobbyTimer);startBattle()}
 };
 tick();lobbyTimer=setInterval(tick,1000);
}

function randomizeChaosTeams(){
 if(!lobby)return;
 const shuffled=[...lobby.players].sort(()=>Math.random()-.5);
 shuffled.forEach((p,i)=>p.team=(i%2)+1);
 lobby.players=shuffled;
}
function startBattle(){
 if(!lobby||lobby.started)return;
 if(lobby.players.length<2){toast('Нужно минимум 2 игрока');return}
 if(lobby.mode==='chaos')randomizeChaosTeams();
 lobby.started=true;clearInterval(lobbyTimer);
 const s=getState();
 battle={
  id:lobby.id,mode:lobby.mode,round:1,
  playerHp:Math.max(1,Number(s.hp||120)),maxHp:Math.max(1,Number(s.maxHp||120)),
  enemyHp:120,maxEnemyHp:120,attack:null,defense:[],
  log:[`⚔️ ${MODES.find(m=>m.id===lobby.mode)?.title||'Бой'}: бой начался.`,`👥 В комнате ${lobby.players.length} игроков.`],
  startedAt:Date.now(),endsAt:Date.now()+600000,ended:false
 };
 renderBattle();
}

function renderBattle(){
 clearInterval(battleTimer);if(!battle)return;
 const hp1=Math.max(0,Math.round(battle.playerHp/battle.maxHp*100));
 const hp2=Math.max(0,Math.round(battle.enemyHp/battle.maxEnemyHp*100));
 const remain=Math.max(0,battle.endsAt-Date.now());
 const mm=String(Math.floor(remain/60000)).padStart(2,'0'),ss=String(Math.floor(remain/1000)%60).padStart(2,'0');
 const attacks=ATTACK_ZONES.map(z=>`<button type="button" class="arena140-zone ${battle.attack===z[0]?'selected':''}" data-a="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
 const defs=DEF_ZONES.map(z=>`<button type="button" class="arena140-zone ${battle.defense.includes(z[0])?'selected defense':''}" data-d="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
 const logs=battle.log.slice(-10).map(x=>`<div>${esc(x)}</div>`).join('');
 showModal('⚔️ Arena · бой',`<div class="arena140 arena140-combat">
  <section class="arena140-fighters"><div class="arena140-fighter"><div class="big-avatar">🧔</div><b>${esc(playerName())}</b><small>ур. ${playerLevel()}</small><div class="arena140-hp"><i style="width:${hp1}%"></i></div><span>${Math.round(battle.playerHp)} / ${battle.maxHp} HP</span></div><div class="arena140-vs">VS</div><div class="arena140-fighter enemy"><div class="big-avatar">⚔️</div><b>${battle.mode==='group'?'Команда противника':'Противник'}</b><small>отряд</small><div class="arena140-hp"><i style="width:${hp2}%"></i></div><span>${Math.round(battle.enemyHp)} / ${battle.maxEnemyHp} HP</span></div></section>
  <section class="arena140-combat-top"><span>Раунд <b>${battle.round}</b></span><span>⏱️ <b id="arenaBattleTimer">${mm}:${ss}</b></span><span>👥 ${lobby?.players.length||2}</span></section>
  <section class="arena140-select"><div class="arena140-step"><b>1. Атака</b><small>Выбери одну из 4 зон</small></div><div class="arena140-zones">${attacks}</div><div class="arena140-step"><b>2. Защита</b><small>Выбери ровно две из 4 зон</small></div><div class="arena140-zones">${defs}</div><button type="button" class="arena140-hit" data-hit ${battle.attack&&battle.defense.length===2?'':'disabled'}>⚔️ ПОДТВЕРДИТЬ ХОД</button></section>
  <section class="arena140-log"><div class="arena140-log-head"><b>Боевой журнал</b><button type="button" data-collapse>${logCollapsed?'Развернуть':'Свернуть'}</button></div><div class="arena140-log-body ${logCollapsed?'collapsed':''}">${logs}</div></section>
  <section class="arena140-finish"><button type="button" data-finish>Завершить бой</button><button type="button" data-extend>Продлить +5 мин</button></section>
 </div>`);
 modalBody().querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{battle.attack=b.dataset.a;renderBattle()}));
 modalBody().querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>{
   const z=b.dataset.d;
   if(battle.defense.includes(z))battle.defense=battle.defense.filter(x=>x!==z);
   else if(battle.defense.length<2)battle.defense.push(z);
   else{toast('Можно закрыть только 2 зоны');return}
   renderBattle();
 }));
 modalBody().querySelector('[data-hit]')?.addEventListener('click',resolveTurn);
 modalBody().querySelector('[data-finish]')?.addEventListener('click',()=>finishBattle('Завершено игроком'));
 modalBody().querySelector('[data-extend]')?.addEventListener('click',()=>{battle.endsAt+=300000;toast('Бой продлён на 5 минут');renderBattle()});
 modalBody().querySelector('[data-collapse]')?.addEventListener('click',()=>{logCollapsed=!logCollapsed;renderBattle()});
 const tick=()=>{
   if(!battle)return;
   const left=Math.max(0,battle.endsAt-Date.now());
   const el=document.getElementById('arenaBattleTimer');
   if(el)el.textContent=`${String(Math.floor(left/60000)).padStart(2,'0')}:${String(Math.floor(left/1000)%60).padStart(2,'0')}`;
   if(left<=0)finishBattle('Время боя истекло');
 };
 tick();battleTimer=setInterval(tick,1000);
}

function resolveTurn(){
 if(!battle||!battle.attack||battle.defense.length!==2)return;
 const s=getState();
 const attackPower=Number(s.bonusDamage||0)+Math.max(1,Number(s.strength||5))+10;
 const hit=Math.max(8,Math.round(attackPower*(0.9+Math.random()*.35)));
 const enemyAttack=ATTACK_ZONES[Math.floor(Math.random()*ATTACK_ZONES.length)][0];
 battle.enemyHp=Math.max(0,battle.enemyHp-hit);
 battle.log.push(`⚔️ Атака в «${zoneName(battle.attack,ATTACK_ZONES)}» нанесла −${hit} HP.`);
 try{window.territorySystems?.onBattleTurn?.()}catch(e){}
 if(battle.enemyHp<=0){renderBattle();setTimeout(()=>finishBattle('Победа'),220);return}
 if(battle.defense.includes(enemyAttack)){
   battle.log.push(`🛡️ Защита закрыла «${zoneName(enemyAttack,DEF_ZONES)}». Урон остановлен.`);
 }else{
   const dmg=Math.max(5,Math.round(10+Math.random()*12));
   battle.playerHp=Math.max(0,battle.playerHp-dmg);
   battle.log.push(`💥 Противник атаковал «${zoneName(enemyAttack,ATTACK_ZONES)}»: −${dmg} HP.`);
 }
 battle.round++;battle.attack=null;battle.defense=[];
 if(battle.playerHp<=0){renderBattle();setTimeout(()=>finishBattle('Поражение'),220);return}
 renderBattle();
}

function finishBattle(result){
 if(!battle||battle.ended)return;
 battle.ended=true;clearInterval(battleTimer);
 const win=result==='Победа', loss=result==='Поражение';
 stats.battles++;
 if(win)stats.wins++;else if(loss)stats.losses++;
 stats.history.push({mode:MODES.find(m=>m.id===battle.mode)?.title||'Бой',win,result,at:Date.now()});
 stats.history=stats.history.slice(-20);
 write(ARENA_KEY,stats);
 try{window.territorySystems?.onBattleFinished?.(result)}catch(e){}
 if(win){
   const s=getState();
   s.coins=Number(s.coins||0)+50;
   s.exp=Number(s.exp||0)+15;
   saveGame();
 }else saveGame();
 const resultCopy=result;
 lobby=null;battle=null;
 renderResult(resultCopy);
}
function renderResult(result){
 const win=result==='Победа';
 showModal(win?'🏆 Победа':'⚔️ Бой завершён',`<div class="arena140 arena140-result"><div class="result-icon">${win?'🏆':'⚔️'}</div><h2>${esc(result)}</h2><p>Бой завершён. Результат сохранён в истории Arena.</p>${win?'<div class="arena140-reward">+50 🪙 &nbsp; +15 XP</div>':''}<button type="button" class="arena140-primary" data-back>Вернуться в Arena</button></div>`);
 modalBody().querySelector('[data-back]').onclick=renderHome;
}

/* ---------- Alex VIP quest: intentionally lives in arena.js.
   This means the quest works even when index.html has not loaded vip.js. ---------- */
const vip=Object.assign({until:0,history:[]},read(VIP_KEY,{}));
const quest=Object.assign({startWins:0,accepted:false,completed:false,rewardClaimed:false},read(QUEST_KEY,{}));
function vipActive(){return Number(vip.until)>Date.now()}
function vipDays(){return vipActive()?Math.max(1,Math.ceil((vip.until-Date.now())/DAY)):0}
function questProgress(){return Math.min(5,Math.max(0,stats.wins-Number(quest.startWins||0)))}
function ensureVipCss(){
 if(document.getElementById('territoryVipAlexCSS'))return;
 const s=document.createElement('style');s.id='territoryVipAlexCSS';
 s.textContent=`.territory-vip-modal{position:fixed;inset:0;z-index:100000;padding:16px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.76);box-sizing:border-box}.territory-vip-dialog{width:min(100%,390px);max-height:88vh;overflow:auto;padding:18px;box-sizing:border-box;border-radius:18px;border:1px solid rgba(255,215,90,.55);background:linear-gradient(180deg,#171b24,#0b0f15);color:#fff;box-shadow:0 15px 45px rgba(0,0,0,.6);position:relative}.territory-vip-close{position:absolute;right:7px;top:5px;width:40px;height:40px;border:0;background:transparent;color:#fff;font-size:28px}.territory-vip-title{font-size:22px;font-weight:800;padding-right:35px}.territory-vip-sub{opacity:.72;margin-top:2px}.territory-vip-box{margin:16px 0;padding:14px;border-radius:13px;background:rgba(255,255,255,.055)}.territory-vip-box p{line-height:1.4;margin:9px 0 12px}.territory-vip-progress{height:10px;margin:10px 0 7px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}.territory-vip-progress i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#b88720,#ffe27a)}.territory-vip-reward{margin-top:12px;padding:12px;border-radius:12px;border:1px solid rgba(255,215,90,.28)}.territory-vip-list{margin:9px 0 0;padding-left:18px;line-height:1.55;font-size:13px}.territory-vip-claim{width:100%;min-height:48px;margin-top:14px;border:0;border-radius:12px;font-weight:800;cursor:pointer}.territory-vip-claim:disabled{opacity:.55;cursor:default}`;
 document.head.appendChild(s);
}
function findAlex(){return document.querySelector('.guard-label[aria-label*="Alex"]')||document.querySelector('[aria-label*="Alex"][aria-label*="Лорд-командующий"]')}
function openAlexQuest(){
 if(document.getElementById('territoryVipModal'))return;
 if(!quest.accepted&&!quest.rewardClaimed){quest.accepted=true;quest.startWins=stats.wins;write(QUEST_KEY,quest)}
 const p=questProgress(),done=p>=5||quest.completed;
 const m=document.createElement('div');m.id='territoryVipModal';m.className='territory-vip-modal';
 m.innerHTML=`<div class="territory-vip-dialog" role="dialog" aria-modal="true"><button class="territory-vip-close" type="button">×</button><div class="territory-vip-title">👑 Задание Алекса</div><div class="territory-vip-sub">Лорд-командующий</div><div class="territory-vip-box"><b>🎯 Задание</b><p>Докажи свою силу на Арене: одержи <b>5 побед</b>.</p><div class="territory-vip-progress"><i style="width:${p/5*100}%"></i></div><div><b>${p}</b> / 5 побед</div></div><div class="territory-vip-reward"><b>🎁 Награда</b><div style="margin-top:6px;font-size:18px">👑 VIP на 10 дней</div><ul class="territory-vip-list"><li>VIP-статус</li><li>VIP-метка профиля</li><li>будущие VIP-привилегии</li></ul></div><button id="territoryVipClaim" class="territory-vip-claim" type="button" ${done&&!quest.rewardClaimed?'':'disabled'}>${quest.rewardClaimed?'✅ VIP ПОЛУЧЕН':done?'🎁 ПОЛУЧИТЬ VIP':'⚔️ СНАЧАЛА ОДЕРЖИ 5 ПОБЕД'}</button></div>`;
 document.body.appendChild(m);
 m.querySelector('.territory-vip-close').onclick=()=>m.remove();
 m.addEventListener('click',e=>{if(e.target===m)m.remove()});
 if(done&&!quest.rewardClaimed)m.querySelector('#territoryVipClaim').onclick=()=>{
   const base=vipActive()?Number(vip.until):Date.now();
   vip.until=base+10*DAY;vip.history.unshift({at:Date.now(),text:'VIP получен за задание Алекса'});vip.history=vip.history.slice(0,20);
   quest.completed=true;quest.rewardClaimed=true;write(VIP_KEY,vip);write(QUEST_KEY,quest);m.remove();toast('👑 Алекс наградил тебя VIP на 10 дней!');
 };
}
function hookAlex(){
 ensureVipCss();
 const alex=findAlex();
 if(!alex||alex.dataset.arena141Alex==='1')return;
 alex.dataset.arena141Alex='1';
 alex.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openAlexQuest()},true);
}
function refreshAlex(){
 hookAlex();
 if(quest.accepted&&!quest.rewardClaimed&&questProgress()>=5){quest.completed=true;write(QUEST_KEY,quest)}
}
window.territoryVIP={active:vipActive,daysLeft:vipDays,render:refreshAlex};
window.territoryAlexVIPQuest={open:openAlexQuest,progress:questProgress,target:5,completed:()=>quest.completed,rewardClaimed:()=>quest.rewardClaimed};

window.openBattle=renderHome;
window.openArena=renderHome;
document.addEventListener('click',e=>{if(e.target.closest('[data-arena-close]'))closeModal()});
setTimeout(refreshAlex,300);
setInterval(refreshAlex,2000);
ensureModal();

})();