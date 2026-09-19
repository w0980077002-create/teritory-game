/* Territory G71 — Unified Battle Contract
   Technical event layer for PvE and Arena. It does not replace either combat engine.
   PvE and Arena keep their own rules; this module normalizes battle lifecycle events
   so a future authoritative server can consume the same event shape. */
(function(){'use strict';
 const Store=window.TerritoryStore; if(!Store)return;
 const VERSION='G71';
 const now=()=>Date.now();
 const makeId=()=>VERSION+'-'+now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const state=Store.state;
 state.g71=state.g71||{};
 state.g71.version=VERSION;
 state.g71.battleSeq=Math.max(0,Number(state.g71.battleSeq||0));
 state.g71.active=null;
 state.g71.lastResult=state.g71.lastResult||null;
 state.g71.history=Array.isArray(state.g71.history)?state.g71.history:[];
 const save=reason=>{try{Store.saveNow(reason||'g71')}catch(e){try{localStorage.setItem('territory_save_v1',JSON.stringify(state))}catch(_){} }};
 const emit=(type,payload={})=>{
   const event={id:makeId(),seq:++state.g71.battleSeq,type:String(type),payload:JSON.parse(JSON.stringify(payload)),at:now(),sessionId:state.g70?.sessionId||null};
   state.g71.history.push(event); if(state.g71.history.length>80)state.g71.history=state.g71.history.slice(-80);
   state.g71.lastResult=(type==='victory'||type==='defeat')?event:state.g71.lastResult;
   save('g71-event');
   window.dispatchEvent(new CustomEvent('territory:battle-event',{detail:event}));
   if(window.TerritoryServer?.localAction)window.TerritoryServer.localAction('battle.'+type,event.payload);
   return event;
 };
 const start=(mode,meta={})=>{state.g71.active={battleId:makeId(),mode:mode==='arena'?'arena':'pve',startedAt:now(),turn:0};return emit('start',{battleId:state.g71.active.battleId,mode:state.g71.active.mode,...meta});};
 const turn=(actor,target,meta={})=>{if(!state.g71.active)start(meta.mode||'pve');state.g71.active.turn++;return emit('turn',{battleId:state.g71.active.battleId,turn:state.g71.active.turn,actor,target,...meta});};
 const attack=(actor,target,zone,meta={})=>emit('attack',{battleId:state.g71.active?.battleId||null,actor,target,zone,...meta});
 const damage=(source,target,amount,meta={})=>emit('damage',{battleId:state.g71.active?.battleId||null,source,target,amount:Math.max(0,Number(amount)||0),...meta});
 const defense=(actor,zones,meta={})=>emit('defense',{battleId:state.g71.active?.battleId||null,actor,zones:Array.isArray(zones)?zones:[],...meta});
 const result=(type,meta={})=>{const e=emit(type==='victory'?'victory':'defeat',{battleId:state.g71.active?.battleId||null,...meta});state.g71.active=null;save('g71-result');return e;};
 const reward=(pack,meta={})=>emit('reward',{battleId:state.g71.active?.battleId||null,rewards:pack||{},...meta});
 const status=()=>({version:VERSION,active:state.g71.active,seq:state.g71.battleSeq,history:state.g71.history.length,lastResult:state.g71.lastResult});
 const api={version:VERSION,state,start,turn,attack,damage,defense,victory:(m)=>result('victory',m),defeat:(m)=>result('defeat',m),reward,status,emit};
 window.TerritoryBattle=api;
 // Bridge existing outcome counters into the contract without changing their rules.
 if(window.TerritoryCore){
   const core=window.TerritoryCore;
   if(typeof core.markPve==='function'){const original=core.markPve;core.markPve=function(win,boss){if(!state.g71.active)start('pve',{boss:!!boss}); if(win)result('victory',{mode:'pve',boss:!!boss}); else result('defeat',{mode:'pve',boss:!!boss}); return original.apply(this,arguments);};}
   if(typeof core.markArena==='function'){const originalA=core.markArena;core.markArena=function(win){if(!state.g71.active)start('arena'); if(win)result('victory',{mode:'arena'}); else result('defeat',{mode:'arena'}); return originalA.apply(this,arguments);};}
 }
 // Capture visible PvE action buttons as normalized attack/skill/consumable events.
 document.addEventListener('click',e=>{const b=e.target.closest('#tgPve [data-pve-a]');if(!b)return;const action=b.dataset.pveA||'unknown';if(!state.g71.active)start('pve');turn('player','enemy',{action});if(action==='attack')attack('player','enemy','manual',{action});},true);
 // Arena tactical controls: normalize target/confirm/leave actions; Arena remains authoritative for rules.
 document.addEventListener('click',e=>{const b=e.target.closest('#tgArena button,[data-arena-action]');if(!b)return;const label=(b.dataset.arenaAction||b.dataset.action||b.textContent||'').trim();if(!state.g71.active && /начать|старт|бой|сраж/i.test(label))start('arena');if(state.g71.active?.mode==='arena' && /ата|удар|подтверд/i.test(label))turn('player','target',{action:label});},true);
 save('g71-init');
})();
