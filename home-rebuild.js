(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let battle=null,boss=null;
const zones=[
['profile',0,0,27.5,6.5],['coins',27.5,0,18,5.8],['gems',45.5,0,18,5.8],['redgems',63.5,0,16,5.8],['trophy',79.5,0,6.5,5.8],['messages',86,0,7,5.8],['settings',93,0,7,5.8],
['energy',30,4.5,28,5.2],['attack',64,4.2,34,6.3],['chapter',30,9,41,5.5],['events',0,9,13,8],['daily',0,16.2,13,8],['quests',0,23.4,13,8],['friends',0,30.6,13,8],['sea',0,38,13,8],
['shop',87,9,13,8],['forge',87,16.2,13,8],['challenges',87,23.4,13,8],['streets',87,30.6,13,8],['arena',87,38,13,8],['hp',0,64,18,12],['equipment',18,64,65,12],['energyBottom',83,64,17,12],
['quest',0,84.2,51,7.2],['speed',61,83.7,8.5,7],['refresh',70.5,83.7,8.5,7],['crown',80,83.7,8.5,7],['star',89.5,83.7,10.5,7],
['skull',55,18,13,12]
];
const bottom=[['home',0,91,14.28,9],['inventory',14.28,91,14.28,9],['hero',28.56,91,14.28,9],['battle',42.84,90,14.32,10],['quests',57.16,91,14.28,9],['games',71.44,91,14.28,9],['clan',85.72,91,14.28,9]];
const action={
profile:()=>window.showScreen?.('hero'),coins:()=>info('ЗОЛОТО','Монеты используются для развития героя.'),gems:()=>info('АЛМАЗЫ','Премиальная валюта.'),redgems:()=>info('КРАСНЫЕ КРИСТАЛЛЫ','Редкая валюта.'),trophy:()=>info('РЕЙТИНГ','Рейтинг игрока.'),messages:()=>info('СООБЩЕНИЯ','Сообщения.'),settings:()=>info('НАСТРОЙКИ','Настройки игры.'),
energy:()=>info('ЭНЕРГИЯ',`${Math.floor(S().energy)}/${S().maxEnergy}`),energyBottom:()=>info('ЭНЕРГИЯ',`${Math.floor(S().energy)}/${S().maxEnergy}`),hp:()=>info('ЗДОРОВЬЕ',`${Math.floor(S().hp)}/${Math.floor(S().maxHp)}`),
attack:()=>startRunner(false),chapter:()=>window.showScreen?.('map'),skull:()=>S().chapterBossUnlocked?openBoss():window.showScreen?.('map'),
events:()=>info('СОБЫТИЯ','События.'),daily:()=>info('ЕЖЕДНЕВНЫЕ НАГРАДЫ','Ежедневная награда.'),quests:()=>window.showScreen?.('quests'),friends:()=>info('ДРУЗЬЯ','Приглашения.'),sea:()=>info('МОРСКОЙ НАБОР','Набор.'),shop:()=>window.showScreen?.('shop'),forge:()=>window.ForgeV2?.open?.(),challenges:()=>window.ArenaGame?.open?.(),streets:()=>info('УЛИЦЫ','Раздел готовится.'),arena:()=>window.ArenaGame?.open?.(),equipment:()=>window.showScreen?.('inventory'),
quest:()=>window.showScreen?.('quests'),speed:()=>info('УСКОРЕНИЕ','Ускорение боя.'),refresh:()=>info('ОБНОВИТЬ','Задание обновлено.'),crown:()=>info('НАГРАДЫ','Награды.'),star:()=>info('ПРЕМИУМ','Премиум.'),
home:()=>window.showScreen?.('home'),inventory:()=>window.showScreen?.('inventory'),hero:()=>window.showScreen?.('hero'),battle:()=>startRunner(false),quests:()=>window.showScreen?.('quests'),games:()=>window.showScreen?.('games'),clan:()=>window.showScreen?.('clan')
};
function info(t,b){const m=document.getElementById('modal'),body=document.getElementById('modalBody');if(!m||!body)return;body.innerHTML='<h2>'+t+'</h2><p>'+b+'</p>';m.classList.add('show')}
function mount(){
 const home=document.getElementById('home');if(!home||home.dataset.mounted)return;home.dataset.mounted='1';
 home.innerHTML='<div class="home-reference-host"><img src="home-master.png" class="home-reference-image" alt=""><div id="homeRealHud"></div><div class="home-hitzones"></div><div class="home-bottom-zones"></div></div>';
 const layer=home.querySelector('.home-hitzones'),bot=home.querySelector('.home-bottom-zones');
 [...zones,...bottom].forEach((z,i)=>{const b=document.createElement('button');b.type='button';b.className='hz';b.dataset.action=z[0];b.style.cssText=`left:${z[1]}%;top:${z[2]}%;width:${z[3]}%;height:${z[4]}%;`;(i<zones.length?layer:bot).appendChild(b)});
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
function startRunner(forceBoss){
 sync();
 if(forceBoss)return openBoss();
 const s=S();
 // After a boss loss, ordinary BOЙ deliberately starts a new farm run.
 if(s.chapterBossUnlocked){s.chapterProgress=0;s.chapterStage=1;s.pve.progress=0;s.pve.stage=1;s.pve.bossPending=true;s.pve.bossActive=false;window.TerritoryStore.saveNow?.('pve-farm-after-boss')}
 stopRunner();
 const root=document.createElement('div');root.id='runnerScreen';root.className='runner-screen show home-battle-overlay';
 const f=follower();
 root.innerHTML=`<div class="runner-scene-status"><b data-run-status>Идём вперёд</b><span data-run-progress>${s.chapterProgress}%</span><span data-run-stones>⚔️ ${Math.floor(s.battleStones||0)}</span></div><div class="runner-stage"><div class="runner-character player-runner"><img src="player-viking-approved.png" alt=""><span>${esc(s.profile?.displayName||'Игрок')}</span></div>${f?`<div class="runner-follower"><i>${esc(f.icon)}</i><b>${esc(f.name)}</b></div>`:''}<div class="runner-enemy" data-run-enemy><img src="opponent-viking-approved.png" alt=""><span data-run-enemy-name>Разбойник</span></div><div class="runner-damage-layer"></div></div>`;
 document.body.appendChild(root);battle={root,enemyHp:0,enemyMax:0,index:0,running:true};tick();
}
function stopRunner(){if(battle?.root)battle.root.remove();battle=null}
function spawn(){
 const s=S(),root=battle.root,bossMode=false;const ch=window.TerritoryChaptersAPI?.current?.()||{};battle.enemyMax=Math.max(60,Number(ch.enemy?.hp)||70+Number(s.currentChapter)*12);battle.enemyHp=battle.enemyMax;battle.index++;
 const names=['Разбойник','Северный воин','Наёмник','Охотник'];root.querySelector('[data-run-enemy-name]').textContent=names[(battle.index-1)%names.length];root.querySelector('[data-run-status]').textContent='Бот приближается…';
 const e=root.querySelector('[data-run-enemy]');e.classList.remove('runner-enemy-enter');void e.offsetWidth;e.classList.add('runner-enemy-enter');
}
function equipmentPower(s){
 const eq=Array.isArray(s.equipment)?s.equipment.slice(0,7):[];
 let filled=eq.filter(Boolean).length;
 // Empty/weak loadout means less damage per hit, therefore more hits and more stones.
 // Fully equipped hero gets normal damage; partially equipped hero needs proportionally more hits.
 let quality=0.58+(filled/7)*0.52;
 // Keep compatibility with old saves where equipment was a numeric slot index.
 if(typeof s.equipment==='number') quality=0.72;
 return Math.max(0.58,Math.min(1.10,quality));
}
function updateRunnerStones(){
 const e=battle?.root?.querySelector('[data-run-stones]');
 if(e)e.textContent='⚔️ '+Math.floor(S().battleStones||0);
}
function tick(){
 if(!battle?.running)return;
 const s=S(),d=window.TerritoryStore.getDerivedStats();
 if(!battle.enemyMax)spawn();

 // Exactly 1 stone is consumed by exactly 1 real hit on a bot.
 // No stone = no new bot, and no reward is granted.
 if(Number(s.battleStones||0)<=0){
   battle.running=false;
   const st=battle.root.querySelector('[data-run-status]');
   if(st)st.textContent='⚠️ БОЕВЫЕ КАМНИ ЗАКОНЧИЛИСЬ';
   updateRunnerStones();
   setTimeout(()=>{if(battle){stopRunner();window.showScreen?.('home');paint()}},900);
   return;
 }

 const quality=equipmentPower(s);
 const base=Math.max(8,Math.floor((d.strength||10)*(0.9+Math.random()*0.5)));
 const dmg=Math.max(1,Math.floor(base*quality));

 // Spend the stone only when the hit actually happens.
 s.battleStones=Math.max(0,Number(s.battleStones)-1);
 battle.enemyHp=Math.max(0,battle.enemyHp-dmg);
 floatDamage(dmg);
 s.hp=Math.max(0,s.hp-Math.max(1,Math.floor(3+d.defense/30)));
 window.TerritoryStore.saveNow?.('pve-bot-hit-stone');
 updateRunnerStones();

 if(battle.enemyHp<=0){
   s.coins+=25+Math.floor(s.level*2);
   window.TerritoryStore.addXp?.(12+Math.floor(s.currentChapter*2));
   window.TerritoryChaptersAPI?.completeStage?.();sync();paint();
   if(s.chapterProgress>=100){
     s.chapterBossUnlocked=true;s.pve.bossPending=true;
     window.TerritoryStore.saveNow?.('pve-bots-100');
     battle.running=false;
     setTimeout(()=>{stopRunner();window.showScreen?.('home');paint()},700);
     return
   }
   if(Number(s.battleStones||0)<=0){
     battle.running=false;
     const st=battle.root.querySelector('[data-run-status]');
     if(st)st.textContent='⚠️ Бот побеждён · камни закончились';
     updateRunnerStones();
     setTimeout(()=>{if(battle){stopRunner();window.showScreen?.('home');paint()}},900);
     return
   }
   battle.enemyMax=0;setTimeout(tick,650);return
 }
 if(s.hp<=0){s.hp=Math.max(1,Math.floor(s.maxHp*.4));window.TerritoryStore.saveNow?.('pve-recover')}
 setTimeout(tick,650);
}
function floatDamage(v){const l=battle?.root?.querySelector('.runner-damage-layer');if(!l)return;const e=document.createElement('div');e.className='runner-damage';e.textContent='-'+v;l.appendChild(e);setTimeout(()=>e.remove(),700)}
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
 if(e.target.closest?.('#fjordsStart')){startRunner(false);return}
 if(e.target.closest?.('#mapChapterSkull')){openBoss();return}
});
window.addEventListener('territory:state-changed',()=>{sync();paint()});
document.addEventListener('DOMContentLoaded',()=>{mount();sync();paint();window.showScreen?.('home')});
window.HomeRebuild={refresh:paint,startRunner,openBoss};
})();