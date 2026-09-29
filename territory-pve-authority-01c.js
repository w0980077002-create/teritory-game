/* Territory — 10-step cumulative PvE authority bridge. */
(function(){
'use strict';
if(window.TerritoryPveAuthority10Step)return;
const A=window.TerritoryTelegramAuth;if(!A||A.state!=='authenticated')return;
let session=null,lastChapter=null,lastProgress=null,lastBoss=false,finishing=false;
const S=()=>window.TerritoryStore?.state||{};const save=()=>window.TerritoryStore?.saveNow?.('pve-authority-10step');
function loadTranscript(){if(window.TerritoryPveTranscript10)return;const src='territory-pve-authority-01d.js';if(!document.querySelector(`script[src="${src}"]`)){const sc=document.createElement('script');sc.src=src;document.body.appendChild(sc)}}
async function startSession(chapter,stage,boss){
 const s=S(),bonusBefore=Number(s.battleStonesBonus)||0,baseBefore=Number(s.battleStones)||0;
 const r=await A.api('/api/pve/start',{method:'POST',body:JSON.stringify({chapter,stage,boss:!!boss})});
 session={id:r.session_id,nonce:r.nonce,seed:r.seed,chapter:Number(chapter)||1,stage:Number(stage)||1,boss:!!boss};
 window.TerritoryPveTranscript10?.setSession?.(session);window.__territoryLastPveSessionId=session.id;
 if(r.state){const e={coins:s.coins,gems:s.gems,redGems:s.redGems};Object.assign(s,r.state);s.coins=e.coins;s.gems=e.gems;s.redGems=e.redGems;save()}
 if(bonusBefore>0)s.battleStonesBonus=(Number(s.battleStonesBonus)||0)+1;else if(baseBefore>0)s.battleStones=(Number(s.battleStones)||0)+1;save();return true;
}
async function completeSession(){if(!session||finishing)return;finishing=true;try{const r=await A.api('/api/pve/complete',{method:'POST',body:JSON.stringify({session_id:session.id})});if(r.state){const e={coins:S().coins,gems:S().gems,redGems:S().redGems};Object.assign(S(),r.state);if(r.player){S().coins=Number(r.player.coins)||0;S().gems=Number(r.player.gems)||0;S().redGems=Number(r.player.red_gems)||0}else{S().coins=e.coins;S().gems=e.gems;S().redGems=e.redGems}save()}window.TerritoryPveTranscript10?.setSession?.(null);session=null}catch(e){console.warn('[Territory] PvE completion:',e.message||e)}finally{finishing=false}}
function wrapStarts(){if(!window.PvEBattle||window.PvEBattle.__authorityWrapped10){if(!window.PvEBattle)return;const os=window.PvEBattle.start,ob=window.PvEBattle.startBoss;window.PvEBattle.start=async function(stage){const s=S();try{await startSession(s.currentChapter||1,stage||s.chapterStage||1,false)}catch(e){return false}return os(stage)};window.PvEBattle.startBoss=async function(){const s=S();try{await startSession(s.currentChapter||1,4,true)}catch(e){return false}return ob()};window.PvEBattle.__authorityWrapped10=true}}
function observe(){const s=S(),chapter=Number(s.currentChapter)||1,progress=Number(s.chapterProgress)||0,boss=!!s.chapterBossDefeated;if(lastChapter===null){lastChapter=chapter;lastProgress=progress;lastBoss=boss;return}if(session&&!finishing&&(progress>lastProgress||chapter>lastChapter||boss!==lastBoss))completeSession();lastChapter=chapter;lastProgress=progress;lastBoss=boss}
function boot(){loadTranscript();wrapStarts();setInterval(()=>{loadTranscript();wrapStarts();observe()},350)}
boot();window.TerritoryPveAuthority10Step={startSession,completeSession};
})();
