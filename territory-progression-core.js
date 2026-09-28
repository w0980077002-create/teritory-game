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

/* TERRITORY PASS 41 — SET BUILDER CENTER
 * UI-only set overview and quick path to matching inventory items. No combat math changes.
 */
(()=>{
'use strict';
const SET_NAMES={tide:'Прилив',gold:'Золото',blackflag:'Чёрный флаг',sacred:'Священный',warchief:'Воевода'};
const RANK={common:1,uncommon:2,rare:3,epic:4,legendary:5};
const slots=['weapon','helmet','armor','belt','boots','ring','amulet'];
const slotNames=['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'];
function S(){return window.TerritoryStore?.state||{};}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function setId(it){return String(it?.setId||it?.set||it?.setID||'').toLowerCase();}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function power(it){if(!it)return 0;const n=(ks)=>{for(const k of ks){const x=Number(it[k]);if(Number.isFinite(x))return x}return 0};return Math.round(n(['attack','strength','damage','atk'])+n(['defense','def','armor','guard'])+n(['agility','agi','speed'])+n(['maxHp','hp','health'])/3+n(['critChance'])*3+n(['damageReduction'])*3+n(['bonusXp'])*2+Number(it.level||1)*1.5+(RANK[rarity(it)]||1)*8)}
function style(){if(document.getElementById('territory-set-builder-style'))return;const st=document.createElement('style');st.id='territory-set-builder-style';st.textContent=`
#hero .tsb{margin:10px 0 10px;padding:12px;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(220,184,104,.15);color:#eef3f5}.tsb-title{font-size:10px;letter-spacing:1px;opacity:.6}.tsb-main{margin-top:8px;padding:10px;border-radius:12px;background:rgba(220,184,104,.045);border:1px solid rgba(220,184,104,.11)}.tsb-main b{font-size:12px}.tsb-main small{display:block;margin-top:3px;font-size:8px;opacity:.5}.tsb-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:8px}.tsb-chip{padding:7px 3px;text-align:center;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);font-size:7px}.tsb-chip strong{display:block;font-size:11px}.tsb-chip.on{border-color:rgba(110,210,150,.3);background:rgba(110,210,150,.045)}.tsb-missing{margin-top:8px;display:grid;gap:5px}.tsb-missing button{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.035);color:inherit;border-radius:10px;padding:8px;text-align:left;font-size:8px}.tsb-missing b{font-size:9px}.tsb-missing small{opacity:.5}.tsb-note{margin-top:7px;font-size:7px;opacity:.42}@media(max-width:380px){.tsb-grid{grid-template-columns:repeat(3,1fr)}}`;
document.head.appendChild(st)}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tsb');if(!box){box=document.createElement('section');box.className='tsb';host.appendChild(box)}const s=S(),eq=Array.isArray(s.equipment)?s.equipment:[],inv=Array.isArray(s.inventoryItems)?s.inventoryItems:[];const counts={};eq.forEach(it=>{const id=setId(it);if(id)counts[id]=(counts[id]||0)+1});inv.forEach(it=>{const id=setId(it);if(id)counts[id]=(counts[id]||0)});let best=Object.keys(SET_NAMES).sort((a,b)=>(counts[b]||0)-(counts[a]||0))[0]||'tide';let owned=eq.filter(it=>setId(it)===best).length;const total=7;const missing=[];for(let i=0;i<7;i++){const it=eq[i];if(setId(it)!==best)missing.push(i)}const invCandidates=missing.map(i=>{const found=inv.map((it,index)=>({it,index,p:power(it)})).filter(x=>setId(x.it)===best&&String(x.it.type||x.it.slot)===slots[i]).sort((a,b)=>b.p-a.p)[0];return {i,found}});box.innerHTML=`<div class="tsb-title">🧩 СЕТЫ И СБОРКА</div><div class="tsb-main"><b>${esc(SET_NAMES[best]||best)} — ${owned}/${total}</b><small>Предметы этого сета, уже надетые на герое</small></div><div class="tsb-grid">${Object.keys(SET_NAMES).map(id=>{const n=eq.filter(it=>setId(it)===id).length;return `<div class="tsb-chip ${id===best?'on':''}"><strong>${n}/7</strong>${esc(SET_NAMES[id])}</div>`}).join('')}</div><div class="tsb-missing">${invCandidates.length?invCandidates.map(x=>x.found?`<button data-tsb-index="${x.found.index}"><b>⬆ ${esc(slotNames[x.i])}</b><small>${esc(x.found.it.name||'Предмет')} · ⚡${x.found.p}</small></button>`:`<div class="tsb-note">${esc(slotNames[x.i])}: подходящего предмета нет</div>`).join(''): '<div class="tsb-note">Комплект собран полностью.</div>'}</div><div class="tsb-note">Бонусы комплекта остаются в существующей системе игры; этот блок только показывает путь сборки.</div>`;box.querySelectorAll('[data-tsb-index]').forEach(b=>b.onclick=()=>{const it=(S().inventoryItems||[])[Number(b.dataset.tsbIndex)];if(it&&window.TerritoryInventoryCompare?.open)window.TerritoryInventoryCompare.open(it);});}
function mount(){const tick=()=>setTimeout(render,120);window.addEventListener('territory:state-changed',tick);window.addEventListener('territory:inventory-equipped',tick);const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritorySetBuilder={render};
})();

/* PASS 42 — BATTLE READY CENTER
 * UI-only battle preparation summary on Hero. Reuses existing state and navigation.
 * No combat math, rewards, or progression rules are changed.
 */
(function(){
'use strict';
const NS='territory-battle-ready';
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number(v||0);
function derived(){try{return typeof window.TerritoryStore?.getDerivedStats==='function'?window.TerritoryStore.getDerivedStats():{};}catch(e){return {}}}
function equip(){const s=S();return Array.isArray(s.equipment)?s.equipment:Array(7).fill(null)}
function follower(){const s=S();const id=s.activeFollower||s.followerId||s.active_follower;const list=Array.isArray(window.Followers?.catalog)?window.Followers.catalog:(Array.isArray(window.Followers?.list)?window.Followers.list:[]);return list.find(x=>String(x.id||x.key)===String(id))||list[0]||null}
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tbr{margin:10px 0 10px;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(110,210,150,.045),rgba(255,255,255,.018));border:1px solid rgba(110,210,150,.16);color:#eef3f5}
.tbr-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.tbr-kicker{font-size:9px;letter-spacing:1.2px;opacity:.55}.tbr-title{font-size:13px;font-weight:900;margin-top:2px}.tbr-badge{padding:7px 9px;border-radius:10px;background:rgba(110,210,150,.09);border:1px solid rgba(110,210,150,.2);font-size:8px;font-weight:900;text-align:center}.tbr-badge b{display:block;font-size:13px}.tbr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:9px}.tbr-card{padding:7px 4px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);text-align:center}.tbr-card b{display:block;font-size:11px}.tbr-card small{font-size:7px;opacity:.48}.tbr-check{margin-top:8px;display:grid;gap:5px}.tbr-check div{display:flex;align-items:center;justify-content:space-between;padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.028);font-size:8px}.tbr-check .ok{color:#bfe8cb}.tbr-check .warn{color:#f0c88b}.tbr-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.tbr-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 6px;font-size:8px;font-weight:900}.tbr-actions .go{background:rgba(110,210,150,.12);border-color:rgba(110,210,150,.25)}
@media(max-width:380px){.tbr-grid{grid-template-columns:repeat(2,1fr)}}`;
document.head.appendChild(st)}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tbr');if(!box){box=document.createElement('section');box.className='tbr';host.appendChild(box)}const s=S(),eq=equip(),ds=derived(),f=follower();const filled=eq.filter(Boolean).length;const inv=Array.isArray(s.inventoryItems)?s.inventoryItems:[];const stones=num(s.battleStones);const energy=num(s.energy);const atk=num(ds.attack||ds.atk||s.attack),def=num(ds.defense||ds.def||s.defense),hp=num(ds.maxHp||ds.hp||s.maxHp);const power=Math.max(0,Math.round(atk+def+hp/10+num(ds.agility||s.agility)));const checks=[['⚔️ Экипировка',filled>=7,'7/7 слотов'],['👥 Спутник',!!f,'активен'],['🧪 Эликсиры',Array.isArray(s.elixirs)?s.elixirs.some(Boolean):num(s.elixirs)>0,'готовы'],['💎 Камни боя',stones>0,stones>0?String(stones)+' шт.':'нет']];box.innerHTML=`<div class="tbr-head"><div><div class="tbr-kicker">ПЕРЕД БОЕМ</div><div class="tbr-title">Готовность героя</div></div><div class="tbr-badge"><b>⚡${power}</b>СИЛА</div></div><div class="tbr-grid"><div class="tbr-card"><b>${Math.round(atk)}</b><small>АТАКА</small></div><div class="tbr-card"><b>${Math.round(def)}</b><small>ЗАЩИТА</small></div><div class="tbr-card"><b>${Math.round(hp)}</b><small>ЗДОРОВЬЕ</small></div><div class="tbr-card"><b>${energy}</b><small>ЭНЕРГИЯ</small></div></div><div class="tbr-check">${checks.map(c=>`<div><span>${c[0]}</span><span class="${c[1]?'ok':'warn'}">${c[1]?'✓':'!' } ${esc(c[2])}</span></div>`).join('')}</div><div class="tbr-actions"><button class="go" data-tbr="battle">⚔️ В БОЙ</button><button data-tbr="home">🏠 К МИРУ</button></div>`;box.querySelector('[data-tbr="battle"]').onclick=()=>{if(window.TerritoryNavigation?.go)window.TerritoryNavigation.go('battle');else window.HomeRebuild?.startRunner?.()};box.querySelector('[data-tbr="home"]').onclick=()=>window.TerritoryNavigation?.go?.('home')}
function mount(){const tick=()=>setTimeout(render,140);window.addEventListener('territory:state-changed',tick);window.addEventListener('territory:inventory-equipped',tick);window.addEventListener('territory:follower-changed',tick);const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,1100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryBattleReady={render};
})();

/* TERRITORY PASS 43 — JOURNEY PROGRESS CENTER
 * UI-only progression overview. Reuses canonical PvE state; does not alter chapter/stage rules.
 */
(function(){
'use strict';
const NS='territory-journey-center';
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tjc{margin:10px 0;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(89,155,220,.05),rgba(255,255,255,.018));border:1px solid rgba(89,155,220,.16);color:#eef3f5}.tjc-head{display:flex;align-items:center;gap:9px}.tjc-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(89,155,220,.09);font-size:20px}.tjc-head b{display:block;font-size:11px;letter-spacing:.7px}.tjc-head small{display:block;margin-top:3px;font-size:8px;opacity:.48}.tjc-main{margin-top:9px;padding:10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}.tjc-line{display:flex;justify-content:space-between;gap:8px;font-size:9px}.tjc-line strong{font-size:11px}.tjc-bar{height:7px;margin-top:7px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.07)}.tjc-fill{height:100%;border-radius:99px;background:rgba(89,155,220,.72);transition:width .3s}.tjc-stages{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px}.tjc-stage{padding:7px 3px;text-align:center;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);font-size:7px}.tjc-stage b{display:block;font-size:11px}.tjc-stage.done{border-color:rgba(110,210,150,.28);background:rgba(110,210,150,.045)}.tjc-stage.now{border-color:rgba(89,155,220,.35);box-shadow:0 0 12px rgba(89,155,220,.07)}.tjc-boss{margin-top:7px;padding:8px;border-radius:10px;border:1px solid rgba(220,184,104,.16);background:rgba(220,184,104,.045);font-size:8px}.tjc-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.tjc-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 5px;font-size:8px;font-weight:900}.tjc-actions .primary{background:rgba(89,155,220,.12);border-color:rgba(89,155,220,.26)}.tjc-note{margin-top:7px;font-size:7px;opacity:.4}@media(max-width:380px){.tjc-stages{gap:3px}.tjc-stage{font-size:6px}}
`;document.head.appendChild(st)}
function pve(){const p=S().pve||{};return{chapter:Math.max(1,Number(p.chapter)||1),stage:Math.max(1,Number(p.stage)||1),progress:Math.max(0,Math.min(4,Number(p.progress)||0)),bossPending:!!p.bossPending,bossActive:!!p.bossActive,bossDefeated:!!p.bossDefeated}}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tjc');if(!box){box=document.createElement('section');box.className='tjc';host.appendChild(box)}const p=pve(),pct=Math.round(p.progress/4*100),stage=Math.min(4,p.stage);let title=p.bossActive?'БОСС В БОЮ':p.bossPending?'БОСС ОТКРЫТ':'ПУТЬ БОЯ';let sub=p.bossActive?'Заверши бой с боссом':p.bossPending?'Глава полностью пройдена':'Четыре победы открывают босса';box.innerHTML=`<div class="tjc-head"><div class="tjc-icon">🗺️</div><div><b>${title}</b><small>Глава ${p.chapter} · ${sub}</small></div></div><div class="tjc-main"><div class="tjc-line"><span>Прогресс главы</span><strong>${p.progress}/4 · ${pct}%</strong></div><div class="tjc-bar"><div class="tjc-fill" style="width:${pct}%"></div></div><div class="tjc-stages">${[1,2,3,4].map(i=>`<div class="tjc-stage ${i<=p.progress?'done':''} ${i===stage&&p.progress<4?'now':''}"><b>${i<=p.progress?'✓':i}</b>${i<=p.progress?'ПОБЕДА':i===stage?'СЕЙЧАС':'ЭТАП'}</div>`).join('')}</div></div>${p.bossPending?'<div class="tjc-boss">👑 <b>Босс доступен.</b> Пора завершить главу.</div>':''}${p.bossDefeated?'<div class="tjc-boss">🏆 Босс главы побеждён. Путь продолжается.</div>':''}<div class="tjc-actions"><button class="primary" data-tjc="battle">⚔️ ПРОДОЛЖИТЬ</button><button data-tjc="map">🗺️ ОТКРЫТЬ ПУТЬ</button></div><div class="tjc-note">Этот блок только показывает состояние существующей PvE-прогрессии.</div>`;box.querySelector('[data-tjc="battle"]').onclick=()=>{if(p.bossPending)window.PvEFlow?.openBoss?.();else window.PvEFlow?.startRunner?.()};box.querySelector('[data-tjc="map"]').onclick=()=>window.TerritoryNavigation?.go?.('map')}
function mount(){const tick=()=>setTimeout(render,100);['territory:state-changed','territory:pve-changed','territory:battle-result'].forEach(e=>window.addEventListener(e,tick));const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryJourneyCenter={render};
})();

