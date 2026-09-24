/* Territory Game — STEP-07 ARENA
   Mobile-first Arena. HOME artwork untouched.
   State: window.TerritoryStore.state only.
*/
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const save=reason=>window.TerritoryStore?.saveNow?.(reason||'arena');
const $=(q,r=document)=>r.querySelector(q);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
const followerRole={liabro:'crit',teralel:'tank',king_cows:'heal',mort:'dodge',stone_face:'control'};
const baseStyles={
 crit:{name:'Крит',attack:5,defense:0,crit:.14,dodge:.03,maxHp:0},
 tank:{name:'Танк',attack:1,defense:8,crit:0,dodge:0,maxHp:35},
 dodge:{name:'Уворот',attack:2,defense:1,crit:.04,dodge:.14,maxHp:0},
 resilience:{name:'Стойкость',attack:2,defense:4,crit:.02,dodge:0,maxHp:18}
};
const gearSlots=[['weapon','⚔️','Оружие'],['helmet','🪖','Шлем'],['armor','🛡️','Броня'],['belt','🎗️','Пояс'],['boots','🥾','Сапоги'],['ring','💍','Кольцо'],['amulet','🔮','Амулет']];
const combatSlots=[['elixir_hp','🧪','HP'],['elixir_energy','🔵','Энергия'],['elixir_attack','🔥','Атака'],['elixir_guard','🛡️','Защита'],['adrenaline','⚡','Адреналин'],['speed_scroll','📜','Ускорение'],['anti_speed_scroll','🐌','Антиускорение']];
let battle=null;

