/* Territory Game — STEP-04-D2
   Repair: normal Arena matchmaking uses Arena's internal start() function,
   so wrapping ArenaGame.startBattle alone is not sufficient.
   This controller intercepts the matchmaking click in capture phase, projects
   the active follower into the fighter inputs, then restores persistent state.
*/
(function(){
  'use strict';

  const ROLE_STYLE={
    liabro:'crit',
    teralel:'tank',
    king_cows:'tank',
    mort:'dodge',
    stone_face:'resilience'
  };

  let restoreTimer=null;
  let projected=false;

  function state(){return window.TerritoryStore?.state||null}

  function active(){
    const s=state();
    const id=s?.followers?.activeFollower;
    const f=id&&window.Followers?.get?.(id);
    const cfg=id&&window.Followers?.CATALOG?.[id];
    return f?.owned&&cfg ? {id,data:f,cfg} : null;
  }

  function project(){
    if(projected)return null;
    const s=state(), f=active();
    if(!s||!f)return null;

    const stats=window.Followers?.getStats?.(f.id);
    if(!stats)return null;

    const old={
      strength:s.strength,
      defense:s.defense,
      maxHp:s.maxHp,
      hp:s.hp,
      loadout:s.arena?.loadout
    };

    const attackBonus=Math.max(0,Math.floor(Number(stats.attack||0)/4));
    const defenseBonus=Math.max(0,Math.floor(Number(stats.defense||0)/4));
    const hpBonus=Math.max(0,Math.floor(Number(stats.hp||0)/20));

    s.strength=Number(s.strength||0)+attackBonus;
    s.defense=Number(s.defense||0)+defenseBonus;
    s.maxHp=Number(s.maxHp||120)+hpBonus;
    s.hp=Math.min(s.maxHp,Number(s.hp||0)+hpBonus);

    s.arena=s.arena||{};
    if(ROLE_STYLE[f.id])s.arena.loadout=ROLE_STYLE[f.id];

    projected=true;
    return old;
  }

  function restore(old){
    if(!old)return;
    const s=state();
    if(!s)return;

    s.strength=old.strength;
    s.defense=old.defense;
    s.maxHp=old.maxHp;
    s.hp=old.hp;
    if(s.arena)s.arena.loadout=old.loadout;

    projected=false;
  }

  function projectForMatch(){
    const old=project();
    if(!old)return;

    clearTimeout(restoreTimer);
    /*
      Arena's own click handler runs synchronously after this capture handler.
      Give it one event-loop turn to construct its local fighter, then restore
      the persistent player state so follower bonuses never become permanent.
    */
    restoreTimer=setTimeout(()=>restore(old),0);
  }

  function decorate(){
    const f=active();
    const root=document.querySelector('.arena-battle');
    if(!f||!root)return;

    if(!root.querySelector('.active-follower-badge')){
      const p=root.querySelector('.player-wrap');
      if(p){
        const badge=document.createElement('div');
        badge.className='active-follower-badge';
        badge.innerHTML=
          `<span>${f.cfg.icon||'✦'}</span>`+
          `<b>${String(f.cfg.name)}</b>`+
          `<small>${String(f.cfg.role)} · ур.${f.data.level}</small>`;
        p.appendChild(badge);
      }
    }

    const header=root.querySelector('.battle-header');
    if(header&&!header.querySelector('.active-follower-header')){
      const info=document.createElement('span');
      info.className='active-follower-header';
      info.textContent=`${f.cfg.icon||'✦'} ${f.cfg.name} · ур.${f.data.level}`;
      header.appendChild(info);
    }
  }

  /*
    Capture phase is intentional: arena.js handles these clicks in a normal
    bubble-phase document listener. We must project first.
  */
  document.addEventListener('click',e=>{
    const t=e.target.closest?.('button');
    if(!t)return;

    if(t.dataset.arenaFind || t.dataset.profileFight){
      projectForMatch();
      setTimeout(decorate,10);
      setTimeout(decorate,60);
    }
  },true);

  /* Direct programmatic ArenaGame.startBattle calls are also supported. */
  function hookApi(){
    const api=window.ArenaGame;
    if(!api?.startBattle||api.startBattle.__followerD2)return;

    const original=api.startBattle;
    const wrapped=function(op,mode){
      const old=project();
      try{return original.call(this,op,mode)}
      finally{
        setTimeout(()=>restore(old),0);
        setTimeout(decorate,10);
      }
    };
    wrapped.__followerD2=true;
    api.startBattle=wrapped;
  }

  const observer=new MutationObserver(()=>{
    hookApi();
    decorate();
  });

  document.addEventListener('DOMContentLoaded',()=>{
    hookApi();
    observer.observe(document.body,{subtree:true,childList:true});
  });

  window.FollowerArena={
    active,
    project,
    restore,
    getAbilityState:function(){
      const f=active();
      if(!f)return null;
      const st=window.Followers?.getStats?.(f.id)||{};
      return {
        id:f.id,
        name:f.cfg.name,
        role:f.cfg.role,
        level:f.data.level,
        awakened:Boolean(f.data.awakened),
        critChance:Number(st.critChance||0),
        defense:Number(st.defense||0),
        heal:Number(st.heal||0),
        dodge:Number(st.dodge||0),
        control:Number(st.control||0)
      };
    }
  };
})();
