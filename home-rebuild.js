/* Territory Game — HOME visual layer. Artwork is never painted over. */
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state;
  const save=()=>window.TerritoryStore?.saveNow?.('home');
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
    home:()=>window.showScreen('home'),inventory:()=>window.showScreen('inventory'),hero:()=>window.showScreen('inventory'),game:()=>window.showScreen('casino'),bottomQuests:()=>window.showScreen('districts'),clan:()=>window.showScreen('districts'),
    battle:()=>mountRunner(),attack:()=>mountRunner(),arena:()=>window.ArenaGame?.open(),challenges:()=>window.ArenaGame?.open(),shop:()=>window.showScreen('market'),forge:()=>window.ForgeV2?.open?.()||window.showScreen('market'),events:()=>window.showScreen('districts'),daily:()=>window.showScreen('casino'),quests:()=>window.showScreen('districts'),friends:()=>window.showScreen('districts'),sea:()=>window.showScreen('districts'),
    coins:()=>{},gems:()=>{},redgems:()=>{},profile:()=>window.showScreen('inventory'),trophy:()=>{},messages:()=>{},settings:()=>{},energy:()=>{},chapter:()=>{},hp:()=>{},equipment:()=>window.showScreen('inventory'),consumable1:()=>window.CombatItems?.use('elixir_hp'),consumable2:()=>window.CombatItems?.use('elixir_energy'),consumable3:()=>window.CombatItems?.use('elixir_attack'),consumable4:()=>window.CombatItems?.use('elixir_guard'),lock1:()=>{},lock2:()=>{},lock3:()=>{},quest:()=>window.showScreen('districts'),speed:()=>{},refresh:()=>{},crown:()=>{},star:()=>{}
  };
  async function initTelegram(){
    const tg=window.Telegram?.WebApp;
    if(!tg||!window.TerritoryStore)return;
    try{tg.ready();tg.expand();tg.setHeaderColor('#07111b');tg.setBackgroundColor('#07111b');}catch(_){ }
    const u=tg.initDataUnsafe?.user;
    if(!u?.id)return;
    const s=window.TerritoryStore.state,p=s.profile||{};
    const display=[u.first_name,u.last_name].filter(Boolean).join(' ').trim()||'Игрок';
    s.profile=Object.assign(p,{displayName:display,telegramId:String(u.id),username:String(u.username||''),firstName:String(u.first_name||''),lastName:String(u.last_name||''),photoUrl:String(u.photo_url||''),languageCode:String(u.language_code||''),platform:String(tg.platform||'unknown'),premium:Boolean(u.is_premium)});
    s.name=display;s.telegramUserId=String(u.id);s.telegramUsername=String(u.username||'');
    window.TerritoryStore.saveNow('telegram-profile');paint();
    const name=document.querySelector('[data-profile-name]');if(name)name.textContent=display;
    const un=document.querySelector('[data-username]');if(un)un.textContent=u.username?'@'+u.username:'Telegram';
    const photo=document.querySelector('[data-profile-photo]');if(photo&&u.photo_url){photo.style.backgroundImage=`url("${String(u.photo_url).replace(/"/g,'%22')}")`;photo.style.backgroundSize='cover';photo.style.backgroundPosition='center';photo.textContent='';}
  }
  function mount(){const home=document.getElementById('home');if(!home||home.dataset.mounted)return;home.dataset.mounted='1';home.innerHTML=`<div id="homeReferenceHost" class="home-reference-host"><img src="territory_reference_bg.png?v=600" class="home-reference-image" alt="Territory Game HOME" draggable="false"><div class="home-hitzones"></div><div class="home-bottom-zones"></div><div id="homeRealHud" aria-hidden="true"></div></div>`;const layer=home.querySelector('.home-hitzones'),bot=home.querySelector('.home-bottom-zones');zones.forEach((z,i)=>add(layer,z,i,false));bottom.forEach((z,i)=>add(bot,z,42+i,true));mountRealHud();}
  function add(layer,z,i,isBottom){const b=document.createElement('button');b.type='button';b.className='hz '+(isBottom?'home-bottom-hz':'');b.dataset.action=z[0];b.dataset.index=i;b.style.left=z[1]+'%';b.style.top=z[2]+'%';b.style.width=z[3]+'%';b.style.height=z[4]+'%';layer.appendChild(b);}
  function mountRealHud(){const host=document.getElementById('homeRealHud');if(!host)return;host.innerHTML=`<span class="hud-clean hud-name"></span><span class="hud-clean hud-level"></span><span class="hud-clean hud-coins"></span><span class="hud-clean hud-gems"></span><span class="hud-clean hud-redgems"></span><span class="hud-clean hud-energy"></span><span class="hud-clean hud-xp"></span><span class="hud-clean hud-bottom-level"></span><span class="hud-clean hud-hp"></span><span class="hud-clean hud-bottom-energy"></span><i class="hud-mask hud-hp-mask"></i><i class="hud-mask hud-energy-mask"></i><i class="hud-mask hud-xp-mask"></i><span class="hud-clean hud-i i1"></span><span class="hud-clean hud-i i2"></span><span class="hud-clean hud-i i3"></span><span class="hud-clean hud-i i4"></span><span class="hud-clean hud-i i5"></span><span class="hud-clean hud-i i6"></span>`;}
  function paint(){const s=S()||{};const p=s.profile||{};const name=p.displayName||s.name||'Игрок';const set=(q,v)=>{const e=document.querySelector(q);if(e)e.textContent=v};set('.hud-name',name);set('.hud-level','Lv. '+(s.level||1));set('.hud-coins',compact(s.coins));set('.hud-gems',compact(s.gems));set('.hud-redgems',compact(s.redGems));set('.hud-energy',`${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}`);set('.hud-xp',`${Math.floor(s.exp||0)}/${Math.floor(s.expToNext||100)}`);set('.hud-bottom-level','Lv.'+(s.level||1));set('.hud-hp',`${Math.floor(s.hp||0)} / ${Math.floor(s.maxHp||120)}`);set('.hud-bottom-energy',`${Math.floor(s.energy||0)} / ${Math.floor(s.maxEnergy||200)}`);const eq=Array.isArray(s.equipment)?s.equipment:[];const inv=Array.isArray(s.inventory)?s.inventory:[];for(let i=0;i<6;i++)set(`.hud-i.i${i+1}`,eq[i]?.name||inv[i]||'');const hpPct=Math.max(0,Math.min(1,(s.hp||0)/Math.max(1,s.maxHp||120)));const enPct=Math.max(0,Math.min(1,(s.energy||0)/Math.max(1,s.maxEnergy||200)));const xpPct=Math.max(0,Math.min(1,(s.exp||0)/Math.max(1,s.expToNext||100)));for(const [q,pct] of [['.hud-hp-mask',hpPct],['.hud-energy-mask',enPct],['.hud-xp-mask',xpPct]]){const e=document.querySelector(q);if(e)e.style.setProperty('--fill',(pct*100)+'%');}}
  function compact(v){const n=Math.max(0,Number(v)||0);if(n>=1e6)return (n/1e6).toFixed(1)+'M';if(n>=1e3)return (n/1e3).toFixed(1)+'K';return String(Math.floor(n));}
  function mountRunner(){
    if(document.getElementById('runnerScreen'))return;
    const root=document.createElement('div');
    root.id='runnerScreen';
    root.className='runner-screen show';
    root.innerHTML=`
      <div class="runner-combat-window">
        <div class="runner-scroll"></div>
        <div class="runner-vignette"></div>
        <div class="runner-ui">
          <div class="runner-title"><b>БОЙ</b><span data-run-status>Вперёд!</span></div>
          <div class="runner-progress"><i data-run-progress></i></div>
          <button type="button" data-run-close aria-label="Закрыть">×</button>
        </div>
        <div class="runner-stage">
          <div class="runner-bot-slot" aria-live="polite"></div>
          <div class="runner-impact-layer"></div>
          <div class="runner-damage-layer"></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    runSequence(root);
  }
  function damage(root,text,critical=false){
    const layer=root.querySelector('.runner-damage-layer');
    if(!layer)return;
    const e=document.createElement('div');
    e.className='runner-damage'+(critical?' critical':'');
    e.textContent=critical?'💥 '+text:text;
    layer.appendChild(e);
    setTimeout(()=>e.remove(),800);
  }
  function impact(root,critical=false){
    const screen=root.querySelector('.runner-combat-window');
    if(!screen)return;
    screen.classList.remove('shake','crit-flash');
    void screen.offsetWidth;
    screen.classList.add('shake');
    if(critical)screen.classList.add('crit-flash');
    setTimeout(()=>screen.classList.remove('shake','crit-flash'),critical?180:210);
  }
  function runnerReward(){
    const s=S();
    if(!s)return;
    s.coins=Math.max(0,Number(s.coins||0)+75*4);
    s.energy=Math.max(0,Number(s.energy||0)-Math.min(40,Number(s.energy||0)));
    s.exp=Math.max(0,Number(s.exp||0)+60);
    let need=Math.max(1,Number(s.expToNext||100));
    while(s.exp>=need){s.exp-=need;s.level=Math.max(1,Number(s.level||1)+1);need=Math.max(100,Math.floor(need*1.12));}
    s.expToNext=need;
    window.TerritoryStore?.saveNow?.('runner-battle');
    paint();
  }
  async function runSequence(root){
    const status=root.querySelector('[data-run-status]');
    const progress=root.querySelector('[data-run-progress]');
    const slot=root.querySelector('.runner-bot-slot');
    const enemies=[
      {icon:'⚔️',name:'Северный воин',level:4,maxHp:105},
      {icon:'🪓',name:'Берсерк',level:5,maxHp:125},
      {icon:'🐺',name:'Лютый страж',level:6,maxHp:145},
      {icon:'👹',name:'Вождь',level:7,maxHp:175}
    ];
    try{
      for(let i=0;i<enemies.length;i++){
        const enemy={...enemies[i],hp:enemies[i].maxHp};
        const bot=document.createElement('article');
        bot.className='runner-enemy';
        bot.style.left='120%';
        bot.innerHTML=`<div class="runner-enemy-card"><div class="runner-enemy-icon">${enemy.icon}</div><div class="runner-enemy-info"><b>${enemy.name}</b><small>Lv.${enemy.level}</small><div class="runner-enemy-hp"><i style="width:100%"></i></div><span>${enemy.hp}/${enemy.maxHp}</span></div></div>`;
        slot.appendChild(bot);
        requestAnimationFrame(()=>bot.classList.add('approach'));
        status.textContent=`${enemy.name} выходит навстречу`;
        await wait(1150);
        for(let hit=0;hit<3 && enemy.hp>0;hit++){
          status.textContent=hit===2?'Финишный удар!':'УДАР!';
          bot.classList.remove('enemy-strike');
          void bot.offsetWidth;
          bot.classList.add('enemy-strike');
          await wait(230);
          const critical=Math.random()<0.18;
          const d=critical?Math.floor(28+Math.random()*20):Math.floor(12+Math.random()*16);
          enemy.hp=Math.max(0,enemy.hp-d);
          const hp=Math.round(enemy.hp/enemy.maxHp*100);
          const bar=bot.querySelector('.runner-enemy-hp i');
          const hpText=bot.querySelector('.runner-enemy-info span');
          if(bar)bar.style.width=hp+'%';
          if(hpText)hpText.textContent=`${enemy.hp}/${enemy.maxHp}`;
          impact(root,critical);
          damage(root,'-'+d,critical);
          await wait(430);
        }
        bot.classList.add('defeated');
        status.textContent=i<enemies.length-1?'Следующий противник…':'Победа!';
        progress.style.width=((i+1)/enemies.length*100)+'%';
        await wait(650);
        bot.remove();
      }
      runnerReward();
      await wait(500);
      root.classList.add('closing');
      await wait(300);
      root.remove();
    }catch(_){
      root.remove();
    }
  }
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  document.addEventListener('click',e=>{const b=e.target.closest?.('.hz');if(!b)return;e.preventDefault();e.stopPropagation();const fn=action[b.dataset.action];if(fn)fn();});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-run-close]'))document.getElementById('runnerScreen')?.remove();});
  document.addEventListener('territory:render',paint);document.addEventListener('DOMContentLoaded',()=>{mount();paint();initTelegram();});
})();
