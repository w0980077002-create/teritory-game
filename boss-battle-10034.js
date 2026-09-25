
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let bossHp=500000,playerHp=119600,auto=false,seconds=60,finished=false;
const maxBoss=500000,maxPlayer=119600;
function render(){
 $('#bfBossHp').style.width=(bossHp/maxBoss*100)+'%';
 $('#bfPlayerHp').style.width=(playerHp/maxPlayer*100)+'%';
 $('#bfBossText').textContent=`${Math.round(bossHp/1000)}K / 500K`;
 $('#bfPlayerText').textContent=`${Math.round(playerHp/1000)}K / 119.6K`;
 $('#bfTimer').innerHTML=`⏱ <b>${seconds}</b>`;
}
function result(win){
 finished=true; auto=false;
 $('#bfResult').classList.remove('hidden');
 $('#bfResultIcon').textContent=win?'🏆':'💀';
 $('#bfResultTitle').textContent=win?'БОСС ПОБЕЖДЁН!':'ГЕРОЙ ПОВЕРЖЕН';
 $('#bfResultText').textContent=win?'Глава завершена. Награда готова.':'Бой проигран. Можно вернуться на карту и повторить.';
 $('#bfReward').textContent=win?'ЗАБРАТЬ НАГРАДУ':'ВЕРНУТЬСЯ НА КАРТУ';
 $('#bfReward').onclick=()=>{
   if(win){
     const s=window.TerritoryStore?.state;
     if(s){s.mapProgress=100;s.chapterBossDefeated=true;s.chapterCompleted=true;window.TerritoryStore.saveNow?.();}
   }
   window.TerritoryUI?.show('map');
 };
}
function attack(){
 if(finished)return;
 const skill=document.querySelector('.bf-skill.selected')?.dataset.skill||'axe';
 let dmg=18000+Math.floor(Math.random()*26000);
 if(skill==='rage')dmg*=1.35;
 if(skill==='ice')dmg*=1.15;
 if(skill==='heal') playerHp=Math.min(maxPlayer,playerHp+22000);
 bossHp=Math.max(0,bossHp-Math.round(dmg));
 const field=$('.bf-field');field.classList.remove('hit');void field.offsetWidth;field.classList.add('hit');
 const fl=$('#bfFloat');fl.textContent='−'+Math.round(dmg/1000)+'K';fl.classList.remove('show');void fl.offsetWidth;fl.classList.add('show');
 $('#bfLog').textContent=skill==='heal'?'Здоровье восстановлено.':`Босс получает ${Math.round(dmg/1000)}K урона.`;
 if(bossHp>0 && skill!=='shield'){
   const retaliation=9000+Math.floor(Math.random()*11000);
   playerHp=Math.max(0,playerHp-retaliation);
   $('#bfLog').textContent+=` Ответный удар: −${Math.round(retaliation/1000)}K.`;
 }
 if(bossHp===0) result(true);
 else if(playerHp===0) result(false);
 render();
}
$$('.bf-skill').forEach(b=>b.addEventListener('click',()=>{$$('.bf-skill').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}));
$('#bfHit').addEventListener('click',attack);
$('#bfAuto').addEventListener('click',()=>{auto=!auto;$('#bfAuto').classList.toggle('on',auto);$('#bfLog').textContent=auto?'Авто-бой включён.':'Авто-бой выключен.'});
$('#bfTimer').addEventListener('click',()=>{seconds=Math.max(30,seconds-10);render()});
$('#bossBack').addEventListener('click',()=>window.TerritoryUI?.show('map'));
$$('[data-bf-nav]').forEach(b=>b.addEventListener('click',()=>window.TerritoryUI?.show(b.dataset.bfNav==='map'?'map':b.dataset.bfNav)));
setInterval(()=>{seconds=Math.max(0,seconds-1);if(seconds===0){seconds=60;if(auto)attack()}render()},1000);
render();
})();