/* TERRITORY PASS 44 — SMART UPGRADE ROUTE
 * UI-only advisor. Reads canonical equipment/inventory/PvE state and turns it into a short actionable route.
 * No combat, economy, or progression rules are changed.
 */
(function(){
'use strict';
const NS='territory-upgrade-route';
const S=()=>window.TerritoryStore?.state||{};
const types=['weapon','helmet','armor','belt','boots','ring','amulet'];
const labels=['Оружие','Шлем','Доспех','Пояс','Сапоги','Кольцо','Амулет'];
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function num(it,keys){if(!it)return 0;for(const k of keys){const n=Number(it[k]);if(Number.isFinite(n))return n}return 0}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function power(it){return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+(rarityRank[rarity(it)]||1)*8)}
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tur{margin:10px 0;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(220,184,104,.055),rgba(255,255,255,.018));border:1px solid rgba(220,184,104,.17);color:#eef3f5}.tur-head{display:flex;align-items:center;gap:9px}.tur-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(220,184,104,.09);font-size:20px}.tur-head b{display:block;font-size:11px;letter-spacing:.8px}.tur-head small{display:block;margin-top:3px;font-size:8px;opacity:.48}.tur-score{margin-left:auto;padding:7px 9px;border-radius:10px;background:rgba(220,184,104,.07);border:1px solid rgba(220,184,104,.15);font-size:8px;text-align:center}.tur-score b{display:block;font-size:14px}.tur-list{display:grid;gap:5px;margin-top:9px}.tur-step{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.055)}.tur-step .num{width:23px;height:23px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.05);font-size:11px;font-weight:900}.tur-step b{display:block;font-size:9px}.tur-step small{display:block;margin-top:2px;font-size:7px;opacity:.48}.tur-step button{margin-left:auto;border:1px solid rgba(220,184,104,.2);background:rgba(220,184,104,.07);color:inherit;border-radius:8px;padding:6px 7px;font-size:7px;font-weight:900}.tur-step.done{opacity:.55}.tur-step.done .num{background:rgba(110,210,150,.1)}.tur-empty{padding:12px;text-align:center;font-size:9px;opacity:.5}.tur-foot{margin-top:7px;font-size:7px;opacity:.38;text-align:center}
`;document.head.appendChild(st)}
function route(){const s=S(),inv=Array.isArray(s.inventoryItems)?s.inventoryItems:[],eq=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);const upgrades=[];types.forEach((type,i)=>{const cur=eq[i],cp=power(cur);const best=inv.map((item,index)=>({item,index,p:power(item)})).filter(x=>(x.item?.type||x.item?.slot)===type&&x.p>cp).sort((a,b)=>b.p-a.p)[0];if(best)upgrades.push({i,...best,delta:best.p-cp})});const p=s.pve||{};const progress=Math.max(0,Math.min(4,Number(p.progress)||0));const setMap={};eq.forEach(it=>{const set=it?.setId||it?.set||it?.setID;if(set)setMap[set]=(setMap[set]||0)+1});inv.forEach(it=>{const set=it?.setId||it?.set||it?.setID;if(set&&!setMap[set])setMap[set]=0});const setBest=Object.entries(setMap).sort((a,b)=>b[1]-a[1])[0];const steps=[];if(upgrades[0])steps.push({kind:'equip',title:`Надеть ${upgrades[0].item?.name||labels[upgrades[0].i]}`,sub:`${labels[upgrades[0].i]} · +${upgrades[0].delta} силы`,action:'item',data:upgrades[0].index});if(setBest&&setBest[1]>0&&setBest[1]<4)steps.push({kind:'set',title:`Продолжить сет ${setBest[0]}`,sub:`Собрано ${setBest[1]} предмет${setBest[1]===1?'':'а'} · ищем недостающие`,action:'inventory'});if(progress<4)steps.push({kind:'battle',title:`Закрыть главу ${Number(p.chapter)||1}`,sub:`Прогресс ${progress}/4 · следующий шаг — бой`,action:'battle'});else if(p.bossPending)steps.push({kind:'boss',title:'Забрать главу через босса',sub:'Все 4 этапа пройдены · босс открыт',action:'boss'});else steps.push({kind:'map',title:'Посмотреть следующий путь',sub:`Глава ${Number(p.chapter)||1} завершена`,action:'map'});return {steps:steps.slice(0,3),score:upgrades.length+((setBest&&setBest[1])||0)+(progress/4)} }
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tur');if(!box){box=document.createElement('section');box.className='tur';host.appendChild(box)}const r=route();box.innerHTML=`<div class="tur-head"><div class="tur-icon">⚡</div><div><b>СЛЕДУЮЩИЕ ШАГИ</b><small>Короткий маршрут развития героя</small></div><div class="tur-score"><b>${Math.round(r.score*10)}</b>ПРОГРЕСС</div></div><div class="tur-list">${r.steps.length?r.steps.map((x,i)=>`<div class="tur-step"><span class="num">${i+1}</span><div><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div><button data-tur-action="${x.action}" ${x.data!=null?`data-tur-index="${x.data}"`:''}>ОТКРЫТЬ</button></div>`).join(''):'<div class="tur-empty">Герой уже собран. Продолжай путь.</div>'}</div><div class="tur-foot">Подсказки используют только текущие предметы, сеты и PvE-состояние.</div>`;box.querySelectorAll('[data-tur-action]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.turAction;if(a==='item'){const it=(S().inventoryItems||[])[Number(btn.dataset.turIndex)];if(it&&window.TerritoryInventoryCompare?.open)window.TerritoryInventoryCompare.open(it)}else if(a==='inventory')window.TerritoryNavigation?.go?.('inventory');else if(a==='battle')window.PvEFlow?.startRunner?.();else if(a==='boss')window.PvEFlow?.openBoss?.();else if(a==='map')window.TerritoryNavigation?.go?.('map')})}
function mount(){const tick=()=>setTimeout(render,160);['territory:state-changed','territory:inventory-equipped','territory:follower-changed'].forEach(e=>window.addEventListener(e,tick));const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryUpgradeRoute={render,route};
})();

/* TERRITORY PASS 45 — LOOT MANAGEMENT CENTER
 * UI-only loot overview. Reads canonical inventory/equipment and routes into existing inventory/compare flows.
 */
(function(){
'use strict';
const NS='territory-loot-center';
const S=()=>window.TerritoryStore?.state||{};
const types=['weapon','helmet','armor','belt','boots','ring','amulet'];
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function num(it,ks){for(const k of ks){const n=Number(it?.[k]);if(Number.isFinite(n))return n}return 0}
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function power(it){if(!it)return 0;return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+(rarityRank[rarity(it)]||1)*8)}
function typeOf(it){return String(it?.type||it?.slot||'').toLowerCase()}
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tlc{margin:10px 0;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(89,155,220,.055),rgba(255,255,255,.018));border:1px solid rgba(89,155,220,.17);color:#eef3f5}.tlc-head{display:flex;align-items:center;gap:9px}.tlc-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(89,155,220,.09);font-size:20px}.tlc-head b{display:block;font-size:11px;letter-spacing:.7px}.tlc-head small{display:block;margin-top:3px;font-size:8px;opacity:.48}.tlc-count{margin-left:auto;text-align:center;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.04);font-size:7px;opacity:.75}.tlc-count b{display:block;font-size:13px;opacity:1}.tlc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:9px}.tlc-pill{padding:7px 3px;text-align:center;border-radius:9px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.05)}.tlc-pill b{display:block;font-size:11px}.tlc-pill small{display:block;margin-top:2px;font-size:6px;opacity:.45}.tlc-pill.epic{border-color:rgba(170,100,255,.25)}.tlc-pill.legendary{border-color:rgba(255,190,70,.3)}.tlc-up{margin-top:7px;padding:8px;border-radius:10px;background:rgba(110,210,150,.045);border:1px solid rgba(110,210,150,.16);font-size:8px}.tlc-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.tlc-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 5px;font-size:8px;font-weight:900}.tlc-actions .primary{border-color:rgba(89,155,220,.25);background:rgba(89,155,220,.09)}.tlc-note{margin-top:7px;text-align:center;font-size:7px;opacity:.38}@media(max-width:380px){.tlc-grid{grid-template-columns:repeat(2,1fr)}}`;
document.head.appendChild(st)}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tlc');if(!box){box=document.createElement('section');box.className='tlc';host.appendChild(box)}const inv=Array.isArray(S().inventoryItems)?S().inventoryItems:[],eq=Array.isArray(S().equipment)?S().equipment:Array(7).fill(null);const counts={common:0,uncommon:0,rare:0,epic:0,legendary:0};inv.forEach(x=>counts[rarity(x)]++);let upgrades=0;inv.forEach(it=>{const i=types.indexOf(typeOf(it));if(i>=0&&power(it)>power(eq[i]))upgrades++});const best=inv.map((item,index)=>({item,index,p:power(item)})).filter(x=>{const i=types.indexOf(typeOf(x.item));return i>=0&&x.p>power(eq[i])}).sort((a,b)=>b.p-a.p)[0];box.innerHTML=`<div class="tlc-head"><div class="tlc-icon">🎒</div><div><b>ЛУТ И СНАРЯЖЕНИЕ</b><small>Короткий обзор того, что лежит в запасе</small></div><div class="tlc-count"><b>${inv.length}</b>ПРЕДМЕТОВ</div></div><div class="tlc-grid"><div class="tlc-pill"><b>${counts.common}</b><small>ОБЫЧНЫЕ</small></div><div class="tlc-pill"><b>${counts.uncommon}</b><small>НЕОБЫЧНЫЕ</small></div><div class="tlc-pill"><b>${counts.rare}</b><small>РЕДКИЕ</small></div><div class="tlc-pill epic"><b>${counts.epic}</b><small>ЭПИЧЕСКИЕ</small></div><div class="tlc-pill legendary"><b>${counts.legendary}</b><small>ЛЕГЕНДАРНЫЕ</small></div><div class="tlc-pill"><b>${upgrades}</b><small>АПГРЕЙДОВ</small></div></div>${best?`<div class="tlc-up">⚡ <b>Лучший найденный апгрейд:</b> ${esc(best.item?.name||'Предмет')} · +${Math.max(0,best.p-power(eq[types.indexOf(typeOf(best.item))]))} силы</div>`:'<div class="tlc-up">✅ Сейчас в инвентаре нет найденного предмета сильнее текущего.</div>'}<div class="tlc-actions"><button class="primary" data-tlc="inventory">🎒 ОТКРЫТЬ ИНВЕНТАРЬ</button><button data-tlc="compare" ${best?'':'disabled'}>⚡ ПОКАЗАТЬ АПГРЕЙД</button></div><div class="tlc-note">Обзор ничего не меняет в инвентаре и использует существующую систему предметов.</div>`;box.querySelector('[data-tlc="inventory"]').onclick=()=>window.TerritoryNavigation?.go?.('inventory');const cb=box.querySelector('[data-tlc="compare"]');if(cb&&best)cb.onclick=()=>window.TerritoryInventoryCompare?.open?.(best.item)}
function mount(){const tick=()=>setTimeout(render,150);['territory:state-changed','territory:inventory-equipped'].forEach(e=>window.addEventListener(e,tick));const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,1700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryLootCenter={render};
})();

