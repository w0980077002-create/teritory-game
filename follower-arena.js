/* Territory Game — STEP-04-D Followers ↔ Arena integration
   Uses only public ArenaGame/TerritoryStore APIs. No Arena core rewrite.
*/
(function(){
  'use strict';

  const ROLE_STYLE = {
    liabro:'crit',
    teralel:'tank',
    king_cows:'tank',
    mort:'dodge',
    stone_face:'resilience'
  };

  function active(){
    const s=window.TerritoryStore?.state;
    const id=s?.followers?.activeFollower;
    return id && window.Followers?.get?.(id)?.owned
      ? {id, data:window.Followers.get(id), cfg:window.Followers.CATALOG[id]}
      : null;
  }

  function applyPassiveStats(){
    const f=active();
    const s=window.TerritoryStore?.state;
    if(!f||!s)return null;

    const stats=window.Followers.getStats?.(f.id);
    if(!stats)return null;

    /*
      Arena's current fighter builder reads player strength/defense/maxHp
      and arena loadout. We temporarily project the follower's role into
      those inputs only while the match is being created, then restore the
      player's persistent state immediately.
    */
    const old={
      strength:s.strength,
      defense:s.defense,
      maxHp:s.maxHp,
      hp:s.hp,
      loadout:s.arena?.loadout
    };

    s.strength=Number(s.strength||0)+Math.max(0,Math.floor(stats.attack/4));
    s.defense=Number(s.defense||0)+Math.max(0,Math.floor(stats.defense/4));
    s.maxHp=Number(s.maxHp||120)+Math.max(0,Math.floor(stats.hp/20));
    s.hp=Math.min(s.maxHp,Number(s.hp||0)+Math.max(0,Math.floor(stats.hp/20)));

    const style=ROLE_STYLE[f.id];
    if(style){
      s.arena=s.arena||{};
      s.arena.loadout=style;
    }

    return old;
  }

  function restore(old){
    const s=window.TerritoryStore?.state;
    if(!s||!old)return;
    s.strength=old.strength;
    s.defense=old.defense;
    s.maxHp=old.maxHp;
    s.hp=old.hp;
    if(s.arena)s.arena.loadout=old.loadout;
  }

  function decorateBattle(){
    const f=active();
    if(!f)return;
    const root=document.querySelector('.arena-battle');
    if(!root||root.querySelector('.active-follower-badge'))return;

    const p=root.querySelector('.player-wrap');
    if(p){
      const badge=document.createElement('div');
      badge.className='active-follower-badge';
      badge.innerHTML=`<span>${f.cfg?.icon||'✦'}</span><b>${String(f.cfg?.name||'Спутник')}</b><small>${String(f.cfg?.role||'')}</small>`;
      p.appendChild(badge);
    }

    const header=root.querySelector('.battle-header');
    if(header){
      const info=document.createElement('span');
      info.className='active-follower-header';
      info.textContent=`${f.cfg?.icon||'✦'} ${f.cfg?.name||'Спутник'} · ур.${f.data.level}`;
      header.appendChild(info);
    }
  }

  function hook(){
    if(!window.ArenaGame?.startBattle || window.ArenaGame.startBattle.__followerHooked)return;

    const original=window.ArenaGame.startBattle;
    function wrapped(op,mode){
      const old=applyPassiveStats();
      try{
        return original.call(window.ArenaGame,op,mode);
      }finally{
        restore(old);
        queueMicrotask(decorateBattle);
        setTimeout(decorateBattle,50);
      }
    }
    wrapped.__followerHooked=true;
    window.ArenaGame.startBattle=wrapped;
  }

  const mo=new MutationObserver(()=>{
    hook();
    decorateBattle();
  });

  document.addEventListener('DOMContentLoaded',()=>{
    hook();
    mo.observe(document.body,{subtree:true,childList:true});
  });

  window.FollowerArena={active,applyPassiveStats};
})();