function root(){const m=$('#arenaModal'),b=$('#arenaModalBody');return m&&b?{m,b}:null}
function me(){const s=S();return{id:'player',name:String(s.profile?.displayName||s.name||'Игрок'),level:Math.max(1,Number(s.level)||1),rating:Number(s.arena?.rating)||1000,wins:Number(s.arena?.wins)||0,losses:Number(s.arena?.losses)||0}}
function roster(){const names=['Эйрик','Хальвдан','Сигурд','Рагнар','Ивар','Бьёрн','Фрейя','Астрид'];const l=Math.max(1,Number(S().level)||1);return names.map((name,i)=>({id:'arena-player-'+i,name,level:Math.max(1,l+i%3-1),rating:820+i*37,wins:18+i*6,losses:5+i*2,class:['duelist','berserker','tank','assassin'][i%4],isBot:true}))}
function profile(id){return id==='player'?me():roster().find(x=>x.id===id)}
function activeFollower(){
 const s=S(),id=s.followers?.activeFollower;
 if(!id||!window.Followers)return null;
 const data=window.Followers.get?.(id),cfg=window.Followers.CATALOG?.[id],stats=window.Followers.getStats?.(id);
 return data?.owned&&cfg&&stats?{id,data,cfg,stats}:null;
}
function equipment(){
 const eq=Array.isArray(S().equipment)?S().equipment:[];
 return gearSlots.map(([slot])=>eq.find(x=>String(x?.slot||'')===slot)||null);
}
function gearBonus(){
 let attack=0,defense=0,maxHp=0;
 equipment().forEach(x=>{
  if(!x)return;
  attack+=Number(x.damage||x.attack||x.bonusDamage||0)||0;
  defense+=Number(x.defense||0)||0;
  maxHp+=Number(x.hp||x.maxHp||0)||0;
 });
 return {attack,defense,maxHp};
}
function fighter(p,side){
 const s=S(),f=side==='player'?activeFollower():null;
 const role=side==='player'?(followerRole[f?.id]||'crit'):(p.class==='tank'?'tank':p.class==='assassin'?'dodge':p.class==='berserker'?'crit':'resilience');
 const m=baseStyles[role]||baseStyles.crit, g=side==='player'?gearBonus():{attack:0,defense:0,maxHp:0};
 const fa=f?Math.floor((Number(f.stats.attack)||0)/4):0,fd=f?Math.floor((Number(f.stats.defense)||0)/4):0,fh=f?Math.floor((Number(f.stats.hp)||0)/20):0;
 const max=side==='player'?Math.max(1,Number(s.maxHp)||120)+m.maxHp+fh+g.maxHp:100+p.level*12+m.maxHp;
 return {id:side,name:p.name,level:p.level,hp:max,maxHp:max,
  attack:(side==='player'?Number(s.strength)||5:8+p.level)+m.attack+fa+g.attack,
  defense:(side==='player'?Number(s.defense)||0:3+p.level*.7)+m.defense+fd+g.defense,
  crit:Math.min(.7,.06+m.crit+(f?.id==='liabro'?Number(f.stats.critChance||0)/100:0)),
  dodge:Math.min(.7,Math.max(0,.03+m.dodge+(f?.id==='mort'?Number(f.stats.dodge||0)/100:0))),
  role,follower:f?{id:f.id,name:f.cfg.name,icon:f.cfg.icon,role:f.cfg.role,level:f.data.level,stats:f.stats}:null};
}
function open(){openHub()}
function show(){const r=root();if(r){r.m.classList.add('show');r.m.setAttribute('aria-hidden','false')}}
function hide(){const r=root();if(r){r.m.classList.remove('show');r.m.setAttribute('aria-hidden','true')}}
function openHub(){
 const r=root();if(!r)return;battle=null;
 r.b.innerHTML=`<div class="arena-hub">
  <div class="arena-hero"><div><small>СОРЕВНОВАТЕЛЬНАЯ АРЕНА</small><h1>⚔️ АРЕНА</h1><p>Тактический бой 1×1.</p></div>
  <div class="arena-rating"><span>РЕЙТИНГ</span><b>${me().rating}</b><small>${me().wins} побед · ${me().losses} поражений</small></div></div>
  <button class="arena-start" data-arena-find>⚔️ НАЙТИ СОПЕРНИКА</button>
  <div class="arena-section-title"><b>🏆 СОПЕРНИКИ</b></div>
  <div class="arena-top">${roster().map((p,i)=>`<button class="arena-top-row" data-profile-id="${p.id}"><strong>${i+1}</strong><span class="arena-avatar">⚔️</span><span class="arena-player-copy"><b>${esc(p.name)}</b><small>Lv.${p.level}</small></span><span class="arena-player-rating">${p.rating}</span></button>`).join('')}</div>
 </div>`;show();
}
function openProfile(id){
 const p=profile(id),r=root();if(!p||!r)return;
 r.b.innerHTML=`<div class="arena-profile"><button class="arena-back" data-arena-hub>‹ АРЕНА</button>
 <div class="profile-hero"><div class="profile-big-avatar">⚔️</div><div><small>ИГРОК</small><h1>${esc(p.name)}</h1><p>Уровень ${p.level}</p></div></div>
 <div class="profile-stats"><div><small>РЕЙТИНГ</small><b>${p.rating}</b></div><div><small>ПОБЕДЫ</small><b>${p.wins}</b></div><div><small>ПОРАЖЕНИЯ</small><b>${p.losses}</b></div><div><small>КЛАСС</small><b>${esc(p.class)}</b></div></div>
 <button class="arena-start" data-profile-fight="${id}">⚔️ ВЫЗВАТЬ НА БОЙ</button></div>`;show();
}
function start(op,mode='1v1'){
 const r=root();if(!r)return;
 const f=activeFollower();
 battle={mode,player:fighter(me(),'player'),bot:fighter(op,'bot'),opponent:op,follower:f,turn:1,
  playerDefense:[],botDefense:[],attackZone:'',auto:false,busy:false,ended:false,logs:[],chat:[],
  attackBuff:0,guardBuff:0,botStunned:false,startedAt:Date.now(),playerReadyAt:0,botReadyAt:0,
  baseCooldown:1500,timer:null,resultSaved:false};
 battle.logs.push(`⚔️ Бой начался: ${me().name} против ${op.name}`);
 if(f)battle.logs.push(`✦ ${f.cfg.name} вступил в бой: ${f.cfg.role}`);
 render();startTimer();
}
function render(){
 const r=root();if(!r||!battle)return;const p=battle.player,b=battle.bot;
 r.m.classList.add('arena-in-battle');
 r.b.innerHTML=`<div class="arena-battle" data-battle-root>
  <div class="battle-header"><button class="arena-back" data-arena-hub>‹</button><b>ХОД ${battle.turn}</b><span>Рейтинг ${me().rating}</span>${battle.follower?`<span class="active-follower-header">${battle.follower.cfg.icon||'✦'} ${esc(battle.follower.cfg.name)} · ур.${battle.follower.data.level}</span>`:''}</div>
  <div class="battle-stage">
   <div class="fighter-wrap player-wrap">${fighterMarkup(p,'player')}${followerBadge()}</div>
   <div class="fighter-wrap bot-wrap">${fighterMarkup(b,'bot')}</div>
   <div class="battle-zone-controls defense-controls"><div class="side-zone-title">ЗАЩИТА · 2</div>${zones.map(z=>`<button data-defense-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
   <div class="battle-zone-controls attack-controls"><div class="side-zone-title">АТАКА · 1</div>${zones.map(z=>`<button data-attack-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
   <div class="combat-effects" data-effects></div>
  </div>
  <div class="battle-command-row"><span class="tactic-mini">2 🛡️ + 1 ⚔️</span><button class="command-auto" data-autobattle-toggle aria-pressed="${battle.auto}"><span>↻</span><small>${battle.auto?'АВТО ✓':'АВТО'}</small></button><button class="command-hit" data-execute-attack disabled>⚔️ УДАР</button><button class="command-surrender" data-surrender>Сдаться</button><button class="command-exit" data-exit-battle>Выйти</button><strong data-cooldown>Готов</strong></div>
  ${combatBar()}<div class="battle-chat-wrap"><button class="battle-chat-toggle" data-chat-toggle aria-expanded="false">💬 История и чат <span>⌄</span></button><div class="battle-chat collapsed" data-chat>${chatHtml()}</div></div>
  ${bottomNav()}</div>`;
 sync();bind();
}
function fighterMarkup(u,side){return `<div class="combat-fighter ${side}" data-fighter="${side}"><div class="fighter-name">${esc(u.name)} <small>Lv.${u.level}</small></div><div class="fighter-hp-top"><span class="hp-fill" style="width:${Math.max(0,Math.round(u.hp/u.maxHp*100))}%"></span><b>${Math.ceil(u.hp)}/${Math.ceil(u.maxHp)} ❤️</b></div><div class="fighter-shadow"></div></div>`}
function followerBadge(){const f=battle?.follower;if(!f)return'';return `<div class="active-follower-badge"><span>${f.cfg.icon||'✦'}</span><b>${esc(f.cfg.name)}</b><small>${esc(f.cfg.role)} · ур.${f.data.level}</small></div>`}
function combatBar(){
 const unlocked=Math.max(0,Math.min(6,Number(S().arena?.combatSlotsUnlocked??3)));
 return `<div class="combat-loadout-strip"><div class="combat-section-head"><b>СНАРЯЖЕНИЕ</b></div><div class="combat-item-row gear-row">${gearSlots.map(g=>{const e=equipment().find(x=>x?.slot===g[0]);return `<button class="combat-item-slot ${e?'filled':''}" data-gear="${g[0]}"><strong>${e?.icon||g[1]}</strong><span>${esc(e?.name||g[2])}</span><small>${e?'ЭКИП.':'пусто'}</small></button>`}).join('')}</div>
 <div class="combat-section-head consumables-head"><b>ЭЛИКСИРЫ И БОЕВЫЕ ПРЕДМЕТЫ</b></div><div class="combat-item-row elixir-row">${combatSlots.map((g,i)=>{const locked=i>unlocked,c=Number(S().consumables?.[g[0]]||0);return `<button class="combat-item-slot ${locked?'locked':''}" data-combat-slot="${g[0]}"><strong>${locked?'🔒':g[1]}</strong><span>${g[2]}</span><small>${locked?'Открывается':'×'+c}</small></button>`}).join('')}</div></div>`;
}
function chatHtml(){return [...battle.logs.map(x=>`<div class="chat-line system">${esc(x)}</div>`),...battle.chat.map(x=>`<div class="chat-line"><b>${esc(x.name)}:</b> ${esc(x.text)}</div>`)].join('')+`<div class="chat-compose"><input data-chat-input maxlength="180" placeholder="Написать сообщение…"><button data-chat-send>➤</button></div>`}
function bottomNav(){return `<nav class="arena-bottom-nav">${[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['game','🎲','Игры'],['clan','🚩','Клан']].map(x=>`<button data-arena-nav="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('')}</nav>`}
function startTimer(){stopTimer();if(!battle)return;battle.timer=setInterval(()=>{if(!battle)return;if(battle.botReadyAt&&Date.now()>=battle.botReadyAt){battle.botReadyAt=0;botTurn();return}if(battle.auto&&!battle.busy&&cooldownLeft()<=0)autoStep();sync()},250)}
function stopTimer(){if(battle?.timer){clearInterval(battle.timer);battle.timer=null}}
function cooldownLeft(){return Math.max(0,(battle?.playerReadyAt||0)-Date.now())}
function formatClock(ms){const s=Math.ceil(Math.max(0,ms)/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function bind(){
 const r=root();if(!r)return;
 r.b.querySelector('[data-execute-attack]')?.addEventListener('click',executeAttack);
 r.b.querySelector('[data-autobattle-toggle]')?.addEventListener('click',toggleAuto);
 r.b.querySelectorAll('[data-defense-zone]').forEach(x=>x.addEventListener('click',()=>selectDefense(x.dataset.defenseZone)));
 r.b.querySelectorAll('[data-attack-zone]').forEach(x=>x.addEventListener('click',()=>selectAttack(x.dataset.attackZone)));
 r.b.querySelectorAll('[data-combat-slot]').forEach(x=>x.addEventListener('click',()=>useSlot(x.dataset.combatSlot)));
 r.b.querySelectorAll('[data-gear]').forEach(x=>x.addEventListener('click',()=>chooseGear(x.dataset.gear)));
 const t=r.b.querySelector('[data-chat-toggle]');t?.addEventListener('click',()=>{const box=r.b.querySelector('[data-chat]'),open=box.classList.toggle('collapsed')===false;t.setAttribute('aria-expanded',open);t.querySelector('span').textContent=open?'⌃':'⌄'});
 r.b.querySelector('[data-chat-send]')?.addEventListener('click',sendChat);
 r.b.querySelector('[data-chat-input]')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});
}
function selectDefense(z){if(!battle||battle.busy||battle.ended||cooldownLeft()>0)return;const i=battle.playerDefense.indexOf(z);if(i>=0)battle.playerDefense.splice(i,1);else if(battle.playerDefense.length<2)battle.playerDefense.push(z);sync()}
function selectAttack(z){if(!battle||battle.busy||battle.ended||cooldownLeft()>0)return;battle.attackZone=z;sync()}
function toggleAuto(){if(!battle||battle.ended)return;battle.auto=!battle.auto;sync()}
function sync(){
 const r=root();if(!r||!battle)return;const cd=cooldownLeft();
 r.b.querySelectorAll('[data-defense-zone]').forEach(x=>{x.classList.toggle('selected',battle.playerDefense.includes(x.dataset.defenseZone));x.disabled=battle.busy||battle.ended||cd>0});
 r.b.querySelectorAll('[data-attack-zone]').forEach(x=>{x.classList.toggle('selected',x.dataset.attackZone===battle.attackZone);x.disabled=battle.busy||battle.ended||cd>0});
 const ready=battle.playerDefense.length===2&&battle.attackZone&&!battle.busy&&!battle.ended&&cd<=0;
 const hit=r.b.querySelector('[data-execute-attack]');if(hit)hit.disabled=!ready;
 const c=r.b.querySelector('[data-cooldown]');if(c)c.textContent=cd?`Удар ${formatClock(cd)}`:battle.botReadyAt?`Бот ${formatClock(battle.botReadyAt-Date.now())}`:'Готов';
 r.b.querySelector('[data-autobattle-toggle]')?.classList.toggle('active',battle.auto);
}
function effect(type,side){const layer=$('[data-effects]');if(!layer)return;const e=document.createElement('div');e.className=`combat-fx fx-${type} fx-${side}`;e.textContent=type==='crit'?'✦':type==='block'?'✧':type==='heal'?'♥':type==='control'?'☠':type==='miss'?'×':'✹';layer.appendChild(e);setTimeout(()=>e.remove(),700)}
function animate(side,cls){const el=$(`[data-fighter="${side}"]`);if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),700)}
function executeAttack(){
 if(!battle||battle.busy||battle.ended||cooldownLeft()>0||battle.playerDefense.length!==2||!battle.attackZone)return;
 battle.busy=true;const p=battle.player,b=battle.bot,f=battle.follower;animate('player','attack');
 let dmg=Math.max(1,p.attack+battle.attackBuff-b.defense);battle.attackBuff=0;
 if(Math.random()<b.dodge){battle.logs.push('💨 Соперник увернулся');effect('miss','bot');animate('bot','dodge')}
 else {const block=battle.botDefense.includes(battle.attackZone);
  if(block){dmg=Math.max(1,Math.floor(dmg*.25));battle.logs.push(`🛡️ Блок: ${dmg}`);effect('block','bot');animate('bot','block')}
  else if(Math.random()<p.crit){dmg=Math.floor(dmg*1.8);battle.logs.push(`💥 Крит: ${dmg}`);effect('crit','bot');animate('bot','hurt')}
  else{battle.logs.push(`⚔️ Урон: ${dmg}`);effect('hit','bot');animate('bot','hurt')}
  b.hp=Math.max(0,b.hp-dmg);
  if(f?.id==='stone_face'&&b.hp>0&&Math.random()<Math.min(.35,(Number(f.stats.control)||0)/100)){battle.botStunned=true;battle.logs.push(`💀 ${f.cfg.name}: контроль — следующий ход пропущен`);effect('control','bot')}
 }
 battle.playerReadyAt=Date.now()+battle.baseCooldown;battle.busy=false;battle.attackZone='';
 if(b.hp<=0){finish(true);return}
 render();
}
function botTurn(){
 if(!battle||battle.ended)return;
 if(battle.botStunned){battle.botStunned=false;battle.logs.push(`💀 ${battle.follower?.cfg?.name||'Спутник'} остановил атаку`);battle.turn++;battle.playerDefense=[];render();return}
 const p=battle.player,b=battle.bot,f=battle.follower;
 const atk=zones[Math.floor(Math.random()*4)][0];const d1=zones[Math.floor(Math.random()*4)][0];let d2=zones[Math.floor(Math.random()*4)][0];while(d2===d1)d2=zones[Math.floor(Math.random()*4)][0];battle.botDefense=[d1,d2];
 let dmg=Math.max(1,b.attack-(p.defense+battle.guardBuff));battle.guardBuff=0;
 if(f?.id==='teralel')dmg=Math.max(1,Math.floor(dmg*Math.max(.65,1-Math.min(.35,(Number(f.stats.defense)||0)/220))));
 animate('bot','attack');
 if(Math.random()<p.dodge){battle.logs.push('💨 Ты увернулся');effect('miss','player')}
 else if(Math.random()<b.crit){dmg=Math.floor(dmg*1.8);p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`💥 Крит соперника: ${dmg}`);effect('crit','player');animate('player','hurt')}
 else if(battle.playerDefense.includes(atk)){dmg=Math.max(1,Math.floor(dmg*.25));p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`🛡️ Ты заблокировал: ${dmg}`);effect('block','player');animate('player','block')}
 else{p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`⚔️ Соперник: ${dmg}`);effect('hit','player');animate('player','hurt')}
 if(f?.id==='king_cows'&&p.hp>0&&p.hp<p.maxHp){const heal=Math.max(1,Math.floor(Math.min(40,(Number(f.stats.heal)||0)*.5)));p.hp=Math.min(p.maxHp,p.hp+heal);battle.logs.push(`❤️ ${f.cfg.name}: +${heal} HP`);effect('heal','player')}
 if(p.hp<=0){finish(false);return}
 battle.turn++;battle.playerDefense=[];battle.attackZone='';render();
}
function autoStep(){if(!battle||battle.ended||battle.busy||cooldownLeft()>0||!battle.auto)return;let a=zones[Math.floor(Math.random()*4)][0],d=zones[Math.floor(Math.random()*4)][0];let d2=zones[Math.floor(Math.random()*4)][0];while(d2===d)d2=zones[Math.floor(Math.random()*4)][0];battle.playerDefense=[d,d2];battle.attackZone=a;executeAttack()}
function finish(win){
 if(!battle||battle.ended)return;
 battle.ended=true;battle.busy=false;stopTimer();
 const s=S();s.arena=s.arena||{rating:1000,wins:0,losses:0,battles:0,history:[]};
 s.arena.battles=Number(s.arena.battles||0)+1;
 if(win){s.arena.wins=Number(s.arena.wins||0)+1;s.arena.rating=Number(s.arena.rating||1000)+20}
 else{s.arena.losses=Number(s.arena.losses||0)+1;s.arena.rating=Math.max(0,Number(s.arena.rating||1000)-15)}
 s.arena.history=Array.isArray(s.arena.history)?s.arena.history:[];s.arena.history.unshift({id:Date.now(),opponent:battle.opponent.name,win,mode:battle.mode,date:new Date().toISOString()});s.arena.history=s.arena.history.slice(0,30);
 s.coins=Math.max(0,Number(s.coins||0)+(win?100:25));s.exp=Math.max(0,Number(s.exp||0)+(win?30:10));
 if(battle.follower&&window.Followers?.addXp)window.Followers.addXp(battle.follower.id,win?20:7);
 save('arena-result');
 battle.logs.push(win?'🏆 Победа! Награда сохранена.':'☠️ Поражение. Бой завершён.');
 render();
}
function sendChat(){if(!battle)return;const i=$('[data-chat-input]');if(!i||!i.value.trim())return;battle.chat.push({name:me().name,text:i.value.trim()});i.value='';render();const box=$('[data-chat]');if(box)box.classList.remove('collapsed')}
function useSlot(slot){
 if(!battle||battle.ended||battle.busy)return;
 const idx=combatSlots.findIndex(x=>x[0]===slot),unlocked=Math.max(0,Math.min(6,Number(S().arena?.combatSlotsUnlocked??3)));if(idx<0||idx>unlocked)return;
 const c=S().consumables||{};if(Number(c[slot]||0)<=0)return;c[slot]--;
 if(slot==='elixir_hp'){battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp+30);battle.logs.push('🧪 +30 HP')}
 else if(slot==='elixir_energy'){S().energy=Math.min(Number(S().maxEnergy||200),Number(S().energy||0)+20);battle.logs.push('🔵 +20 энергии')}
 else if(slot==='elixir_attack'){battle.attackBuff+=5;battle.logs.push('🔥 +5 атака на следующий удар')}
 else if(slot==='elixir_guard'){battle.guardBuff+=5;battle.logs.push('🛡️ +5 защита на следующий удар')}
 else if(slot==='adrenaline'){battle.playerReadyAt=Math.max(Date.now(),battle.playerReadyAt-700);battle.logs.push('⚡ Перезарядка сокращена')}
 else if(slot==='speed_scroll'){battle.playerReadyAt=Math.max(Date.now(),battle.playerReadyAt-1000);battle.logs.push('📜 −1 секунда перезарядки')}
 else if(slot==='anti_speed_scroll'){battle.botReadyAt=Math.max(Date.now()+500,battle.botReadyAt+1000);battle.logs.push('🐌 Сопернику +1 секунда')}
 save('arena-item');render();
}
function chooseGear(slot){
 if(!battle||battle.ended)return;
 const e=equipment().find(x=>x?.slot===slot);
 if(!e){battle.logs.push(`◉ ${gearSlots.find(x=>x[0]===slot)?.[2]||slot}: слот пуст`);render();return}
 battle.logs.push(`⚔️ ${e.name||'Предмет'} экипирован`);
 battle.player=fighter(me(),'player');battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp);
 render();
}
function exitBattle(){if(!battle)return;stopTimer();battle=null;openHub()}
function surrender(){if(battle&&!battle.ended)finish(false)}
document.addEventListener('click',e=>{
 const t=e.target.closest?.('button');if(!t)return;
 if(t.id==='arenaClose'){hide();return}
 if(t.dataset.arenaFind){start(roster()[Math.floor(Math.random()*roster().length)]);return}
 if(t.dataset.profileId){openProfile(t.dataset.profileId);return}
 if(t.dataset.arenaHub){openHub();return}
 if(t.dataset.profileFight){start(profile(t.dataset.profileFight));return}
 if(t.dataset.defenseZone){selectDefense(t.dataset.defenseZone);return}
 if(t.dataset.attackZone){selectAttack(t.dataset.attackZone);return}
 if(t.dataset.executeAttack){executeAttack();return}
 if(t.dataset.autobattleToggle){toggleAuto();return}
 if(t.dataset.combatSlot){useSlot(t.dataset.combatSlot);return}
 if(t.dataset.gear){chooseGear(t.dataset.gear);return}
 if(t.dataset.surrender){surrender();return}
 if(t.dataset.exitBattle){exitBattle();return}
 if(t.dataset.chatSend){sendChat();return}
 if(t.dataset.arenaNav){if(t.dataset.arenaNav==='battle')return;hide();window.showScreen?.(t.dataset.arenaNav==='home'?'home':t.dataset.arenaNav);return}
});
window.ArenaGame={open,openHub,startBattle:start,close:hide};
})();