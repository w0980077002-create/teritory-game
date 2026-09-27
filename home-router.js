/* Territory Game — HOME INPUT ROUTER 10065
   Single touch/pointer/click fallback for the baked HOME artwork.
   No transparent overlay is created. */
(function(){
  'use strict';

  const S=()=>window.TerritoryStore?.state||{};
  let busyUntil=0;

  function isHome(){
    return !!document.querySelector('#home.screen.active');
  }

  function coords(e){
    const p=e.touches?.[0] || e.changedTouches?.[0] || e;
    const w=Math.max(1,window.innerWidth||document.documentElement.clientWidth||1);
    const h=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);
    return {
      x:(Number(p.clientX)||0)/w*100,
      y:(Number(p.clientY)||0)/h*100
    };
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
      if(x>=z[1] && x<=z[1]+z[3] && y>=z[2] && y<=z[2]+z[4]) return z[0];
    }
    return null;
  }

  function show(id){ if(typeof window.showScreen==='function') window.showScreen(id); }

  function loadArena(){
    /* Current index.html has no arenaModal and no arena.css.
       Build those missing runtime pieces before loading ArenaGame. */
    if(!document.getElementById('arenaModal')){
      const m=document.createElement('div');
      m.id='arenaModal';
      m.className='arena-modal';
      m.setAttribute('aria-hidden','true');
      m.innerHTML='<div class="arena-sheet"><header class="arena-modal-head"><h2>⚔️ АРЕНА</h2><button type="button" class="arena-close" id="arenaClose">×</button></header><main id="arenaModalBody"></main></div>';
      document.body.appendChild(m);
    }
    if(!document.getElementById('arenaCss10065')){
      const css=document.createElement('link');
      css.id='arenaCss10065';
      css.rel='stylesheet';
      css.href='arena.css?v=10065';
      document.head.appendChild(css);
    }
    if(window.ArenaGame?.open) return window.ArenaGame.open();
    const old=document.querySelector('script[data-arena-input-10065]');
    if(old) return;
    const s=document.createElement('script');
    s.dataset.arenaInput10060='1';
    s.src='arena.js?v=10060';
    s.onload=()=>window.ArenaGame?.open?.();
    s.onerror=()=>show('arena');
    document.body.appendChild(s);
  }

  function battle(){
    return loadPvE().then(()=>window.PvEFlow?.startRunner?.());
  }

  function loadPvE(){
    const cssId='pveCss10065', flowId='pveFlow10065', battleId='pveBattle10065';
    const addCss=(id,href)=>{if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href+'?v=10065';document.head.appendChild(l)};
    const addJs=(id,src)=>new Promise(resolve=>{const old=document.getElementById(id);if(old){resolve();return}const s=document.createElement('script');s.id=id;s.src=src+'?v=10065';s.onload=()=>resolve();s.onerror=()=>resolve();document.body.appendChild(s)});
    addCss(cssId,'pve-flow.css');addCss('pveBattleCss10065','pve-battle.css');
    return addJs(flowId,'pve-flow.js').then(()=>addJs(battleId,'pve-battle.js'));
  }

  function gear(i){
    const st=S();
    st.selectedEquipmentSlot=Math.max(0,Math.min(6,Number(i)||0));
    window.TerritoryStore?.saveNow?.('home-gear-select-10060');
    if(window.showScreen) show('hero');
  }

  function elixir(i){
    const ids=['elixir_hp','elixir_energy','elixir_attack','elixir_guard'];
    const fn=window.CombatItems?.use;
    if(typeof fn==='function'){ try{fn.call(window.CombatItems,ids[i]);return;}catch(_){} }
    show('shop');
  }

  function route(k){
    if(k==='battle') return battle();
    if(k==='arena') return loadArena();

    if(k==='inventory') return show('inventory');
    if(k==='hero'||k==='profile') return show('hero');
    if(k==='bottomQuests'||k==='leftQuests') return show('quests');
    if(k==='games') return show('games');
    if(k==='clan') return show('clan');
    if(k==='shop') return show('shop');
    if(k==='forge') return window.ForgeV2?.open?.() || show('shop');
    if(k==='chapter') return loadPvE().then(flow=>flow?.open?.());

    if(k.startsWith('gear')) return gear(Number(k.slice(4)));
    if(k.startsWith('elixir')) return elixir(Number(k.slice(6)));

    if(['events','daily','friends','sea','challenges','streets'].includes(k)){
      return show('districts');
    }
  }

  function isNativeControl(e){
    const t=e.target?.closest?.('button,a,input,select,textarea,[role="button"]');
    return !!t;
  }

  let lastActivation=0;
  let lastKey='';
  function activate(e){
    if(!isHome() || isNativeControl(e)) return;
    const {x,y}=coords(e);
    const k=hit(x,y);
    if(!k)return;
    const now=performance.now();
    const key=k+'|'+Math.round(x*10)+'|'+Math.round(y*10);
    if(now-lastActivation<650 && key===lastKey)return;
    lastActivation=now;lastKey=key;
    if(e.cancelable)e.preventDefault();
    e.stopImmediatePropagation();
    route(k);
  }

  /* One activation path: pointerup on modern Android/WebView, touchend fallback for older WebViews. */
  window.addEventListener('pointerup',activate,{capture:true,passive:false});
  window.addEventListener('touchend',activate,{capture:true,passive:false});
  window.addEventListener('click',function(e){
    if(!isHome() || isNativeControl(e))return;
    const {x,y}=coords(e),k=hit(x,y);
    if(!k)return;
    const now=performance.now(),key=k+'|'+Math.round(x*10)+'|'+Math.round(y*10);
    if(now-lastActivation<650 && key===lastKey){
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    activate(e);
  },{capture:true});

  window.addEventListener('territory:screen',()=>{lastActivation=0;lastKey='';});
  window.addEventListener('territory:render',()=>{lastActivation=0;lastKey='';});
})();
