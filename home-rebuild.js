/* TERITORY — EXACT REFERENCE HOME
   The supplied reference artwork is the single source of truth for HOME.
   No replacement HUD, scene, characters, equipment or navigation is generated.
   Transparent hit zones preserve the existing game navigation.
*/
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
  }

  function modal(title, body){
    const old=document.getElementById('referenceHomeModal');
    if(old) old.remove();
    const m=document.createElement('div');
    m.id='referenceHomeModal';
    m.className='rh-modal';
    m.innerHTML='<div class="rh-card"><button class="rh-close" type="button">×</button><div class="rh-icon">'+(title.icon||'✦')+'</div><h3>'+title.text+'</h3><div>'+body+'</div></div>';
    document.body.appendChild(m);
    m.querySelector('.rh-close').onclick=()=>m.remove();
    m.addEventListener('click',e=>{if(e.target===m)m.remove()});
  }

  function action(name){
    switch(name){
      case 'profile': case 'hero': case 'inventory': go('inventory'); break;
      case 'coins': modal({icon:'🪙',text:'Монеты'},'<p>Баланс героя.</p>'); break;
      case 'gems': modal({icon:'💎',text:'Алмазы'},'<p>Премиальная валюта героя.</p>'); break;
      case 'events': case 'bonus': case 'quest': case 'challenges': case 'streets': go('districts'); break;
      case 'friends': modal({icon:'👥',text:'Пригласить друзей'},'<p>Реферальная система Sdolars.</p>'); break;
      case 'sea': modal({icon:'⛵',text:'Морской набор'},'<p>Морские события и наборы.</p>'); break;
      case 'shop': go('market'); break;
      case 'blacksmith': if(window.openForgeV2) window.openForgeV2(); else go('market'); break;
      case 'arena': go('arena'); break;
      case 'game': go('game'); break;
      case 'battle': go('districts'); break;
      case 'quests': go('districts'); break;
      case 'clan': modal({icon:'🏰',text:'Клан'},'<p>Раздел клана.</p>'); break;
    }
  }

  function mount(){
    const home=$('#home');
    if(!home) return;
    home.classList.add('reference-home-active');
    home.innerHTML=`
      <div id="referenceHome" class="reference-home" aria-label="Sdolars — главный экран">
        <img class="reference-art" src="home-reference.png" alt="Sdolars HOME">
        <div class="reference-hotspots" aria-hidden="false">
          <button data-ref="profile" class="z z-profile" aria-label="Профиль"></button>
          <button data-ref="coins" class="z z-coins" aria-label="Монеты"></button>
          <button data-ref="gems" class="z z-gems" aria-label="Алмазы"></button>
          <button data-ref="events" class="z z-l1" aria-label="События"></button>
          <button data-ref="bonus" class="z z-l2" aria-label="Ежедневные награды"></button>
          <button data-ref="quest" class="z z-l3" aria-label="Задания"></button>
          <button data-ref="friends" class="z z-l4" aria-label="Пригласить друзей"></button>
          <button data-ref="sea" class="z z-l5" aria-label="Морской набор"></button>
          <button data-ref="shop" class="z z-r1" aria-label="Магазин"></button>
          <button data-ref="blacksmith" class="z z-r2" aria-label="Кузница"></button>
          <button data-ref="challenges" class="z z-r3" aria-label="Испытания"></button>
          <button data-ref="streets" class="z z-r4" aria-label="Захват улиц"></button>
          <button data-ref="arena" class="z z-r5" aria-label="Арена"></button>
          <button data-ref="inventory" class="z z-b1" aria-label="Инвентарь"></button>
          <button data-ref="hero" class="z z-b2" aria-label="Герой"></button>
          <button data-ref="battle" class="z z-b3" aria-label="Бой"></button>
          <button data-ref="quests" class="z z-b4" aria-label="Квесты"></button>
          <button data-ref="game" class="z z-b5" aria-label="Игры"></button>
          <button data-ref="clan" class="z z-b6" aria-label="Клан"></button>
        </div>
      </div>`;

    home.addEventListener('click',function(e){
      const b=e.target.closest('[data-ref]');
      if(!b || !home.contains(b)) return;
      e.preventDefault(); e.stopPropagation();
      action(b.dataset.ref);
    },true);

    if(window.Telegram?.WebApp){
      try{
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor('#07111b');
        window.Telegram.WebApp.setBackgroundColor('#07111b');
      }catch(e){}
    }
  }

  function boot(){
    const home=$('#home');
    if(!home) return;
    mount();
  }

  window.__sdolarsReferenceHomeBoot=boot;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
