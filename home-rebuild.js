/* Territory — Home Rebuild v1
   Real HTML controls over a clean city composition.
   Does not depend on coordinate hit-testing or baked buttons.
*/
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
    else {
      $$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
    }
  }

  function modal(title,body,actions){
    const old=$('#homeRebuildModal'); if(old) old.remove();
    const m=document.createElement('div'); m.id='homeRebuildModal'; m.className='hr-modal';
    /* Global rule: every ordinary modal has ONE close control — the small black circle.
       A bottom "Закрыть" button is never generated automatically. Other explicit actions remain. */
    const safeActions=Array.isArray(actions)?actions.filter(a=>a && a.id!=='close' && a.text):[];
    const buttons=safeActions.map(a=>`<button type="button" data-hr-act="${a.id}">${a.text}</button>`).join('');
    const actionBlock=buttons?`<div class="hr-modal-actions">${buttons}</div>`:'';
    m.innerHTML=`<div class="hr-modal-card" role="dialog" aria-modal="true"><button class="hr-modal-x" type="button" data-hr-act="close" aria-label="Закрыть">×</button><div class="hr-modal-icon">${title.icon||'✦'}</div><h3>${title.text||title}</h3><div class="hr-modal-body">${body}</div>${actionBlock}</div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{
      const a=e.target.closest('[data-hr-act]');
      if(!a)return;
      if(a.dataset.hrAct==='close'||a.dataset.hrAct==='ok') { e.preventDefault(); e.stopPropagation(); m.remove(); }
    });
    return m;
  }

  function showProfile(){
    const old=$('#hrProfileOverlay'); if(old) old.remove();
    const st=(window.TerritoryStore&&window.TerritoryStore.state)||{};
    const num=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
    const name=st.name||$('#playerName')?.textContent||'SSS';
    const level=num(st.level,1), hp=num(st.hp,120), maxHp=Math.max(1,num(st.maxHp,120));
    const energy=num(st.energy,100), coins=num(st.coins,1000), gems=num(st.gems,25);
    const xp=num(st.exp,0), next=Math.max(100,num(st.nextExp,100));
    const strength=num(st.strength,5), defense=num(st.defense,0), damage=num(st.bonusDamage,0);
    const weapon=st.weapon||'Кулаки', inventory=Array.isArray(st.inventory)?st.inventory:[];
    const items=inventory.length?inventory.map((x,i)=>`<div class="rp-item"><span>${x}</span><b>Предмет ${i+1}</b><small>Экипировка</small></div>`).join(''):`<div class="rp-empty">Инвентарь пока пуст</div>`;
    const o=document.createElement('div'); o.id='hrProfileOverlay'; o.className='rp-overlay';
    o.innerHTML=`
      <div class="rp-shell" role="dialog" aria-modal="true" aria-label="Профиль героя">
        <header class="rp-head">
          <button type="button" class="rp-back" data-rp="close">‹</button>
          <div><small>ГЕРОЙ SDOLARS</small><b>ПРОФИЛЬ</b></div>
          <button type="button" class="rp-close" data-rp="close">×</button>
        </header>
        <main class="rp-body">
          <section class="rp-hero">
            <div class="rp-avatar">⚔️</div>
            <div class="rp-main"><b>${name}</b><span>Уровень ${level}</span><div class="rp-xp"><i style="width:${Math.max(0,Math.min(100,xp/next*100))}%"></i></div><small>${xp} / ${next} XP</small></div>
          </section>
          <section class="rp-res"><div><span>🪙</span><b>${coins}</b><small>Монеты</small></div><div><span>💎</span><b>${gems}</b><small>Кристаллы</small></div><div><span>⚡</span><b>${energy}</b><small>Энергия</small></div></section>
          <section class="rp-stats"><div><span>❤️</span><b>${hp}/${maxHp}</b><small>Здоровье</small></div><div><span>⚔️</span><b>${strength}</b><small>Сила</small></div><div><span>🛡️</span><b>${defense}</b><small>Защита</small></div><div><span>💥</span><b>+${damage}</b><small>Урон</small></div></section>
          <section class="rp-section"><div class="rp-title"><b>ЭКИПИРОВКА</b><small>Текущий комплект</small></div>
            <div class="rp-equip"><div class="rp-equip-icon">🪓</div><div><b>${weapon}</b><span>Бонус к урону +${damage}</span></div><button type="button" data-rp="equipment">Сменить</button></div>
          </section>
          <section class="rp-section"><div class="rp-title"><b>ИНВЕНТАРЬ</b><small>${inventory.length} предметов</small></div><div class="rp-grid">${items}</div></section>
        </main>
      </div>`;
    document.body.appendChild(o);
    const close=()=>o.remove();
    o.addEventListener('click',e=>{
      const a=e.target.closest('[data-rp]'); if(!a)return;
      if(a.dataset.rp==='close'){e.preventDefault();e.stopPropagation();close();return;}
      if(a.dataset.rp==='equipment'){e.preventDefault();e.stopPropagation();close();action('blacksmith');}
    });
  }

  function dailyBonus(){
    const key='territory_daily_bonus_v1';
    const today=new Date().toISOString().slice(0,10);
    if(localStorage.getItem(key)===today){
      modal({icon:'🎁',text:'Ежедневный бонус'},'<p>Бонус на сегодня уже получен.</p><p class="hr-muted">Возвращайся завтра.</p>');
      return;
    }
    try{
      const st=window.TerritoryStore&&window.TerritoryStore.state;
      if(st){ st.coins=(Number(st.coins)||0)+100; st.gems=(Number(st.gems)||0)+1; st.energy=Math.min(200,(Number(st.energy)||0)+10); localStorage.setItem('territory_save_v1',JSON.stringify(st)); }
    }catch(e){}
    localStorage.setItem(key,today);
    const m=modal({icon:'🎁',text:'Бонус получен'},'<div class="hr-reward"><b>+100 🪙</b><b>+1 💎</b><b>+10 ⚡</b></div><p>Награды добавлены в профиль.</p>');
    if(m){
      m.dataset.hrModalKind='daily';
      const closeNow=()=>{
        /* V16: daily bonus must release every possible home modal/shield. */
        document.querySelectorAll('.hr-modal').forEach(x=>x.remove());
        document.documentElement.classList.remove('territory-modal-open');
        document.body.classList.remove('territory-modal-open');
        document.body.style.overscrollBehaviorY='';
        document.body.style.overflow='';
        document.documentElement.style.overflow='';
        document.body.style.pointerEvents='';
        document.documentElement.style.pointerEvents='';
      };
      const x=m.querySelector('.hr-modal-x');
      if(x){x.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeNow();},true);}
      setTimeout(()=>{if(m.isConnected)closeNow();},3200);
    }
    sync();
  }

  function gameHall(){
    const games=[
      ['🎲','Монополия','Поля, броски и награды','open-monopoly'],
      ['⚄','Dice','Быстрый бросок кубика','soon'],
      ['🍀','Luck','Риск ради редкой награды','soon'],
      ['🃏','Cards','Карточные испытания','soon'],
      ['🎯','Стрельбище','Попади в мишень','soon']
    ];
    const m=modal({icon:'🎮',text:'Игровой зал'},`<div class="hr-games">${games.map(g=>`<button class="hr-game-card" type="button" data-game="${g[3]}"><span>${g[0]}</span><b>${g[1]}</b><small>${g[2]}</small></button>`).join('')}</div>`);
    m.addEventListener('click',e=>{
      const b=e.target.closest('[data-game]'); if(!b)return;
      if(b.dataset.game==='open-monopoly'){m.remove();go('game');return;}
      modal({icon:'🔒',text:b.querySelector('b')?.textContent||'Игра'},'<p>Эта игра входит в игровой зал и подключается следующим этапом.</p><p class="hr-muted">Сейчас доступна Монополия.</p>');
    });
  }

  function resources(kind){
    const el=kind==='coins'?$('#coins'):$('#gems');
    const val=el?el.textContent:'0';
    modal({icon:kind==='coins'?'🪙':'💎',text:kind==='coins'?'Монеты':'Кристаллы'},`<div class="hr-big-number">${val}</div><p>Ресурс синхронизируется с текущим сохранением игры.</p>`);
  }

  function vip(){
    modal({icon:'👑',text:'VIP'},'<p>VIP-бонусы будут подключены к общей системе прогресса.</p><ul><li>автоматические ходы в предусмотренных режимах;</li><li>дополнительные бонусы;</li><li>косметические возможности.</li></ul>');
  }

  function action(name){
    switch(name){
      case 'profile': showProfile(); break;
      case 'coins': resources('coins'); break;
      case 'gems': resources('gems'); break;
      case 'energy': return; // Energy is HUD-only: never open a modal from the top resource bar.
      case 'quest': go('districts'); break;
      case 'bonus': dailyBonus(); break;
      case 'events': go('districts'); break;
      case 'vip': vip(); break;
      case 'game': gameHall(); break;
      case 'arena': go('arena'); break;
      case 'blacksmith': (window.openForgeV2 ? window.openForgeV2() : openForge()); break;
      case 'tavern': go('districts'); break;
      case 'shop': go('market'); break;
      default: break;
    }
  }

  const FORGE_ITEMS=[
    {id:'axe',name:'Боевой топор',icon:'🪓',damage:12,cost:300,rarity:'Обычный'},
    {id:'sword',name:'Стальной меч',icon:'⚔️',damage:18,cost:650,rarity:'Редкий'},
    {id:'hammer',name:'Молот кузнеца',icon:'🔨',damage:25,cost:1000,rarity:'Эпический'},
    {id:'crossbow',name:'Арбалет охотника',icon:'🏹',damage:31,cost:1500,rarity:'Легендарный'}
  ];
  function forgeState(){
    const s=window.TerritoryStore&&window.TerritoryStore.state;
    if(!s)return null;
    s.forgeInventory=Array.isArray(s.forgeInventory)?s.forgeInventory:[];
    s.equipment=s.equipment&&typeof s.equipment==='object'?s.equipment:{};
    return s;
  }
  function forgeSave(){
    const st=forgeState(); if(!st)return;
    if(window.TerritoryStore&&typeof window.TerritoryStore.save==='function') window.TerritoryStore.save();
    else try{localStorage.setItem('territory_save_v1',JSON.stringify(st));}catch(e){}
    sync();
  }
  function forgeScreen(){
    let sec=document.getElementById('forge');
    if(sec)return sec;
    sec=document.createElement('section'); sec.id='forge'; sec.className='screen forge-screen';
    sec.innerHTML=`<div class="forge-wrap">
      <div class="forge-head"><button type="button" class="forge-back" data-forge-back>‹</button><div><small>SDOLARS · КУЗНИЦА</small><h2>КУЗНИЦА ГЕРОЯ</h2></div><div class="forge-wallet"><span>🪙 <b data-fg-coins>0</b></span><span>💎 <b data-fg-gems>0</b></span></div></div>
      <div class="forge-hero"><div class="forge-anvil">⚒️</div><div><b>Кузнец</b><span>Выбирай оружие, покупай его и сразу экипируй.</span></div></div>
      <div class="forge-section"><div class="forge-title"><b>ОРУЖИЕ</b><small>Характеристики применяются к бою</small></div><div class="forge-grid" id="forgeGrid"></div></div>
      <div class="forge-section"><div class="forge-title"><b>МОЙ АРСЕНАЛ</b><small id="forgeOwnedCount">0 предметов</small></div><div id="forgeOwned" class="forge-owned"></div></div>
      <div class="forge-note" id="forgeNote">Покупка добавляет предмет в инвентарь. Экипированный предмет влияет на урон героя.</div>
    </div>`;
    document.querySelector('main')?.appendChild(sec);
    sec.addEventListener('click',e=>{
      const back=e.target.closest('[data-forge-back]'); if(back){go('inventory');return;}
      const buy=e.target.closest('[data-forge-buy]'); if(buy){forgeBuy(buy.dataset.forgeBuy);return;}
      const equip=e.target.closest('[data-forge-equip]'); if(equip){forgeEquip(equip.dataset.forgeEquip);return;}
    });
    return sec;
  }
  function forgeBuy(id){
    const st=forgeState(), item=FORGE_ITEMS.find(x=>x.id===id); if(!st||!item)return;
    if(Number(st.coins||0)<item.cost){const n=document.getElementById('forgeNote');if(n)n.textContent='Кузнец: «Не хватает монет для этой покупки.»';return;}
    st.coins-=item.cost;
    st.forgeInventory.push(item.id);
    st.inventory=Array.isArray(st.inventory)?st.inventory:[]; st.inventory.push(item.icon);
    const n=document.getElementById('forgeNote');if(n)n.textContent=`Получен предмет: ${item.name}. Теперь его можно экипировать.`;
    forgeSave();
  }
  function forgeEquip(id){
    const st=forgeState(), item=FORGE_ITEMS.find(x=>x.id===id); if(!st||!item)return;
    if(!st.forgeInventory.includes(id)){const n=document.getElementById('forgeNote');if(n)n.textContent='Сначала получи этот предмет.';return;}
    st.weapon=item.name; st.bonusDamage=item.damage; st.equipment.weapon={...item};
    const n=document.getElementById('forgeNote');if(n)n.textContent=`Экипировано: ${item.name}. Урон героя +${item.damage}.`;
    forgeSave();
  }
  window.renderForgeUI=function(){
    const sec=document.getElementById('forge'); if(!sec)return;
    const st=forgeState(); if(!st)return;
    sec.querySelector('[data-fg-coins]').textContent=st.coins||0; sec.querySelector('[data-fg-gems]').textContent=st.gems||0;
    sec.querySelector('#forgeGrid').innerHTML=FORGE_ITEMS.map(x=>`<article class="forge-item"><div class="forge-item-icon">${x.icon}</div><div class="forge-item-main"><b>${x.name}</b><small>${x.rarity}</small><span>💥 Урон +${x.damage}</span></div><button type="button" data-forge-buy="${x.id}">${x.cost} 🪙</button></article>`).join('');
    const owned=[...new Set(st.forgeInventory||[])].map(id=>FORGE_ITEMS.find(x=>x.id===id)).filter(Boolean);
    sec.querySelector('#forgeOwnedCount').textContent=`${owned.length} предметов`;
    sec.querySelector('#forgeOwned').innerHTML=owned.length?owned.map(x=>`<article class="forge-owned-item ${st.equipment?.weapon?.id===x.id?'equipped':''}"><span>${x.icon}</span><div><b>${x.name}</b><small>Урон +${x.damage}</small></div><button type="button" data-forge-equip="${x.id}">${st.equipment?.weapon?.id===x.id?'Экипировано':'Экипировать'}</button></article>`).join(''):'<div class="forge-empty">Арсенал пока пуст.<br><small>Купи первое оружие у кузнеца.</small></div>';
  };
  function openForge(){forgeScreen(); window.renderForgeUI(); go('forge');}

  function sync(){
    const st=window.TerritoryStore&&window.TerritoryStore.state;
    const coins=$('#coins')?.textContent||st?.coins||'1000';
    const gems=$('#gems')?.textContent||st?.gems||'25';
    const level=$('#level')?.textContent||st?.level||'1';
    const name=st?.name||$('#playerName')?.textContent||'SSS';
    const hp=Number(st?.hp??120), max=Number(st?.maxHp??120);
    $$('[data-hr-coins]').forEach(x=>x.textContent=coins);
    $$('[data-hr-gems]').forEach(x=>x.textContent=gems);
    $$('[data-hr-level]').forEach(x=>x.textContent=level);
    $$('[data-hr-name]').forEach(x=>x.textContent=name);
    const xp=Number(st?.exp??0), xpNext=Math.max(100,Number(st?.nextExp??100));
    const profileName=$('#profileName'); if(profileName)profileName.textContent=name;
    const profileLevel=$('#profileLevel'); if(profileLevel)profileLevel.textContent=level;
    const profileXpBar=$('#profileXpBar'); if(profileXpBar)profileXpBar.style.width=Math.max(0,Math.min(100,xp/xpNext*100))+'%';
    const profileXpText=$('#profileXpText'); if(profileXpText)profileXpText.textContent=`${xp} / ${xpNext} XP`;
    const profileHp=$('#profileHp'); if(profileHp)profileHp.textContent=`${hp} / ${max}`;
    const profileEnergy=$('#profileEnergy'); if(profileEnergy)profileEnergy.textContent=`${st?.energy??100} / 200`;
    const profileStrength=$('#profileStrength'); if(profileStrength)profileStrength.textContent=st?.strength??5;
    const profileDefense=$('#profileDefense'); if(profileDefense)profileDefense.textContent=st?.defense??0;
    const hpText=`${hp}/${max}`; $$('[data-hr-hp-text]').forEach(x=>x.textContent=hpText);
    $$('[data-hr-hp]').forEach(x=>x.style.width=Math.max(0,Math.min(100,hp/max*100))+'%');
    $$('[data-hr-energy]').forEach(x=>x.textContent=st?.energy??100);
  }

  function mount(){
    const home=$('#home'); if(!home||$('#homeRebuild'))return;
    home.classList.add('home-rebuild-host');
    home.innerHTML=`
      <div id="homeRebuild" class="home-rebuild" aria-label="Город Сдоларс">
        <img class="hr-bg" src="sdolars_home_bg.png" alt="Город Сдоларс">
        <div class="hr-vignette"></div>
        <header class="hr-top">
          <button class="hr-profile" type="button" data-hr="profile">
            <span class="hr-avatar">⚔️</span>
            <span class="hr-player"><b data-hr-name>SSS</b><small>Уровень <strong data-hr-level>1</strong></small><i><em data-hr-hp style="width:100%"></em></i><small data-hr-hp-text>120/120</small></span>
          </button>
          <div class="hr-resources">
            <button type="button" class="hr-resource" data-hr="coins" aria-label="Монеты">🪙 <b data-hr-coins>1000</b></button>
            <button type="button" class="hr-resource" data-hr="gems" aria-label="Кристаллы">💎 <b data-hr-gems>25</b></button>
            <div class="hr-resource hr-energy-display" data-hr="energy" aria-label="Энергия" role="status">⚡ <b data-hr-energy>100</b></div>
          </div>
        </header>

        <div class="hr-quest glass-card" data-hr="quest">
          <div class="hr-icon">📜</div><div><small>ТЕКУЩЕЕ ЗАДАНИЕ</small><b>Поговори с кузнецом</b><span>Открыть район кузницы →</span></div>
        </div>

        <button class="hr-daily glass-card" type="button" data-hr="bonus"><span>🎁</span><div><small>ЕЖЕДНЕВНЫЙ БОНУС</small><b>Забрать награду</b></div></button>

        <div class="hr-left">
          <button type="button" data-hr="game"><span>🎮</span><b>Игровой зал</b><small>5 игр</small></button>
          <button type="button" data-hr="events"><span>📅</span><b>События</b><small>Город</small></button>
          <button type="button" data-hr="vip"><span>👑</span><b>VIP</b><small>Бонусы</small></button>
        </div>
        <div class="hr-right">
          <button type="button" data-hr="arena"><span>🏟️</span><b>Арена</b><small>PvP</small></button>
          <button type="button" data-hr="blacksmith"><span>⚒️</span><b>Кузница</b><small>Экипировка</small></button>
          <button type="button" data-hr="shop"><span>🛒</span><b>Магазин</b><small>Предметы</small></button>
        </div>

        <div class="hr-hero-card">
          <span class="hr-hero-mark">♛</span><div><b>Твой герой</b><small>Сдоларс ждёт твоего пути</small></div><button type="button" data-hr="profile">Профиль →</button>
        </div>

        <div class="hr-scene-label">SDOLARS · ЦЕНТРАЛЬНЫЙ КВАРТАЛ</div>
      </div>`;
    const dispatch=(e)=>{
      const b=e.target&&e.target.closest?e.target.closest('[data-hr]'):null;
      if(!b||!home.contains(b))return;
      e.preventDefault();
      e.stopPropagation();
      action(b.dataset.hr);
    };
    home.addEventListener('click',dispatch);
    sync();
    setInterval(sync,1200);
    const equipBtn=document.getElementById('profileEquipBtn');
    if(equipBtn) equipBtn.addEventListener('click',()=>{
      const inv=document.getElementById('inventoryGrid');
      if(inv){ inv.scrollIntoView({behavior:'smooth',block:'center'}); }
    });
  }

  /* V18: remove legacy global coordinate hit-testing. Native button events are authoritative. */
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();

  /* Territory V19 — clean interaction core.
     One click pipeline for ordinary UI. No coordinate hit-testing, no touch/click duplication,
     no backdrop closing, and no Arena changes. */
  (function(){
    'use strict';

    const CLOSE_SELECTORS = [
      '.territory-overlay-force-close', '.hr-modal-x', '.rp-close',
      '.modal-close', '.game-close', '.game-modal-close', '#gameBatchClose',
      '#gameModalClose', '#jackpotClose', '#gameTasksClose', '#gamePanelClose'
    ].join(',');

    const isArena = el => !!(el && (
      el.matches?.('#arenaModal,.arena-modal,[data-arena-modal]') ||
      el.closest?.('#arenaModal,.arena-modal,[data-arena-modal]')
    ));

    function unlockOrdinaryModalState(){
      document.documentElement.classList.remove('territory-modal-open');
      document.body.classList.remove('territory-modal-open');
      document.documentElement.style.overflow='';
      document.body.style.overflow='';
      document.documentElement.style.overscrollBehaviorY='';
      document.body.style.overscrollBehaviorY='';
      document.documentElement.style.pointerEvents='';
      document.body.style.pointerEvents='';
    }

    function closeFromButton(btn){
      if(!btn || isArena(btn)) return;
      const forge=btn.closest?.('.forge-v2-overlay');
      if(forge){
        if(typeof window.closeForgeV2==='function') window.closeForgeV2();
        else forge.remove();
        unlockOrdinaryModalState();
        return;
      }

      const profile=btn.closest?.('#hrProfileOverlay');
      if(profile){ profile.remove(); unlockOrdinaryModalState(); return; }

      const modalRoot=btn.closest?.(
        '.hr-modal,.rp-overlay,.game-modal,.game-tasks-modal,.game-jackpot-modal,'+
        '.game-panel-modal,.g141-photo-modal,#gameBatchModal,#gameRewardModal'
      );
      if(modalRoot && !isArena(modalRoot)) modalRoot.remove();
      unlockOrdinaryModalState();
    }

    function installCloseStyle(){
      if(document.getElementById('territory-v19-close-style')) return;
      const st=document.createElement('style');
      st.id='territory-v19-close-style';
      st.textContent=`
        .territory-overlay-force-close,
        .hr-modal-x,
        .rp-close,
        .modal-close,
        .game-close,
        .game-modal-close,
        #gameBatchClose,
        #gameModalClose,
        #jackpotClose,
        #gameTasksClose,
        #gamePanelClose{
          width:40px!important;height:40px!important;
          min-width:40px!important;min-height:40px!important;
          max-width:40px!important;max-height:40px!important;
          box-sizing:border-box!important;padding:0!important;
          border:1px solid rgba(255,255,255,.18)!important;
          border-radius:50%!important;background:#05080c!important;
          color:#fff!important;display:grid!important;place-items:center!important;
          font:700 25px/1 Arial,sans-serif!important;
          box-shadow:0 5px 16px rgba(0,0,0,.5)!important;
          cursor:pointer!important;touch-action:manipulation!important;
          -webkit-tap-highlight-color:transparent!important;user-select:none!important;
          opacity:1!important;
        }
        .territory-overlay-force-close:active,
        .hr-modal-x:active,
        .rp-close:active,
        .modal-close:active,
        .game-close:active,
        .game-modal-close:active,
        #gameBatchClose:active,
        #gameModalClose:active,
        #jackpotClose:active,
        #gameTasksClose:active,
        #gamePanelClose:active{transform:scale(.92)!important;}
        .hr-modal .hr-modal-card{position:relative!important;}
        .hr-modal .hr-modal-x{position:absolute!important;right:10px!important;top:10px!important;z-index:20!important;}
        .hr-modal-actions:empty{display:none!important;}
        .hr-modal,.rp-overlay,.forge-v2-overlay,.game-modal,.game-tasks-modal,
        .game-jackpot-modal,.game-panel-modal,.g141-photo-modal,#gameBatchModal,#gameRewardModal{
          -webkit-tap-highlight-color:transparent!important;
        }
        .hr-modal-actions button,
        .rp-shell [data-rp="equipment"],
        .forge-v2-overlay [data-buy],
        .forge-v2-overlay [data-equip]{
          min-height:44px!important;border-radius:14px!important;
          touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;
        }
      `;
      document.head.appendChild(st);
    }

    function ensureLegacyCloseButtons(){
      installCloseStyle();
      const profile=document.getElementById('hrProfileOverlay');
      if(profile && !profile.querySelector('.territory-overlay-force-close')){
        const b=document.createElement('button');
        b.type='button'; b.className='territory-overlay-force-close';
        b.setAttribute('aria-label','Закрыть профиль'); b.textContent='×';
        profile.appendChild(b);
      }
      const forge=document.querySelector('.forge-v2-overlay');
      if(forge && !forge.querySelector('.territory-overlay-force-close')){
        const b=document.createElement('button');
        b.type='button'; b.className='territory-overlay-force-close';
        b.setAttribute('aria-label','Закрыть кузницу'); b.textContent='×';
        forge.appendChild(b);
      }
    }

    installCloseStyle();
    ensureLegacyCloseButtons();

    /* ONE global input path for ordinary close buttons. */
    document.addEventListener('click', e=>{
      const btn=e.target?.closest?.(CLOSE_SELECTORS);
      if(!btn || isArena(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      closeFromButton(btn);
    }, true);

    /* Watch DOM creation only. Never watch style/class attributes and never run touch/pointer duplicates. */
    new MutationObserver(()=>ensureLegacyCloseButtons()).observe(document.documentElement,{childList:true,subtree:true});
  })();
})();
