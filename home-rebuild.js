/* TERITORY HOME FINAL 03
   The exact approved reference artwork is the ONLY visual HOME layer.
   No HTML HUD, side menus, combat UI or bottom navigation is drawn.
*/
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  function go(id){ if(typeof window.showScreen==='function') window.showScreen(id); }
  function action(name){
    switch(name){
      case 'home': go('home'); break;
      case 'inventory': case 'hero': go('inventory'); break;
      case 'battle': case 'quests': case 'events': case 'daily': case 'challenges': case 'streets': go('districts'); break;
      case 'game': go('game'); break;
      case 'arena': go('arena'); break;
      case 'shop': go('market'); break;
      case 'forge': if(window.openForgeV2) window.openForgeV2(); else go('market'); break;
      case 'friends': case 'sea': case 'clan': break;
    }
  }
  function hideLegacy(){
    document.querySelectorAll('.hud,.bottom-nav,.live-side-ui,.live-city-title,.live-city-time,.home-v2-scene,.g141-photo-controls,.home-v2-scene-image,.real-home-image').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
    });
  }
  function mount(){
    const home=$('#home'); if(!home) return;
    home.classList.add('home-reference-active');
    home.innerHTML=`
      <div id="homeReferenceHost" class="home-reference-host" aria-label="Teritory Game HOME">
        <img class="home-reference-image" src="territory_reference_bg.png?v=FINAL03" alt="Teritory Game">
        <div class="home-hitzones">
          <button class="hz l1" data-hz="events"></button><button class="hz l2" data-hz="daily"></button><button class="hz l3" data-hz="quests"></button><button class="hz l4" data-hz="friends"></button><button class="hz l5" data-hz="sea"></button>
          <button class="hz r1" data-hz="shop"></button><button class="hz r2" data-hz="forge"></button><button class="hz r3" data-hz="challenges"></button><button class="hz r4" data-hz="streets"></button><button class="hz r5" data-hz="arena"></button>
          <button class="hz b1" data-hz="home"></button><button class="hz b2" data-hz="inventory"></button><button class="hz b3" data-hz="hero"></button><button class="hz b4" data-hz="battle"></button><button class="hz b5" data-hz="quests"></button><button class="hz b6" data-hz="game"></button><button class="hz b7" data-hz="clan"></button>
        </div>
      </div>`;
    home.addEventListener('click',e=>{
      const b=e.target.closest('[data-hz]'); if(!b||!home.contains(b)) return;
      e.preventDefault(); e.stopPropagation(); action(b.dataset.hz);
    });
    hideLegacy();
    if(window.Telegram?.WebApp){try{Telegram.WebApp.expand();Telegram.WebApp.setHeaderColor('#07111b');Telegram.WebApp.setBackgroundColor('#07111b')}catch(e){}}
  }
  function boot(){mount();hideLegacy();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
