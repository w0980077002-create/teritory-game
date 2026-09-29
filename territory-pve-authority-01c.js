/* Territory FOUNDATION-01C — PvE reward authority bridge.
 * Server-issued battle session prevents reward replay and moves PvE currency awards
 * through the server economy ledger. It intentionally does not change battle math.
 */
(function(){
  'use strict';
  const A=()=>window.TerritoryTelegramAuth||{};
  const S=()=>window.TerritoryStore?.state||{};
  let sessions=[];
  let claiming=false;
  async function api(path, body){
    const tg=window.Telegram?.WebApp;
    const base=String(A().getServerUrl?.()||window.location.origin).replace(/\/$/,'');
    const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':tg?.initData||''},body:JSON.stringify(body||{})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
    return d;
  }
  async function begin(chapter,stage,boss){
    if(A().state!=='authenticated')return null;
    try{const d=await api('/api/pve/start',{chapter,stage,boss});sessions.push(d.session_id);return d.session_id;}catch(e){A().lastSyncError='PvE start: '+(e.message||e);return null}
  }
  async function claim(sessionId){
    if(!sessionId||claiming)return null; claiming=true;
    try{
      const d=await api('/api/pve/complete',{session_id:sessionId});
      if(d.economy){S().coins=Number(d.economy.coins)||0;S().gems=Number(d.economy.gems)||0;S().redGems=Number(d.economy.red_gems)||0;}
      window.TerritoryStore?.saveNow?.('foundation-01c-pve-reward');
      return d;
    }catch(e){A().lastSyncError='PvE reward: '+(e.message||e);return null}
    finally{claiming=false}
  }
  function install(){
    if(window.TerritoryPvEAuthority01c)return;
    const P=window.PvEBattle;
    if(!P)return setTimeout(install,300);
    const originalStart=P.start, originalBoss=P.startBoss;
    P.start=async function(stage){
      const s=S(); const sid=await begin(Number(s.currentChapter)||1,Number(stage)||Number(s.chapterStage)||1,false);
      const ok=originalStart.call(P,stage);
      if(!ok&&sid)await claim(sid).catch(()=>{});
      if(sid){sessions.push('ACTIVE:'+sid);}
      return ok;
    };
    P.startBoss=async function(){
      const s=S(); const sid=await begin(Number(s.currentChapter)||1,4,true);
      const ok=originalBoss.call(P);
      if(!ok&&sid)await claim(sid).catch(()=>{});
      if(sid)sessions.push('ACTIVE:'+sid);
      return ok;
    };
    let lastWins=Number(S().pve?.wins)||0,lastBoss=Number(S().pve?.bossDefeated)||0;
    window.addEventListener('territory:state-changed',async()=>{
      const s=S(),wins=Number(s.pve?.wins)||0,bosses=Number(s.pve?.bossDefeated)||0;
      if(wins>lastWins){lastWins=wins;const sid=sessions.find(x=>x&&x.indexOf('ACTIVE:')===0);if(sid){sessions=sessions.filter(x=>x!==sid);await claim(sid.slice(7));}}
      if(bosses>lastBoss){lastBoss=bosses;const sid=sessions.find(x=>x&&x.indexOf('ACTIVE:')===0);if(sid){sessions=sessions.filter(x=>x!==sid);await claim(sid.slice(7));}}
    });
    window.TerritoryPvEAuthority01c=true;
  }
  window.TerritoryPvEAuthority01c={begin,claim,install};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
