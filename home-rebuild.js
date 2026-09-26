(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let battle=null,boss=null;
const zones=[
['profile',0,0,18,6.2],['coins',18,0,24,6.2],['gems',42,0,20,6.2],['redgems',62,0,14,6.2],['trophy',76,0,7,6.2],['messages',83,0,8,6.2],['settings',91,0,9,6.2],
['energy',28,5.2,37,3.2],['attack',65,5.2,35,3.2],['chapter',28,9,44,5.2],
['events',0.4,9.0,10.5,6.3],['daily',0.4,15.8,10.5,6.3],['quests',0.4,22.7,10.5,6.3],['friends',0.4,29.5,10.5,6.3],['sea',0.4,36.4,10.5,7.0],
['shop',89.0,9.0,10.5,6.3],['forge',89.0,15.8,10.5,6.3],['challenges',89.0,22.7,10.5,6.3],['streets',89.0,29.5,10.5,6.3],['arena',89.0,36.4,10.5,7.0],
['hp',0,64,17,12],['equip1',17,64,9.4,12],['equip2',26.4,64,9.4,12],['equip3',35.8,64,9.4,12],['equip4',45.2,64,9.4,12],['equip5',54.6,64,9.4,12],['equip6',64.0,64,9.4,12],['equip7',73.4,64,9.4,12],['energyBottom',83,64,17,12],
['quest',0,84.0,52,6.8],['speed',61,83.5,8.5,7],['refresh',70.0,83.5,8.5,7],['crown',79.0,83.5,9,7],['star',88.5,83.5,11.5,7],
['skull',55,18,13,10]
];
const bottom=[['home',0,91,14.28,9],['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],['quests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9]];
const action={
profile:()=>window.showScreen?.('hero'),coins:()=>info('ЗОЛОТО','Монеты используются для развития героя.'),gems:()=>info('АЛМАЗЫ','Премиальная валюта.'),redgems:()=>info('КРАСНЫЕ КРИСТАЛЛЫ','Редкая валюта.'),trophy:()=>info('РЕЙТИНГ','Рейтинг игрока.'),messages:()=>info('СООБЩЕНИЯ','Сообщения.'),settings:()=>info('НАСТРОЙКИ','Настройки игры.'),
energy:()=>info('ЭНЕРГИЯ',`${Math.floor(S().energy)}/${S().maxEnergy}`),energyBottom:()=>info('ЭНЕРГИЯ',`${Math.floor(S().energy)}/${S().maxEnergy}`),hp:()=>info('ЗДОРОВЬЕ',`${Math.floor(S().hp)}/${Math.floor(S().maxHp)}`),
attack:()=>startRunner(false),chapter:()=>window.showScreen?.('map'),skull:()=>S().chapterBossUnlocked?openBoss():window.showScreen?.('map'),
events:()=>info('СОБЫТИЯ','События.'),daily:()=>info('ЕЖЕДНЕВНЫЕ НАГРАДЫ','Ежедневная награда.'),quests:()=>window.showScreen?.('quests'),friends:()=>info('ДРУЗЬЯ','Приглашения.'),sea:()=>info('МОРСКОЙ НАБОР','Набор.'),shop:()=>window.showScreen?.('shop'),forge:()=>window.ForgeV2?.open?.(),challenges:()=>window.ArenaGame?.open?.(),streets:()=>info('УЛИЦЫ','Раздел готовится.'),arena:()=>window.ArenaGame?.open?.(),equipment:()=>window.showScreen?.('inventory'),equip1:()=>window.showScreen?.('inventory'),equip2:()=>window.showScreen?.('inventory'),equip3:()=>window.showScreen?.('inventory'),equip4:()=>window.showScreen?.('inventory'),equip5:()=>window.showScreen?.('inventory'),equip6:()=>window.showScreen?.('inventory'),equip7:()=>window.showScreen?.('inventory'),
quest:()=>window.showScreen?.('quests'),speed:()=>info('УСКОРЕНИЕ','Ускорение боя.'),refresh:()=>info('ОБНОВИТЬ','Задание обновлено.'),crown:()=>info('НАГРАДЫ','Награды.'),star:()=>info('ПРЕМИУМ','Премиум.'),
home:()=>window.showScreen?.('home'),inventory:()=>window.showScreen?.('inventory'),hero:()=>window.showScreen?.('hero'),battle:()=>startRunner(false),quests:()=>window.showScreen?.('quests'),games:()=>window.showScreen?.('games'),clan:()=>window.showScreen?.('clan')
};
function info(t,b){const m=document.getElementById('modal'),body=document.getElementById('modalBody');if(!m||!body)return;body.innerHTML='<h2>'+t+'</h2><p>'+b+'</p>';m.classList.add('show')}
function mount(){
 const home=document.getElementById('home');if(!home||home.dataset.mounted)return;home.dataset.mounted='1';
 home.innerHTML='<div id="homeReferenceHost" class="home-reference-host"><img src="home-master.png" class="home-reference-image" alt=""><div id="homeRealHud"></div><div class="home-hitzones"></div><div class="home-bottom-zones"></div></div>';
 const layer=home.querySelector('.home-hitzones'),bot=home.querySelector('.home-bottom-zones');
 [...zones,...bottom].forEach((z,i)=>{const b=document.createElement('button');b.type='button';b.className='hz';b.dataset.action=z[0];b.setAttribute('aria-label',z[0]);b.style.cssText=`left:${z[1]}%;top:${z[2]}%;width:${z[3]}%;height:${z[4]}%;`;(i<zones.length?layer:bot).appendChild(b)});
 document.getElementById('homeRealHud').innerHTML='<span class="hud-clean hud-name"></span><span class="hud-clean hud-level"></span><span class="hud-clean hud-vip"></span><span class="hud-clean hud-coins"></span><span class="hud-clean hud-gems"></span><span class="hud-clean hud-redgems"></span><span class="hud-clean hud-energy"></span><span class="hud-clean hud-xp"></span><span class="hud-clean hud-hp"></span><span class="hud-clean hud-stones"></span>';
 paint();
}
function paint(){
 const s=S(),p=s.profile||{},q=(sel,val)=>{const e=document.querySelector(sel);if(e)e.textContent=val};
 q('.hud-name',p.displayName||'Игрок');q('.hud-level','Lv. '+s.level);q('.hud-vip','VIP '+(p.vip||0));q('.hud-coins',compact(s.coins));q('.hud-gems',compact(s.gems));q('.hud-redgems',compact(s.redGems));q('.hud-energy',`${Math.floor(s.energy)}/${Math.floor(s.maxEnergy)}`);q('.hud-xp',`${Math.floor(s.xp)}/${Math.floor(s.xpNext)}`);q('.hud-hp',`${Math.floor(s.hp)}/${Math.floor(s.maxHp)}`);q('.hud-stones','⚔️ '+Math.floor(s.battleStones||0));
 const skull=document.querySelector('.hz[data-action="skull"]');if(skull)skull.style.display=s.chapterBossUnlocked?'block':'none';
}
function compact(v){const n=Number(v)||0;return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.floor(n))}
function sync(){
 const s=S(),api=window.TerritoryChaptersAPI;if(api?.state){const c=api.state();s.currentChapter=Number(c.currentChapter)||1;s.chapterStage=Number(c.chapterStage)||1;s.chapterProgress=Number(c.chapterProgress)||0;s.chapterBossUnlocked=Boolean(c.chapterBossUnlocked&&s.chapterProgress>=100);s.pve=s.pve||{};s.pve.chapter=s.currentChapter;s.pve.stage=s.chapterStage;s.pve.progress=s.chapterProgress;s.pve.bossPending=s.chapterBossUnlocked}
}
function follower(){
 const id=S().activeFollower||S().followers?.activeFollower,api=window.Followers;if(!id||!api)return null;const f=api.get?.(id),cfg=api.CATALOG?.[id];return f&&cfg?{name:cfg.name,icon:cfg.icon}:null;
}
function ensureBattleCss(){
 if(document.getElementById('homeBattleReferenceCss'))return;
 const st=document.createElement('style');st.id='homeBattleReferenceCss';st.textContent=`
#runnerScreen.pve-reference-battle{position:fixed;inset:0;width:100vw;height:100dvh;z-index:2147483000;background:#111;color:#fff;overflow:hidden;font-family:Arial,sans-serif;touch-action:manipulation}
#runnerScreen .pve-bg{position:absolute;inset:0;background-image:linear-gradient(to bottom,rgba(7,18,25,.12),rgba(7,18,25,.18)),url("pve-reference-scene.jpg");background-size:cover;background-position:center top;animation:pveBgScroll 18s linear infinite;transform:scale(1.03)}
#runnerScreen .pve-vignette{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.18),transparent 24%,transparent 58%,rgba(0,0,0,.5))}
#runnerScreen .pve-top{position:absolute;left:0;right:0;top:0;height:10.5%;min-height:64px;padding:env(safe-area-inset-top) 10px 4px;display:flex;align-items:flex-end;gap:6px;z-index:20;background:linear-gradient(#07141ce8,#07141c22)}
#runnerScreen .pve-top .back{width:42px;height:42px;border:0;border-radius:12px;background:#171b20b8;color:#fff;font-size:26px;font-weight:900}
#runnerScreen .pve-top-main{min-width:0;flex:1}.pve-top-main b{display:block;font-size:12px;text-shadow:0 2px 3px #000}.pve-top-main span{display:block;margin-top:3px;font-size:10px;color:#f3d27b;text-shadow:0 2px 3px #000}
#runnerScreen .pve-top-res{display:flex;align-items:center;gap:3px;white-space:nowrap;font-size:10px;font-weight:900}.pve-res{padding:5px 6px;border-radius:8px;background:#15232bcc;border:1px solid #5b6870}.pve-res.stone{color:#ffd35e}
#runnerScreen .pve-field{position:absolute;left:0;right:0;top:10%;bottom:37%;z-index:5;overflow:hidden}
#runnerScreen .pve-ground{position:absolute;left:0;right:0;bottom:0;height:18%;background:linear-gradient(transparent,#171b18aa 35%,#15130fcc)}
#runnerScreen .pve-unit{position:absolute;bottom:5%;display:flex;flex-direction:column;align-items:center;z-index:8;filter:drop-shadow(0 9px 6px rgba(0,0,0,.45));transition:transform .25s ease}
#runnerScreen .pve-unit img{display:block;width:min(30vw,175px);max-height:31vh;object-fit:contain;object-position:center bottom;user-select:none;-webkit-user-drag:none}
#runnerScreen .pve-hero{left:7%;transform:translateX(0)}#runnerScreen .pve-enemy{left:120%;transform:translateX(-50%)}#runnerScreen .pve-follower{left:30%;bottom:9%;z-index:7}
#runnerScreen .pve-follower img{width:min(18vw,105px);opacity:.98}.pve-name{padding:3px 7px;border-radius:9px;background:#111a;color:#fff;font-size:10px;font-weight:900;text-shadow:0 1px 2px #000;white-space:nowrap}
#runnerScreen .pve-hp{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:110px;height:8px;border:1px solid #101010;background:#241010;border-radius:9px;overflow:hidden}.pve-hp i{display:block;height:100%;background:#df3b37}.pve-hp.player i{background:#2ac46b}
#runnerScreen .approach{animation:pveApproach .8s cubic-bezier(.2,.8,.2,1) forwards}.attack-move{animation:pveAttackMove .34s ease}.hit-shake{animation:pveHitShake .25s ease}.defeat{animation:pveDefeat .45s ease forwards}
#runnerScreen .pve-damage-layer{position:absolute;inset:0;z-index:18;pointer-events:none}.pve-damage{position:absolute;left:64%;top:42%;font-size:clamp(26px,9vw,64px);font-weight:1000;color:#ff2929;text-shadow:0 3px 0 #4a0000,0 0 10px #000;animation:pveDamage 720ms ease-out forwards}.pve-heal{color:#58ff77;text-shadow:0 3px 0 #075a16,0 0 10px #000}.pve-crit{color:#ffe75c;font-size:clamp(34px,11vw,78px)}
#runnerScreen .pve-vfx{position:absolute;left:62%;top:43%;width:70px;height:70px;border-radius:50%;z-index:17;pointer-events:none;animation:pveBurst .35s ease-out forwards;background:radial-gradient(circle,#fff 0 8%,#ffd83d 10% 25%,#ff6b20 28% 40%,transparent 65%)}
#runnerScreen .pve-panel{position:absolute;left:0;right:0;bottom:0;height:39%;min-height:245px;background:linear-gradient(#202326ee,#17191ccc 12%,#e8dfd0 12.5%,#e8dfd0 76%,#171b1eee 76.5%);z-index:25;border-top:2px solid #9b7440;padding:7px 7px env(safe-area-inset-bottom)}
#runnerScreen .pve-status{height:34px;display:flex;align-items:center;gap:7px}.pve-status .orb{width:40px;height:40px;border-radius:50%;border:3px solid #7b1a16;background:radial-gradient(circle at 35% 30%,#ff6d5c,#9f0000 65%,#350000);box-shadow:0 2px 8px #000}.pve-status .orb.blue{border-color:#165d86;background:radial-gradient(circle at 35% 30%,#61cfff,#0067aa 65%,#032e51)}.pve-bars{flex:1}.pve-bar{height:9px;border-radius:7px;background:#1b1717;border:1px solid #090909;overflow:hidden;margin:2px 0}.pve-bar i{display:block;height:100%;background:#25c85e}.pve-bar.xp i{background:#4d9dff}.pve-bars b{font-size:10px;color:#fff;text-shadow:0 1px 2px #000}.pve-stone-count{font-size:12px;font-weight:1000;color:#ffe15b;background:#392a12;border:1px solid #9c7530;border-radius:8px;padding:5px 7px}
#runnerScreen .pve-slots{height:94px;display:flex;gap:4px;align-items:center;overflow:hidden;padding:3px 0}
#runnerScreen .pve-slot{font:inherit;color:inherit;padding:0;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}#runnerScreen .pve-skill{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.pve-slot{flex:1;min-width:0;height:82px;border:2px solid #5f5140;border-radius:8px;background:linear-gradient(#6e6050,#292622);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px #b5a88e}.pve-slot b{font-size:23px}.pve-slot span{font-size:8px;color:#fff;margin-top:2px}.pve-slot small{font-size:8px;color:#f0d35d}.pve-slot.lock{opacity:.45}
#runnerScreen .pve-skills{height:50px;display:flex;gap:6px;align-items:center;justify-content:center}.pve-skill{width:44px;height:44px;border-radius:9px;border:2px solid #76562b;background:linear-gradient(#725021,#271b10);color:#fff;font-size:20px;box-shadow:0 2px 5px #000}.pve-skill:active{transform:scale(.94)}.pve-skill.main{width:58px;border-color:#d5aa48;background:linear-gradient(#a16e1d,#3e2508);font-size:24px}
#runnerScreen .pve-bottom-nav{height:46px;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:4px}.pve-bottom-nav button{border:1px solid #6f5939;background:#171b1f;color:#f7ead4;border-radius:5px;font-size:8px;font-weight:900}.pve-bottom-nav button.active{background:#3b2c17;border-color:#d1a23f;color:#ffe177}.pve-bottom-nav i{display:block;font-size:16px;font-style:normal}
#runnerScreen .pve-reward{position:absolute;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:#0008}.pve-reward.show{display:flex}.pve-reward-card{width:min(88vw,390px);border:2px solid #d7ad55;border-radius:16px;background:linear-gradient(#30281d,#141414);padding:20px;text-align:center;box-shadow:0 12px 40px #000}.pve-reward-card h2{margin:0 0 10px;color:#ffd66b;font-size:22px}.pve-reward-card .reward-line{display:flex;justify-content:center;gap:18px;font-size:18px;margin:12px 0}.pve-reward-card button{width:100%;height:46px;border:1px solid #d6ad56;border-radius:10px;background:#694918;color:#fff;font-weight:1000}
@keyframes pveBgScroll{0%{background-position:50% 0}50%{background-position:46% 0}100%{background-position:50% 0}}@keyframes pveApproach{from{left:120%}to{left:68%}}@keyframes pveAttackMove{50%{transform:translateX(28px) scale(1.04)}100%{transform:translateX(0)}}@keyframes pveHitShake{0%,100%{transform:translateX(-50%)}50%{transform:translateX(calc(-50% - 9px))}}@keyframes pveDefeat{to{opacity:0;transform:translateX(-50%) scale(.65) rotate(7deg)}}@keyframes pveDamage{0%{opacity:0;transform:translateY(18px) scale(.65)}20%{opacity:1}100%{opacity:0;transform:translateY(-105px) scale(1.12)}}@keyframes pveBurst{0%{opacity:0;transform:scale(.2)}30%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(1.9)}}
#hardMobileNav.pve-hidden{display:none!important}
@media (min-width:700px){#runnerScreen .pve-panel{height:35%}#runnerScreen .pve-field{bottom:33%}#runnerScreen .pve-unit img{width:150px}}
`;
 document.head.appendChild(st);
}
function startRunner(forceBoss){
 sync(); if(forceBoss)return openBoss();
 const s=S(); if(s.chapterBossUnlocked){s.chapterProgress=0;s.chapterStage=1;s.pve.progress=0;s.pve.stage=1;s.pve.bossPending=true;s.pve.bossActive=false;window.TerritoryStore.saveNow?.('pve-farm-after-boss')}
 stopRunner();ensureBattleCss();
 const root=document.createElement('div');root.id='runnerScreen';root.className='pve-reference-battle';
 const f=follower();
 root.innerHTML=`<div class="pve-bg"></div><div class="pve-vignette"></div>
 <header class="pve-top"><button class="back" data-pve-close>‹</button><div class="pve-top-main"><b data-run-status>Глава ${s.currentChapter} · Бой</b><span data-run-stage>Этап ${s.chapterStage} · ${s.chapterProgress}%</span></div><div class="pve-top-res"><span class="pve-res">🪙 ${compact(s.coins)}</span><span class="pve-res">💎 ${compact(s.gems)}</span><span class="pve-res stone">🪨 <b data-run-stones>${Math.floor(s.battleStones||0)}</b></span></div></header>
 <main class="pve-field"><div class="pve-ground"></div><div class="pve-damage-layer"></div>
   <div class="pve-unit pve-hero" data-pve-hero><div class="pve-hp player"><i data-player-hpbar style="width:100%"></i></div><img src="player-viking-approved.png" alt=""><span class="pve-name">${esc(s.profile?.displayName||'Игрок')}</span></div>
   ${f?`<div class="pve-unit pve-follower"><img src="player-viking-approved.png" alt=""><span class="pve-name">${esc(f.name)}</span></div>`:''}
   <div class="pve-unit pve-enemy" data-run-enemy><div class="pve-hp"><i data-enemy-hpbar style="width:100%"></i></div><img src="opponent-viking-approved.png" alt=""><span class="pve-name" data-run-enemy-name>Разбойник</span></div>
 </main>
 <section class="pve-panel"><div class="pve-status"><div class="orb"></div><div class="pve-bars"><b data-pve-hptext>${Math.floor(s.hp)}/${Math.floor(s.maxHp)}</b><div class="pve-bar"><i data-pve-hpbar style="width:${Math.max(0,Math.min(100,s.hp/s.maxHp*100))}%"></i></div><div class="pve-bar xp"><i data-pve-xpbar style="width:${Math.max(0,Math.min(100,s.xp/s.xpNext*100))}%"></i></div></div><div class="orb blue"></div><div class="pve-stone-count">🪨 <span data-panel-stones>${Math.floor(s.battleStones||0)}</span></div></div>
   <div class="pve-slots" data-pve-slots>${Array.from({length:7},(_,i)=>`<button type="button" class="pve-slot ${Array.isArray(s.equipment)&&!s.equipment[i]?'lock':''}" data-pve-equip="${i}" aria-label="Слот экипировки ${i+1}"><b>${['🗡️','🛡️','🪓','🪖','🧤','💍','🧿'][i]}</b><small>Lv.${Array.isArray(s.equipment)&&s.equipment[i]?s.level:0}</small><span>${Array.isArray(s.equipment)&&s.equipment[i]?'ЭКИП':'ПУСТО'}</span></button>`).join('')}</div>
   <div class="pve-skills"><button type="button" class="pve-skill" data-pve-skill="lightning">⚡</button><button type="button" class="pve-skill" data-pve-skill="fire">🔥</button><button type="button" class="pve-skill main" data-pve-skill="attack">⚔️</button><button type="button" class="pve-skill" data-pve-skill="heal">💚</button><button type="button" class="pve-skill" data-pve-skill="magic">🌀</button><button type="button" class="pve-skill" data-pve-skill="x2">×2</button><button type="button" class="pve-skill" data-pve-auto>AUTO</button></div>
   <nav class="pve-bottom-nav">${[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','⚔️','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🚩','Клан']].map(x=>`<button data-pve-nav="${x[0]}" class="${x[0]==='battle'?'active':''}"><i>${x[1]}</i>${x[2]}</button>`).join('')}</nav>
 </section><div class="pve-reward" data-pve-reward><div class="pve-reward-card"><h2>Победа!</h2><div class="reward-line"><span>🪙 <b data-reward-coins>0</b></span><span>⭐ <b data-reward-xp>0</b></span></div><button data-pve-next>СЛЕДУЮЩИЙ БОЙ</button></div></div>`;
 document.body.appendChild(root);document.getElementById('hardMobileNav')?.classList.add('pve-hidden');
 battle={root,enemyHp:0,enemyMax:0,index:0,running:true,auto:true};spawn();scheduleHit(450);
}
function stopRunner(){if(battle?.timer)clearTimeout(battle.timer);if(battle?.root)battle.root.remove();battle=null;document.getElementById('hardMobileNav')?.classList.remove('pve-hidden')}
function spawn(){
 if(!battle)return;const s=S(),root=battle.root,ch=window.TerritoryChaptersAPI?.current?.()||{};battle.enemyMax=Math.max(80,Number(ch.enemy?.hp)||80+Number(s.currentChapter)*18);battle.enemyHp=battle.enemyMax;battle.index++;
 const names=['Разбойник','Северный воин','Наёмник','Охотник','Варяг'];root.querySelector('[data-run-enemy-name]').textContent=names[(battle.index-1)%names.length];root.querySelector('[data-run-status]').textContent=`Глава ${s.currentChapter} · Бой`;
 root.querySelector('[data-run-stage]').textContent=`Этап ${s.chapterStage} · ${s.chapterProgress}%`;
 const e=root.querySelector('[data-run-enemy]');e.classList.remove('approach','defeat');void e.offsetWidth;e.classList.add('approach');renderBattleHud();
}
function equipmentPower(s){const eq=Array.isArray(s.equipment)?s.equipment.slice(0,7):[];const filled=eq.filter(Boolean).length;let quality=.58+(filled/7)*.52;if(typeof s.equipment==='number')quality=.72;return Math.max(.58,Math.min(1.1,quality))}
function renderBattleHud(){if(!battle)return;const s=S(),r=battle.root,p=Math.max(0,Math.min(100,(s.hp/Math.max(1,s.maxHp))*100)),x=Math.max(0,Math.min(100,(s.xp/Math.max(1,s.xpNext))*100)),e=Math.max(0,Math.min(100,(battle.enemyHp/Math.max(1,battle.enemyMax))*100));r.querySelector('[data-pve-hpbar]').style.width=p+'%';r.querySelector('[data-player-hpbar]').style.width=p+'%';r.querySelector('[data-pve-hptext]').textContent=`${Math.floor(s.hp)}/${Math.floor(s.maxHp)}`;r.querySelector('[data-pve-xpbar]').style.width=x+'%';r.querySelector('[data-enemy-hpbar]').style.width=e+'%';r.querySelector('[data-run-stones]').textContent=Math.floor(s.battleStones||0);r.querySelector('[data-panel-stones]').textContent=Math.floor(s.battleStones||0);r.querySelector('[data-run-stage]').textContent=`Этап ${s.chapterStage} · ${s.chapterProgress}%`}
function scheduleHit(ms){if(!battle?.running)return;if(battle.timer)clearTimeout(battle.timer);battle.timer=setTimeout(doBotHit,ms)}
function doBotHit(){
 if(!battle?.running)return;const s=S(),d=window.TerritoryStore.getDerivedStats();
 if(Number(s.battleStones||0)<=0){finishNoStones();return}
 const quality=equipmentPower(s),base=Math.max(8,Math.floor((d.strength||10)*(.9+Math.random()*.5))),dmg=Math.max(1,Math.floor(base*quality));
 s.battleStones=Math.max(0,Number(s.battleStones)-1);battle.enemyHp=Math.max(0,battle.enemyHp-dmg);s.hp=Math.max(1,s.hp-Math.max(1,Math.floor(3+d.defense/30)));window.TerritoryStore.saveNow?.('pve-bot-hit-stone');
 const hero=battle.root.querySelector('[data-pve-hero]'),enemy=battle.root.querySelector('[data-run-enemy]');hero.classList.add('attack-move');enemy.classList.add('hit-shake');setTimeout(()=>{hero.classList.remove('attack-move');enemy.classList.remove('hit-shake')},350);spawnVfx();floatDamage(dmg,false);renderBattleHud();
 if(battle.enemyHp<=0){enemy.classList.add('defeat');s.coins+=25+Math.floor(s.level*2);const gain=12+Math.floor(s.currentChapter*2);window.TerritoryStore.addXp?.(gain);window.TerritoryChaptersAPI?.completeStage?.();sync();paint();renderBattleHud();showReward(25+Math.floor(s.level*2),gain);return}
 if(s.hp<=0){s.hp=Math.max(1,Math.floor(s.maxHp*.4));window.TerritoryStore.saveNow?.('pve-recover')}
 scheduleHit(650);
}
function showReward(coins,xp){if(!battle)return;const r=battle.root;r.querySelector('[data-reward-coins]').textContent=coins;r.querySelector('[data-reward-xp]').textContent=xp;r.querySelector('[data-pve-reward]').classList.add('show');battle.running=false;}
function nextBot(){if(!battle)return;const s=S();battle.root.querySelector('[data-pve-reward]').classList.remove('show');if(s.chapterProgress>=100){s.chapterBossUnlocked=true;s.pve.bossPending=true;window.TerritoryStore.saveNow?.('pve-bots-100');battle.running=false;setTimeout(()=>{stopRunner();window.showScreen?.('home');paint()},350);return}if(Number(s.battleStones||0)<=0){finishNoStones();return}battle.running=true;spawn();scheduleHit(700)}
function finishNoStones(){if(!battle)return;battle.running=false;const st=battle.root.querySelector('[data-run-status]');if(st)st.textContent='⚠️ Боевые камни закончились';setTimeout(()=>{stopRunner();window.showScreen?.('home');paint()},1000)}
function spawnVfx(){if(!battle)return;const e=document.createElement('div');e.className='pve-vfx';battle.root.querySelector('.pve-field').appendChild(e);setTimeout(()=>e.remove(),380)}
function floatDamage(v,heal){const l=battle?.root?.querySelector('.pve-damage-layer');if(!l)return;const e=document.createElement('div');e.className='pve-damage'+(heal?' pve-heal':'');e.textContent=(heal?'+':'-')+v;l.appendChild(e);setTimeout(()=>e.remove(),760)}
function battleAction(kind){
 if(!battle||!battle.running)return;
 const s=S();
 if(kind==='heal'){
   const gain=Math.max(10,Math.floor(s.maxHp*.08));s.hp=Math.min(s.maxHp,s.hp+gain);window.TerritoryStore.saveNow?.('pve-skill-heal');floatDamage(gain,true);renderBattleHud();return;
 }
 if(kind==='x2'){battle.multiplier=battle.multiplier===2?1:2;const el=battle.root.querySelector('[data-pve-skill="x2"]');if(el)el.textContent=battle.multiplier===2?'×2✓':'×2';return;}
 if(Number(s.battleStones||0)<=0){finishNoStones();return;}
 const quality=equipmentPower(s),d=window.TerritoryStore.getDerivedStats();
 const base=Math.max(8,Math.floor((d.strength||10)*(.9+Math.random()*.5)));const bonus={lightning:1.05,fire:1.2,attack:1,magic:1.1}[kind]||1;const dmg=Math.max(1,Math.floor(base*quality*bonus*(battle.multiplier||1)));
 s.battleStones=Math.max(0,Number(s.battleStones)-1);battle.enemyHp=Math.max(0,battle.enemyHp-dmg);window.TerritoryStore.saveNow?.('pve-skill-hit');spawnVfx();floatDamage(dmg,false);renderBattleHud();
 if(battle.enemyHp<=0){const enemy=battle.root.querySelector('[data-run-enemy]');enemy.classList.add('defeat');s.coins+=25+Math.floor(s.level*2);const gain=12+Math.floor(s.currentChapter*2);window.TerritoryStore.addXp?.(gain);window.TerritoryChaptersAPI?.completeStage?.();sync();paint();renderBattleHud();showReward(25+Math.floor(s.level*2),gain);}
}
function battleEquip(i){
 if(!battle)return;const s=S();s.equipment=Array.isArray(s.equipment)?s.equipment.slice(0,7):Array(7).fill(null);while(s.equipment.length<7)s.equipment.push(null);
 s.equipment[i]=s.equipment[i]?null:{id:'test-'+(i+1),name:'Тестовый предмет '+(i+1),level:s.level};window.TerritoryStore.saveNow?.('pve-equipment-slot');
 const btn=battle.root.querySelector(`[data-pve-equip="${i}"]`);if(btn){btn.classList.toggle('lock',!s.equipment[i]);btn.querySelector('small').textContent='Lv.'+(s.equipment[i]?s.level:0);btn.querySelector('span').textContent=s.equipment[i]?'ЭКИП':'ПУСТО';}
 renderBattleHud();
}
function openBoss(){
 sync();const s=S();if(!s.chapterBossUnlocked)return;
 stopRunner();s.pve=s.pve||{};s.pve.bossPending=true;s.pve.bossActive=true;window.TerritoryStore.saveNow?.('boss-open');window.showScreen?.('bossBattle');initBoss();
}
function initBoss(){
 const s=S();boss={hp:Math.max(500,500+s.currentChapter*100),max:Math.max(500,500+s.currentChapter*100),player:Math.max(1,s.hp),maxPlayer:s.maxHp,auto:false,done:false};
 document.getElementById('bossChapterText').textContent='Глава '+s.currentChapter+' · Босс доступен';document.getElementById('bossPlayerName').textContent=s.profile?.displayName||'Игрок';document.getElementById('bossName').textContent='Владыка Севера';document.getElementById('bossResult').classList.add('hidden');renderBoss();
}
function bossHit(){
 if(!boss||boss.done)return;const s=S(),d=window.TerritoryStore.getDerivedStats();const dealt=Math.max(18,Math.floor((d.strength||10)*(1+Math.random()*.45)));boss.hp=Math.max(0,boss.hp-dealt);
 const incoming=Math.max(4,Math.floor(7-d.defense/25+Math.random()*5));boss.player=Math.max(0,boss.player-incoming);s.hp=boss.player;window.TerritoryStore.saveNow?.('boss-hit');renderBoss();
 if(boss.hp<=0)return bossFinish(true);if(boss.player<=0)return bossFinish(false);
 if(boss.auto)setTimeout(bossHit,850);
}
function renderBoss(){if(!boss)return;const s=S();const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set('bossHpText',`${Math.floor(boss.hp)} / ${Math.floor(boss.max)}`);set('bossPlayerHpText',`${Math.floor(boss.player)} / ${Math.floor(boss.maxPlayer)}`);document.getElementById('bossHpBar').style.width=(boss.hp/boss.max*100)+'%';document.getElementById('bossPlayerHpBar').style.width=(boss.player/boss.maxPlayer*100)+'%';document.getElementById('bossAuto').textContent=boss.auto?'AUTO: ВКЛ':'AUTO'}
function bossFinish(win){
 if(!boss)return;boss.done=true;const s=S();s.pve.bossActive=false;
 const result=document.getElementById('bossResult'),title=document.getElementById('bossResultTitle'),text=document.getElementById('bossResultText'),btn=document.getElementById('bossResultBtn');
 result.classList.remove('hidden');
 if(win){
  window.TerritoryChaptersAPI?.completeBoss?.();s.chapterBossUnlocked=false;s.chapterBossDefeated=true;s.chapterCompleted=true;s.coins+=250+s.currentChapter*25;window.TerritoryStore.addXp?.(100);
  title.textContent='🏆 БОСС ПОБЕЖДЁН';text.textContent='Глава завершена. Открывается следующая глава.';btn.textContent='СЛЕДУЮЩАЯ ГЛАВА';btn.onclick=()=>{window.TerritoryChaptersAPI?.nextChapter?.();sync();result.classList.add('hidden');window.showScreen?.('home');paint()}
 }else{
  s.chapterBossUnlocked=true;s.pve.bossPending=true;s.hp=Math.max(1,Math.floor(s.maxHp*.35));window.TerritoryStore.saveNow?.('boss-loss');
  title.textContent='☠️ БОСС НЕ ПОБЕЖДЁН';text.textContent='Можно вернуться на HOME, продолжать бить ботов, получать XP и монеты, а затем снова нажать ☠️.';btn.textContent='ДАЛЬШЕ БИТЬ БОТОВ';btn.onclick=()=>{result.classList.add('hidden');window.showScreen?.('home');paint()}
 }
 window.TerritoryStore.saveNow?.('boss-result');paint();
}
document.addEventListener('click',e=>{
 const hz=e.target.closest?.('.hz');if(hz){e.preventDefault();e.stopImmediatePropagation();action[hz.dataset.action]?.();return}
 if(e.target.closest?.('#bossBack,#bossLeave')){boss?.auto&&(boss.auto=false);boss=null;window.showScreen?.('home');paint();return}
 if(e.target.closest?.('#bossHit')){bossHit();return}
 if(e.target.closest?.('#bossAuto')){if(!boss)return;boss.auto=!boss.auto;renderBoss();if(boss.auto)bossHit();return}
 if(e.target.closest?.('[data-pve-close]')){stopRunner();window.showScreen?.('home');paint();return}
 if(e.target.closest?.('[data-pve-next]')){nextBot();return}
 if(e.target.closest?.('[data-pve-equip]')){e.preventDefault();e.stopImmediatePropagation();battleEquip(Number(e.target.closest('[data-pve-equip]').dataset.pveEquip));return}
 if(e.target.closest?.('[data-pve-auto]')){if(!battle)return;battle.auto=!battle.auto;e.target.textContent=battle.auto?'AUTO':'РУЧНОЙ';if(battle.auto&&!battle.running)scheduleHit(300);return}
 if(e.target.closest?.('[data-pve-skill]')){battleAction(e.target.closest('[data-pve-skill]').dataset.pveSkill);return}
 if(e.target.closest?.('[data-pve-nav]')){const id=e.target.closest('[data-pve-nav]').dataset.pveNav;if(id==='battle')return;if(id==='home'){stopRunner();window.showScreen?.('home');paint();return}stopRunner();window.showScreen?.(id);return}
 if(e.target.closest?.('#fjordsStart')){startRunner(false);return}
 if(e.target.closest?.('#mapChapterSkull')){openBoss();return}
});
window.addEventListener('territory:state-changed',()=>{sync();paint()});
document.addEventListener('DOMContentLoaded',()=>{mount();sync();paint();window.showScreen?.('home')});
window.HomeRebuild={refresh:paint,startRunner,stopRunner,openBoss};
})();