/* Territory S97 — character equipment & stats screen */
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
#s97{position:fixed;inset:0;z-index:100006;display:none;background:linear-gradient(#0b0d12,#17130e);color:#eee;font-family:system-ui,sans-serif;overflow:auto}
#s97 .wrap{max-width:520px;margin:auto;padding:14px;box-sizing:border-box}
#s97 h2{text-align:center;margin:4px 0 14px}
#s97 .card{background:#14181f;border:1px solid #353b45;border-radius:14px;padding:12px;margin-bottom:10px}
#s97 .hero{display:grid;grid-template-columns:92px 1fr;gap:12px;align-items:center}
#s97 .avatar{width:92px;height:110px;border-radius:12px;background:linear-gradient(#40382d,#17191e);display:flex;align-items:center;justify-content:center;font-size:55px}
#s97 .name{font-size:21px;font-weight:800}.muted{opacity:.65;font-size:13px}
#s97 .stat{display:grid;grid-template-columns:1fr auto;gap:7px;margin:8px 0}.bar{height:8px;background:#30343c;border-radius:8px;overflow:hidden}.bar i{display:block;height:100%;width:50%;background:#9b6a25}
#s97 .slots{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#s97 .slot{border:1px solid #343a44;border-radius:10px;padding:10px;background:#1b2028}
#s97 button{width:100%;padding:10px;margin-top:7px;border-radius:9px;border:1px solid #4b515c;background:#252b34;color:#fff;font-weight:700}
#s97 .upgrade{display:grid;grid-template-columns:1fr auto auto;gap:7px;align-items:center}
#s97 .upgrade button{width:auto;margin:0;padding:7px 11px}
#s97 .close{margin-top:2px}
`;
document.head.appendChild(css);
const root=document.createElement('div');root.id='s97';root.innerHTML=`
<div class="wrap"><h2>👤 Персонаж</h2>
<div class="card hero"><div class="avatar">⚔️</div><div><div class="name" id="s97name">Игрок</div><div class="muted" id="s97level">Уровень 1</div><div class="stat"><span>Опыт</span><b id="s97xp">0</b></div><div class="bar"><i id="s97bar"></i></div></div></div>
<div class="card"><b>Характеристики</b>
<div class="upgrade"><span>💪 Сила <b id="s97str">5</b></span><button data-stat="strength">+1</button></div>
<div class="upgrade"><span>🏃 Ловкость <b id="s97agi">5</b></span><button data-stat="agility">+1</button></div>
<div class="muted" id="s97free">Свободных очков: 0</div>
<button id="s97reset">↩ Сбросить распределение</button></div>
<div class="card"><b>Экипировка</b><div class="slots">
<div class="slot">⚔️ Оружие<div id="s97weapon" class="muted">Кулаки</div><button data-unequip="weapon">Снять</button></div>
<div class="slot">🛡️ Броня<div id="s97armor" class="muted">Нет</div><button data-unequip="armor">Снять</button></div>
<div class="slot">🪢 Пояс<div id="s97belt" class="muted">Нет</div><button data-unequip="belt">Снять</button></div>
</div></div>
<div class="card"><b>Боевые показатели</b><div class="stat"><span>Сила атаки</span><b id="s97power">0</b></div><div class="stat"><span>Макс. HP</span><b id="s97hp">0</b></div><div class="stat"><span>Крит</span><b id="s97crit">0%</b></div><div class="stat"><span>Уклонение</span><b id="s97dodge">0%</b></div></div>
<button class="close" id="s97close">Закрыть</button>
</div>`;
document.body.appendChild(root);

let id=window.TerritoryPlayerId||'';
const names={fists:'Кулаки',iron_sword:'Железный меч',viking_axe:'Викингский топор',steel_armor:'Стальная броня',leather_belt:'Кожаный пояс'};
async function api(url,opt){const r=await fetch(url,opt);const j=await r.json();if(!j.ok)throw new Error(j.error||'Ошибка');return j}
function draw(j){
 const s=j.stats||j;
 root.querySelector('#s97level').textContent='Уровень '+(s.level||1);
 root.querySelector('#s97xp').textContent=(s.xp||0);
 root.querySelector('#s97bar').style.width=Math.min(100,(s.xp||0)/(100+(s.level||1)*75)*100)+'%';
 root.querySelector('#s97str').textContent=s.strength||5;root.querySelector('#s97agi').textContent=s.agility||5;
 root.querySelector('#s97free').textContent='Свободных очков: '+(s.freePoints||0);
 root.querySelector('#s97power').textContent=s.attackPower||s.power||0;root.querySelector('#s97hp').textContent=s.maxHp||0;
 root.querySelector('#s97crit').textContent=(Number(s.critChance||s.crit||0)).toFixed(1)+'%';
 root.querySelector('#s97dodge').textContent=(Number(s.dodgeChance||0)).toFixed(1)+'%';
 const e=j.equipment||s.equipment||{};root.querySelector('#s97weapon').textContent=names[e.weapon]||'Кулаки';
 root.querySelector('#s97armor').textContent=names[e.armor]||'Нет';root.querySelector('#s97belt').textContent=names[e.belt]||'Нет';
}
async function load(){try{const j=await api('/api/character?id='+encodeURIComponent(id));draw(j);const e=await api('/api/equipment?id='+encodeURIComponent(id));draw(e)}catch(e){console.warn(e)}}
root.querySelectorAll('[data-stat]').forEach(b=>b.onclick=async()=>{try{await api('/api/character/upgrade',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({stat:b.dataset.stat,count:1})});await load()}catch(e){alert(e.message)}});
root.querySelectorAll('[data-unequip]').forEach(b=>b.onclick=async()=>{try{await api('/api/equipment/unequip',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slot:b.dataset.unequip})});await load()}catch(e){alert(e.message)}});
root.querySelector('#s97reset').onclick=async()=>{try{await api('/api/character/reset-points',{method:'POST',headers:{'content-type':'application/json'}});await load()}catch(e){alert(e.message)}};
root.querySelector('#s97close').onclick=()=>root.style.display='none';
window.TerritoryS97={open(playerId){id=playerId||window.TerritoryPlayerId||'';root.style.display='block';load()},close(){root.style.display='none'}};
window.openTerritoryS97=window.TerritoryS97.open;
})();