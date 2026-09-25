
(function(){
'use strict';
const $=s=>document.querySelector(s);
function show(id){window.TerritoryUI?.show(id)}
document.addEventListener('click',e=>{
  if(e.target.closest('#openNextChapter')){
    const s=window.TerritoryStore?.state;
    if(s){s.currentChapter=16;s.mapProgress=0;s.chapterBossDefeated=false;s.chapterCompleted=false;window.TerritoryStore.saveNow?.();}
    show('nextChapter');
  }
  if(e.target.closest('#startNextChapter')) show('map');
  if(e.target.closest('#nextBack')) show('map');
  const n=e.target.closest('[data-next-nav]');
  if(n) show(n.dataset.nextNav==='map'?'map':n.dataset.nextNav);
});
function maybeOpen(){
  const s=window.TerritoryStore?.state;
  if(s?.chapterCompleted && s?.mapProgress>=100){
    const el=document.getElementById('chapterComplete');
    if(el && document.body.dataset.screen==='map') {
      // Do not force-open automatically; boss result opens this only through explicit return.
    }
  }
}
window.TerritoryGameChapterComplete={show:()=>show('chapterComplete')};
setInterval(maybeOpen,500);
})();
