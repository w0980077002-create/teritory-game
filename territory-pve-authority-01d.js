/* Territory — PvE transcript integrity bridge, FIX 01. */
(function(){
'use strict';
if(window.TerritoryPveTranscript08)return;
const A=window.TerritoryTelegramAuth;if(!A||A.state!=='authenticated')return;
let session=null,queue=Promise.resolve();
function send(action){
  if(!session?.id||!session?.nonce)return Promise.resolve();
  const id=session.id,nonce=session.nonce;
  queue=queue.then(()=>A.api('/api/pve/action',{method:'POST',body:JSON.stringify({session_id:id,nonce,action})}))
    .catch(e=>console.warn('[Territory] PvE transcript:',e.message||e));
  return queue;
}
function wrap(){
  const P=window.PvEBattle;if(!P||P.__transcriptFix01)return;
  for(const name of ['attack','skill','useElixir']){
    const original=P[name];if(typeof original!=='function')continue;
    P[name]=function(arg){
      const action=name==='skill'?(typeof arg==='string'?'skill:'+arg:'skill:power'):
        name==='useElixir'?(typeof arg==='string'?'elixir_'+arg:'elixir_hp'):'attack';
      send(action);return original.apply(this,arguments)
    }
  }
  P.__transcriptFix01=true;
}
window.TerritoryPveTranscript08={
  setSession(value){session=value&&typeof value==='object'?value:null},
  send,
  flush(){return queue}
};
setInterval(wrap,500);
})();
