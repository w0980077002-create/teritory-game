/* 10052 — reliable HOME battle button + visible combat-stone status */
(function(){
'use strict';

function store(){ return window.TerritoryStore?.state || {}; }
function stones(){
  const s=store();
  if(!Number.isFinite(Number(s.battleStones))) s.battleStones=30;
  return Math.max(0,Number(s.battleStones));
}
function save(){ window.TerritoryStore?.saveNow?.('battle-stones-init-10052'); }

function ensure(){
  const home=document.getElementById('home');
  if(!home) return;

  let btn=document.getElementById('battleTapFix10052');
  if(!btn){
    btn=document.createElement('button');
    btn.id='battleTapFix10052';
    btn.type='button';
    btn.setAttribute('aria-label','Бой');
    home.appendChild(btn);
    btn.addEventListener('pointerdown',function(e){
      e.preventDefault();
      e.stopPropagation();
      const n=stones();
      if(n<=0){
        showMessage('⚔️ БОЕВЫЕ КАМНИ ЗАКОНЧИЛИСЬ','Нужно восстановить боевые камни, чтобы продолжить прохождение.');
        return;
      }
      try{ window.HomeRebuild?.startRunner?.(false); }
      catch(_){ try{ window.BattleFlow10051?.start?.(); }catch(__){} }
    },{passive:false});
  }

  let badge=document.getElementById('battleStoneBadge10052');
  if(!badge){
    badge=document.createElement('div');
    badge.id='battleStoneBadge10052';
    home.appendChild(badge);
  }
  badge.textContent='⚔️ '+stones();

  if(!Number.isFinite(Number(store().battleStones))) save();
}

function showMessage(title,text){
  let m=document.getElementById('battleStoneMessage10052');
  if(!m){
    m=document.createElement('div');
    m.id='battleStoneMessage10052';
    m.innerHTML='<div><b></b><span></span><button>OK</button></div>';
    document.body.appendChild(m);
    m.querySelector('button').onclick=()=>m.classList.remove('show');
  }
  m.querySelector('b').textContent=title;
  m.querySelector('span').textContent=text;
  m.classList.add('show');
}

document.addEventListener('DOMContentLoaded',ensure,{once:true});
window.addEventListener('territory:render',ensure);
window.addEventListener('territory:state-changed',ensure);
window.BattleButton10052={refresh:ensure};
setTimeout(ensure,300);
})();
