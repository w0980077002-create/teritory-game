/* Territory S92 — tactical PvP battle UI
   Self-contained overlay. Uses existing /api/pvp/* endpoints.
*/
(()=>{'use strict';
const Z=[['head','Голова','Head'],['chest','Грудь','Chest'],['belt','Пояс','Belt'],['legs','Ноги','Legs']];
const css=`#s92{position:fixed;inset:0;z-index:99999;background:rgba(8,10,14,.96);color:#eee;font-family:system-ui,sans-serif;display:none;overflow:auto}
#s92 .box{max-width:520px;margin:auto;min-height:100%;padding:14px;box-sizing:border-box}
#s92 h2{margin:4px 0 12px;text-align:center}
#s92 .fighters{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#s92 .fighter{background:#171b22;border:1px solid #303744;border-radius:12px;padding:10px}
#s92 .name{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#s92 .hp{height:10px;background:#30343d;border-radius:8px;overflow:hidden;margin-top:7px}
#s92 .hp i{display:block;height:100%;width:100%;background:#65c466;transition:width .35s}
#s92 .section{margin-top:14px;background:#11151b;border:1px solid #292f39;border-radius:12px;padding:10px}
#s92 .title{font-size:13px;opacity:.75;margin-bottom:8px}
#s92 .zones{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#s92 button{border:1px solid #3a414d;background:#202630;color:#eee;border-radius:10px;padding:12px 8px;font-size:15px}
#s92 button.sel{border-color:#e3a52b;background:#493815}
#s92 button:disabled{opacity:.45}
#s92 .go{width:100%;margin-top:10px;background:#8b5e1b;border-color:#c78c2c;font-weight:700}
#s92 .log{font-size:13px;line-height:1.45;max-height:170px;overflow:auto}
#s92 .close{width:100%;margin-top:12px}
#s92 .flash{animation:s92flash .38s ease}@keyframes s92flash{50%{transform:scale(1.025);filter:brightness(1.6)}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const root=document.createElement('div');root.id='s92';root.innerHTML=`<div class="box">
<h2>⚔ Тактический бой</h2>
<div class="fighters"><div class="fighter"><div class="name" id="s92a">Атакующий</div><div class="hp"><i id="s92ah"></i></div><small id="s92at">100 HP</small></div>
<div class="fighter"><div class="name" id="s92d">Защитник</div><div class="hp"><i id="s92dh"></i></div><small id="s92dt">100 HP</small></div></div>
<div class="section"><div class="title">АТАКА — выбери 1 зону</div><div class="zones" id="s92atk"></div></div>
<div class="section"><div class="title">ЗАЩИТА — выбери ровно 2 зоны</div><div class="zones" id="s92def"></div>
<button class="go" id="s92go" disabled>⚔ НАНЕСТИ УДАР</button></div>
<div class="section"><div class="title">ЖУРНАЛ БОЯ</div><div class="log" id="s92log">Ожидание боя…</div></div>
<button class="close" id="s92close">Закрыть</button>
</div>`;
document.body.appendChild(root);
const A=root.querySelector('#s92atk'),D=root.querySelector('#s92def'),go=root.querySelector('#s92go'),log=root.querySelector('#s92log');
let attack=null,defs=[],match=null,interval=null;

function zoneLabel(z){const x=Z.find(a=>a[0]===z);return x?x[1]:z}
function render(){
 A.innerHTML='';D.innerHTML='';
 Z.forEach(([id])=>{
   const b=document.createElement('button');b.textContent=zoneLabel(id);b.onclick=()=>{attack=id;render()};if(attack===id)b.classList.add('sel');A.appendChild(b);
 });
 Z.forEach(([id])=>{
   const b=document.createElement('button');b.textContent=zoneLabel(id);b.onclick=()=>{
     if(defs.includes(id))defs=defs.filter(x=>x!==id);
     else if(defs.length<2)defs.push(id);
     render();
   };
   if(defs.includes(id))b.classList.add('sel');
   if(id===attack)b.disabled=true;
   D.appendChild(b);
 });
 go.disabled=!(attack&&defs.length===2&&!defs.includes(attack));
}
function hp(el,val,max){el.style.width=Math.max(0,Math.min(100,val/max*100))+'%'}
function addLog(text){
 const p=document.createElement('div');p.textContent=text;log.prepend(p);
 while(log.children.length>30)log.lastChild.remove();
}
function draw(m){
 match=m;
 root.querySelector('#s92a').textContent=m.attacker.name;
 root.querySelector('#s92d').textContent=m.defender.name;
 root.querySelector('#s92at').textContent=Math.max(0,m.attackerHp)+' HP';
 root.querySelector('#s92dt').textContent=Math.max(0,m.defenderHp)+' HP';
 hp(root.querySelector('#s92ah'),m.attackerHp,100+Number(m.attacker.power||0)*2);
 hp(root.querySelector('#s92dh'),m.defenderHp,100+Number(m.defender.power||0)*2);
 log.innerHTML='';
 (m.log||[]).slice().reverse().forEach(x=>addLog(x.text||x.type||''));
 if(m.status!=='active'){go.disabled=true;addLog(m.winner===m.attacker.id?'🏆 Победитель: '+m.attacker.name:'🏆 Победитель: '+m.defender.name)}
}
async function act(){
 if(!match||!go.disabled===false)return;
 if(!(attack&&defs.length===2&&!defs.includes(attack)))return;
 go.disabled=true;go.textContent='Ход отправляется…';
 try{
  const r=await fetch('/api/pvp/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchId:match.id,zone:attack,defenseZones:defs})});
  const j=await r.json();if(!j.ok)throw new Error(j.error||'Ошибка боя');
  draw(j.match);
  const hpTarget=j.match.turn===j.match.attacker.id?root.querySelector('#s92ah'):root.querySelector('#s92dh');
  hpTarget.parentElement.parentElement.classList.add('flash');setTimeout(()=>hpTarget.parentElement.parentElement.classList.remove('flash'),400);
  attack=null;defs=[];render();
 }catch(e){addLog('⚠ '+e.message)}
 finally{if(match&&match.status==='active')go.textContent='⚔ НАНЕСТИ УДАР'}
}
go.onclick=act;
root.querySelector('#s92close').onclick=()=>{root.style.display='none';if(interval)clearInterval(interval)};
window.TerritoryS92={
 open(m){match=m;root.style.display='block';attack=null;defs=[];render();draw(m)},
 refresh:async()=>{
   if(!match)return;
   try{const r=await fetch('/api/pvp/mine?id='+encodeURIComponent(window.TerritoryPlayerId||''));const j=await r.json();const m=(j.matches||[]).find(x=>x.id===match.id);if(m)draw(m)}catch(_){}
 }
};
window.openTerritoryS92=window.TerritoryS92.open;
})();