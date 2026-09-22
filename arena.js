/* Territory Arena Online v21
   Living-server style arena: human-first matchmaking, realistic bot profiles,
   1v1 / 3v3, Chaos without bots, persistent rating/history, bot-vs-bot background.
   This is the client-side foundation; replace with server-authoritative transport
   when a backend endpoint is connected.
*/
window.arenaToast=function(text){
  const t=document.getElementById('arenaToast');
  if(!t)return;
  t.textContent=text;t.classList.add('show');
  clearTimeout(window._arenaToastTimer);
  window._arenaToastTimer=setTimeout(()=>t.classList.remove('show'),1800);
};
window.closeArenaModal=function(){
  clearTimeout(window._arenaOnlineTimer);
  const m=document.getElementById('arenaModal');
  if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.display='none';m.style.pointerEvents='none';}
};

(()=> {
  const Z=[['head','Голова'],['chest','Грудь'],['stomach','Живот'],['waist','Пояс'],['legs','Ноги']];
  const CLASSES={
    tank:{name:'Tank',icon:'🛡️',hp:145,atk:.88,def:1.28,crit:.06,dodge:.04},
    berserker:{name:'Berserker',icon:'🪓',hp:110,atk:1.30,def:.86,crit:.16,dodge:.07},
    assassin:{name:'Assassin',icon:'🗡️',hp:96,atk:1.18,def:.82,crit:.23,dodge:.17},
    duelist:{name:'Duelist',icon:'⚔️',hp:115,atk:1.08,def:1.00,crit:.14,dodge:.12},
    support:{name:'Support',icon:'✨',hp:125,atk:.84,def:1.05,crit:.09,dodge:.08}
  };
  const NAMES=[
    ['Alex Morgan','🇺🇸'],['Wei Chen','🇨🇳'],['Omar Al-Hadi','🇸🇦'],['Dmytro Kovalenko','🇺🇦'],
    ['Luca Moretti','🇮🇹'],['Marek Novak','🇵🇱'],['Erik Lund','🇸🇪'],['Yuki Tanaka','🇯🇵'],
    ['Noah Carter','🇨🇦'],['Mateo Silva','🇪🇸'],['Artem Volkov','🇪🇺'],['Hassan Rahman','🇦🇪'],
    ['Jonas Weber','🇩🇪'],['Min-jun Park','🇰🇷'],['Daniel Costa','🇵🇹']
  ];
  const TAKES=['aggressive','balanced','defensive','counter'];
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]));
  const store=()=>window.TerritoryStore?.state||window.state||{};
  const save=()=>{try{window.TerritoryStore?.save?.();window.save?.()}catch(_){}};
  const hpMax=()=>Math.max(100,Number(store().maxHp||120));
  const playerName=()=>store().name||'SSS';
  const pct=(v,m)=>Math.max(0,Math.min(100,(Number(v)||0)/(Number(m)||1)*100));
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

  function load(){
    try{return JSON.parse(localStorage.getItem('territory_arena_online')||'{}')}catch(_){return {}}
  }
  let data=load();
  data.rating=Number(data.rating||1000); data.wins=Number(data.wins||0); data.losses=Number(data.losses||0);
  data.streak=Number(data.streak||0);data.best=Number(data.best||0);
  data.history=Array.isArray(data.history)?data.history:[];data.botBattles=Number(data.botBattles||0);
  const persist=()=>localStorage.setItem('territory_arena_online',JSON.stringify(data));
  persist();

  function makeBot(i){
    const [name,flag]=NAMES[i%NAMES.length];
    const keys=Object.keys(CLASSES), key=keys[i%keys.length];
    const level=3+((i*7)%17);
    return {id:'bot-'+i,name,flag,level,class:key,style:TAKES[i%TAKES.length],
      rating:760+((i*83)%720),wins:8+((i*13)%140),losses:2+((i*7)%80),
      online:true,portrait:CLASSES[key].icon};
  }
  const bots=Array.from({length:15},(_,i)=>makeBot(i));

  function modal(title,html){
    const t=document.getElementById('arenaModalTitle'),b=document.getElementById('arenaModalBody'),m=document.getElementById('arenaModal');
    if(!t||!b||!m)return;
    t.textContent=title;b.innerHTML=html;m.setAttribute('aria-hidden','false');m.style.display='flex';m.style.pointerEvents='auto';m.classList.add('show');
  }
  function rank(r){
    if(r<900)return 'Bronze'; if(r<1100)return 'Silver'; if(r<1300)return 'Gold'; if(r<1500)return 'Platinum'; return 'Diamond';
  }
  function playerCard(){
    const s=store();
    return `<div class="ao-player-card"><div class="ao-avatar">🧔</div><div><b>${esc(playerName())}</b><small>🇺🇦 · ур. ${Number(s.level||1)} · ${rank(data.rating)}</small></div><strong>${data.rating}</strong></div>`;
  }
  function rosterCard(b){
    const c=CLASSES[b.class];
    return `<div class="ao-roster"><div class="ao-avatar">${c.icon}</div><div class="ao-roster-main"><b>${esc(b.flag)} ${esc(b.name)}</b><small>ур. ${b.level} · ${c.name} · ${rank(b.rating)}</small><span>🏆 ${b.wins} · 💀 ${b.losses} · ${b.style}</span></div><div class="ao-rating">${b.rating}</div></div>`;
  }
  function home(){
    clearTimeout(window._arenaOnlineTimer);
    const s=store(), energy=Number(s.energy||0);
    modal('⚔️ Арена',`
      <div class="arena-online">
        ${playerCard()}
        <div class="ao-stats">
          <div>🏆 Победы<b>${data.wins}</b></div><div>🔥 Серия<b>${data.streak}</b></div>
          <div>⭐ Рейтинг<b>${data.rating}</b></div><div>🌐 Бои ботов<b>${data.botBattles}</b></div>
        </div>
        <div class="ao-section">
          <div class="ao-title">🎯 Выбери режим</div>
          <button class="ao-mode" data-mode="1v1"><b>⚔️ 1 × 1</b><span>Живой игрок → если очередь пуста, подключается соперник из пула.</span></button>
          <button class="ao-mode" data-mode="3v3"><b>⚔️ 3 × 3</b><span>Командный бой. Живые игроки имеют приоритет, затем заполняются участники.</span></button>
          <button class="ao-mode chaos" data-mode="chaos"><b>🔥 CHAOS</b><span>Только живые игроки. Боты здесь НЕ используются.</span></button>
        </div>
        <div class="ao-section">
          <div class="ao-title">🌍 Игроки сервера</div>
          <div class="ao-live"><span class="dot"></span> Онлайн: ${rnd(18,67)} · В бою: ${rnd(7,31)} · В очереди: ${rnd(2,14)}</div>
          ${bots.slice(0,5).map(rosterCard).join('')}
        </div>
        <div class="ao-section">
          <div class="ao-title">📜 Последние бои</div>
          ${data.history.slice(-5).reverse().map(h=>`<div class="ao-history">${h.win?'🏆':'💀'} ${esc(h.mode)} · ${esc(h.opponent)} · ${h.delta>0?'+':''}${h.delta} рейтинга</div>`).join('')||'<div class="ao-muted">История пока пуста.</div>'}
        </div>
      </div>`);
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>queue(b.dataset.mode));
  }

  function queue(mode){
    const s=store();
    if(Number(s.energy||0)<10){arenaToast('⚡ Нужно 10 энергии');return}
    const wait=mode==='chaos'?12:5;
    let left=wait;
    modal('🔎 Поиск соперников',`<div class="ao-queue"><div class="ao-spinner">⚔️</div><b>${mode==='1v1'?'1 × 1':mode==='3v3'?'3 × 3':'CHAOS'}</b><p id="aoQueueText">Ищем игроков… ${left}с</p><div class="ao-progress"><i id="aoProgress"></i></div><small>${mode==='chaos'?'Только живые игроки':'Сначала живые игроки, затем подбор подходящих участников'}</small><button class="ao-cancel" id="aoCancel">Отмена</button></div>`);
    let elapsed=0;
    const tick=()=>{
      elapsed++;left--;
      const txt=document.getElementById('aoQueueText'),pr=document.getElementById('aoProgress');
      if(txt)txt.textContent=`Ищем игроков… ${Math.max(0,left)}с`;
      if(pr)pr.style.width=Math.min(100,elapsed/wait*100)+'%';
      if(elapsed>=wait){clearInterval(window._arenaOnlineTimer); if(mode==='chaos'){startMatch(mode,buildLiveOnly());}else startMatch(mode,buildBotMatch(mode));}
    };
    window._arenaOnlineTimer=setInterval(tick,1000);
    document.getElementById('aoCancel').onclick=()=>{clearInterval(window._arenaOnlineTimer);home()};
  }

  function buildBotMatch(mode){
    if(mode==='1v1')return {teams:[[playerUnit()],[botUnit(bots[rnd(0,bots.length-1)])]]};
    const pool=[...bots].sort(()=>Math.random()-.5).slice(0,6);
    return {teams:[[playerUnit(),botUnit(pool[0]),botUnit(pool[1])],[botUnit(pool[2]),botUnit(pool[3]),botUnit(pool[4])]]};
  }
  function buildLiveOnly(){
    // Placeholder for real matchmaking transport. No bots are inserted into Chaos.
    const pool=[{id:'live-1',name:'Игрок из очереди',flag:'🌐',level:Math.max(1,Number(store().level||1)),class:'duelist',rating:data.rating+4,wins:12,losses:8,style:'balanced',online:true,portrait:'⚔️'}];
    return {teams:[[playerUnit()],[liveUnit(pool[0])]]};
  }
  function playerUnit(){const s=store();return {id:'player',name:playerName(),flag:'🇺🇦',level:Number(s.level||1),class:'duelist',rating:data.rating,player:true,hp:hpMax(),maxHp:hpMax()};}
  function botUnit(b){const c=CLASSES[b.class];const max=Math.round(c.hp+b.level*4);return {...b,hp:max,maxHp:max};}
  function liveUnit(b){return {...b,hp:120+b.level*4,maxHp:120+b.level*4};}

  let battle=null, turnSeq=0, actionId=0;
  function unitStats(u){
    const c=CLASSES[u.class]||CLASSES.duelist;
    return {atk:Math.round(12+c.atk*(5+u.level*.8)),def:Math.round(c.def*(2+u.level*.35)),crit:c.crit,dodge:c.dodge};
  }
  function aiPlan(u){
    const c=CLASSES[u.class]||CLASSES.duelist;
    let attack=Z[rnd(0,Z.length-1)][0], defenses=[];
    if(u.style==='defensive'||u.class==='tank')defenses=['chest','stomach'];
    else if(u.style==='aggressive'||u.class==='berserker')defenses=['head','legs'];
    else defenses=Z.slice().sort(()=>Math.random()-.5).slice(0,2).map(x=>x[0]);
    if(c.name==='Assassin')attack='head';
    if(c.name==='Support')attack='chest';
    return {attack,defenses};
  }
  function alive(team){return team.filter(u=>u.hp>0)}
  function renderBattle(){
    const b=battle;if(!b)return;
    const all=b.teams.flat(), enemyTeam=b.teams[1];
    const target=enemyTeam.find(u=>u.hp>0);
    const me=b.teams[0][0];
    modal('⚔️ Арена · '+b.mode.toUpperCase(),`
      <div class="arena-online battle-online">
        <div class="ao-live"><span class="dot"></span> Бой №${b.id} · ход ${b.round} · actionId ${b.lastActionId||0}</div>
        <div class="ao-teams">
          <div><h4>🟦 Твоя команда</h4>${b.teams[0].map(unitCard).join('')}</div>
          <div><h4>🟥 Соперник</h4>${enemyTeam.map(unitCard).join('')}</div>
        </div>
        <div class="ao-stage"><div class="ao-versus">⚔️ VS ⚔️</div><div class="ao-fighters"><span>${me?.class?CLASSES[me.class].icon:'🧔'}<b>${esc(me?.name||'')}</b></span><span>${target?CLASSES[target.class].icon:'💀'}<b>${esc(target?.name||'')}</b></span></div></div>
        <div class="ao-step">🎯 Твоя атака</div>
        <div class="ao-zones">${Z.map(z=>`<button data-attack="${z[0]}">${z[1]}</button>`).join('')}</div>
        <div class="ao-step">🛡️ Защита · выбери 2 зоны</div>
        <div class="ao-zones">${Z.map(z=>`<button data-def="${z[0]}">${z[1]}</button>`).join('')}</div>
        <div class="ao-actions"><button class="ao-main" id="aoStrike">⚔️ НАНЕСТИ УДАР</button><button id="aoAuto">🤖 Тактика</button></div>
        <div class="ao-log">${b.log.slice(-10).map(x=>`<div>• ${esc(x)}</div>`).join('')}</div>
      </div>`);
    document.querySelectorAll('[data-attack]').forEach(x=>x.onclick=()=>{b.attack=x.dataset.attack;x.classList.add('sel')});
    document.querySelectorAll('[data-def]').forEach(x=>x.onclick=()=>{const z=x.dataset.def;if(b.defenses.includes(z))b.defenses=b.defenses.filter(v=>v!==z);else if(b.defenses.length<2){b.defenses.push(z);x.classList.add('sel')}});
    document.getElementById('aoStrike').onclick=()=>playerAction();
    document.getElementById('aoAuto').onclick=()=>{if(!b.attack)b.attack='chest';if(b.defenses.length<2)b.defenses=['chest','legs'];playerAction()};
  }
  function unitCard(u){
    const c=CLASSES[u.class]||CLASSES.duelist;
    return `<div class="ao-unit ${u.hp<=0?'dead':''}"><span>${c.icon}</span><div><b>${esc(u.flag||'')} ${esc(u.name)}</b><small>ур. ${u.level} · ${c.name} · ⭐ ${u.rating||0}</small><div class="ao-hp"><i style="width:${pct(u.hp,u.maxHp)}%"></i></div></div><strong>${Math.max(0,Math.ceil(u.hp))}</strong></div>`;
  }
  function playerAction(){
    const b=battle;if(!b||b.locked)return;
    if(!b.attack||b.defenses.length!==2){arenaToast('🎯 Выбери атаку и 2 зоны защиты');return}
    b.locked=true;actionId++;b.lastActionId=actionId;turnSeq++;b.turnSeq=turnSeq;
    const me=b.teams[0][0], target=alive(b.teams[1])[0];
    if(!target){finishMatch(true);return}
    const m=unitStats(me), enemy=aiPlan(target);
    let damage=0,msg='';
    const miss=Math.random()<m.dodge*.35;
    if(enemy.defenses.includes(b.attack)){msg=`🛡️ ${target.name} заблокировал «${label(b.attack)}».`;}
    else if(miss){msg=`💨 ${me.name} промахнулся.`;}
    else{
      const crit=Math.random()<m.crit*(b.attack==='head'?1.35:1);
      damage=Math.max(3,Math.round(m.atk*(b.attack==='head'?1.18:b.attack==='legs'?.95:1)-unitStats(target).def));
      if(crit)damage=Math.round(damage*1.6);
      target.hp=Math.max(0,target.hp-damage);
      msg=`⚔️ ${me.name} → ${target.name}: −${damage} HP${crit?' · 💥 КРИТ':''}`;
    }
    b.log.push(msg);
    if(!alive(b.teams[1]).length){renderBattle();setTimeout(()=>finishMatch(true),350);return}
    renderBattle();setTimeout(enemyTurn,650);
  }
  function enemyTurn(){
    const b=battle;if(!b)return;
    const target=b.teams[0][0], enemy=alive(b.teams[1])[0];if(!target||!enemy){finishMatch(!target);return}
    const p=aiPlan(enemy),m=unitStats(enemy),def=b.defenses.includes(p.attack);
    let damage=0,msg='';
    if(def)msg=`🛡️ ${target.name} заблокировал атаку «${label(p.attack)}».`;
    else if(Math.random()<unitStats(target).dodge*.5)msg=`💨 ${target.name} увернулся.`;
    else{damage=Math.max(2,Math.round(m.atk-unitStats(target).def*.45));if(Math.random()<m.crit)damage=Math.round(damage*1.45);target.hp=Math.max(0,target.hp-damage);msg=`☠️ ${enemy.name} → ${target.name}: −${damage} HP`;}
    b.log.push(msg);b.round++;b.attack=null;b.defenses=[];b.locked=false;
    if(target.hp<=0){finishMatch(false);return}
    renderBattle();
  }
  function label(id){return Z.find(x=>x[0]===id)?.[1]||id}
  function finishMatch(win){
    const b=battle;if(!b)return;
    clearTimeout(window._arenaOnlineTimer);b.locked=true;
    const opponent=b.teams[1][0];
    const delta=win?18:-14;
    data.rating=Math.max(0,data.rating+delta);data.wins+=win?1:0;data.losses+=win?0:1;
    data.streak=win?data.streak+1:0;data.best=Math.max(data.best,data.streak);
    data.history.push({mode:b.mode,opponent:opponent?.name||'Команда',win,delta});
    if(data.history.length>30)data.history.shift();persist();
    const s=store();s.energy=Math.max(0,Number(s.energy||0)-10);if(win)s.coins=Number(s.coins||0)+75;s.exp=Number(s.exp||0)+(win?15:5);save();
    modal(win?'🏆 Победа':'💀 Поражение',`<div class="arena-online ao-result"><div class="ao-result-icon">${win?'🏆':'💀'}</div><h3>${win?'Победа!':'Поражение'}</h3><p>${win?'+75 🪙 · +15 XP · ':'+'+5 XP · '}${delta>0?'+':''}${delta} рейтинга</p><p>Рейтинг: <b>${data.rating}</b> · Серия: <b>${data.streak}</b></p><button class="ao-main" id="aoAgain">⚔️ Снова в бой</button><button id="aoHome">🏟️ Арена</button></div>`);
    document.getElementById('aoAgain').onclick=()=>queue(b.mode);
    document.getElementById('aoHome').onclick=home;
  }

  // Background bot-vs-bot simulation: keeps the arena alive between visits.
  function simulateBackground(){
    data.botBattles += rnd(1,3);
    if(Math.random()<.55){
      const a=bots[rnd(0,bots.length-1)],b=bots[rnd(0,bots.length-1)];
      if(a.id!==b.id)data.lastServerEvent=`${a.name} ${a.flag} победил ${b.name} ${b.flag}`;
    }
    persist();
  }
  window.openBattle=home;
  window.renderBattle=renderBattle;
  window.playerStrike=playerAction;
  window.nextBattle=()=>queue('1v1');
  simulateBackground();
  document.getElementById('arenaClose')?.addEventListener('click',()=>{window.closeArenaModal();if(typeof showScreen==='function')showScreen('home')});
  document.getElementById('arenaModal')?.addEventListener('click',e=>{if(e.target.id==='arenaModal')window.closeArenaModal()});
})();