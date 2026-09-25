
(function(){
'use strict';
const $=s=>document.querySelector(s);
function nav(r){window.TerritoryUI?.show(r==='map'?'map':r)}
$('#bossBack')?.addEventListener('click',()=>nav('map'));
document.querySelectorAll('[data-boss-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.bossNav)));
$('#bossStart')?.addEventListener('click',()=>{
  $('#bossStart').textContent='БОЙ НАЧАЛСЯ';
  $('#bossStart').disabled=true;
  let hp=500;
  const timer=setInterval(()=>{
    hp=Math.max(0,hp-(25+Math.floor(Math.random()*21)));
    $('#bossHp').style.width=(hp/500*100)+'%';
    $('#bossHpText').textContent=hp+' / 500';
    if(hp===0){
      clearInterval(timer);
      $('#bossStart').textContent='ГЛАВА ЗАВЕРШЕНА';
    }
  },700);
});
})();
