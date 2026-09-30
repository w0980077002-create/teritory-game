(function(){'use strict';
 if(window.TerritoryRewardAuthority12)return;
 const A=()=>window.TerritoryTelegramAuth,S=()=>window.TerritoryStore?.state||{};
 async function claim(kind,id){const a=A();if(!a||a.state!=='authenticated'||typeof a.api!=='function'){return false}
  try{const d=await a.api('/api/reward/claim',{method:'POST',body:JSON.stringify({kind,id})});
   if(d.state&&typeof d.state==='object')Object.assign(S(),d.state);
   if(d.player){S().coins=Math.max(0,Number(d.player.coins)||0);S().gems=Math.max(0,Number(d.player.gems)||0);S().level=Math.max(1,Number(d.player.level)||1);S().xp=Math.max(0,Number(d.player.xp)||0);}
   window.TerritoryStore?.saveNow?.('reward-authority12');window.dispatchEvent(new CustomEvent('territory:render'));return true;
  }catch(e){const el=document.getElementById('merchantLog');if(el)el.textContent=e.message||'Награда недоступна.';return true;}
 }
 document.addEventListener('click',function(e){const b=e.target?.closest?.('[data-daily],[data-weekly],[data-story-claim],[data-achievement]');if(!b)return;let kind,id;if(b.hasAttribute('data-daily')){kind='daily';id=b.dataset.daily}else if(b.hasAttribute('data-weekly')){kind='weekly';id=b.dataset.weekly}else if(b.hasAttribute('data-story-claim')){kind='story';id='current'}else{kind='achievement';id=b.dataset.achievement}
  e.preventDefault();e.stopImmediatePropagation();claim(kind,id);
 },true);
 window.TerritoryRewardAuthority12={claim};
})();
