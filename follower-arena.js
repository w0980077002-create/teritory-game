/* Territory Game — Arena follower visual layer */
(function(){
  'use strict';
  const styleId='arenaFollowerVisualStyle';
  const css=`.arena-in-battle .battle-follower{position:absolute;z-index:25;width:68px;height:70px;display:grid;grid-template-rows:38px 14px 12px;place-items:center;pointer-events:none;filter:drop-shadow(0 5px 7px rgba(0,0,0,.65));text-shadow:0 2px 4px #000}.arena-in-battle .battle-follower .follower-aura{position:absolute;width:58px;height:58px;border-radius:50%;bottom:10px;background:radial-gradient(circle,rgba(232,199,107,.42),rgba(232,199,107,.08) 48%,transparent 72%);animation:followerPulse 1.2s ease-in-out infinite}.arena-in-battle .battle-follower .follower-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(232,199,107,.75);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.18),rgba(8,18,25,.9) 65%);font-size:24px;z-index:2}.arena-in-battle .battle-follower b{position:relative;font-size:7px;color:#fff;z-index:2;white-space:nowrap}.arena-in-battle .battle-follower small{position:relative;font-size:5.5px;color:#e8c76b;z-index:2;white-space:nowrap}.arena-in-battle .player-wrap .battle-follower{left:100%;bottom:20px;margin-left:2px}.arena-in-battle .bot-wrap .battle-follower{right:100%;bottom:20px;margin-right:2px}@keyframes followerPulse{0%,100%{transform:scale(.88);opacity:.65}50%{transform:scale(1.08);opacity:1}}@media(max-width:390px){.arena-in-battle .battle-follower{width:60px;height:66px}.arena-in-battle .battle-follower .follower-icon{width:34px;height:34px;font-size:21px}}`;
  function inject(){if(document.getElementById(styleId))return;const s=document.createElement('style');s.id=styleId;s.textContent=css;document.head.appendChild(s);}
  function playerData(){
    const id=window.TerritoryStore?.state?.followers?.activeFollower;
    const f=id&&window.Followers?.get?.(id),cfg=id&&window.Followers?.CATALOG?.[id];
    return f?.owned&&cfg?{id,name:cfg.name,role:cfg.role,icon:cfg.icon,level:f.level}:null;
  }
  function botData(){
    const wrap=document.querySelector('.bot-wrap'),id=wrap?.dataset.botFollowerId;
    const cfg=id&&window.Followers?.CATALOG?.[id];
    if(!cfg)return null;
    return{id,name:cfg.name,role:cfg.role,icon:cfg.icon,level:Math.max(1,Number(wrap?.querySelector('.fighter-name small')?.textContent?.replace(/\D/g,''))||1)};
  }
  function make(data,cls){const e=document.createElement('div');e.className=`battle-follower ${cls||''}`;e.dataset.followerId=data.id;e.innerHTML=`<div class="follower-aura"></div><div class="follower-icon">${data.icon||'✦'}</div><b>${data.name}</b><small>${data.role} · ур.${data.level}</small>`;return e;}
  function syncWrap(wrap,data,cls){
    if(!wrap)return;
    let e=wrap.querySelector(`.${cls}`);
    if(!data){e?.remove();return;}
    if(!e){e=make(data,cls);wrap.appendChild(e);return;}
    e.querySelector('.follower-icon').textContent=data.icon||'✦';e.querySelector('b').textContent=data.name;e.querySelector('small').textContent=`${data.role} · ур.${data.level}`;
  }
  function decorate(){
    inject();
    if(!document.querySelector('.arena-battle'))return;
    syncWrap(document.querySelector('.player-wrap'),playerData(),'follower-companion-player');
    syncWrap(document.querySelector('.bot-wrap'),botData(),'follower-companion-bot');
  }
  const observer=new MutationObserver(()=>decorate());
  document.addEventListener('DOMContentLoaded',()=>{decorate();observer.observe(document.body,{subtree:true,childList:true});});
  window.FollowerArena={decorate,active:playerData,getAbilityState(){const id=playerData()?.id,stats=id&&window.Followers?.getStats?.(id);return id?{id,stats}:null;}};
})();
