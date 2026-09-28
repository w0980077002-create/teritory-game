/* Territory Game — NEW NAVIGATION CORE 10070
   Fresh navigation layer. No coordinate event guessing, no legacy gesture stack.
   Replaces home-router.js and disables the old 10052 input router by file replacement.
*/
(function(){
  'use strict';
  if(window.__TERRITORY_NEW_NAV_10070__) return;
  window.__TERRITORY_NEW_NAV_10070__=true;

  const KEY='territory-nav-10070';
  let restoring=false;
  let active='home';

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function screenExists(id){ return !!document.getElementById(id); }
  function hideGameOverlays(){
    try{window.ArenaGame?.close?.()}catch(_){ }
    try{window.PvEBattle?.close?.()}catch(_){ }
    try{window.PvEFlow?.close?.()}catch(_){ }
    document.querySelectorAll('.arena-modal.show,.pve-battle.show,.pve-flow.show').forEach(x=>x.classList.remove('show'));
  }
  function isCombat(){
    return !!document.querySelector('.arena-modal.show,.pve-battle.show,.pve-flow.show');
  }

  function ensureHistory(){
    if(!history.state || history.state.__territoryNav!==KEY){
      history.replaceState({__territoryNav:KEY,screen:'home'},'',location.href);
    }
  }

  function showScreen(id, push){
    const aliases={profile:'hero',market:'shop',casino:'games',districts:'quests'};
    id=aliases[id]||id;
    if(id!=='home' && !screenExists(id)){
      showNotice('Раздел пока не подключён',`Экран «${esc(id)}» отсутствует в текущей сборке.`);
      return false;
    }
    if(push && !restoring && active!==id){
      history.pushState({__territoryNav:KEY,screen:id},'',location.href);
    }
    active=id;
    if(id==='home') hideGameOverlays();
    window.showScreen?.(id);
    document.body.dataset.screen=id;
    syncNav();
    return true;
  }

  function go(id){
    if(id==='battle') return startBattle();
    if(id==='arena') return startArena();
    if(id==='forge'){
      if(typeof window.ForgeV2?.open==='function'){
        history.pushState({__territoryNav:KEY,screen:'forge'},'',location.href);
        active='forge'; window.ForgeV2.open(); syncNav(); return;
      }
      return showScreen('shop',true);
    }
    return showScreen(id,true);
  }

  function showNotice(title,body){
    let p=document.getElementById('territoryNavNotice10070');
    if(!p){
      p=document.createElement('div'); p.id='territoryNavNotice10070';
      p.innerHTML='<div class="tn-card"><button class="tn-x" type="button">×</button><h3></h3><p></p><button class="tn-home" type="button">🏠 В город</button></div>';
      document.body.appendChild(p);
      p.querySelector('.tn-x').onclick=()=>p.remove();
      p.querySelector('.tn-home').onclick=()=>{p.remove();goHome()};
    }
    p.querySelector('h3').textContent=title; p.querySelector('p').innerHTML=body; p.style.display='flex';
  }

  function goHome(){
    if(active==='home'){hideGameOverlays();window.showScreen?.('home');syncNav();return;}
    if(history.state?.__territoryNav===KEY){history.back();return;}
    restoring=true;showScreen('home',false);restoring=false;
  }

  function startBattle(){
    history.pushState({__territoryNav:KEY,screen:'pve'},'',location.href); active='pve'; syncNav();
    const load=window.PvEFlow?.startRunner;
    if(typeof load==='function'){ try{return load()}catch(_){ } }
    const add=(id,src)=>new Promise(r=>{const old=document.getElementById(id);if(old){r();return}const s=document.createElement('script');s.id=id;s.src=src+'?v=10070';s.onload=r;s.onerror=r;document.body.appendChild(s)});
    const css=(id,href)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href+'?v=10070';document.head.appendChild(l)};
    css('tnPveFlowCss10070','pve-flow.css'); css('tnPveBattleCss10070','pve-battle.css');
    return add('tnPveFlow10070','pve-flow.js').then(()=>add('tnPveBattle10070','pve-battle.js')).then(()=>window.PvEFlow?.startRunner?.());
  }

  function startArena(){
    history.pushState({__territoryNav:KEY,screen:'arena'},'',location.href); active='arena'; syncNav();
    if(!document.getElementById('arenaModal')){
      const m=document.createElement('div');m.id='arenaModal';m.className='arena-modal';m.setAttribute('aria-hidden','true');
      m.innerHTML='<div class="arena-sheet"><header class="arena-modal-head"><h2>⚔️ АРЕНА</h2><button type="button" class="arena-close" id="arenaClose">×</button></header><main id="arenaModalBody"></main></div>';
      document.body.appendChild(m);
    }
    if(!document.getElementById('tnArenaCss10070')){const l=document.createElement('link');l.id='tnArenaCss10070';l.rel='stylesheet';l.href='arena.css?v=10070';document.head.appendChild(l)}
    if(window.ArenaGame?.open) return window.ArenaGame.open();
    if(document.getElementById('tnArenaJs10070')) return;
    const s=document.createElement('script');s.id='tnArenaJs10070';s.src='arena.js?v=10070';s.onload=()=>window.ArenaGame?.open?.();document.body.appendChild(s);
  }

  function syncNav(){
    const bar=document.getElementById('territoryBottomNav10070');
    if(!bar)return;
    bar.classList.toggle('hidden',isCombat());
    bar.querySelectorAll('button[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===active));
    const home=document.getElementById('territoryHomeZones10070');
    if(home)home.classList.toggle('hidden',active!=='home');
  }

  const bottom=[
    ['home','🏠','Город'],['inventory','🎒','Инвентарь'],['hero','🧙','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🛡️','Клан']
  ];
  const homeZones=[
    ['profile','Герой',0,0,27.5,8],['coins','Монеты',27.5,0,18,7],['gems','Кристаллы',45.5,0,18,7],['redgems','Рубины',63.5,0,16,7],['trophy','Достижения',79.5,0,6.5,7],['messages','Почта',86,0,7,7],['settings','Настройки',93,0,7,7],
    ['energy','Энергия',30,4.5,28,5],['chapter','Глава',30,9,41,6],
    ['events','События',0,9,14,8],['daily','Задания',0,16.5,14,8],['leftQuests','Квесты',0,24,14,8],['friends','Друзья',0,31.5,14,8],['sea','Море',0,39,14,8],
    ['shop','Магазин',87,9,13,8],['forge','Кузница',87,16.2,13,8],['challenges','Испытания',87,23.4,13,8],['streets','Улицы',87,30.6,13,8],['arena','Арена',87,38,13,8]
  ];

  function buildNav(){
    if(document.getElementById('territoryBottomNav10070'))return;
    const bar=document.createElement('nav');bar.id='territoryBottomNav10070';bar.setAttribute('aria-label','Навигация игры');
    bar.innerHTML=bottom.map(([id,icon,label])=>`<button type="button" data-nav="${id}"><span>${icon}</span><small>${label}</small></button>`).join('');
    document.body.appendChild(bar);
    bar.querySelectorAll('button[data-nav]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.nav),{passive:true}));

    const zones=document.createElement('div');zones.id='territoryHomeZones10070';
    zones.innerHTML=homeZones.map(([id,label,x,y,w,h])=>`<button type="button" data-home-zone="${id}" aria-label="${label}" title="${label}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;"></button>`).join('');
    document.body.appendChild(zones);
    zones.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>goHomeZone(b.dataset.homeZone),{passive:true}));
  }

  function goHomeZone(k){
    const routes={profile:'hero',shop:'shop',forge:'forge',arena:'arena',chapter:'roadmap',trophy:'roadmap',messages:'messages',settings:'settings',energy:'energy',coins:'coins',gems:'gems',redgems:'redgems',events:'quests',daily:'quests',leftQuests:'quests',friends:'quests',sea:'quests',challenges:'quests',streets:'quests'};
    if(routes[k]){
      if(['coins','gems','redgems','energy','messages','settings'].includes(k))return showNotice('Раздел','Этот экран пока работает как информационное окно.');
      return go(routes[k]);
    }
  }

  ensureHistory();
  window.addEventListener('popstate',e=>{
    const s=e.state;
    restoring=true;
    if(s?.__territoryNav){
      active=s.screen||'home';
      if(active==='home')hideGameOverlays();
      if(active!=='pve' && active!=='arena' && screenExists(active))window.showScreen?.(active);
      else if(active==='home')window.showScreen?.('home');
    }else{
      active='home';hideGameOverlays();window.showScreen?.('home');
    }
    restoring=false;syncNav();
  },false);

  window.addEventListener('territory:screen',e=>{const id=e.detail||document.body.dataset.screen||'home'; if(!restoring)active=id;syncNav()});
  window.addEventListener('territory:render',syncNav);
  window.addEventListener('load',()=>{buildNav();active=document.body.dataset.screen||'home';syncNav()},{once:true});
  if(document.readyState!=='loading'){buildNav();active=document.body.dataset.screen||'home';syncNav()}
})();
