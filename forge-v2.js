/* Territory Game — unified forge. */
(function(){
'use strict';
const WEAPONS=[
{name:'Кулаки',icon:'✊',damage:0,cost:0},{name:'Боевой топор',icon:'🪓',damage:12,cost:300},{name:'Стальной меч',icon:'⚔️',damage:18,cost:650},{name:'Молот',icon:'🔨',damage:25,cost:1000},{name:'Арбалет',icon:'🏹',damage:31,cost:1500}];
const S=()=>window.TerritoryStore?.state;const save=()=>window.TerritoryStore?.saveNow?.('forge');
function owned(){const s=S();s.ownedWeapons=Array.isArray(s.ownedWeapons)?[...new Set(s.ownedWeapons.map(String))]:['Кулаки'];if(!s.ownedWeapons.includes('Кулаки'))s.ownedWeapons.unshift('Кулаки');return s.ownedWeapons;}
function equip(name){const s=S(),w=WEAPONS.find(x=>x.name===name);if(!s||!w||!owned().includes(name))return false;s.weapon=w.name;s.bonusDamage=w.damage;s.equipment=Array.isArray(s.equipment)?s.equipment.filter(x=>x?.slot!=='weapon'):[];s.equipment.push({slot:'weapon',name:w.name,icon:w.icon,damage:w.damage});save();render();return true;}
function buy(name){const s=S(),w=WEAPONS.find(x=>x.name===name);if(!s||!w)return false;if(owned().includes(name))return equip(name);if(s.coins<w.cost)return false;s.coins-=w.cost;owned().push(w.name);equip(w.name);return true;}
function render(){const grid=document.getElementById('shopGrid');if(!grid)return;let old=grid.querySelector('[data-weapons]');if(old)old.remove();const wrap=document.createElement('div');wrap.dataset.weapons='1';wrap.className='shop-section';wrap.innerHTML=`<div class="section-caption"><b>ОРУЖИЕ</b><small>Единый арсенал героя</small></div>${WEAPONS.filter(w=>w.name!=='Кулаки').map(w=>{const o=owned().includes(w.name),eq=S()?.weapon===w.name;return `<article class="item-card"><div class="item-icon">${w.icon}</div><div class="item-copy"><b>${w.name}</b><span>Урон +${w.damage}</span><small>${eq?'ЭКИПИРОВАНО':o?'В АРСЕНАЛЕ':w.cost+' 🪙'}</small></div><button class="small-btn" data-forge-action="${w.name}">${eq?'ЭКИПИРОВАНО':o?'ЭКИПИРОВАТЬ':w.cost+' 🪙'}</button></article>`;}).join('')}`;grid.prepend(wrap);}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-forge-action]');if(!b)return;const name=b.dataset.forgeAction;const ok=owned().includes(name)?equip(name):buy(name);if(ok){b.textContent='ЭКИПИРОВАНО';window.TerritoryStore?.render();}});
function open(){window.showScreen?.('market');setTimeout(()=>{document.querySelector('#market')?.scrollTo({top:0,behavior:'smooth'});render();},0);}
window.ForgeV2={WEAPONS,owned,equip,buy,render,open};document.addEventListener('DOMContentLoaded',render);document.addEventListener('territory:render',render);
})();