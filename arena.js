/* Territory G49 — Arena combat controls: manual mode + small Autoboy switch.
   PvE remains completely separate and is not modified here.
   Based on the verified G48 Arena. */
/* Territory G46 — Arena integrated combat pass based on verified G48.
   Mechanics preserved; mobile/target-state reliability tightened.
   The old S98 opponent-picker remains removed.
   This file owns the Arena modal only and keeps the rest of the game state intact. */
/* Territory G48 — Arena team-turn repair based on G47.
   The old S98 opponent-picker is intentionally removed.
   This file owns the Arena modal only and keeps the rest of the game state intact. */
(()=>{
  const ATTACK_ZONES=[
    ['head','Голова','🎯'],['chest','Грудь','🫀'],['waist','Пояс','🛡️'],['legs','Ноги','🦵']
  ];
  const DEF_ZONES=[
    ['head','Голова','⬆️'],['chest','Грудь','🛡️'],['waist','Пояс','↔️'],['legs','Ноги','⬇️']
  ];
  const MODE=[
    {id:'duel',title:'1×1 бой',icon:'⚔️',desc:'Один против одного. Создатель запускает ожидание на 3 минуты.'},
    {id:'chaos',title:'Хаотичный бой',icon:'🎲',desc:'Все входят в одну комнату, затем игроки случайно распределяются по командам.'},
    {id:'group',title:'Групповой бой',icon:'👥',desc:'Выбор команды 1 или 2. До 20 игроков в бою.'}
  ];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]));
  const getState=()=>{try{return state}catch(e){return {}}};
  const save=()=>{try{window.save?.()}catch(e){}};
  const getStats=()=>{try{return JSON.parse(localStorage.getItem('territory_arena_g45')||localStorage.getItem('territory_arena_g43')||'{}')}catch(e){return {}}};
  let stats=getStats();
  stats.wins=Number(stats.wins||0); stats.losses=Number(stats.losses||0); stats.battles=Number(stats.battles||0);
  stats.history=Array.isArray(stats.history)?stats.history:[];
  let lobby=null;
  let battle=null;
  let lobbyTimer=null;
  let battleTimer=null;
  let modalOpen=false;

  const modal=()=>document.getElementById('arenaModal');
  const title=()=>document.getElementById('arenaModalTitle');
  const body=()=>document.getElementById('arenaModalBody');
  function showModal(t,html){const m=modal();if(!m||!body())return; m.style.display=''; title().textContent=t;body().innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');modalOpen=true;}
  function close(){
    clearInterval(lobbyTimer); clearInterval(battleTimer);
    const m=modal();
    if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.display='none';}
    modalOpen=false; lobby=null; battle=null;
    // Arena is opened as a modal over the Arena screen. Closing it must return to the fixed City screen.
    try{
      if(typeof window.showScreen==='function') window.showScreen('home');
      document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='home'));
      const home=document.getElementById('home'); if(home) home.style.display='block';
      const arena=document.getElementById('arena'); if(arena) arena.classList.remove('active');
      document.querySelectorAll('.bottom-nav [data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen==='home'));
    }catch(e){console.warn('Arena close navigation',e)}
  }
  window.closeArenaModal=close;
  window.arenaToast=(text)=>{const t=document.getElementById('arenaToast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(window.__arenaToast);window.__arenaToast=setTimeout(()=>t.classList.remove('show'),1600)};

  function name(){return String(getState().name||'Alex').trim()||'Alex'}
  function level(){return Number(getState().level||1)}
  function combatStats(){const s=getState(); let eq={damage:0,defense:0}; try{const items={axe:{damage:12},sword:{damage:18},helm:{defense:4},armor:{defense:7},gloves:{defense:3},boots:{defense:3}}; const slots=s.equipmentSlots||{}; Object.values(slots).forEach(id=>{const it=items[id]; if(it && Number(s.durability?.[id]??300)>0){eq.damage+=Number(it.damage||0);eq.defense+=Number(it.defense||0)}})}catch(e){} return {strength:Number(s.strength||5),agility:Number(s.agility||5),endurance:Number(s.endurance||12),defense:Number(s.defense||0),mastery:Number(s.weaponMastery||1),bonus:Number(s.bonusDamage||0),eqDamage:eq.damage,eqDefense:eq.defense};}
  function renderHome(){
    clearInterval(lobbyTimer);clearInterval(battleTimer);lobby=null;battle=null;
    const s=getState();
    showModal('⚔️ Арена',`<div class="arena140">
      <section class="arena140-hero">
        <div><div class="arena140-kicker">SDOLARS · ARENA</div><h2>Бой начинается здесь</h2><p>Большая боевая сцена, короткие ходы и живой боевой журнал. Без старой S98-схемы выбора NPC.</p></div>
        <div class="arena140-stat"><b>${stats.wins}</b><span>побед</span></div>
      </section>
      <section class="arena140-modes">${MODE.map(m=>`<button class="arena140-mode" data-mode="${m.id}"><span class="mode-icon">${m.icon}</span><span><b>${m.title}</b><small>${m.desc}</small></span><strong>›</strong></button>`).join('')}</section>
      <section class="arena140-rules"><b>Правила Arena</b><div><span>⏱️ 3:00</span><span>👥 до 20</span><span>🎯 4 атаки</span><span>🛡️ 4 защиты</span></div><p>Если игрок вышел из комнаты, повторно войти в этот же бой нельзя.</p></section>
      <section class="arena140-history"><div class="arena140-section-head"><b>Последние бои</b><span>${stats.battles}</span></div>${stats.history.slice(-4).reverse().map(h=>`<div class="arena140-history-row"><span>${h.win?'🏆':'💀'}</span><span>${esc(h.mode||'Бой')}</span><span>${esc(h.result||'завершён')}</span></div>`).join('')||'<div class="arena140-empty">Пока нет завершённых боёв.</div>'}</section>
    </div>`);
    body().querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>createLobby(b.dataset.mode));
  }
  function createLobby(mode){
    const m=MODE.find(x=>x.id===mode)||MODE[0];
    lobby={mode,createdAt:Date.now(),endsAt:Date.now()+180000,players:[{name:name(),level:level(),team:mode==='group'?1:null,owner:true}],left:false,started:false};
    renderLobby();
  }
  function addFake(){
    if(!lobby||lobby.started)return;
    const max=lobby.mode==='duel'?2:20;if(lobby.players.length>=max)return window.arenaToast('Комната заполнена');
    const bots=['Варг','Рагнар','Стальной Волк','Тёмный рыцарь','Наёмник','Берсерк','Охотник','Гвардеец'];
    const n=bots[(lobby.players.length-1)%bots.length]+' '+(lobby.players.length+1);
    lobby.players.push({name:n,level:Math.max(1,level()+Math.floor(Math.random()*3)-1),team:lobby.mode==='group'?(lobby.players.length%2)+1:null,bot:true});
    renderLobby();
  }
  function renderLobby(){
    clearInterval(lobbyTimer);if(!lobby)return;
    const m=MODE.find(x=>x.id===lobby.mode)||MODE[0];
    const remain=Math.max(0,lobby.endsAt-Date.now());
    const mm=String(Math.floor(remain/60000)).padStart(2,'0'),ss=String(Math.floor(remain/1000)%60).padStart(2,'0');
    const canStart=lobby.players.length>1;
    const players=lobby.players.map((p,i)=>`<div class="arena140-player"><span class="avatar">${p.bot?'⚔️':'🧔'}</span><span><b>${esc(p.name)}</b><small>ур. ${p.level}${p.owner?' · создатель':''}</small></span>${lobby.mode==='group'?`<em class="team team-${p.team}">Команда ${p.team}</em>`:''}</div>`).join('');
    showModal(`${m.icon} ${m.title}`,`<div class="arena140">
      <section class="arena140-lobby-head"><div><span class="arena140-kicker">КОМНАТА БОЯ</span><h2>Ожидание игроков</h2><p>${esc(m.desc)}</p></div><div class="arena140-countdown"><small>Автостарт</small><b>${mm}:${ss}</b></div></section>
      <section class="arena140-lobby-card"><div class="arena140-section-head"><b>Игроки</b><span>${lobby.players.length}/${lobby.mode==='duel'?2:20}</span></div><div class="arena140-players">${players}</div></section>
      ${lobby.mode==='group'?`<section class="arena140-team-choice"><b>Твоя команда</b><div><button data-team="1" class="${lobby.players[0].team===1?'selected':''}">⚔️ Команда 1</button><button data-team="2" class="${lobby.players[0].team===2?'selected':''}">🛡️ Команда 2</button></div></section>`:''}
      <section class="arena140-actions"><button class="arena140-secondary" data-add>＋ Добавить игрока для теста</button><button class="arena140-primary" data-start ${canStart?'':'disabled'}>⚔️ Начать сейчас</button><button class="arena140-leave" data-leave>Выйти из комнаты</button></section>
      <p class="arena140-note">Создатель комнаты запускает таймер 3:00. После его окончания бой стартует автоматически. Вышедший игрок не может вернуться в эту комнату.</p>
    </div>`);
    body().querySelector('[data-add]')?.addEventListener('click',addFake);
    body().querySelector('[data-start]')?.addEventListener('click',()=>startBattle());
    body().querySelector('[data-leave]')?.addEventListener('click',()=>{lobby.left=true;window.arenaToast('Ты вышел. Повторный вход запрещён.');setTimeout(renderHome,500)});
    body().querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>{if(lobby.mode!=='group')return;lobby.players[0].team=Number(b.dataset.team);renderLobby()});
    lobbyTimer=setInterval(()=>{if(!lobby)return; if(Date.now()>=lobby.endsAt){clearInterval(lobbyTimer);startBattle()}else renderLobby()},1000);
  }
  function startBattle(){
    if(!lobby||lobby.started)return;
    if(lobby.players.length<2){window.arenaToast('Нужно минимум 2 игрока');return}
    lobby.started=true;clearInterval(lobbyTimer);
    if(lobby.mode==='chaos'){
      const shuffled=[...lobby.players].sort(()=>Math.random()-.5);
      shuffled.forEach((p,i)=>p.team=(i%2)+1);
      lobby.players=shuffled;
    }
    const mode=MODE.find(x=>x.id===lobby.mode)||MODE[0];
    const myTeam=Number(lobby.players.find(p=>p.owner)?.team||getState().team||1)||1;
    const combatants=lobby.players.map((p,i)=>({...p,team:p.team||(lobby.mode==='duel'?(i===0?1:2):p.team),id:`${p.name}-${i}`,maxHp:120+Math.max(0,(Number(p.level)||1)-1)*5,hp:120+Math.max(0,(Number(p.level)||1)-1)*5,defeated:false}));
    const cs=combatStats();
    const playerMax=Number(getState().maxHp||120);
    battle={mode:lobby.mode,team:myTeam,round:1,playerHp:Number(getState().hp||playerMax),maxHp:playerMax,enemyHp:120,maxEnemyHp:120,attack:null,defense:[],targetName:null,autoBattle:false,autoTimer:null,combatants,log:[`⚔️ ${mode.title}: бой начался.`,`👥 В комнате ${lobby.players.length} игроков.`],startedAt:Date.now(),endsAt:Date.now()+600000,ended:false};
    if(lobby.mode==='duel') battle.targetName=combatants.find(p=>p.team!==myTeam)?.name||'Противник';
    else battle.targetName=combatants.find(p=>p.team&&p.team!==myTeam)?.name||null;
    renderBattle();
  }
  function zone(id,list){return list.find(z=>z[0]===id)?.[1]||id}
  function renderBattle(){
    clearInterval(battleTimer);if(!battle)return;
    const remain=Math.max(0,battle.endsAt-Date.now()),mm=String(Math.floor(remain/60000)).padStart(2,'0'),ss=String(Math.floor(remain/1000)%60).padStart(2,'0');
    const hp1=Math.max(0,Math.round(battle.playerHp/battle.maxHp*100));
    const target=battle.combatants?.find(p=>p.name===battle.targetName && !p.defeated);
    const targetHp=target?target.hp:battle.enemyHp;
    const targetMax=target?target.maxHp:battle.maxEnemyHp;
    const hp2=Math.max(0,Math.round(targetHp/targetMax*100));
    const attacks=ATTACK_ZONES.map(z=>`<button class="arena140-zone ${battle.attack===z[0]?'selected':''}" data-a="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
    const defs=DEF_ZONES.map(z=>`<button class="arena140-zone ${battle.defense.includes(z[0])?'selected defense':''}" data-d="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
    const logs=battle.log.slice(-10).map(x=>`<div>${esc(x)}</div>`).join('');
    showModal('⚔️ Arena · бой',`<div class="arena140 arena140-combat">
      <section class="arena140-fighters"><div class="arena140-fighter"><div class="big-avatar">🧔</div><b>${esc(name())}</b><small>ур. ${level()}</small><div class="arena140-hp"><i style="width:${hp1}%"></i></div><span>${Math.round(battle.playerHp)} / ${battle.maxHp} HP</span></div><div class="arena140-vs">VS</div><div class="arena140-fighter enemy"><div class="big-avatar">⚔️</div><b>${esc(target?.name||'Противник')}</b><small>${target?'цель · Команда '+target.team:'отряд'}</small><div class="arena140-hp"><i style="width:${hp2}%"></i></div><span>${Math.round(targetHp)} / ${targetMax} HP</span></div></section>
      <section class="arena140-combat-top"><span>Раунд <b>${battle.round}</b></span><span>⏱️ <b>${mm}:${ss}</b></span><span>🎯 ${target?esc(target.name):'цель не выбрана'}</span></section>
      <section class="arena140-team-strip"><span>Твоя сторона: <b>Команда ${battle.team}</b></span><span>⚔️ ${aliveTeam(battle.team).length} живы · противник ${aliveTeam(battle.team===1?2:1).length}</span></section>
      ${(battle.mode==='group'||battle.mode==='chaos')?`<section class="arena140-rosters"><div class="arena140-roster-title"><b>Отряды</b><small>Выбери цель</small></div><div class="arena140-roster-grid"><div><span class="roster-label team1-label">⚔️ Команда 1</span>${(battle.combatants||[]).filter(p=>p.team===1).map(p=>`<button class="arena140-target ${battle.targetName===p.name?'selected':''} ${p.defeated?'defeated':''}" data-target-name="${esc(p.name)}" ${p.defeated||p.team===battle.team?'disabled':''}>${p.bot?'⚔️':'🧔'} ${esc(p.name)}<small>${p.defeated?'💀 повержен':'HP '+Math.max(0,Math.round(p.hp))+' / '+p.maxHp+' · ур. '+p.level}</small></button>`).join('')||'<span class="arena140-empty">нет игроков</span>'}</div><div><span class="roster-label team2-label">🛡️ Команда 2</span>${(battle.combatants||[]).filter(p=>p.team===2).map(p=>`<button class="arena140-target ${battle.targetName===p.name?'selected':''} ${p.defeated?'defeated':''}" data-target-name="${esc(p.name)}" ${p.defeated||p.team===battle.team?'disabled':''}>${p.bot?'⚔️':'🧔'} ${esc(p.name)}<small>${p.defeated?'💀 повержен':'HP '+Math.max(0,Math.round(p.hp))+' / '+p.maxHp+' · ур. '+p.level}</small></button>`).join('')||'<span class="arena140-empty">нет игроков</span>'}</div></div></section>`:''}
      <section class="arena140-select"><div class="arena140-step"><b>1. Атака</b><small>Выбери одну из 4 зон</small></div><div class="arena140-zones">${attacks}</div><div class="arena140-step"><b>2. Защита</b><small>Выбери две из 4 зон</small></div><div class="arena140-zones">${defs}</div><div class="arena140-auto"><label><input type="checkbox" data-autobattle ${battle.autoBattle?'checked':''}> <span>Автобой</span></label><small>${battle.autoBattle?'Действия выбираются автоматически':'Ручной бой'}</small></div><button class="arena140-hit" data-hit ${battle.autoBattle?'disabled':(battle.attack&&battle.defense.length===2?'':'disabled')}>⚔️ ПОДТВЕРДИТЬ ХОД</button></section>
      <section class="arena140-log"><div class="arena140-log-head"><b>Боевой журнал</b><button data-collapse>Свернуть</button></div><div class="arena140-log-body">${logs}</div></section>
      <section class="arena140-finish"><button data-finish>Завершить бой</button><button data-extend>Продлить +5 мин</button></section>
    </div>`);
    body().querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(battle?.autoBattle)return;battle.attack=b.dataset.a;renderBattle()});
    body().querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(battle?.autoBattle)return;const z=b.dataset.d;if(battle.defense.includes(z))battle.defense=battle.defense.filter(x=>x!==z);else if(battle.defense.length<2)battle.defense.push(z);else window.arenaToast('Можно закрыть только 2 зоны');renderBattle()});
    body().querySelector('[data-autobattle]')?.addEventListener('change',e=>{if(!battle)return;battle.autoBattle=!!e.target.checked;battle.attack=null;battle.defense=[];if(battle.autoBattle){window.arenaToast('Автобой включён');autoRound()}else{clearTimeout(battle.autoTimer);battle.autoTimer=null;window.arenaToast('Ручной бой включён');renderBattle()}});
    body().querySelectorAll('[data-target-name]').forEach(b=>b.onclick=()=>{if(!battle||b.disabled)return;const p=(battle.combatants||[]).find(x=>x.name===b.dataset.targetName&&!x.defeated&&x.team!==battle.team);if(!p){window.arenaToast('Цель недоступна');return}battle.targetName=p.name;renderBattle()});
    body().querySelector('[data-hit]')?.addEventListener('click',resolveTurn);
    body().querySelector('[data-finish]')?.addEventListener('click',()=>finishBattle('Игрок завершил бой'));
    body().querySelector('[data-extend]')?.addEventListener('click',()=>{battle.endsAt+=300000;window.arenaToast('Бой продлён на 5 минут');renderBattle()});
    body().querySelector('[data-collapse]')?.addEventListener('click',e=>{const x=body().querySelector('.arena140-log-body');x.classList.toggle('collapsed');e.target.textContent=x.classList.contains('collapsed')?'Развернуть':'Свернуть'});
    battleTimer=setInterval(()=>{if(!battle)return;if(Date.now()>=battle.endsAt)finishBattle('Время боя истекло');else renderBattle()},1000);
  }
  function aliveTeam(team){
    return (battle?.combatants||[]).filter(p=>p.team===team&&!p.defeated);
  }
  function enemyTeamTurn(){
    if(!battle)return;
    const foes=aliveTeam(battle.team===1?2:1);
    if(!foes.length)return;
    const actor=foes[Math.floor(Math.random()*foes.length)];
    const cs=combatStats();
    const base=9+Math.floor((Number(actor.level)||1)*1.6);
    const dodge=Math.min(.45,cs.agility*.015); if(Math.random()<dodge){battle.log.push(`🌀 Ты увернулся от атаки ${actor.name}.`); return;} const endMit=Math.min(0.28,cs.endurance*.008); const raw=Math.max(0,base-cs.defense*1.2-cs.eqDefense); const dmg=Math.max(2,Math.round(raw*(1-endMit)*(0.82+Math.random()*.32)));
    battle.playerHp=Math.max(0,battle.playerHp-dmg);
    battle.log.push(`💥 ${actor.name} атакует тебя: −${dmg} HP.`);
    const me=(battle.combatants||[]).find(p=>p.name===name() && p.team===battle.team);
    if(me) me.hp=battle.playerHp;
  }

  function autoRound(){
    if(!battle||battle.ended||!battle.autoBattle)return;
    clearTimeout(battle.autoTimer);
    if((battle.mode==='group'||battle.mode==='chaos') && !battle.targetName){
      const foes=aliveTeam(battle.team===1?2:1);
      const target=foes[Math.floor(Math.random()*foes.length)];
      if(target)battle.targetName=target.name;
    }
    battle.attack=ATTACK_ZONES[Math.floor(Math.random()*ATTACK_ZONES.length)][0];
    const shuffled=DEF_ZONES.map(z=>z[0]).sort(()=>Math.random()-0.5);
    battle.defense=shuffled.slice(0,2);
    battle.autoTimer=setTimeout(()=>{if(battle?.autoBattle)resolveTurn()},700);
    renderBattle();
  }

  function resolveTurn(){
    if(!battle||!battle.attack||battle.defense.length!==2)return;
    const s=getState();
    const target=battle.combatants?.find(p=>p.name===battle.targetName && !p.defeated);
    if((battle.mode==='group'||battle.mode==='chaos')&&!target){window.arenaToast('Сначала выбери цель противника');return}
    const cs=combatStats();
    const atk=cs.bonus+cs.eqDamage+cs.strength+cs.mastery+10;
    const crit=Math.random()<Math.min(.6,cs.strength*.02);
    const hit=Math.max(8,Math.round(atk*(0.9+Math.random()*.35)*(crit?1.6:1)));
    const enemyAttack=ATTACK_ZONES[Math.floor(Math.random()*ATTACK_ZONES.length)][0];
    const enemyBlocked=battle.defense.includes(enemyAttack);
    if(target){
      target.hp=Math.max(0,target.hp-hit);
      battle.enemyHp=target.hp;battle.maxEnemyHp=target.maxHp;
      battle.log.push(`⚔️ ${name()} атаковал «${target.name}» в «${zone(battle.attack,ATTACK_ZONES)}»: −${hit} HP${crit?' · КРИТ':''}.`);
      if(target.hp<=0){
        target.defeated=true;
        battle.log.push(`💀 ${target.name} повержен!`);
      }
    }else{
      battle.enemyHp=Math.max(0,battle.enemyHp-hit);
      battle.log.push(`⚔️ Атака в «${zone(battle.attack,ATTACK_ZONES)}» нанесла −${hit} HP.`);
    }
    const enemiesLeft=(battle.combatants||[]).some(p=>p.team!==battle.team&&!p.defeated);
    if((battle.mode==='group'||battle.mode==='chaos')&&!enemiesLeft){renderBattle();setTimeout(()=>finishBattle('Победа'),350);return}
    if(battle.enemyHp<=0&&!target){renderBattle();setTimeout(()=>finishBattle('Победа'),350);return}
    if(enemyBlocked){
      battle.log.push(`🛡️ Защита закрыла «${zone(enemyAttack,DEF_ZONES)}». Урон остановлен.`)
    }else{
      enemyTeamTurn();
    }
    battle.round++;
    battle.attack=null;battle.defense=[];
    if(battle.playerHp<=0){renderBattle();setTimeout(()=>finishBattle('Поражение'),350);return}
    if((battle.combatants||[]).some(p=>p.name===name()&&p.hp<=0)){renderBattle();setTimeout(()=>finishBattle('Поражение'),350);return}
    renderBattle();
    if(battle.autoBattle)autoRound();
  }
  function finishBattle(result){
    if(!battle||battle.ended)return;
    battle.ended=true;clearInterval(battleTimer);clearTimeout(battle.autoTimer);
    const win=result==='Победа';stats.battles++;if(win)stats.wins++;else if(result==='Поражение')stats.losses++;
    stats.history.push({mode:MODE.find(x=>x.id===battle.mode)?.title||'Бой',win,result,at:Date.now()});stats.history=stats.history.slice(-20);
    localStorage.setItem('territory_arena_g45',JSON.stringify(stats));
    if(win){const s=getState();s.coins=Number(s.coins||0)+50; if(window.TerritoryCore?.addXP) window.TerritoryCore.addXP(15); else s.exp=Number(s.exp||0)+15; if(window.TerritoryCore?.markArena) window.TerritoryCore.markArena(true); save()} else if(result==='Поражение'){const s=getState();s.hunger=Math.max(0,Number(s.hunger??100)-5); if(window.TerritoryCore?.markArena) window.TerritoryCore.markArena(false);try{localStorage.setItem('territory_save_v1',JSON.stringify(s));localStorage.setItem('territory_save',JSON.stringify(s))}catch(e){}}
    lobby=null;battle=null;renderResult(result);
  }
  function renderResult(result){
    const win=result==='Победа';
    showModal(win?'🏆 Победа':'⚔️ Бой завершён',`<div class="arena140 arena140-result"><div class="result-icon">${win?'🏆':'⚔️'}</div><h2>${esc(result)}</h2><p>Бой завершён. Результат сохранён в истории Arena.</p>${win?'<div class="arena140-reward">+50 🪙 &nbsp; +15 XP</div>':''}<button class="arena140-primary" data-back>Вернуться в Arena</button></div>`);
    body().querySelector('[data-back]').onclick=renderHome;
  }
  window.openBattle=renderHome;
  window.openArena=renderHome;
  // G42 close fix: the canonical HTML button is #arenaClose (it has no data-arena-close).
  // Bind both paths and use capture so no global click handler can swallow the event.
  function bindClose(){
    const b=document.getElementById('arenaClose');
    if(b && !b.__territoryArenaCloseBound){
      b.__territoryArenaCloseBound=true;
      b.setAttribute('aria-label','Закрыть арену');
      b.innerHTML='×';
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close();},true);
    }
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-arena-close],#arenaClose'))close()},true);
  bindClose();
  const m=modal();if(m)m.addEventListener('click',e=>{if(e.target===m)close()});
})();
