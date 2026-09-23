/* Territory Game — HOME + clean combat surface. */
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state;
  const zones=[
    ['profile',0,0,27.5,6.5],['coins',27.5,0,18,5.8],['gems',45.5,0,18,5.8],['redgems',63.5,0,16,5.8],['trophy',79.5,0,6.5,5.8],['messages',86,0,7,5.8],['settings',93,0,7,5.8],
    ['energy',30,4.5,28,5.2],['attack',64,4.2,34,6.3],['chapter',30,9,41,5.5],
    ['events',0,9,13,8],['daily',0,16.2,13,8],['quests',0,23.4,13,8],['friends',0,30.6,13,8],['sea',0,38,13,8],
    ['shop',87,9,13,8],['forge',87,16.2,13,8],['challenges',87,23.4,13,8],['streets',87,30.6,13,8],['arena',87,38,13,8],
    ['hp',0,64,18,12],['equipment',18,64,65,12],['energyBottom',83,64,17,12],
    ['consumable1',0,76.2,14.4,8],['consumable2',14.5,76.2,14.4,8],['consumable3',29,76.2,14.4,8],['consumable4',43.5,76.2,14.4,8],
    ['lock1',58,76.2,13.5,8],['lock2',72,76.2,13.5,8],['lock3',86,76.2,14,8],['quest',0,84.2,51,7.2],['speed',61,83.7,8.5,7],['refresh',70.5,83.7,8.5,7],['crown',80,83.7,8.5,7],['star',89.5,83.7,10.5,7]
  ];
  const bottom=[['home',0,91,14.28,9],['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],['bottomQuests',57.16,91,14.28,9],['game',71.44,91,14.28,9],['clan',85.72,91,14.28,9]];
  const action={
    home:()=>window.showScreen?.('home'),inventory:()=>window.showScreen?.('inventory'),hero:()=>window.showScreen?.('inventory'),game:()=>window.showScreen?.('casino'),bottomQuests:()=>window.showScreen?.('districts'),clan:()=>window.showScreen?.('districts'),
    battle:()=>mountRunner(),attack:()=>mountRunner(),arena:()=>window.ArenaGame?.open?.(),challenges:()=>window.ArenaGame?.open?.(),shop:()=>window.showScreen?.('market'),forge:()=>window.ForgeV2?.open?.()||window.showScreen?.('market'),events:()=>window.showScreen?.('districts'),daily:()=>window.showScreen?.('casino'),quests:()=>window.showScreen?.('districts'),friends:()=>window.showScreen?.('districts'),sea:()=>window.showScreen?.('districts'),
    coins:()=>{},gems:()=>{},redgems:()=>{},profile:()=>window.showScreen?.('inventory'),trophy:()=>{},messages:()=>{},settings:()=>{},energy:()=>{},chapter:()=>{},hp:()=>{},equipment:()=>window.showScreen?.('inventory'),consumable1:()=>window.CombatItems?.use?.('elixir_hp'),consumable2:()=>window.CombatItems?.use?.('elixir_energy'),consumable3:()=>window.CombatItems?.use?.('elixir_attack'),consumable4:()=>window.CombatItems?.use?.('elixir_guard'),lock1:()=>{},lock2:()=>{},lock3:()=>{},quest:()=>window.showScreen?.('districts'),speed:()=>{},refresh:()=>{},crown:()=>{},star:()=>{}
  };
  function initTelegram(){
    const tg=window.Telegram?.WebApp;if(!tg||!window.TerritoryStore)return;
    try{tg.ready();tg.expand();tg.setHeaderColor('#07111b');tg.setBackgroundColor('#07111b');}catch(_){ }
    const u=tg.initDataUnsafe?.user;if(!u?.id)return;
    const s=window.TerritoryStore.state,p=s.profile||{};
    const display=[u.first_name,u.last_name].filter(Boolean).join(' ').trim()||'Игрок';
    s.profile=Object.assign(p,{displayName:display,telegramId:String(u.id),username:String(u.username||''),firstName:String(u.first_name||''),lastName:String(u.last_name||''),photoUrl:String(u.photo_url||''),languageCode:String(u.language_code||''),platform:String(tg.platform||'unknown'),premium:Boolean(u.is_premium)});
    s.name=display;s.telegramUserId=String(u.id);s.telegramUsername=String(u.username||'');window.TerritoryStore.saveNow?.('telegram-profile');paint();
    const name=document.querySelector('[data-profile-name]');if(name)name.textContent=display;
    const un=document.querySelector('[data-username]');if(un)un.textContent=u.username?'@'+u.username:'Telegram';
    const photo=document.querySelector('[data-profile-photo]');if(photo&&u.photo_url){photo.style.backgroundImage=`url("${String(u.photo_url).replace(/"/g,'%22')}")`;photo.style.backgroundSize='cover';photo.style.backgroundPosition='center';photo.textContent='';}
  }
  function mount(){
    const home=document.getElementById('home');if(!home||home.dataset.mounted)return;home.dataset.mounted='1';
    home.innerHTML='<div id="homeReferenceHost" class="home-reference-host"><img src="territory_reference_bg.png?v=600" class="home-reference-image" alt="Territory Game HOME" draggable="false"><div class="home-hitzones"></div><div class="home-bottom-zones"></div><div id="homeRealHud" aria-hidden="true"></div></div>';
    const layer=home.querySelector('.home-hitzones'),bot=home.querySelector('.home-bottom-zones');zones.forEach((z,i)=>add(layer,z,i,false));bottom.forEach((z,i)=>add(bot,z,42+i,true));mountRealHud();
  }
  function add(layer,z,i,isBottom){const b=document.createElement('button');b.type='button';b.className='hz '+(isBottom?'home-bottom-hz':'');b.dataset.action=z[0];b.dataset.index=i;b.style.left=z[1]+'%';b.style.top=z[2]+'%';b.style.width=z[3]+'%';b.style.height=z[4]+'%';layer.appendChild(b);}
  function mountRealHud(){
    const host=document.getElementById('homeRealHud');if(!host)return;
    host.innerHTML='<span class="hud-clean hud-name"></span><span class="hud-clean hud-level"></span><span class="hud-clean hud-coins"></span><span class="hud-clean hud-gems"></span><span class="hud-clean hud-redgems"></span><span class="hud-clean hud-energy"></span><span class="hud-clean hud-xp"></span><span class="hud-clean hud-bottom-level"></span><span class="hud-clean hud-hp"></span><span class="hud-clean hud-bottom-energy"></span><i class="hud-mask hud-hp-mask"></i><i class="hud-mask hud-energy-mask"></i><i class="hud-mask hud-xp-mask"></i><span class="hud-clean hud-i i1"></span><span class="hud-clean hud-i i2"></span><span class="hud-clean hud-i i3"></span><span class="hud-clean hud-i i4"></span><span class="hud-clean hud-i i5"></span><span class="hud-clean hud-i i6"></span>';
  }
  function paint(){
    const s=S()||{},p=s.profile||{},name=p.displayName||s.name||'Игрок',set=(q,v)=>{const e=document.querySelector(q);if(e)e.textContent=v};
    set('.hud-name',name);set('.hud-level','Lv. '+(s.level||1));set('.hud-coins',compact(s.coins));set('.hud-gems',compact(s.gems));set('.hud-redgems',compact(s.redGems));set('.hud-energy',`${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}`);set('.hud-xp',`${Math.floor(s.exp||0)}/${Math.floor(s.expToNext||100)}`);set('.hud-bottom-level','Lv.'+(s.level||1));set('.hud-hp',`${Math.floor(s.hp||0)} / ${Math.floor(s.maxHp||120)}`);set('.hud-bottom-energy',`${Math.floor(s.energy||0)} / ${Math.floor(s.maxEnergy||200)}`);
    const eq=Array.isArray(s.equipment)?s.equipment:[],inv=Array.isArray(s.inventory)?s.inventory:[];for(let i=0;i<6;i++)set(`.hud-i.i${i+1}`,eq[i]?.name||inv[i]||'');
    const hpPct=Math.max(0,Math.min(1,(s.hp||0)/Math.max(1,s.maxHp||120))),enPct=Math.max(0,Math.min(1,(s.energy||0)/Math.max(1,s.maxEnergy||200))),xpPct=Math.max(0,Math.min(1,(s.exp||0)/Math.max(1,s.expToNext||100)));
    for(const [q,pct] of [['.hud-hp-mask',hpPct],['.hud-energy-mask',enPct],['.hud-xp-mask',xpPct]]){const e=document.querySelector(q);if(e)e.style.setProperty('--fill',(pct*100)+'%');}
  }
  function compact(v){const n=Math.max(0,Number(v)||0);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return String(Math.floor(n));}

  /* Clean combat surface: the HOME artwork remains visible and stationary underneath. */
  function mountRunner(){
    const old=document.getElementById('runnerScreen');if(old)old.remove();
    const root=document.createElement('div');root.id='runnerScreen';root.className='runner-screen show';
    root.innerHTML='<div class="runner-ui"><div><b>БОЙ</b><span data-run-status>Готовься…</span></div><button type="button" data-run-close aria-label="Закрыть">×</button></div><div class="runner-boss-hud" aria-live="polite"><div class="runner-boss-title">ПРОТИВНИК</div><div class="runner-boss-name" data-boss-name>Северный воин</div><div class="runner-hp-track"><i data-boss-hp></i></div><div class="runner-boss-hp-text" data-boss-hp-text>100 / 100</div></div><div class="runner-stage"><div class="runner-damage-layer"></div><div class="runner-impact-layer"></div></div>';
    document.body.appendChild(root);runSequence(root);
  }
  function damage(root,text,critical=false,side='bot'){
    const layer=root.querySelector('.runner-damage-layer');if(!layer)return;
    const e=document.createElement('div');e.className='runner-damage '+(critical?'critical':'')+' '+(side==='player'?'damage-player':'damage-bot');e.textContent=critical?'💥 '+text:text;layer.appendChild(e);setTimeout(()=>e.remove(),850);
  }
  function impact(root,critical=false){
    root.classList.remove('shake');void root.offsetWidth;root.classList.add('shake');
    if(critical){const f=document.createElement('div');f.className='crit-flash';root.querySelector('.runner-impact-layer').appendChild(f);setTimeout(()=>f.remove(),180);}
    setTimeout(()=>root.classList.remove('shake'),220);
  }
  async function runSequence(root){
    const status=root.querySelector('[data-run-status]'),hp=root.querySelector('[data-boss-hp]'),hpText=root.querySelector('[data-boss-hp-text]');
    let bossHp=100;const maxHp=100;
    const renderHp=()=>{const pct=Math.max(0,bossHp/maxHp);hp.style.width=(pct*100)+'%';hpText.textContent=`${bossHp} / ${maxHp}`;};renderHp();
    status.textContent='Вперёд!';
    for(let i=0;i<4;i++){
      await wait(650);status.textContent='УДАР!';
      const critical=Math.random()<.22,d=critical?28+Math.floor(Math.random()*18):12+Math.floor(Math.random()*18);
      bossHp=Math.max(0,bossHp-d);renderHp();damage(root,'-'+d,critical,'bot');impact(root,critical);
      await wait(420);
      if(bossHp<=0){status.textContent='Победа!';await wait(650);bossHp=maxHp;renderHp();if(i<3)status.textContent='Следующий противник…';}
      else {status.textContent=i<3?'Следующая атака…':'Добей его!';await wait(520);}
    }
    status.textContent='Серия завершена';
    const s=S();if(s){s.energy=Math.max(0,Number(s.energy||0)-10);s.exp=Math.max(0,Number(s.exp||0)+15);s.coins=Math.max(0,Number(s.coins||0)+75);window.TerritoryStore?.saveNow?.('runner-series');window.TerritoryStore?.render?.();paint();}
    await wait(550);root.classList.add('closing');await wait(300);root.remove();
  }
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.addEventListener('click',e=>{const b=e.target.closest?.('.hz');if(!b)return;e.preventDefault();e.stopPropagation();action[b.dataset.action]?.();});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-run-close]'))document.getElementById('runnerScreen')?.remove();});
  document.addEventListener('territory:render',paint);
  document.addEventListener('DOMContentLoaded',()=>{mount();paint();initTelegram();});
})();
