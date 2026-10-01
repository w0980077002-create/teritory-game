(function(){
'use strict';
const Store=()=>window.TerritoryStore?.state||{};
const N=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const fmt=n=>Math.floor(N(n)).toLocaleString('ru-RU');
const pick=(s,a,d)=>a.reduce((v,k)=>v!==undefined&&v!==null?v:k.split('.').reduce((x,p)=>x?.[p],s),undefined)??d;
const getEq=(s,i)=>Array.isArray(s.equipment)?s.equipment[i]:null;
function el(layer,cls){return layer.querySelector('.hud-'+cls)}
function ensure(){
 const host=document.getElementById('home')?.querySelector('.home-reference-host');if(!host)return null;
 let layer=host.querySelector('.territory-live-home-hud');if(layer)return layer;
 layer=document.createElement('div');layer.className='territory-live-home-hud';
 layer.innerHTML=`
  <div class="hud-mask hud-profile"></div><div class="hud-live hud-level" data-hud="level"></div><div class="hud-live hud-vip" data-hud="vip"></div>
  <div class="hud-mask hud-coins"></div><div class="hud-live hud-coins-text" data-hud="coins"></div>
  <div class="hud-mask hud-gems"></div><div class="hud-live hud-gems-text" data-hud="gems"></div>
  <div class="hud-mask hud-redgems"></div><div class="hud-live hud-redgems-text" data-hud="redgems"></div>
  <div class="hud-mask hud-energy"></div><div class="hud-live hud-energy-text" data-hud="energy"></div>
  <div class="hud-mask hud-chapter"></div><div class="hud-live hud-chapter-text" data-hud="chapter"></div>
  <div class="hud-mask hud-xp"></div><div class="hud-live hud-xp-text" data-hud="xp"></div><div class="hud-live hud-bottom-level" data-hud="bottom-level"></div>
  <div class="hud-mask hud-hp"></div><div class="hud-live hud-hp-text" data-hud="hp"></div>
  <div class="hud-mask hud-bottom-energy"></div><div class="hud-live hud-bottom-energy-text" data-hud="bottom-energy"></div>
  <div class="hud-mask hud-eq-mask e1"></div><div class="hud-mask hud-eq-mask e2"></div><div class="hud-mask hud-eq-mask e3"></div><div class="hud-mask hud-eq-mask e4"></div><div class="hud-mask hud-eq-mask e5"></div><div class="hud-mask hud-eq-mask e6"></div>
  <div class="hud-live hud-eq e1" data-hud="eq1"></div><div class="hud-live hud-eq e2" data-hud="eq2"></div><div class="hud-live hud-eq e3" data-hud="eq3"></div><div class="hud-live hud-eq e4" data-hud="eq4"></div><div class="hud-live hud-eq e5" data-hud="eq5"></div><div class="hud-live hud-eq e6" data-hud="eq6"></div>
  <div class="hud-mask hud-cons-mask c1"></div><div class="hud-mask hud-cons-mask c2"></div><div class="hud-mask hud-cons-mask c3"></div><div class="hud-mask hud-cons-mask c4"></div>
  <div class="hud-live hud-cons c1" data-hud="c1"></div><div class="hud-live hud-cons c2" data-hud="c2"></div><div class="hud-live hud-cons c3" data-hud="c3"></div><div class="hud-live hud-cons c4" data-hud="c4"></div>
  <div class="hud-mask hud-progress-mask"></div><div class="hud-live hud-progress" data-hud="progress"></div>`;
 host.appendChild(layer);return layer;
}
function paint(){
 const layer=ensure();if(!layer)return;
 const s=Store(),p=s.profile||{};
 const ch=N(pick(s,['currentChapter','pve.chapter'],1),1),stage=N(pick(s,['chapterStage','pve.stage'],1),1);
 const level=N(pick(s,['level','profile.level'],1),1),vip=N(pick(s,['profile.vip','vip'],0),0);
 const vals={level:'Lv. '+fmt(level),vip:'VIP '+fmt(vip),coins:fmt(s.coins),gems:fmt(s.gems),redgems:fmt(pick(s,['redGems','redgems'],0)),
  energy:fmt(s.energy)+' / '+fmt(Math.max(1,N(s.maxEnergy,100))),hp:fmt(s.hp)+' / '+fmt(Math.max(1,N(s.maxHp,100))),
  'bottom-energy':fmt(s.energy)+' / '+fmt(Math.max(1,N(s.maxEnergy,100))),
  xp:fmt(pick(s,['xp','exp'],0))+' / '+fmt(Math.max(1,N(pick(s,['xpNext','expToNext'],100),100))),
  'bottom-level':'Lv. '+fmt(level),
  chapter:'Глава '+fmt(ch)+' • Северные земли '+fmt(ch)+'-'+fmt(stage),
  progress:Math.round(Math.max(0,Math.min(100,N(pick(s,['chapterProgress','pve.progress'],0),0))))+'%'};
 Object.entries(vals).forEach(([k,v])=>{const n=el(layer,k);if(n)n.textContent=v});
 for(let i=0;i<6;i++){const q=getEq(s,i),n=el(layer,'eq'+(i+1));if(n)n.textContent=q?'Lv. '+fmt(q.level||1):'—'}
 const c=s.consumables||{},keys=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
 keys.forEach((k,i)=>{const n=el(layer,'c'+(i+1));if(n)n.textContent=fmt(c[k])});
}
function bind(){
 if(window.__territoryLiveHomeHudBound)return;window.__territoryLiveHomeHudBound=1;
 window.addEventListener('territory:state-changed',paint);window.addEventListener('territory:screen',paint);setInterval(paint,1000);
}
function boot(){bind();paint();setTimeout(paint,50);setTimeout(paint,250);setTimeout(paint,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.TerritoryLiveHomeHUD={refresh:paint};
})();