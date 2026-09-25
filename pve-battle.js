
(function(){
'use strict';
const Store=window.TerritoryStore;
let selected=null, auto=false, seconds=60, tickId=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function reset(){
  selected=null; seconds=60; auto=!!Store?.state?.auto;
  $$('[data-pve-attack]').forEach(b=>b.classList.remove('selected'));
  $('#pveTimer').innerHTML='⏱ <b>60</b>';
  $('#pveLog').textContent='Встреча с противником. Выбери зону атаки.';
}
function hit(){
  if(!selected){$('#pveLog').textContent='Сначала выбери зону атаки.';return}
  const max=124, cur=Number($('#pveEnemyHpText').textContent.split('/')[0])||max;
  const amount=18+Math.floor(Math.random()*13), next=Math.max(0,cur-amount);
  $('#pveEnemyHpText').textContent=`${next} / ${max}`;
  $('#pveEnemyHp').style.width=`${next/max*100}%`;
  $('#pveTurn').textContent=String(Number($('#pveTurn').textContent)+1);
  const stage=$('.pve-stage'); stage.classList.remove('hit'); void stage.offsetWidth; stage.classList.add('hit');
  const d=$('#pveDamage'); d.textContent='−'+amount; d.classList.remove('show'); void d.offsetWidth; d.classList.add('show');
  $('#pveLog').textContent=`Удар в зону «${selected}». Урон: ${amount}.`;
  seconds=60; $('#pveTimer').innerHTML='⏱ <b>60</b>';
}
$$('[data-pve-attack]').forEach(b=>b.addEventListener('click',()=>{
  $$('[data-pve-attack]').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected'); selected=b.textContent;
}));
$('#pveAttack').addEventListener('click',hit);
$('#pveAuto').addEventListener('click',()=>{
  auto=!auto; $('#pveAuto').classList.toggle('on',auto);
  if(Store?.state){Store.state.auto=auto;Store.saveNow?.();}
  $('#pveLog').textContent=auto?'Авто-бой включён.':'Авто-бой выключен.';
});
$('#pveTactic').addEventListener('click',()=>$('#pveLog').textContent='Тактика: выбери зону, затем УДАР.');
$('#pveTimer').addEventListener('click',()=>{seconds=Math.max(30,seconds-10);$('#pveTimer').innerHTML=`⏱ <b>${seconds}</b>`});
$('#pveBack').addEventListener('click',()=>window.TerritoryUI?.show('map'));
$$('[data-pve-nav]').forEach(b=>b.addEventListener('click',()=>{
  const r=b.dataset.pveNav; window.TerritoryUI?.show(r==='map'?'map':r);
}));
tickId=setInterval(()=>{
  seconds=Math.max(0,seconds-1); $('#pveTimer').innerHTML=`⏱ <b>${seconds}</b>`;
  if(seconds===0){seconds=60;if(auto&&selected)hit();}
},1000);
document.addEventListener('click',e=>{
  if(e.target.closest('#pveBattle')) reset();
},{capture:true});
reset();
})();
