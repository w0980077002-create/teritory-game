/* TERRITORY — LIVE HOME HUD 02
   The master image is artwork only. All account/progression values come from
   the Telegram-authenticated server state. Before auth, show safe fresh-account
   values instead of leaking old localStorage values through the artwork.
*/
(function(){
'use strict';
if(window.TerritoryLiveHomeHUD02)return;
const safe={level:1,vip:0,coins:0,gems:0,red:0,energy:100,maxEnergy:100,hp:100,maxHp:100,xp:0,xpNext:100,chapter:1,stage:1,progress:0};
const A=()=>window.TerritoryTelegramAuth;
const N=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const F=v=>Math.floor(N(v)).toLocaleString('ru-RU');
const S=()=>window.TerritoryStore?.state||{};
function values(){
  const a=A(),s=S();
  if(a?.state!=='authenticated'||!window.__territoryServerHydrated55)return safe;
  return {
    level:N(s.level??s.profile?.level,1),vip:N(s.profile?.vip,0),coins:N(s.coins,0),gems:N(s.gems,0),red:N(s.redGems??s.redgems,0),
    energy:N(s.energy,100),maxEnergy:N(s.maxEnergy,100),hp:N(s.hp,100),maxHp:N(s.maxHp,100),xp:N(s.xp??s.exp,0),xpNext:N(s.xpNext??s.expToNext,100),
    chapter:N(s.currentChapter??s.pve?.chapter,1),stage:N(s.chapterStage??s.pve?.stage,1),progress:Math.round(Math.max(0,Math.min(100,N(s.chapterProgress??s.pve?.progress,0))))
  };
}
function host(){return document.querySelector('#home .home-reference-host')}
function make(){
  const h=host();if(!h)return null;
  let layer=h.querySelector('.territory-live-home-hud-02');if(layer)return layer;
  layer=document.createElement('div');layer.className='territory-live-home-hud-02';
  layer.innerHTML=`
   <div class="patch live02-profile-p1"></div><div class="patch live02-profile-p2"></div><div class="live live02-level" data-hud02="level"></div><div class="live live02-vip" data-hud02="vip"></div>
   <div class="patch live02-coins-p"></div><div class="live live02-coins" data-hud02="coins"></div>
   <div class="patch live02-gems-p"></div><div class="live live02-gems" data-hud02="gems"></div>
   <div class="patch live02-red-p"></div><div class="live live02-red" data-hud02="red"></div>
   <div class="patch live02-energy-p"></div><div class="live live02-energy" data-hud02="energy"></div>
   <div class="patch live02-chapter-p"></div><div class="live live02-chapter" data-hud02="chapter"></div>
   <div class="patch live02-xp-p"></div><div class="live live02-xp" data-hud02="xp"></div><div class="live live02-bottom-level" data-hud02="bottomLevel"></div>
   <div class="patch live02-hp-p"></div><div class="live live02-hp" data-hud02="hp"></div>
   <div class="patch live02-bottom-energy-p"></div><div class="live live02-bottom-energy" data-hud02="bottomEnergy"></div>
   <div class="patch live02-eq-p live02-eq-e1"></div><div class="patch live02-eq-p live02-eq-e2"></div><div class="patch live02-eq-p live02-eq-e3"></div><div class="patch live02-eq-p live02-eq-e4"></div><div class="patch live02-eq-p live02-eq-e5"></div><div class="patch live02-eq-p live02-eq-e6"></div>
   <div class="live live02-eq e1" data-hud02="eq1"></div><div class="live live02-eq e2" data-hud02="eq2"></div><div class="live live02-eq e3" data-hud02="eq3"></div><div class="live live02-eq e4" data-hud02="eq4"></div><div class="live live02-eq e5" data-hud02="eq5"></div><div class="live live02-eq e6" data-hud02="eq6"></div>
   <div class="patch live02-cons-p c1"></div><div class="patch live02-cons-p c2"></div><div class="patch live02-cons-p c3"></div><div class="patch live02-cons-p c4"></div>
   <div class="live live02-cons c1" data-hud02="c1"></div><div class="live live02-cons c2" data-hud02="c2"></div><div class="live live02-cons c3" data-hud02="c3"></div><div class="live live02-cons c4" data-hud02="c4"></div>
   <div class="patch live02-progress-p"></div><div class="live live02-progress" data-hud02="progress"></div>`;
  h.appendChild(layer);return layer;
}
function q(layer,k){return layer.querySelector('[data-hud02="'+k+'"]')}
function paint(){
  const layer=make();if(!layer)return;
  const v=values(),s=S();
  const vals={level:'Lv. '+F(v.level),vip:'VIP '+F(v.vip),coins:F(v.coins),gems:F(v.gems),red:F(v.red),energy:F(v.energy)+' / '+F(v.maxEnergy),hp:F(v.hp)+' / '+F(v.maxHp),bottomEnergy:F(v.energy)+' / '+F(v.maxEnergy),xp:F(v.xp)+' / '+F(v.xpNext),bottomLevel:'Lv. '+F(v.level),chapter:'Глава '+F(v.chapter)+' • Северные земли '+F(v.chapter)+'-'+F(v.stage),progress:v.progress+'%'};
  Object.entries(vals).forEach(([k,val])=>{const e=q(layer,k);if(e)e.textContent=val});
  const eq=Array.isArray(s.equipment)?s.equipment:[];for(let i=0;i<6;i++){const e=q(layer,'eq'+(i+1));if(e)e.textContent=(A()?.state==='authenticated'&&window.__territoryServerHydrated55)?(eq[i]?'Lv. '+F(eq[i].level||1):'—'):'—'}
  const c=s.consumables||{},keys=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];keys.forEach((k,i)=>{const e=q(layer,'c'+(i+1));if(e)e.textContent=(A()?.state==='authenticated'&&window.__territoryServerHydrated55)?F(c[k]):'0'});
}
function positionEqPatches(layer){
  ['e1','e2','e3','e4','e5','e6'].forEach((n,i)=>{const e=layer.querySelector('.live02-eq-e'+(i+1));if(e){e.style.left=[21,32.8,44.7,56.5,68.3,80.1][i]+'%';e.style.width='11%'}})
}
function boot(){paint();const mo=new MutationObserver(()=>{if(host()){positionEqPatches(make());paint()}});mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('territory:state-changed',paint);window.addEventListener('territory:telegram-authenticated',paint);window.addEventListener('territory:screen',paint);setInterval(paint,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.TerritoryLiveHomeHUD02={refresh:paint};
})();
