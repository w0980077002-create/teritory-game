/* Territory — 10-step PvE transcript client bridge. */
(function(){
'use strict';
if(window.TerritoryPveTranscript10)return;
const A=window.TerritoryTelegramAuth;let session=null,queue=Promise.resolve(),lastSent=0;
function send(action){if(!session?.id||!session?.nonce)return;const now=Date.now();if(now-lastSent<120)return;lastSent=now;const id=session.id,nonce=session.nonce;queue=queue.then(()=>A.api('/api/pve/action',{method:'POST',body:JSON.stringify({session_id:id,nonce,action})})).catch(()=>{})}
function wrap(){const P=window.PvEBattle;if(!P||P.__transcriptWrapped10)return;for(const name of ['attack','skill']){const original=P[name];if(typeof original!=='function')continue;P[name]=function(){send(name);return original.apply(this,arguments)}}P.__transcriptWrapped10=true}
function dom(){document.addEventListener('click',e=>{const b=e.target.closest?.('[data-consumable]');if(!b)return;const k=b.getAttribute('data-consumable');if(k)send(k)},true)}
window.TerritoryPveTranscript10={setSession(v){session=v&&typeof v==='object'?v:null},send};dom();setInterval(wrap,400);wrap();
})();
