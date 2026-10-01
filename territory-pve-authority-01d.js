/* Territory — PvE transcript transport, FINAL authority pass.
   This file intentionally does NOT wrap PvEBattle.attack/skill. The final
   authority controller owns those handlers and sends each action exactly once. */
(function(){
'use strict';
if(window.TerritoryPveTranscript08)return;
const A=window.TerritoryTelegramAuth;
if(!A||A.state!=='authenticated')return;
let session=null,queue=Promise.resolve(),lastError=null;

function setSession(value){session=value&&typeof value==='object'?value:null;lastError=null;queue=Promise.resolve();}
function sendAndGet(action){
 if(!session?.id||!session?.nonce)return Promise.resolve(null);
 const id=session.id,nonce=session.nonce;
 const job=queue.then(async()=>{
   try{
    const r=await A.api('/api/pve/action',{method:'POST',body:JSON.stringify({
      session_id:id,nonce,action
    })});
    return r;
   }catch(e){
    lastError=e;
    throw e;
   }
 });
 queue=job.catch(()=>undefined);
 return job;
}
window.TerritoryPveTranscript08={
 setSession,send:sendAndGet,sendAndGet,
 async flush(){await queue;if(lastError){const e=lastError;lastError=null;throw e}},
 getSession:()=>session
};
})();
