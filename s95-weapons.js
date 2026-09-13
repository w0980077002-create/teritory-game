/* Territory S95 — weapon-aware combat effects
   Adds visual weapon classes and attack/block effects to the unified PvP scene.
*/
(()=>{'use strict';
const css=document.createElement('style');
css.textContent=`
#s95weapons{position:fixed;inset:0;z-index:100005;pointer-events:none;display:none}
.s95weapon{position:absolute;font-size:clamp(42px,13vw,92px);filter:drop-shadow(0 5px 8px #000);transition:transform .2s}
#s95wL{left:18%;bottom:31%}#s95wR{right:18%;bottom:31%;transform:scaleX(-1)}
.s95slash{position:absolute;width:45vw;height:9px;border-radius:50%;background:linear-gradient(90deg,transparent,#fff,transparent);
transform:rotate(-28deg);animation:s95slash .32s ease-out forwards;filter:drop-shadow(0 0 10px #fff)}
@keyframes s95slash{from{opacity:0;transform:translate(-25px,25px) rotate(-28deg) scaleX(.3)}50%{opacity:1}to{opacity:0;transform:translate(80px,-70px) rotate(-28deg) scaleX(1.2)}}
.s95impact{position:absolute;font-size:clamp(35px,11vw,70px);font-weight:950;animation:s95impact .55s forwards;text-shadow:0 3px 10px #000}
@keyframes s95impact{from{opacity:0;transform:scale(.4)}30%{opacity:1;transform:scale(1.15)}to{opacity:0;transform:translateY(-35px) scale(.9)}}
.s95shield{position:absolute;font-size:clamp(45px,14vw,90px);animation:s95shield .5s forwards}
@keyframes s95shield{0%{opacity:0;transform:scale(.5)}30%{opacity:1;transform:scale(1.15)}100%{opacity:0;transform:scale(1)}}
`;
document.head.appendChild(css);
const root=document.createElement('div');root.id='s95weapons';
root.innerHTML='<div id="s95wL" class="s95weapon">🪓</div><div id="s95wR" class="s95weapon">⚔️</div>';
document.body.appendChild(root);

const weaponMap={
  fists:'👊',
  iron_sword:'⚔️',
  viking_axe:'🪓',
  steel_armor:'🛡️',
  leather_belt:'🛡️'
};
function weaponFor(id){
 try{
   const p=window.TerritoryEquipment&&window.TerritoryEquipment[id];
   if(p)return p;
 }catch(_){}
 return weaponMap[id]||'⚔️';
}
function add(cls,text,x,y){
 const e=document.createElement('div');e.className=cls;e.textContent=text;
 e.style.left=x;e.style.top=y;root.appendChild(e);setTimeout(()=>e.remove(),800);
}
function show(m){
 if(!m)return;
 root.style.display='block';
 const aWeapon=m.attacker?.equipment?.weapon||'viking_axe';
 const dWeapon=m.defender?.equipment?.weapon||'iron_sword';
 document.querySelector('#s95wL').textContent=weaponMap[aWeapon]||'⚔️';
 document.querySelector('#s95wR').textContent=weaponMap[dWeapon]||'⚔️';
 const last=(m.log||[]).slice(-1)[0];
 if(!last)return;
 if(last.type==='attack'){
   const attackerIsA=last.text&&last.text.startsWith(m.attacker.name);
   const x=attackerIsA?'42%':'58%';
   const y='38%';
   add('s95slash','',x,y);
   add('s95impact','💥',x,y);
 }
 if(last.type==='crit')add('s95impact','⚡ КРИТ!', '39%','35%');
 if(last.type==='dodge')add('s95impact','💨', '43%','36%');
 if(last.type==='block')add('s95shield','🛡️','43%','36%');
 if(last.type==='finish')add('s95impact',m.winner===m.attacker.id?'🏆':'☠','42%','32%');
}
window.TerritoryS95={open:show,close:()=>root.style.display='none'};
window.openTerritoryS95=show;

/* Hook the unified controller when it exists. */
if(window.TerritoryS94){
 const old=window.TerritoryS94.update;
 window.TerritoryS94.update=(m)=>{if(old)old(m);show(m)};
 const oldOpen=window.TerritoryS94.open;
 window.TerritoryS94.open=(m)=>{if(oldOpen)oldOpen(m);show(m)};
}
})();