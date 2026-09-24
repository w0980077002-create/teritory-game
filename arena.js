/* Territory Game — Arena FINAL UI/Combat
   Visual layers: arena background -> Viking SVG fighters -> effects -> UI.
   Tactical rule: 2 defense zones + 1 attack zone.
*/
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const save=()=>window.TerritoryStore?.saveNow?.('arena');
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
const styles={
 crit:{name:'Крит',mods:{attack:5,defense:0,crit:.14,dodge:.03,resilience:0,maxHp:0}},
 tank:{name:'Танк',mods:{attack:1,defense:8,crit:0,dodge:-.02,resilience:.12,maxHp:35}},
 dodge:{name:'Уворот',mods:{attack:2,defense:1,crit:.04,dodge:.14,resilience:0,maxHp:0}},
 resilience:{name:'Стойкость',mods:{attack:2,defense:4,crit:.02,dodge:0,resilience:.22,maxHp:18}}
};
const gearSlots=[['weapon','⚔️','Оружие'],['helmet','🪖','Шлем'],['armor','🛡️','Броня'],['belt','🎗️','Пояс'],['boots','🥾','Сапоги'],['ring','💍','Кольцо'],['amulet','🔮','Амулет']];
const combatSlots=[['elixir_hp','🧪','HP'],['elixir_energy','🔵','Энергия'],['elixir_attack','🔥','Атака'],['elixir_guard','🛡️','Защита'],['adrenaline','⚡','Адреналин'],['speed_scroll','📜','Ускорение'],['anti_speed_scroll','🐌','Антиускорение']];
let battle=null;
function root(){const m=$('#arenaModal'),b=$('#arenaModalBody');return m&&b?{m,b}:null}
function roster(){const l=Math.max(1,Number(S().level)||1),n=['Эйрик','Хальвдан','Сигурд','Рагнар','Ивар','Бьёрн'];return n.map((name,i)=>({id:'arena-bot-'+i,name,level:Math.max(1,l+i%3-1),class:['duelist','berserker','tank','assassin'][i%4],rating:820+(5-i)*42,wins:18+i*7,losses:6+i*3,isBot:true}))}
function me(){const s=S();return{id:'player',name:String(s.profile?.displayName||s.name||'Игрок'),level:Math.max(1,Number(s.level)||1),rating:Number(s.arena?.rating)||1000,wins:Number(s.arena?.wins)||0,losses:Number(s.arena?.losses)||0,class:'duelist'}}
function profile(id){return id==='player'?me():roster().find(x=>x.id===id)}
function loadout(){const k=String(S().arena?.loadout||'crit');return styles[k]?k:'crit'}
function open(){openHub()}
function openHub(){stopTimer();const r=root();if(!r)return;r.m.classList.remove('arena-in-battle');battle=null;r.b.innerHTML=`<div class="arena-hub"><div class="arena-hero"><div><small>СОРЕВНОВАТЕЛЬНАЯ АРЕНА</small><h1>⚔️ АРЕНА</h1><p>Тактические бои 1×1.</p></div><div class="arena-rating"><span>РЕЙТИНГ</span><b>${me().rating}</b><small>${me().wins} побед · ${me().losses} поражений</small></div></div><button class="arena-start" data-arena-find>⚔️ НАЙТИ СОПЕРНИКА</button><div class="arena-section-title"><b>🏆 ТОП АРЕНЫ</b></div><div class="arena-top">${roster().map((p,i)=>`<button class="arena-top-row" data-profile-id="${p.id}"><strong>${i+1}</strong><span class="arena-avatar">⚔️</span><span class="arena-player-copy"><b>${esc(p.name)}</b><small>Lv.${p.level}</small></span><span class="arena-player-rating">${p.rating}</span></button>`).join('')}</div></div>`;r.m.classList.add('show');r.m.setAttribute('aria-hidden','false')}
function openProfile(id){const p=profile(id),r=root();if(!p||!r)return;r.b.innerHTML=`<div class="arena-profile"><button class="arena-back" data-arena-hub>‹ АРЕНА</button><div class="profile-hero"><div class="profile-big-avatar">⚔️</div><div><small>ИГРОК</small><h1>${esc(p.name)}</h1><p>Уровень ${p.level}</p></div></div><div class="profile-stats"><div><small>РЕЙТИНГ</small><b>${p.rating}</b></div><div><small>ПОБЕДЫ</small><b>${p.wins}</b></div><div><small>ПОРАЖЕНИЯ</small><b>${p.losses}</b></div><div><small>КЛАСС</small><b>${esc(p.class)}</b></div></div>${id!=='player'?`<button class="arena-start" data-profile-fight="${id}">⚔️ ВЫЗВАТЬ НА БОЙ</button>`:''}</div>`}
function followerFor(side,p){
  const F=window.Followers;
  if(side==='player'){
    const id=S().followers?.activeFollower;
    if(id&&F?.get?.(id)?.owned&&F?.CATALOG?.[id]) return id;
    return null;
  }
  const ids=F?.CATALOG?Object.keys(F.CATALOG):[];
  return ids.length?ids[(Number(p?.level)||1)%ids.length]:null;
}
function followerStats(id){
  const F=window.Followers;
  if(!id||!F?.getStats)return null;
  return F.getStats(id);
}
function fighter(p,side){
  const s=S(),k=side==='player'?loadout():(p.class==='tank'?'tank':p.class==='assassin'?'dodge':p.class==='berserker'?'crit':'resilience'),m=styles[k].mods;
  const fid=followerFor(side,p),fs=followerStats(fid),fc=window.Followers?.CATALOG?.[fid]||null;
  const maxBase=side==='player'?Math.max(1,Number(s.maxHp)||120):100+p.level*12;
  const max=Math.round(maxBase+(m.maxHp||0)+(fs?.hp||0)*0.18);
  return {id:side,name:p.name,level:p.level,hp:max,maxHp:max,
    attack:(Number(s.strength)||8)+(m.attack||0)+Math.round((fs?.attack||0)*0.25),
    defense:(Number(s.defense)||3)+(m.defense||0)+Math.round((fs?.defense||0)*0.2),
    crit:.06+(m.crit||0)+((fs?.critChance||0)/100)*0.35,
    dodge:Math.max(0,.03+(m.dodge||0)+((fs?.dodge||0)/100)*0.25),
    resilience:m.resilience||0,style:k,followerId:fid,followerStats:fs,followerCfg:fc,
    followerUsed:false,followerCooldownAt:0};
}
function start(op,mode='1v1'){const r=root();if(!r)return;battle={mode,player:fighter(me(),'player'),bot:fighter(op,'bot'),opponent:op,turn:1,playerDefense:[],attackZone:'',botDefense:[],auto:false,busy:false,logs:[`⚔️ Бой начался: ${me().name} против ${op.name}`],chat:[],ended:false,pendingResult:null,startedAt:Date.now(),playerReadyAt:0,botReadyAt:0,baseCooldown:60000,timer:null};render();startTimer()}
function render(){const r=root(),p=battle.player,b=battle.bot;if(!r)return;r.m.classList.add('arena-in-battle');r.b.innerHTML=`<div class="arena-battle" data-battle-root><div class="battle-header"><button class="arena-back" data-arena-hub>‹</button><b>ХОД ${battle.turn}</b><span>Рейтинг ${me().rating}</span></div><div class="battle-stage"><div class="fighter-wrap player-wrap">${fighterMarkup(p,'player')}</div><div class="fighter-wrap bot-wrap">${fighterMarkup(b,'bot')}</div><div class="battle-zone-controls defense-controls"><div class="side-zone-title">ЗАЩИТА · 2</div>${zones.map(z=>`<button data-defense-zone="${z[0]}">${z[1]}</button>`).join('')}</div><div class="battle-zone-controls attack-controls"><div class="side-zone-title">АТАКА · 1</div>${zones.map(z=>`<button data-attack-zone="${z[0]}">${z[1]}</button>`).join('')}</div><div class="combat-effects" data-effects></div></div><div class="battle-command-row"><span class="tactic-mini">2 🛡️ + 1 ⚔️</span><button class="command-auto" data-autobattle-toggle aria-pressed="${battle.auto}"><span>↻</span><small>${battle.auto?'АВТО ✓':'АВТО'}</small></button><button class="command-hit" data-execute-attack disabled>⚔️ УДАР</button><button class="command-surrender" data-surrender>Сдаться</button><button class="command-exit" data-exit-battle>Выйти</button><strong data-cooldown>Готов</strong></div>${combatBar()}<div class="battle-chat-wrap"><button class="battle-chat-toggle" data-chat-toggle aria-expanded="false">💬 История и чат <span>⌄</span></button><div class="battle-chat collapsed" data-chat>${chatHtml()}</div></div>${bottomNav()}</div>`;sync();bindBattleControls()}
function vikingSvg(side){
  const enemy=side==='bot';
  const body=enemy?'#55352f':'#3f5360';
  const leather=enemy?'#7a4936':'#68452f';
  const fur=enemy?'#9d806d':'#c3a77e';
  const metal=enemy?'#6b4b42':'#61727a';
  const skin=enemy?'#c99472':'#c99a73';
  const weapon=enemy?`<path d="M176 174l58-68" stroke="#5a3927" stroke-width="9"/><path d="M224 116l20-18-5 29z" fill="#d7dde0" stroke="#343a40" stroke-width="3"/>`:`<path d="M176 174l62-72" stroke="#5a3927" stroke-width="9"/><path d="M226 112l23-18-7 30z" fill="#d7dde0" stroke="#343a40" stroke-width="3"/>`;
  return `<svg class="viking-art" viewBox="0 0 260 360" aria-hidden="true">
  <ellipse cx="130" cy="347" rx="66" ry="9" fill="#000" opacity=".42"/>
  <path d="M92 230l-8 88q7 19 27 4l13-87zM137 233l13 86q10 18 28 0l-12-91z" fill="#1d2930"/>
  <path d="M72 322h48v16H66q-8-8 6-16zM145 322h44q12 9 3 16h-53z" fill="#111a20"/>
  <path d="M70 126q60-25 121 2l18 106q-69 27-140 0z" fill="${body}" stroke="#182128" stroke-width="5"/>
  <path d="M68 130q61-20 123 0l-7 20q-53-16-109 0z" fill="${fur}"/>
  <path d="M69 220q62 16 125 0v17q-63 19-126 0z" fill="${leather}" stroke="#2a201c" stroke-width="3"/>
  <circle cx="130" cy="82" r="47" fill="${skin}" stroke="#3a2923" stroke-width="5"/>
  <path d="M86 77q4-55 45-58 41 3 45 58l-13-13-8-21-25-9-25 10-10 20z" fill="${metal}" stroke="#20282c" stroke-width="6"/>
  <path d="M82 74h96" stroke="#c7b07c" stroke-width="7"/>
  <path d="M88 86q18 31 43 32 26-3 40-32l-5 37q-35 29-73 0z" fill="#342622"/>
  <circle cx="111" cy="82" r="4" fill="#171717"/><circle cx="149" cy="82" r="4" fill="#171717"/>
  <path d="M116 103q14 7 28 0" fill="none" stroke="#5b382d" stroke-width="4" stroke-linecap="round"/>
  <path d="M74 142q-30 28-37 77 5 15 20 9l35-62z" fill="${skin}" stroke="#5a4032" stroke-width="4"/>
  <path d="M184 142q31 26 43 69-4 15-19 11l-40-58z" fill="${skin}" stroke="#5a4032" stroke-width="4"/>
  ${weapon}
  <path d="M91 142q39 13 78 0l-7 75q-35 16-64 0z" fill="${body}" opacity=".55"/>
  </svg>`;
}
function fighterMarkup(u,side){const src=side==='player'?'arena-assets/player-viking-approved.png':'arena-assets/opponent-viking-approved.png';const f=u.followerCfg;const fs=u.followerStats;return `<div class="combat-fighter ${side}" data-fighter="${side}"><div class="fighter-name">${esc(u.name)} <small>Lv.${u.level}</small></div><div class="fighter-hp-top"><span class="hp-fill" style="width:${Math.max(0,Math.round(u.hp/u.maxHp*100))}%"></span><b>${u.hp}/${u.maxHp} ❤️</b></div><img class="viking-art viking-image" src="${src}" alt="" draggable="false"><div class="fighter-shadow"></div>${f?`<div class="fighter-follower" data-follower-side="${side}"><span>${esc(f.icon||'✦')}</span><b>${esc(f.name)}</b><small>${esc(f.role)} · ур.${Math.max(1,Number((side==='player'?window.Followers?.get?.(u.followerId)?.level:u.level)||1))}</small></div>`:''}</div>`}
function combatBar(){const unlocked=Math.max(0,Math.min(6,Number(S().arena?.combatSlotsUnlocked ?? (3+Math.floor((Math.max(1,Number(S().level)||1)-1)/5)))));return `<div class="combat-loadout-strip"><div class="combat-section-head"><b>СНАРЯЖЕНИЕ</b></div><div class="combat-item-row gear-row">${gearSlots.map(g=>`<button class="combat-item-slot" data-gear="${g[0]}"><strong>${g[1]}</strong><span>${g[2]}</span></button>`).join('')}</div><div class="combat-section-head consumables-head"><b>ЭЛИКСИРЫ И БОЕВЫЕ ПРЕДМЕТЫ</b></div><div class="combat-item-row elixir-row">${combatSlots.map((g,i)=>{const locked=i>unlocked;return `<button class="combat-item-slot ${locked?'locked':''}" data-combat-slot="${g[0]}"><strong>${locked?'🔒':g[1]}</strong><span>${g[2]}</span><small>${locked?'Открывается':'×'+Number(S().consumables?.[g[0]]||0)}</small></button>`}).join('')}</div></div>`}
function chatHtml(){return [...battle.logs.map(x=>`<div class="chat-line system">${esc(x)}</div>`),...battle.chat.map(x=>`<div class="chat-line"><b>${esc(x.name)}:</b> ${esc(x.text)}</div>`)].join('')+`<div class="chat-compose"><input data-chat-input maxlength="180" placeholder="Написать сообщение…"><button data-chat-send>➤</button></div>`}
function bottomNav(){return `<nav class="arena-bottom-nav">${[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['game','🎲','Игры'],['clan','🚩','Клан']].map(x=>`<button data-arena-nav="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('')}</nav>`}
function startTimer(){stopTimer();if(!battle)return;battle.timer=setInterval(()=>{if(!battle)return;const now=Date.now();if(battle.pendingResult&&now>=battle.pendingResult.readyAt){const r=battle.pendingResult;battle.pendingResult=null;finalize(r.win);return}if(!battle.ended&&!battle.pendingResult&&battle.botReadyAt&&now>=battle.botReadyAt){battle.botReadyAt=0;botTurn();return}if(!battle.ended&&!battle.pendingResult&&battle.auto&&cooldownLeft()<=0)autoStep();sync()},250)}
function stopTimer(){if(battle?.timer){clearInterval(battle.timer);battle.timer=null}}
function cooldownLeft(){return Math.max(0,(battle?.playerReadyAt||0)-Date.now())}
function botCooldownLeft(){return Math.max(0,(battle?.botReadyAt||0)-Date.now())}
function botDelay(){return 15000+Math.floor(Math.random()*36000)}
function minBattleLeft(){return battle&&battle.mode!=='1v1'?Math.max(0,30000-(Date.now()-battle.startedAt)):0}
function formatClock(ms){const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function bindBattleControls(){}
function selectDefense(z){if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0)return;const i=battle.playerDefense.indexOf(z);if(i>=0)battle.playerDefense.splice(i,1);else if(battle.playerDefense.length<2)battle.playerDefense.push(z);sync()}
function selectAttack(z){if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0)return;battle.attackZone=z;sync()}
function toggleAuto(){if(!battle||battle.ended)return;battle.auto=!battle.auto;if(battle.auto&&cooldownLeft()<=0)autoStep();sync();const a=root()?.b.querySelector('[data-autobattle-toggle]');if(a)a.setAttribute('aria-pressed',battle.auto?'true':'false')}
function sync(){const r=root();if(!r||!battle)return;const cd=cooldownLeft(),min=minBattleLeft();r.b.querySelectorAll('[data-defense-zone]').forEach(x=>{x.classList.toggle('selected',battle.playerDefense.includes(x.dataset.defenseZone));x.disabled=battle.busy||battle.ended||!!battle.pendingResult||cd>0});r.b.querySelectorAll('[data-attack-zone]').forEach(x=>{x.classList.toggle('selected',x.dataset.attackZone===battle.attackZone);x.disabled=battle.busy||battle.ended||!!battle.pendingResult||cd>0});const btn=r.b.querySelector('[data-execute-attack]'),clock=r.b.querySelector('[data-cooldown]');const ready=battle.playerDefense.length===2&&!!battle.attackZone&&!battle.busy&&!battle.ended&&!battle.pendingResult&&cd<=0;if(btn)btn.disabled=!ready;if(clock)clock.textContent=cd>0?`Удар ${formatClock(cd)}`:battle.pendingResult?`Минимум ${formatClock(min)}`:botCooldownLeft()>0?`Бот ${formatClock(botCooldownLeft())}`:'Готов к ходу';r.b.querySelector('[data-autobattle-toggle]')?.classList.toggle('active',battle.auto)}
function effect(type,side){const layer=$('[data-effects]');if(!layer)return;const e=document.createElement('div');e.className=`combat-fx fx-${type} fx-${side}`;e.textContent=type==='crit'?'✦':type==='block'?'✧':type==='hit'?'✹':'×';layer.appendChild(e);setTimeout(()=>e.remove(),700)}
function animateFighter(side,cls){const el=$(`[data-fighter="${side}"]`);if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),800)}
function followerReady(u){return !!(u?.followerCfg&&u.followerStats&&!u.followerUsed&&Date.now()>=(u.followerCooldownAt||0));}
function followerAbility(u,target,side){
  if(!followerReady(u))return {used:false};
  const id=u.followerId,fs=u.followerStats,cfg=u.followerCfg;
  let text='',amount=0,type='hit';
  if(id==='liabro'){
    if(Math.random()<(Number(fs.critChance||0)/100)){amount=Math.max(2,Math.round((fs.attack||0)*.75));target.hp=Math.max(0,target.hp-amount);text=`⚔️ ${cfg.name}: критический удар −${amount}`;type='crit';}
  }else if(id==='teralel'){
    u.followerGuard=Math.max(u.followerGuard||0,Math.round((fs.defense||0)*.8));text=`🛡️ ${cfg.name}: защита +${u.followerGuard}`;type='block';
  }else if(id==='king_cows'){
    amount=Math.max(2,Math.round(fs.heal||0));u.hp=Math.min(u.maxHp,u.hp+amount);text=`❤️ ${cfg.name}: лечение +${amount}`;type='heal';
  }else if(id==='mort'){
    u.followerDodge=Math.min(.55,(Number(fs.dodge||0)/100)+.12);text=`🌀 ${cfg.name}: уворот усилен`;type='miss';
  }else if(id==='stone_face'){
    amount=Math.max(1,Math.round(Number(fs.control||0)/3));target.followerControlUntil=Date.now()+5000;text=`💀 ${cfg.name}: контроль ${amount}%`;type='control';
  }
  if(!text)return {used:false};
  u.followerUsed=true;u.followerCooldownAt=Date.now()+12000;u.followerLastText=text;u.followerLastType=type;
  battle.logs.push(text);effect(type,side==='player'?'bot':'player');
  animateFollower(side,type);
  return {used:true,type,text};
}
function animateFollower(side,type){const el=$(`[data-follower-side="${side}"]`);if(!el)return;el.classList.remove('follower-active','follower-'+type);void el.offsetWidth;el.classList.add('follower-active','follower-'+type);setTimeout(()=>el.classList.remove('follower-active','follower-'+type),900)}
function executeAttack(){if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0||battle.playerDefense.length!==2||!battle.attackZone)return;battle.busy=true;const p=battle.player,b=battle.bot;animateFighter('player','attack');followerAbility(p,b,'player');let dmg=Math.max(1,(p.attack+(battle.attackBuff||0))-(b.defense+(b.followerGuard||0)));b.followerGuard=0;battle.attackBuff=0;if(Math.random()<b.dodge){battle.logs.push('💨 Соперник увернулся');effect('miss','bot');animateFighter('bot','dodge')}else{const blocked=battle.botDefense.includes(battle.attackZone);if(blocked){dmg=Math.max(1,Math.floor(dmg*.25));battle.logs.push(`🛡️ Соперник заблокировал удар: ${dmg}`);effect('block','bot');animateFighter('bot','block')}else if(Math.random()<p.crit){dmg=Math.floor(dmg*1.8);battle.logs.push(`💥 Критический удар: ${dmg}`);effect('crit','bot');animateFighter('bot','hurt')}else{battle.logs.push(`⚔️ Ты нанёс ${dmg} урона`);effect('hit','bot');animateFighter('bot','hurt')}b.hp=Math.max(0,b.hp-dmg)}battle.playerReadyAt=Date.now()+battle.baseCooldown;battle.botReadyAt=Date.now()+botDelay();battle.busy=false;battle.attackZone='';if(b.hp<=0){finish(true);return}render()}
function botTurn(){if(!battle||battle.ended||battle.pendingResult)return;const p=battle.player,b=battle.bot,atk=zones[Math.floor(Math.random()*4)][0],d1=zones[Math.floor(Math.random()*4)][0];followerAbility(b,p,'bot');let d2=zones[Math.floor(Math.random()*4)][0];while(d2===d1)d2=zones[Math.floor(Math.random()*4)][0];battle.botDefense=[d1,d2];let dmg=Math.max(1,b.attack-(p.defense+(battle.guardBuff||0)+(p.followerGuard||0)));p.followerGuard=0;battle.guardBuff=0;animateFighter('bot','attack');if((p.dodge+(p.followerDodge||0))>0&&Math.random()<Math.min(.8,p.dodge+(p.followerDodge||0))){battle.logs.push('💨 Ты увернулся от удара');effect('miss','player')}else if(Math.random()<b.crit){dmg=Math.floor(dmg*1.8);p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`💥 Критический удар соперника: ${dmg}`);effect('crit','player');animateFighter('player','hurt')}else{if(battle.playerDefense.includes(atk)){dmg=Math.max(1,Math.floor(dmg*.25));battle.logs.push(`🛡️ Ты заблокировал удар: ${dmg}`);effect('block','player');animateFighter('player','block')}else{p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`⚔️ Соперник нанёс ${dmg} урона`);effect('hit','player');animateFighter('player','hurt')}}if(p.hp<=0){finish(false);return}battle.turn++;battle.playerDefense=[];battle.attackZone='';p.followerDodge=0;render()}
function autoStep(){if(!battle||battle.ended||battle.busy||battle.pendingResult||cooldownLeft()>0||!battle.auto)return;let d1=zones[Math.floor(Math.random()*4)][0],d2=zones[Math.floor(Math.random()*4)][0];while(d2===d1)d2=zones[Math.floor(Math.random()*4)][0];battle.playerDefense=[d1,d2];battle.attackZone=zones[Math.floor(Math.random()*4)][0];sync();setTimeout(()=>{if(battle?.auto&&!battle.ended&&cooldownLeft()<=0)executeAttack()},220)}
function finalize(win){if(!battle)return;battle.ended=true;battle.busy=false;battle.playerReadyAt=0;battle.botReadyAt=0;stopTimer();window.TerritoryStore.state.hp=Math.max(0,Math.min(window.TerritoryStore.state.maxHp,battle.player.hp));window.TerritoryStore.state.arena.battles=(Number(window.TerritoryStore.state.arena.battles)||0)+1;if(win){window.TerritoryStore.state.arena.wins=(Number(window.TerritoryStore.state.arena.wins)||0)+1;window.TerritoryStore.state.arena.rating=(Number(window.TerritoryStore.state.arena.rating)||1000)+25}else{window.TerritoryStore.state.arena.losses=(Number(window.TerritoryStore.state.arena.losses)||0)+1;window.TerritoryStore.state.arena.rating=Math.max(0,(Number(window.TerritoryStore.state.arena.rating)||1000)-20)}save();battle.logs.push(win?'🏆 Победа!':'☠️ Ты проиграл. Бой завершён.');render()}
function finish(win){if(!battle||battle.ended||battle.pendingResult)return;const wait=minBattleLeft();if(wait>0){battle.pendingResult={win,readyAt:Date.now()+wait};battle.busy=true;battle.logs.push('⏳ Исход определён. Минимальная длительность командного боя — 30 секунд.');sync();return}finalize(win)}
function sendChat(){if(!battle)return;const i=$('[data-chat-input]');if(!i||!i.value.trim())return;battle.chat.push({name:me().name,text:i.value.trim()});i.value='';render();const box=$('[data-chat]');if(box){box.classList.remove('collapsed');box.scrollTop=box.scrollHeight}}
function exitBattle(){if(!battle)return;battle.exited=true;stopTimer();openHub()}
function useSlot(slot){
  if(!battle||battle.ended||battle.busy)return;
  const idx=combatSlots.findIndex(x=>x[0]===slot),unlocked=Math.max(0,Math.min(6,Number(S().arena?.combatSlotsUnlocked ?? (3+Math.floor((Math.max(1,Number(S().level)||1)-1)/5)))));
  if(idx<0||idx>unlocked)return;
  if(Number(window.TerritoryStore.state.consumables?.[slot]||0)<=0)return;
  if(slot==='speed_scroll'&&cooldownLeft()>0){const floor=battle.mode!=='1v1'?battle.startedAt+30000:Date.now();battle.playerReadyAt=Math.max(floor,battle.playerReadyAt-10000);window.TerritoryStore.state.consumables[slot]--;save();battle.logs.push('📜 Ускорение: −10 секунд.');render();return}
  if(slot==='anti_speed_scroll'&&cooldownLeft()>0){battle.playerReadyAt=Math.min(Date.now()+60000,battle.playerReadyAt+10000);window.TerritoryStore.state.consumables[slot]--;save();battle.logs.push('🐌 Антиускорение: +10 секунд, максимум 60 секунд.');render();return}
  if(slot==='elixir_hp'){window.TerritoryStore.state.consumables[slot]--;battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp+30);battle.logs.push('🧪 HP восстановлено на 30');save();render();return}
  if(slot==='elixir_energy'){window.TerritoryStore.state.consumables[slot]--;if(typeof window.TerritoryStore.state.energy==='number')window.TerritoryStore.state.energy=Math.min(window.TerritoryStore.state.maxEnergy,window.TerritoryStore.state.energy+20);battle.logs.push('🔵 Энергия восстановлена на 20');save();render();return}
  if(slot==='elixir_attack'){window.TerritoryStore.state.consumables[slot]--;battle.attackBuff=(battle.attackBuff||0)+5;battle.logs.push('🔥 Атака усилена на следующий удар (+5)');save();render();return}
  if(slot==='elixir_guard'){window.TerritoryStore.state.consumables[slot]--;battle.guardBuff=(battle.guardBuff||0)+5;battle.logs.push('🛡️ Защита усилена на следующий удар (+5)');save();render();return}
  if(slot==='adrenaline'&&battle.mode!=='1v1'){window.TerritoryStore.state.consumables[slot]--;battle.logs.push('⚡ Адреналин: выбранный союзник возвращается в бой.');performTeamUtility('Адреналин',()=>{});save();return}
}
function performTeamUtility(label,fn){if(!battle||battle.ended||battle.busy||battle.mode==='1v1')return false;fn();battle.logs.push(`🧩 ${label}: ход пропущен.`);battle.turn++;battle.playerDefense=[];battle.attackZone='';battle.playerReadyAt=Date.now()+battle.baseCooldown;render();return true}
function chooseGear(slot){if(!battle||battle.ended)return;const keys=Object.keys(styles),k=keys[(keys.indexOf(battle.player.style)+1)%keys.length];if(battle.mode!=='1v1'){performTeamUtility('Переодевание',()=>battle.player.style=k);return}battle.player.style=k;battle.logs.push(`👕 ${gearSlots.find(x=>x[0]===slot)?.[2]||'Предмет'}: комплект «${styles[k].name}»`);render()}
document.addEventListener('click',e=>{
 const t=e.target.closest?.('button'); if(!t) return;
 if(t.id==='arenaClose'){root()?.m.classList.remove('show');return}
 if(t.dataset.arenaFind){start(roster()[Math.floor(Math.random()*roster().length)]);return}
 if(t.dataset.profileId){openProfile(t.dataset.profileId);return}
 if(t.dataset.arenaHub){openHub();return}
 if(t.dataset.profileFight){start(profile(t.dataset.profileFight));return}
 if(t.dataset.defenseZone){selectDefense(t.dataset.defenseZone);return}
 if(t.dataset.attackZone){selectAttack(t.dataset.attackZone);return}
 if(t.dataset.autobattleToggle){toggleAuto();return}
 if(t.dataset.executeAttack){executeAttack();return}
 if(t.dataset.combatSlot){useSlot(t.dataset.combatSlot);return}
 if(t.dataset.gear){chooseGear(t.dataset.gear);return}
 if(t.dataset.chatToggle){const box=root()?.b.querySelector('[data-chat]');const open=box?.classList.toggle('collapsed')===false;t.setAttribute('aria-expanded',open?'true':'false');const sp=t.querySelector('span');if(sp)sp.textContent=open?'⌃':'⌄';return}
 if(t.dataset.chatSend){sendChat();return}
 if(t.dataset.surrender){if(battle&&!battle.ended)finish(false);return}
 if(t.dataset.exitBattle){exitBattle();return}
 if(t.dataset.arenaNav){const map={home:'home',inventory:'inventory',hero:'inventory',game:'casino',quests:'districts',clan:'districts'};if(t.dataset.arenaNav==='battle')return;root()?.m.classList.remove('show');window.showScreen?.(map[t.dataset.arenaNav]||'home');return}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.matches('[data-chat-input]'))sendChat()});
window.ArenaGame={open,openHub,startBattle:start,close:()=>root()?.m.classList.remove('show')};
})();
