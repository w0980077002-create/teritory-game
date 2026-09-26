/* 10056 — HOME Battle hard-fix + real combat-stone button */
(function(){
'use strict';

const S=()=>window.TerritoryStore?.state||{};

function getStones(){
  const s=S();
  if(!Number.isFinite(Number(s.battleStones))) s.battleStones=30;
  return Math.max(0,Math.floor(Number(s.battleStones)));
}

function save(){
  window.TerritoryStore?.saveNow?.('battle-stones-10056');
}

function startBattle(){
  if(getStones()<=0){
    showMessage('⚔️ БОЕВЫЕ КАМНИ ЗАКОНЧИЛИСЬ','Без боевых камней прохождение ботов остановлено.');
    return;
  }

  try{
    if(typeof window.BattleFlow10054?.startFarm==='function'){
      window.BattleFlow10054.startFarm();
      return;
    }
    if(typeof window.HomeRebuild?.startRunner==='function'){
      window.HomeRebuild.startRunner(false);
      return;
    }
    if(typeof window.BattleFlow10051?.start==='function'){
      window.BattleFlow10051.start();
    }
  }catch(err){
    console.error('Battle start 10056:',err);
  }
}

function ensure(){
  const home=document.getElementById('home');
  if(!home)return;

  let hit=document.getElementById('battleTapFix10056');
  if(!hit){
    hit=document.createElement('button');
    hit.id='battleTapFix10056';
    hit.type='button';
    hit.setAttribute('aria-label','Бой');
    document.body.appendChild(hit);
    hit.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      startBattle();
    },true);
  }

  let stones=document.getElementById('battleStoneButton10056');
  if(!stones){
    stones=document.createElement('button');
    stones.id='battleStoneButton10056';
    stones.type='button';
    stones.innerHTML='<b>⚔️</b><span></span>';
    stones.setAttribute('aria-label','Боевые камни');
    document.body.appendChild(stones);
    stones.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      showMessage('⚔️ БОЕВЫЕ КАМНИ',`Осталось: ${getStones()}. Один удар расходует 1 камень.`);
    },true);
  }

  stones.querySelector('span').textContent=getStones();

  const isHome=(document.body.dataset.screen||'home')==='home';
  hit.style.display=isHome?'block':'none';
  stones.style.display=isHome?'flex':'none';

  if(!Number.isFinite(Number(S().battleStones)))save();
}

function showMessage(title,text){
  let m=document.getElementById('battleStoneMessage10056');
  if(!m){
    m=document.createElement('div');
    m.id='battleStoneMessage10056';
    m.innerHTML='<div><b></b><span></span><button>OK</button></div>';
    document.body.appendChild(m);
    m.querySelector('button').onclick=()=>m.classList.remove('show');
  }
  m.querySelector('b').textContent=title;
  m.querySelector('span').textContent=text;
  m.classList.add('show');
}

document.addEventListener('DOMContentLoaded',ensure);
window.addEventListener('territory:render',ensure);
window.addEventListener('territory:state-changed',ensure);
setInterval(ensure,1000);

window.BattleButton10056={refresh:ensure,start:startBattle};
})();
