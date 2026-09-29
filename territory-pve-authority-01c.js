/* Territory — FOUNDATION-COMPLETE-01 PvE authority bridge.
 * One cumulative client-side bridge:
 * - asks server for a battle session before PvE starts;
 * - server consumes the battle stone;
 * - watches the existing PvE engine for a completed stage/boss;
 * - sends the session once for server-side reward;
 * - refreshes the server economy after reward.
 *
 * It intentionally does not rewrite the existing combat math.
 */
(function(){
'use strict';
if(window.TerritoryPveAuthorityComplete01)return;
const A=window.TerritoryTelegramAuth;
if(!A||A.state!=='authenticated')return;
let session=null,lastChapter=null,lastProgress=null,lastBoss=false,finishing=false;
const S=()=>window.TerritoryStore?.state||{};
async function startSession(chapter,stage,boss){
  const r=await A.api('/api/pve/start',{method:'POST',body:JSON.stringify({chapter,stage,boss:!!boss})});
  session={id:r.session_id,chapter:Number(chapter)||1,stage:Number(stage)||1,boss:!!boss};
  if(r.state) { const economy={coins:S().coins,gems:S().gems,redGems:S().redGems}; Object.assign(S(),r.state); S().coins=economy.coins;S().gems=economy.gems;S().redGems=economy.redGems;window.TerritoryStore?.saveNow?.('pve-authority-start') }
  return true;
}
async function completeSession(){
  if(!session||finishing)return;
  finishing=true;
  try{
    const r=await A.api('/api/pve/complete',{method:'POST',body:JSON.stringify({session_id:session.id})});
    if(r.player){S().coins=Number(r.player.coins)||0;S().gems=Number(r.player.gems)||0;S().redGems=Number(r.player.red_gems)||0;S().profile=S().profile||{};S().profile.vip=Number(r.player.vip)||0}
    session=null;window.TerritoryStore?.saveNow?.('pve-authority-reward');
  }catch(e){console.warn('[Territory] PvE reward sync failed:',e.message||e)}finally{finishing=false}
}
function wrapStarts(){
  if(!window.PvEBattle||window.PvEBattle.__authorityWrapped)return;
  const originalStart=window.PvEBattle.start,originalBoss=window.PvEBattle.startBoss;
  window.PvEBattle.start=async function(stage){
    const s=S();try{await startSession(s.currentChapter||1,stage||s.chapterStage||1,false)}catch(e){console.warn('[Territory] battle rejected:',e.message||e);return false}
    return originalStart(stage);
  };
  window.PvEBattle.startBoss=async function(){
    const s=S();try{await startSession(s.currentChapter||1,4,true)}catch(e){console.warn('[Territory] boss rejected:',e.message||e);return false}
    return originalBoss();
  };
  window.PvEBattle.__authorityWrapped=true;
}
function observe(){
  const s=S();const chapter=Number(s.currentChapter)||1,progress=Number(s.chapterProgress)||0,boss=!!s.chapterBossDefeated;
  if(lastChapter===null){lastChapter=chapter;lastProgress=progress;lastBoss=boss;return}
  if(session&&!finishing){
    if(progress>lastProgress||chapter>lastChapter||boss!==lastBoss)completeSession();
  }
  lastChapter=chapter;lastProgress=progress;lastBoss=boss;
}
function boot(){wrapStarts();setInterval(()=>{wrapStarts();observe()},350)}
boot();
window.TerritoryPveAuthorityComplete01={startSession,completeSession};
})();