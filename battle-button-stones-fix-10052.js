/* Territory Game — HOME INPUT FIX 10058 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const home=()=>document.getElementById('home');

function show(id){ window.showScreen?.(id); }

function loadArena(){
  if(window.ArenaGame?.open) return Promise.resolve();
  return new Promise(resolve=>{
    let s=document.querySelector('script[data-arena-10058]');
    if(!s){
      s=document.createElement('script');
      s.src='arena.js?v=10058';
      s.dataset.arena10058='1';
      s.onload=()=>resolve();
      s.onerror=()=>resolve();
      document.body.appendChild(s);
    }else{
      let n=0,t=setInterval(()=>{ if(window.ArenaGame || ++n>30){clearInterval(t);resolve();}},100);
    }
  });
}

function battle(){
  const st=S();
  if(st.battleStones==null){
    st.battleStones=30;
    window.TerritoryStore?.saveNow?.('battle-stones-init-10058');
  }
  if(Number(st.battleStones)<=0){
    alert('⚔️ Боевые камни закончились.');
    return;
  }
  if(typeof window.BattleFlow10054?.startFarm==='function') return window.BattleFlow10054.startFarm();
  if(typeof window.BattleFlow10053?.normalBattle==='function') return window.BattleFlow10053.normalBattle();
  if(typeof window.HomeRebuild?.startRunner==='function') return window.HomeRebuild.startRunner(false);
  window.BattleFlow10051?.start?.();
}

function arena(){ loadArena().then(()=>window.ArenaGame?.open?.()); }

function gear(i){
  const st=S();
  st.equipment=i;
  window.TerritoryStore?.saveNow?.('home-gear-10058');
  window.dispatchEvent(new CustomEvent('territory:state-changed'));
}

function elixir(i){
  const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
  try{ window.CombatItems?.use?.(ids[i]); }catch(_){}
}

function route(a){
  if(a==='battle') return battle();
  if(a==='arena') return arena();
  if(a==='inventory') return show('inventory');
  if(a==='hero') return show('hero');
  if(a==='quests') return show('quests');
  if(a==='games') return show('games');
  if(a==='clan') return show('clan');
  if(a==='shop') return show('shop');
  if(a==='forge') return window.ForgeV2?.open?.() || show('shop');
  if(a==='roadmap'||a==='chapter') return show('roadmap');
  if(a==='chapterMap') return show('map');
  if(a==='chapterSkull'){
    return show(Number(S().pve?.progress||0)>=100?'bossBattle':'map');
  }
  if(a==='profile') return show('hero');
  if(/^consumable[1-4]$/.test(a)) return elixir(Number(a.slice(-1))-1);
  if(['events','daily','friends','sea','challenges','streets'].includes(a)){
    return window.showScreen?.('districts') || alert('Раздел в разработке');
  }
}

const zones=[
 ['profile',0,0,27.5,8],['coins',27.5,0,18,7],['gems',45.5,0,18,7],['redgems',63.5,0,16,7],
 ['trophy',79.5,0,6.5,7],['messages',86,0,7,7],['settings',93,0,7,7],
 ['energy',30,4.5,28,5],['chapter',30,9,41,6],
 ['events',0,9,14,8],['daily',0,16.5,14,8],['quests',0,24,14,8],['friends',0,31.5,14,8],['sea',0,39,14,8],
 ['shop',87,9,13,8],['forge',87,16.2,13,8],['challenges',87,23.4,13,8],['streets',87,30.6,13,8],['arena',87,38,13,8],
 ['hp',0,64,18,12],['energyBottom',83,64,17,12],
 ['equipment0',18,64,10.6,12],['equipment1',28.8,64,10.6,12],['equipment2',39.6,64,10.6,12],
 ['equipment3',50.4,64,10.6,12],['equipment4',61.2,64,10.6,12],['equipment5',72,64,10.6,12],
 ['consumable1',0,76,14.2,8],['consumable2',14.5,76,14.2,8],['consumable3',29,76,14.2,8],['consumable4',43.5,76,14.2,8],
 ['lock1',58,76,13.5,8],['lock2',72,76,13.5,8],['lock3',86,76,14,8],
 ['quest',0,84,51,7],['speed',61,83.7,8.5,7],['refresh',70.5,83.7,8.5,7],['crown',80,83.7,8.5,7],['star',89.5,83.7,10.5,7],
 ['battle',42.84,90,14.32,10],['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],
 ['quests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9],['home',0,91,14.28,9]
];

function actionFor(id){
  if(id.startsWith('equipment')) return ()=>gear(Number(id.slice(-1)));
  return ()=>route(id);
}

function build(){
  const h=home();
  if(!h) return;
  let layer=document.getElementById('homeInputFix10058');
  if(!layer){
    layer=document.createElement('div');
    layer.id='homeInputFix10058';
    document.body.appendChild(layer);
  }
  layer.innerHTML='';
  zones.forEach(z=>{
    const b=document.createElement('button');
    b.type='button';
    b.setAttribute('aria-label',z[0]);
    b.style.left=z[1]+'%';
    b.style.top=z[2]+'%';
    b.style.width=z[3]+'%';
    b.style.height=z[4]+'%';
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
    b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();actionFor(z[0])();},true);
    layer.appendChild(b);
  });

  const stone=document.createElement('button');
  stone.type='button';
  stone.id='battleStone10058';
  stone.textContent='⚔️ '+Math.max(0,Math.floor(Number(S().battleStones??30)));
  stone.setAttribute('aria-label','Боевые камни');
  stone.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    alert('⚔️ Боевые камни: '+Math.max(0,Math.floor(Number(S().battleStones??30)))+'\n1 удар = 1 камень.');
  },true);
  layer.appendChild(stone);
}

function boot(){
  build();
  setTimeout(build,300);
  setTimeout(build,1000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('territory:render',build);
window.addEventListener('territory:state-changed',build);
window.HomeInputFix10058={build,battle,arena};
})();