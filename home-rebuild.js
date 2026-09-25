/* Territory Game — HOME + isolated PvE runner
   PvE runtime is runnerBattle. Arena runtime is arenaBattle in arena.js. */
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let runnerBattle=null;

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
    home:()=>window.showScreen?.('home'),inventory:()=>window.showScreen?.('inventory'),hero:()=>window.showScreen?.('hero'),game:()=>window.showScreen?.('casino'),
    bottomQuests:()=>window.showScreen?.('districts'),clan:()=>window.showScreen?.('districts'),
    battle:()=>startRunner(false),attack:()=>startRunner(false),arena:()=>window.ArenaGame?.open?.(),challenges:()=>window.ArenaGame?.open?.(),
    shop:()=>window.showScreen?.('market'),forge:()=>window.ForgeV2?.open?.()||window.showScreen?.('market'),events:()=>window.showScreen?.('districts'),daily:()=>window.showScreen?.('casino'),quests:()=>window.showScreen?.('districts'),friends:()=>window.showScreen?.('districts'),sea:()=>window.showScreen?.('districts'),
    profile:()=>window.showScreen?.('hero'),equipment:()=>window.showScreen?.('hero'),
    consumable1:()=>window.CombatItems?.use?.('elixir_hp'),consumable2:()=>window.CombatItems?.use?.('elixir_energy'),consumable3:()=>window.CombatItems?.use?.('elixir_attack'),consumable4:()=>window.CombatItems?.use?.('elixir_guard')
  };

  function initTelegram(){
    const tg=window.Telegram?.WebApp;if(!tg||!window.TerritoryStore)return;
    tg.ready?.();tg.expand?.();
    window.TeritoryGameBot='@TeritoryGameBot';
    try{tg.ready();tg.expand();tg.setHeaderColor('#07111b');tg.setBackgroundColor('#07111b');}catch(_){}
    const u=tg.initDataUnsafe?.user;if(!u?.id)return;
    const s=S(),p=s.profile||{},display=[u.first_name,u.last_name].filter(Boolean).join(' ').trim()||'Игрок';
    s.profile=Object.assign(p,{displayName:display,telegramId:String(u.id),username:String(u.username||''),firstName:String(u.first_name||''),lastName:String(u.last_name||''),photoUrl:String(u.photo_url||''),languageCode:String(u.language_code||''),platform:String(tg.platform||'unknown'),premium:Boolean(u.is_premium)});
    s.name=display;s.telegramUserId=String(u.id);s.telegramUsername=String(u.username||'');window.TerritoryStore.saveNow?.('telegram-profile');paint();
  }
  function mount(){
    const home=document.getElementById('home');if(!home||home.dataset.mounted)return;
    home.dataset.mounted='1';
    home.innerHTML='<div id="homeReferenceHost" class="home-reference-host"><img src="territory_reference_bg.png?v=9001" class="home-reference-image" alt="Territory Game HOME" draggable="false"><div class="home-hitzones"></div><div class="home-bottom-zones"></div><div id="homeRealHud" aria-hidden="true"></div></div>';
    const layer=home.querySelector('.home-hitzones'),bot=home.querySelector('.home-bottom-zones');
    zones.forEach((z,i)=>add(layer,z,i,false));bottom.forEach((z,i)=>add(bot,z,42+i,true));mountRealHud();
  }
  function add(layer,z,i,isBottom){const b=document.createElement('button');b.type='button';b.className='hz '+(isBottom?'home-bottom-hz':'');b.dataset.action=z[0];b.dataset.index=i;b.style.left=z[1]+'%';b.style.top=z[2]+'%';b.style.width=z[3]+'%';b.style.height=z[4]+'%';layer.appendChild(b);}
  function mountRealHud(){
    const host=document.getElementById('homeRealHud');if(!host)return;
    host.innerHTML='<span class="hud-clean hud-name"></span><span class="hud-clean hud-level"></span><span class="hud-clean hud-vip">VIP</span><span class="hud-clean hud-coins"></span><span class="hud-clean hud-gems"></span><span class="hud-clean hud-redgems"></span><span class="hud-clean hud-energy"></span><span class="hud-clean hud-xp"></span><span class="hud-clean hud-bottom-level"></span><span class="hud-clean hud-hp"></span><span class="hud-clean hud-bottom-energy"></span>';
  }
  function paint(){
    const s=S(),p=s.profile||{},d=window.TerritoryStore?.getDerivedStats?.()||{},set=(q,v)=>{const e=document.querySelector(q);if(e)e.textContent=v};
    set('.hud-name',p.displayName||s.name||'Игрок');set('.hud-level','Lv. '+(s.level||1));set('.hud-coins',compact(s.coins));set('.hud-gems',compact(s.gems));set('.hud-redgems',compact(s.redGems));set('.hud-energy',`${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}`);set('.hud-xp',`${Math.floor(s.exp||0)}/${Math.floor(s.expToNext||100)}`);set('.hud-bottom-level','Lv.'+(s.level||1));set('.hud-hp',`${Math.floor(s.hp||0)} / ${Math.floor(d.maxHp||s.maxHp||120)}`);set('.hud-bottom-energy',`${Math.floor(s.energy||0)} / ${Math.floor(s.maxEnergy||200)}`);
    const hp=Math.max(0,Math.min(1,(s.hp||0)/Math.max(1,d.maxHp||s.maxHp||120))),en=Math.max(0,Math.min(1,(s.energy||0)/Math.max(1,s.maxEnergy||200))),xp=Math.max(0,Math.min(1,(s.exp||0)/Math.max(1,s.expToNext||100)));
    [['.hud-hp',hp],['.hud-energy',en],['.hud-xp',xp]].forEach(([q,v])=>document.querySelector(q)?.style.setProperty('--fill',(v*100)+'%'));
  }
  function compact(v){const n=Math.max(0,Number(v)||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.floor(n));}

  function followerData(){
    const id=S().followers?.activeFollower;
    const api=window.Followers;
    if(!id||!api)return null;
    const f=api.get?.(id),cfg=api.CATALOG?.[id],stats=api.getStats?.(id);
    return f?.owned&&cfg&&stats?{id,name:cfg.name,icon:cfg.icon,role:cfg.role,level:f.level,stats}:null;
  }
  function runnerTemplate(root){
    const s=S(),p=S().profile||{},f=followerData(),chapter=Math.max(1,Number(s.pve?.chapter)||1);
    root.innerHTML=`<div class="runner-ui"><div><b>БОЙ · ГЛАВА ${chapter}</b><span data-run-status>Вперёд!</span></div><button type="button" data-run-close>×</button></div><div class="runner-chapter-hud"><div><small>ПРОГРЕСС ГЛАВЫ</small><b data-run-progress>0%</b></div><div class="runner-progress-track"><i data-run-progress-fill></i></div><button type="button" data-run-boss aria-label="Запустить босса">💀</button></div><div class="runner-stage"><div class="runner-character player-runner"><img src="./arena-assets/player-viking-approved.png" alt="" draggable="false"><span>${esc(p.displayName||s.name||'Игрок')}</span></div>${f?`<div class="runner-follower"><i>${esc(f.icon)}</i><b>${esc(f.name)}</b></div>`:''}<div class="runner-enemy" data-run-enemy><img src="./arena-assets/opponent-viking-approved.png" alt="" draggable="false"><span data-run-enemy-name>Разбойник</span></div><div class="runner-damage-layer"></div><div class="runner-impact-layer"></div></div>`;
  }
  function startRunner(forceBoss){
    stopRunner();
    const root=document.createElement('div');root.id='runnerScreen';root.className='runner-screen show';
    runnerTemplate(root);document.body.appendChild(root);
    runnerBattle={root,boss:Boolean(forceBoss||S().pve?.bossPending),running:true,enemyHp:0,enemyMaxHp:0,enemyIndex:0};
    if(runnerBattle.boss){S().pve.bossActive=true;S().pve.bossPending=false;window.TerritoryStore.saveNow?.('pve-boss-start');}
    tickRunner();
  }
  function stopRunner(){runnerBattle?.root?.remove();runnerBattle=null;}
  function setProgress(v){const s=S();s.pve.progress=Math.max(0,Math.min(100,v));const root=runnerBattle?.root;if(!root)return;root.querySelector('[data-run-progress]').textContent=Math.floor(s.pve.progress)+'%';root.querySelector('[data-run-progress-fill]').style.width=s.pve.progress+'%';}
  function spawnEnemy(){
    if(!runnerBattle)return;
    const s=S(),chapter=Math.max(1,Number(s.pve.chapter)||1),boss=runnerBattle.boss;
    runnerBattle.enemyMaxHp=boss?220+chapter*35:70+chapter*12;runnerBattle.enemyHp=runnerBattle.enemyMaxHp;runnerBattle.enemyIndex++;
    const names=boss?['Глава Севера','Железный Ярл','Кровавый Вождь']:['Разбойник','Северный воин','Наёмник','Лесной охотник'];
    const e=runnerBattle.root.querySelector('[data-run-enemy]');if(e){e.classList.remove('runner-enemy-dead');e.classList.add('runner-enemy-enter');e.querySelector('[data-run-enemy-name]').textContent=boss?names[(chapter-1)%names.length]:names[(runnerBattle.enemyIndex-1)%names.length];}
    const st=runnerBattle.root.querySelector('[data-run-status]');if(st)st.textContent=boss?'БОСС!':'Встреча с противником';
  }
  function damageText(value,critical){const l=runnerBattle?.root?.querySelector('.runner-damage-layer');if(!l)return;const e=document.createElement('div');e.className='runner-damage '+(critical?'critical':'');e.textContent=(critical?'💥 ':'')+'-'+value;l.appendChild(e);setTimeout(()=>e.remove(),850);}
  function hitAnim(){const r=runnerBattle?.root;if(!r)return;r.classList.remove('runner-hit');void r.offsetWidth;r.classList.add('runner-hit');setTimeout(()=>r.classList.remove('runner-hit'),220);}
  function awardBot(){
    const s=S(),d=window.TerritoryStore?.getDerivedStats?.()||{},f=followerData();
    s.coins+=20+Math.floor((d.strength||5)*1.5);s.exp+=8+Math.floor((d.strength||5)/2);
    if(f)window.Followers?.addXp?.(f.id,5);
    s.pve.progress=Math.min(100,Number(s.pve.progress||0)+10);
    if(s.pve.progress>=100&&!runnerBattle.boss){s.pve.bossPending=true;}
    window.TerritoryStore.saveNow?.('pve-bot-reward');window.TerritoryStore.render?.();setProgress(s.pve.progress);
  }
  function bossWin(){
    const s=S();s.pve.bossActive=false;s.pve.bossPending=false;s.pve.bossDefeated++;s.pve.chapter++;s.pve.progress=0;s.coins+=250+s.pve.chapter*25;s.exp+=100;
    window.TerritoryStore.saveNow?.('pve-boss-win');window.TerritoryStore.render?.();setProgress(0);
    const st=runnerBattle.root.querySelector('[data-run-status]');if(st)st.textContent='🏆 БОСС ПОБЕЖДЁН · НОВАЯ ГЛАВА';
    setTimeout(()=>{if(runnerBattle){runnerBattle.boss=false;spawnEnemy();}},900);
  }
  function bossLose(){const s=S();s.pve.bossActive=false;s.pve.bossPending=true;s.hp=Math.max(1,Math.floor((Number(s.maxHp)||120)*.35));window.TerritoryStore.saveNow?.('pve-boss-loss');window.TerritoryStore.render?.();const st=runnerBattle.root.querySelector('[data-run-status]');if(st)st.textContent='☠️ Босс победил. Возвращаемся к обычным противникам…';setTimeout(()=>{if(runnerBattle){runnerBattle.boss=false;spawnEnemy();}},1000);}
  function tickRunner(){
    if(!runnerBattle?.running)return;
    const s=S(),base=window.TerritoryStore?.getDerivedStats?.()||{},f=followerData(),d={strength:Number(base.strength||s.strength||0),defense:Number(base.defense||s.defense||0),maxHp:Number(base.maxHp||s.maxHp||1),agility:Number(base.agility||s.agility||0),bonusDamage:Number(base.bonusDamage||s.bonusDamage||0)};
    const enemy=runnerBattle.root.querySelector('[data-run-enemy]');
    if(!runnerBattle.enemyMaxHp)spawnEnemy();
    const power=Math.max(1,Number(d.strength)||5)+(Number(d.bonusDamage)||0);
    const critical=Math.random()<Math.min(.35,.08+(Number(d.agility)||5)/200);
    const dealt=runnerBattle.boss?(critical?Math.floor(power*1.8):power):Math.max(1,critical?Math.floor(power*1.55):power);
    runnerBattle.enemyHp=Math.max(0,runnerBattle.enemyHp-dealt);damageText(dealt,critical);hitAnim();
    const st=runnerBattle.root.querySelector('[data-run-status]');if(st)st.textContent=critical?'💥 КРИТ!':'⚔️ УДАР';
    if(runnerBattle.enemyHp<=0){
      enemy?.classList.add('runner-enemy-dead');
      if(runnerBattle.boss){bossWin();setTimeout(tickRunner,1200);return;}
      awardBot();
      if(S().pve.bossPending){runnerBattle.boss=true;S().pve.bossActive=true;window.TerritoryStore.saveNow?.('pve-boss-ready');}
      setTimeout(tickRunner,700);return;
    }
    const incoming=Math.max(1,(runnerBattle.boss?16+Number(S().pve.chapter||1)*2:7)-Math.floor((Number(d.defense)||0)/8));
    if(Math.random()<.12&&followerData()?.id==='mort'){}else{
      S().hp=Math.max(0,S().hp-incoming);
      if(S().hp<=0){if(runnerBattle.boss){bossLose();return;}S().hp=Math.max(1,Math.floor((Number(d.maxHp)||120)*.35));window.TerritoryStore.saveNow?.('pve-runner-recover');const rs=runnerBattle.root.querySelector('[data-run-status]');if(rs)rs.textContent='☠️ Герой пал. Восстановление…';setTimeout(tickRunner,900);return;}
    }
    window.TerritoryStore.saveNow?.('pve-tick');
    setTimeout(tickRunner,runnerBattle.boss?900:650);
  }
  document.addEventListener('click',e=>{
    const hz=e.target.closest?.('.hz');if(hz){e.preventDefault();e.stopPropagation();action[hz.dataset.action]?.();return;}
    if(e.target.closest?.('[data-run-close]')){stopRunner();return;}
    if(e.target.closest?.('[data-run-boss]')&&S().pve?.bossPending){startRunner(true);return;}
  });
  document.addEventListener('territory:render',paint);
  document.addEventListener('DOMContentLoaded',()=>{mount();paint();initTelegram();});
  window.HomeRebuild={refresh:paint,startRunner};
})();
