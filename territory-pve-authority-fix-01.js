/* Territory PvE Authority FIX 01 — completion ordering
 * Do not edit PvE combat visuals/math here.
 * The existing client battle may advance its local state when "Продолжить" is pressed,
 * while the server completion endpoint validates the pre-battle chapter/stage.
 * This bridge completes the server session BEFORE allowing local continuation.
 */
(function(){
  'use strict';
  if(window.__territoryPveAuthorityFix01)return;
  window.__territoryPveAuthorityFix01=true;

  const qs=q=>document.querySelector(q);
  const qsa=q=>Array.from(document.querySelectorAll(q));
  let busy=false;
  let equipRequested=false;

  function state(){return window.TerritoryStore?.state||{}}
  function save(reason){try{window.TerritoryStore?.saveNow?.(reason||'pve-authority-fix01')}catch(_){} }

  function rememberEquip(){
    equipRequested=true;
  }

  function equipServerLoot(){
    if(!equipRequested)return;
    equipRequested=false;
    const s=state(), items=Array.isArray(s.inventoryItems)?s.inventoryItems:[];
    const item=items[0];
    if(!item||item.source!=='pve')return;
    const map={weapon:0,helmet:1,armor:2,belt:3,boots:4,ring:5,amulet:6};
    const slot=map[item.type];
    if(slot===undefined)return;
    s.equipment=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);
    while(s.equipment.length<7)s.equipment.push(null);
    const old=s.equipment[slot];
    s.equipment[slot]=item;
    s.inventoryItems=items.filter(x=>x!==item);
    if(old)s.inventoryItems.unshift(old);
    save('pve-equip-authority-fix01');
  }

  async function finishAndContinue(button){
    if(busy)return;
    const A=window.TerritoryPveAuthorityComplete08;
    if(!A||typeof A.completeSession!=='function'){
      console.warn('[Territory] PvE authority fix: completion bridge is unavailable');
      return;
    }
    busy=true;
    button.disabled=true;
    try{
      // The result screen is reached before the legacy "Continue" handler mutates
      // chapter progress/stage. Complete the server session while those fields
      // still describe the session that was just won.
      await A.completeSession();
      equipServerLoot();
      const s=state();
      const bossDone=!!s.chapterBossDefeated && !s.chapterBossUnlocked;
      const progress=Math.max(0,Number(s.chapterProgress)||0);
      const nextStage=Math.max(1,Math.min(4,Number(s.chapterStage)||1));
      try{window.PvEBattle?.close?.(true)}catch(_){}
      if(bossDone){
        window.TerritoryNavigation?.sync?.();
        return;
      }
      if(progress>=100){
        window.TerritoryNavigation?.sync?.();
        return;
      }
      // Server completion has already advanced chapterStage/progress. Starting
      // the next battle now creates the next authoritative server session.
      setTimeout(()=>{try{window.PvEBattle?.start?.(nextStage)}catch(e){console.warn(e)}},60);
    }catch(e){
      console.warn('[Territory] PvE authority fix failed:',e?.message||e);
      button.disabled=false;
    }finally{
      setTimeout(()=>{busy=false},80);
    }
  }

  function bridgeReady(){
    const A=window.TerritoryPveAuthorityComplete08;
    if(!A||typeof A.completeSession!=='function')return false;
    if(A.__fix01Wrapped)return true;
    const old=A.completeSession;
    A.completeSession=async function(){
      try{await window.TerritoryPveTranscript08?.flush?.()}catch(_){}
      return old.apply(this,arguments);
    };
    A.__fix01Wrapped=true;
    return true;
  }

  function install(){
    bridgeReady();
    setInterval(bridgeReady,250);
    // Mark an equip choice but let the existing UI perform its local preview.
    document.addEventListener('click',e=>{
      if(e.target.closest('.pve-battle .loot-equip'))rememberEquip();
    },true);

    // Replace only the continuation action. All attack/skill/consumable controls
    // remain untouched.
    document.addEventListener('click',e=>{
      const b=e.target.closest('.pve-battle .loot-next');
      if(!b)return;
      if(busy){e.preventDefault();e.stopImmediatePropagation();return}
      e.preventDefault();
      e.stopImmediatePropagation();
      finishAndContinue(b);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
