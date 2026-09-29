/* Territory — PvE transcript integrity bridge.
 * Keeps existing combat math/UI; sends a server-checked action transcript.
 */
(function(){
'use strict';
if(window.TerritoryPveTranscript08)return;
const A=window.TerritoryTelegramAuth;if(!A||A.state!=='authenticated')return;
let session=null,queue=Promise.resolve();
function send(action){if(!session?.id||!session?.nonce)return;const id=session.id,nonce=session.nonce;queue=queue.then(()=>A.api('/api/pve/action',{method:'POST',body:JSON.stringify({session_id:id,nonce,action})})).catch(e=>console.warn('[Territory] PvE transcript:',e.message||e));}
function wrap(){const P=window.PvEBattle;if(!P||P.__transcript08)return;for(const name of ['attack','skill','useElixir']){const original=P[name];if(typeof original!=='function')continue;P[name]=function(arg){const action=name==='skill'?(typeof arg==='string'?'skill:'+arg:'skill:power'):name==='useElixir'?(typeof arg==='string'?'elixir_'+arg:'elixir_hp'):'attack';send(action);return original.apply(this,arguments)}}P.__transcript08=true;}
function hook(){wrap();if(window.TerritoryPveAuthorityComplete08){const oldStart=window.TerritoryPveAuthorityComplete08.startSession;window.TerritoryPveAuthorityComplete08.startSession=async function(ch,st,boss){const ok=await oldStart.apply(this,arguments);return ok}}}
// The primary authority bridge exposes its current session through this optional hook when available.
window.TerritoryPveTranscript08={setSession(value){session=value&&typeof value==='object'?value:null},send};
setInterval(wrap,500);
})();
