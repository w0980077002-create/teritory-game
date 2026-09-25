
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let hp=78173,maxHp=119600,auto=false,seconds=60,selected=1;
function render(){ $('#pvePlayerHp').style.width=(hp/maxHp*100)+'%'; $('#pvePlayerHpText').textContent=`${hp.toLocaleString('en-US')} / ${maxHp.toLocaleString('en-US')}`; $('#pveTimer').innerHTML=`⏱ <b>${seconds}</b>`; }
function attack(){
 const skill=document.querySelector('.skill32.selected'); const name=skill?.textContent?.trim()||'Навык';
 const dmg=9000+Math.floor(Math.random()*16000);
 hp=Math.max(0,hp-dmg);
 const f=$('.battle32-field'); f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit');
 const fl=$('#pveFloat32'); fl.textContent='−'+Math.round(dmg/1000)+'K'; fl.classList.remove('show'); void fl.offsetWidth; fl.classList.add('show');
 $('#pveLog').textContent=`${name} — нанесён урон ${dmg.toLocaleString('en-US')}.`;
 if(hp===0){$('#pveLog').textContent='Бой завершён. Победа!'; auto=false;}
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
