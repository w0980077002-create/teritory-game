
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let stage=Number(window.TerritoryStore?.state?.fjordsStage)||1;
const names=['Берег Затерянных Фьордов','Скалистый Причал','Туманный Фьорд','Лагерь Северных Волков','Владыка Фьордов'];
function render(){
 $('#fjordsPct').textContent=((stage-1)*25)+'%';
 $('#fjordsStageLabel').textContent='ЭТАП '+stage;
 $('#fjordsStageName').textContent=names[stage-1];
 $('#fjordsStageText').textContent=stage<5?'Путь открыт. Впереди новый противник.':'Босс главы ждёт после 100%.';
 $$('.route-node').forEach((n,i)=>n.classList.toggle('active',i+1===stage));
}
$('#fjordsStart')?.addEventListener('click',()=>{
 const root=$('.fjords-map');root.classList.add('moving');
 $('#fjordsStart').disabled=true;$('#fjordsStart').textContent='ИДЁМ...';
 setTimeout(()=>{
   root.classList.add('encounter');$('#fjordsEncounter').classList.remove('hidden');
   $('#fjordsStart').textContent='ВСТРЕЧА';
 },1200);
});
$('#fjordsFight')?.addEventListener('click',()=>{
 const s=window.TerritoryStore?.state;
 if(s){s.currentStage=stage;s.lastStageEncounter=true;window.TerritoryStore.saveNow?.();}
 window.TerritoryUI?.show('pveBattle');
});
$('#fjordsBack')?.addEventListener('click',()=>window.TerritoryUI?.show('home'));
$$('[data-fj-nav]').forEach(b=>b.addEventListener('click',()=>window.TerritoryUI?.show(b.dataset.fjNav==='map'?'map':b.dataset.fjNav)));
document.addEventListener('visibilitychange',()=>{stage=Number(window.TerritoryStore?.state?.fjordsStage)||stage;render()});
render();
})();
