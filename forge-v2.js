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
      return `<article class="fv2-card ${eq?'equipped':''}"><div class="fv2-icon">${x.icon}</div><div class="fv2-main"><b>${esc(x.name)}</b><small>${eq?'ЭКИПИРОВАНО':'В АРСЕНАЛЕ'}</small><span>💥 Урон +${x.damage}</span></div><button class="fv2-action" type="button" data-equip="${x.id}">${eq?'Экипировано':'Экипировать'}</button></article>`
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
  function close(){if(!overlay)return;overlay.remove();overlay=null;document.body.style.overflow='';}
  function open(){
    if(overlay){render();return}
    const s=state();if(!s)return;
    overlay=document.createElement('div');overlay.className='forge-v2-overlay';overlay.innerHTML=`
      <div class="forge-v2-shell">
        <header class="fv2-head"><button class="fv2-back" type="button" data-close>‹</button><div><small class="fv2-kicker">SDOLARS · КУЗНИЦА</small><h2>КУЗНИЦА ГЕРОЯ</h2></div><div class="fv2-wallet"><span>🪙 <b data-fv2-coins>0</b></span><span>💎 <b data-fv2-gems>0</b></span></div></header>
        <main class="fv2-body">
          <section class="fv2-hero"><div class="fv2-anvil">⚒️</div><div><b>Кузница</b><span>Оружие сразу попадает в арсенал. Экипированный предмет меняет боевой урон героя.</span></div><strong>💥 <span data-fv2-damage>+0</span></strong></section>
          <section class="fv2-section"><div class="fv2-section-title"><b>ОРУЖИЕ</b><small>Купить один раз</small></div><div class="fv2-grid" id="fv2Weapons"></div></section>
          <section class="fv2-section"><div class="fv2-section-title"><b>МОЙ АРСЕНАЛ</b><small id="fv2OwnedCount">0 предметов</small></div><div class="fv2-grid" id="fv2Owned"></div></section>
          <div class="fv2-note" id="fv2Note">Покупка списывает монеты. Экипировка сразу отражается в профиле.</div>
        </main>
        <div class="fv2-toast"></div>
      </div>`;
    document.body.appendChild(overlay);document.body.style.overflow='hidden';
    overlay.addEventListener('click',e=>{const b=e.target.closest('[data-close]');if(b){close();return}const buyBtn=e.target.closest('[data-buy]');if(buyBtn){buy(buyBtn.dataset.buy);return}const eq=e.target.closest('[data-equip]');if(eq){equip(eq.dataset.equip);return}});
    render();
  }
  window.openForgeV2=open;
  window.closeForgeV2=close;
})();
