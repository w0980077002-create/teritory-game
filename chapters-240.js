
(function(){
'use strict';
const DATA_URL='chapters-240.json';
async function loadChapters(){
  const r=await fetch(DATA_URL+'?v=10037');
  if(!r.ok) throw new Error('chapters-240.json');
  window.TerritoryChapters=await r.json();
  const s=window.TerritoryStore?.state;
  if(s){
    s.chapterCount=240;
    if(!s.currentChapter) s.currentChapter=1;
    if(!s.chapterStage) s.chapterStage=1;
    if(!s.chapterProgress) s.chapterProgress=0;
    if(!s.chapterBossDefeated) s.chapterBossDefeated=false;
    window.TerritoryStore.saveNow?.();
  }
}
window.TerritoryChaptersAPI={
  current(){
    const s=window.TerritoryStore?.state||{};
    return (window.TerritoryChapters||[])[Math.max(0,(s.currentChapter||1)-1)];
  },
  setChapter(n){
    const s=window.TerritoryStore?.state;
    if(!s)return;
    s.currentChapter=Math.max(1,Math.min(240,n));
    s.chapterStage=1;s.chapterProgress=0;s.chapterBossDefeated=false;
    window.TerritoryStore.saveNow?.();
  },
  completeStage(){
    const s=window.TerritoryStore?.state;if(!s)return;
    s.chapterProgress=Math.min(100,(Number(s.chapterProgress)||0)+25);
    if(s.chapterProgress>=100)s.chapterBossUnlocked=true;
    window.TerritoryStore.saveNow?.();
  },
  completeBoss(){
    const s=window.TerritoryStore?.state;if(!s)return;
    s.chapterBossDefeated=true;s.chapterCompleted=true;
    if((s.currentChapter||1)<240){
      s.currentChapter++;
      s.chapterStage=1;s.chapterProgress=0;s.chapterBossUnlocked=false;s.chapterBossDefeated=false;s.chapterCompleted=false;
    }
    window.TerritoryStore.saveNow?.();
  }
};
loadChapters().catch(console.error);
})();
