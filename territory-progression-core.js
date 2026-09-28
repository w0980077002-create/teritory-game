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

/* TERRITORY PASS 35 — REAL HOME EQUIPMENT VISUALS
 * Uses the canonical TerritoryStore.equipment. No new equipment system.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const slots=['weapon','helmet','armor','belt','boots','ring','amulet'];
function text(item){return typeof item==='string'?item:[item?.name,item?.title,item?.type,item?.icon,item?.emoji,item?.id].filter(Boolean).join(' ').toLowerCase()}
function esc(v){return String(v??'').replace(/[<>&"]/g,'')}
function rarity(item){const t=text(item);return /legendary|легендар/.test(t)?'legendary':/epic|эпич/.test(t)?'epic':/rare|редк/.test(t)?'rare':/uncommon|необыч/.test(t)?'uncommon':'common'}
function weapon(item){const t=text(item);if(/bow|лук/.test(t))return'bow';if(/axe|топор/.test(t))return'axe';if(/hammer|молот|булав/.test(t))return'hammer';if(/spear|копь|пик/.test(t))return'spear';if(/dagger|кинжал/.test(t))return'dagger';return'sword'}
function mountGear(){
 const hero=document.querySelector('[data-life-hero]');if(!hero)return null;
 let rack=hero.querySelector('[data-home-gear]');
 if(!rack){rack=document.createElement('div');rack.className='home-gear-visual';rack.dataset.homeGear='1';rack.innerHTML='<i class="hg-helmet"></i><i class="hg-armor"></i><i class="hg-belt"></i><i class="hg-boots"></i><i class="hg-weapon"></i><i class="hg-ring"></i><i class="hg-amulet"></i><span class="hg-spark"></span>';hero.appendChild(rack)}
 return rack;
}
let lastKey='';
function apply(showToast){
 const rack=mountGear();if(!rack)return;
 const eq=Array.isArray(S().equipment)?S().equipment:Array(7).fill(null);
 const key=eq.map((x,i)=>x?[(x.id||x.name||x.title||i),rarity(x)].join(':'):'-').join('|');
 rack.dataset.weapon=eq[0]?weapon(eq[0]):'none';
 rack.dataset.rarity=eq.filter(Boolean).map(rarity).sort((a,b)=>['common','uncommon','rare','epic','legendary'].indexOf(b)-['common','uncommon','rare','epic','legendary'].indexOf(a))[0]||'common';
 slots.forEach((slot,i)=>rack.classList.toggle('has-'+slot,!!eq[i]));
 rack.querySelector('.hg-helmet').textContent=eq[1]?.icon||eq[1]?.emoji||'';
 rack.querySelector('.hg-armor').textContent=eq[2]?'◆':'';
 rack.querySelector('.hg-belt').textContent=eq[3]?'━':'';
 rack.querySelector('.hg-boots').textContent=eq[4]?'◆':'';
 rack.querySelector('.hg-ring').textContent=eq[5]?'✦':'';
 rack.querySelector('.hg-amulet').textContent=eq[6]?'◆':'';
 rack.querySelector('.hg-weapon').textContent=eq[0]?.icon||eq[0]?.emoji||'⚔';
 rack.querySelector('.hg-spark').textContent=rack.dataset.rarity==='legendary'?'✦ ✦':rack.dataset.rarity==='epic'?'✦':'';
 if(showToast&&lastKey&&key!==lastKey){
   const changed=eq.find((x,i)=>{const old=lastKey.split('|')[i]||'-';return x&&old!==key.split('|')[i]});
   if(changed){const layer=document.querySelector('.home-life');const t=layer?.querySelector('[data-life-toast]');if(t){t.textContent='⚔️ Надето: '+(changed.name||changed.title||'новое снаряжение');t.dataset.kind='reward';t.classList.remove('show');void t.offsetWidth;t.classList.add('show')}}
   document.querySelector('[data-life-hero]')?.classList.add('home-gear-changed');setTimeout(()=>document.querySelector('[data-life-hero]')?.classList.remove('home-gear-changed'),900);
 }
 lastKey=key;
}
function init(){apply(false);window.addEventListener('territory:state-changed',()=>setTimeout(()=>apply(true),30));setInterval(()=>apply(false),1200);}
window.TerritoryHomeEquipment={apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* PASS 36 — Inventory compare / one-tap equip */
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slotMap={weapon:0,helmet:1,armor:2,belt:3,boots:4,ring:5,amulet:6};
  const slotNames=['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'];
  const statDefs=[['attack','⚔️','Атака',['attack','strength','damage','atk']],['defense','🛡️','Защита',['defense','def','armor','guard']],['agility','⚡','Ловкость',['agility','agi','speed']],['hp','❤️','Max HP',['maxHp','hp','health']]];
  function num(it,keys){if(!it||typeof it!=='object')return 0;for(const k of keys){const n=Number(it[k]);if(Number.isFinite(n))return n}return 0}
  function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();return /legend/.test(r)?'ЛЕГЕНДАРНЫЙ':/epic|эпич/.test(r)?'ЭПИЧЕСКИЙ':/rare|редк/.test(r)?'РЕДКИЙ':/uncommon|необыч/.test(r)?'НЕОБЫЧНЫЙ':'ОБЫЧНЫЙ'}
  function itemName(it){return it?.name||it?.title||'Предмет'}
  function slotOf(it){return slotMap[it?.type||it?.slot]}
  function stats(it){return Object.fromEntries(statDefs.map(([k,, ,keys])=>[k,num(it,keys)]))}
  function signed(n){return n>0?`+${n}`:String(n)}
  function ensureStyle(){
    if(document.getElementById('territory-inventory-compare-style'))return;
    const st=document.createElement('style');st.id='territory-inventory-compare-style';st.textContent=`
      .ti-compare-backdrop{position:fixed;inset:0;z-index:12000;display:flex;align-items:flex-end;justify-content:center;padding:12px;background:rgba(0,0,0,.66);backdrop-filter:blur(7px)}
      .ti-compare{width:min(520px,100%);max-height:86vh;overflow:auto;border:1px solid rgba(220,184,104,.28);border-radius:20px;background:linear-gradient(180deg,#171b20,#0b0e12);box-shadow:0 22px 60px rgba(0,0,0,.55);color:#eef3f5;padding:14px}
      .ti-head{display:flex;gap:10px;align-items:center}.ti-icon{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;font-size:28px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}.ti-head b{font-size:14px}.ti-head small{display:block;margin-top:3px;opacity:.58;font-size:9px;letter-spacing:.5px}.ti-close{margin-left:auto;border:0;background:rgba(255,255,255,.06);color:inherit;border-radius:10px;width:34px;height:34px;font-size:20px}
      .ti-columns{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.ti-col{padding:10px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}.ti-col.new{border-color:rgba(220,184,104,.28)}.ti-col h4{margin:0 0 7px;font-size:10px;opacity:.62}.ti-col strong{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ti-col span{display:block;margin-top:3px;font-size:8px;opacity:.55}.ti-stat{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.055);font-size:9px}.ti-stat:first-of-type{margin-top:7px}.ti-diff{margin-top:9px;padding:9px;border-radius:11px;background:rgba(220,184,104,.07);font-size:10px;line-height:1.5}.ti-diff b{font-size:11px}.ti-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.ti-actions button{border:0;border-radius:11px;padding:11px;color:inherit;font-weight:900;background:rgba(255,255,255,.07)}.ti-actions .equip{background:rgba(220,184,104,.18);border:1px solid rgba(220,184,104,.3)}
      @media(max-width:380px){.ti-columns{grid-template-columns:1fr}.ti-actions{grid-template-columns:1fr}}
    `;document.head.appendChild(st)
  }
  function close(){document.querySelector('.ti-compare-backdrop')?.remove()}
  function renderStatRows(oldStats,newStats){return statDefs.map(([k,icon,label])=>{const a=oldStats[k],b=newStats[k],d=b-a;return `<div class="ti-stat"><span>${icon} ${label}</span><b>${b} ${d?`<em style="font-style:normal;opacity:.72">(${signed(d)})</em>`:''}</b></div>`}).join('')}
  function equip(item){
    const s=S(),i=slotOf(item);if(i===undefined)return false;
    s.equipment=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);while(s.equipment.length<7)s.equipment.push(null);
    const old=s.equipment[i];s.equipment[i]=item;
    s.inventoryItems=Array.isArray(s.inventoryItems)?s.inventoryItems:[];
    s.inventoryItems=s.inventoryItems.filter(x=>x!==item && String(x?.id)!==String(item?.id));
    if(old)s.inventoryItems.unshift(old);
    if(Array.isArray(s.arena?.gear))s.arena.gear=s.arena.gear.map(id=>String(id)===String(item?.id)?null:id);
    window.TerritoryStore?.saveNow?.();
    window.dispatchEvent(new CustomEvent('territory:inventory-equipped',{detail:{item,old,slot:i}}));
    return true;
  }
  function open(item){
    if(!item)return;ensureStyle();close();
    const i=slotOf(item), old=i===undefined?null:(S().equipment||[])[i]||null, ns=stats(item), os=stats(old), diff=Object.fromEntries(statDefs.map(([k])=>[k,ns[k]-os[k]]));
    const total=Object.values(diff).reduce((a,b)=>a+b,0), icon=item.icon||item.emoji||'🎁';
    const backdrop=document.createElement('div');backdrop.className='ti-compare-backdrop';backdrop.innerHTML=`<section class="ti-compare" role="dialog" aria-label="Сравнение предмета"><div class="ti-head"><div class="ti-icon">${esc(icon)}</div><div><b>СРАВНЕНИЕ ЭКИПИРОВКИ</b><small>${esc(slotNames[i]||'Слот')} · ${esc(rarity(item))} · Lv.${Number(item.level)||1}</small></div><button class="ti-close">×</button></div><div class="ti-columns"><div class="ti-col"><h4>СЕЙЧАС</h4><strong>${esc(old?itemName(old):'Слот пуст')}</strong><span>${old?`${esc(rarity(old))} · Lv.${Number(old.level)||1}`:'Можно надеть без замены'}</span>${renderStatRows(os,os)}</div><div class="ti-col new"><h4>НОВЫЙ ПРЕДМЕТ</h4><strong>${esc(itemName(item))}</strong><span>${esc(rarity(item))} · Lv.${Number(item.level)||1}</span>${renderStatRows(os,ns)}</div></div><div class="ti-diff"><b>${old?'Изменение после замены':'Первый предмет в слоте'}</b><br>${statDefs.map(([k,icon,label])=>`${icon} ${label}: <b>${signed(diff[k])}</b>`).join(' · ')}${total===0?'<br><span style="opacity:.58">По базовым четырём статам разницы нет — проверь редкость, комплект и аффиксы.</span>':''}</div><div class="ti-actions"><button class="equip">⚔️ Надеть</button><button class="keep">🎒 Оставить</button></div></section>`;
    document.body.appendChild(backdrop);
    backdrop.querySelector('.ti-close').onclick=close;backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
    backdrop.querySelector('.keep').onclick=close;
    backdrop.querySelector('.equip').onclick=()=>{if(equip(item)){close();const n=document.createElement('div');n.textContent=`⚔️ Надето: ${itemName(item)}`;n.style.cssText='position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:13000;padding:9px 13px;border-radius:12px;background:rgba(12,18,22,.95);border:1px solid rgba(220,184,104,.35);color:#fff;font-size:11px;font-weight:800;box-shadow:0 10px 28px rgba(0,0,0,.4)';document.body.appendChild(n);setTimeout(()=>n.remove(),1400)}};
  }
  function bind(){
    const host=document.getElementById('inventory');if(!host||host.dataset.compare36==='1')return;
    host.dataset.compare36='1';
    host.addEventListener('click',e=>{const b=e.target.closest('[data-loot-index]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const items=Array.isArray(S().inventoryItems)?S().inventoryItems:[],item=items[Number(b.dataset.lootIndex)];if(item)open(item)},true);
  }
  function init(){bind();window.addEventListener('territory:state-changed',bind);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.TerritoryInventoryCompare={open,equip,close};
})();
