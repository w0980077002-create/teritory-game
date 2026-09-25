(function(){
'use strict';
const DATA_URL='chapters-240.json';
function store(){return window.TerritoryStore?.state||null}
function save(){window.TerritoryStore?.saveNow?.()}
function ensureState(){
  const s=store(); if(!s)return null;
  if(!Number.isFinite(Number(s.currentChapter))||s.currentChapter<1)s.currentChapter=1;
  s.currentChapter=Math.min(240,Math.floor(Number(s.currentChapter)));
  if(!Number.isFinite(Number(s.chapterStage))||s.chapterStage<1)s.chapterStage=1;
  if(!Number.isFinite(Number(s.chapterProgress))||s.chapterProgress<0)s.chapterProgress=0;
  if(s.chapterProgress>=100)s.chapterBossUnlocked=true;
  if(typeof s.chapterBossDefeated!=='boolean')s.chapterBossDefeated=false;
  if(typeof s.chapterCompleted!=='boolean')s.chapterCompleted=false;
  return s;
}
async function loadChapters(){
  const r=await fetch(DATA_URL+'?v=10038');
  if(!r.ok) throw new Error('chapters-240.json');
  window.TerritoryChapters=await r.json();
  const s=ensureState(); if(s){s.chapterCount=240;save()}
  window.dispatchEvent(new CustomEvent('territory:chapters-ready'));
}
window.TerritoryChaptersAPI={
  current(){
    const s=ensureState()||{};
    return (window.TerritoryChapters||[])[Math.max(0,Math.min(239,(Number(s.currentChapter)||1)-1))];
  },
  state(){return ensureState()},
  completeStage(){
    const s=ensureState(); if(!s)return null;
    const ch=this.current();
    const per=Number(ch?.progressPerWin)||25;
    s.chapterProgress=Math.min(100,(Number(s.chapterProgress)||0)+per);
    s.chapterStage=Math.min((Number(ch?.stages)||4)+1,(Number(s.chapterStage)||1)+1);
    if(s.chapterProgress>=100)s.chapterBossUnlocked=true;
    save();
    return s;
  },
  completeBoss(){
    const s=ensureState(); if(!s)return null;
    s.chapterBossDefeated=true;s.chapterCompleted=true;s.chapterBossUnlocked=false;
    save();return s;
  },
  nextChapter(){
    const s=ensureState(); if(!s)return null;
    if((s.currentChapter||1)<240){
      s.currentChapter++;s.chapterStage=1;s.chapterProgress=0;s.chapterBossUnlocked=false;s.chapterBossDefeated=false;s.chapterCompleted=false;
    }
    save();return s;
  }
};
loadChapters().catch(err=>{console.error(err);window.dispatchEvent(new CustomEvent('territory:chapters-error',{detail:err}))});
})();
