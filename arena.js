/* Territory Game — Arena Combat UI v2 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const save=()=>window.TerritoryStore?.saveNow?.('arena');
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
const styles={crit:{name:'Крит',icon:'💥',mods:{attack:5,defense:0,crit:.14,dodge:.03,resilience:0,maxHp:0}},tank:{name:'Танк',icon:'🛡️',mods:{attack:1,defense:8,crit:0,dodge:-.02,resilience:.12,maxHp:35}},dodge:{name:'Уворот',icon:'💨',mods:{attack:2,defense:1,crit:.04,dodge:.14,resilience:0,maxHp:0}},resilience:{name:'Стойкость',icon:'🧱',mods:{attack:2,defense:4,crit:.02,dodge:0,resilience:.22,maxHp:18}}};
const gearSlots=[['weapon','⚔️','Оружие'],['helmet','🪖','Шлем'],['armor','🛡️','Броня'],['belt','🎗️','Пояс'],['boots','🥾','Сапоги'],['ring','💍','Кольцо'],['amulet','🔮','Амулет']];
const combatSlots=[['elixir_hp','🧪','HP'],['elixir_energy','🔵','Энергия'],['elixir_attack','🔥','Атака'],['elixir_guard','🛡️','Защита'],['adrenaline','⚡','Адреналин'],['speed_scroll','📜','Ускорение'],['anti_speed_scroll','🐌','Антиускорение']];
let battle=null,selectedProfile=null;
function root(){const m=$('#arenaModal'),b=$('#arenaModalBody');return m&&b?{m,b}:null}
function roster(){const l=Math.max(1,Number(S().level)||1),n=['Эйрик','Хальвдан','Сигурд','Рагнар','Ивар','Бьёрн'];return n.map((name,i)=>({id:'arena-bot-'+i,name,level:Math.max(1,l+i%3-1),class:['duelist','berserker','tank','assassin'][i%4],rating:820+(5-i)*42, wins:18+i*7,losses:6+i*3,avatar:['⚔️','🪓','🛡️','🏹','🗡️','🔱'][i],isBot:true}))}
function me(){const s=S();return{id:'player',name:String(s.profile?.displayName||s.name||'Игрок'),level:Math.max(1,Number(s.level)||1),rating:Number(s.arena?.rating)||1000,wins:Number(s.arena?.wins)||0,losses:Number(s.arena?.losses)||0,avatar:'⚔️',class:'duelist'}}
function loadout(){const k=String(S().arena?.loadout||'crit');return styles[k]?k:'crit'}
function profile(id){return id==='player'?me():roster().find(x=>x.id===id)}
function open(){openHub()}
function openHub(){stopBattleTimer();const r=root();if(!r)return;r.m.classList.remove('arena-in-battle');battle=null;selectedProfile=null;r.b.innerHTML=`<div class="arena-hub"><div class="arena-hero"><div><small>СОРЕВНОВАТЕЛЬНАЯ АРЕНА</small><h1>⚔️ АРЕНА</h1><p>Тактические бои 1×1.</p></div><div class="arena-rating"><span>РЕЙТИНГ</span><b>${me().rating}</b><small>${me().wins} побед · ${me().losses} поражений</small></div></div><button class="arena-start" data-arena-find>⚔️ НАЙТИ СОПЕРНИКА</button><div class="arena-section-title"><b>🏆 ТОП АРЕНЫ</b><small>Профиль игрока</small></div><div class="arena-top">${roster().map((p,i)=>`<button class="arena-top-row" data-profile-id="${p.id}"><strong>${i+1}</strong><span class="arena-avatar">${p.avatar}</span><span class="arena-player-copy"><b>${esc(p.name)}</b><small>Lv.${p.level}</small></span><span class="arena-player-rating">${p.rating}</span></button>`).join('')}</div></div>`;r.m.classList.add('show');r.m.setAttribute('aria-hidden','false')}
function openProfile(id){const p=profile(id);if(!p)return;selectedProfile=p;const r=root();r.b.innerHTML=`<div class="arena-profile"><button class="arena-back" data-arena-hub>‹ АРЕНА</button><div class="profile-hero"><div class="profile-big-avatar">${p.avatar}</div><div><small>ИГРОК</small><h1>${esc(p.name)}</h1><p>Уровень ${p.level}</p></div></div><div class="profile-stats"><div><small>РЕЙТИНГ</small><b>${p.rating}</b></div><div><small>ПОБЕДЫ</small><b>${p.wins}</b></div><div><small>ПОРАЖЕНИЯ</small><b>${p.losses}</b></div><div><small>КЛАСС</small><b>${esc(p.class)}</b></div></div>${id!=='player'?'<button class="arena-start" data-profile-fight="'+id+'">⚔️ ВЫЗВАТЬ НА БОЙ</button>':''}</div>`}
function fighter(p,side){const s=S(),k=side==='player'?loadout():(p.class==='tank'?'tank':p.class==='assassin'?'dodge':p.class==='berserker'?'crit':'resilience'),m=styles[k].mods,max=side==='player'?Math.max(1,Number(s.maxHp)||120)+m.maxHp:100+p.level*12+m.maxHp;return{id:side,name:p.name,level:p.level,hp:max,maxHp:max,attack:(Number(s.strength)||8)+(m.attack||0),defense:(Number(s.defense)||3)+(m.defense||0),crit:.06+(m.crit||0),dodge:.03+(m.dodge||0),resilience:m.resilience||0,style:k}}
function start(op){
  const r=root();if(!r)return;
  battle={mode:'1v1',player:fighter(me(),'player'),bot:fighter(op,'bot'),opponent:op,turn:1,playerDefense:[],attackZone:'',botDefense:[],auto:false,busy:false,logs:[`⚔️ Бой начался: ${me().name} против ${op.name}`],chat:[],ended:false,pendingResult:null,exited:{player:false,bot:false},startedAt:Date.now(),playerReadyAt:0,botReadyAt:0,baseCooldown:60000,timer:null};
  startBattleTimer();render();
}
function render(){const r=root(),p=battle.player,b=battle.bot;if(!r)return;r.m.classList.add('arena-in-battle');r.b.innerHTML=`<div class="arena-battle" data-battle-root><div class="battle-header"><button class="arena-back" data-arena-hub>‹</button><b>ХОД ${battle.turn}</b><span>Рейтинг ${me().rating}</span></div><div class="battle-stage"><div class="fighter-wrap player-wrap">${fighterMarkup(p)}</div><div class="fighter-wrap bot-wrap">${fighterMarkup(b)}</div><div class="battle-zone-controls defense-controls"><div class="side-zone-title">ЗАЩИТА · 2</div>${zones.map(z=>`<button data-defense-zone="${z[0]}">${z[1]}</button>`).join('')}</div><div class="battle-zone-controls attack-controls"><div class="side-zone-title">АТАКА · 1</div>${zones.map(z=>`<button data-attack-zone="${z[0]}">${z[1]}</button>`).join('')}</div></div><div class="battle-command-row"><span class="tactic-mini">2 🛡️ + 1 ⚔️</span><button class="command-auto" data-autobattle-toggle aria-pressed="${battle.auto?'true':'false'}"><span>↻</span><small>${battle.auto?'✓':'АВТО'}</small></button><button class="command-hit" data-execute-attack disabled>⚔️ УДАР</button><strong data-cooldown>Готов</strong></div>${combatBar()}<div class="battle-chat-wrap"><button class="battle-chat-toggle" type="button" data-chat-toggle aria-expanded="false">💬 История и чат <span>⌄</span></button><div class="battle-chat collapsed" data-chat>${chatHtml()}</div></div>${bottomNav()}</div>`;sync();bindBattleControls();
const chatToggle=document.querySelector('[data-chat-toggle]');
const chatBox=document.querySelector('[data-chat]');
if(chatToggle&&chatBox){
  chatToggle.addEventListener('click',()=>{
    const open=chatBox.classList.toggle('collapsed')===false;
    chatToggle.setAttribute('aria-expanded',open?'true':'false');
    chatToggle.querySelector('span').textContent=open?'⌃':'⌄';
  });
}
}
function fighterMarkup(u){return `<div class="combat-fighter ${u.id}"><div class="fighter-name">${esc(u.name)} <small>Lv.${u.level}</small></div><div class="fighter-hp-top">${u.hp}/${u.maxHp} ❤️</div><div class="fighter-body"><div class="hero-head"><i></i></div><div class="hero-torso"></div><div class="hero-belt"></div><div class="hero-arm arm-back"></div><div class="hero-arm arm-front"><span class="weapon">⚔️</span></div><div class="hero-leg leg-back"></div><div class="hero-leg leg-front"></div></div></div>`}
function combatBar(){return `<div class="combat-loadout-strip"><div class="combat-section-head"><b>СНАРЯЖЕНИЕ</b></div><div class="combat-item-row gear-row">${gearSlots.map(g=>`<button class="combat-item-slot" data-gear="${g[0]}"><strong>${g[1]}</strong><span>${g[2]}</span></button>`).join('')}</div><div class="combat-section-head consumables-head"><b>ЭЛИКСИРЫ И БОЕВЫЕ ПРЕДМЕТЫ</b></div><div class="combat-item-row elixir-row">${combatSlots.map((g,i)=>`<button class="combat-item-slot ${i>Number(S().arena?.combatSlotsUnlocked??3)?'locked':''}" data-combat-slot="${g[0]}"><strong>${i>Number(S().arena?.combatSlotsUnlocked??3)?'🔒':g[1]}</strong><span>${g[2]}</span><small>${i>Number(S().arena?.combatSlotsUnlocked??3)?'Открывается':`×${Number(S().consumables?.[g[0]]||0)}`}</small></button>`).join('')}</div></div>`}
function chatHtml(){return [...battle.logs.map(x=>`<div class="chat-line system">${esc(x)}</div>`),...battle.chat.map(x=>`<div class="chat-line"><b>${esc(x.name)}:</b> ${esc(x.text)}</div>`)].join('')+`<div class="chat-compose"><input data-chat-input maxlength="180" placeholder="Написать сообщение…"><button data-chat-send>➤</button></div>`}
function bottomNav(){return `<nav class="arena-bottom-nav">${[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['game','🎲','Игры'],['clan','🚩','Клан']].map(x=>`<button data-arena-nav="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('')}</nav>`}
function startBattleTimer(){
  if(battle?.timer)clearInterval(battle.timer);
  if(!battle)return;
  battle.timer=setInterval(()=>{
    if(!battle)return;
    const now=Date.now();
    if(battle.pendingResult&&now>=battle.pendingResult.readyAt){const r=battle.pendingResult;battle.pendingResult=null;finalize(r.win);return;}
    if(!battle.ended&&!battle.pendingResult&&battle.botReadyAt&&now>=battle.botReadyAt){battle.botReadyAt=0;botTurn();return;}
    if(!battle.ended&&!battle.pendingResult&&battle.auto&&cooldownLeft()<=0)autoStep();
    sync();
  },250);
}
function stopBattleTimer(){if(battle?.timer){clearInterval(battle.timer);battle.timer=null;}}
function cooldownLeft(){return Math.max(0,(battle?.playerReadyAt||0)-Date.now());}
function botCooldownLeft(){return Math.max(0,(battle?.botReadyAt||0)-Date.now());}
function botDelay(){return 25000+Math.floor(Math.random()*30001);}
function battleElapsed(){return battle?Date.now()-battle.startedAt:0;}
function usesTurnTimer(){return !!battle&&battle.mode!=='1v1';}
function minBattleLeft(){return usesTurnTimer()?Math.max(0,30000-battleElapsed()):0;}
function formatClock(ms){const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function bindBattleControls(){
  const r=root();if(!r||!battle)return;
  const exec=r.b.querySelector('[data-execute-attack]');if(exec)exec.onclick=e=>{e.preventDefault();executeAttack();};
  const auto=r.b.querySelector('[data-autobattle-toggle]');if(auto)auto.onclick=e=>{e.preventDefault();toggleAuto();};
  r.b.querySelectorAll('[data-defense-zone]').forEach(btn=>btn.onclick=e=>{e.preventDefault();selectDefense(btn.dataset.defenseZone);});
  r.b.querySelectorAll('[data-attack-zone]').forEach(btn=>btn.onclick=e=>{e.preventDefault();selectAttack(btn.dataset.attackZone);});
  r.b.querySelectorAll('[data-combat-slot]').forEach(btn=>btn.onclick=e=>{e.preventDefault();useSlot(btn.dataset.combatSlot);});
}
function selectDefense(z){if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0)return;const i=battle.playerDefense.indexOf(z);if(i>=0)battle.playerDefense.splice(i,1);else if(battle.playerDefense.length<2)battle.playerDefense.push(z);sync();}
function selectAttack(z){if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0)return;battle.attackZone=z;sync();}
function toggleAuto(){if(!battle||battle.ended)return;battle.auto=!battle.auto;if(battle.auto&&cooldownLeft()<=0)autoStep();else sync();}
function sync(){
  const r=root();if(!r||!battle)return;
  const cd=cooldownLeft(),minLeft=minBattleLeft();
  r.b.querySelectorAll('[data-defense-zone]').forEach(x=>{x.classList.toggle('selected',battle.playerDefense.includes(x.dataset.defenseZone));x.disabled=!!battle.busy||battle.ended||!!battle.pendingResult||cd>0;});
  r.b.querySelectorAll('[data-attack-zone]').forEach(x=>{x.classList.toggle('selected',x.dataset.attackZone===battle.attackZone);x.disabled=!!battle.busy||battle.ended||!!battle.pendingResult||cd>0;});
  const btn=r.b.querySelector('[data-execute-attack]'),status=r.b.querySelector('[data-status]'),clock=r.b.querySelector('[data-cooldown]');
  const ready=battle.playerDefense.length===2&&!!battle.attackZone&&!battle.busy&&!battle.ended&&!battle.pendingResult&&cd<=0;
  if(btn)btn.disabled=!ready;
  if(clock)clock.textContent=cd>0?`Твой удар ${formatClock(cd)}`:battle.pendingResult?`Мин. бой ${formatClock(minLeft)}`:(botCooldownLeft()>0?`Бот: ${formatClock(botCooldownLeft())}`:'Готов к ходу');
  if(status)status.textContent=battle.pendingResult?`Исход определён · минимум боя ${formatClock(minLeft)}`:cd>0?`Перезарядка удара · ${formatClock(cd)}`:battle.busy?'Ход выполняется…':battle.playerDefense.length<2?`Выбрано защит: ${battle.playerDefense.length}/2`:!battle.attackZone?'Теперь выбери зону атаки':'Готово: нажми «ВЫПОЛНИТЬ УДАР»';
}
function executeAttack(){
  if(!battle||battle.busy||battle.ended||battle.pendingResult||cooldownLeft()>0||battle.playerDefense.length!==2||!battle.attackZone)return;
  battle.busy=true;const p=battle.player,b=battle.bot;let dmg=Math.max(1,p.attack-b.defense);
  if(Math.random()<b.dodge)battle.logs.push('💨 Соперник увернулся');
  else{if(battle.botDefense.includes(battle.attackZone))dmg=Math.max(1,Math.floor(dmg*.25));if(Math.random()<p.crit){dmg=Math.floor(dmg*1.8);battle.logs.push(`💥 Критический удар: ${dmg}`);}else battle.logs.push(`⚔️ Ты нанёс ${dmg} урона`);b.hp=Math.max(0,b.hp-dmg);}
  battle.playerReadyAt=Date.now()+battle.baseCooldown;battle.botReadyAt=Date.now()+botDelay();battle.busy=false;battle.attackZone='';
  if(b.hp<=0){finish(true);return;}render();
}
function botTurn(){
  if(!battle||battle.ended||battle.pendingResult)return;
  const p=battle.player,b=battle.bot,atk=zones[Math.floor(Math.random()*4)][0],def1=zones[Math.floor(Math.random()*4)][0];let def2=zones[Math.floor(Math.random()*4)][0];
  while(def2===def1)def2=zones[Math.floor(Math.random()*4)][0];battle.botDefense=[def1,def2];
  let dmg=Math.max(1,b.attack-p.defense);if(battle.playerDefense.includes(atk))dmg=Math.max(1,Math.floor(dmg*.25));
  if(Math.random()<p.dodge)battle.logs.push('💨 Ты увернулся от удара');else if(Math.random()<b.crit){dmg=Math.floor(dmg*1.8);battle.logs.push(`💥 Критический удар соперника: ${dmg}`);p.hp=Math.max(0,p.hp-dmg);}else{p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`🛡️ Соперник нанёс ${dmg} урона`);}
  if(p.hp<=0){finish(false);return;}battle.turn++;battle.playerDefense=[];battle.attackZone='';render();
}
function autoStep(){
  if(!battle||battle.ended||battle.busy||battle.pendingResult||cooldownLeft()>0||!battle.auto)return;
  const d1=zones[Math.floor(Math.random()*4)][0];let d2=zones[Math.floor(Math.random()*4)][0];while(d2===d1)d2=zones[Math.floor(Math.random()*4)][0];
  battle.playerDefense=[d1,d2];battle.attackZone=zones[Math.floor(Math.random()*4)][0];sync();setTimeout(()=>{if(battle?.auto&&!battle.ended&&cooldownLeft()<=0)executeAttack();},250);
}
function finalize(win){if(!battle)return;battle.ended=true;battle.busy=false;battle.playerReadyAt=0;battle.botReadyAt=0;stopBattleTimer();battle.logs.push(win?'🏆 Победа!':'☠️ Ты проиграл. Бой завершён.');render();}
function finish(win){
  if(!battle||battle.ended||battle.pendingResult)return;
  const wait=minBattleLeft();
  if(wait>0){battle.pendingResult={win,readyAt:Date.now()+wait};battle.busy=true;battle.logs.push('⏳ Исход определён. Минимальная длительность боя — 30 секунд.');sync();return;}
  finalize(win);
}
function sendChat(){if(!battle)return;const i=$('[data-chat-input]');if(!i||!i.value.trim())return;battle.chat.push({name:me().name,text:i.value.trim()});i.value='';render();setTimeout(()=>{const c=$('[data-chat]');if(c)c.scrollTop=c.scrollHeight},0)}
function exitBattle(){if(!battle)return;if(!battle.ended){if(!confirm('Выйти из текущего боя?'))return;}battle.exited.player=true;localStorage.removeItem('territory_active_arena_room');openHub()}
function useSlot(slot){
  if(!battle||battle.ended)return;
  const idx=combatSlots.findIndex(x=>x[0]===slot);if(idx<0||idx>Number(S().arena?.combatSlotsUnlocked??3))return;
  const c=S().consumables||{};
  if(slot==='speed_scroll'&&Number(c[slot]||0)>0&&cooldownLeft()>0){
    const floor=usesTurnTimer()?battle.startedAt+30000:Date.now();
    battle.playerReadyAt=Math.max(floor,battle.playerReadyAt-10000);
    c[slot]--;save();battle.logs.push('📜 Свиток ускорения: −10 секунд.');render();return;
  }
  if(slot==='anti_speed_scroll'&&Number(c[slot]||0)>0&&cooldownLeft()>0){
    battle.playerReadyAt=Math.min(Date.now()+60000,battle.playerReadyAt+10000);
    c[slot]--;save();battle.logs.push('🐌 Свиток антиускорения: +10 секунд. Максимум ожидания — 60 секунд.');render();return;
  }
  if(slot==='adrenaline'){
    battle.logs.push('⚡ Адреналин доступен только в командных боях 3×3/хаос.');
    render();return;
  }
  if(slot==='elixir_hp'&&Number(c[slot]||0)>0){c[slot]--;battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp+30);battle.logs.push('🧪 Использовано зелье HP');save();render();}
}
function performTeamUtility(label,fn){
  if(!battle||battle.ended||battle.busy)return false;
  fn();battle.logs.push(`🧩 ${label}: ход пропущен.`);battle.turn++;battle.playerDefense=[];battle.attackZone='';battle.playerReadyAt=Date.now()+battle.baseCooldown;render();return true;
}
function chooseGear(slot){if(!battle)return;const keys=Object.keys(styles);const k=keys[(keys.indexOf(battle.player.style)+1)%keys.length];
  if(battle.mode!=='1v1'){
    performTeamUtility('Переодевание',()=>{battle.player.style=k;});
    return;
  }
  battle.player.style=k;battle.logs.push(`👕 ${gearSlots.find(x=>x[0]===slot)?.[2]||'Предмет'}: выбран комплект «${styles[k].name}»`);render()}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.id==='arenaClose'){root()?.m.classList.remove('show');return}if(t.dataset.arenaFind){start(roster()[Math.floor(Math.random()*roster().length)]);return}if(t.dataset.profileId){openProfile(t.dataset.profileId);return}if(t.dataset.arenaHub){openHub();return}if(t.dataset.profileFight){start(profile(t.dataset.profileFight));return}if(t.dataset.gear){chooseGear(t.dataset.gear);return}if(t.dataset.chatSend){sendChat();return}if(t.dataset.surrender){if(battle&&!battle.ended)finish(false);return}if(t.dataset.exitBattle){exitBattle();return}if(t.dataset.arenaNav){if(t.dataset.arenaNav==='battle')return;root()?.m.classList.remove('show');window.showScreen?.(t.dataset.arenaNav==='home'?'home':t.dataset.arenaNav);return}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.matches('[data-chat-input]'))sendChat()});
window.ArenaGame={open,openHub,startBattle:start,close:()=>root()?.m.classList.remove('show')};
})();
