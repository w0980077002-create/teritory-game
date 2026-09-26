/* 10057 — FINAL HOME INPUT ROUTER
   Fixes HOME: БОЙ, АРЕНА, 6 equipment slots, 4 open elixir slots.
   Uses real transparent hit zones over the approved HOME art. */
(function(){
'use strict';

const S=()=>window.TerritoryStore?.state||{};

function home(){
  return document.getElementById('home');
}

function ensureArenaScript(){
  if(window.ArenaGame) return Promise.resolve();
  let s=document.querySelector('script[data-arena-loader-10057]');
  if(!s){
    s=document.createElement('script');
    s.src='arena.js?v=10057';
    s.async=false;
    s.dataset.arenaLoader10057='1';
    document.body.appendChild(s);
  }
  return new Promise(resolve=>{
    let n=0;
    const t=setInterval(()=>{
      if(window.ArenaGame || ++n>30){clearInterval(t);resolve();}
    },100);
  });
}

function startBattle(){
  const stones=Math.max(0,Math.floor(Number(S().battleStones??30)));
  if(stones<=0){
    alertStone();
    return;
  }
  try{
    if(typeof window.BattleFlow10054?.startFarm==='function'){
      window.BattleFlow10054.startFarm();
      return;
    }
    if(typeof window.BattleFlow10053?.normalBattle==='function'){
      window.BattleFlow10053.normalBattle();
      return;
    }
    if(typeof window.HomeRebuild?.startRunner==='function'){
      window.HomeRebuild.startRunner(false);
      return;
    }
    if(typeof window.BattleFlow10051?.start==='function'){
      window.BattleFlow10051.start();
    }
  }catch(e){ console.error('10057 battle start',e); }
}

async function openArena(){
  try{
    await ensureArenaScript();
    if(typeof window.ArenaGame?.open==='function'){
      window.ArenaGame.open();
    }else{
      alert('Арена ещё загружается. Нажми ещё раз.');
    }
  }catch(e){ console.error('10057 arena',e); }
}

function useElixir(id){
  try{
    if(typeof window.CombatItems?.use==='function'){
      window.CombatItems.use(id);
      return;
    }
    const s=S();
    s.consumables=s.consumables||{};
    const n=Number(s.consumables[id]||0);
    if(n>0){
      s.consumables[id]=n-1;
      window.TerritoryStore?.saveNow?.('home-elixir-10057');
      window.TerritoryStore?.render?.();
    }
  }catch(e){ console.error('10057 elixir',e); }
}

function selectGear(i){
  // HOME gear remains clickable without inventing a new screen.
  // If Arena is open later, arena.js handles its own loadout.
  try{
    window.TerritoryStore.state.equipment=i;
    window.TerritoryStore?.saveNow?.('home-equipment-'+i+'-10057');
  }catch(e){}
}

function makeButton(layer,id,left,top,width,height,fn,label){
  let b=layer.querySelector('#'+id);
  if(!b){
    b=document.createElement('button');
    b.id=id;
    b.type='button';
    b.setAttribute('aria-label',label||id);
    b.dataset.homeInput10057='1';
    layer.appendChild(b);
    b.addEventListener('pointerdown',e=>{
      e.preventDefault();
      e.stopPropagation();
    },{passive:false});
    b.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      fn();
    },true);
  }
  b.style.left=left+'%';
  b.style.top=top+'%';
  b.style.width=width+'%';
  b.style.height=height+'%';
  return b;
}

function ensure(){
  const h=home();
  if(!h)return;

  let layer=h.querySelector('#homeInputFix10057');
  if(!layer){
    layer=document.createElement('div');
    layer.id='homeInputFix10057';
    h.appendChild(layer);
  }

  // Battle — exactly the central bottom button.
  makeButton(layer,'homeBattle10057',42.84,90.2,14.32,9.5,startBattle,'Бой');

  // Arena — right-side HOME button.
  makeButton(layer,'homeArena10057',87,38,13,8,openArena,'Арена');

  // Six visible equipment/clothing slots.
  const gearLeft=[18,28.8,39.6,50.4,61.2,72];
  gearLeft.forEach((x,i)=>{
    makeButton(layer,'homeGear10057_'+i,x,64.0,10.1,11.5,()=>selectGear(i),'Снаряжение '+(i+1));
  });

  // Four visible/open consumable slots.
  const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
  const conLeft=[0,14.5,29,43.5];
  conLeft.forEach((x,i)=>{
    makeButton(layer,'homeElixir10057_'+i,x,76.0,14.2,8.0,()=>useElixir(ids[i]),'Эликсир '+(i+1));
  });

  // Combat stones: same visual footprint as the neighboring action tiles,
  // immediately LEFT of ×2.
  makeButton(layer,'homeStones10057',52.0,83.8,8.5,7.2,()=>{
    const n=Math.max(0,Math.floor(Number(S().battleStones??30)));
    alert('⚔️ Боевые камни: '+n+'\n1 удар = 1 камень.');
  },'Боевые камни');

  // Keep legacy 10056 transparent hit target from stealing input.
  const old=document.getElementById('battleTapFix10056');
  if(old) old.style.display='none';
}

function alertStone(){
  alert('⚔️ Боевые камни закончились.\nВосстанови камни, чтобы продолжить бой.');
}

function boot(){
  ensure();
  setTimeout(ensure,100);
  setTimeout(ensure,500);
  setTimeout(ensure,1500);
}
document.addEventListener('DOMContentLoaded',boot);
window.addEventListener('territory:render',ensure);
window.addEventListener('territory:state-changed',ensure);
window.HomeInput10057={refresh:ensure,startBattle,openArena};
})();
