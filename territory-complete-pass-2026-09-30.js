/* TERRITORY COMPLETE PASS — 2026-09-30
 * Integration layer for:
 * - visible Battle Stones button
 * - guest/demo battle-stone access on Render
 * - full shop catalog UI
 * - shared main navigation on Arena
 * - Arena UX helpers
 * - daily check-in / battle-stone purchase endpoints
 *
 * Server-authoritative data is used whenever Telegram auth is available.
 */
(function(){
'use strict';
if(window.TerritoryCompletePass)return;

const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
const STORE_KEY='territory_store_v1';
const S=()=>window.TerritoryStore?.state||{};
const tg=()=>window.Telegram?.WebApp||null;
const auth=()=>window.TerritoryTelegramAuth;
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const guest=()=>auth()?.state!=='authenticated';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let shopBusy=false;

async function api(path,options={}){
  const a=auth();
  if(a?.state==='authenticated' && typeof a.api==='function') return a.api(path,options);
  const w=tg();
  const headers=Object.assign({'content-type':'application/json'},options.headers||{});
  if(w?.initData)headers['x-telegram-init-data']=w.initData;
  const r=await fetch(SERVER+path,Object.assign({},options,{headers}));
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
  return d;
}

function stones(){
  const s=S();
  return Math.max(0,n(s.battleStones));
}
function save(reason){
  try{window.TerritoryStore?.saveNow?.(reason||'complete-pass')}catch(_){}
}
function refreshUI(){
  try{window.TerritoryNavigation?.sync?.()}catch(_){}
  try{window.CombatItems?.render?.()}catch(_){}
  try{window.TerritoryResourceWatch?.render?.()}catch(_){}
  updateStoneLabels();
}

function seedGuestDemo(){
  if(!guest())return;
  try{
    if(localStorage.getItem('territory_guest_demo_stones_seeded')==='1')return;
    if(stones()<=0){
      S().battleStones=30;
      S().battleStonesBonus=0;
      save('guest-demo-stones');
    }
    localStorage.setItem('territory_guest_demo_stones_seeded','1');
  }catch(_){}
}

function stoneButton(){
  return `<button type="button" class="territory-stone-button" data-stone-open>
    <span class="tsb-icon">🪨</span><span class="tsb-value" data-battle-stones>${stones()}</span>
    <small>БОЕВЫЕ</small>
  </button>`;
}

function installHomeStone(){
  const layer=document.querySelector('.home-hit-layer');
  if(!layer)return;
  if(layer.querySelector('[data-stone-open]'))return;
  const speed=layer.querySelector('.home-hit.speed');
  const b=document.createElement('button');
  b.type='button';
  b.className='home-hit territory-home-stone';
  b.dataset.homeAction='battle-stones';
  b.dataset.stoneOpen='';
  b.setAttribute('aria-label','Боевые камни');
  b.innerHTML='<span class="territory-home-stone-face">🪨</span><b data-battle-stones>'+stones()+'</b>';
  if(speed)speed.insertAdjacentElement('beforebegin',b);else layer.appendChild(b);
}

function installBattleStonePill(){
  document.querySelectorAll('.arena-battle,.runner-screen').forEach(host=>{
    if(host.querySelector('.territory-battle-stone-pill'))return;
    const p=document.createElement('button');
    p.type='button';p.className='territory-battle-stone-pill';p.dataset.stoneOpen='';
    p.innerHTML='🪨 <b data-battle-stones>'+stones()+'</b>';
    const h=host.querySelector('.battle-header,.runner-ui');
    if(h)h.appendChild(p);else host.appendChild(p);
  });
}

function updateStoneLabels(){
  document.querySelectorAll('[data-battle-stones]').forEach(x=>x.textContent=String(stones()));
}

function modalBody(){
  return document.getElementById('modalBody');
}
function openStoneModal(){
  const m=document.getElementById('modal'),b=modalBody();
  if(!m||!b)return;
  const packs=[
    {id:'stones_10',icon:'🪨',qty:10,gems:2},
    {id:'stones_60',icon:'🪨',qty:60,gems:12},
    {id:'stones_600',icon:'🪨',qty:600,gems:100}
  ];
  b.innerHTML=`<section class="territory-stone-modal">
    <header><div><small>БОЕВОЙ РЕСУРС</small><h2>🪨 Боевые камни</h2></div><strong>${stones()}</strong></header>
    <p>1 обычный PvE-бой расходует 1 боевой камень. Автобой использует тот же ресурс.</p>
    <div class="tsm-sources">
      <article><b>📅 Ежедневный вход</b><span>Награда выдаётся один раз в сутки.</span><button data-stone-checkin>ЗАБРАТЬ</button></article>
      <article><b>📜 Ежедневные задания</b><span>Камни выдаются за выполнение заданий.</span><button data-stone-daily>ОТКРЫТЬ ЗАДАНИЯ</button></article>
      <article><b>👑 Победа над боссом</b><span>Босс главы выдаёт дополнительный запас.</span><button data-stone-boss>К БОССУ</button></article>
    </div>
    <h3>💎 Купить за алмазы</h3>
    <div class="tsm-packs">${packs.map(p=>`<button class="tsm-pack" data-stone-buy="${p.id}">
      <span>${p.icon}</span><b>${p.qty}</b><small>🟦 ${p.gems} алмазов</small>
    </button>`).join('')}</div>
    <h3>💳 Платные предложения</h3>
    <div class="tsm-real"><button type="button" data-real-stones>🪨 Ежедневный набор — оплата Telegram Stars</button><small>Реальный платёж подключается через Telegram Payments/Stars; без платёжного провайдера деньги не списываются.</small></div>
    ${guest()?'<div class="tsm-demo">RENDER / ГОСТЕВОЙ РЕЖИМ: выдан тестовый запас 30 камней, чтобы можно было проверять бой без Telegram.</div>':''}
  </section>`;
  m.classList.add('show');
  bindStoneModal();
}
function closeModal(){document.getElementById('modal')?.classList.remove('show')}

async function buyStones(id){
  if(shopBusy)return;shopBusy=true;
  try{
    if(guest())throw new Error('Покупка за алмазы доступна после входа через Telegram.');
    const d=await api('/api/battle-stones/buy',{method:'POST',body:JSON.stringify({pack:id})});
    if(d.state)Object.assign(S(),d.state);
    if(d.player){
      S().coins=n(d.player.coins);S().gems=n(d.player.gems);S().redGems=n(d.player.red_gems);
      S().level=Math.max(1,n(d.player.level,1));S().xp=n(d.player.xp);
    }
    save('battle-stones-purchase');openStoneModal();refreshUI();
  }catch(e){alert(e.message||'Покупка не выполнена.')}
  finally{shopBusy=false}
}

async function dailyCheckin(){
  try{
    if(guest())throw new Error('Ежедневный вход сохраняется сервером только для Telegram-игрока.');
    const d=await api('/api/daily/checkin',{method:'POST',body:'{}'});
    if(d.state)Object.assign(S(),d.state);
    if(d.player){S().coins=n(d.player.coins);S().gems=n(d.player.gems);S().level=Math.max(1,n(d.player.level,1));S().xp=n(d.player.xp)}
    save('daily-checkin');openStoneModal();refreshUI();
  }catch(e){alert(e.message||'Награда недоступна.')}
}

function bindStoneModal(){
  document.querySelector('[data-stone-checkin]')?.addEventListener('click',dailyCheckin);
  document.querySelector('[data-stone-daily]')?.addEventListener('click',()=>{closeModal();window.TerritoryNavigation?.go?.('quests')});
  document.querySelector('[data-stone-boss]')?.addEventListener('click',()=>{closeModal();window.PvEFlow?.openBoss?.()});
  document.querySelectorAll('[data-stone-buy]').forEach(b=>b.addEventListener('click',()=>buyStones(b.dataset.stoneBuy)));
  document.querySelector('[data-real-stones]')?.addEventListener('click',()=>alert('Telegram Stars / платежный провайдер ещё не подключён. Интерфейс готов, но реальный платёж пока не списывается.'));
}

const SHOP={
  'Эликсиры':[
    ['elixir_hp','🧪','Эликсир HP','Восстанавливает 30 HP','80 🪙','consumable'],
    ['elixir_energy','🔵','Эликсир энергии','Восстанавливает энергию','70 🪙','consumable'],
    ['elixir_attack','🔥','Эликсир атаки','Временно усиливает атаку','120 🪙','consumable'],
    ['elixir_guard','🛡️','Эликсир защиты','Временно усиливает защиту','120 🪙','consumable'],
    ['adrenaline','⚡','Адреналин','Ускоряет следующий ход','300 🪙','consumable'],
    ['speed_scroll','📜','Свиток ускорения','Сокращает время хода','180 🪙','consumable'],
    ['anti_speed_scroll','🐌','Антиускорение','Замедляет противника','180 🪙','consumable']
  ],
  'Оружие':[
    ['axe','🪓','Боевой топор','12 урона','300 🪙','server'],
    ['sword','⚔️','Стальной меч','18 урона','650 🪙','server'],
    ['hammer','🔨','Молот','25 урона','1 000 🪙','server'],
    ['crossbow','🏹','Арбалет','31 урона','1 500 🪙','server'],
    ['runeblade','🗡️','Рунный клинок','42 урона','2 400 🪙','server']
  ],
  'Броня':[
    ['armor_leather','🥋','Кожаная броня','+12 защиты','420 🪙','server'],
    ['armor_iron','🛡️','Железная броня','+24 защиты','900 🪙','server'],
    ['armor_north','🧥','Северная броня','+38 защиты · +80 HP','1 800 🪙','server'],
    ['armor_jarl','👑','Доспех ярла','+55 защиты · +120 HP','3 500 🪙','server']
  ],
  'Аксессуары':[
    ['belt_warrior','🎗️','Пояс воина','+8 атаки','350 🪙','server'],
    ['boots_wind','🥾','Сапоги ветра','+10 ловкости','550 🪙','server'],
    ['ring_ice','💍','Кольцо льда','+5 крит. шанса','900 🪙','server'],
    ['amulet_north','🔮','Амулет Севера','+40 HP · +4 защиты','1 400 🪙','server']
  ],
  'Боевые':[
    ['stones_10','🪨','Боевые камни ×10','Боевой ресурс','2 💎','stone'],
    ['stones_60','🪨','Боевые камни ×60','Боевой ресурс','12 💎','stone'],
    ['stones_600','🪨','Боевые камни ×600','Большая пачка','100 💎','stone']
  ]
};

function shopCard(item){
  const [id,icon,name,desc,price,type]=item;
  return `<article class="territory-shop-card">
    <div class="tsc-icon">${icon}</div><div class="tsc-copy"><b>${esc(name)}</b><p>${esc(desc)}</p><small>${esc(price)}</small></div>
    <button data-shop-buy="${esc(id)}" data-shop-type="${type}">КУПИТЬ</button>
  </article>`;
}

async function loadServerShop(){
  try{
    if(guest())return;
    const d=await api('/api/shop');
    const map=new Map((d.items||d||[]).map(x=>[String(x.item_id),x]));
    if(map.size)SHOP['Оружие']=SHOP['Оружие'].map(x=>{
      const s=map.get(x[0]);return s?[x[0],s.icon||x[1],s.name||x[2],`${n(s.damage)} урона`,`${n(s.price)} 🪙`,x[5]]:x;
    });
  }catch(_){}
}

async function renderShopV2(){
  const host=document.getElementById('shop'),grid=document.getElementById('shopGrid');
  if(!host||!grid)return;
  await loadServerShop();
  const tabs=[...host.querySelectorAll('.tabs button')];
  const render=(name)=>{
    grid.innerHTML=(SHOP[name]||[]).map(shopCard).join('');
    grid.classList.add('territory-shop-grid');
    grid.querySelectorAll('[data-shop-buy]').forEach(b=>b.addEventListener('click',()=>shopBuy(b.dataset.shopBuy,b.dataset.shopType)));
  };
  tabs.forEach((b,i)=>{b.textContent=Object.keys(SHOP)[i]||b.textContent});
  const extra=document.querySelector('#shop .territory-shop-tabs');
  if(!extra){
    const nav=document.createElement('div');nav.className='territory-shop-tabs';
    Object.keys(SHOP).forEach((name,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=name;
      b.className=i===0?'active':'';b.onclick=()=>{nav.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(name)};
      nav.appendChild(b);
    });
    const old=host.querySelector('.tabs');old?.replaceWith(nav);
  }
  render(Object.keys(SHOP)[0]);
}

async function shopBuy(id,type){
  if(shopBusy)return;shopBusy=true;
  try{
    let d;
    if(type==='stone'){return openStoneModal();}
    if(guest())throw new Error('Покупки сохраняются на сервере после входа через Telegram.');
    if(type==='consumable'){
      d=await api('/api/consumable/buy',{method:'POST',body:JSON.stringify({item_id:id})});
    }else{
      d=await api('/api/shop/buy',{method:'POST',body:JSON.stringify({item_id:id})});
    }
    if(d.state)Object.assign(S(),d.state);
    if(d.player){
      S().coins=n(d.player.coins);S().gems=n(d.player.gems);S().redGems=n(d.player.red_gems);
      S().level=Math.max(1,n(d.player.level,1));S().xp=n(d.player.xp);
    }
    save('shop-purchase');refreshUI();renderShopV2();
    alert('Покупка выполнена.');
  }catch(e){alert(e.message||'Покупка не выполнена.')}
  finally{shopBusy=false}
}

function forceShop(){
  if(document.body.dataset.screen!=='shop')return;
  const grid=document.getElementById('shopGrid');
  if(!grid)return;
  if(grid.dataset.territoryComplete==='1')return;
  grid.dataset.territoryComplete='1';
  renderShopV2();
}

function navigationStyle(){
  document.body.classList.toggle('territory-arena-combat',!!document.querySelector('.arena-modal.arena-in-battle.show'));
}

function bindGlobalClicks(){
  document.addEventListener('click',e=>{
    const stone=e.target.closest?.('[data-stone-open],.territory-home-stone');
    if(stone){e.preventDefault();e.stopPropagation();openStoneModal();return;}
    const ha=e.target.closest?.('[data-home-action="battle-stones"]');
    if(ha){e.preventDefault();e.stopPropagation();openStoneModal();return;}
  },true);
}

function tick(){
  seedGuestDemo();
  installHomeStone();
  installBattleStonePill();
  updateStoneLabels();
  forceShop();
  navigationStyle();
}

function mount(){
  bindGlobalClicks();
  setInterval(tick,600);
  window.addEventListener('territory:state-changed',()=>setTimeout(tick,100));
  window.addEventListener('territory:screen',()=>setTimeout(tick,100));
  tick();
}

window.TerritoryCompletePass={openStoneModal,renderShopV2,buyStones,refreshUI};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
