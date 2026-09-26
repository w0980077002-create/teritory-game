/* Territory Game 10053 — chapter bot chain + boss retry/farm loop */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const API=()=>window.TerritoryChaptersAPI;
const save=()=>window.TerritoryStore?.saveNow?.('chapter-bot-boss-loop-10053');

function ensure(){
  const s=S();
  s.pve=s.pve||{};
  if(!Number.isFinite(Number(s.battleStones)))s.battleStones=30;
  if(!Number.isFinite(Number(s.currentChapter)))s.currentChapter=Math.max(1,Number(s.pve.chapter)||1);
  if(!Number.isFinite(Number(s.chapterProgress)))s.chapterProgress=Math.max(0,Number(s.pve.progress)||0);
  if(!Number.isFinite(Number(s.chapterStage)))s.chapterStage=Math.max(1,Number(s.pve.stage)||1);
  if(Number(s.chapterProgress)>=100){s.chapterProgress=100;s.chapterBossUnlocked=true;}
  s.pve.chapter=Number(s.currentChapter)||1;
  s.pve.progress=Number(s.chapterProgress)||0;
  s.pve.stage=Number(s.chapterStage)||1;
  s.pve.bossPending=Boolean(s.chapterBossUnlocked)&&Number(s.chapterProgress)>=100;
  save();
}
function sync(){
  const s=S();const api=API();
  if(!api?.state)return;
  const x=api.state();
  s.pve=s.pve||{};
  s.pve.chapter=Number(x.currentChapter)||1;
  s.pve.progress=Number(x.chapterProgress)||0;
  s.pve.stage=Number(x.chapterStage)||1;
  s.pve.bossPending=Boolean(x.chapterBossUnlocked)&&Number(x.chapterProgress)>=100;
}
function resetFarmRun(){
  const s=S();
  // Boss remains unlocked/undefeated. Only ordinary chapter progress resets for farming.
  s.chapterProgress=0;
  s.chapterStage=1;
  s.chapterBossUnlocked=true;
  s.chapterBossDefeated=false;
  s.pve=s.pve||{};
  s.pve.progress=0;
  s.pve.stage=1;
  s.pve.bossPending=true;
  s.pve.bossActive=false;
  save();
}
function normalBattle(){
  ensure();sync();
  const s=S();
  if(Number(s.battleStones||0)<=0){
    window.BattleButton10052?.refresh?.();
    return;
  }
  // At 100% the skull owns the boss entry. Battle is now the farming route.
  if(Number(s.chapterProgress)>=100 && !s.chapterBossDefeated){
    resetFarmRun();
  }
  window.BattleFlow10051?.start?.();
  window.HomeRebuild?.startRunner?.(false);
}
function bossBattle(){
  ensure();sync();
  const s=S();
  if(Number(s.chapterProgress)<100)return;
  s.pve=s.pve||{};
  s.pve.bossPending=true;
  s.pve.bossActive=true;
  save();
  window.TerritoryUI?.show?.('bossBattle');
}
function patchHome(){
  if(window.HomeRebuild){
    const original=window.HomeRebuild.startRunner;
    window.HomeRebuild.startRunner=function(forceBoss){
      if(forceBoss){bossBattle();return;}
      normalBattle();
    };
    window.HomeRebuild.startChapterRun=normalBattle;
    window.HomeRebuild.openBoss=bossBattle;
    window.HomeRebuild.__original10053=original;
  }
}
function patchBattleFlow(){
  if(window.BattleFlow10051){
    window.BattleFlow10051.start=normalBattle;
    window.BattleFlow10051.openBoss=bossBattle;
  }
}
function patchBoss(){
  const original=document.getElementById('bfReward');
  if(!original)return;
  original.addEventListener('click',function(){},true);
}
function install(){
  ensure();patchHome();patchBattleFlow();
  // Re-patch after the runtime scripts finish booting.
  setTimeout(()=>{ensure();patchHome();patchBattleFlow();},250);
  setTimeout(()=>{ensure();patchHome();patchBattleFlow();},1000);
  window.BattleFlow10053={normalBattle,bossBattle,resetFarmRun};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
