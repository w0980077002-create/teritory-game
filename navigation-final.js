/* Territory Game — UNIVERSAL MOBILE INPUT ROUTER
   One input owner for HOME + global navigation. Designed for Telegram Android/iOS WebView.
   Does not replace gameplay handlers inside Arena/Forge/Inventory; it only guarantees the tap reaches them.
*/
(function(){
'use strict';
const MAP={home:'home',inventory:'inventory',hero:'hero',battle:'battle',quests:'quests',games:'games',clan:'clan',market:'shop',casino:'games',districts:'quests',game:'games'};
let suppressClickUntil=0;
let lastAction='';
let lastRouteAt=0;

function show(id){
  id=MAP[id]||id;
  try{window.showScreen?.(id);}catch(_){ }
  sync();
}
function closeLayers(){
  try{window.HomeRebuild?.stopRunner?.();}catch(_){ }
  document.getElementById('runnerScreen')?.remove();
  try{window.ArenaGame?.close?.();}catch(_){ }
  document.getElementById('arenaModal')?.classList.remove('show');
  document.querySelectorAll('.forge-v2-overlay').forEach(x=>x.remove());
}
function nav(id){
  id=MAP[id]||id;
  if(id==='battle'){
    closeLayers();
    window.HomeRebuild?.startRunner?.(false);
  }else if(id==='arena'){
    window.ArenaGame?.open?.();
  }else{
    closeLayers(); show(id);
  }
}

/* HOME action fallback. The real HOME file owns these actions too; this router is the
   second, deterministic path used when Android WebView misses the transparent button. */
const HOME={
 profile:()=>show('hero'), coins:()=>info('ЗОЛОТО','Монеты: '+num('coins')),
 gems:()=>info('АЛМАЗЫ','Алмазы: '+num('gems')), redgems:()=>info('КРАСНЫЕ КРИСТАЛЛЫ','Кристаллы: '+num('redGems')),
 trophy:()=>info('РЕЙТИНГ','Рейтинг игрока.'), messages:()=>info('СООБЩЕНИЯ','Сообщения.'), settings:()=>info('НАСТРОЙКИ','Настройки игры.'),
 energy:()=>info('ЭНЕРГИЯ',num('energy')+'/'+num('maxEnergy')), energyBottom:()=>info('ЭНЕРГИЯ',num('energy')+'/'+num('maxEnergy')),
 hp:()=>info('ЗДОРОВЬЕ',num('hp')+'/'+num('maxHp')),
 attack:()=>window.HomeRebuild?.startRunner?.(false), chapter:()=>show('map'),
 skull:()=>window.HomeRebuild?.openBoss?.(),
 events:()=>show('quests'), daily:()=>show('quests'), quests:()=>show('quests'), friends:()=>show('quests'),
 sea:()=>show('shop'), shop:()=>show('shop'), forge:()=>window.ForgeV2?.open?.(), challenges:()=>window.ArenaGame?.open?.(), streets:()=>show('quests'), arena:()=>window.ArenaGame?.open?.(),
 equipment:()=>show('inventory'), equip1:()=>show('inventory'), equip2:()=>show('inventory'), equip3:()=>show('inventory'), equip4:()=>show('inventory'), equip5:()=>show('inventory'), equip6:()=>show('inventory'), equip7:()=>show('inventory'),
 quest:()=>show('quests'), speed:()=>info('УСКОРЕНИЕ','Ускорение боя.'), refresh:()=>info('ОБНОВИТЬ','Задание обновлено.'), crown:()=>info('НАГРАДЫ','Награды.'), star:()=>info('ПРЕМИУМ','Премиум.'),
 home:()=>show('home'), inventory:()=>show('inventory'), hero:()=>show('hero'), battle:()=>window.HomeRebuild?.startRunner?.(false), games:()=>show('games'), clan:()=>show('clan')
};

function num(k){return Math.floor(Number(window.TerritoryStore?.state?.[k])||0).toLocaleString('ru-RU')}
function info(title,body){
 const m=document.getElementById('modal'),b=document.getElementById('modalBody');
 if(!m||!b)return;
 b.innerHTML='<h2>'+title+'</h2><p>'+body+'</p>';
 m.classList.add('show');
}
function fireHome(action){
 const fn=HOME[action];
 if(typeof fn!=='function')return false;
 suppressClickUntil=performance.now()+650;lastAction=action;
 try{fn();}catch(err){console.error('[Territory input]',action,err)}
 return true;
}

/* Exact same reference coordinates as HOME hitzones. If the invisible DOM button is
   missed by the WebView, the tap is still routed from its screen coordinates. */
const Z=[
['profile',0,0,18,6.2],['coins',18,0,24,6.2],['gems',42,0,20,6.2],['redgems',62,0,14,6.2],['trophy',76,0,7,6.2],['messages',83,0,8,6.2],['settings',91,0,9,6.2],
['energy',28,5.2,37,3.2],['attack',65,5.2,35,3.2],['chapter',28,9,44,5.2],
['events',.4,9,10.5,6.3],['daily',.4,15.8,10.5,6.3],['quests',.4,22.7,10.5,6.3],['friends',.4,29.5,10.5,6.3],['sea',.4,36.4,10.5,7],
['shop',89,9,10.5,6.3],['forge',89,15.8,10.5,6.3],['challenges',89,22.7,10.5,6.3],['streets',89,29.5,10.5,6.3],['arena',89,36.4,10.5,7],
['hp',0,64,17,12],['equip1',17,64,9.4,12],['equip2',26.4,64,9.4,12],['equip3',35.8,64,9.4,12],['equip4',45.2,64,9.4,12],['equip5',54.6,64,9.4,12],['equip6',64,64,9.4,12],['equip7',73.4,64,9.4,12],['energyBottom',83,64,17,12],
['quest',0,84,52,6.8],['speed',61,83.5,8.5,7],['refresh',70,83.5,8.5,7],['crown',79,83.5,9,7],['star',88.5,83.5,11.5,7],['skull',55,18,13,10],
['home',0,91,14.28,9],['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],['quests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9]
];
function isHome(){return (document.body.dataset.screen||'home')==='home'&&!document.getElementById('arenaModal')?.classList.contains('show')&&!document.getElementById('runnerScreen');}
function homePointAction(e){
 if(!isHome())return null;
 const host=document.getElementById('homeReferenceHost')||document.getElementById('home');
 if(!host)return null;
 const r=host.getBoundingClientRect(); if(!r.width||!r.height)return null;
 const x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
 for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(x>=z[1]&&x<=z[1]+z[3]&&y>=z[2]&&y<=z[2]+z[4])return z[0];}
 return null;
}
function direct(el){
 if(!el)return false;
 const g=el.closest?.('[data-global-nav]');if(g){nav(g.dataset.globalNav);return true;}
 const h=el.closest?.('[data-home]');if(h){show('home');return true;}
 const s=el.closest?.('[data-screen]');if(s){show(s.dataset.screen);return true;}
 const f=el.closest?.('[data-fj-nav]');if(f){nav(f.dataset.fjNav);return true;}
 const p=el.closest?.('[data-pve-nav]');if(p){nav(p.dataset.pveNav);return true;}
 const r=el.closest?.('[data-roadmap]');if(r){show('map');return true;}
 return false;
}

function handlePointer(e){
 if(performance.now()-lastRouteAt<140)return;
 if(direct(e.target)){
   lastRouteAt=performance.now();suppressClickUntil=performance.now()+650;e.preventDefault();e.stopImmediatePropagation();return;}
 const hz=e.target?.closest?.('.hz');
 if(hz&&isHome()){
   if(fireHome(hz.dataset.action)){lastRouteAt=performance.now();e.preventDefault();e.stopImmediatePropagation();return;}
 }
 const a=homePointAction(e);
 if(a&&fireHome(a)){lastRouteAt=performance.now();e.preventDefault();e.stopImmediatePropagation();return;}
}
function ensureNav(){
 let n=document.getElementById('hardMobileNav');
 if(!n){
  n=document.createElement('nav');n.id='hardMobileNav';n.setAttribute('aria-label','Основная навигация');
  n.innerHTML=[['home','⌂','Город'],['inventory','🎒','Инвентарь'],['hero','⚔','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🛡','Клан']].map(x=>`<button type="button" data-global-nav="${x[0]}"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('');
  document.body.appendChild(n);
 }
 sync();
}
function sync(){
 const n=document.getElementById('hardMobileNav');if(!n)return;
 const screen=MAP[document.body.dataset.screen||'home']||'home';
 const overlay=!!document.getElementById('runnerScreen')||document.getElementById('arenaModal')?.classList.contains('show');
 n.style.display=(screen!=='home'||overlay)?'grid':'none';
 n.querySelectorAll('[data-global-nav]').forEach(b=>b.classList.toggle('active',b.dataset.globalNav===screen));
}

/* Android/iOS: pointerdown is the primary path, touchstart is a fallback. */
document.addEventListener('pointerdown',handlePointer,true);
document.addEventListener('touchstart',handlePointer,{capture:true,passive:false});
document.addEventListener('click',e=>{
 if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}
 if(direct(e.target)){e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('DOMContentLoaded',ensureNav);
document.addEventListener('territory:screen',sync);
document.addEventListener('territory:render',sync);
window.addEventListener('resize',sync);

const st=document.createElement('style');st.textContent=`
#hardMobileNav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;width:100vw!important;height:auto!important;box-sizing:border-box!important;z-index:2147483000!important;display:none;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:5px 4px calc(5px + env(safe-area-inset-bottom));background:#07111b;border-top:2px solid #b99548;box-shadow:0 -8px 28px #000b;pointer-events:auto!important;touch-action:manipulation!important}
#hardMobileNav button{box-sizing:border-box!important;min-width:0!important;width:auto!important;height:58px!important;margin:0!important;border:1px solid #435665;border-radius:10px;background:#10202c;color:#fff;padding:3px 1px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-weight:900;font-size:18px;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
#hardMobileNav button i{font-style:normal;font-size:18px;line-height:18px}#hardMobileNav button span{font-size:8px;line-height:10px;white-space:nowrap}#hardMobileNav button.active{border-color:#d1ad55;background:#2a2114;color:#f2d77d}
/* Android WebView hit-test fix: transparent buttons stay fully hit-testable. */
.home-hitzones,.home-bottom-zones{pointer-events:none!important;z-index:2147482000!important}.home-hitzones .hz,.home-bottom-zones .hz{pointer-events:auto!important;opacity:1!important;color:transparent!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;display:block!important;visibility:visible!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
#homeReferenceHost{position:absolute!important;inset:0!important;touch-action:manipulation!important}
.screen.panel{z-index:2}.screen.panel header,.screen.panel button{position:relative;z-index:20;pointer-events:auto!important;touch-action:manipulation!important}
`;
document.head.appendChild(st);
window.TerritoryNavigate=nav;
window.TerritoryNavigation={navigate:nav,sync,fireHome,homePointAction};
})();
