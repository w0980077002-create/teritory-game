/* TERITORY COMBAT ITEMS v1 — shared weapon/consumable foundation
   Does not modify HOME artwork or frozen navigation 42–48.
   Uses TerritoryStore as the single player state source.
*/
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const CATALOG={
  hp:{id:'elixir_hp',name:'Зелье HP',icon:'🧪',kind:'consumable',description:'Восстанавливает здоровье героя.',effect:'+30 HP',max:5},
  energy:{id:'elixir_energy',name:'Зелье энергии',icon:'🔵',kind:'consumable',description:'Восстанавливает энергию героя.',effect:'+25 энергии',max:5},
  guard:{id:'elixir_guard',name:'Защитный эликсир',icon:'🛡️',kind:'consumable',description:'Подготавливает защиту героя к следующему бою.',effect:'+5 защиты на следующий бой',max:5},
  attack:{id:'elixir_attack',name:'Боевой эликсир',icon:'🔥',kind:'consumable',description:'Подготавливает дополнительный урон к следующему бою.',effect:'+5 урона на следующий бой',max:5}
};
const store=()=>window.TerritoryStore?.state||{};
const save=reason=>{try{window.TerritoryStore?.saveNow?.(reason||'combat-items')}catch(_){} };
function normalize(){
  const s=store();
  s.consumables=Array.isArray(s.consumables)?s.consumables:[];
  const clean=[];
  for(const x of s.consumables){
    if(!x||typeof x!=='object')continue;
    const id=String(x.id||''); if(!CATALOG[id])continue;
    const q=Math.max(0,Math.floor(Number(x.quantity??x.count??0)));
    if(q>0){const old=clean.find(y=>y.id===id);if(old)old.quantity+=q;else clean.push({id,quantity:Math.min(CATALOG[id].max,q)});}
  }
  s.consumables=clean;
  return s;
}
function quantity(id){const s=normalize(),x=s.consumables.find(v=>v.id===id);return x?x.quantity:0;}
function setQuantity(id,q){const s=normalize();let x=s.consumables.find(v=>v.id===id);q=Math.max(0,Math.min(CATALOG[id]?.max||99,Math.floor(Number(q)||0)));if(!x&&q>0){x={id,quantity:q};s.consumables.push(x)}else if(x){x.quantity=q;if(q<=0)s.consumables=s.consumables.filter(v=>v!==x)}save('combat-items');return q;}
function add(id,count=1){if(!CATALOG[id])return false;setQuantity(id,quantity(id)+Math.max(0,Math.floor(Number(count)||0)));return true;}
function use(id){
  if(!CATALOG[id]||quantity(id)<=0)return {ok:false,reason:'empty'};
  const s=store();
  if(id==='elixir_hp'){const max=Math.max(1,Number(s.maxHp)||120),before=Math.max(0,Number(s.hp)||0);s.hp=Math.min(max,before+30);if(s.hp===before)return {ok:false,reason:'full'};}
  else if(id==='elixir_energy'){const max=Math.max(1,Number(s.maxEnergy)||200),before=Math.max(0,Number(s.energy)||0);s.energy=Math.min(max,before+25);if(s.energy===before)return {ok:false,reason:'full'};}
  else if(id==='elixir_guard'){s.combatBuffs={...(s.combatBuffs||{}),defense:Number(s.combatBuffs?.defense||0)+5};}
  else if(id==='elixir_attack'){s.combatBuffs={...(s.combatBuffs||{}),attack:Number(s.combatBuffs?.attack||0)+5};}
  setQuantity(id,quantity(id)-1);save('combat-item-use');
  try{window.dispatchEvent(new CustomEvent('territory:itemsChanged',{detail:{id}}))}catch(_){}
  return {ok:true};
}
function ensureModal(){
  if($('#combatItemModal'))return;
  const m=document.createElement('div');m.id='combatItemModal';m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="ci-card"><button class="ci-close" id="ciClose">×</button><div id="ciBody"></div></div>';
  document.body.appendChild(m);
  $('#ciClose').onclick=closeModal;m.addEventListener('click',e=>{if(e.target===m)closeModal()});
}
function closeModal(){const m=$('#combatItemModal');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}}
function openItem(id){
  const c=CATALOG[id];if(!c)return;ensureModal();const q=quantity(id),m=$('#combatItemModal'),body=$('#ciBody');
  body.innerHTML=`<div class="ci-icon">${c.icon}</div><div class="ci-kicker">ПРЕДМЕТ</div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><div class="ci-effect">${esc(c.effect)}</div><div class="ci-count">Количество: <b>${q}</b> / ${c.max}</div><button class="ci-use" id="ciUse" ${q<=0?'disabled':''}>ИСПОЛЬЗОВАТЬ</button>`;
  $('#ciUse').onclick=()=>{const r=use(id);if(r.ok){openItem(id);render()}else if(r.reason==='full'){window.arenaToast?.('❤️ Уже максимум');}};
  m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function render(){
  const grid=$('#inventoryGrid');if(!grid)return;
  normalize();
  const items=store().consumables;
  const cards=items.map(x=>{const c=CATALOG[x.id];return `<button type="button" class="ci-item" data-ci="${esc(x.id)}"><span class="ci-item-icon">${c.icon}</span><b>${esc(c.name)}</b><small>×${x.quantity}</small></button>`}).join('');
  const empty=cards?'': '<div class="ci-empty">Расходуемых предметов пока нет.</div>';
  grid.insertAdjacentHTML('beforeend',cards+empty);
  grid.querySelectorAll('[data-ci]').forEach(b=>b.onclick=()=>openItem(b.dataset.ci));
}
function installCSS(){if($('#combatItemsCSS'))return;const s=document.createElement('style');s.id='combatItemsCSS';s.textContent=`
#combatItemModal{position:fixed;inset:0;z-index:10000;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.58);padding:12px;box-sizing:border-box}#combatItemModal.show{display:flex}.ci-card{width:min(100%,430px);max-height:82vh;overflow:auto;background:linear-gradient(145deg,#182633,#0f1821);border:1px solid #536575;border-radius:20px;padding:20px;color:#fff;box-sizing:border-box;box-shadow:0 14px 40px rgba(0,0,0,.45);position:relative}.ci-close{position:absolute;right:12px;top:10px;width:38px;height:38px;border:1px solid #5b6b79;border-radius:12px;background:#101b25;color:#fff;font-size:25px}.ci-icon{text-align:center;font-size:58px;margin:8px 0}.ci-kicker{font-size:10px;letter-spacing:2px;color:#9eacba}.ci-card h3{margin:5px 0 8px;font-size:22px}.ci-card p{color:#c0cbd4;line-height:1.45}.ci-effect,.ci-count{padding:11px 12px;margin-top:8px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}.ci-use{width:100%;margin-top:12px;min-height:48px;border:0;border-radius:13px;background:#c89b45;color:#10151a;font-weight:900}.ci-use:disabled{opacity:.45}.ci-item{position:relative;display:flex;align-items:center;gap:9px;width:100%;min-height:54px;margin:5px 0;padding:8px 10px;border:1px solid #40515f;border-radius:13px;background:#17242f;color:#fff;text-align:left}.ci-item-icon{font-size:28px}.ci-item b{flex:1}.ci-item small{color:#c6d0d8;font-weight:800}.ci-empty{padding:12px;color:#9eacba;font-size:12px;border:1px dashed #40515f;border-radius:12px;margin-top:6px}
`;document.head.appendChild(s)}
function boot(){installCSS();normalize();const grid=$('#inventoryGrid');if(!grid)return;grid.addEventListener('click',e=>{const b=e.target.closest('[data-ci]');if(b){e.preventDefault();e.stopPropagation();openItem(b.dataset.ci)}},true);const old=window.render;window.render=function(){if(typeof old==='function')old();setTimeout(render,0)};setTimeout(render,0);window.CombatItems={catalog:CATALOG,add,use,quantity,setQuantity,render,open:openItem};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
