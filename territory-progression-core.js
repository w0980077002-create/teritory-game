/* Territory Progression Core — PASS 33
   One small progression layer, intentionally separate from combat math.
   Fast early unlocks, concise hints, immediate action.
*/
(function(){
'use strict';
const KEY='territory_progression_seen_v1';
const UNLOCKS={
  2:{title:'⚔️ Бой открыт',text:'Первый настоящий бой уже рядом. Нажми «В бой» и попробуй сам.',action:'battle',label:'⚔️ ПОПРОБОВАТЬ БОЙ'},
  3:{title:'👥 Спутник с тобой',text:'Спутник уже помогает в бою. Тапни по нему на главном экране.',action:'home',label:'👥 ПОСМОТРЕТЬ СПУТНИКА'},
  5:{title:'🧪 Эликсиры',text:'Теперь можно использовать эликсиры прямо в бою.',action:'shop',label:'🧪 ОТКРЫТЬ ЭЛИКСИРЫ'},
  10:{title:'🗺️ Следующая ступень',text:'Путь главы становится важнее: побеждай, собирай экипировку и открывай босса.',action:'map',label:'🗺️ ОТКРЫТЬ ПУТЬ'}
};
function state(){return window.TerritoryStore?.state||null}
function seen(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}}
function saveSeen(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}}
function open(level){
 const cfg=UNLOCKS[level]; if(!cfg)return;
 let m=document.getElementById('territoryUnlockModal');
 if(!m){m=document.createElement('div');m.id='territoryUnlockModal';m.className='tpc-modal';document.body.appendChild(m)}
 m.innerHTML=`<div class="tpc-backdrop"></div><section class="tpc-card">
   <div class="tpc-glow">✦</div><small>НОВАЯ ВОЗМОЖНОСТЬ</small><h2>${cfg.title}</h2>
   <p>${cfg.text}</p>
   <button class="gold-btn wide" data-tpc-action="${cfg.action}">${cfg.label}</button>
   <button class="dark-btn wide" data-tpc-close>ПОЗЖЕ</button>
 </section>`;
 m.classList.add('show');
 m.onclick=e=>{
   if(e.target.closest('[data-tpc-close]')||e.target.classList.contains('tpc-backdrop'))m.classList.remove('show');
   const a=e.target.closest('[data-tpc-action]');
   if(a){m.classList.remove('show');window.TerritoryNavigation?.go?.(a.dataset.tpcAction)}
 };
}
function check(){
 const s=state();if(!s)return;
 const level=Math.max(1,Number(s.level||s.profile?.level)||1), marks=seen();
 Object.keys(UNLOCKS).map(Number).filter(x=>level>=x&&!marks[x]).sort((a,b)=>a-b).forEach((x,i)=>{
   marks[x]=true;saveSeen(marks);
   setTimeout(()=>open(x),500+i*250);
 });
}
function mount(){
 if(window.__territoryProgressionMounted)return;
 window.__territoryProgressionMounted=true;
 window.addEventListener('territory:level-up',()=>setTimeout(check,120));
 window.addEventListener('territory:state-changed',()=>setTimeout(check,80));
 setTimeout(check,700);
}
window.TerritoryProgressionCore={check,open,unlocks:UNLOCKS};
document.addEventListener('DOMContentLoaded',mount);
})();

/* TERRITORY PASS 34 — HOME EQUIPMENT ECHO
   Uses the canonical PvE equipment state. No combat math or item generation here. */
(function(){
  'use strict';
  const SIGN_KEY='territory_home_equipment_signature_v1';
  let lastHomeSig='';
  let first=true;

  function store(){return window.TerritoryStore?.state||{};}
  function equipment(){
    const eq=Array.isArray(store().equipment)?store().equipment.slice(0,7):[];
    while(eq.length<7)eq.push(null);
    return eq;
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function rarity(item){
    const r=String(item?.rarity||'common').toLowerCase();
    return ['common','uncommon','rare','epic','legendary'].includes(r)?r:'common';
  }
  function icon(item,i){return item?.icon||['🪓','🪖','🛡️','🎗️','🥾','💍','🔮'][i];}
  function name(item,i){return item?.name||item?.title||['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'][i];}
  function sig(eq){return eq.map(x=>x?`${x.id||x.name||''}:${x.rarity||''}:${x.level||''}`:'-').join('|');}
  function topRarity(eq){
    const rank={common:0,uncommon:1,rare:2,epic:3,legendary:4};
    return eq.reduce((a,x)=>rank[rarity(x)]>rank[a]?rarity(x):a,'common');
  }
  function home(){
    const h=document.getElementById('home');
    return h&&h.classList.contains('active')?h:null;
  }
  function ensure(){
    const h=home();
    if(!h)return null;
    const host=h.querySelector('.home-reference-host');
    if(!host)return null;
    let box=host.querySelector('.territory-home-loadout');
    if(!box){
      box=document.createElement('div');
      box.className='territory-home-loadout';
      host.appendChild(box);
    }
    return {host,box};
  }
  function toast(message){
    const h=home(); if(!h)return;
    let t=h.querySelector('.territory-equip-toast');
    if(!t){t=document.createElement('div');t.className='territory-equip-toast';h.querySelector('.home-reference-host')?.appendChild(t);}
    t.textContent=message;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  }
  function render(eq,announce){
    const ui=ensure(); if(!ui)return;
    const sig=sigOf(eq), top=topRarity(eq);
    ui.host.classList.remove('home-gear-common','home-gear-uncommon','home-gear-rare','home-gear-epic','home-gear-legendary');
    ui.host.classList.add('home-gear-'+top);
    ui.host.dataset.equipmentSignature=sig;
    ui.box.innerHTML=`<div class="loadout-title">⚔️ СНАРЯЖЕНИЕ</div><div class="loadout-slots">`+eq.map((item,i)=>{
      const r=rarity(item); const label=name(item,i);
      return `<div class="loadout-slot ${item?'filled':''} rarity-${r}" title="${esc(label)}"><span>${icon(item,i)}</span><small>${item?.level?'Lv.'+item.level:'—'}</small></div>`;
    }).join('')+`</div><div class="loadout-caption">${eq.filter(Boolean).length}/7 слотов · ${top==='legendary'?'легендарное':top==='epic'?'эпическое':top==='rare'?'редкое':top==='uncommon'?'необычное':'обычное'} качество</div>`;
    if(announce){
      const changed=eq.find((x,i)=>x && lastHomeSig.split('|')[i]!==sig.split('|')[i]);
      toast(changed?`🎁 Надето: ${name(changed,eq.indexOf(changed))}`:'🎁 Экипировка обновлена');
    }
  }
  function sigOf(eq){return sig(eq);}
  function tick(){
    const eq=equipment(), s=sig(eq), h=home();
    if(!h){ first=false; return; }
    if(first){
      lastHomeSig=s; first=false; render(eq,false); return;
    }
    if(s!==lastHomeSig){
      render(eq,true);
      lastHomeSig=s;
      try{localStorage.setItem(SIGN_KEY,s);}catch(e){}
    }else render(eq,false);
  }
  function start(){
    try{lastHomeSig=localStorage.getItem(SIGN_KEY)||'';}catch(e){lastHomeSig='';}
    setInterval(tick,900);
    setTimeout(tick,260);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.TerritoryHomeEquipment={refresh:function(){tick();}};
})();
