/* Territory v144 — Arena rebuilt from the video reference + agreed Territory rules.
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
  const getStats=()=>{try{return JSON.parse(localStorage.getItem('territory_arena_v144')||'{}')}catch(e){return {}}};
  let stats=getStats();
  stats.wins=Number(stats.wins||0); stats.losses=Number(stats.losses||0); stats.battles=Number(stats.battles||0);
  stats.history=Array.isArray(stats.history)?stats.history:[];
  let lobby=null;
  let battle=null;
  let lobbyTimer=null;
  let battleTimer=null;
  let autoTimer=null;
  let modalOpen=false;

  const modal=()=>document.getElementById('arenaModal');
  const title=()=>document.getElementById('arenaModalTitle');
  const body=()=>document.getElementById('arenaModalBody');
  function showModal(t,html){const m=modal();if(!m||!body())return; title().textContent=t;body().innerHTML=html;m.classList.add('show');m.setAttribute('aria-hidden','false');modalOpen=true;}
  function close(){clearInterval(lobbyTimer);clearInterval(battleTimer);clearTimeout(autoTimer);const m=modal();if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}modalOpen=false;lobby=null;battle=null;}
  window.closeArenaModal=close;
  window.arenaToast=(text)=>{const t=document.getElementById('arenaToast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(window.__arenaToast);window.__arenaToast=setTimeout(()=>t.classList.remove('show'),1600)};

  function name(){return String(getState().name||'Alex').trim()||'Alex'}
  function level(){return Number(getState().level||1)}
  function hasVIP(){const s=getState(); return s.vip===true || s.vip===1 || s.vip==='true' || Number(s.vipUntil||0)>Date.now()}
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
    const mode=MODE.find(x=>x.id===lobby.mode)||MODE[0];
    if(lobby.mode==='chaos'){
      const shuffled=[...lobby.players].sort(()=>Math.random()-.5);
      shuffled.forEach((p,i)=>p.team=(i%2)+1);
      lobby.players=shuffled;
    }
    battle={mode:lobby.mode,round:1,playerHp:Number(getState().hp||120),maxHp:Number(getState().maxHp||120),enemyHp:120,maxEnemyHp:120,attack:null,defense:[],autoBattle:false,log:[`⚔️ ${mode.title}: бой начался.`,`👥 В комнате ${lobby.players.length} игроков.`,...(lobby.mode==='chaos'?[`🎲 Команды распределены случайно: ${lobby.players.filter(p=>p.team===1).length} × ${lobby.players.filter(p=>p.team===2).length}.`]:[])],startedAt:Date.now(),endsAt:Date.now()+600000,ended:false};
    renderBattle();
  }
  function zone(id,list){return list.find(z=>z[0]===id)?.[1]||id}
  function renderBattle(){
    clearInterval(battleTimer);if(!battle)return;
    const remain=Math.max(0,battle.endsAt-Date.now()),mm=String(Math.floor(remain/60000)).padStart(2,'0'),ss=String(Math.floor(remain/1000)%60).padStart(2,'0');
    const hp1=Math.max(0,Math.round(battle.playerHp/battle.maxHp*100)),hp2=Math.max(0,Math.round(battle.enemyHp/battle.maxEnemyHp*100));
    const attacks=ATTACK_ZONES.map(z=>`<button class="arena140-zone ${battle.attack===z[0]?'selected':''}" data-a="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
    const defs=DEF_ZONES.map(z=>`<button class="arena140-zone ${battle.defense.includes(z[0])?'selected defense':''}" data-d="${z[0]}"><i>${z[2]}</i><span>${z[1]}</span></button>`).join('');
    const logs=battle.log.slice(-10).map(x=>`<div>${esc(x)}</div>`).join('');
    showModal('⚔️ Arena · бой',`<div class="arena140 arena140-combat">
      <section class="arena140-fighters"><div class="arena140-fighter"><div class="big-avatar">🧔</div><b>${esc(name())}</b><small>ур. ${level()}</small><div class="arena140-hp"><i style="width:${hp1}%"></i></div><span>${Math.round(battle.playerHp)} / ${battle.maxHp} HP</span></div><div class="arena140-vs">VS</div><div class="arena140-fighter enemy"><div class="big-avatar">⚔️</div><b>${lobby?.mode==='group'?'Команда противника':'Противник'}</b><small>отряд</small><div class="arena140-hp"><i style="width:${hp2}%"></i></div><span>${Math.round(battle.enemyHp)} / ${battle.maxEnemyHp} HP</span></div></section>
      <section class="arena140-combat-top"><span>Раунд <b>${battle.round}</b></span><span>⏱️ <b>${mm}:${ss}</b></span><span>👥 ${lobby?.players.length||2}</span></section>
      <section class="arena140-select"><div class="arena140-step"><b>1. Атака</b><small>Выбери одну из 4 зон</small></div><div class="arena140-zones">${attacks}</div><div class="arena140-step"><b>2. Защита</b><small>Выбери две из 4 зон</small></div><div class="arena140-zones">${defs}</div><button class="arena140-hit" data-hit ${battle.attack&&battle.defense.length===2?'':'disabled'}>⚔️ ПОДТВЕРДИТЬ ХОД</button><label class="arena140-autobattle ${hasVIP()?'':'vip-locked'}"><input type="checkbox" data-autobattle ${battle.autoBattle?'checked':''} ${hasVIP()?'':'disabled'}><span class="arena140-check"></span><span>Автобой</span>${hasVIP()?'':'<em>VIP</em>'}</label></section>
      <section class="arena140-log"><div class="arena140-log-head"><b>Боевой журнал</b><button data-collapse>Свернуть</button></div><div class="arena140-log-body">${logs}</div></section>
      <section class="arena140-finish"><button data-finish>Завершить бой</button><button data-extend>Продлить +5 мин</button></section>
    </div>`);
    body().querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{battle.attack=b.dataset.a;renderBattle()});
    body().querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const z=b.dataset.d;if(battle.defense.includes(z))battle.defense=battle.defense.filter(x=>x!==z);else if(battle.defense.length<2)battle.defense.push(z);else window.arenaToast('Можно закрыть только 2 зоны');renderBattle()});
    body().querySelector('[data-hit]')?.addEventListener('click',resolveTurn);
    body().querySelector('[data-finish]')?.addEventListener('click',()=>finishBattle('Игрок завершил бой'));
    body().querySelector('[data-extend]')?.addEventListener('click',()=>{battle.endsAt+=300000;window.arenaToast('Бой продлён на 5 минут');renderBattle()});
    body().querySelector('[data-collapse]')?.addEventListener('click',e=>{const x=body().querySelector('.arena140-log-body');x.classList.toggle('collapsed');e.target.textContent=x.classList.contains('collapsed')?'Развернуть':'Свернуть'});
    body().querySelector('[data-autobattle]')?.addEventListener('change',e=>{if(!hasVIP()){e.target.checked=false;battle.autoBattle=false;window.arenaToast('Автобой доступен только игрокам с VIP');return}battle.autoBattle=e.target.checked;window.arenaToast(battle.autoBattle?'Автобой включён':'Автобой выключен');renderBattle()});
    clearTimeout(autoTimer);
    if(battle.autoBattle){
      autoTimer=setTimeout(()=>{
        if(!battle||battle.ended||!battle.autoBattle)return;
        if(!battle.attack) battle.attack=ATTACK_ZONES[Math.floor(Math.random()*ATTACK_ZONES.length)][0];
        while(battle.defense.length<2){
          const z=DEF_ZONES[Math.floor(Math.random()*DEF_ZONES.length)][0];
          if(!battle.defense.includes(z)) battle.defense.push(z);
        }
        resolveTurn();
      },650);
    }
    battleTimer=setInterval(()=>{if(!battle)return;if(Date.now()>=battle.endsAt)finishBattle('Время боя истекло');else renderBattle()},1000);
  }
  function resolveTurn(){
    if(!battle||!battle.attack||battle.defense.length!==2)return;
    const s=getState();
    const atk=Number(s.bonusDamage||0)+Number(s.strength||5)+10;
    const hit=Math.max(8,Math.round(atk*(0.9+Math.random()*.35)));
    const enemyAttack=ATTACK_ZONES[Math.floor(Math.random()*ATTACK_ZONES.length)][0];
    const enemyBlocked=battle.defense.includes(enemyAttack);
    battle.enemyHp=Math.max(0,battle.enemyHp-hit);
    battle.log.push(`⚔️ Атака в «${zone(battle.attack,ATTACK_ZONES)}» нанесла −${hit} HP.`);
    if(battle.enemyHp<=0){renderBattle();setTimeout(()=>finishBattle('Победа'),350);return}
    if(enemyBlocked){battle.log.push(`🛡️ Защита закрыла «${zone(enemyAttack,DEF_ZONES)}». Урон остановлен.`)}
    else{const dmg=Math.max(5,Math.round(10+Math.random()*12));battle.playerHp=Math.max(0,battle.playerHp-dmg);battle.log.push(`💥 Противник атаковал «${zone(enemyAttack,ATTACK_ZONES)}»: −${dmg} HP.`)}
    battle.round++;
    battle.attack=null;battle.defense=[];
    if(battle.playerHp<=0){renderBattle();setTimeout(()=>finishBattle('Поражение'),350);return}
    renderBattle();
  }
  function finishBattle(result){
    if(!battle||battle.ended)return;
    battle.ended=true;clearInterval(battleTimer);clearTimeout(autoTimer);
    const win=result==='Победа';stats.battles++;if(win)stats.wins++;else if(result==='Поражение')stats.losses++;
    stats.history.push({mode:MODE.find(x=>x.id===battle.mode)?.title||'Бой',win,result,at:Date.now()});stats.history=stats.history.slice(-20);
    localStorage.setItem('territory_arena_v144',JSON.stringify(stats));
    if(win){const s=getState();s.coins=Number(s.coins||0)+50;s.exp=Number(s.exp||0)+15;save()}
    lobby=null;battle=null;renderResult(result);
  }
  function renderResult(result){
    const win=result==='Победа';
    showModal(win?'🏆 Победа':'⚔️ Бой завершён',`<div class="arena140 arena140-result"><div class="result-icon">${win?'🏆':'⚔️'}</div><h2>${esc(result)}</h2><p>Бой завершён. Результат сохранён в истории Arena.</p>${win?'<div class="arena140-reward">+50 🪙 &nbsp; +15 XP</div>':''}<button class="arena140-primary" data-back>Вернуться в Arena</button></div>`);
    body().querySelector('[data-back]').onclick=renderHome;
  }
  window.openBattle=renderHome;
  window.openArena=renderHome;
  document.addEventListener('click',e=>{if(e.target.closest('[data-arena-close]'))close()});
  const m=modal();if(m)m.addEventListener('click',e=>{if(e.target===m)close()});
})();
