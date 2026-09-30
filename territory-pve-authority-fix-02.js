/* Territory PvE Authority FIX 02 — safe completion ordering.
 * One bridge for authenticated PvE; guests keep the original local PvE flow.
 */
(function(){
'use strict';
if(window.__territoryPveAuthorityFix02)return;
window.__territoryPveAuthorityFix02=true;
let busy=false,equipRequested=false;
const qs=q=>document.querySelector(q);
function state(){return window.TerritoryStore?.state||{}}
function save(reason){try{window.TerritoryStore?.saveNow?.(reason||'pve-authority-fix02')}catch(_){}
}
function rememberEquip(){equipRequested=true}
function equipServerLoot(){
 if(!equipRequested)return;
 equipRequested=false;
 const s=state(),items=Array.isArray(s.inventoryItems)?s.inventoryItems:[],item=items.find(x=>x&&x.source==='pve');
 if(!item)return;
 const map={weapon:0,helmet:1,armor:2,belt:3,boots:4,ring:5,amulet:6},slot=map[item.type];
 if(slot===undefined)return;
 s.equipment=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);while(s.equipment.length<7)s.equipment.push(null);
 const old=s.equipment[slot];s.equipment[slot]=item;s.inventoryItems=items.filter(x=>x!==item);if(old)s.inventoryItems.unshift(old);save('pve-equip-authority-fix02');
}
function authorityReady(){
 const A=window.TerritoryPveAuthorityComplete08,a=window.TerritoryTelegramAuth;
 return !!(A&&typeof A.completeSession==='function'&&a&&a.state==='authenticated');
}
async function finishAndContinue(button){
 if(busy)return;
 if(!authorityReady())return;
 const A=window.TerritoryPveAuthorityComplete08,s=state();
 const beforeChapter=Number(s.currentChapter)||1;
 busy=true;button.disabled=true;
 try{
  await A.completeSession();
  equipServerLoot();
  const after=state(),chapter=Number(after.currentChapter)||beforeChapter,progress=Math.max(0,Number(after.chapterProgress)||0),nextStage=Math.max(1,Math.min(4,Number(after.chapterStage)||1));
  try{window.PvEBattle?.close?.(true)}catch(_){}
  if(chapter>beforeChapter||progress>=100){window.TerritoryNavigation?.sync?.();return}
  setTimeout(()=>{try{window.PvEBattle?.start?.(nextStage)}catch(e){console.warn('[Territory] next PvE stage:',e?.message||e)}},60);
 }catch(e){
  console.warn('[Territory] PvE authority fix failed:',e?.message||e);
  button.disabled=false;
 }finally{setTimeout(()=>{busy=false},80)}
}
function install(){
 document.addEventListener('click',e=>{if(e.target.closest('.pve-battle .loot-equip'))rememberEquip()},true);
 document.addEventListener('click',e=>{
  const b=e.target.closest('.pve-battle .loot-next');if(!b)return;
  // Guest/demo PvE remains untouched. Do not cancel the legacy handler unless
  // the authenticated authority session is actually available.
  if(!authorityReady())return;
  if(busy){e.preventDefault();e.stopImmediatePropagation();return}
  e.preventDefault();e.stopImmediatePropagation();finishAndContinue(b);
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
