(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let enemyHp=1,enemyMax=1,playerHp=6850,playerMax=6850,auto=false,seconds=60,finished=false,selected=1;
function getState(){return window.TerritoryChaptersAPI?.state?.()||window.TerritoryStore?.state||{currentChapter:1,chapterStage:1,chapterProgress:0}}
function getChapter(){return window.TerritoryChaptersAPI?.current?.()}
function fmt(n){return Number(n).toLocaleString('en-US')}
function setup(){
 const s=getState(),ch=getChapter(); if(!ch)return;
 enemyMax=enemyHp=Number(ch.enemy.hp)||90000; playerMax=Number(window.TerritoryStore?.state?.maxHp)||6850; playerHp=playerMax;seconds=60;finished=false;auto=false;
 $('#pveAuto')?.classList.remove('on');
 const stage=Math.min(4,Math.max(1,Number(s.chapterStage)||1));
 $('.stage32').innerHTML=`ГЛАВА ${ch.id} · <b>${ch.name}</b><small>Этап ${stage}/${ch.stages} · Враг Lv.${ch.enemy.level}</small>`;
 $('.fighter32.enemy b').textContent=`Противник · Lv.${ch.enemy.level}`;
 let bar=$('#pveEnemyHp'); if(!bar){bar=document.createElement('div');bar.id='pveEnemyHp';bar.className='pve-enemy-hp';$('.battle32-field').appendChild(bar)}
 bar.innerHTML='<i></i><span></span>';
 let mapBtn=$('#pveChapterMap');if(!mapBtn){mapBtn=document.createElement('button');mapBtn.id='pveChapterMap';mapBtn.className='chapter-map-link';mapBtn.textContent='☠️';mapBtn.title='Карта глав';$('.battle32').appendChild(mapBtn);mapBtn.onclick=()=>window.TerritoryUI?.show('map')}
 $('#pveLog').textContent=`${ch.name} · этап ${stage}. Победи врага, чтобы открыть следующий этап.`;
 render();
}
function render(){
 $('#pvePlayerHp').style.width=(playerHp/playerMax*100)+'%';$('#pvePlayerHpText').textContent=`${fmt(playerHp)} / ${fmt(playerMax)}`;$('#pveTimer').innerHTML=`⏱ <b>${seconds}</b>`;
 const bar=$('#pveEnemyHp');if(bar){bar.querySelector('i').style.width=(enemyHp/enemyMax*100)+'%';bar.querySelector('span').textContent=`ВРАГ ${fmt(enemyHp)} / ${fmt(enemyMax)}`}
}
function finish(win){
 finished=true;auto=false;$('#pveAuto')?.classList.remove('on');
 if(win){
   window.TerritoryChaptersAPI?.completeStage?.();
   const s=getState();
   const done=Number(s.chapterProgress)>=100;
   $('#pveLog').textContent=done?'100% на ботах. ☠️ Босс теперь открывается только через череп на карте.':'Победа! Следующий бот уже впереди.';
   let b=$('#pveVictory');if(!b){b=document.createElement('button');b.id='pveVictory';b.className='pve-victory-btn';$('.battle32').appendChild(b)}
   b.textContent=done?'ВЕРНУТЬСЯ НА КАРТУ':'ИДТИ К СЛЕДУЮЩЕМУ БОТУ';
   b.onclick=()=>{window.TerritoryUI?.show('map');if(!done)setTimeout(()=>window.TerritoryMap240?.movement?.(),120)};
   if(!done){setTimeout(()=>{if(!finished)return;window.TerritoryUI?.show('map');setTimeout(()=>window.TerritoryMap240?.movement?.(),180)},900)}
 }else $('#pveLog').textContent='Герой повержен. Вернись на карту и повтори этап.';
 window.dispatchEvent(new CustomEvent('territory:state-changed'));render();
}
function attack(){
 if(finished)return;
 const ch=getChapter();if(!ch)return;
 const skill=document.querySelector('.skill32.selected');const mult={1:1,2:1.08,3:1.18,4:.7,5:1.28,6:.55,7:1.12,8:1.2}[selected]||1;
 const dmg=Math.max(1,Math.round(enemyMax*(.16+Math.random()*.08)*mult));
 enemyHp=Math.max(0,enemyHp-dmg);
 const field=$('.battle32-field');field.classList.remove('hit');void field.offsetWidth;field.classList.add('hit');
 $('#pveFloat32').textContent='−'+fmt(dmg);$('#pveFloat32').classList.remove('show');void $('#pveFloat32').offsetWidth;$('#pveFloat32').classList.add('show');
 let msg=`${skill?.textContent?.trim()||'УДАР'} · −${fmt(dmg)}`;
 if(enemyHp>0){const ratio=Number(ch.enemy.damage)/Math.max(1,Number(ch.enemy.hp));const retaliation=Math.max(80,Math.min(Math.round(playerMax*.22),Math.round(playerMax*(.08+Math.min(.12,ratio*5)))));playerHp=Math.max(0,playerHp-retaliation);msg+=` · ответ −${fmt(retaliation)}`}
 $('#pveLog').textContent=msg;
 if(enemyHp===0)finish(true);else if(playerHp===0)finish(false);else render();
}
$$('.skill32').forEach(b=>b.addEventListener('click',()=>{$$('.skill32').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=Number(b.dataset.skill)}));
$('#pveAttack')?.addEventListener('click',attack);
$('#pveAuto')?.addEventListener('click',()=>{auto=!auto;$('#pveAuto').classList.toggle('on',auto);$('#pveLog').textContent=auto?'Авто-бой включён.':'Авто-бой выключен.'});
$('#pveTactic')?.addEventListener('click',()=>$('#pveLog').textContent='Выбери навык. Карта ☠️ всегда доступна сверху.');
$('#pveTimer')?.addEventListener('click',()=>{seconds=Math.max(30,seconds-10);render()});
$('#pveBack')?.addEventListener('click',()=>window.TerritoryUI?.show('map'));
$$('[data-pve-nav]').forEach(b=>b.addEventListener('click',()=>window.TerritoryUI?.show(b.dataset.pveNav==='map'?'map':b.dataset.pveNav)));
window.addEventListener('territory:screen',e=>{if(e.detail==='pveBattle')setup()});
setInterval(()=>{if(!$('#pveBattle')?.classList.contains('active'))return;seconds=Math.max(0,seconds-1);if(seconds===0){seconds=60;if(auto)attack()}render()},1000);
setup();
})();
