/* Territory boot guard: clear stale Game/modals restored by Telegram WebView. */
(function(){
  function reset(){
    document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id==='home'));
    document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.screen==='home'));
    document.querySelectorAll('#gameRewardModal,#gameTasksModal,#gamePanelModal,#gameJackpotModal').forEach(el=>{el.classList.remove('show');el.setAttribute('aria-hidden','true');});
    const arena=document.getElementById('arenaModal');
    if(arena){arena.classList.remove('show');arena.setAttribute('aria-hidden','true');}
  }
  function navigate(id){
    document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));
    document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.screen===id));
    if(id==='arena'&&typeof window.openBattle==='function')window.openBattle();
  }
  document.addEventListener('DOMContentLoaded',function(){
    reset();
    document.addEventListener('click',function(e){const btn=e.target.closest('[data-screen]');if(!btn)return;const id=btn.dataset.screen;if(!id)return;e.preventDefault();navigate(id);},true);
  });
  window.addEventListener('pageshow',reset);
  setTimeout(reset,1200);
})();

/* Territory Arena — clean tactical frontend core.
   Static GitHub frontend: local tactical PvE only. Multiplayer is not faked here.
*/
window.arenaToast=function(text){
  const el=document.getElementById('arenaToast');
  if(!el)return;
  el.textContent=text;
  el.classList.add('show');
  clearTimeout(window._arenaToastTimer);
  window._arenaToastTimer=setTimeout(()=>el.classList.remove('show'),1600);
};

window.closeArenaModal=function(){
  clearTimeout(window.arenaTimer);
  const m=document.getElementById('arenaModal');
  if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');}
  if(typeof window.showScreen==='function') window.showScreen('home');
};

