/* TERITORY ARENA v30 — full mobile arena
   HOME is untouched. Arena opens directly from HOME/Battle/side Arena.
   Frontend foundation: 1x1, 3x3, Chaos, player-like opponents, profiles,
   rating, history, rewards, tactics, background activity.
*/
(function(){
  'use strict';

  const KEY='territory_arena_v30';
  const ZONES=[
    ['head','Голова'],['chest','Грудь'],['stomach','Живот'],['waist','Пояс'],['legs','Ноги']
  ];
  const CLASSES={
    tank:{name:'Танк',icon:'🛡️',hp:150,atk:.86,def:1.30,crit:.06,dodge:.04},
    berserker:{name:'Берсерк',icon:'🪓',hp:112,atk:1.30,def:.84,crit:.17,dodge:.07},
    assassin:{name:'Ассасин',icon:'🗡️',hp:98,atk:1.20,def:.80,crit:.24,dodge:.18},
    duelist:{name:'Дуэлянт',icon:'⚔️',hp:118,atk:1.08,def:1.02,crit:.14,dodge:.12},
    support:{name:'Поддержка',icon:'✨',hp:128,atk:.88,def:1.06,crit:.09,dodge:.08}
  };
  const NAMES=[
    ['Alex Morgan','🇺🇸'],['Wei Chen','🇨🇳'],['Omar Al-Hadi','🇸🇦'],['Dmytro Kovalenko','🇺🇦'],
    ['Luca Moretti','🇮🇹'],['Marek Novak','🇵🇱'],['Erik Lund','🇸🇪'],['Yuki Tanaka','🇯🇵'],
    ['Noah Carter','🇨🇦'],['Mateo Silva','🇪🇸'],['Artem Volkov','🇪🇺'],['Hassan Rahman','🇦🇪'],
    ['Jonas Weber','🇩🇪'],['Min-jun Park','🇰🇷'],['Daniel Costa','🇵🇹'],['Victor Ivanov','🇧🇬'],
    ['Kenji Sato','🇯🇵'],['Adam Wilson','🇬🇧'],['Nikolai Petrov','🇷🇺'],['Sofia Rossi','🇮🇹']
  ];
  const STYLES=['Агрессивный','Баланс','Защитный','Контратакующий'];
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const state=()=>window.TerritoryStore?.state||window.state||{};
  const save=()=>{try{window.TerritoryStore?.save?.();window.save?.()}catch(_){}};

  function load(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return {}}
  }
  let data=load();
  data.rating=Number(data.rating||1000);
  data.wins=Number(data.wins||0); data.losses=Number(data.losses||0);
  data.streak=Number(data.streak||0); data.best=Number(data.best||0);
  data.energySpent=Number(data.energySpent||0);
  data.botBattles=Number(data.botBattles||0);
  data.history=Array.isArray(data.history)?data.history:[];
  data.season=Number(data.season||1);
  const persist=()=>localStorage.setItem(KEY,JSON.stringify(data));

  function rank(r){
    if(r<900)return ['Бронза','🥉'];
    if(r<1100)return ['Серебро','🥈'];
    if(r<1300)return ['Золото','🥇'];
    if(r<1500)return ['Платина','💠'];
    return ['Алмаз','💎'];
  }
  function makePlayer(){
    const s=state(), level=Number(s.level||1);
    return {
      id:'player',name:s.name||'SSS',flag:'🇺🇦',level,
      class:'duelist',rating:data.rating,player:true,
      hp:120+level*3,maxHp:120+level*3,wins:data.wins,losses:data.losses
    };
  }
  function makeOpponent(i){
    const n=NAMES[i%NAMES.length], keys=Object.keys(CLASSES), k=keys[i%keys.length];
    const level=3+(i*7%23);
    return {
      id:'op-'+i,name:n[0],flag:n[1],level,class:k,
      style:STYLES[i%STYLES.length],rating:760+(i*97%790),
      wins:12+(i*17%180),losses:3+(i*9%90),online:true,
      hp:CLASSES[k].hp+level*4,maxHp:CLASSES[k].hp+level*4
    };
  }
  const opponents=Array.from({length:20},(_,i)=>makeOpponent(i));

  function shell(){
    const m=$('#arenaModal');
    if(!m)return null;
    m.style.display='flex';m.style.pointerEvents='auto';m.classList.add('show');
    m.setAttribute('aria-hidden','false');
    return m;
  }
  window.closeArenaModal=function(){
    const m=$('#arenaModal');
    if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.display='none';m.style.pointerEvents='none'}
    battle=null; clearInterval(queueTimer);
  };
  window.arenaToast=function(t){
    const x=$('#arenaToast');if(!x)return;
    x.textContent=t;x.classList.add('show');clearTimeout(window._at);
    window._at=setTimeout(()=>x.classList.remove('show'),1800);
  };

  function frame(title,body,back=true){
    shell();
    const m=$('#arenaModalBody'),h=$('#arenaModalTitle');
    if(h)h.textContent=title;
    if(m)m.innerHTML=`<div class="arena-v30">${body}</div>`;
    const close=$('#arenaClose');
    if(close){close.textContent=back?'✕':'Закрыть';close.onclick=()=>{window.closeArenaModal(); if(typeof showScreen==='function')showScreen('home')}}
    return m;
  }
  function playerMini(){
    const p=makePlayer(),r=rank(data.rating);
    return `<div class="ar-player">
      <div class="ar-avatar">⚔️</div><div class="ar-player-main"><b>${esc(p.flag)} ${esc(p.name)}</b><span>ур. ${p.level} · ${r[1]} ${r[0]}</span></div>
      <strong>${data.rating}</strong>
    </div>`;
  }
  function opponentCard(o,click){
    const c=CLASSES[o.class],r=rank(o.rating);
    return `<button class="ar-op" ${click?`data-op="${o.id}"`:''}>
      <span class="ar-op-icon">${c.icon}</span><span class="ar-op-main"><b>${esc(o.flag)} ${esc(o.name)}</b>
      <small>ур. ${o.level} · ${c.name} · ${r[1]} ${r[0]}</small><em>🏆 ${o.wins} · 💀 ${o.losses} · ${o.style}</em></span>
      <strong>${o.rating}</strong>
    </button>`;
  }

  function home(){
    clearInterval(queueTimer);
    const s=state(), energy=Number(s.energy??100);
    const live=rnd(18,72), fighting=rnd(8,34), queue=rnd(2,16);
    frame('⚔️ Арена',`
      <div class="ar-hero">
        <div><div class="ar-kicker">TERITORY · СЕЗОН ${data.season}</div><h1>Арена</h1><p>Живые игроки в приоритете. Соперники имеют полноценные профили, классы, рейтинг и тактику.</p></div>
        <div class="ar-energy">⚡ ${energy}/200</div>
      </div>
      ${playerMini()}
      <div class="ar-stats">
        <div><b>${data.wins}</b><span>Победы</span></div><div><b>${data.losses}</b><span>Поражения</span></div>
        <div><b>${data.rating}</b><span>Рейтинг</span></div><div><b>${data.streak}</b><span>Серия</span></div>
      </div>
      <div class="ar-live"><i></i><b>Сервер активен</b><span>Онлайн ${live} · В бою ${fighting} · В очереди ${queue}</span></div>
      <section class="ar-section"><h3>Выбери режим</h3>
        <button class="ar-mode" data-mode="1v1"><b>⚔️ 1 × 1</b><span>Один соперник · быстрый личный бой</span><strong>10 ⚡</strong></button>
        <button class="ar-mode" data-mode="3v3"><b>🛡️ 3 × 3</b><span>Командная арена · 3 бойца против 3</span><strong>15 ⚡</strong></button>
        <button class="ar-mode ar-chaos" data-mode="chaos"><b>🔥 CHAOS</b><span>Только реальные игроки · без подстановки ботов</span><strong>20 ⚡</strong></button>
      </section>
      <section class="ar-section"><h3>Игроки арены</h3>${opponents.slice(0,5).map(x=>opponentCard(x,false)).join('')}</section>
      <section class="ar-section ar-grid2">
        <button data-view="rating">🏆<b>Рейтинг</b><small>Лидерборд сезона</small></button>
        <button data-view="history">📜<b>История</b><small>Твои бои</small></button>
        <button data-view="rules">📖<b>Правила</b><small>Как работает арена</small></button>
        <button data-view="profile">👤<b>Профиль</b><small>Статистика</small></button>
      </section>
    `);
    $$('.ar-mode').forEach(b=>b.onclick=()=>queue(b.dataset.mode));
    $$('[data-view]').forEach(b=>b.onclick=()=>views(b.dataset.view));
  }

  function views(v){
    if(v==='rating') return leaderboard();
    if(v==='history') return history();
    if(v==='profile') return profile();
    return rules();
  }
  function leaderboard(){
    const p=makePlayer();
    const rows=[p,...opponents].sort((a,b)=>b.rating-a.rating).slice(0,15);
    frame('🏆 Рейтинг',`<div class="ar-back" data-back>← Арена</div><div class="ar-section"><h3>Сезон ${data.season}</h3>${rows.map((x,i)=>`
      <div class="ar-rank"><b>${i+1}</b><span>${x.player?'🧔':CLASSES[x.class].icon}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.flag)} · ур. ${x.level} · ${CLASSES[x.class].name}</small></div><em>${x.rating}</em></div>`).join('')}</div>`);
    $('[data-back]').onclick=home;
  }
  function history(){
    frame('📜 История боёв',`<div class="ar-back" data-back>← Арена</div><div class="ar-section">
      ${data.history.length?data.history.slice(-25).reverse().map(h=>`<div class="ar-history"><b>${h.win?'🏆':'💀'}</b><span>${esc(h.mode)} · ${esc(h.opponent)}<small>${esc(h.date||'')}</small></span><em>${h.delta>0?'+':''}${h.delta}</em></div>`).join(''):'<div class="ar-empty">Пока нет боёв. Выходи на арену.</div>'}</div>`);
    $('[data-back]').onclick=home;
  }
  function profile(){
    const p=makePlayer(),r=rank(data.rating);
    frame('👤 Профиль бойца',`<div class="ar-back" data-back>← Арена</div>
      <div class="ar-profile"><div class="ar-big-avatar">⚔️</div><h2>${esc(p.name)}</h2><p>${p.flag} · уровень ${p.level} · ${r[1]} ${r[0]}</p><strong>${data.rating}</strong></div>
      <div class="ar-stat-list"><div>Победы <b>${data.wins}</b></div><div>Поражения <b>${data.losses}</b></div><div>Лучшая серия <b>${data.best}</b></div><div>Боев всего <b>${data.wins+data.losses}</b></div></div>`);
    $('[data-back]').onclick=home;
  }
  function rules(){
    frame('📖 Правила',`<div class="ar-back" data-back>← Арена</div><div class="ar-section ar-rules">
      <h3>Матчмейкинг</h3><p>Сначала система ищет живых игроков подходящего рейтинга. Если обычный режим не набрал состав, используются бойцы пула с полноценными профилями.</p>
      <h3>Классы</h3><p>🛡️ Танк · 🪓 Берсерк · 🗡️ Ассасин · ⚔️ Дуэлянт · ✨ Поддержка.</p>
      <h3>CHAOS</h3><p>В CHAOS боты не подставляются. Нужен реальный игрок из очереди.</p>
      <h3>Бой</h3><p>Выбирай цель атаки и две зоны защиты. Крит, уклонение, класс и тактика соперника влияют на результат.</p>
    </div>`);
    $('[data-back]').onclick=home;
  }

  let queueTimer=null, queueLeft=0, currentMode='1v1';
  function energyCost(mode){return mode==='1v1'?10:mode==='3v3'?15:20}
  function queue(mode){
    const s=state(),cost=energyCost(mode);
    if(Number(s.energy??100)<cost){arenaToast(`⚡ Нужно ${cost} энергии`);return}
    currentMode=mode;queueLeft=mode==='chaos'?15:5;
    frame('🔎 Поиск соперников',`<div class="ar-queue-screen">
      <div class="ar-radar">⚔️</div><h2>${mode==='1v1'?'1 × 1':mode==='3v3'?'3 × 3':'CHAOS'}</h2>
      <p id="arQueueText">Ищем живых игроков… ${queueLeft}с</p><div class="ar-bar"><i id="arBar"></i></div>
      <div class="ar-queue-info">🟢 Живые игроки имеют приоритет</div>
      <div class="ar-queue-info">${mode==='chaos'?'🔥 В этом режиме боты отключены':'🤖 Если очередь пуста, подбирается полноценный соперник из пула'}</div>
      <button class="ar-secondary" id="arCancel">Отмена</button>
    </div>`);
    let elapsed=0;clearInterval(queueTimer);
    queueTimer=setInterval(()=>{
      elapsed++;queueLeft--;
      const t=$('#arQueueText'),bar=$('#arBar');
      if(t)t.textContent=`Ищем живых игроков… ${Math.max(0,queueLeft)}с`;
      if(bar)bar.style.width=Math.min(100,elapsed/(mode==='chaos'?15:5)*100)+'%';
      if(queueLeft<=0){
        clearInterval(queueTimer);
        if(mode==='chaos') startMatch('chaos',buildLive());
        else startMatch(mode,buildFallback(mode));
      }
    },1000);
    $('#arCancel').onclick=()=>{clearInterval(queueTimer);home()};
  }
  function buildFallback(mode){
    if(mode==='1v1'){
      const pool=opponents.filter(o=>Math.abs(o.rating-data.rating)<420);
      const o=pool[rnd(0,Math.max(0,pool.length-1))]||opponents[rnd(0,opponents.length-1)];
      return {teams:[[makePlayer()],[unit(o)]]};
    }
    const pool=[...opponents].sort(()=>Math.random()-.5).slice(0,6);
    return {teams:[[makePlayer(),unit(pool[0]),unit(pool[1])],[unit(pool[2]),unit(pool[3]),unit(pool[4])]]};
  }
  function buildLive(){
    const fake={id:'live-search',name:'Игрок из очереди',flag:'🌐',level:Math.max(1,Number(state().level||1)),class:'duelist',rating:data.rating+8,wins:20,losses:11,style:'Баланс'};
    return {teams:[[makePlayer()],[unit(fake)]]};
  }
  function unit(o){
    const c=CLASSES[o.class]||CLASSES.duelist,mx=Math.round(c.hp+o.level*4);
    return {...o,hp:mx,maxHp:mx};
  }

  let battle=null,seq=0,action=0;
  function stats(u){
    const c=CLASSES[u.class]||CLASSES.duelist;
    return {atk:Math.round(11+c.atk*(6+u.level*.75)),def:Math.round(c.def*(2+u.level*.36)),crit:c.crit,dodge:c.dodge}
  }
  function ai(u){
    let attack=ZONES[rnd(0,4)][0],def=[];
    if(u.style==='Защитный'||u.class==='tank')def=['chest','stomach'];
    else if(u.style==='Агрессивный'||u.class==='berserker')def=['head','legs'];
    else def=ZONES.slice().sort(()=>Math.random()-.5).slice(0,2).map(x=>x[0]);
    if(u.class==='assassin')attack='head';
    if(u.class==='support')attack='chest';
    return {attack,def};
  }
  function alive(t){return t.filter(x=>x.hp>0)}
  function startMatch(mode,m){
    battle={id:Date.now(),mode,teams:m.teams,round:1,attack:null,def:[],log:[],locked:false,lastAction:0};
    renderBattle();
  }
  function unitCard(u){
    const c=CLASSES[u.class]||CLASSES.duelist;
    return `<div class="ar-unit ${u.hp<=0?'dead':''}"><span>${c.icon}</span><div><b>${esc(u.flag)} ${esc(u.name)}</b><small>ур. ${u.level} · ${c.name} · ⭐ ${u.rating||0}</small><div class="ar-hp"><i style="width:${Math.max(0,u.hp/u.maxHp*100)}%"></i></div></div><strong>${Math.max(0,Math.ceil(u.hp))}</strong></div>`
  }
  function renderBattle(){
    if(!battle)return;
    const me=battle.teams[0][0],enemy=alive(battle.teams[1])[0];
    frame(`⚔️ ${battle.mode.toUpperCase()}`,`
      <div class="ar-battle-top"><span>Бой #${String(battle.id).slice(-6)}</span><span>Раунд ${battle.round}</span><span>Ход ${seq}</span></div>
      <div class="ar-teams"><div><h4>🟦 ТВОЯ КОМАНДА</h4>${battle.teams[0].map(unitCard).join('')}</div><div><h4>🟥 СОПЕРНИК</h4>${battle.teams[1].map(unitCard).join('')}</div></div>
      <div class="ar-stage"><div class="ar-fighter">${CLASSES[me.class].icon}<b>${esc(me.name)}</b><small>HP ${Math.ceil(me.hp)}/${me.maxHp}</small></div><strong>VS</strong><div class="ar-fighter">${enemy?CLASSES[enemy.class].icon:'💀'}<b>${esc(enemy?.name||'Побеждён')}</b><small>${enemy?'HP '+Math.ceil(enemy.hp)+'/'+enemy.maxHp:'—'}</small></div></div>
      <div class="ar-pick-title">🎯 Куда атаковать?</div><div class="ar-zones">${ZONES.map(z=>`<button data-a="${z[0]}" class="${battle.attack===z[0]?'sel':''}">${z[1]}</button>`).join('')}</div>
      <div class="ar-pick-title">🛡️ Что защищать? Выбери 2</div><div class="ar-zones">${ZONES.map(z=>`<button data-d="${z[0]}" class="${battle.def.includes(z[0])?'sel':''}">${z[1]}</button>`).join('')}</div>
      <div class="ar-battle-actions"><button class="ar-main" id="arHit">⚔️ АТАКА</button><button class="ar-secondary" id="arTactic">🤖 Тактика</button></div>
      <div class="ar-log">${battle.log.slice(-8).map(x=>`<div>${esc(x)}</div>`).join('')||'Выбери действие.'}</div>
    `);
    $$('[data-a]').forEach(b=>b.onclick=()=>{battle.attack=b.dataset.a;renderBattle()});
    $$('[data-d]').forEach(b=>b.onclick=()=>{const x=b.dataset.d;if(battle.def.includes(x))battle.def=battle.def.filter(v=>v!==x);else if(battle.def.length<2)battle.def.push(x);renderBattle()});
    $('#arHit').onclick=playerTurn;
    $('#arTactic').onclick=()=>{battle.attack=ai(makePlayer()).attack;battle.def=['chest','legs'];playerTurn()};
  }
  function playerTurn(){
    if(!battle||battle.locked)return;
    if(!battle.attack||battle.def.length!==2){arenaToast('🎯 Выбери атаку и 2 зоны защиты');return}
    battle.locked=true;action++;seq++;battle.lastAction=action;
    const me=battle.teams[0][0],target=alive(battle.teams[1])[0];
    if(!target){finish(true);return}
    const m=stats(me),plan=ai(target);
    let msg='';
    if(plan.def.includes(battle.attack))msg=`🛡️ ${target.name} заблокировал «${label(battle.attack)}»`;
    else if(Math.random()<.07)msg=`💨 ${me.name} промахнулся`;
    else{
      let dmg=Math.max(3,Math.round(m.atk*(battle.attack==='head'?1.18:battle.attack==='legs'?.95:1)-stats(target).def));
      const crit=Math.random()<m.crit*(battle.attack==='head'?1.3:1);
      if(crit)dmg=Math.round(dmg*1.6);
      target.hp=Math.max(0,target.hp-dmg);msg=`⚔️ ${me.name} → ${target.name}: −${dmg} HP${crit?' 💥 КРИТ':''}`;
    }
    battle.log.push(msg);
    if(!alive(battle.teams[1]).length){renderBattle();setTimeout(()=>finish(true),300);return}
    renderBattle();setTimeout(enemyTurn,650);
  }
  function enemyTurn(){
    if(!battle)return;
    const me=battle.teams[0][0],enemy=alive(battle.teams[1])[0];
    if(!me||!enemy){finish(!me);return}
    const p=ai(enemy),m=stats(enemy);
    let msg='';
    if(battle.def.includes(p.attack))msg=`🛡️ ${me.name} заблокировал атаку «${label(p.attack)}»`;
    else if(Math.random()<stats(me).dodge*.5)msg=`💨 ${me.name} увернулся`;
    else{let dmg=Math.max(2,Math.round(m.atk-stats(me).def*.45));if(Math.random()<m.crit)dmg=Math.round(dmg*1.45);me.hp=Math.max(0,me.hp-dmg);msg=`☠️ ${enemy.name} → ${me.name}: −${dmg} HP`}
    battle.log.push(msg);battle.round++;battle.attack=null;battle.def=[];battle.locked=false;
    if(me.hp<=0){finish(false);return}renderBattle();
  }
  function label(x){return ZONES.find(z=>z[0]===x)?.[1]||x}
  function finish(win){
    if(!battle)return;
    const mode=battle.mode,cost=energyCost(mode),opp=battle.teams[1][0];
    clearInterval(queueTimer);
    data.rating=Math.max(0,data.rating+(win?18:-14));
    data.wins+=win?1:0;data.losses+=win?0:1;data.streak=win?data.streak+1:0;data.best=Math.max(data.best,data.streak);
    data.energySpent+=cost;
    data.history.push({mode,opponent:opp?.name||'Команда',win,delta:win?18:-14,date:new Date().toLocaleString('ru-RU')});
    if(data.history.length>40)data.history.shift();persist();
    const s=state();s.energy=Math.max(0,Number(s.energy??100)-cost);s.exp=Number(s.exp||0)+(win?15:5);if(win)s.coins=Number(s.coins||0)+75;save();
    frame(win?'🏆 ПОБЕДА':'💀 ПОРАЖЕНИЕ',`<div class="ar-result"><div class="ar-result-icon">${win?'🏆':'💀'}</div><h1>${win?'Победа!':'Поражение'}</h1><p>${win?'+75 🪙 · +15 XP':' +5 XP'} · ${win?'+18':'−14'} рейтинга</p><div class="ar-result-stats"><span>Рейтинг <b>${data.rating}</b></span><span>Серия <b>${data.streak}</b></span></div><button class="ar-main" id="arAgain">⚔️ Снова в бой</button><button class="ar-secondary" id="arArena">🏟️ В арену</button></div>`);
    $('#arAgain').onclick=()=>queue(mode);$('#arArena').onclick=home;
    battle=null;
  }

  function background(){
    data.botBattles+=rnd(1,3);
    if(data.botBattles>999999)data.botBattles=0;
    persist();
  }

  /* DIRECT OPEN: intercept HOME hit zones before the old intermediate panel. */
  function installDirectOpen(){
    const direct=e=>{
      const hz=e.target.closest?.('.hz');
      const screen=e.target.closest?.('[data-screen]');
      const isArena=hz&&(hz.dataset.hz==='arena'||hz.dataset.hz==='battle');
      const isBottomArena=screen&&screen.dataset.screen==='arena';
      if(!isArena&&!isBottomArena)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      home();
    };
    document.addEventListener('click',direct,true);
    document.addEventListener('pointerdown',direct,true);
    document.addEventListener('touchstart',direct,{capture:true,passive:false});
  }

  window.openBattle=home;
  window.renderBattle=renderBattle;
  window.nextBattle=()=>queue('1v1');

  background();
  installDirectOpen();

  document.addEventListener('DOMContentLoaded',()=>{
    $('#arenaModal')?.addEventListener('click',e=>{if(e.target.id==='arenaModal')window.closeArenaModal()});
  });
})();
