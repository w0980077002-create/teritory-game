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

/* TERRITORY PASS 37 — SMART INVENTORY
 * Adds filtering, sorting and upgrade-only view to the existing PvE loot inventory.
 * Uses the canonical TerritoryStore.inventoryItems/equipment. No new inventory data model.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const slotMap={weapon:0,helmet:1,armor:2,belt:3,boots:4,ring:5,amulet:6};
const slotNames={weapon:'Оружие',helmet:'Шлем',armor:'Доспех',belt:'Пояс',boots:'Сапоги',ring:'Кольцо',amulet:'Амулет'};
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
let filter='all',sort='new',bound=false;
function num(it,keys){if(!it||typeof it!=='object')return 0;for(const k of keys){const n=Number(it[k]);if(Number.isFinite(n))return n}return 0}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function rarityLabel(r){return({common:'обычный',uncommon:'необычный',rare:'редкий',epic:'эпический',legendary:'легендарный'})[r]||r}
function name(it){return it?.name||it?.title||'Предмет'}
function power(it){return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+rarityRank[rarity(it)]*8)}
function upgrade(it){const i=slotMap[it?.type||it?.slot];if(i===undefined)return false;const old=(S().equipment||[])[i];return power(it)>power(old)+0.5}
function ensureStyle(){if(document.getElementById('territory-smart-inventory-style'))return;const st=document.createElement('style');st.id='territory-smart-inventory-style';st.textContent=`
.tsi-controls{margin:10px 0 12px;padding:10px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(220,184,104,.16)}
.tsi-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.tsi-head b{font-size:11px}.tsi-count{font-size:9px;opacity:.55}
.tsi-row{display:flex;gap:5px;overflow:auto;padding-bottom:2px}.tsi-row+.tsi-row{margin-top:6px}.tsi-chip{flex:0 0 auto;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:6px 8px;background:rgba(255,255,255,.035);color:inherit;font-size:9px;font-weight:800}.tsi-chip.active{border-color:rgba(220,184,104,.42);background:rgba(220,184,104,.12)}
#inventory .loot-item.tsi-upgrade{border-color:rgba(110,210,150,.34);box-shadow:inset 0 0 12px rgba(110,210,150,.035)}#inventory .loot-item .tsi-mark{font-size:8px;opacity:.7;margin-left:4px}#inventory .loot-item .tsi-power{float:right;font-size:8px;opacity:.5}
@media(max-width:380px){.tsi-chip{padding:6px 7px;font-size:8px}}
`;document.head.appendChild(st)}
function controls(panel){ensureStyle();let c=panel.querySelector('.tsi-controls');if(!c){c=document.createElement('div');c.className='tsi-controls';panel.insertBefore(c,panel.querySelector('.loot-items')||null)}c.innerHTML=`<div class="tsi-head"><b>🎒 Умный инвентарь</b><span class="tsi-count"></span></div><div class="tsi-row tsi-filters">${[['all','Все'],['weapon','Оружие'],['armor','Броня'],['accessory','Аксессуары'],['upgrade','⬆ Улучшения']].map(x=>`<button class="tsi-chip ${filter===x[0]?'active':''}" data-tsi-filter="${x[0]}">${x[1]}</button>`).join('')}</div><div class="tsi-row tsi-sorts">${[['new','🕘 Новые'],['power','⚔️ Сила'],['level','⭐ Уровень'],['rarity','💎 Редкость']].map(x=>`<button class="tsi-chip ${sort===x[0]?'active':''}" data-tsi-sort="${x[0]}">${x[1]}</button>`).join('')}</div>`;c.querySelectorAll('[data-tsi-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.tsiFilter;render()});c.querySelectorAll('[data-tsi-sort]').forEach(b=>b.onclick=()=>{sort=b.dataset.tsiSort;render()});return c}
function filtered(items){return items.map((item,index)=>({item,index})).filter(x=>{const t=x.item?.type||x.item?.slot;if(filter==='all')return true;if(filter==='upgrade')return upgrade(x.item);if(filter==='armor')return ['helmet','armor'].includes(t);if(filter==='accessory')return ['belt','boots','ring','amulet'].includes(t);return t===filter})}
function sorted(list){return list.sort((a,b)=>{if(sort==='power')return power(b.item)-power(a.item);if(sort==='level')return Number(b.item?.level||0)-Number(a.item?.level||0)||power(b.item)-power(a.item);if(sort==='rarity')return rarityRank[rarity(b.item)]-rarityRank[rarity(a.item)]||power(b.item)-power(a.item);return b.index-a.index})}
function render(){const host=document.getElementById('inventory');if(!host)return;const panel=host.querySelector('.loot-inventory-panel');if(!panel)return;const list=panel.querySelector('.loot-items');if(!list)return;const items=Array.isArray(S().inventoryItems)?S().inventoryItems:[];controls(panel);const rows=sorted(filtered(items));const count=panel.querySelector('.tsi-count');if(count)count.textContent=`${rows.length} из ${items.length}`;if(!rows.length){list.innerHTML='<span style="opacity:.65;font-size:12px">В этом фильтре предметов пока нет.</span>';return}list.innerHTML=rows.slice(0,30).map(x=>{const it=x.item,r=rarity(it),up=upgrade(it),slot=slotNames[it?.type||it?.slot]||'Предмет';return `<button class="loot-item ${up?'tsi-upgrade':''}" data-loot-index="${x.index}"><span>${String(it?.icon||it?.emoji||'🎁')}</span><b>${String(name(it)).replace(/[&<>"']/g,'')}</b><small>${rarityLabel(r)} · ${slot} · Lv.${Number(it?.level)||1}<span class="tsi-power">⚡${power(it)}</span>${up?'<span class="tsi-mark">⬆ Лучше текущего</span>':''}</small></button>`}).join('');list.querySelectorAll('[data-loot-index]').forEach(b=>b.title='Открыть сравнение');}
function mount(){if(bound)return;bound=true;const tick=()=>setTimeout(render,80);window.addEventListener('territory:state-changed',tick);window.addEventListener('territory:inventory-equipped',tick);const obs=new MutationObserver(()=>{if(document.querySelector('#inventory .loot-inventory-panel'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.TerritorySmartInventory={render};
})();

/* TERRITORY PASS 38 — HERO BUILD CENTER
 * A compact build view on the existing #hero screen.
 * Reads canonical TerritoryStore/equipment/follower data only.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const slotNames=['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'];
const slotIcons=['⚔️','🪖','🛡️','🔗','🥾','💍','📿'];
const statDefs=[['attack','⚔️','Атака',['attack','strength','damage','atk']],['defense','🛡️','Защита',['defense','def','armor','guard']],['agility','⚡','Ловкость',['agility','agi','speed']],['hp','❤️','Max HP',['maxHp','hp','health']]];
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
let bound=false;
function num(it,keys){if(!it||typeof it!=='object')return 0;for(const k of keys){const n=Number(it[k]);if(Number.isFinite(n))return n}return 0}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function rLabel(r){return({common:'обычный',uncommon:'необычный',rare:'редкий',epic:'эпический',legendary:'легендарный'})[r]||r}
function name(it){return it?.name||it?.title||'Слот пуст'}
function power(it){if(!it)return 0;return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+rarityRank[rarity(it)]*8)}
function esc(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function go(action){window.TerritoryNavigation?.go?.(action)}
function follower(){const f=S().activeFollower||S().follower; if(f&&typeof f==='object')return f;const id=S().activeFollowerId||S().followerId;const cat=window.Followers?.catalog||window.Followers?.list||[];return Array.isArray(cat)?cat.find(x=>x.id===id)||null:null}
function followerName(f){return f?.name||f?.title||'Лиабро'}
function followerRole(f){return f?.role||f?.class||'Спутник'}
function derived(){
 const ds=window.TerritoryStore?.getDerivedStats?.();
 if(ds&&typeof ds==='object')return ds;
 const eq=Array.isArray(S().equipment)?S().equipment:[];
 return Object.fromEntries(statDefs.map(([k,, ,keys])=>[k,eq.reduce((a,it)=>a+num(it,keys),0)]));
}
function currentSet(){
 const eq=Array.isArray(S().equipment)?S().equipment:[];const ids={};
 eq.filter(Boolean).forEach(it=>{const id=it?.setId||it?.set||it?.setID;if(id)ids[id]=(ids[id]||0)+1});
 const rows=Object.entries(ids).sort((a,b)=>b[1]-a[1]);return rows[0]||null;
}
function nextUpgrade(){
 const inv=Array.isArray(S().inventoryItems)?S().inventoryItems:[],eq=Array.isArray(S().equipment)?S().equipment:[];
 let best=null;
 inv.forEach(it=>{const type=it?.type||it?.slot;const idx=slotNames.findIndex((_,i)=>['weapon','helmet','armor','belt','boots','ring','amulet'][i]===type);if(idx<0)return;const p=power(it),old=power(eq[idx]);if(p>old+0.5&&(!best||p-power(eq[best.idx])>p-power(eq[best.idx])))best={idx,item:it,p,delta:p-old}});
 return best;
}
function style(){if(document.getElementById('territory-hero-build-style'))return;const st=document.createElement('style');st.id='territory-hero-build-style';st.textContent=`
#hero .thb{margin:10px 0 88px;padding:12px;border-radius:18px;background:linear-gradient(180deg,rgba(20,25,31,.94),rgba(8,11,15,.94));border:1px solid rgba(220,184,104,.2);box-shadow:0 16px 40px rgba(0,0,0,.28);color:#eef3f5}
.thb-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.thb-kicker{font-size:8px;letter-spacing:1.3px;opacity:.52}.thb-title{margin:2px 0 0;font-size:18px}.thb-level{font-size:9px;opacity:.62}
.thb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.thb-stat{padding:8px 5px;text-align:center;border-radius:11px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.thb-stat b{display:block;font-size:13px}.thb-stat small{font-size:7px;opacity:.5}
.thb-section{margin-top:12px}.thb-section-title{font-size:9px;letter-spacing:.8px;opacity:.58;margin-bottom:7px}.thb-gear{display:grid;grid-template-columns:1fr 1fr;gap:6px}.thb-slot{display:flex;align-items:center;gap:8px;padding:8px;border-radius:11px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);min-width:0}.thb-slot b{font-size:9px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.thb-slot small{font-size:7px;opacity:.52;display:block;margin-top:2px}.thb-slot .ico{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.05);flex:0 0 auto}
.thb-slot[data-rarity=rare]{border-color:rgba(90,150,255,.28)}.thb-slot[data-rarity=epic]{border-color:rgba(190,100,255,.3)}.thb-slot[data-rarity=legendary]{border-color:rgba(255,190,70,.38);box-shadow:0 0 16px rgba(255,190,70,.06)}
.thb-follower{display:flex;align-items:center;gap:9px;padding:10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.thb-follower .face{font-size:24px}.thb-follower b{font-size:11px}.thb-follower small{display:block;font-size:8px;opacity:.55;margin-top:2px}
.thb-set{padding:10px;border-radius:12px;background:rgba(220,184,104,.06);border:1px solid rgba(220,184,104,.14);font-size:9px}.thb-set strong{font-size:11px}.thb-set span{opacity:.58;margin-left:5px}.thb-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.thb-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 4px;font-size:8px;font-weight:900}.thb-next{margin-top:9px;padding:10px;border-radius:12px;background:rgba(110,210,150,.055);border:1px solid rgba(110,210,150,.16);font-size:9px}.thb-next b{display:block;font-size:10px}.thb-next button{margin-top:7px;border:0;border-radius:9px;padding:8px 10px;background:rgba(110,210,150,.12);color:inherit;font-weight:900;font-size:8px}
@media(max-width:380px){.thb-stats{grid-template-columns:repeat(2,1fr)}.thb-gear{grid-template-columns:1fr}.thb-actions button{font-size:7px}}
`;document.head.appendChild(st)}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.thb');if(!box){box=document.createElement('section');box.className='thb';host.appendChild(box)}
 const s=S(),ds=derived(),eq=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null),f=follower(),set=currentSet(),up=nextUpgrade(),level=Number(s.level||s.profile?.level)||1;
 const displayStats=statDefs.map(([k,icon,label])=>`<div class="thb-stat"><b>${icon} ${Math.round(Number(ds?.[k]||0))}</b><small>${label}</small></div>`).join('');
 const gear=eq.map((it,i)=>{const r=rarity(it);return `<button class="thb-slot" data-thb-slot="${i}" data-rarity="${r}"><span class="ico">${esc(it?.icon||it?.emoji||slotIcons[i])}</span><span style="min-width:0"><b>${esc(name(it))}</b><small>${it?`${rLabel(r)} · Lv.${Number(it.level)||1} · ⚡${power(it)}`:'Слот свободен'}</small></span></button>`}).join('');
 const setHtml=set?`<div class="thb-set"><strong>🧩 Комплект: ${esc(set[0])}</strong><span>${set[1]} / 7 предметов</span></div>`:`<div class="thb-set"><strong>🧩 Комплект</strong><span>Собери предметы одного сета</span></div>`;
 const upHtml=up?`<div class="thb-next"><b>⚡ Следующий апгрейд</b>${esc(name(up.item))} · +${up.delta} силы<button data-thb-action="inventory">🎒 ОТКРЫТЬ ИНВЕНТАРЬ</button></div>`:'';
 box.innerHTML=`<div class="thb-head"><div><div class="thb-kicker">СБОРКА ГЕРОЯ</div><div class="thb-title">${esc(s.name||s.playerName||s.profile?.name||'Игрок')}</div></div><div class="thb-level">Lv.${level}</div></div><div class="thb-stats">${displayStats}</div><div class="thb-section"><div class="thb-section-title">ЭКИПИРОВКА</div><div class="thb-gear">${gear}</div></div><div class="thb-section"><div class="thb-section-title">СПУТНИК</div><div class="thb-follower"><div class="face">${esc(f?.icon||f?.emoji||'👥')}</div><div><b>${esc(followerName(f))}</b><small>${esc(followerRole(f))}</small></div></div></div><div class="thb-section"><div class="thb-section-title">КОМПЛЕКТ</div>${setHtml}</div>${upHtml}<div class="thb-actions"><button data-thb-action="inventory">🎒 Инвентарь</button><button data-thb-action="forge">🔨 Кузница</button><button data-thb-action="home">🏠 Главная</button></div>`;
 box.querySelectorAll('[data-thb-action]').forEach(b=>b.onclick=()=>go(b.dataset.thbAction));
 box.querySelectorAll('[data-thb-slot]').forEach(b=>b.onclick=()=>{const idx=Number(b.dataset.thbSlot),it=eq[idx];if(it&&window.TerritoryInventoryCompare?.open)window.TerritoryInventoryCompare.open(it);else go('inventory')});
}
function mount(){if(bound)return;bound=true;const tick=()=>setTimeout(render,100);window.addEventListener('territory:state-changed',tick);window.addEventListener('territory:inventory-equipped',tick);const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.TerritoryHeroBuild={render};
})();

/* TERRITORY PASS 39 — HERO SLOT CHANGER
 * Tapping an equipped slot opens only compatible inventory items for that slot.
 * Uses the canonical inventory/equipment and the existing compare/equip layer.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const types=['weapon','helmet','armor','belt','boots','ring','amulet'];
const names=['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'];
const icons=['⚔️','🪖','🛡️','🔗','🥾','💍','📿'];
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
let opened=false;
function num(it,keys){if(!it||typeof it!=='object')return 0;for(const k of keys){const n=Number(it[k]);if(Number.isFinite(n))return n}return 0}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function power(it){return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+rarityRank[rarity(it)]*8)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function close(){document.querySelector('.thc-backdrop')?.remove();opened=false}
function style(){if(document.getElementById('territory-hero-slot-change-style'))return;const st=document.createElement('style');st.id='territory-hero-slot-change-style';st.textContent=`
.thc-backdrop{position:fixed;inset:0;z-index:12500;display:flex;align-items:flex-end;justify-content:center;padding:10px;background:rgba(0,0,0,.68);backdrop-filter:blur(8px)}
.thc{width:min(520px,100%);max-height:86vh;overflow:auto;border:1px solid rgba(220,184,104,.26);border-radius:20px;background:linear-gradient(180deg,#171b20,#090c10);color:#eef3f5;padding:13px;box-shadow:0 24px 70px rgba(0,0,0,.58)}
.thc-head{display:flex;align-items:center;gap:9px}.thc-head b{font-size:13px}.thc-head small{display:block;margin-top:3px;font-size:8px;opacity:.5}.thc-close{margin-left:auto;width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.06);color:inherit;font-size:19px}
.thc-list{display:grid;gap:6px;margin-top:11px}.thc-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.035);color:inherit;text-align:left}.thc-item.up{border-color:rgba(110,210,150,.28);background:rgba(110,210,150,.045)}.thc-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.05);font-size:20px;flex:0 0 auto}.thc-item b{display:block;font-size:10px}.thc-item small{display:block;margin-top:3px;font-size:8px;opacity:.55}.thc-power{margin-left:auto;font-size:10px;opacity:.72}.thc-empty{padding:18px;text-align:center;font-size:10px;opacity:.55}.thc-current{margin-top:8px;padding:8px;border-radius:10px;background:rgba(220,184,104,.055);font-size:8px;opacity:.65}
`;document.head.appendChild(st)}
function open(idx){style();close();opened=true;const s=S(),inv=Array.isArray(s.inventoryItems)?s.inventoryItems:[],eq=Array.isArray(s.equipment)?s.equipment:[],type=types[idx],current=eq[idx]||null;const items=inv.map((item,index)=>({item,index,p:power(item)})).filter(x=>(x.item?.type||x.item?.slot)===type).sort((a,b)=>b.p-a.p);const backdrop=document.createElement('div');backdrop.className='thc-backdrop';const list=items.length?items.map(x=>{const it=x.item,delta=x.p-power(current),up=delta>0;return `<button class="thc-item ${up?'up':''}" data-thc-index="${x.index}"><span class="thc-icon">${esc(it?.icon||it?.emoji||icons[idx])}</span><span style="min-width:0"><b>${esc(it?.name||it?.title||'Предмет')}</b><small>${String(rarity(it))} · Lv.${Number(it?.level)||1}${up?' · ⬆ лучше текущего':''}</small></span><span class="thc-power">⚡${x.p}</span></button>`}).join(''):`<div class="thc-empty">Подходящих предметов в инвентаре пока нет.</div>`;backdrop.innerHTML=`<section class="thc"><div class="thc-head"><span style="font-size:22px">${icons[idx]}</span><div><b>СМЕНИТЬ: ${names[idx].toUpperCase()}</b><small>Показываю только совместимые предметы</small></div><button class="thc-close">×</button></div>${current?`<div class="thc-current">Сейчас: <b>${esc(current.name||current.title||'Предмет')}</b> · ⚡${power(current)}</div>`:''}<div class="thc-list">${list}</div></section>`;document.body.appendChild(backdrop);backdrop.querySelector('.thc-close').onclick=close;backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});backdrop.querySelectorAll('[data-thc-index]').forEach(b=>b.onclick=()=>{const it=(S().inventoryItems||[])[Number(b.dataset.thcIndex)];if(it&&window.TerritoryInventoryCompare?.open){close();window.TerritoryInventoryCompare.open(it)}})}
function bind(){const hero=document.getElementById('hero');if(!hero||hero.dataset.slotChanger39==='1')return;hero.dataset.slotChanger39='1';hero.addEventListener('click',e=>{const b=e.target.closest('.thb-slot');if(!b)return;const box=b.closest('.thb');if(!box)return;const idx=Number(b.dataset.thbSlot);if(!Number.isInteger(idx)||idx<0||idx>6)return;e.preventDefault();e.stopImmediatePropagation();open(idx)},true)}
function init(){bind();window.addEventListener('territory:state-changed',bind)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.TerritoryHeroSlotChanger={open,close};
})();


/* TERRITORY PASS 40 — FOLLOWER BUILD CENTER
 * Uses canonical Followers/TerritoryStore data. UI-only follower selection; no combat math changes.
 */
