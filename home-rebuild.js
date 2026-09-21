/* TERITORY HOME FINAL 04
   Exact approved HOME artwork + real transparent interaction map.
   The artwork remains the single visual source; this file only adds
   invisible hit areas and connects them to the existing game screens.
*/
(function(){
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const homeActions={};

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
  }

  function modal(title,body){
    document.querySelector('.tr4-modal')?.remove();
    const m=document.createElement('div');
    m.className='tr4-modal';
    m.innerHTML='<div class="tr4-card"><button class="tr4-x" type="button">×</button><h3></h3><p></p><button class="tr4-ok" type="button">Понятно</button></div>';
    m.querySelector('h3').textContent=title;
    m.querySelector('p').textContent=body;
    document.body.appendChild(m);
    const close=()=>m.remove();
    m.querySelector('.tr4-x').onclick=close;
    m.querySelector('.tr4-ok').onclick=close;
    m.addEventListener('click',e=>{if(e.target===m)close()});
  }

  function run(name){
    switch(name){
      case 'profile': go('inventory'); break;
      case 'coins': modal('🪙 Монеты','Раздел ресурсов готов.'); break;
      case 'gems': modal('💎 Кристаллы','Раздел ресурсов готов.'); break;
      case 'redgems': modal('♦️ Ресурс','Раздел ресурсов готов.'); break;
      case 'energy': modal('⚡ Энергия','Энергия героя.'); break;
      case 'trophy': modal('🏆 Достижения','Раздел достижений готов для подключения.'); break;
      case 'messages': modal('✉️ Сообщения','Центр сообщений.'); break;
      case 'settings': modal('⚙️ Настройки','Настройки игры.'); break;

      case 'events': case 'daily': case 'quests': case 'challenges': case 'streets':
        go('districts'); break;
      case 'friends': modal('👥 Друзья','Раздел приглашений друзей.'); break;
      case 'sea': modal('⛵ Морской набор','Раздел морских событий.'); break;
      case 'shop': go('market'); break;
      case 'forge': if(window.openForgeV2) window.openForgeV2(); else go('market'); break;
      case 'arena': go('arena'); break;

      case 'equipment': case 'inventory': case 'hero':
        go('inventory'); break;
      case 'consumable': modal('🧪 Предмет','Предмет можно использовать из инвентаря.'); break;
      case 'locked': modal('🔒 Заблокировано','Этот слот откроется по мере развития героя.'); break;
      case 'quest': go('districts'); break;

      case 'speed': modal('⏩ Скорость боя','Переключатель скорости боя.'); break;
      case 'refresh': modal('🔄 Бой','Обновление/повтор действия боя.'); break;
      case 'crown': modal('👑 Награда','Боевые награды.'); break;
      case 'star': modal('⭐ Бонус','Боевой бонус.'); break;

      case 'home': go('home'); break;
      case 'battle': go('districts'); break;
      case 'game': go('game'); break;
      case 'clan': modal('🏰 Клан','Раздел клана.'); break;
      case 'chapter': modal('🗺️ Глава 2','Северные земли 2-7.'); break;
    }
  }

  function hideLegacy(){
    document.querySelectorAll(
      '.hud,.bottom-nav,.live-side-ui,.live-city-title,.live-city-time,'+
      '.home-v2-scene,.g141-photo-controls,.home-v2-scene-image,.real-home-image'
    ).forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
    });
  }

  // Coordinates are percentages of the 942x1670 approved artwork.
  // The image is stretched to the exact HOME viewport so these never drift
  // outside the phone screen.
  const zones=[
    ['profile',0,0,27,8],
    ['coins',27,0,20,6.5],['gems',47,0,17,6.5],['redgems',64,0,16,6.5],
    ['trophy',80,0,9,7],['messages',89,0,6,7],['settings',95,0,5,7],
    ['energy',27,6.5,34,6.5],['chapter',22,10,56,9],

    ['events',0,8.5,12,11],['daily',0,19.5,12,11],['quests',0,30.5,12,11],
    ['friends',0,41.5,12,11],['sea',0,52.5,12,11],
    ['shop',88,8.5,12,11],['forge',88,19.5,12,11],['challenges',88,30.5,12,11],
    ['streets',88,41.5,12,11],['arena',88,52.5,12,11],

    ['hp',0,60,17,10],['energy',83,60,17,10],
    ['equipment',17,60,66,9],
    ['equipment',17,60,11,9],['equipment',28,60,11,9],['equipment',39,60,11,9],
    ['equipment',50,60,11,9],['equipment',61,60,11,9],['equipment',72,60,11,9],

    ['consumable',0,69,12,9],['consumable',12,69,12,9],['consumable',24,69,12,9],
    ['consumable',36,69,12,9],['locked',48,69,17,9],['locked',65,69,17,9],
    ['locked',82,69,18,9],

    ['quest',0,77.5,50,7],['speed',62,77,10,7],['refresh',72,77,10,7],
    ['crown',82,77,9,7],['star',91,77,9,7],

    ['home',0,88,14.3,12],['inventory',14.3,88,14.3,12],['hero',28.6,88,14.3,12],
    ['battle',42.9,87,14.3,13],['quests',57.2,88,14.3,12],['game',71.5,88,14.3,12],
    ['clan',85.8,88,14.2,12]
  ];

  function mount(){
    const home=$('#home');
    if(!home) return;

    home.classList.add('home-reference-active');
    home.innerHTML=`
      <div id="homeReferenceHost" class="home-reference-host" aria-label="Teritory Game HOME">
        <img class="home-reference-image" src="territory_reference_bg.png?v=FINAL04" alt="Teritory Game">
        <div class="home-hitzones" aria-hidden="false">
          ${zones.map((z,i)=>`<button class="hz hz-${i}" data-hz="${z[0]}" style="left:${z[1]}%;top:${z[2]}%;width:${z[3]}%;height:${z[4]}%" aria-label="${z[0]}"></button>`).join('')}
        </div>
      </div>`;

    home.addEventListener('click',e=>{
      const b=e.target.closest('[data-hz]');
      if(!b || !home.contains(b)) return;
      e.preventDefault();
      e.stopPropagation();
      run(b.dataset.hz);
    },true);

    hideLegacy();

    if(window.Telegram?.WebApp){
      try{
        Telegram.WebApp.expand();
        Telegram.WebApp.setHeaderColor('#07111b');
        Telegram.WebApp.setBackgroundColor('#07111b');
      }catch(e){}
    }
  }

  function boot(){ mount(); hideLegacy(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
