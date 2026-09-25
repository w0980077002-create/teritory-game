/* Territory Forge V2 — isolated screen, independent of legacy market CSS/router. */
(function(){
  'use strict';
  const ITEMS=[
    {id:'axe',name:'Боевой топор',icon:'🪓',damage:12,cost:300,rarity:'Обычный'},
    {id:'sword',name:'Стальной меч',icon:'⚔️',damage:18,cost:650,rarity:'Редкий'},
    {id:'hammer',name:'Молот кузнеца',icon:'🔨',damage:25,cost:1000,rarity:'Эпический'},
    {id:'crossbow',name:'Арбалет охотника',icon:'🏹',damage:31,cost:1500,rarity:'Легендарный'}
  ];
  let overlay=null, toastTimer=0;

  function state(){return window.TerritoryStore&&window.TerritoryStore.state?window.TerritoryStore.state:null}
  function save(){const s=state();if(!s)return;if(window.TerritoryStore&&typeof window.TerritoryStore.save==='function')window.TerritoryStore.save();else try{localStorage.setItem('territory_save_v1',JSON.stringify(s))}catch(e){};document.dispatchEvent(new CustomEvent('territory:statechanged'))}
  function toast(msg,kind){const t=overlay&&overlay.querySelector('.fv2-toast');if(!t)return;t.textContent=msg;t.className='fv2-toast show'+(kind?' '+kind:'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function installExitStyles(){
    if(document.getElementById('forge-v2-exit-fix'))return;
    const st=document.createElement('style');
    st.id='forge-v2-exit-fix';
    st.textContent=`
      .forge-v2-overlay{position:fixed!important;inset:0!important;z-index:99999!important;
        overflow:auto!important;-webkit-overflow-scrolling:touch!important;background:#07121c!important}
      .forge-v2-overlay .forge-v2-shell{min-height:100%!important;position:relative!important}
      .forge-v2-overlay .fv2-head{position:sticky!important;top:0!important;z-index:100!important;
        display:flex!important;align-items:center!important;gap:10px!important;
        min-height:64px!important;padding:8px 10px!important;box-sizing:border-box!important;
        background:linear-gradient(180deg,#0b1722,#0b1722f2)!important;
        border-bottom:1px solid #6f5a2a!important}
      .forge-v2-overlay .fv2-back{display:grid!important;place-items:center!important;
        flex:0 0 44px!important;width:44px!important;height:44px!important;
        min-width:44px!important;min-height:44px!important;border-radius:12px!important;
        border:1px solid #d2ae62!important;background:linear-gradient(180deg,#332711,#1c160d)!important;
        color:#ffe8ae!important;font:900 31px/1 Arial,sans-serif!important;
        box-shadow:0 3px 0 #0b0906,0 5px 12px #0008!important;cursor:pointer!important;
        touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
      .forge-v2-overlay .fv2-back:active{transform:scale(.94)!important}
      .forge-v2-overlay .fv2-kicker{font-size:9px!important;color:#cdb36d!important;letter-spacing:1px!important}
      .forge-v2-overlay .fv2-head h2{margin:2px 0 0!important;font-size:18px!important;color:#fff!important}
      .forge-v2-overlay .fv2-wallet{margin-left:auto!important;display:flex!important;gap:5px!important}
      .forge-v2-overlay .fv2-wallet span{padding:6px 8px!important;border:1px solid #34495a!important;
        border-radius:10px!important;background:#111e29!important;color:#fff!important}
      @media(max-width:390px){
        .forge-v2-overlay .fv2-head{min-height:58px!important;padding:6px 8px!important}
        .forge-v2-overlay .fv2-back{width:42px!important;height:42px!important;min-width:42px!important}
        .forge-v2-overlay .fv2-head h2{font-size:16px!important}
      }`;
    document.head.appendChild(st);
  }

  function render(){
    const s=state();if(!s||!overlay)return;
    s.forgeInventory=Array.isArray(s.forgeInventory)?s.forgeInventory:[];
    s.equipment=s.equipment&&typeof s.equipment==='object'?s.equipment:{};
    overlay.querySelector('[data-fv2-coins]').textContent=Number(s.coins||0);
    overlay.querySelector('[data-fv2-gems]').textContent=Number(s.gems||0);
    overlay.querySelector('[data-fv2-damage]').textContent='+'+Number(s.bonusDamage||0);
    overlay.querySelector('#fv2Weapons').innerHTML=ITEMS.map(x=>{
      const equipped=s.equipment.weapon&&s.equipment.weapon.id===x.id;
      const owned=s.forgeInventory.includes(x.id);
      return `<article class="fv2-card ${equipped?'equipped':''}">
        <div class="fv2-icon">${x.icon}</div><div class="fv2-main"><b>${esc(x.name)}</b><small>${esc(x.rarity)} ${equipped?'· ЭКИПИРОВАНО':''}</small><span>💥 Урон +${x.damage} · ${x.cost} 🪙</span></div>
        <button class="fv2-action" type="button" data-buy="${x.id}">${owned?'Получено':x.cost+' 🪙'}</button>
      </article>`
    }).join('');
    const owned=[...new Set(s.forgeInventory)].map(id=>ITEMS.find(x=>x.id===id)).filter(Boolean);
    overlay.querySelector('#fv2OwnedCount').textContent=owned.length+' предметов';
    overlay.querySelector('#fv2Owned').innerHTML=owned.length?owned.map(x=>{
      const eq=s.equipment.weapon&&s.equipment.weapon.id===x.id;
      return `<article class="fv2-card ${eq?'equipped':''}><div class="fv2-icon">${x.icon}</div><div class="fv2-main"><b>${esc(x.name)}</b><small>${eq?'ЭКИПИРОВАНО':'В АРСЕНАЛЕ'}</small><span>💥 Урон +${x.damage}</span></div><button class="fv2-action" type="button" data-equip="${x.id}">${eq?'Экипировано':'Экипировать'}</button></article>`
    }).join(''):'<div class="fv2-empty">Арсенал пока пуст.<br>Купи первое оружие у кузнеца.</div>';
  }

  function buy(id){
    const s=state(),x=ITEMS.find(i=>i.id===id);if(!s||!x)return;
    s.forgeInventory=Array.isArray(s.forgeInventory)?s.forgeInventory:[];
    if(s.forgeInventory.includes(id)){toast('Этот предмет уже есть в арсенале.');return}
    if(Number(s.coins||0)<x.cost){toast('Не хватает монет.','error');return}
    s.coins=Number(s.coins||0)-x.cost;s.forgeInventory.push(id);s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.inventory.push(x.icon);save();render();toast('Получен '+x.name+'. Теперь его можно экипировать.','ok')
  }

  function equip(id){
    const s=state(),x=ITEMS.find(i=>i.id===id);if(!s||!x)return;
    if(!Array.isArray(s.forgeInventory)||!s.forgeInventory.includes(id)){toast('Сначала купи этот предмет.','error');return}
    s.equipment=s.equipment&&typeof s.equipment==='object'?s.equipment:{};s.equipment.weapon={...x};s.weapon=x.name;s.bonusDamage=x.damage;save();render();toast(x.name+' экипирован. Урон +'+x.damage,'ok')
  }

  function close(){
    if(!overlay)return;
    overlay.remove();overlay=null;document.body.style.overflow='';
    // Return explicitly to HOME so Forge behaves like the other HOME buttons.
    if(typeof window.showScreen==='function')window.showScreen('home');
  }

  function open(){
    if(overlay){render();return}
    const s=state();if(!s)return;
    installExitStyles();
    overlay=document.createElement('div');overlay.className='forge-v2-overlay';overlay.innerHTML=`
      <div class="forge-v2-shell">
        <header class="fv2-head">
          <button class="fv2-back" type="button" data-close aria-label="Вернуться на главный экран">‹</button>
          <div><small class="fv2-kicker">SDOLARS · КУЗНИЦА</small><h2>КУЗНИЦА ГЕРОЯ</h2></div>
          <div class="fv2-wallet"><span>🪙 <b data-fv2-coins>0</b></span><span>💎 <b data-fv2-gems>0</b></span></div>
        </header>
        <main class="fv2-body">
          <section class="fv2-hero"><div class="fv2-anvil">⚒️</div><div><b>Кузница</b><span>Оружие сразу попадает в арсенал. Экипированный предмет меняет боевой урон героя.</span></div><strong>💥 <span data-fv2-damage>+0</span></strong></section>
          <section class="fv2-section"><div class="fv2-section-title"><b>ОРУЖИЕ</b><small>Купить один раз</small></div><div class="fv2-grid" id="fv2Weapons"></div></section>
          <section class="fv2-section"><div class="fv2-section-title"><b>МОЙ АРСЕНАЛ</b><small id="fv2OwnedCount">0 предметов</small></div><div class="fv2-grid" id="fv2Owned"></div></section>
          <div class="fv2-note" id="fv2Note">Покупка списывает монеты. Экипировка сразу отражается в профиле.</div>
        </main>
        <div class="fv2-toast"></div>
      </div>`;
    document.body.appendChild(overlay);document.body.style.overflow='hidden';
    overlay.addEventListener('click',e=>{
      const b=e.target.closest('[data-close]');if(b){e.preventDefault();e.stopPropagation();close();return}
      const buyBtn=e.target.closest('[data-buy]');if(buyBtn){buy(buyBtn.dataset.buy);return}
      const eq=e.target.closest('[data-equip]');if(eq){equip(eq.dataset.equip);return}
    });
    overlay.addEventListener('touchend',e=>{
      const b=e.target.closest('[data-close]');if(!b)return;
      e.preventDefault();e.stopPropagation();close();
    },{passive:false});
    render();
  }
  window.openForgeV2=open;
  window.closeForgeV2=close;
})();