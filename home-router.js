/* Territory Game — HOME ROUTER 10068
   Mobile-safe single-action router.
   Goals: one tap = one action, safe missing-screen fallback, no accidental
   Forge/shop double route, and background PvE preload to reduce white loading.
*/
(function(){
  'use strict';

  const S=()=>window.TerritoryStore?.state||{};
  let busyUntil=0;
  let preloadPromise=null;
  let historyReady=false;
  let historyBusy=false;
  const HISTORY_KEY='territory-screen-10068';

  function isHome(){ return !!document.querySelector('#home.screen.active'); }

  function coords(e){
    const p=e.changedTouches?.[0] || e.touches?.[0] || e;
    const w=Math.max(1,window.innerWidth||document.documentElement.clientWidth||1);
    const h=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);
    return {x:(Number(p?.clientX)||0)/w*100,y:(Number(p?.clientY)||0)/h*100};
  }

  const Z=[
    ['profile',0,0,27.5,8],['coins',27.5,0,18,7],['gems',45.5,0,18,7],
    ['redgems',63.5,0,16,7],['trophy',79.5,0,6.5,7],['messages',86,0,7,7],['settings',93,0,7,7],
    ['energy',30,4.5,28,5],['chapter',30,9,41,6],
    ['events',0,9,14,8],['daily',0,16.5,14,8],['leftQuests',0,24,14,8],['friends',0,31.5,14,8],['sea',0,39,14,8],
    ['shop',87,9,13,8],['forge',87,16.2,13,8],['challenges',87,23.4,13,8],['streets',87,30.6,13,8],['arena',87,38,13,8],
    ['gear0',18,64,10.6,12],['gear1',28.8,64,10.6,12],['gear2',39.6,64,10.6,12],
    ['gear3',50.4,64,10.6,12],['gear4',61.2,64,10.6,12],['gear5',72,64,10.6,12],['gear6',82.8,64,10.6,12],
    ['elixir0',0,76,14.2,8],['elixir1',14.5,76,14.2,8],['elixir2',29,76,14.2,8],['elixir3',43.5,76,14.2,8],
    ['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],
    ['bottomQuests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9],['home',0,91,14.28,9]
  ];

  function hit(x,y){
    for(const z of Z){
      if(x>=z[1]&&x<=z[1]+z[3]&&y>=z[2]&&y<=z[2]+z[4]) return z[0];
    }
    return null;
  }

  function currentScreen(){
    return document.body?.dataset?.screen || (document.querySelector('.screen.active')?.id) || 'home';
  }

  function closeOverlays(){
    try{ window.ArenaGame?.close?.(); }catch(_){}
    try{ window.PvEBattle?.close?.(); }catch(_){}
    try{ window.PvEFlow?.close?.(); }catch(_){}
    document.querySelectorAll('.arena-modal.show,.pve-battle.show,.pve-flow.show').forEach(x=>x.classList.remove('show'));
    const panel=document.getElementById('homeRouterPanel10068');
    if(panel)panel.style.display='none';
  }

  function initHistory(){
    if(historyReady)return;
    historyReady=true;
    const st=history.state;
    if(!st || st.__territoryRouter!==HISTORY_KEY){
      history.replaceState({__territoryRouter:HISTORY_KEY,screen:'home',root:true},'',location.href);
    }
    window.addEventListener('popstate',function(){
      historyBusy=true;
      closeOverlays();
      window.showScreen?.('home');
      setTimeout(()=>{historyBusy=false;busyUntil=performance.now()+350},0);
    },false);
  }

  function enterHistory(screen){
    initHistory();
    if(historyBusy)return;
    const current=currentScreen();
    if(screen==='home'){
      if(current!=='home')history.back();
      return;
    }
    if(current===screen)return;
    history.pushState({__territoryRouter:HISTORY_KEY,screen},'',location.href);
  }

  function panel(title,body,buttonText='🏠 ВЕРНУТЬСЯ'){
    let p=document.getElementById('homeRouterPanel10068');
    if(!p){
      p=document.createElement('div');p.id='homeRouterPanel10068';
      p.style.cssText='position:fixed;inset:0;z-index:12000;background:rgba(7,12,18,.98);color:#fff;display:none;align-items:center;justify-content:center;padding:22px;font-family:system-ui,sans-serif';
      document.body.appendChild(p);
    }
    p.innerHTML='<div style="width:min(520px,100%);border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:24px;background:linear-gradient(180deg,#172331,#0d141d);box-shadow:0 20px 60px rgba(0,0,0,.45)"><h2 style="margin:0 0 12px">'+title+'</h2><div style="line-height:1.5;opacity:.9">'+body+'</div><button id="homeRouterPanelClose10068" style="margin-top:20px;width:100%;padding:14px;border:0;border-radius:14px;font-weight:800;font-size:16px">'+buttonText+'</button></div>';
    p.style.display='flex';
    p.querySelector('#homeRouterPanelClose10068').onclick=()=>{p.style.display='none';window.showScreen?.('home');enterHistory('home')};
  }

  function safeShow(id,title){
    const aliases={market:'shop',casino:'games',districts:'quests'};
    const target=aliases[id]||id;
    if(document.getElementById(target)){enterHistory(target);window.showScreen?.(target);return true;}
    panel(title||'Раздел',`Раздел <b>${target}</b> пока не подключён к текущему экрану. Игра продолжает работать без пустого экрана.`);
    return false;
  }

  function loadArena(){
    enterHistory('arena');
    if(!document.getElementById('arenaModal10068') && !document.getElementById('arenaModal')){
      const m=document.createElement('div');m.id='arenaModal';m.className='arena-modal';m.setAttribute('aria-hidden','true');
      m.innerHTML='<div class="arena-sheet"><header class="arena-modal-head"><h2>⚔️ АРЕНА</h2><button type="button" class="arena-close" id="arenaClose">×</button></header><main id="arenaModalBody"></main></div>';
      document.body.appendChild(m);
    }
    if(!document.getElementById('arenaCss10068')){
      const css=document.createElement('link');css.id='arenaCss10068';css.rel='stylesheet';css.href='arena.css?v=10068';document.head.appendChild(css);
    }
    if(window.ArenaGame?.open)return Promise.resolve(window.ArenaGame.open());
    const old=document.querySelector('script[data-arena-input-10068]');
    if(old)return new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(window.ArenaGame?.open){clearInterval(t);window.ArenaGame.open();resolve()}if(++n>80){clearInterval(t);resolve()}},25)});
    return new Promise(resolve=>{
      const s=document.createElement('script');s.dataset.arenaInput10068='1';s.src='arena.js?v=10068';
      s.onload=()=>{window.ArenaGame?.open?.();resolve()};s.onerror=()=>{panel('Арена','Не удалось загрузить модуль Арены.');resolve()};document.body.appendChild(s);
    });
  }

  function loadPvE(){
    if(preloadPromise)return preloadPromise;
    const addCss=(id,href)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href+'?v=10068';document.head.appendChild(l)};
    const addJs=(id,src)=>new Promise(resolve=>{const old=document.getElementById(id);if(old){resolve();return}const s=document.createElement('script');s.id=id;s.src=src+'?v=10068';s.onload=resolve;s.onerror=resolve;document.body.appendChild(s)});
    addCss('pveCss10068','pve-flow.css');addCss('pveBattleCss10068','pve-battle.css');
    preloadPromise=addJs('pveFlow10068','pve-flow.js').then(()=>addJs('pveBattle10068','pve-battle.js'));
    return preloadPromise;
  }

  function preload(){
    if(document.visibilityState==='hidden')return;
    try{loadPvE()}catch(_){}
  }

  function battle(){
    enterHistory('pve');
    return loadPvE().then(()=>{
      if(window.PvEFlow?.startRunner)return window.PvEFlow.startRunner();
      panel('Бой','Модуль боя ещё загружается. Нажми «Бой» ещё раз через секунду.');
    });
  }

  function gear(i){
    const st=S();st.selectedEquipmentSlot=Math.max(0,Math.min(6,Number(i)||0));
    window.TerritoryStore?.saveNow?.('home-gear-select-10068');safeShow('hero','Герой');
  }

  function elixir(i){
    const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
    const fn=window.CombatItems?.use;
    if(typeof fn==='function'){try{fn.call(window.CombatItems,ids[i]);return}catch(_){}
    }
    safeShow('shop','Зелья');
  }

  function route(k){
    if(k==='home')return safeShow('home','Главный экран');
    if(k==='battle')return battle();
    if(k==='arena')return loadArena();
    if(k==='inventory')return safeShow('inventory','Инвентарь');
    if(k==='hero'||k==='profile')return safeShow('hero','Герой');
    if(k==='bottomQuests'||k==='leftQuests')return safeShow('quests','Квесты');
    if(k==='games')return safeShow('games','Игры');
    if(k==='clan')return safeShow('clan','Клан');
    if(k==='shop')return safeShow('shop','Магазин');
    if(k==='forge'){
      if(typeof window.ForgeV2?.open==='function'){window.ForgeV2.open();return;}
      return safeShow('shop','Кузница');
    }
    if(k==='chapter'){enterHistory('chapter');return loadPvE().then(()=>window.PvEFlow?.open?.());}
    if(k==='profile')return safeShow('hero','Герой');
    if(['events','daily','friends','sea','challenges','streets'].includes(k))return safeShow('quests','Задания');
    if(['coins','gems','redgems','energy'].includes(k))return panel('Ресурс',`Текущий баланс: <b>${k}</b>.`);
    if(k==='trophy')return safeShow('roadmap','Достижения');
    if(k==='messages')return panel('Сообщения','Здесь будет внутриигровая почта и системные уведомления.');
    if(k==='settings')return panel('Настройки','Настройки игры подключим отдельным экраном.');
    if(k.startsWith('gear'))return gear(Number(k.slice(4)));
    if(k.startsWith('elixir'))return elixir(Number(k.slice(6)));
  }

  function handle(e){
    if(!isHome())return;
    if(performance.now()<busyUntil)return;
    const {x,y}=coords(e),k=hit(x,y);if(!k)return;
    busyUntil=performance.now()+650;
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation();
    try{route(k)}catch(err){panel('Ошибка перехода','Раздел не смог открыться. HOME сохранён, пустого экрана не будет.');}
  }

  /* One primary gesture only. This avoids touchstart/pointerdown/pointerup/click
     firing the same HOME action several times on Android WebView. */
  window.addEventListener('pointerup',handle,{capture:true,passive:false});
  window.addEventListener('click',function(e){
    if(performance.now()<busyUntil){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();return}
    handle(e);
  },{capture:true,passive:false});

  initHistory();
  window.addEventListener('territory:screen',()=>{busyUntil=0});
  window.addEventListener('territory:render',()=>{busyUntil=0});
  window.addEventListener('load',()=>setTimeout(preload,900),{once:true});
  setTimeout(preload,1400);
})();
