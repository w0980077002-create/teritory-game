
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let hp=78173,maxHp=119600,auto=false,seconds=60,selected=1,finished=false;
function render(){ $('#pvePlayerHp').style.width=(hp/maxHp*100)+'%'; $('#pvePlayerHpText').textContent=`${hp.toLocaleString('en-US')} / ${maxHp.toLocaleString('en-US')}`; $('#pveTimer').innerHTML=`⏱ <b>${seconds}</b>`; }
function attack(){
 if(finished)return;
 const skill=document.querySelector('.skill32.selected'); const name=skill?.textContent?.trim()||'Навык';
 const dmg=9000+Math.floor(Math.random()*16000);
 hp=Math.max(0,hp-dmg);
 const f=$('.battle32-field'); f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit');
 const fl=$('#pveFloat32'); fl.textContent='−'+Math.round(dmg/1000)+'K'; fl.classList.remove('show'); void fl.offsetWidth; fl.classList.add('show');
 $('#pveLog').textContent=`${name} — нанесён урон ${dmg.toLocaleString('en-US')}.`;
 if(hp===0){
  finished=true; auto=false;
  $('#pveLog').textContent='Бой завершён. Победа!';
  const s=window.TerritoryStore?.state;
  if(s){
    s.mapProgress=Math.min(100,(Number(s.mapProgress)||0)+10);
    s.lastStageWon=true;
    window.TerritoryStore.saveNow?.();
  }
  setTimeout(()=>{
    const b=document.createElement('button');
    b.id='pveVictory'; b.className='pve-victory-btn'; b.textContent='ЗАБРАТЬ НАГРАДУ';
    document.querySelector('.battle32')?.appendChild(b);
    b.onclick=()=>window.TerritoryUI?.show('map');
  },500);
}
 render();
}
$$('.skill32').forEach(b=>b.addEventListener('click',()=>{ $$('.skill32').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=b.dataset.skill; }));
$('#pveAttack').addEventListener('click',attack);
$('#pveAuto').addEventListener('click',()=>{auto=!auto;$('#pveAuto').classList.toggle('on',auto);$('#pveLog').textContent=auto?'Авто-бой включён.':'Авто-бой выключен.'});
$('#pveTactic').addEventListener('click',()=>$('#pveLog').textContent='Выбор навыка: нажми и выбери нужную способность.');
$('#pveTimer').addEventListener('click',()=>{seconds=Math.max(30,seconds-10);render()});
$('#pveBack').addEventListener('click',()=>window.TerritoryUI?.show('map'));
$$('[data-pve-nav]').forEach(b=>b.addEventListener('click',()=>window.TerritoryUI?.show(b.dataset.pveNav==='map'?'map':b.dataset.pveNav)));
setInterval(()=>{seconds=Math.max(0,seconds-1);if(seconds===0){seconds=60;if(auto)attack()}render()},1000);
render();
})();
