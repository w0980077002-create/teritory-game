/* 10054 — stable chapter run, two incoming bots, boss-loss farming */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const pct=()=>Number(window.TerritoryChaptersAPI?.state?.()?.chapterProgress||S().chapterProgress||0);

function originalRunner(){
  return window.HomeRebuild?.__original10053 || window.HomeRebuild?.startRunner;
}

function startFarm(){
  const s=S();
  if(Number(s.battleStones||0)<=0){window.BattleButton10052?.refresh?.();return;}
  if(pct()>=100){
    // Boss stays undefeated; normal battle deliberately starts a new farming run.
    s.chapterProgress=0;s.chapterStage=1;s.chapterBossUnlocked=true;s.chapterBossDefeated=false;
    s.pve=s.pve||{};s.pve.progress=0;s.pve.stage=1;s.pve.bossPending=true;s.pve.bossActive=false;
    window.TerritoryStore?.saveNow?.('farm-after-boss-loss-10054');
  }
  const run=originalRunner();
  if(typeof run==='function') run.call(window.HomeRebuild,false);
}

function openBoss(){
  if(pct()<100)return;
  const s=S();s.pve=s.pve||{};s.pve.bossPending=true;s.pve.bossActive=true;
  window.TerritoryStore?.saveNow?.('boss-open-10054');
  window.TerritoryUI?.show?.('bossBattle');
}

function patch(){
  if(window.HomeRebuild){
    window.HomeRebuild.startRunner=startFarm;
    window.HomeRebuild.startChapterRun=startFarm;
    window.HomeRebuild.openBoss=openBoss;
  }
  if(window.BattleFlow10051){
    window.BattleFlow10051.start=startFarm;
    window.BattleFlow10051.openBoss=openBoss;
  }
}

function bossLossUI(){
  const result=document.getElementById('bfResult');
  if(!result)return;
  const title=document.getElementById('bfResultTitle');
  const btn=document.getElementById('bfReward');
  if(title?.textContent.includes('ПОВЕРЖЕН')){
    if(btn)btn.textContent='ДАЛЬШЕ: БОЙ';
  }
}
function install(){
  setTimeout(patch,0);setTimeout(patch,250);setTimeout(patch,1000);
  document.addEventListener('click',e=>{
    const hz=e.target.closest?.('.hz');
    if(hz&&hz.dataset.action==='battle'){
      e.preventDefault();e.stopImmediatePropagation();startFarm();return;
    }
    if(e.target.closest?.('#mapChapterSkull')){
      e.preventDefault();e.stopImmediatePropagation();
      if(pct()>=100)openBoss();return;
    }
    if(e.target.closest?.('#bfReward')){
      const title=document.getElementById('bfResultTitle');
      if(title?.textContent.includes('ПОВЕРЖЕН')){
        e.preventDefault();e.stopImmediatePropagation();
        window.TerritoryUI?.show?.('home');
        setTimeout(patch,100);
        return;
      }
    }
  },true);
  const mo=new MutationObserver(bossLossUI);
  mo.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.BattleFlow10054={startFarm,openBoss};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
