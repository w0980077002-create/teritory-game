
window.arenaToast=function(text){
 const t=document.getElementById('arenaToast'); if(!t)return; t.textContent=text; t.classList.add('show'); clearTimeout(window._arenaToastTimer); window._arenaToastTimer=setTimeout(()=>t.classList.remove('show'),1500);
};
window.closeArenaModal=function(){clearTimeout(window.s98AutoTimer);const m=document.getElementById('arenaModal');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');}};

(()=>{
 const Z=[['head','Голова'],['chest','Грудь'],['stomach','Живот'],['waist','Пояс'],['legs','Ноги']];
 state.energy=Math.max(0,Math.min(200,Number(state.energy??100)||0)); state.strength=Math.max(1,Number(state.strength??5)||5); state.agility=Math.max(1,Number(state.agility??5)||5); state.defense=Math.max(0,Number(state.defense??0)||0);
 const enemies=[
  {name:'Уличный боец',ico:'🥊',hp:105,damage:13,armor:1,crit:.07,tier:1,reward:45,xp:12},
  {name:'Наёмник Sdolars',ico:'🗡️',hp:135,damage:16,armor:3,crit:.10,tier:2,reward:65,xp:17},
  {name:'Гвардеец замка',ico:'🛡️',hp:165,damage:19,armor:5,crit:.13,tier:3,reward:90,xp:23},
  {name:'Капитан стражи',ico:'⚔️',hp:205,damage:23,armor:7,crit:.16,tier:4,reward:125,xp:30},
  {name:'Чемпион Sdolars',ico:'👹',hp:250,damage:28,armor:9,crit:.19,tier:5,reward:170,xp:40}
 ];
 const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]));
 const dmg=()=>Math.max(5,Number(state?.bonusDamage||0)+Number(state?.strength||5));
 const def=()=>Math.max(0,Number(state?.defense||0));
 const maxEnergy=()=>Math.min(250,200+Math.max(0,Number(state?.level||1)-1)*5);
 const hpMax=()=>Math.max(100,Number(state?.maxHp||100));
 const pct=(v,m)=>Math.max(0,Math.min(100,(Number(v)||0)/(Number(m)||1)*100));
 const arenaStats=()=>{try{return JSON.parse(localStorage.getItem('territory_s98_arena')||'{}')}catch(e){return {}}};
 const saveArena=x=>localStorage.setItem('territory_s98_arena',JSON.stringify(x));
 let stats=arenaStats();stats.wins=Number(stats.wins||0);stats.losses=Number(stats.losses||0);stats.streak=Number(stats.streak||0);stats.best=Number(stats.best||0);stats.history=Array.isArray(stats.history)?stats.history:[];saveArena(stats);
 function modal(title,html){const t=document.getElementById('arenaModalTitle'),b=document.getElementById('arenaModalBody');if(!t||!b)return; t.textContent=title;b.innerHTML=html;document.getElementById('arenaModal')?.classList.add('show')}
 function currentPlayerName(){return state?.name||'SSS'}
 function chooseEnemy(){const lv=Number(state?.level||1),idx=Math.min(enemies.length-1,Math.max(0,Math.floor((lv-1)/2)+Math.min(2,stats.wins)));return {...enemies[idx],maxHp:enemies[idx].hp}}
 function arenaHome(){
  const energy=Number(state?.energy||0), cards=enemies.map((e,i)=>{const locked=i>Math.min(enemies.length-1,Math.floor((Number(state?.level||1)-1)/2)+2);return `<div class="s98Opp"><div class="ico">${e.ico}</div><div><b>${esc(e.name)}</b><small>⚔️ ${e.damage} урон · 🛡️ ${e.armor} броня</small><div class="s98Diff">${locked?'🔒 Требуется более высокий уровень':'🏆 Награда '+e.reward+' 🟡 · '+e.xp+' XP'}</div></div><button class="s98Fight" ${locked||energy<10?'disabled':''} data-s98-start="${i}">${energy<10?'⚡10':'В бой'}</button></div>`}).join('');
  const hist=stats.history.slice(-5).reverse().map(x=>`<div>${x.win?'🏆':'💀'} ${esc(x.enemy)} · ${x.win?'+':''}${x.reward||0} 🟡 · ${x.round||1} раунд.</div>`).join('')||'<div>Пока нет завершённых боёв.</div>';
  modal('⚔️ Арена',`<div class="s98"><div class="s98Hero"><b>⚔️ Арена Sdolars</b><small>Выбери соперника и проведи полноценный тактический бой.</small></div><div class="s98Grid"><div class="s98Stat">🏆 Победы<b>${stats.wins}</b></div><div class="s98Stat">🔥 Серия<b>${stats.streak}</b></div><div class="s98Stat">⭐ Лучшая<b>${stats.best}</b></div></div><div class="s98Panel"><div class="s98PanelTitle">🎯 Выбери противника</div><div class="s98Opps">${cards}</div></div><div class="s98Panel"><div class="s98PanelTitle">📜 Последние бои</div><div class="s98Log">${hist}</div></div></div>`);
  document.querySelectorAll('[data-s98-start]').forEach(b=>b.onclick=()=>startFight(Number(b.dataset.s98Start)));
 }
 function startFight(i){
  if(Number(state.energy||0)<10){arenaToast('⚡ Нужно 10 энергии');return}
  const src=enemies[Math.max(0,Math.min(enemies.length-1,i))];
  battle={enemy:{...src,maxHp:src.hp,hp:src.hp},turn:'player',round:1,attack:null,defense:[],enemyAttack:null,enemyDefense:[],log:['⚔️ Бой начался. Выбери атаку и две защиты.'],playerHp:Number(state.hp||hpMax()),playerMax:hpMax(),energySpent:0,auto:false,locked:false,anim:'',result:null};
  render();
 }
 function enemyPlan(){const a=[...Z].sort(()=>Math.random()-.5);battle.enemyAttack=a[0][0];battle.enemyDefense=a.slice(1,3).map(x=>x[0])}
 function zoneLabel(id){return Z.find(x=>x[0]===id)?.[1]||id}
 function addLog(s){battle.log.push(s);if(battle.log.length>12)battle.log.shift()}
 function combatMath(){return {attack:Math.max(5,dmg()),armor:def(),crit:Math.min(.35,.08+Number(state.strength||5)/180),dodge:Math.min(.30,.04+Number(state.agility||5)/160)}}
 function render(){
  if(!battle)return;
  const e=battle.enemy,m=combatMath(),can=battle.turn==='player'&&!battle.locked&&!battle.result&&!battle.auto;
  const logs=battle.log.map(x=>`<div>• ${esc(x)}</div>`).join('');
  const stage=`<div class="s98Stage"><div class="s98VS">⚔️</div><div class="s98Fx ${battle.anim?'show':''}">${battle.anim==='playerAttack'?'💥':battle.anim==='enemyAttack'?'⚡':''}</div><div class="s98F p ${battle.anim==='playerAttack'?'attack':''} ${battle.anim==='playerHit'?'hit':''}"><div class="s98Avatar">🧔</div><div class="s98FName">${esc(currentPlayerName())}</div></div><div class="s98F e ${battle.anim==='enemyAttack'?'attack':''} ${battle.anim==='enemyHit'?'hit':''}"><div class="s98Avatar">${esc(e.ico)}</div><div class="s98FName">${esc(e.name)}</div></div></div>`;
  const attackBtns=Z.map(z=>`<button class="s98Zone ${battle.attack===z[0]?'attackSel':''}" data-s98-a="${z[0]}" ${can?'':'disabled'}>${z[1]}</button>`).join('');
  const defBtns=Z.map(z=>`<button class="s98Zone ${battle.defense.includes(z[0])?'defSel':''}" data-s98-d="${z[0]}" ${can?'':'disabled'}>${z[1]}</button>`).join('');
  document.getElementById('arenaModalTitle').textContent='⚔️ Арена · тактический бой';
  document.getElementById('arenaModalBody').innerHTML=`<div class="s98">${stage}<div class="s98HpRow"><div class="s98HpCard"><b>🧔 ${esc(currentPlayerName())} · ур. ${state.level||1}</b><div class="s98Hp"><i style="width:${pct(battle.playerHp,battle.playerMax)}%"></i></div><div class="s98HpText">${Math.ceil(battle.playerHp)} / ${battle.playerMax} HP</div></div><div class="s98HpCard"><b>${esc(e.ico)} ${esc(e.name)}</b><div class="s98Hp enemy"><i style="width:${pct(e.hp,e.maxHp)}%"></i></div><div class="s98HpText">${Math.ceil(e.hp)} / ${e.maxHp} HP</div></div></div><div class="s98CombatStats"><div class="s98CStat">⚔️ Атака<b>${m.attack}</b></div><div class="s98CStat">🛡️ Броня<b>${m.armor}</b></div><div class="s98CStat">⚡ Энергия<b>${state.energy||0}</b></div><div class="s98CStat">🔥 Серия<b>${stats.streak}</b></div></div><div class="s98Turn">Раунд <strong>${battle.round}</strong> · ${battle.turn==='player'?'<strong>Твой ход</strong>':'Ход противника'} · защита <strong>${battle.defense.length}/2</strong></div><div class="s98Step">🎯 1. Выбери зону атаки</div><div class="s98Zones">${attackBtns}</div><div class="s98Step">🛡️ 2. Выбери две зоны защиты</div><div class="s98Zones">${defBtns}</div><div class="s98Actions"><button class="s98Act" data-s98-skill="power" ${can&&Number(state.energy||0)>=20?'':'disabled'}>💥 Сильный ·20</button><button class="s98Act" data-s98-skill="precise" ${can&&Number(state.energy||0)>=15?'':'disabled'}>🎯 Точный ·15</button><button class="s98Act" data-s98-skill="stance" ${can&&Number(state.energy||0)>=15?'':'disabled'}>🛡️ Стойка ·15</button><button class="s98Act main" data-s98-hit ${battle.attack&&battle.defense.length===2&&can?'':'disabled'}>⚔️ НАНЕСТИ УДАР ·10 ⚡</button></div><label class="s98Auto"><input type="checkbox" data-s98-auto ${battle.auto?'checked':''}> Автобой</label><div class="s98Log">${logs}</div><div class="s98Hint">Голова: выше шанс крита · Грудь: стабильный урон · Ноги: ниже шанс уклонения.</div></div>`;
  const body=document.getElementById('arenaModalBody');
  body.querySelectorAll('[data-s98-a]').forEach(b=>b.onclick=()=>{if(!can)return;battle.attack=b.dataset.s98A;render()});
  body.querySelectorAll('[data-s98-d]').forEach(b=>b.onclick=()=>{if(!can)return;const z=b.dataset.s98D;if(battle.defense.includes(z))battle.defense=battle.defense.filter(x=>x!==z);else if(battle.defense.length<2)battle.defense.push(z);render()});
  body.querySelector('[data-s98-hit]')?.addEventListener('click',()=>doPlayerAttack('normal'));
  body.querySelectorAll('[data-s98-skill]').forEach(b=>b.addEventListener('click',()=>doPlayerAttack(b.dataset.s98Skill)));
  body.querySelector('[data-s98-auto]')?.addEventListener('change',e=>{battle.auto=!!e.target.checked;if(battle.auto){autoTurn()}else clearTimeout(window.s98AutoTimer);render()});
 }
 function autoTurn(){clearTimeout(window.s98AutoTimer);if(!battle||!battle.auto||battle.turn!=='player'||battle.locked||battle.result)return;window.s98AutoTimer=setTimeout(()=>{if(!battle||!battle.auto||battle.turn!=='player'||battle.locked)return;const a=[...Z].sort(()=>Math.random()-.5);battle.attack=a[0][0];battle.defense=a.slice(1,3).map(x=>x[0]);doPlayerAttack('normal')},450)}
 function doPlayerAttack(skill){
  if(!battle||battle.turn!=='player'||battle.locked||battle.result||!battle.attack||battle.defense.length!==2)return;
  const costs={normal:10,power:20,precise:15,stance:15},cost=costs[skill]||10;if(Number(state.energy||0)<cost){arenaToast('⚡ Недостаточно энергии');return}
  battle.locked=true;state.energy=Math.max(0,Number(state.energy||0)-cost);battle.energySpent+=cost;enemyPlan();battle.anim='playerAttack';
  const e=battle.enemy,m=combatMath(),z=battle.attack;let message='',damage=0;
  if(skill==='stance'){battle.playerGuard=0.55;message='🛡️ Воин встал в стойку: следующий удар ослаблен.'}
  else{let miss=skill==='precise'?false:Math.random()<Math.max(.02,.11-m.dodge/3);if(miss)message=`💨 Атака в «${zoneLabel(z)}» — промах.`;else if(battle.enemyDefense.includes(z))message=`🛡️ Противник заблокировал «${zoneLabel(z)}». Урон: 0.`;else{const zoneBonus=z==='head'?1.15:z==='chest'?1.05:z==='legs'?.95:1;const skillBonus=skill==='power'?1.45:skill==='precise'?1.12:1;const crit=Math.random()<(skill==='precise'?Math.min(.45,m.crit+.12):m.crit)*(z==='head'?1.3:1);const base=Math.max(5,Math.round((m.attack+10+Math.random()*10)*zoneBonus*skillBonus));damage=Math.max(3,Math.round(base-Number(e.armor||0)));if(crit)damage+=Math.round(damage*.55);e.hp=Math.max(0,e.hp-damage);message=`⚔️ ${skill==='power'?'Сильный ':skill==='precise'?'Точный ':''}удар в «${zoneLabel(z)}»: −${damage} HP${crit?' · 💥 КРИТ!':''}`}}
  addLog(message);battle.anim='playerAttack';render();
  if(e.hp<=0){setTimeout(()=>finish(true),380);return}
  battle.turn='enemy';setTimeout(enemyTurn,650)
 }
 function enemyTurn(){
  if(!battle||battle.result)return;const e=battle.enemy,target=e.enemyAttack||Z[Math.floor(Math.random()*Z.length)][0],blocked=battle.defense.includes(target);battle.anim='enemyAttack';let msg='',damage=0;
  if(blocked)msg=`🛡️ Блок! Атака «${zoneLabel(target)}» остановлена.`;else{const m=combatMath(),dodge=Math.random()<m.dodge;if(dodge)msg=`💨 Воин увернулся от атаки в «${zoneLabel(target)}».`;else{let base=Number(e.damage||12)+Math.floor(Math.random()*7);const crit=Math.random()<Number(e.crit||.1);damage=Math.max(1,Math.round(base+(crit?base*.5:0)-m.armor));if(battle.playerGuard){damage=Math.round(damage*battle.playerGuard);battle.playerGuard=0}battle.playerHp=Math.max(0,battle.playerHp-damage);state.hp=battle.playerHp;msg=`☠️ ${e.name} атаковал «${zoneLabel(target)}»: −${damage} HP${crit?' · 💥 КРИТ!':''}`}}
  addLog(msg);render();if(battle.playerHp<=0){setTimeout(()=>finish(false),380);return}
  battle.round++;battle.attack=null;battle.defense=[];battle.enemyAttack=null;battle.enemyDefense=[];battle.anim='';battle.locked=false;battle.turn='player';try{save()}catch(e){}render();if(battle.auto)autoTurn()
 }
 function finish(win){
  clearTimeout(window.s98AutoTimer);battle.result=win?'win':'loss';battle.locked=true;const e=battle.enemy;
  if(win){const reward=Number(e.reward||50)+Math.max(0,stats.streak)*5,xp=Number(e.xp||12);state.hp=hpMax();state.coins=Number(state.coins||0)+reward;state.exp=Number(state.exp||0)+xp;stats.wins++;stats.streak++;stats.best=Math.max(stats.best,stats.streak);let levels=0;let need=Number(state.level||1)*100;while(state.exp>=need){state.exp-=need;state.level++;levels++;need=Number(state.level)*100}stats.history.push({win:true,enemy:e.name,reward,xp,round:battle.round});
   if(stats.history.length>20)stats.history.shift();saveArena(stats);try{save()}catch(x){};arenaToast('🏆 Победа! +'+reward+' 🟡');
   document.getElementById('arenaModalBody').innerHTML=`<div class="s98"><div class="s98End"><div class="big">🏆</div><b>Победа!</b><p>${esc(e.name)} повержен за ${battle.round} раунд(ов).</p><p>+${reward} 🟡 · +${xp} XP${levels?' · ⬆️ Уровень '+state.level:''}</p><button class="main" data-s98-again>⚔️ Следующий бой</button><button data-s98-home>🏟️ В арену</button></div></div>`;
  }else{state.hp=1;state.energy=Math.max(0,Number(state.energy||0)-10);stats.losses++;stats.streak=0;stats.history.push({win:false,enemy:e.name,reward:0,xp:0,round:battle.round});if(stats.history.length>20)stats.history.shift();saveArena(stats);try{save()}catch(x){};document.getElementById('arenaModalBody').innerHTML=`<div class="s98"><div class="s98End"><div class="big">💀</div><b>Поражение</b><p>${esc(e.name)} оказался сильнее.</p><p>Серия сброшена. HP осталось: 1.</p><button class="main" data-s98-recover>❤️ Восстановить HP</button><button data-s98-home>🏟️ В арену</button></div></div>`}
  document.querySelector('[data-s98-again]')?.addEventListener('click',()=>startFight(Math.min(enemies.length-1,Math.floor((Number(state.level||1)-1)/2)+Math.min(2,stats.wins))));
  document.querySelector('[data-s98-home]')?.addEventListener('click',arenaHome);
  document.querySelector('[data-s98-recover]')?.addEventListener('click',()=>{state.hp=hpMax();save();arenaToast('❤️ HP восстановлено');arenaHome()});
 }
 window.openBattle=function(){arenaHome()};
 window.renderBattle=render;
 window.playerStrike=()=>doPlayerAttack('normal');
 window.enemyStrike=enemyTurn;
 window.toggleAuto=on=>{if(!battle)return;battle.auto=!!on;render();if(battle.auto)autoTurn()};
 window.scheduleAutoTurn=autoTurn;
 window.nextBattle=()=>{const idx=Math.min(enemies.length-1,Math.floor((Number(state.level||1)-1)/2)+Math.min(2,stats.wins));startFight(idx)};
})();

document.getElementById('arenaClose')?.addEventListener('click',()=>{
  window.closeArenaModal();
  if(typeof showScreen==='function') showScreen('home');
});
document.getElementById('arenaModal')?.addEventListener('click',e=>{
  if(e.target.id==='arenaModal') window.closeArenaModal();
});
