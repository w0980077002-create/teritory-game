/* Territory Game — Arena: tactical 1x1, itemized combat bar, timed consumables, compact autobattle */
(function(){
  'use strict';

  const S=()=>window.TerritoryStore?.state;
  const save=()=>window.TerritoryStore?.saveNow?.('arena');
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
  const botNames=['Эйрик','Хальвдан','Сигурд','Рагнар','Ивар','Бьёрн'];
  const classes=['duelist','berserker','tank','assassin'];

  /* Battle equipment is a real layer, not cosmetic-only. The same slots can later be fed by Inventory/Shop items. */
  const LOADOUTS={
    crit:{
      name:'Крит',icon:'💥',tag:'Урон',weapon:'Клинок викинга',helmet:'Шлем охотника',armor:'Кожаная куртка',belt:'Пояс ловкача',boots:'Сапоги рейдера',
      mods:{attack:5,defense:0,crit:.14,dodge:.03,resilience:0,maxHp:0}
    },
    tank:{
      name:'Танк',icon:'🛡️',tag:'Защита',weapon:'Тяжёлый топор',helmet:'Стальной шлем',armor:'Тяжёлый доспех',belt:'Пояс стража',boots:'Бронированные сапоги',
      mods:{attack:1,defense:8,crit:0,dodge:-.02,resilience:.12,maxHp:35}
    },
    dodge:{
      name:'Уворот',icon:'💨',tag:'Скорость',weapon:'Парные клинки',helmet:'Маска следопыта',armor:'Лёгкая кожа',belt:'Тонкий пояс',boots:'Теневые сапоги',
      mods:{attack:2,defense:1,crit:.04,dodge:.14,resilience:0,maxHp:0}
    },
    resilience:{
      name:'Стойкость',icon:'🧱',tag:'Стабильность',weapon:'Боевой молот',helmet:'Шлем ветерана',armor:'Кольчуга',belt:'Пояс ветерана',boots:'Сапоги ветерана',
      mods:{attack:2,defense:4,crit:.02,dodge:0,resilience:.22,maxHp:18}
    }
  };

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
        id:'arena-bot-'+i,name,level:lvl,class:classes[i%classes.length],
        rating:Math.max(820,1000+(5-i)*42-lvl*2),wins:18+i*7,losses:6+i*3,
        avatar:['⚔️','🪓','🛡️','🏹','🗡️','🔱'][i],power:38+lvl*4+i*3,isBot:true
      };
    });
  }

  function humanProfile(){
    const s=S()||{};
    return {
      id:'player',name:String(s.profile?.displayName||s.name||'Игрок'),level:Math.max(1,Number(s.level)||1),
      rating:Math.max(0,Number(s.arena?.rating)||1000),wins:Math.max(0,Number(s.arena?.wins)||0),
      losses:Math.max(0,Number(s.arena?.losses)||0),avatar:'⚔️',class:'duelist',
      power:Math.max(1,Math.floor((Number(s.strength)||5)+(Number(s.agility)||5)+(Number(s.defense)||0))),isBot:false
    };
  }

  function storedLoadout(){
    const key=String(S()?.arena?.loadout||'crit');
    return LOADOUTS[key]?key:'crit';
  }

  function fighterFromProfile(profile,side){
    const s=S()||{},ag=Math.max(1,Number(s.agility)||5),baseMax=Math.max(1,Number(s.maxHp)||120);
    if(side==='player'){
      const buff=s.combatBuffs||{},key=storedLoadout(),set=LOADOUTS[key],m=set.mods;
      const max=baseMax+m.maxHp;
      return {
        id:'player',name:profile.name,level:profile.level,hp:Math.max(0,Math.min(max,Number(s.hp??max))),maxHp:max,
        baseAttack:Math.max(1,Math.floor(Number(s.strength)||5)),baseDefense:Math.max(0,Number(s.defense)||0),baseCrit:(5+Math.floor(ag*.75))/100,
        baseDodge:(2+Math.floor(ag*.5))/100,attack:1,defense:0,crit:0,dodge:0,resilience:0,class:'duelist',loadout:key,
        weapon:set.weapon,buffAttack:Number(buff.attack)||0,buffDefense:Number(buff.defense)||0,slotOverrides:Object.assign({},s.arena?.slotOverrides||{})
      };
    }
    const lvl=profile.level;
    const key=profile.class==='tank'?'tank':profile.class==='assassin'?'dodge':profile.class==='berserker'?'crit':'resilience';
    const set=LOADOUTS[key],m=set.mods,max=90+lvl*12+m.maxHp;
    return {
      id:profile.id,name:profile.name,level:lvl,hp:max,maxHp:max,baseAttack:10+lvl*2,baseDefense:2+Math.floor(lvl/2),baseCrit:.08,baseDodge:.06,
      attack:1,defense:0,crit:0,dodge:0,resilience:0,class:profile.class,loadout:key,weapon:set.weapon,buffAttack:0,buffDefense:0
    };
  }

  function recalcFighter(u){
    if(!u)return;
    const baseSet=LOADOUTS[u.loadout]||LOADOUTS.crit;
    if(u.id!=='player'){
      const m=baseSet.mods;u.attack=Math.max(1,u.baseAttack+m.attack);u.defense=Math.max(0,u.baseDefense+m.defense);u.crit=Math.min(.5,Math.max(.01,u.baseCrit+m.crit));u.dodge=Math.min(.45,Math.max(0,u.baseDodge+m.dodge));u.resilience=Math.min(.6,Math.max(0,m.resilience));
      const newMax=Math.max(1,90+u.level*12+m.maxHp);const ratio=u.maxHp?u.hp/u.maxHp:1;u.maxHp=newMax;u.hp=Math.max(1,Math.min(newMax,Math.round(newMax*ratio)));u.weapon=baseSet.weapon;return;
    }
    const s=S()||{},buff=s.combatBuffs||{};
    const selected=['weapon','helmet','armor','belt','boots'].map(slot=>selectedKey(u,slot));
    const mods=selected.map(k=>LOADOUTS[k]?.mods||LOADOUTS.crit.mods);
    // Each individual item contributes a defined part of its style. This keeps a one-slot swap a one-slot swap.
    const attack=mods.reduce((v,m)=>v+(m.attack||0),0)/5;
    const defense=mods.reduce((v,m)=>v+(m.defense||0),0);
    const crit=mods.reduce((v,m)=>v+(m.crit||0),0)/5;
    const dodge=mods.reduce((v,m)=>v+(m.dodge||0),0)/5;
    const resilience=mods.reduce((v,m)=>v+(m.resilience||0),0)/5;
    const hpBonus=mods.reduce((v,m)=>v+(m.maxHp||0),0)/5;
    u.attack=Math.max(1,u.baseAttack+Math.round(attack)+Number(buff.attack||0));
    u.defense=Math.max(0,u.baseDefense+Math.round(defense)+Number(buff.defense||0));
    u.crit=Math.min(.5,Math.max(.01,u.baseCrit+crit));u.dodge=Math.min(.45,Math.max(0,u.baseDodge+dodge));u.resilience=Math.min(.6,Math.max(0,resilience));
    const newMax=Math.max(1,(Number(s.maxHp)||120)+Math.round(hpBonus));const ratio=u.maxHp?u.hp/u.maxHp:1;u.maxHp=newMax;u.hp=Math.max(1,Math.min(newMax,Math.round(newMax*ratio)));u.weapon=(LOADOUTS[selectedKey(u,'weapon')]||baseSet).weapon;
  }

  function openHub(){
    stopCooldownTicker();const root=ensureRoot();if(!root)return;
    battle=null;selectedProfile=null;root.body.innerHTML=hubMarkup();
    root.modal.classList.add('show');root.modal.setAttribute('aria-hidden','false');
  }

  function hubMarkup(){
    const me=humanProfile(),top=botRoster().sort((a,b)=>b.rating-a.rating);
    return `<div class="arena-hub">
      <div class="arena-hero"><div><small>СОРЕВНОВАТЕЛЬНАЯ АРЕНА</small><h1>⚔️ АРЕНА</h1><p>Тактические бои 1×1. Удар, защита и смена боевого комплекта прямо в бою.</p></div>
        <div class="arena-rating"><span>РЕЙТИНГ</span><b>${me.rating}</b><small>${me.wins} побед · ${me.losses} поражений</small></div></div>
      <button class="arena-start" data-arena-find>⚔️ НАЙТИ СОПЕРНИКА</button>
      <div class="arena-build-preview"><div><small>ТЕКУЩИЙ КОМПЛЕКТ</small><b>${LOADOUTS[storedLoadout()].icon} ${LOADOUTS[storedLoadout()].name}</b></div><span>${loadoutSummary(storedLoadout())}</span></div>
      <div class="arena-section-title"><b>🏆 ТОП АРЕНЫ</b><small>Нажми на игрока, чтобы открыть профиль</small></div>
      <div class="arena-top">${top.map((p,i)=>topRow(p,i)).join('')}</div>
    </div>`;
  }

  function loadoutSummary(key){
    const m=LOADOUTS[key].mods;
    const out=[];if(m.crit)out.push('Крит +'+Math.round(m.crit*100)+'%');if(m.dodge)out.push('Уворот +'+Math.round(m.dodge*100)+'%');if(m.resilience)out.push('Стойкость +'+Math.round(m.resilience*100)+'%');if(m.defense)out.push('Защита +'+m.defense);return out.join(' · ')||'Сбалансированный комплект';
  }

  function topRow(p,i){
    return `<button class="arena-top-row" data-profile-id="${esc(p.id)}"><strong>${i+1}</strong><span class="arena-avatar">${p.avatar}</span>
      <span class="arena-player-copy"><b>${esc(p.name)}</b><small>Lv.${p.level} · ${className(p.class)}</small></span><span class="arena-player-rating">${p.rating}</span></button>`;
  }

  function className(c){return ({duelist:'Дуэлянт',berserker:'Берсерк',tank:'Страж',assassin:'Ассасин'})[c]||'Воин';}

  function openProfile(id){
    const p=id==='player'?humanProfile():botRoster().find(x=>x.id===id);if(!p)return;selectedProfile=p;
    const root=ensureRoot();if(!root)return;
    root.body.innerHTML=`<div class="arena-profile"><button class="arena-back" data-arena-hub>‹ АРЕНА</button>
      <div class="profile-hero"><div class="profile-big-avatar">${p.avatar}</div><div><small>ИГРОК</small><h1>${esc(p.name)}</h1><p>Уровень ${p.level} · ${className(p.class)}</p></div></div>
      <div class="profile-stats"><div><small>РЕЙТИНГ</small><b>${p.rating}</b></div><div><small>ПОБЕДЫ</small><b>${p.wins}</b></div><div><small>ПОРАЖЕНИЯ</small><b>${p.losses}</b></div><div><small>СИЛА</small><b>${p.power}</b></div></div>
      <div class="profile-build"><small>БОЕВОЙ СТИЛЬ</small><b>${styleForProfile(p).icon} ${styleForProfile(p).name}</b><span>${loadoutSummary(styleForProfile(p).key)}</span></div>
      <button class="arena-start" data-profile-fight="${esc(p.id)}">⚔️ ВЫЗВАТЬ НА БОЙ</button></div>`;
  }

  function styleForProfile(p){
    const key=p.id==='player'?storedLoadout():(p.class==='tank'?'tank':p.class==='assassin'?'dodge':p.class==='berserker'?'crit':'resilience');
    return Object.assign({key},LOADOUTS[key]);
  }

  function findOpponent(){
    const me=humanProfile(),pool=botRoster().filter(p=>Math.abs(p.rating-me.rating)<=220),p=pool[Math.floor(Math.random()*pool.length)]||botRoster()[0];startBattle(p);
  }

  function startBattle(opponent){
    const root=ensureRoot();if(!root)return;const me=humanProfile();
    battle={player:fighterFromProfile(me,'player'),bot:fighterFromProfile(opponent,'bot'),opponent,turn:1,busy:false,playerDefense:'',auto:false,itemPanel:'',cooldowns:{},timerTick:null};startCooldownTicker();
    recalcFighter(battle.player);recalcFighter(battle.bot);renderBattle();
  }

  function startCooldownTicker(){
    if(battle?.timerTick)clearInterval(battle.timerTick);
    if(!battle)return;
    battle.timerTick=setInterval(()=>{
      if(!battle){return;}
      renderCombatItems();
      if(battle.itemPanel)openItemPanel(battle.itemPanel);
    },1000);
  }

  function stopCooldownTicker(){if(battle?.timerTick){clearInterval(battle.timerTick);battle.timerTick=null;}}

  function renderBattle(){
    const root=ensureRoot();if(!root||!battle)return;const p=battle.player,b=battle.bot;
    root.body.innerHTML=`<div class="arena-battle" data-battle-root>
      <div class="battle-header"><button class="arena-back" data-arena-hub>‹ Арена</button><b>ХОД ${battle.turn}</b><span>Рейтинг ${S()?.arena?.rating||1000}</span></div>
      <div class="battle-stage"><div class="fighter-wrap player-wrap">${fighterMarkup('player',p)}</div><div class="fighter-wrap bot-wrap">${fighterMarkup('bot',b)}</div><div class="damage-layer" data-damage-layer></div>
        <div class="battle-zone-controls defense-controls"><div class="side-zone-title">ЗАЩИТА</div>${zones.map(z=>`<button data-defense-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
        <div class="battle-zone-controls attack-controls"><div class="side-zone-title">УДАР</div>${zones.map(z=>`<button data-attack-zone="${z[0]}">${z[1]}</button>`).join('')}</div>
      </div>
      <div class="battle-status"><span data-status>Выбери зону удара</span><b data-player-hp>${p.hp}/${p.maxHp} ❤️</b><b data-bot-hp>${b.hp}/${b.maxHp} ❤️</b></div>
      <div class="combat-loadout-strip">${combatLoadoutStrip(p)}</div>
      <div class="item-action-panel" data-item-action-panel aria-hidden="true"></div>
      <div class="battle-actions"><button data-surrender>Сдаться</button></div><div class="battle-log" data-log></div>
      ${arenaBottomNav()}
    </div>`;
    updateBars();
      }


  function arenaBottomNav(){
    const items=[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['game','🎲','Игры'],['clan','🚩','Клан']];
    return `<nav class="arena-bottom-nav" aria-label="Основное меню">${items.map(([id,icon,label])=>`<button data-arena-nav="${id}" class="${id==='battle'?'active':''}"><span>${icon}</span><b>${label}</b></button>`).join('')}</nav>`;
  }

  const SLOT_ITEMS={
    weapon:[['weapon','⚔️','Оружие','weapon']],
    helmet:[['helmet','🪖','Шлем','helmet']],
    armor:[['armor','🛡️','Броня','armor']],
    belt:[['belt','🎗️','Пояс','belt']],
    boots:[['boots','🥾','Сапоги','boots']],
    ring:[['ring','💍','Кольцо','ring']],
    elixir_hp:[['elixir_hp','🧪','HP','consumable']],
    elixir_energy:[['elixir_energy','🔵','Энергия','consumable']],
    elixir_attack:[['elixir_attack','🔥','Атака','consumable']],
    elixir_guard:[['elixir_guard','🛡️','Защита','consumable']]
  };

  function selectedKey(p,slot){return p?.slotOverrides?.[slot]||p?.loadout||'crit';}

  function equippedItem(p,slot){
    const key=selectedKey(p,slot),set=LOADOUTS[key]||LOADOUTS.crit;
    if(slot==='weapon')return set.weapon;
    if(slot==='helmet')return set.helmet;
    if(slot==='armor')return set.armor;
    if(slot==='belt')return set.belt;
    if(slot==='boots')return set.boots;
    if(slot==='ring')return 'Кольцо викинга';
    return '';
  }

  function combatLoadoutStrip(p){
    const gear=['weapon','helmet','armor','belt','boots','ring'];
    const elixirs=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
    const slotMarkup=(slot)=>{
      const cfg=SLOT_ITEMS[slot][0],type=cfg[3],q=type==='consumable'?Number(S()?.consumables?.[slot]||0):null;
      const name=type==='consumable'?(window.CombatItems?.CATALOG?.[slot]?.name||cfg[2]):equippedItem(p,slot);
      const active=type==='consumable'&&q<=0?'empty':'';
      const timer=type==='consumable'&&battle?.cooldowns?.[slot]?formatTimer(battle.cooldowns[slot]-Date.now()):'';
      return `<button class="combat-item-slot ${active}" data-combat-item="${slot}" title="${esc(name)}"><strong>${cfg[1]}</strong><span>${esc(shortItemName(name))}</span>${type==='consumable'?`<small data-item-count="${slot}">${q}${timer?` · ${timer}`:''}</small>`:''}</button>`;
    };
    const auto=`<button class="combat-auto-button ${battle?.auto?'active':''}" data-autobattle-toggle aria-pressed="${battle?.auto?'true':'false'}" title="Автобой"><strong>↻</strong><small>Авто</small></button>`;
    return `<div class="combat-section-head"><b>СНАРЯЖЕНИЕ</b>${auto}</div>
      <div class="combat-item-row gear-row">${gear.map(slotMarkup).join('')}</div>
      <div class="combat-section-head consumables-head"><b>ЭЛИКСИРЫ</b><small>Нажми на эликсир, чтобы использовать</small></div>
      <div class="combat-item-row elixir-row">${elixirs.map(slotMarkup).join('')}</div>
      <div class="combat-build-line"><span>💥 ${Math.round(p.crit*100)}%</span><span>💨 ${Math.round(p.dodge*100)}%</span><span>🧱 ${Math.round(p.resilience*100)}%</span><span>🛡️ ${Math.round(p.defense)}</span></div>`;
  }

  function shortItemName(name){
    const n=String(name||'Предмет');
    return n.length>12?n.slice(0,11)+'…':n;
  }

  function formatTimer(ms){
    const sec=Math.max(0,Math.ceil(ms/1000));
    if(sec<=0)return '';
    return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  }

  function itemActionMarkup(slot,p){
    const cfg=SLOT_ITEMS[slot]?.[0];if(!cfg)return '';
    const type=cfg[3];
    if(type==='consumable'){
      const d=window.CombatItems?.CATALOG?.[slot];const q=Number(S()?.consumables?.[slot]||0);
      const cd=battle?.cooldowns?.[slot]||0;const left=cd-Date.now();
      return `<div class="item-action-head"><b>${cfg[1]} ${esc(d?.name||cfg[2])}</b><button data-close-item-panel>×</button></div><div class="item-action-copy"><span>${esc(d?.effect||'Боевой расходник')}</span><small>В запасе: ${q}${left>0?' · Перезарядка '+formatTimer(left):''}</small></div><button class="item-action-use" data-use-combat-item="${slot}" ${q<=0||left>0?'disabled':''}>${left>0?'⏱ '+formatTimer(left):q>0?'ИСПОЛЬЗОВАТЬ':'НЕТ В ЗАПАСЕ'}</button>`;
    }
    const set=LOADOUTS[p.loadout]||LOADOUTS.crit;
    const current=equippedItem(p,slot);
    const options=Object.entries(LOADOUTS).map(([key,x])=>{
      const name=slot==='weapon'?x.weapon:slot==='helmet'?x.helmet:slot==='armor'?x.armor:slot==='belt'?x.belt:slot==='boots'?x.boots:'Кольцо викинга';
      return `<button class="item-option ${name===current?'selected':''}" data-equip-slot="${slot}" data-equip-loadout="${key}"><strong>${x.icon}</strong><span><b>${esc(name)}</b><small>${x.name} · ${loadoutSummary(key)}</small></span></button>`;
    }).join('');
    return `<div class="item-action-head"><b>${cfg[1]} ${cfg[2]}</b><button data-close-item-panel>×</button></div><div class="item-action-copy"><span>Текущий предмет: <b>${esc(current)}</b></span><small>Меняется только выбранная вещь.</small></div><div class="item-options">${options}</div>`;
  }

  function openItemPanel(slot){
    if(!battle)return;
    const panel=$('[data-item-action-panel]');if(!panel)return;
    panel.innerHTML=itemActionMarkup(slot,battle.player);panel.classList.add('show');panel.setAttribute('aria-hidden','false');battle.itemPanel=slot;
  }

  function closeItemPanel(){
    const panel=$('[data-item-action-panel]');if(!panel)return;panel.classList.remove('show');panel.setAttribute('aria-hidden','true');panel.innerHTML='';if(battle)battle.itemPanel='';
  }

  function fighterMarkup(side,u){
    const armorKey=selectedKey(u,'armor'),helmetKey=selectedKey(u,'helmet'),beltKey=selectedKey(u,'belt'),bootsKey=selectedKey(u,'boots'),weaponKey=selectedKey(u,'weapon');
    return `<div class="combat-fighter ${side} outfit-${u.loadout} equip-armor-${armorKey} equip-helmet-${helmetKey} equip-belt-${beltKey} equip-boots-${bootsKey}" data-fighter="${u.id}" data-weapon-key="${weaponKey}"><div class="fighter-name">${esc(u.name)} <small>Lv.${u.level}</small></div>
      <div class="fighter-body"><div class="hero-head"><i></i></div><div class="hero-torso"></div><div class="hero-belt"></div><div class="hero-armor-mark"></div><div class="hero-arm arm-back"></div><div class="hero-arm arm-front"><span class="weapon">${weaponIcon((LOADOUTS[weaponKey]||LOADOUTS.crit).weapon)}</span></div><div class="hero-leg leg-back"></div><div class="hero-leg leg-front"></div></div>
      <div class="fighter-hp"><i style="width:100%"></i></div></div>`;
  }

  function weaponIcon(name){if(name.includes('Топор'))return '🪓';if(name.includes('Парные'))return '🗡️';if(name.includes('Молот'))return '🔨';return '⚔️';}

  function updateBars(){
    if(!battle)return;
    for(const u of [battle.player,battle.bot]){const el=$(`[data-fighter="${u.id}"] .fighter-hp i`);if(el)el.style.width=Math.max(0,u.hp/u.maxHp*100)+'%';}
    const p=battle.player,b=battle.bot;
    $('[data-player-hp]')?.replaceChildren(document.createTextNode(`${Math.max(0,p.hp)}/${p.maxHp} ❤️`));
    $('[data-bot-hp]')?.replaceChildren(document.createTextNode(`${Math.max(0,b.hp)}/${b.maxHp} ❤️`));
    const mini=$('.combat-stats-mini');if(mini)mini.innerHTML=`<span>💥 ${Math.round(p.crit*100)}%</span><span>💨 ${Math.round(p.dodge*100)}%</span><span>🧱 ${Math.round(p.resilience*100)}%</span>`;
  }

  function log(t){const el=$('[data-log]');if(el){const d=document.createElement('div');d.textContent=t;el.prepend(d);}}

  function popup(text,crit=false,side='bot'){const layer=$('[data-damage-layer]');if(!layer)return;const el=document.createElement('div');el.className='damage-popup '+(crit?'critical ':'')+side;el.textContent=crit?'💥 '+text:text;layer.appendChild(el);setTimeout(()=>el.remove(),850);}

  function anim(side,type){const el=$(`.fighter-wrap.${side}-wrap`);if(!el)return;el.classList.remove('attack','hit','dodge');void el.offsetWidth;el.classList.add(type);setTimeout(()=>el.classList.remove(type),520);}

  function resolveDamage(attacker,target,attackZone,defenseZone){
    const zoneMatch=attackZone===defenseZone,raw=Math.max(1,attacker.attack+Math.floor(Math.random()*7)-3),crit=Math.random()<attacker.crit;
    let critMultiplier=2-(target.resilience||0);let dmg=Math.max(1,Math.floor(raw*(crit?critMultiplier:1)-Math.floor(target.defense*.35)));
    if(zoneMatch)dmg=Math.max(0,Math.floor(dmg*.25));
    return {dmg,crit,blocked:zoneMatch};
  }

  function playerAttack(zone){
    if(!battle||battle.busy)return;battle.busy=true;disableControls(true);const p=battle.player,b=battle.bot;anim('player','attack');
    setTimeout(()=>{if(Math.random()<b.dodge){anim('bot','dodge');popup('Уклонение 💨',false,'bot');log(`${b.name}: уклонился`);finishPlayerTurn();return;}
      const r=resolveDamage(p,b,zone,b.defenseZone||'');b.hp=Math.max(0,b.hp-r.dmg);popup(r.blocked?'БЛОК -'+r.dmg:'-'+r.dmg,r.crit,'bot');anim('bot','hit');log(`${r.blocked?'Защита остановила удар':'Удар в '+zoneLabel(zone)}: -${r.dmg}${r.crit?' · КРИТ':''}`);updateBars();
      if(b.hp<=0){finish(true);return;}finishPlayerTurn();},300);
  }

  function finishPlayerTurn(){if(!battle)return;battle.turn++;setTimeout(()=>{if(!battle)return;battle.busy=false;botTurn();},450);}

  function botTurn(){
    if(!battle||battle.bot.hp<=0)return;const p=battle.player,b=battle.bot;b.defenseZone=zones[Math.floor(Math.random()*zones.length)][0];const zone=zones[Math.floor(Math.random()*zones.length)][0];
    setTimeout(()=>{if(!battle)return;if(Math.random()<p.dodge){anim('player','dodge');popup('Уклонение 💨',false,'player');log(`${b.name}: промах — уклонение`);nextReady();return;}
      anim('bot','attack');setTimeout(()=>{if(!battle)return;const r=resolveDamage(b,p,zone,battle.playerDefense||'');p.hp=Math.max(0,p.hp-r.dmg);popup(r.blocked?'БЛОК -'+r.dmg:'-'+r.dmg,r.crit,'player');anim('player','hit');log(`${r.blocked?'Ты заблокировал удар':'Атака '+zoneLabel(zone)}: -${r.dmg}${r.crit?' · КРИТ':''}`);updateBars();battle.playerDefense='';document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.remove('selected'));if(p.hp<=0){finish(false);return;}nextReady();},260);
    },420);
  }

  function nextReady(){if(!battle)return;battle.busy=false;const st=$('[data-status]');if(st)st.textContent=battle.auto?'Автобой: следующий ход':'Твой ход — выбери зону удара';disableControls(false);if(battle.auto)autoStep();}

  function autoStep(){if(!battle||battle.busy)return;const attack=zones[Math.floor(Math.random()*zones.length)][0],defense=zones[Math.floor(Math.random()*zones.length)][0];battle.playerDefense=defense;document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.toggle('selected',x.dataset.defenseZone===defense));const st=$('[data-status]');if(st)st.textContent=`Автобой: удар ${zoneLabel(attack)}, защита ${zoneLabel(defense)}`;setTimeout(()=>{if(battle?.auto)playerAttack(attack);},280);}

  function disableControls(disabled){document.querySelectorAll('[data-attack-zone],[data-defense-zone]').forEach(x=>x.disabled=disabled);}
  function zoneLabel(z){return zones.find(x=>x[0]===z)?.[1]||z;}

  function toggleEquipment(open){if(open)openItemPanel('armor');else closeItemPanel();}

  function changeLoadout(key){
    if(!battle||!LOADOUTS[key]||battle.busy)return;
    const p=battle.player,old=p.loadout; if(old===key){toggleEquipment(false);return;}
    const oldMax=p.maxHp||1,ratio=p.hp/oldMax;p.loadout=key;recalcFighter(p);p.hp=Math.max(1,Math.min(p.maxHp,Math.round(p.maxHp*ratio)));
    const s=S();if(s?.arena){s.arena.loadout=key;save();}
    const fighter=$(`[data-fighter="${p.id}"]`);if(fighter)fighter.outerHTML=fighterMarkup('player',p);
    const panel=$('[data-equipment-panel]');if(panel)panel.innerHTML=equipmentPanelMarkup(p);
    updateBars();toggleEquipment(false);log(`Снаряжение: ${LOADOUTS[old].name} → ${LOADOUTS[key].name}`);
    const st=$('[data-status]');if(st)st.textContent=`Комплект «${LOADOUTS[key].name}» экипирован`;
  }

  function changeSingleItem(slot,key){
    if(!battle||battle.busy||!LOADOUTS[key])return;
    const p=battle.player;if(slot==='ring'){closeItemPanel();log('Кольцо викинга оставлено экипированным');return;}
    const old=selectedKey(p,slot);if(old===key){closeItemPanel();return;}
    const oldMax=p.maxHp||1,ratio=p.hp/oldMax;
    p.slotOverrides=p.slotOverrides||{};p.slotOverrides[slot]=key;recalcFighter(p);p.hp=Math.max(1,Math.min(p.maxHp,Math.round(p.maxHp*ratio)));
    const s=S();if(s?.arena){s.arena.loadout=p.loadout;s.arena.slotOverrides=Object.assign({},p.slotOverrides);save();}
    const fighter=$(`[data-fighter="${p.id}"]`);if(fighter)fighter.outerHTML=fighterMarkup('player',p);
    closeItemPanel();renderCombatItems();updateBars();
    log(`${slotLabel(slot)}: ${equippedItem({...p,slotOverrides:{...p.slotOverrides,[slot]:old}},slot)} → ${equippedItem(p,slot)}`);
    const st=$('[data-status]');if(st)st.textContent=`${slotLabel(slot)} заменён`;
  }

  function slotLabel(slot){return ({weapon:'Оружие',helmet:'Шлем',armor:'Броня',belt:'Пояс',boots:'Сапоги',ring:'Кольцо'})[slot]||'Предмет';}

  function useItem(id){
    if(!battle||battle.busy)return;
    const itemId=id||['elixir_hp','elixir_energy','elixir_attack','elixir_guard'].find(x=>Number(S()?.consumables?.[x]||0)>0);
    if(!itemId||!window.CombatItems?.use)return;
    const now=Date.now(),cd=battle.cooldowns[itemId]||0;
    if(cd>now){openItemPanel(itemId);return;}
    const item=window.CombatItems.CATALOG[itemId];
    if(!item||!Number(S()?.consumables?.[itemId]||0))return;
    if(!window.CombatItems.use(itemId))return;
    const duration=itemId==='elixir_attack'||itemId==='elixir_guard'?30000:15000;
    battle.cooldowns[itemId]=now+duration;
    battle.buffExpiry=battle.buffExpiry||{};
    if(itemId==='elixir_attack'||itemId==='elixir_guard')battle.buffExpiry[itemId]=now+duration;
    recalcFighter(battle.player);
    updateBars();renderCombatItems();openItemPanel(itemId);log('Использован '+(item?.name||itemId)+' · действует '+formatTimer(duration));
    setTimeout(()=>{
      if(!battle)return;
      if(battle.buffExpiry?.[itemId] && battle.buffExpiry[itemId]<=Date.now()){
        const st=S();if(st?.combatBuffs){
          if(itemId==='elixir_attack')st.combatBuffs.attack=Math.max(0,Number(st.combatBuffs.attack||0)-(Number(item?.value)||5));
          if(itemId==='elixir_guard')st.combatBuffs.defense=Math.max(0,Number(st.combatBuffs.defense||0)-(Number(item?.value)||5));
          save();
        }
        delete battle.buffExpiry[itemId];
        recalcFighter(battle.player);updateBars();log((item?.name||itemId)+' закончился');
      }
      renderCombatItems();if(battle.itemPanel===itemId)openItemPanel(itemId);
    },duration+50);
  }

  function renderCombatItems(){
    if(!battle)return;
    const strip=$('.combat-loadout-strip');if(strip)strip.innerHTML=combatLoadoutStrip(battle.player);
  }

  function finish(win){
    if(!battle)return;const opponent=battle.opponent,s=S(),a=Object.assign({},s.arena||{});a.battles=(Number(a.battles)||0)+1;
    if(win){a.wins=(Number(a.wins)||0)+1;a.rating=(Number(a.rating)||1000)+18;s.coins+=75;s.exp+=15;}else{a.losses=(Number(a.losses)||0)+1;a.rating=Math.max(0,(Number(a.rating)||1000)-14);s.exp+=5;}
    a.history=Array.isArray(a.history)?a.history.slice(-19):[];a.history.unshift({win,date:Date.now(),opponent:opponent.name});a.loadout=battle.player.loadout;s.arena=a;s.hp=Math.max(0,Math.min(s.maxHp,battle.player.hp));s.combatBuffs={attack:0,defense:0};save();
    stopCooldownTicker();const root=ensureRoot();if(!root)return;root.body.innerHTML=`<div class="arena-result"><div>${win?'🏆':'💀'}</div><h1>${win?'ПОБЕДА':'ПОРАЖЕНИЕ'}</h1><p>${esc(opponent.name)} · ${win?'+75 🪙 · +15 XP':'+5 XP'}</p><button class="arena-main" data-restart>ЕЩЁ БОЙ</button><button class="arena-secondary" data-arena-hub>АРЕНА</button></div>`;battle=null;
  }

  function close(){stopCooldownTicker();const root=ensureRoot();if(!root)return;root.modal.classList.remove('show');root.modal.setAttribute('aria-hidden','true');battle=null;selectedProfile=null;}

  document.addEventListener('click',e=>{
    const profile=e.target.closest?.('[data-profile-id]');if(profile){openProfile(profile.dataset.profileId);return;}
    if(e.target.closest?.('[data-arena-hub]')){openHub();return;}
    if(e.target.closest?.('[data-arena-find]')){findOpponent();return;}
    const pf=e.target.closest?.('[data-profile-fight]');if(pf){const p=pf.dataset.profileFight==='player'?humanProfile():botRoster().find(x=>x.id===pf.dataset.profileFight);if(p&&!p.isBot)openProfile(p.id);else if(p)startBattle(p);return;}
    const item=e.target.closest?.('[data-combat-item]');if(item){if(battle&&!battle.busy)openItemPanel(item.dataset.combatItem);return;}
    if(e.target.closest?.('[data-autobattle-toggle]')){if(!battle||battle.busy)return;battle.auto=!battle.auto;renderCombatItems();const st=$('[data-status]');if(st)st.textContent=battle.auto?'↻ Автобой включён':'Твой ход — выбери зону удара';if(battle.auto)autoStep();return;}
    if(e.target.closest?.('[data-close-item-panel]')){closeItemPanel();return;}
    const nav=e.target.closest?.('[data-arena-nav]');if(nav){
      const id=nav.dataset.arenaNav;
      if(id==='battle'){openHub();return;}
      close();
      if(id==='home')window.showScreen?.('home');
      else if(id==='inventory'||id==='hero')window.showScreen?.('inventory');
      else if(id==='game')window.showScreen?.('casino');
      else if(id==='quests')window.showScreen?.('districts');
      else if(id==='clan')window.showScreen?.('districts');
      return;
    }
    const use=e.target.closest?.('[data-use-combat-item]');if(use){useItem(use.dataset.useCombatItem);return;}
    const eq=e.target.closest?.('[data-equip-slot]');if(eq){changeSingleItem(eq.dataset.equipSlot,eq.dataset.equipLoadout);return;}
    const az=e.target.closest?.('[data-attack-zone]');if(az){playerAttack(az.dataset.attackZone);return;}
    const dz=e.target.closest?.('[data-defense-zone]');if(dz&&battle&&!battle.busy){battle.playerDefense=dz.dataset.defenseZone;document.querySelectorAll('[data-defense-zone]').forEach(x=>x.classList.remove('selected'));dz.classList.add('selected');const st=$('[data-status]');if(st)st.textContent='Защита: '+dz.textContent;return;}
    if(e.target.closest?.('[data-use-item]')){useItem();return;}
    if(e.target.closest?.('[data-surrender]')){finish(false);return;}
    if(e.target.closest?.('[data-restart]')){findOpponent();return;}
  });


  document.getElementById('arenaClose')?.addEventListener('click',close);
  window.ArenaGame={open:openHub,close,findOpponent,openProfile};
})();
