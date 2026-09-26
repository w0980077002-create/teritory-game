/* Territory Game — HOME input controller, single source of touch routing. */
(function(){
'use strict';

const MAP={home:'home',inventory:'inventory',hero:'hero',battle:'battle',quests:'quests',games:'games',clan:'clan',shop:'shop',map:'map',market:'shop',casino:'games',districts:'quests',game:'games'};

/* Coordinates are percentages of the actual HOME artwork viewport.
   They are aligned to the supplied reference screenshot (Telegram Android, 689px wide). */
const Z=[
 ['profile',0,0,18.2,7.0],
 ['coins',18,0,24,6.5],['gems',42,0,20,6.5],['redgems',62,0,14,6.5],['trophy',76,0,7,6.5],['messages',83,0,8,6.5],['settings',91,0,9,6.5],
 ['energy',28,5.0,37,3.8],['attack',65,5.0,35,4.0],
 ['chapter',27,9.0,46,6.0],['skull',55,18,13,10],
 /* left/right side buttons — deliberately separated so adjacent buttons cannot steal taps */
 ['events',0.5,10.5,10.8,6.6],['daily',0.5,17.7,10.8,6.7],['quests',0.5,24.8,10.8,7.0],['friends',0.5,32.0,10.8,7.1],['sea',0.5,39.6,10.8,7.5],
 ['shop',88.7,10.5,10.8,6.6],['forge',88.7,17.7,10.8,6.7],['challenges',88.7,24.8,10.8,7.0],['streets',88.7,32.0,10.8,7.1],['arena',88.7,39.6,10.8,9.0],
 ['hp',0,64,17,12],['equip1',17,64,9.4,12],['equip2',26.4,64,9.4,12],['equip3',35.8,64,9.4,12],['equip4',45.2,64,9.4,12],['equip5',54.6,64,9.4,12],['equip6',64,64,9.4,12],['equip7',73.4,64,9.4,12],['energyBottom',83,64,17,12],
 ['quest',0,84,52,6.8],['speed',61,83.5,8.5,7],['refresh',70,83.5,8.5,7],['crown',79,83.5,9,7],['star',88.5,83.5,11.5,7],
 ['home',0,90.2,14.28,9.6],['inventory',14.28,90.2,14.28,9.6],['hero',28.56,90.2,14.28,9.6],['battle',42.84,90.2,14.32,9.6],['quests',57.16,90.2,14.28,9.6],['games',71.44,90.2,14.28,9.6],['clan',85.72,90.2,14.28,9.6]
];

const HOME={
 profile:()=>show('hero'),
 coins:()=>info('ЗОЛОТО','Монеты: '+num('coins')),
 gems:()=>info('АЛМАЗЫ','Алмазы: '+num('gems')),
 redgems:()=>info('КРИСТАЛЛЫ','Кристаллы: '+num('redGems')),
 trophy:()=>info('РЕЙТИНГ','Рейтинг игрока.'),messages:()=>info('СООБЩЕНИЯ','Сообщения.'),settings:()=>info('НАСТРОЙКИ','Настройки игры.'),
 energy:()=>info('ЭНЕРГИЯ',num('energy')+'/'+num('maxEnergy')),energyBottom:()=>info('ЭНЕРГИЯ',num('energy')+'/'+num('maxEnergy')),hp:()=>info('ЗДОРОВЬЕ',num('hp')+'/'+num('maxHp')),
 attack:()=>window.HomeRebuild?.startRunner?.(false),chapter:()=>show('map'),skull:()=>window.HomeRebuild?.openBoss?.(),
 events:()=>show('quests'),daily:()=>show('quests'),quests:()=>show('quests'),friends:()=>show('quests'),sea:()=>show('shop'),shop:()=>show('shop'),forge:()=>window.ForgeV2?.open?.(),challenges:()=>window.ArenaGame?.open?.(),streets:()=>show('quests'),arena:()=>window.ArenaGame?.open?.(),
 equip1:()=>show('inventory'),equip2:()=>show('inventory'),equip3:()=>show('inventory'),equip4:()=>show('inventory'),equip5:()=>show('inventory'),equip6:()=>show('inventory'),equip7:()=>show('inventory'),
 quest:()=>show('quests'),speed:()=>info('УСКОРЕНИЕ','Ускорение боя.'),refresh:()=>info('ОБНОВИТЬ','Задание обновлено.'),crown:()=>info('НАГРАДЫ','Награды.'),star:()=>info('ПРЕМИУМ','Премиум.'),
 home:()=>show('home'),inventory:()=>show('inventory'),hero:()=>show('hero'),battle:()=>window.HomeRebuild?.startRunner?.(false),quests:()=>show('quests'),games:()=>show('games'),clan:()=>show('clan')
};

function num(k){return Math.floor(Number(window.TerritoryStore?.state?.[k])||0).toLocaleString('ru-RU')}
function info(title,body){const m=document.getElementById('modal'),b=document.getElementById('modalBody');if(!m||!b)return;b.innerHTML='<h2>'+title+'</h2><p>'+body+'</p>';m.classList.add('show')}
function show(id){id=MAP[id]||id;try{window.showScreen?.(id)}catch(e){console.error(e)}}
function homeActive(){return (document.body.dataset.screen||'home')==='home'&&!document.getElementById('runnerScreen')&&!document.getElementById('arenaModal')?.classList.contains('show')}
function point(e){
 if(!homeActive())return null;
 const host=document.getElementById('homeReferenceHost')||document.getElementById('home');if(!host)return null;
 const r=host.getBoundingClientRect();if(!r.width||!r.height)return null;
 const t=e.touches?.[0]||e.changedTouches?.[0]||e;
 const cx=Number(t.clientX),cy=Number(t.clientY);if(!Number.isFinite(cx)||!Number.isFinite(cy))return null;
 const x=(cx-r.left)/r.width*100,y=(cy-r.top)/r.height*100;
 for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(x>=z[1]&&x<=z[1]+z[3]&&y>=z[2]&&y<=z[2]+z[4])return z[0]}
 return null;
}
function fire(a){const f=HOME[a];if(typeof f!=='function')return false;try{f()}catch(err){console.error('[HOME action]',a,err)}return true}
function targetData(t){return t?.closest?.('[data-global-nav],[data-home],[data-screen],[data-fj-nav],[data-pve-nav],[data-roadmap]')}
function routeTarget(t){
 const el=targetData(t);if(!el)return false;
 if(el.dataset.globalNav){show(el.dataset.globalNav);return true}
 if(el.dataset.home!==undefined){show('home');return true}
 if(el.dataset.screen){show(el.dataset.screen);return true}
 if(el.dataset.fjNav){show(el.dataset.fjNav);return true}
 if(el.dataset.pveNav){show(el.dataset.pveNav);return true}
 if(el.dataset.roadmap!==undefined){show('map');return true}
 return false;
}

let lastHandledAt=0,lastAction='',lastX=-1,lastY=-1;
function handlePress(e){
 const now=Date.now();
 const t=e.touches?.[0]||e.changedTouches?.[0]||e;
 const x=Math.round(Number(t.clientX)||-1),y=Math.round(Number(t.clientY)||-1);
 if(now-lastHandledAt<90&&Math.abs(x-lastX)<8&&Math.abs(y-lastY)<8)return false;
 if(routeTarget(e.target)){
   lastHandledAt=now;lastAction='route';lastX=x;lastY=y;e.preventDefault();e.stopPropagation();return true;
 }
 const a=point(e);
 if(a&&fire(a)){lastHandledAt=now;lastAction=a;lastX=x;lastY=y;e.preventDefault();e.stopPropagation();return true;}
 const hz=e.target?.closest?.('.hz');
 if(hz&&homeActive()){
   const fallback=hz.dataset.action;if(fire(fallback)){lastHandledAt=now;lastAction=fallback;lastX=x;lastY=y;e.preventDefault();e.stopPropagation();return true;}
 }
 return false;
}
function onTouchStart(e){handlePress(e)}
function onPointerDown(e){if(e.pointerType==='touch'||e.pointerType==='pen')handlePress(e)}
function onClick(e){
 /* A touch produces a synthetic click after touchstart. The touch already did the job. */
 if(Date.now()-lastHandledAt<850){e.preventDefault();e.stopImmediatePropagation();return}
 if(routeTarget(e.target)){e.preventDefault();e.stopImmediatePropagation();}
}

document.addEventListener('touchstart',onTouchStart,{capture:true,passive:false});
document.addEventListener('pointerdown',onPointerDown,{capture:true,passive:false});
document.addEventListener('click',onClick,{capture:true});

/* Keep the artwork's own bottom navigation. Never manufacture a second row over it. */
const st=document.createElement('style');st.textContent=`
#hardMobileNav{display:none!important}
.home-reference-host,.home-reference-image{pointer-events:none!important}
.home-hitzones,.home-bottom-zones{pointer-events:none!important}
.home-hitzones .hz,.home-bottom-zones .hz{pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
.panel button,.panel [role="button"],.modal button,.arena-modal button{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
`;document.head.appendChild(st);

window.TerritoryNavigate={show,fire,point};
})();
