/* Territory Game — Arena: hub, Top, profiles, tactical 1x1, autobattle */
(function(){
  'use strict';

  const S=()=>window.TerritoryStore?.state;
  const save=()=>window.TerritoryStore?.saveNow?.('arena');
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
  const botNames=['Эйрик','Хальвдан','Сигурд','Рагнар','Ивар','Бьёрн'];
  const classes=['duelist','berserker','tank','assassin'];

  let battle=null;
  let selectedProfile=null;

  function ensureRoot(){
    const modal=$('#arenaModal'),body=$('#arenaModalBody');
    return modal&&body?{modal,body}:null;
  }

  function botRoster(){
    const level=Math.max(1,Number(S()?.level)||1);
    return botNames.map((name,i)=>{
      const lvl=Math.max(1,level+i%3-1);
      return {
        id:'arena-bot-'+i,
        name,
        level:lvl,
        class:classes[i%classes.length],
        rating:Math.max(820,1000+(5-i)*42-lvl*2),
        wins:18+i*7,
        losses:6+i*3,
        avatar:['⚔️','🪓','🛡️','🏹','🗡️','🔱'][i],
        power:38+lvl*4+i*3,
        isBot:true
      };
    });
  }

  function humanProfile(){
    const s=S()||{};
    return {
      id:'player',
      name:String(s.profile?.displayName||s.name||'Игрок'),
      level:Math.max(1,Number(s.level)||1),
      rating:Math.max(0,Number(s.arena?.rating)||1000),
      wins:Math.max(0,Number(s.arena?.wins)||0),
      losses:Math.max(0,Number(s.arena?.losses)||0),
      avatar:'⚔️',
      class:'duelist',
      power:Math.max(1,Math.floor((Number(s.strength)||5)+(Number(s.agility)||5)+(Number(s.defense)||0))),
      isBot:false
    };
  }

  function fighterFromProfile(profile,side){
    const s=S()||{}, ag=Math.max(1,Number(s.agility)||5), max=Math.max(1,Number(s.maxHp)||120);
    if(side==='player'){
      const buff=s.combatBuffs||{};
      return {
        id:'player',name:profile.name,level:profile.level,hp:Math.max(0,Math.min(max,Number(s.hp??max))),maxHp:max,
        attack:Math.max(1,Math.floor((Number(s.strength)||5)+(Number(s.bonusDamage)||0)+(Number(buff.attack)||0))),
        defense:Math.max(0,Number(s.defense)||0)+(Number(buff.defense)||0),
        crit:Math.min(.5,(5+Math.floor(ag*.75))/100),
        dodge:Math.min(.35,(2+Math.floor(ag*.5))/100),
        class:'duelist'
      };
    }
    const lvl=profile.level;
    return {
      id:profile.id,name:profile.name,level:lvl,hp:90+lvl*12,maxHp:90+lvl*12,
      attack:10+lvl*2,defense:2+Math.floor(lvl/2),crit:.08,dodge:.06,
      class:profile.class
    };
  }

  function openHub(){
    const root=ensureRoot(); if(!root)return;
    battle=null; selectedProfile=null;
    root.body.innerHTML=hubMarkup();
    root.modal.classList.add('show');root.modal.setAttribute('aria-hidden','false');
  }

  function hubMarkup(){
    const me=humanProfile(), top=botRoster().sort((a,b)=>b.rating-a.rating);
    return `<div class="arena-hub">
      <div class="arena-hero">
        <div><small>СОРЕВНОВАТЕЛЬНАЯ АРЕНА</small><h1>⚔️ АРЕНА</h1><p>Тактические бои 1×1. Выбирай удар и защиту по зонам.</p></div>
        <div class="arena-rating"><span>РЕЙТИНГ</span><b>${me.rating}</b><small>${me.wins} побед · ${me.losses} поражений</small></div>
      </div>
      <button class="arena-start" data-arena-find>⚔️ НАЙТИ СОПЕРНИКА</button>
      <div class="arena-section-title"><b>🏆 ТОП АРЕНЫ</b><small>Нажми на игрока, чтобы открыть профиль</small></div>
      <div class="arena-top">${top.map((p,i)=>topRow(p,i)).join('')}</div>
    </div>`;
  }

  function topRow(p,i){
    return `<button class="arena-top-row" data-profile-id="${esc(p.id)}">
      <strong>${i+1}</strong><span class="arena-avatar">${p.avatar}</span>
      <span class="arena-player-copy"><b>${esc(p.name)}</b><small>Lv.${p.level} · ${className(p.class)}</small></span>
      <span class="arena-player-rating">${p.rating}</span>
    </button>`;
  }

  function className(c){
    return ({duelist:'Дуэлянт',berserker:'Берсерк',tank:'Страж',assassin:'Ассасин'})[c]||'Воин';
  }

  function openProfile(id){
    const p=id==='player'?humanProfile():botRoster().find(x=>x.id===id);
    if(!p)return;
    selectedProfile=p;
    const root=ensureRoot();if(!root)return;
    root.body.innerHTML=`<div class="arena-profile">
      <button class="arena-back" data-arena-hub>‹ АРЕНА</button>
      <div class="profile-hero"><div class="profile-big-avatar">${p.avatar}</div><div><small>ИГРОК</small><h1>${esc(p.name)}</h1><p>Уровень ${p.level} · ${className(p.class)}</p></div></div>
      <div class="profile-stats">
        <div><small>РЕЙТИНГ</small><b>${p.rating}</b></div>
        <div><small>ПОБЕДЫ</small><b>${p.wins}</b></div>
        <div><small>ПОРАЖЕНИЯ</small><b>${p.losses}</b></div>
        <div><small>СИЛА</small><b>${p.power}</b></div>
      </div>
      <button class="arena-start" data-profile-fight="${esc(p.id)}">⚔️ ВЫЗВАТЬ НА БОЙ</button>
    </div>`;
  }

  function findOpponent(){
    const me=humanProfile();
    const pool=botRoster().filter(p=>Math.abs(p.rating-me.rating)<=220);
    const p=pool[Math.floor(Math.random()*pool.length)]||botRoster()[0];
    startBattle(p);
  }

  function startBattle(opponent){
    const root=ensureRoot();if(!root)return;
    const me=humanProfile();
    battle={
      player:fighterFromProfile(me,'player'),
      bot:fighterFromProfile(opponent,'bot'),
      opponent,
      turn:1,busy:false,playerDefense:'',
      auto:false
    };
    renderBattle();
  }

  function renderBattle(){
    const root=ensureRoot();if(!root||!battle)return;
    const p=battle.player,b=battle.bot;
    root.body.innerHTML=`<div class="arena-battle" data-battle-root>
      <div class="battle-header"><button class="arena-back" data-arena-hub>‹ Арена</button><b>ХОД ${battle.turn}</b><span>Рейтинг ${S()?.arena?.rating||1000}</span></div>
      <div class="battle-stage"><div class="fighter-wrap player-wrap">${fighterMarkup('player',p)}</div><div class="fighter-wrap bot-wrap enter">${fighterMarkup('bot',b)}</div><div class="damage-layer" data-damage-layer></div></div>
      <div class="battle-status"><span data-status>Выбери зону удара</span><b data-player-hp>${p.hp}/${p.maxHp} ❤️</b><b data-bot-hp>${b.hp}/${b.maxHp} ❤️</b></div>
      <div class="autobattle-row"><label><input type="checkbox" data-autobattle ${battle.auto?'checked':''}><span>✓ Автобой</span></label><small>Можно выключить во время боя</small></div>
      <div class="zone-title">УДАР</div>
      <div class="combat-zones attack-zones">${zones.map(z=>`<button data-attack-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
      <div class="zone-title">ЗАЩИТА</div>
      <div class="combat-zones defense-zones">${zones.map(z=>`<button data-defense-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
      <div class="battle-actions"><button data-use-item>🧪 Эликсир</button><button data-surrender>Сдаться</button></div>
      <div class="battle-log" data-log></div>
    </div>`;
    updateBars();
    if(battle.auto)autoStep();
  }

  function fighterMarkup(side,u){
    return `<div class="combat-fighter ${side}" data-fighter="${u.id}">
      <div class="fighter-name">${esc(u.name)} <small>Lv.${u.level}</small></div>
      <div class="fighter-body"><div class="hero-head"><i></i></div><div class="hero-torso"></div><div class="hero-arm arm-back"></div><div class="hero-arm arm-front"><span class="weapon">${side==='player'?'⚔️':'🪓'}</span></div><div class="hero-leg leg-back"></div><div class="hero-leg leg-front"></div></div>
      <div class="fighter-hp"><i style="width:100%"></i></div>
    </div>`;
  }

  function updateBars(){
    if(!battle)return;
    for(const u of [battle.player,battle.bot]){
      const el=$(`[data-fighter="${u.id}"] .fighter-hp i`);
      if(el)el.style.width=Math.max(0,u.hp/u.maxHp*100)+'%';
    }
    const p=battle.player,b=battle.bot;
    $('[data-player-hp]')?.replaceChildren(document.createTextNode(`${Math.max(0,p.hp)}/${p.maxHp} ❤️`));
    $('[data-bot-hp]')?.replaceChildren(document.createTextNode(`${Math.max(0,b.hp)}/${b.maxHp} ❤️`));
  }

  function log(t){
    const el=$('[data-log]');if(el){const d=document.createElement('div');d.textContent=t;el.prepend(d);}
  }

  function popup(text,crit=false,side='bot'){
    const layer=$('[data-damage-layer]');if(!layer)return;
    const el=document.createElement('div');el.className='damage-popup '+(crit?'critical ':'')+side;el.textContent=crit?'💥 '+text:text;
    layer.appendChild(el);setTimeout(()=>el.remove(),850);
  }

  function anim(side,type){
    const el=$(`.fighter-wrap.${side}-wrap`);if(!el)return;
    el.classList.remove('attack','hit','dodge');void el.offsetWidth;el.classList.add(type);
    setTimeout(()=>el.classList.remove(type),520);
  }

  function resolveDamage(attacker,target,attackZone,defenseZone){
    const zoneMatch=attackZone===defenseZone;
    const raw=Math.max(1,attacker.attack+Math.floor(Math.random()*7)-3);
    const crit=Math.random()<attacker.crit;
    let dmg=Math.max(1,raw*(crit?2:1)-Math.floor(target.defense*.35));
    if(zoneMatch)dmg=Math.max(0,Math.floor(dmg*.25));
    return {dmg,crit,blocked:zoneMatch};
  }

  function playerAttack(zone){
    if(!battle||battle.busy)return;
    battle.busy=true;disableControls(true);
    const p=battle.player,b=battle.bot;
    anim('player','attack');
    setTimeout(()=>{
      if(Math.random()<b.dodge){
        anim('bot','dodge');popup('Уклонение 💨',false,'bot');log(`${b.name}: уклонился`);
        finishPlayerTurn();return;
      }
      const r=resolveDamage(p,b,zone,b.defenseZone||'');
      b.hp=Math.max(0,b.hp-r.dmg);
      popup(r.blocked?'БЛОК -'+r.dmg:'-'+r.dmg,r.crit,'bot');
      anim('bot','hit');
      log(`${r.blocked?'Защита остановила удар':'Удар в '+zoneLabel(zone)}: -${r.dmg}${r.crit?' · КРИТ':''}`);
      updateBars();
      if(b.hp<=0){finish(true);return;}
      finishPlayerTurn();
    },300);
  }

  function finishPlayerTurn(){
    if(!battle)return;
    battle.turn++;
    setTimeout(()=>{if(!battle)return;battle.busy=false;botTurn();},450);
  }

  function botTurn(){
    if(!battle||battle.bot.hp<=0)return;
    const p=battle.player,b=battle.bot;
    b.defenseZone=zones[Math.floor(Math.random()*zones.length)][0];
    const zone=zones[Math.floor(Math.random()*zones.length)][0];
    setTimeout(()=>{
      if(!battle)return;
      if(Math.random()<p.dodge){anim('player','dodge');popup('Уклонение 💨',false,'player');log(`${b.name}: промах — уклонение`);nextReady();return;}
      anim('bot','attack');
      setTimeout(()=>{
        if(!battle)return;
        const r=resolveDamage(b,p,zone,battle.playerDefense||'');
        p.hp=Math.max(0,p.hp-r.dmg);
        popup(r.blocked?'БЛОК -'+r.dmg:'-'+r.dmg,r.crit,'player');
        anim('player','hit');
        log(`${r.blocked?'Ты заблокировал удар':'Атака '+zoneLabel(zone)}: -${r.dmg}`);
        updateBars();
        battle.playerDefense='';
        document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.remove('selected'));
        if(p.hp<=0){finish(false);return;}
        nextReady();
      },260);
    },420);
  }

  function nextReady(){
    if(!battle)return;
    battle.busy=false;
    const st=$('[data-status]');if(st)st.textContent=battle.auto?'Автобой: следующий ход':'Твой ход — выбери зону удара';
    disableControls(false);
  }

  function autoStep(){
    if(!battle||battle.busy)return;
    const attack=zones[Math.floor(Math.random()*zones.length)][0];
    const defense=zones[Math.floor(Math.random()*zones.length)][0];
    battle.playerDefense=defense;
    document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.toggle('selected',x.dataset.defenseZone===defense));
    const st=$('[data-status]');if(st)st.textContent=`Автобой: удар ${zoneLabel(attack)}, защита ${zoneLabel(defense)}`;
    setTimeout(()=>{if(battle?.auto)playerAttack(attack);},280);
  }

  function disableControls(disabled){
    document.querySelectorAll('[data-attack-zone],[data-defense-zone],[data-use-item]').forEach(x=>x.disabled=disabled);
  }

  function zoneLabel(z){return zones.find(x=>x[0]===z)?.[1]||z;}

  function useItem(){
    const s=S();const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
    const id=ids.find(x=>Number(s?.consumables?.[x]||0)>0);
    if(!id||!window.CombatItems?.use)return;
    window.CombatItems.use(id);log('Использован '+(window.CombatItems.CATALOG[id]?.name||id));updateBars();
  }

  function finish(win){
    if(!battle)return;
    const opponent=battle.opponent;
    const s=S();const a=Object.assign({},s.arena||{});
    a.battles=(Number(a.battles)||0)+1;
    if(win){a.wins=(Number(a.wins)||0)+1;a.rating=(Number(a.rating)||1000)+18;s.coins+=75;s.exp+=15;}
    else {a.losses=(Number(a.losses)||0)+1;a.rating=Math.max(0,(Number(a.rating)||1000)-14);s.exp+=5;}
    /* Internal history remains available for state/anti-fraud, but is never rendered in player profiles. */
    a.history=Array.isArray(a.history)?a.history.slice(-19):[];
    a.history.unshift({win,date:Date.now(),opponent:opponent.name});
    s.arena=a;s.hp=Math.max(0,Math.min(s.maxHp,battle.player.hp));s.combatBuffs={attack:0,defense:0};save();
    const root=ensureRoot();if(!root)return;
    root.body.innerHTML=`<div class="arena-result"><div>${win?'🏆':'💀'}</div><h1>${win?'ПОБЕДА':'ПОРАЖЕНИЕ'}</h1><p>${esc(opponent.name)} · ${win?'+75 🪙 · +15 XP':'+5 XP'}</p><button class="arena-main" data-restart>ЕЩЁ БОЙ</button><button class="arena-secondary" data-arena-hub>АРЕНА</button></div>`;
    battle=null;
  }

  function close(){
    const root=ensureRoot();if(!root)return;
    root.modal.classList.remove('show');root.modal.setAttribute('aria-hidden','true');battle=null;selectedProfile=null;
  }

  document.addEventListener('click',e=>{
    const profile=e.target.closest?.('[data-profile-id]');
    if(profile){openProfile(profile.dataset.profileId);return;}
    if(e.target.closest?.('[data-arena-hub]')){openHub();return;}
    if(e.target.closest?.('[data-arena-find]')){findOpponent();return;}
    const pf=e.target.closest?.('[data-profile-fight]');
    if(pf){const p=pf.dataset.profileFight==='player'?humanProfile():botRoster().find(x=>x.id===pf.dataset.profileFight);if(p&&!p.isBot)openProfile(p.id);else if(p)startBattle(p);return;}
    const az=e.target.closest?.('[data-attack-zone]');if(az){playerAttack(az.dataset.attackZone);return;}
    const dz=e.target.closest?.('[data-defense-zone]');
    if(dz&&battle&&!battle.busy){battle.playerDefense=dz.dataset.defenseZone;document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.remove('selected'));dz.classList.add('selected');const st=$('[data-status]');if(st)st.textContent='Защита: '+dz.textContent;return;}
    if(e.target.closest?.('[data-use-item]')){useItem();return;}
    if(e.target.closest?.('[data-surrender]')){finish(false);return;}
    if(e.target.closest?.('[data-restart]')){findOpponent();return;}
  });

  document.addEventListener('change',e=>{
    const toggle=e.target.closest?.('[data-autobattle]');
    if(!toggle||!battle)return;
    battle.auto=Boolean(toggle.checked);
    const st=$('[data-status]');if(st)st.textContent=battle.auto?'Автобой включён':'Автобой выключен — выбери зоны вручную';
    if(battle.auto&&!battle.busy)autoStep();
  });

  document.getElementById('arenaClose')?.addEventListener('click',close);
  window.ArenaGame={open:openHub,close,findOpponent,openProfile};
})();
