/* TERITORY HOME FINAL 02
   The reference artwork is the single visual source of truth.
   No HTML HUD, side menus, equipment, combat bars or bottom nav are drawn.
   Transparent hit zones keep the baked reference screen interactive.
*/
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
  }

  function action(name){
    switch(name){
      case 'events': go('districts'); break;
      case 'daily': go('districts'); break;
      case 'quests': go('districts'); break;
      case 'friends': break;
      case 'sea': break;
      case 'shop': go('market'); break;
      case 'forge': if(window.openForgeV2) window.openForgeV2(); else go('market'); break;
      case 'challenges': go('districts'); break;
      case 'streets': go('districts'); break;
      case 'arena': go('arena'); break;
      case 'inventory': go('inventory'); break;
      case 'hero': go('inventory'); break;
      case 'battle': go('districts'); break;
      case 'game': go('game'); break;
      case 'clan': break;
      case 'home': go('home'); break;
    }
  }

  function hideLegacy(){
    document.querySelectorAll('.hud,.bottom-nav,.live-side-ui,.live-city-title,.live-city-time,.home-v2-scene,.g141-photo-controls,.real-home:not(#homeReferenceHost),.home-v2-scene-image').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
    });
  }

  function mount(){
    const home=$('#home');
    if(!home) return;
    home.classList.add('home-reference-active');
    home.innerHTML=`
      <div id="homeReferenceHost" class="home-reference-host" aria-label="Teritory Game — HOME">
        <img class="home-reference-image" src="territory_reference_bg.png" alt="Teritory Game">
        <div class="home-hitzones" aria-hidden="false">
          <button class="hz hz-left-1" data-hz="events" aria-label="События"></button>
          <button class="hz hz-left-2" data-hz="daily" aria-label="Ежедневные награды"></button>
          <button class="hz hz-left-3" data-hz="quests" aria-label="Задания"></button>
          <button class="hz hz-left-4" data-hz="friends" aria-label="Пригласить друзей"></button>
          <button class="hz hz-left-5" data-hz="sea" aria-label="Морской набор"></button>
          <button class="hz hz-right-1" data-hz="shop" aria-label="Магазин"></button>
          <button class="hz hz-right-2" data-hz="forge" aria-label="Кузница"></button>
          <button class="hz hz-right-3" data-hz="challenges" aria-label="Испытания"></button>
          <button class="hz hz-right-4" data-hz="streets" aria-label="Захват улиц"></button>
          <button class="hz hz-right-5" data-hz="arena" aria-label="Арена"></button>
          <button class="hz hz-bottom-1" data-hz="home" aria-label="Город"></button>
          <button class="hz hz-bottom-2" data-hz="inventory" aria-label="Инвентарь"></button>
          <button class="hz hz-bottom-3" data-hz="hero" aria-label="Герой"></button>
          <button class="hz hz-bottom-4" data-hz="battle" aria-label="Бой"></button>
          <button class="hz hz-bottom-5" data-hz="quests" aria-label="Квесты"></button>
          <button class="hz hz-bottom-6" data-hz="game" aria-label="Игры"></button>
          <button class="hz hz-bottom-7" data-hz="clan" aria-label="Клан"></button>
        </div>
      </div>`;

    home.addEventListener('click',function(e){
      const b=e.target.closest('[data-hz]');
      if(!b || !home.contains(b)) return;
      e.preventDefault(); e.stopPropagation();
      action(b.dataset.hz);
    });
    hideLegacy();
    if(window.Telegram?.WebApp){
      try{window.Telegram.WebApp.expand();window.Telegram.WebApp.setHeaderColor('#07111b');window.Telegram.WebApp.setBackgroundColor('#07111b');}catch(e){}
    }
  }

  function boot(){ mount(); hideLegacy(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