(()=>{
'use strict';
const KEY='territory_follower_center_40';
function S(){return window.TerritoryStore?.state||window.TerritoryStore?.getState?.()||{};}
function followers(){const F=window.Followers; if(!F)return[]; const s=S(); const owned=s.ownedFollowers||s.followersOwned||s.followers?.owned; if(Array.isArray(owned)){return owned.map(x=>typeof x==='string'?F.get?.(x):x).filter(Boolean)} const cat=F.catalog||F.list||{}; if(Array.isArray(cat))return cat; return Object.values(cat||{}).filter(Boolean).slice(0,5);}
function activeId(){const s=S();return s.activeFollower||s.activeFollowerId||s.followerId||s.followers?.active||'liabro';}
function idOf(f){return f?.id||f?.key||f?.uid||f?.code;}
function name(f){return f?.name||f?.title||f?.label||'Спутник';}
function role(f){return f?.role||f?.type||'Спутник';}
function icon(f){return f?.icon||f?.emoji||f?.symbol||'👥';}
function esc(x){return String(x??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function style(){if(document.getElementById('territory-follower-center-style'))return;const st=document.createElement('style');st.id='territory-follower-center-style';st.textContent=`
#hero .tfc{margin:10px 0 10px;padding:12px;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(220,184,104,.16);color:#eef3f5}.tfc-title{font-size:10px;letter-spacing:1px;opacity:.6}.tfc-active{display:flex;align-items:center;gap:10px;margin-top:8px;padding:10px;border-radius:12px;background:rgba(220,184,104,.055);border:1px solid rgba(220,184,104,.13)}.tfc-active .face{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(255,255,255,.05);font-size:21px}.tfc-active b{display:block;font-size:12px}.tfc-active small{font-size:8px;opacity:.55}.tfc-list{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px}.tfc-card{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.035);color:inherit;border-radius:11px;padding:8px;text-align:left;display:flex;align-items:center;gap:7px}.tfc-card.active{border-color:rgba(220,184,104,.42);box-shadow:0 0 14px rgba(220,184,104,.07)}.tfc-card .ficon{font-size:18px}.tfc-card b{display:block;font-size:9px}.tfc-card small{display:block;font-size:7px;opacity:.5;margin-top:2px}.tfc-hint{margin-top:7px;font-size:8px;opacity:.45}.tfc-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:14000;padding:9px 13px;border-radius:12px;background:rgba(12,18,22,.96);border:1px solid rgba(220,184,104,.32);color:#fff;font-size:10px;font-weight:900;box-shadow:0 10px 28px rgba(0,0,0,.4)}@media(max-width:380px){.tfc-list{grid-template-columns:1fr}}
`;document.head.appendChild(st)}
function setActive(f){const id=idOf(f);if(!id)return false;const s=S(); if(typeof window.TerritoryStore?.setActiveFollower==='function')window.TerritoryStore.setActiveFollower(id); else {s.activeFollower=id;window.TerritoryStore?.save?.();window.dispatchEvent(new CustomEvent('territory:state-changed'));} window.dispatchEvent(new CustomEvent('territory:follower-changed',{detail:{id,follower:f}}));return true}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tfc');if(!box){box=document.createElement('section');box.className='tfc';host.appendChild(box)}const list=followers();const aid=activeId();const active=list.find(f=>idOf(f)===aid)||list[0];box.innerHTML=`<div class="tfc-title">👥 СПУТНИК</div><div class="tfc-active"><div class="face">${esc(icon(active))}</div><div><b>${esc(name(active))}</b><small>${esc(role(active))} · активен в бою</small></div></div><div class="tfc-list">${list.map(f=>{const on=idOf(f)===idOf(active);return `<button class="tfc-card ${on?'active':''}" data-tfc-id="${esc(idOf(f))}"><span class="ficon">${esc(icon(f))}</span><span><b>${esc(name(f))}</b><small>${esc(role(f))}${on?' · ✓':''}</small></span></button>`}).join('')}</div><div class="tfc-hint">Выбор спутника меняет только активного спутника через существующую систему Followers.</div>`;box.querySelectorAll('[data-tfc-id]').forEach(b=>b.onclick=()=>{const f=list.find(x=>String(idOf(x))===String(b.dataset.tfcId));if(!f)return;if(setActive(f)){render();const t=document.createElement('div');t.className='tfc-toast';t.textContent='👥 Активен: '+name(f);document.body.appendChild(t);setTimeout(()=>t.remove(),1300)}})}
function mount(){const tick=()=>setTimeout(render,120);window.addEventListener('territory:state-changed',tick);window.addEventListener('territory:follower-changed',tick);const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryFollowerCenter={render,setActive};
})();