/* TERRITORY PASS 46 — FORGE ADVISOR CENTER
 * UI-only forge planning. Does not salvage, upgrade, spend currency, or change item data automatically.
 */
(function(){
'use strict';
const NS='territory-forge-advisor';
const S=()=>window.TerritoryStore?.state||{};
const types=['weapon','helmet','armor','belt','boots','ring','amulet'];
const rarityRank={common:1,uncommon:2,rare:3,epic:4,legendary:5};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function rarity(it){const r=String(it?.rarity||it?.quality||'common').toLowerCase();if(/legend/.test(r))return'legendary';if(/epic|эпич/.test(r))return'epic';if(/rare|редк/.test(r))return'rare';if(/uncommon|необыч/.test(r))return'uncommon';return'common'}
function num(it,ks){for(const k of ks){const n=Number(it?.[k]);if(Number.isFinite(n))return n}return 0}
function power(it){if(!it)return 0;return Math.round(num(it,['attack','strength','damage','atk'])+num(it,['defense','def','armor','guard'])+num(it,['agility','agi','speed'])+num(it,['maxHp','hp','health'])/3+num(it,['critChance'])*3+num(it,['damageReduction'])*3+num(it,['bonusXp'])*2+Number(it?.level||1)*1.5+(rarityRank[rarity(it)]||1)*8)}
function typeOf(it){return String(it?.type||it?.slot||'').toLowerCase()}
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tfa{margin:10px 0;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(185,120,55,.055),rgba(255,255,255,.018));border:1px solid rgba(220,184,104,.17);color:#eef3f5}.tfa-head{display:flex;align-items:center;gap:9px}.tfa-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(220,184,104,.09);font-size:20px}.tfa-head b{display:block;font-size:11px;letter-spacing:.7px}.tfa-head small{display:block;margin-top:3px;font-size:8px;opacity:.48}.tfa-count{margin-left:auto;text-align:center;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.04);font-size:7px;opacity:.7}.tfa-count b{display:block;font-size:13px;opacity:1}.tfa-main{margin-top:8px;padding:9px;border-radius:11px;background:rgba(220,184,104,.045);border:1px solid rgba(220,184,104,.11);font-size:8px}.tfa-main b{font-size:10px}.tfa-main small{display:block;margin-top:3px;font-size:7px;opacity:.48}.tfa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px}.tfa-pill{padding:7px 3px;text-align:center;border-radius:9px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.05)}.tfa-pill b{display:block;font-size:11px}.tfa-pill small{display:block;margin-top:2px;font-size:6px;opacity:.45}.tfa-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.tfa-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 5px;font-size:8px;font-weight:900}.tfa-actions .primary{border-color:rgba(220,184,104,.28);background:rgba(220,184,104,.09)}.tfa-note{margin-top:7px;text-align:center;font-size:7px;opacity:.38}@media(max-width:380px){.tfa-grid{grid-template-columns:repeat(2,1fr)}}`;
document.head.appendChild(st)}
function analyze(){const s=S(),inv=Array.isArray(s.inventoryItems)?s.inventoryItems:[],eq=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);const byKey={};inv.forEach((it,index)=>{const key=String(it?.id??it?.itemId??it?.name??index);(byKey[key]??=[]).push({it,index})});let duplicates=0;Object.values(byKey).forEach(a=>{if(a.length>1)duplicates+=a.length-1});let low=inv.filter(it=>rarity(it)==='common').length;let upgrades=0;inv.forEach(it=>{const i=types.indexOf(typeOf(it));if(i>=0&&power(it)>power(eq[i]))upgrades++});const best=inv.map((it,index)=>({it,index,p:power(it)})).filter(x=>{const i=types.indexOf(typeOf(x.it));return i>=0&&x.p>power(eq[i])}).sort((a,b)=>b.p-a.p)[0];const forgeCandidates=inv.map((it,index)=>({it,index,p:power(it)})).filter(x=>rarity(x.it)==='common').sort((a,b)=>a.p-b.p).slice(0,3);return {inv,duplicates,low,upgrades,best,forgeCandidates}}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tfa');if(!box){box=document.createElement('section');box.className='tfa';host.appendChild(box)}const a=analyze();const candidate=a.forgeCandidates[0];box.innerHTML=`<div class="tfa-head"><div class="tfa-icon">🔨</div><div><b>КУЗНИЦА — СЛЕДУЮЩИЙ ШАГ</b><small>Советник показывает, что имеет смысл проверить</small></div><div class="tfa-count"><b>${a.upgrades}</b>АПГРЕЙДОВ</div></div>${a.best?`<div class="tfa-main">⚡ <b>Сначала проверь: ${esc(a.best.it?.name||'предмет')}</b><small>Лучший найденный апгрейд · +${Math.max(0,a.best.p-power((S().equipment||[])[types.indexOf(typeOf(a.best.it))]))} силы</small></div>`:`<div class="tfa-main">✅ <b>Нового апгрейда не найдено</b><small>Можно проверить ковку, улучшение или разбор в существующей кузнице.</small></div>`}<div class="tfa-grid"><div class="tfa-pill"><b>${a.duplicates}</b><small>ДУБЛИКАТОВ</small></div><div class="tfa-pill"><b>${a.low}</b><small>ОБЫЧНЫХ</small></div><div class="tfa-pill"><b>${a.inv.length}</b><small>ПРЕДМЕТОВ</small></div></div><div class="tfa-actions"><button class="primary" data-tfa="forge">🔨 ОТКРЫТЬ КУЗНИЦУ</button><button data-tfa="inventory">🎒 ПРОВЕРИТЬ ЛУТ</button></div><div class="tfa-note">Ничего автоматически не продаётся, не разбирается и не улучшает. Решение остаётся за игроком.</div>`;box.querySelector('[data-tfa="forge"]').onclick=()=>window.TerritoryNavigation?.go?.('forge');box.querySelector('[data-tfa="inventory"]').onclick=()=>window.TerritoryNavigation?.go?.('inventory')}
function mount(){const tick=()=>setTimeout(render,180);['territory:state-changed','territory:inventory-equipped'].forEach(e=>window.addEventListener(e,tick));const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,1900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryForgeAdvisor={render,analyze};
})();