(()=>{
  const Z=[['head','Голова'],['chest','Грудь'],['stomach','Живот'],['legs','Ноги']];
  const enemies=[
    {name:'Уличный боец',ico:'🥊',hp:105,damage:13,armor:1,reward:45,xp:12},
    {name:'Наёмник Sdolars',ico:'🗡️',hp:135,damage:16,armor:3,reward:65,xp:17},
    {name:'Гвардеец замка',ico:'🛡️',hp:165,damage:19,armor:5,reward:90,xp:23},
    {name:'Капитан стражи',ico:'⚔️',hp:205,damage:23,armor:7,reward:125,xp:30},
    {name:'Чемпион Sdolars',ico:'👹',hp:250,damage:28,armor:9,reward:170,xp:40}
  ];
  let battle=null;
  const esc=s=>String(s??'').replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const modal=()=>document.getElementById('arenaModal');
  const body=()=>document.getElementById('arenaModalBody');
  const title=()=>document.getElementById('arenaModalTitle');
  const label=id=>Z.find(z=>z[0]===id)?.[1]||id;
  const pct=(v,m)=>Math.max(0,Math.min(100,(Number(v)||0)/(Number(m)||1)*100));
  const playerDamage=()=>Math.max(5,Number(state?.bonusDamage||0)+Number(state?.strength||5));
  const playerArmor=()=>Math.max(0,Number(state?.defense||0));

  function arenaStats(){
    try{return JSON.parse(localStorage.getItem('territory_arena_v1')||'{}')||{};}catch(e){return {};}
  }
  function saveStats(s){localStorage.setItem('territory_arena_v1',JSON.stringify(s));}
  function getStats(){
    const s=arenaStats();
    s.wins=Number(s.wins||0); s.losses=Number(s.losses||0); s.streak=Number(s.streak||0); s.best=Number(s.best||0);
    s.history=Array.isArray(s.history)?s.history:[];
    return s;
  }

  function show(html,head='⚔️ Арена'){
    const m=modal(),b=body(),t=title();
    if(!m||!b||!t)return;
    t.textContent=head;b.innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');
  }

  function openBattle(){
    if(battle){renderFight();return;}
    const s=getStats();
    const level=Number(state?.level||1);
    const energy=Number(state?.energy||0);
    const cards=enemies.map((e,i)=>{
      const locked=i>Math.min(enemies.length-1,Math.floor((level-1)/2)+1);
      return `<div class="s98Opp"><div class="ico">${e.ico}</div><div><b>${esc(e.name)}</b><small>⚔️ ${e.damage} урон · 🛡️ ${e.armor} броня</small><div class="s98Diff">${locked?'🔒 Требуется уровень выше':'🏆 '+e.reward+' 🪙 · '+e.xp+' XP'}</div></div><button class="s98Fight" data-arena-enemy="${i}" ${locked||energy<10?'disabled':''}>${energy<10?'⚡10':'В бой'}</button></div>`;
    }).join('');
    show(`<div class="s98">
      <div class="s98Hero"><b>⚔️ Арена Sdolars</b><small>Тактический бой: 4 зоны атаки и 2 зоны защиты.</small></div>
      <div class="s98Grid"><div class="s98Stat">🏆 Победы<b>${s.wins}</b></div><div class="s98Stat">🔥 Серия<b>${s.streak}</b></div><div class="s98Stat">⭐ Лучшая<b>${s.best}</b></div></div>
      <div class="s98Panel"><div class="s98PanelTitle">Режимы</div><div class="arena-modes"><button type="button" disabled>1×1 · онлайн</button><button type="button" disabled>Хаос · онлайн</button><button type="button" disabled>Группа · до 20</button></div><small class="arena-network-note">Онлайн-лобби подключим отдельным сетевым этапом. Здесь не имитируем мультиплеер.</small></div>
      <div class="s98Panel"><div class="s98PanelTitle">Выбери соперника</div><div class="s98Opps">${cards}</div></div>
    </div>`);
    document.querySelectorAll('[data-arena-enemy]').forEach(b=>b.onclick=()=>startFight(Number(b.dataset.arenaEnemy)));
  }

  function startFight(i){
    if(Number(state?.energy||0)<10){arenaToast('⚡ Нужно 10 энергии');return;}
    const e={...enemies[Math.max(0,Math.min(enemies.length-1,i))]};
    battle={enemy:{...e,maxHp:e.hp},playerHp:Number(state?.hp||state?.maxHp||120),playerMax:Number(state?.maxHp||120),round:1,attack:null,defense:[],turn:'player',log:['⚔️ Бой начался. Выбери атаку и две зоны защиты.'],locked:false,result:false};
    renderFight();
  }

  function enemyPlan(){
    const shuffled=[...Z].sort(()=>Math.random()-.5);
    battle.enemyAttack=shuffled[0][0];
    battle.enemyDefense=shuffled.slice(1,3).map(x=>x[0]);
  }
  function addLog(text){battle.log.push(text);if(battle.log.length>12)battle.log.shift();}

  function renderFight(){
    const e=battle.enemy,can=battle.turn==='player'&&!battle.locked&&!battle.result;
    const attack=Z.map(z=>`<button class="s98Zone ${battle.attack===z[0]?'attackSel':''}" data-a="${z[0]}" ${can?'':'disabled'}>${z[1]}</button>`).join('');
    const defense=Z.map(z=>`<button class="s98Zone ${battle.defense.includes(z[0])?'defSel':''}" data-d="${z[0]}" ${can?'':'disabled'}>${z[1]}</button>`).join('');
    const logs=battle.log.map(x=>`<div>• ${esc(x)}</div>`).join('');
    title().textContent='⚔️ Арена · тактический бой';
    body().innerHTML=`<div class="s98">
      <div class="s98Stage"><div class="s98VS">⚔️</div><div class="s98F p"><div class="s98Avatar">🧔</div><div class="s98FName">${esc(state?.name||'SSS')}</div></div><div class="s98F e"><div class="s98Avatar">${e.ico}</div><div class="s98FName">${esc(e.name)}</div></div></div>
      <div class="s98HpRow"><div class="s98HpCard"><b>🧔 ${esc(state?.name||'SSS')}</b><div class="s98Hp"><i style="width:${pct(battle.playerHp,battle.playerMax)}%"></i></div><div class="s98HpText">${Math.ceil(battle.playerHp)} / ${battle.playerMax} HP</div></div><div class="s98HpCard"><b>${e.ico} ${esc(e.name)}</b><div class="s98Hp enemy"><i style="width:${pct(e.hp,e.maxHp)}%"></i></div><div class="s98HpText">${Math.ceil(e.hp)} / ${e.maxHp} HP</div></div></div>
      <div class="s98Turn">Раунд <strong>${battle.round}</strong> · ${battle.turn==='player'?'<strong>Твой ход</strong>':'Ход противника'} · защита <strong>${battle.defense.length}/2</strong></div>
      <div class="s98Step">🎯 1. Выбери 1 зону атаки</div><div class="s98Zones">${attack}</div>
      <div class="s98Step">🛡️ 2. Выбери ровно 2 зоны защиты</div><div class="s98Zones">${defense}</div>
      <div class="s98Actions"><button class="s98Act main" data-hit ${can&&battle.attack&&battle.defense.length===2?'':'disabled'}>⚔️ НАНЕСТИ УДАР · 10 ⚡</button></div>
      <div class="s98Log">${logs}</div>
      <div class="s98Hint">4 зоны: Голова · Грудь · Живот · Ноги. Защита каждый ход — ровно 2 зоны.</div>
    </div>`;
    body().querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{battle.attack=b.dataset.a;renderFight();});
    body().querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const z=b.dataset.d;if(battle.defense.includes(z))battle.defense=battle.defense.filter(x=>x!==z);else if(battle.defense.length<2)battle.defense.push(z);renderFight();});
    body().querySelector('[data-hit]')?.addEventListener('click',playerTurn);
  }

  function playerTurn(){
    if(!battle||battle.locked||battle.result||battle.turn!=='player'||!battle.attack||battle.defense.length!==2)return;
    if(Number(state?.energy||0)<10){arenaToast('⚡ Недостаточно энергии');return;}
    battle.locked=true;state.energy=Math.max(0,Number(state.energy||0)-10);enemyPlan();
    const e=battle.enemy;
    let damage=0;
    if(battle.enemyDefense.includes(battle.attack)){
      addLog(`🛡️ Противник заблокировал «${label(battle.attack)}». Урон: 0.`);
    }else{
      const base=Math.max(5,playerDamage()+10+Math.floor(Math.random()*8));
      const crit=battle.attack==='head'&&Math.random()<Math.min(.35,.08+Number(state?.strength||5)/180);
      damage=Math.max(3,base-Number(e.armor||0));
      if(crit)damage=Math.round(damage*1.55);
      e.hp=Math.max(0,e.hp-damage);
      addLog(`⚔️ Удар в «${label(battle.attack)}»: −${damage} HP${crit?' · 💥 КРИТ!':''}`);
    }
    renderFight();
    if(e.hp<=0){setTimeout(()=>finish(true),450);return;}
    battle.turn='enemy';setTimeout(enemyTurn,600);
  }

  function enemyTurn(){
    if(!battle||battle.result)return;
    const target=battle.enemyAttack||Z[Math.floor(Math.random()*Z.length)][0];
    const blocked=battle.defense.includes(target);
    if(blocked){addLog(`🛡️ Блок! Атака в «${label(target)}» остановлена.`);}
    else{
      const raw=battle.enemy.damage+Math.floor(Math.random()*6);
      const damage=Math.max(1,raw-playerArmor());
      battle.playerHp=Math.max(0,battle.playerHp-damage);
      addLog(`💥 Противник бьёт в «${label(target)}»: −${damage} HP.`);
    }
    if(battle.playerHp<=0){renderFight();setTimeout(()=>finish(false),450);return;}
    battle.round++;battle.turn='player';battle.attack=null;battle.defense=[];battle.locked=false;renderFight();
  }

  function finish(win){
    if(!battle||battle.result)return;
    battle.result=true;
    const s=getStats(),e=battle.enemy;
    if(win){
      s.wins++;s.streak++;s.best=Math.max(s.best,s.streak);state.coins=Number(state.coins||0)+e.reward;state.exp=Number(state.exp||0)+e.xp;addLog(`🏆 Победа! +${e.reward} 🪙 · +${e.xp} XP`);
      while(state.exp>=100){state.exp-=100;state.level=Number(state.level||1)+1;state.maxHp=Number(state.maxHp||120)+10;state.hp=state.maxHp;}
    }else{s.losses++;s.streak=0;state.hp=Math.max(1,Math.min(Number(state.maxHp||120),Math.ceil(battle.playerHp)));addLog('💀 Поражение.');}
    s.history.push({win,enemy:e.name,reward:win?e.reward:0,round:battle.round});s.history=s.history.slice(-10);saveStats(s);
    if(typeof save==='function')save();
    show(`<div class="s98Result"><div class="s98ResultIcon">${win?'🏆':'💀'}</div><h3>${win?'Победа!':'Поражение'}</h3><p>${win?`+${e.reward} 🪙 · +${e.xp} XP`:'Попробуй другую тактику в следующем бою.'}</p><button class="s98Act main" data-arena-home>Вернуться на Арену</button></div>`,win?'🏆 Бой завершён':'💀 Бой завершён');
    body().querySelector('[data-arena-home]').onclick=()=>{battle=null;openBattle();};
  }

  window.openBattle=openBattle;
})();
