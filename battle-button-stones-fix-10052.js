/* 10059 — HOME POINTER ROUTER
   Does not depend on transparent DOM hitboxes.
   Routes taps by coordinates at window capture phase. */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
let lockedUntil=0;

function homeActive(){
  return document.body?.dataset.screen==='home' || document.querySelector('#home.screen.active');
}
function appRect(){
  const a=document.getElementById('app');
  return a?.getBoundingClientRect();
}
function go(id){ window.showScreen?.(id); }
function arena(){
  if(window.ArenaGame?.open) return window.ArenaGame.open();
  let s=document.querySelector('script[data-arena-10059]');
  if(!s){
    s=document.createElement('script');
    s.src='arena.js?v=10059';
    s.dataset.arena10059='1';
    s.onload=()=>window.ArenaGame?.open?.();
    document.body.appendChild(s);
  }
}
function battle(){
  const st=S();
  if(st.battleStones==null){st.battleStones=30;window.TerritoryStore?.saveNow?.('stones-init-10059');}
  if(Number(st.battleStones)<=0){alert('⚔️ Боевые камни закончились.');return;}
  if(typeof window.BattleFlow10054?.startFarm==='function') return window.BattleFlow10054.startFarm();
  if(typeof window.BattleFlow10053?.normalBattle==='function') return window.BattleFlow10053.normalBattle();
  if(typeof window.HomeRebuild?.startRunner==='function') return window.HomeRebuild.startRunner(false);
  window.BattleFlow10051?.start?.();
}
function elixir(i){
  const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
  try{window.CombatItems?.use?.(ids[i]);}catch(_){}
}
function route(kind){
  if(kind==='battle')return battle();
  if(kind==='arena')return arena();
  if(kind==='inventory')return go('inventory');
  if(kind==='hero')return go('hero');
  if(kind==='quests')return go('quests');
  if(kind==='games')return go('games');
  if(kind==='clan')return go('clan');
  if(kind==='shop')return go('shop');
  if(kind==='forge')return window.ForgeV2?.open?.()||go('shop');
  if(kind==='chapter'||kind==='roadmap')return go('roadmap');
  if(kind==='chapterMap')return go('map');
  if(kind==='chapterSkull')return go(Number(S().pve?.progress||0)>=100?'bossBattle':'map');
  if(kind==='profile')return go('hero');
  if(kind.startsWith('gear')){S().equipment=Number(kind.slice(4));window.TerritoryStore?.saveNow?.('gear-10059');return;}
  if(kind.startsWith('elixir'))return elixir(Number(kind.slice(6)));
  if(['events','daily','friends','sea','challenges','streets'].includes(kind))return go('districts');
}

function zone(x,y){
  const z=[
   ['profile',0,0,27.5,8],['coins',27.5,0,18,7],['gems',45.5,0,18,7],['redgems',63.5,0,16,7],['trophy',79.5,0,6.5,7],['messages',86,0,7,7],['settings',93,0,7,7],
   ['energy',30,4.5,28,5],['chapter',30,9,41,6],
   ['events',0,9,14,8],['daily',0,16.5,14,8],['quests',0,24,14,8],['friends',0,31.5,14,8],['sea',0,39,14,8],
   ['shop',87,9,13,8],['forge',87,16.2,13,8],['challenges',87,23.4,13,8],['streets',87,30.6,13,8],['arena',87,38,13,8],
   ['hp',0,64,18,12],['gear0',18,64,10.6,12],['gear1',28.8,64,10.6,12],['gear2',39.6,64,10.6,12],['gear3',50.4,64,10.6,12],['gear4',61.2,64,10.6,12],['gear5',72,64,10.6,12],['energyBottom',83,64,17,12],
   ['elixir0',0,76,14.2,8],['elixir1',14.5,76,14.2,8],['elixir2',29,76,14.2,8],['elixir3',43.5,76,14.2,8],
   ['lock1',58,76,13.5,8],['lock2',72,76,13.5,8],['lock3',86,76,14,8],
   ['quest',0,84,51,7],['speed',61,83.7,8.5,7],['refresh',70.5,83.7,8.5,7],['crown',80,83.7,8.5,7],['star',89.5,83.7,10.5,7],
   ['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],['quests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9],['home',0,91,14.28,9]
  ];
  for(const q of z){
    if(x>=q[1]&&x<=q[1]+q[3]&&y>=q[2]&&y<=q[2]+q[4])return q[0];
  }
  return null;
}

window.addEventListener('pointerdown',function(e){
  if(!homeActive())return;
  const r=appRect();if(!r||r.width<10||r.height<10)return;
  const x=(e.clientX-r.left)/r.width*100;
  const y=(e.clientY-r.top)/r.height*100;
  const k=zone(x,y);
  if(!k)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  lockedUntil=performance.now()+700;
  route(k);
},{capture:true,passive:false});

window.addEventListener('click',function(e){
  if(performance.now()<lockedUntil){
    e.preventDefault();e.stopImmediatePropagation();
  }
},{capture:true});

window.addEventListener('territory:render',()=>{lockedUntil=0;});
})();