/* TERRITORY PASS 47 — ELIXIR LOADOUT CENTER
 * UI-only loadout overview. Reads existing elixir state; never grants, consumes, or changes elixirs automatically.
 */
(function(){
'use strict';
const NS='territory-elixir-loadout';
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function list(){const s=S(),raw=s.elixirs;let arr=[];
 if(Array.isArray(raw)) arr=raw.map((x,i)=>({x,i}));
 else if(raw&&typeof raw==='object') arr=Object.entries(raw).map(([k,x],i)=>({x,i,key:k}));
 else if(Number(raw)>0) arr=[{x:Number(raw),i:0}];
 return arr.filter(a=>a.x!=null&&a.x!==false&&a.x!=='');
}
function label(a){const x=a.x;if(typeof x==='string')return x;if(typeof x==='number')return `Эликсир ×${x}`;return x?.name||x?.title||x?.label||a.key||`Эликсир ${a.i+1}`}
function qty(a){const x=a.x;if(typeof x==='number')return x;return Number(x?.count??x?.qty??x?.amount??x?.quantity??1)||1}
function style(){if(document.getElementById(NS+'-style'))return;const st=document.createElement('style');st.id=NS+'-style';st.textContent=`
#hero .tel{margin:10px 0;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(90,190,170,.055),rgba(255,255,255,.018));border:1px solid rgba(90,190,170,.17);color:#eef3f5}.tel-head{display:flex;align-items:center;gap:9px}.tel-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:rgba(90,190,170,.09);font-size:20px}.tel-head b{display:block;font-size:11px;letter-spacing:.8px}.tel-head small{display:block;margin-top:3px;font-size:8px;opacity:.48}.tel-count{margin-left:auto;text-align:center;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.04);font-size:7px;opacity:.7}.tel-count b{display:block;font-size:13px;opacity:1}.tel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:9px}.tel-item{min-height:42px;padding:8px;border-radius:10px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.055)}.tel-item b{display:block;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tel-item small{display:block;margin-top:3px;font-size:7px;opacity:.48}.tel-ready{margin-top:8px;padding:9px;border-radius:10px;background:rgba(90,190,170,.045);border:1px solid rgba(90,190,170,.13);font-size:8px}.tel-ready strong{font-size:10px}.tel-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.tel-actions button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:inherit;border-radius:10px;padding:9px 5px;font-size:8px;font-weight:900}.tel-actions .primary{border-color:rgba(90,190,170,.27);background:rgba(90,190,170,.09)}.tel-note{margin-top:7px;text-align:center;font-size:7px;opacity:.38}@media(max-width:380px){.tel-grid{gap:4px}.tel-item{padding:7px}}
`;document.head.appendChild(st)}
function render(){const host=document.getElementById('hero');if(!host)return;style();let box=host.querySelector('.tel');if(!box){box=document.createElement('section');box.className='tel';host.appendChild(box)}const a=list(),total=a.reduce((n,v)=>n+qty(v),0),slots=a.length;const names=a.slice(0,6).map(v=>`<div class="tel-item"><b>🧪 ${esc(label(v))}</b><small>В наличии: ${qty(v)}</small></div>`).join('');box.innerHTML=`<div class="tel-head"><div class="tel-icon">🧪</div><div><b>ЭЛИКСИРЫ — БОЕВОЙ НАБОР</b><small>Быстрый контроль расходников перед боем</small></div><div class="tel-count"><b>${total}</b>ШТ.</div></div>${slots?`<div class="tel-grid">${names}</div>`:`<div class="tel-ready">🧪 <strong>Набор пока пуст.</strong><br>Эликсиры можно открыть через существующий магазин.</div>`}<div class="tel-ready">${slots?`⚡ <strong>${slots} вида${slots===1?'':'ов'} готовы к использованию.</strong> Перед боем проверь набор и не трать расходники зря.`:'💡 Собери первый набор — это отдельная механика Territory.'}</div><div class="tel-actions"><button class="primary" data-tel="shop">🧪 ОТКРЫТЬ ЭЛИКСИРЫ</button><button data-tel="battle">⚔️ В БОЙ</button></div><div class="tel-note">Блок только показывает существующее состояние. Ничего не покупает, не выдаёт и не расходует автоматически.</div>`;box.querySelector('[data-tel="shop"]').onclick=()=>window.TerritoryNavigation?.go?.('shop');box.querySelector('[data-tel="battle"]').onclick=()=>{if(window.TerritoryNavigation?.go)window.TerritoryNavigation.go('battle');else window.HomeRebuild?.startRunner?.()}}
function mount(){const tick=()=>setTimeout(render,220);['territory:state-changed','territory:inventory-equipped'].forEach(e=>window.addEventListener(e,tick));const obs=new MutationObserver(()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(render,2100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.TerritoryElixirLoadout={render,list};
})();
