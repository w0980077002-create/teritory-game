/* Territory Fix 16 — re-entry/session hydration guard. */
(function(){
'use strict';
if(window.TerritorySessionGuard16)return;
const A=()=>window.TerritoryTelegramAuth;
let busy=false;
async function sync(){const a=A();if(!a||a.state!=='authenticated'||busy)return;busy=true;try{await a.refresh(true)}catch(e){a.lastSyncError=e?.message||String(e)}finally{busy=false}}
window.TerritorySessionGuard16={sync};
window.addEventListener('pageshow',()=>setTimeout(sync,150));
window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(sync,150)});
})();
