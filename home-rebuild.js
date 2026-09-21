/* Sdolars — FINAL HOME FOUNDATION v2
   Drop-in replacement for the existing home-rebuild.js.
   Keeps the approved HOME foundation and suppresses legacy HOME renderers.
*/
(function(){
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function hideLegacyHome(){
    $$('.real-home,.home-v2-scene,.home-v2-scene-image,.g141-photo-controls').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
    });
  }

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
  }

  function modal(title,body){
    const old=document.getElementById('homeFoundationModal'); if(old) old.remove();
    const m=document.createElement('div');
    m.id='homeFoundationModal';
    m.className='hr-modal';
    m.innerHTML='<div class="hr-modal-card"><button class="hr-modal-x" type="button" aria-label="Закрыть">×</button><div class="hr-modal-icon">'+(title.icon||'✦')+'</div><h3>'+title.text+'</h3><div class="hr-modal-body">'+body+'</div></div>';
    document.body.appendChild(m);
    m.querySelector('.hr-modal-x').onclick=()=>m.remove();
  }

  function action(name){
    switch(name){
      case 'profile': go('inventory'); break;
      case 'coins': modal({icon:'🪙',text:'Монеты'},'<p>Баланс героя.</p>'); break;
      case 'gems': modal({icon:'💎',text:'Алмазы'},'<p>Премиальная валюта героя.</p>'); break;
      case 'events': go('districts'); break;
      case 'bonus': modal({icon:'📅',text:'Ежедневные награды'},'<p>Раздел ежедневных наград будет подключён к общей системе прогресса.</p>'); break;
      case 'quest': go('districts'); break;
      case 'friends': modal({icon:'👥',text:'Пригласить друзей'},'<p>Реферальная система Sdolars.</p>'); break;
      case 'sea': modal({icon:'⛵',text:'Морской набор'},'<p>Специальные морские события и наборы.</p>'); break;
      case 'shop': go('market'); break;
      case 'blacksmith': if(window.openForgeV2) window.openForgeV2(); else go('market'); break;
      case 'challenges': go('districts'); break;
      case 'streets': go('districts'); break;
      case 'arena': go('arena'); break;
      case 'game': go('game'); break;
      case 'inventory': go('inventory'); break;
      case 'hero': go('inventory'); break;
      case 'battle': go('districts'); break;
      case 'quests': go('districts'); break;
      case 'clan': modal({icon:'🏰',text:'Клан'},'<p>Клан остаётся частью нижней навигации и будет подключён к общей системе.</p>'); break;
    }
  }

  function updateState(){
    const st=(window.TerritoryStore&&window.TerritoryStore.state)||{};
    const hp=Number(st.hp??120), max=Math.max(1,Number(st.maxHp??120));
    const energy=Number(st.energy??100);
    const xp=Number(st.exp??0), next=Math.max(100,Number(st.nextExp??100));
    const level=st.level??1, name=st.name||$('#playerName')?.textContent||'SSS';
    $$('[data-hf-name]').forEach(x=>x.textContent=name);
    $$('[data-hf-level]').forEach(x=>x.textContent=level);
    $$('[data-hf-hp-text]').forEach(x=>x.textContent=hp+'/'+max);
    $$('[data-hf-hp]').forEach(x=>x.style.width=Math.max(0,Math.min(100,hp/max*100))+'%');
    $$('[data-hf-energy]').forEach(x=>x.textContent=energy);
    $$('[data-hf-xp]').forEach(x=>x.style.width=Math.max(0,Math.min(100,xp/next*100))+'%');
    $$('[data-hf-xp-text]').forEach(x=>x.textContent=xp.toLocaleString('ru-RU')+' / '+next.toLocaleString('ru-RU')+' XP');
    $$('[data-hf-coins]').forEach(x=>x.textContent=st.coins??$('#coins')?.textContent??1000);
    $$('[data-hf-gems]').forEach(x=>x.textContent=st.gems??$('#gems')?.textContent??25);
  }

  function rebuildBottomNav(){
    const nav=$('.bottom-nav');
    if(!nav) return;
    nav.innerHTML=`
      <button data-screen="home">🏰<span>Город</span></button>
      <button data-screen="inventory">🎒<span>Инвентарь</span></button>
      <button data-screen="inventory">🛡️<span>Герой</span></button>
      <button data-screen="districts" class="bottom-primary">⚔️<span>Бой</span></button>
      <button data-screen="districts">📜<span>Квесты</span></button>
      <button data-screen="game">🎲<span>Игры</span></button>
      <button type="button" data-hf-bottom="clan">🏰<span>Клан</span></button>`;
    nav.style.setProperty('grid-template-columns','repeat(7,minmax(0,1fr))','important');
    nav.onclick=(e)=>{
      const b=e.target.closest('button');
      if(!b) return;
      const clan=b.dataset.hfBottom==='clan';
      if(clan){e.preventDefault(); action('clan'); return;}
      const screen=b.dataset.screen;
      if(screen) go(screen);
    };
  }

  function mount(){
    const home=$('#home');
    if(!home) return;

    home.classList.add('home-rebuild-host','home-foundation-active');
    home.innerHTML=`
      <div id="homeRebuild" class="home-rebuild home-foundation" aria-label="Sdolars — главный экран">
        <img class="hr-bg" src="territory_reference_bg.png" alt="Sdolars">
        <div class="hr-vignette"></div>

        <header class="hf-top">
          <button class="hf-profile" type="button" data-hf="profile">
            <span class="hf-avatar">⚔️</span>
            <span class="hf-player"><b data-hf-name>SSS</b><small>Уровень <strong data-hf-level>1</strong></small></span>
          </button>
          <div class="hf-resources">
            <button type="button" data-hf="coins">🪙 <b data-hf-coins>1000</b></button>
            <button type="button" data-hf="gems">💎 <b data-hf-gems>25</b></button>
          </div>
        </header>

        <div class="hf-stage">
          <small>ГЛАВА 2</small>
          <b>Северные земли 2-7</b>
          <div><i></i><i></i><i class="on"></i><i></i><i></i><span>☠</span></div>
        </div>

        <aside class="hf-side hf-left">
          <button data-hf="events"><span>🎁</span><b>События</b><small>Город</small></button>
          <button data-hf="bonus"><span>📅</span><b>Ежедневные</b><small>Награды</small></button>
          <button data-hf="quest"><span>📜</span><b>Задания</b><small>Квесты</small></button>
          <button data-hf="friends"><span>👥</span><b>Пригласить</b><small>Друзей</small></button>
          <button data-hf="sea"><span>⛵</span><b>Морской</b><small>Набор</small></button>
        </aside>

        <aside class="hf-side hf-right">
          <button data-hf="shop"><span>🛒</span><b>Магазин</b><small>Предметы</small></button>
          <button data-hf="blacksmith"><span>⚒️</span><b>Кузница</b><small>Экипировка</small></button>
          <button data-hf="challenges"><span>🏆</span><b>Испытания</b><small>Награды</small></button>
          <button data-hf="streets"><span>⚔️</span><b>Захват улиц</b><small>3д 12:20</small></button>
          <button data-hf="arena"><span>🛡️</span><b>Арена</b><small>PvP</small></button>
        </aside>

        <section class="hf-scene" aria-label="Герой и спутник">
          <div class="hf-companion"><span>🧙‍♀️</span><b>Спутник</b></div>
          <div class="hf-hero"><span>🧔🏻‍♂️</span><b data-hf-name>SSS</b></div>
          <div class="hf-enemy"><span>👹</span><i></i></div>
        </section>

        <section class="hf-combat">
          <div class="hf-orb hf-hp"><b data-hf-hp-text>120/120</b></div>
          <div class="hf-health"><div class="hf-level"><b data-hf-level>1</b></div><div class="hf-hp-track"><i data-hf-hp></i><span data-hf-hp-text>120/120</span></div></div>
          <div class="hf-orb hf-energy"><b data-hf-energy>100</b></div>
        </section>

        <section class="hf-xp">
          <span>EXP</span><div><i data-hf-xp></i></div><b data-hf-xp-text>0 / 100 XP</b><strong>Lv.<em data-hf-level>1</em></strong>
        </section>

        <section class="hf-equipment">
          <button data-hf="profile">🪓<small>Lv.102</small></button>
          <button data-hf="profile">🪖<small>Lv.98</small></button>
          <button data-hf="profile">🛡️<small>Lv.100</small></button>
          <button data-hf="profile">🥾<small>Lv.95</small></button>
          <button data-hf="profile">💍<small>Lv.97</small></button>
          <button data-hf="profile">🔮<small>Lv.101</small></button>
        </section>

        <section class="hf-slots" aria-label="Боевые расходники">
          <button data-hf="slot"><span>🧪</span><b>5/5</b><small>00:15</small></button>
          <button data-hf="slot"><span>💧</span><b>3/3</b><small>00:42</small></button>
          <button data-hf="slot"><span>⚡</span><b>2/5</b><small>01:10</small></button>
          <button data-hf="slot"><span>🛡️</span><b>1/5</b><small>00:35</small></button>
          <button class="locked"><span>🔒</span><small>Откроется позже</small></button>
          <button class="locked"><span>🔒</span><small>Откроется на репутации Арены</small></button>
          <button class="locked"><span>🔒</span><small>Откроется позже</small></button>
        </section>

        <section class="hf-quest" data-hf="quest">
          <span>📜</span><div><small>ТЕКУЩЕЕ ЗАДАНИЕ</small><b>Пройти Северные земли</b><i>0 / 1</i></div><button>›</button>
        </section>

        <nav class="hf-actions"><button>×2</button><button>↻</button><button>♛</button><button>✦</button></nav>
      </div>`;

    const click=(e)=>{
      const b=e.target.closest('[data-hf]');
      if(!b || !home.contains(b)) return;
      e.preventDefault(); e.stopPropagation();
      const n=b.dataset.hf;
      if(n==='slot'){modal({icon:'⚡',text:'Боевой слот'},'<p>Слот содержит до 5 одинаковых расходников и имеет собственный таймер. Использование не заменяет ход переодевания.</p>');return;}
      action(n);
    };
    home.addEventListener('click',click);
    rebuildBottomNav();
    updateState();
    hideLegacyHome();
    if(window.Telegram?.WebApp){
      try{window.Telegram.WebApp.expand();window.Telegram.WebApp.setHeaderColor('#10131a');window.Telegram.WebApp.setBackgroundColor('#07111b');}catch(e){}
    }
    if(!window.__sdolarsHomeFoundationTimer) window.__sdolarsHomeFoundationTimer=setInterval(updateState,1000);
  }

  function installCloseCore(){
    if(document.getElementById('territory-final-home-close-style')) return;
    const st=document.createElement('style');
    st.id='territory-final-home-close-style';
    st.textContent=`
      .hr-modal-x{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:50%!important;background:#05080c!important;color:#fff!important;display:grid!important;place-items:center!important;font:700 25px/1 Arial,sans-serif!important;box-shadow:0 5px 16px rgba(0,0,0,.5)!important;touch-action:manipulation!important}
      .hr-modal-card{position:relative!important}
      .hr-modal-x{position:absolute!important;right:10px!important;top:10px!important}
    `;
    document.head.appendChild(st);
  }

  function boot(){
    hideLegacyHome();
    installCloseCore();
    mount();
    hideLegacyHome();
  }

  // Expose the boot function for compatibility/diagnostics.
  window.__sdolarsHomeFoundationBoot=boot;

  // If a legacy renderer tries to add its HOME nodes later, hide them again.
  if(!window.__sdolarsHomeLegacyObserver){
    window.__sdolarsHomeLegacyObserver=new MutationObserver(hideLegacyHome);
    const startObserver=()=>{
      if(document.documentElement) window.__sdolarsHomeLegacyObserver.observe(document.documentElement,{childList:true,subtree:true});
      hideLegacyHome();
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',startObserver,{once:true});
    else startObserver();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
