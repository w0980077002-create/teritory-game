(function(){
'use strict';
if(window.TerritoryWorldAuthority13)return;
const A=()=>window.TerritoryTelegramAuth,S=()=>window.TerritoryStore?.state||{};
let pending=null,busy=false;
function apply(d){const s=S();if(d?.state&&typeof d.state==='object')Object.assign(s,d.state);if(d?.player){s.coins=Math.max(0,Number(d.player.coins)||0);s.gems=Math.max(0,Number(d.player.gems)||0);s.level=Math.max(1,Number(d.player.level)||1);s.xp=Math.max(0,Number(d.player.xp)||0);s.xpNext=Math.max(100,Number(d.player.xp_next)||100);s.profile=s.profile||{};s.profile.level=s.level;}window.TerritoryStore?.saveNow?.('world-authority13');window.dispatchEvent(new CustomEvent('territory:render'));}
async function claim(kind,data){const a=A();if(!a||a.state!=='authenticated'||typeof a.api!=='function'){const e=document.getElementById('merchantLog');if(e)e.textContent='Нужна авторизация Telegram.';return false}if(busy)return true;busy=true;try{const d=await a.api('/api/world/claim',{method:'POST',body:JSON.stringify({kind,data:data||{}})});apply(d);return true}catch(e){const el=document.getElementById('merchantLog');if(el)el.textContent=e.message||'Действие недоступно.';return true}finally{busy=false}}
function variantFor(npc){const mem=Object.values(S().worldMemories||{}).filter(m=>m.location&&m.location.startsWith(npc==='bjorn'?'bjorn_':npc==='astrid'?'astrid_':'einar_')).sort((a,b)=>(a.at||0)-(b.at||0))[0];const c=String(mem?.choice||'');if(npc==='bjorn')return ['armor','guard'].includes(c)?'armor':'blade';if(npc==='astrid')return c==='ambush'?'ambush':'track';return ['stone','touch'].includes(c)?'touch':'read'}
document.addEventListener('click',function(e){
 const t=e.target?.closest?.('button,[role="button"]');if(!t)return;
 let b;
 if((b=t.closest('[data-world-event]'))){e.preventDefault();e.stopImmediatePropagation();claim('world_event',{event_id:b.dataset.worldEvent,choice_id:b.dataset.worldChoice});return;}
 if((b=t.closest('[data-npc]'))){e.preventDefault();e.stopImmediatePropagation();claim('npc_interact',{npc_id:b.dataset.npc,action:b.dataset.action});return;}
 if((b=t.closest('[data-npc-quest]'))){e.preventDefault();e.stopImmediatePropagation();claim('npc_quest',{quest_id:b.dataset.npcQuest});return;}
 if((b=t.closest('[data-world-choice]'))&&b.closest('.world-scene')){e.preventDefault();e.stopImmediatePropagation();claim('location',{location_id:window.__territoryWorldLocation13||'',choice_id:b.dataset.worldChoice});return;}
 if((b=t.closest('[data-world-location]'))){window.__territoryWorldLocation13=b.dataset.worldLocation;return;}
 if((b=t.closest('[data-world-echo]'))){e.preventDefault();e.stopImmediatePropagation();claim('world_echo',{echo_id:b.dataset.worldEcho});return;}
 if((b=t.closest('[data-convergence]'))){e.preventDefault();e.stopImmediatePropagation();claim('npc_convergence',{path:b.dataset.convergence});return;}
 if((b=t.closest('[data-branch-choice]'))){e.preventDefault();e.stopImmediatePropagation();claim('branch',{choice_id:b.dataset.branchChoice});return;}
 if((b=t.closest('[data-frontier-choice]'))){e.preventDefault();e.stopImmediatePropagation();claim('frontier',{choice_id:b.dataset.frontierChoice});return;}
 if((b=t.closest('[data-frontier-after]'))){e.preventDefault();e.stopImmediatePropagation();claim('frontier_after',{choice_id:b.dataset.frontierAfter});return;}
 if((b=t.closest('[data-npc-story]'))){pending={kind:'npc_story',data:{npc_id:b.dataset.npcStory}};return;}
 if((b=t.closest('[data-npc-after]'))){pending={kind:'npc_after',data:{npc_id:b.dataset.npcAfter}};return;}
 if((b=t.closest('[data-npc-ending]'))){pending={kind:'npc_ending',data:{npc_id:b.dataset.npcEnding,variant:variantFor(b.dataset.npcEnding)}};return;}
 if(t.matches('[data-claim-npc-story]')){if(pending?.kind==='npc_story'){e.preventDefault();e.stopImmediatePropagation();claim(pending.kind,pending.data);pending=null;}return;}
 if(t.matches('[data-claim-npc-after]')){if(pending?.kind==='npc_after'){e.preventDefault();e.stopImmediatePropagation();claim(pending.kind,pending.data);pending=null;}return;}
 if(t.matches('[data-claim-npc-ending]')){if(pending?.kind==='npc_ending'){e.preventDefault();e.stopImmediatePropagation();claim(pending.kind,pending.data);pending=null;}return;}
 if(t.matches('[data-open-finale]')){if(!t.disabled){e.preventDefault();e.stopImmediatePropagation();claim('finale',{});}return;}
 if(t.matches('[data-open-convergence]'))return;
},true);
window.TerritoryWorldAuthority13={claim};
})();
