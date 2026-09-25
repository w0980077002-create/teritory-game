(function(){
'use strict';
const show=id=>window.TerritoryUI?.show(id);
function current(){return window.TerritoryChaptersAPI?.current?.()}
function updateComplete(){const s=window.TerritoryChaptersAPI?.state?.();const ch=current();if(!s||!ch)return;const title=document.querySelector('.chapter-card h1');if(title)title.textContent=ch.name.toUpperCase();const p=document.querySelector('.chapter-card p');if(p)p.textContent=`Глава ${ch.id} завершена. Следующая территория готова.`;const btn=document.getElementById('openNextChapter');if(btn)btn.textContent=ch.id>=240?'ВЕРНУТЬСЯ НА КАРТУ':'ОТКРЫТЬ СЛЕДУЮЩУЮ ГЛАВУ';}
function updateNext(){const s=window.TerritoryChaptersAPI?.state?.();const ch=window.TerritoryChapters?.[(Number(s?.currentChapter)||1)-1];if(!s||!ch)return;const title=document.querySelector('.next-top b');if(title)title.textContent=`ГЛАВА ${ch.id}`;const name=document.querySelector('.next-title');if(name)name.textContent=ch.name.toUpperCase();const pct=document.querySelector('.next-top strong');if(pct)pct.textContent='0%';const sub=document.querySelector('.next-subtitle');if(sub)sub.textContent='Новая территория открыта';}
document.addEventListener('click',e=>{
 if(e.target.closest('#openNextChapter')){
   const s=window.TerritoryChaptersAPI?.state?.();
   if((s?.currentChapter||1)>=240){show('map');return;}
   window.TerritoryChaptersAPI?.nextChapter?.();updateNext();show('nextChapter');
 }
 if(e.target.closest('#startNextChapter'))show('map');
 if(e.target.closest('#nextBack'))show('map');
 const n=e.target.closest('[data-next-nav]');if(n)show(n.dataset.nextNav==='map'?'map':n.dataset.nextNav);
});
window.addEventListener('territory:screen',e=>{if(e.detail==='chapterComplete')updateComplete();if(e.detail==='nextChapter')updateNext()});
window.TerritoryGameChapterComplete={show:()=>{updateComplete();show('chapterComplete')}};
})();
