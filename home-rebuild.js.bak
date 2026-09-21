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
    const buttons=(actions||[{id:'close',text:'Закрыть'}]).map(a=>`<button type="button" data-hr-act="${a.id}">${a.text}</button>`).join('');
    m.innerHTML=`<div class="hr-modal-card" role="dialog" aria-modal="true"><button class="hr-modal-x" type="button" data-hr-act="close">×</button><div class="hr-modal-icon">${title.icon||'✦'}</div><h3>${title.text||title}</h3><div class="hr-modal-body">${body}</div><div class="hr-modal-actions">${buttons}</div></div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{const a=e.target.closest('[data-hr-act]');if(!a)return;if(a.dataset.hrAct==='close'||a.dataset.hrAct==='ok')m.remove();});
    m.addEventListener('click',e=>{if(e.target===m)m.remove();});
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
    o.addEventListener('click',e=>{if(e.target===o)close();});
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
    setTimeout(()=>m&&m.remove(),3200);
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
      case 'energy': modal({icon:'⚡',text:'Энергия'},'<div class="hr-big-number">'+($('#energyValue')?.textContent||$('#energy')?.textContent||'100')+'</div><p>Энергия расходуется в игровых активностях и восстанавливается со временем.</p>'); break;
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
            <button type="button" class="hr-resource" data-hr="energy" aria-label="Энергия">⚡ <b data-hr-energy>100</b></button>
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
    home.addEventListener('pointerup',dispatch,true);
    home.addEventListener('touchend',dispatch,{capture:true,passive:false});
    sync();
    setInterval(sync,1200);
    const equipBtn=document.getElementById('profileEquipBtn');
    if(equipBtn) equipBtn.addEventListener('click',()=>{
      const inv=document.getElementById('inventoryGrid');
      if(inv){ inv.scrollIntoView({behavior:'smooth',block:'center'}); }
    });
  }

  // Global top-bar touch bridge: Telegram/WebView or legacy HUD layers can sit above the home DOM.
  // Resolve the tap by the real button rectangles instead of relying on event.target.
  let topTapAt=0;
  function topButtonAt(x,y){
    const root=document.getElementById('homeRebuild');
    if(!root)return null;
    const names=['profile','coins','gems','energy'];
    for(const name of names){
      const el=root.querySelector('[data-hr="'+name+'"]');
      if(!el)continue;
      const r=el.getBoundingClientRect();
      if(x>=r.left && x<=r.right && y>=r.top && y<=r.bottom)return {el,name};
    }
    return null;
  }
  function topCapture(e){
    const h=$('#home');
    if(!h || !h.classList.contains('active'))return;
    const p=e.changedTouches&&e.changedTouches[0] ? e.changedTouches[0] : e.touches&&e.touches[0] ? e.touches[0] : e;
    if(!p || typeof p.clientX!=='number')return;
    const hit=topButtonAt(p.clientX,p.clientY);
    if(!hit)return;
    if(e.target?.closest?.('.bottom-nav'))return;
    e.preventDefault();
    e.stopPropagation();
    topTapAt=Date.now();
    action(hit.name);
  }
  function suppressDuplicateClick(e){
    if(Date.now()-topTapAt>700)return;
    const p=e.clientX!=null?e:((e.changedTouches&&e.changedTouches[0])||null);
    if(!p)return;
    if(topButtonAt(p.clientX,p.clientY)){e.preventDefault();e.stopPropagation();}
  }
  document.addEventListener('pointerup',topCapture,true);
  document.addEventListener('touchend',topCapture,{capture:true,passive:false});
  document.addEventListener('click',suppressDuplicateClick,true);

  // Profile must not depend on the legacy inventory screen. Capture the bottom-nav tap and open the same new profile.
  function profileNavCapture(e){
    const h=$('#home'); if(!h || !h.classList.contains('active'))return;
    const b=e.target&&e.target.closest?e.target.closest('.bottom-nav [data-screen="inventory"]'):null;
    if(!b)return;
    e.preventDefault(); e.stopPropagation();
    showProfile();
  }
  document.addEventListener('click',profileNavCapture,true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
