/* Territory — SERVER COMBAT 10STEP bridge. */
(function(){
'use strict';
if(window.TerritoryPveServerCombat10)return;
const A=window.TerritoryTelegramAuth;let session=null,queue=Promise.resolve(),last=0;
function send(action){if(!session?.id||!session?.nonce||!A?.api)return Promise.resolve(null);const id=session.id,nonce=session.nonce;queue=queue.then(()=>A.api('/api/pve/action',{method:'POST',body:JSON.stringify({session_id:id,nonce,action})})).then(r=>{session.combat=r.combat||session.combat||null;if(r.combat?.result==='win')session.serverWin=true; if(r.combat?.result==='lose')session.serverLose=true;return r}).catch(e=>{session.serverError=e.message||String(e);return null});return queue}
function wrap(){const P=window.PvEBattle;if(!P||P.__serverCombatWrapped10)return;const oa=P.attack,os=P.skill;P.attack=function(type){const action=type==='power'?'skill:power':'attack';send(action);return oa.apply(this,arguments)};P.skill=function(kind){send('skill:'+(kind||'power'));return os.apply(this,arguments)};P.__serverCombatWrapped10=true}
function setSession(v){session=v&&typeof v==='object'?v:null}
window.TerritoryPveServerCombat10={setSession,send,getSession:()=>session};setInterval(wrap,300);wrap();
})();
