(function(){
'use strict';
const $=s=>document.querySelector(s);
function paint(){const s=window.TerritoryStore?.state||{};if($('#fjordsChapter'))$('#fjordsChapter').textContent='ГЛАВА '+(s.currentChapter||1);if($('#fjordsStage'))$('#fjordsStage').textContent='Этап '+(s.chapterStage||1)+' · автоматический путь';if($('#fjordsPct'))$('#fjordsPct').textContent=(s.chapterProgress||0)+'%';const skull=$('#mapChapterSkull');if(skull)skull.style.display=s.chapterBossUnlocked?'block':'none'}
window.TerritoryMap240={movement:()=>window.HomeRebuild?.startRunner?.(false)};
document.addEventListener('DOMContentLoaded',paint);window.addEventListener('territory:state-changed',paint);window.addEventListener('territory:screen',e=>{if(e.detail==='map')paint()});
})();