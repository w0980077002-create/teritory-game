/* Territory Game — shared combat consumables. Single source: TerritoryStore.state */
(function(){
'use strict';
const CATALOG={
elixir_hp:{id:'elixir_hp',name:'Зелье HP',icon:'🧪',price:80,max:10,effect:'+30 ОЗ',type:'hp',value:30},
elixir_energy:{id:'elixir_energy',name:'Зелье энергии',icon:'🔵',price:70,max:10,effect:'+25 энергии',type:'energy',value:25},
elixir_attack:{id:'elixir_attack',name:'Боевой эликсир',icon:'🔥',price:120,max:10,effect:'+5 атаки на бой',type:'attack',value:5},
elixir_guard:{id:'elixir_guard',name:'Защитный эликсир',icon:'🛡️',price:120,max:10,effect:'+5 защиты на бой',type:'guard',value:5},
adrenaline:{id:'adrenaline',name:'Эликсир адреналин',icon:'⚡',price:300,max:5,effect:'Оживляет союзника в 3×3/хаос',type:'adrenaline',value:1},
speed_scroll:{id:'speed_scroll',name:'Свиток ускорения',icon:'📜',price:180,max:10,effect:'−10 сек. ожидания',type:'speed',value:10},
anti_speed_scroll:{id:'anti_speed_scroll',name:'Свиток антиускорения',icon:'🐌',price:180,max:10,effect:'+10 сек., максимум 60 сек.',type:'anti_speed',value:10}
};
const S=()=>window.TerritoryStore?.state;
const save=()=>window.TerritoryStore?.saveNow?.('combat-items');
function qty(id){const s=S();return Math.max(0,Number(s?.consumables?.[id]||0));}
function add(id,count=1){const s=S(),d=CATALOG[id];if(!s||!d)return false;s.consumables=s.consumables&&typeof s.consumables==='object'?s.consumables:{};s.consumables[id]=Math.min(d.max,qty(id)+Math.max(0,Number(count)||0));save();render();return true;}
function remove(id,count=1){const s=S();if(!s||qty(id)<count)return false;s.consumables[id]=qty(id)-count;save();render();return true;}
function use(id){const s=S(),d=CATALOG[id];if(!s||!d||qty(id)<=0)return false;if(d.type==='hp')s.hp=Math.min(s.maxHp,s.hp+d.value);if(d.type==='energy')s.energy=Math.min(s.maxEnergy,s.energy+d.value);if(d.type==='guard'){s.combatBuffs=Object.assign({attack:0,defense:0},s.combatBuffs||{});s.combatBuffs.defense+=d.value;}if(d.type==='attack'){s.combatBuffs=Object.assign({attack:0,defense:0},s.combatBuffs||{});s.combatBuffs.attack+=d.value;}s.consumables[id]=qty(id)-1;save();render();return true;}
function card(d,where){const q=qty(d.id);return `<article class="item-card consumable-card"><div class="item-icon">${d.icon}</div><div class="item-copy"><b>${d.name}</b><span>${d.effect}</span><small>В запасе ×${q}</small></div>${where==='shop'?`<button class="small-btn" data-buy-consumable="${d.id}">${d.price} 🪙</button>`:`<button class="small-btn" data-use-consumable="${d.id}" ${q?'':'disabled'}>${q?'ИСПОЛЬЗОВАТЬ':'ПУСТО'}</button>`}</article>`;}
function render(){const shop=document.getElementById('shopGrid');if(shop){let old=shop.querySelector('[data-consumables]');if(old)old.remove();const wrap=document.createElement('div');wrap.dataset.consumables='1';wrap.className='shop-section';wrap.innerHTML=`<div class="section-caption"><b>ЭЛИКСИРЫ И РАСХОДНИКИ</b><small>Общие для RPG и боёв</small></div>${Object.values(CATALOG).map(d=>card(d,'shop')).join('')}`;shop.appendChild(wrap);}const inv=document.getElementById('inventoryGrid');if(inv){let old=inv.querySelector('[data-inventory-consumables]');if(old)old.remove();const wrap=document.createElement('div');wrap.dataset.inventoryConsumables='1';wrap.className='inventory-section';wrap.innerHTML=`<div class="section-caption"><b>РАСХОДНИКИ</b><small>Количество сохраняется в общем состоянии</small></div>${Object.values(CATALOG).map(d=>card(d,'inventory')).join('')}`;inv.appendChild(wrap);}}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-buy-consumable]');if(b){const id=b.dataset.buyConsumable,d=CATALOG[id],s=S();if(!d||!s)return;if(s.coins<d.price||qty(id)>=d.max)return;s.coins-=d.price;add(id,1);const log=document.getElementById('merchantLog');if(log)log.textContent=`Куплено: ${d.name} ×1`;}const u=e.target.closest?.('[data-use-consumable]');if(u){if(use(u.dataset.useConsumable)){u.closest('.consumable-card')?.classList.add('used');}}});
window.CombatItems={CATALOG,add,remove,use,qty,render};
document.addEventListener('DOMContentLoaded',render);document.addEventListener('territory:render',render);
})();