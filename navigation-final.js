/* Territory Game — FINAL INPUT ROUTER 10009
   One touch router for HOME hitzones, internal back buttons, Arena controls and persistent bottom nav. */
(function(){
'use strict';

const HOME={
 profile:()=>go('hero'),coins:()=>info('ЗОЛОТО','Текущий запас золота.'),gems:()=>info('АЛМАЗЫ','Текущий запас алмазов.'),redgems:()=>info('КРАСНЫЕ КРИСТАЛЛЫ','Текущий запас красных кристаллов.'),
 trophy:()=>info('РЕЙТИНГ','Рейтинг игрока.'),messages:()=>info('СООБЩЕНИЯ','Сообщения появятся здесь.'),settings:()=>info('НАСТРОЙКИ','Настройки игры.'),energy:()=>info('ЭНЕРГИЯ','Текущий запас энергии.'),energyBottom:()=>info('ЭНЕРГИЯ','Текущий запас энергии.'),hp:()=>info('ЗДОРОВЬЕ','Текущее здоровье героя.'),
 attack:()=>window.HomeRebuild?.startRunner?.(false),chapter:()=>window.HomeRebuild?.startRunner?.(false),
 events:()=>info('СОБЫТИЯ','Раздел событий.'),daily:()=>info('ЕЖЕДНЕВНЫЕ НАГРАДЫ','Ежедневные награды.'),quests:()=>go('districts'),friends:()=>info('ПРИГЛАСИТЬ ДРУЗЕЙ','Приглашения и бонусы.'),sea:()=>info('МОРСКОЙ НАБОР','Раздел морского набора. В разработке.'),
 shop:()=>go('market'),forge:()=>window.ForgeV2?.open?.()||go('market'),challenges:()=>info('ИСПЫТАНИЯ','Раздел испытаний. В разработке.'),streets:()=>info('ЗАХВАТ УЛИЦ','Раздел захвата улиц. В разработке.'),arena:()=>window.ArenaGame?.open?.(),
 inventory:()=>go('inventory'),hero:()=>go('hero'),home:()=>go('home'),battle:()=>window.HomeRebuild?.startRunner?.(false),bottomQuests:()=>go('districts'),game:()=>go('casino'),clan:()=>info('КЛАН','Раздел в разработке.'),
 quest:()=>info('КВЕСТ','2-7 Пройти Северные земли.'),speed:()=>info('УСКОРЕНИЕ','Ускорение боя.'),refresh:()=>info('ОБНОВИТЬ','Обновление задания.'),crown:()=>info('НАГРАДЫ','Награды и достижения.'),star:()=>info('ПРЕМИУМ','Дополнительные награды.'),
 lock1:()=>info('СЛОТ','Откроется на Lv. 90.'),lock2:()=>info('СЛОТ','Откроется после доступа к Арене.'),lock3:()=>info('СЛОТ','Откроется позже.'),
 consumable1:()=>window.CombatItems?.use?.('elixir_hp'),consumable2:()=>window.CombatItems?.use?.('elixir_energy'),consumable3:()=>window.CombatItems?.use?.('elixir_attack'),consumable4:()=>window.CombatItems?.use?.('elixir_guard')
};

function closeLayers(){
 document.getElementById('runnerScreen')?.remove();
 try{window.ArenaGame?.close?.();}catch(_){ }
 document.getElementById('arenaModal')?.classList.remove('show');
 document.querySelectorAll('.forge-v2-overlay').forEach(x=>x.remove());
}
function go(id){closeLayers();const allowed=['home','inventory','hero','districts','market','casino'];window.showScreen?.(allowed.includes(id)?id:'home');sync();}
function info(title,text){let m=document.getElementById('finalInfoModal');if(!m){m=document.createElement('div');m.id='finalInfoModal';m.innerHTML='<div class="final-info-card"><button data-final-close>×</button><b></b><span></span><button data-final-close>ОК</button></div>';document.body.appendChild(m);}m.querySelector('b').textContent=title;m.querySelector('span').textContent=text;m.classList.add('show');}
function back(){if(document.getElementById('runnerScreen')){document.getElementById('runnerScreen').remove();sync();return;}if(document.getElementById('arenaModal')?.classList.contains('show')){window.ArenaGame?.close?.();sync();return;}if(document.querySelector('.forge-v2-overlay')){document.querySelectorAll('.forge-v2-overlay').forEach(x=>x.remove());sync();return;}go('home');}
function nav(id){if(id==='battle'){closeLayers();window.HomeRebuild?.startRunner?.(false);sync();return;}if(id==='clan'){closeLayers();info('КЛАН','Раздел в разработке.');return;}go(id);}
function ensureNav(){
 let n=document.getElementById('hardMobileNav');
 if(!n){n=document.createElement('nav');n.id='hardMobileNav';n.innerHTML=[['home','⌂','Город'],['inventory','🎒','Инвентарь'],['hero','⚔','Герой'],['battle','⚔️','Бой'],['districts','📜','Квесты'],['casino','🎲','Игры'],['clan','🛡','Клан']].map(x=>`<button type="button" data-global-nav="${x[0]}"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('');document.body.appendChild(n);}
 let b=document.getElementById('globalBackButton');if(!b){b=document.createElement('button');b.id='globalBackButton';b.type='button';b.textContent='‹';b.setAttribute('aria-label','Назад');document.body.appendChild(b);}
 sync();
}
function sync(){
 const n=document.getElementById('hardMobileNav'),b=document.getElementById('globalBackButton');if(!n||!b)return;
 const screen=document.body.dataset.screen||'home';const overlay=!!document.querySelector('#arenaModal.show,.arena-modal.show,#runnerScreen,.forge-v2-overlay');
 const show=screen!=='home'||overlay;
 n.style.display=show?'grid':'none';b.style.display=show?'block':'none';
 n.querySelectorAll('[data-global-nav]').forEach(x=>x.classList.toggle('active',x.dataset.globalNav===screen));
}

/* Window-level capture runs before document-level legacy handlers, so old stopImmediatePropagation cannot steal HOME taps. */
window.addEventListener('click',function(e){
 const hz=e.target.closest?.('.hz');
 if(hz){const fn=HOME[hz.dataset.action];if(fn){e.preventDefault();e.stopImmediatePropagation();fn();return;}}
 const n=e.target.closest?.('[data-global-nav]');if(n){e.preventDefault();e.stopImmediatePropagation();nav(n.dataset.globalNav);return;}
 if(e.target.closest?.('#globalBackButton')){e.preventDefault();e.stopImmediatePropagation();back();return;}
 if(e.target.closest?.('[data-final-close]')){e.preventDefault();e.stopImmediatePropagation();document.getElementById('finalInfoModal')?.classList.remove('show');return;}
 const ds=e.target.closest?.('[data-screen]');if(ds&&!e.target.closest('.arena-in-battle')){const id=ds.dataset.screen;if(id){e.preventDefault();e.stopImmediatePropagation();go(id);return;}}
 const an=e.target.closest?.('[data-arena-nav]');if(an){e.preventDefault();e.stopImmediatePropagation();nav(an.dataset.arenaNav);return;}
},true);

document.addEventListener('DOMContentLoaded',ensureNav);
document.addEventListener('territory:render',sync);
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-screen']});
window.TerritoryNavigate=nav;window.TerritoryNavigation={sync,back,navigate:nav};

const s=document.createElement('style');s.textContent=`
#coreMobileNav,#coreBackButton{display:none!important}
#hardMobileNav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:2147483000!important;display:none;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:5px 4px calc(5px + env(safe-area-inset-bottom));background:#07111b;border-top:2px solid #b99548;box-shadow:0 -8px 28px #000b;pointer-events:auto!important;touch-action:manipulation!important}
#hardMobileNav button{min-width:0;height:58px;border:1px solid #435665;border-radius:10px;background:#10202c;color:#fff;padding:3px 1px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-weight:900;font-size:18px;pointer-events:auto!important;touch-action:manipulation!important}
#hardMobileNav button i{font-style:normal;font-size:18px;line-height:18px}#hardMobileNav button span{font-size:8px;line-height:10px;white-space:nowrap}#hardMobileNav button.active{border-color:#d1ad55;background:#2a2114;color:#f2d77d}
#globalBackButton{position:fixed;left:14px;top:calc(10px + env(safe-area-inset-top));z-index:2147483001;width:48px;height:48px;border:1px solid #b99548;border-radius:13px;background:#132532;color:#fff;font-size:34px;line-height:42px;padding:0;display:none;pointer-events:auto;touch-action:manipulation;box-shadow:0 6px 18px #0008}
.arena-bottom-nav{display:none!important}.screen.panel-screen{padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
#finalInfoModal{position:fixed;inset:0;z-index:2147483002;display:none;align-items:center;justify-content:center;padding:24px;background:#000b}#finalInfoModal.show{display:flex}.final-info-card{position:relative;width:min(92vw,380px);padding:28px 22px 22px;border:1px solid #c7a653;border-radius:18px;background:linear-gradient(145deg,#142d3b,#07131d);text-align:center;box-shadow:0 18px 60px #000a}.final-info-card button:first-child{position:absolute;right:8px;top:5px;border:0;background:transparent;color:#fff;font-size:28px}.final-info-card b{display:block;color:#e8c76b;font-size:20px;margin-bottom:12px}.final-info-card span{display:block;color:#d8e0e5;font-size:14px;margin-bottom:20px}.final-info-card button:last-child{min-width:100px;padding:10px 18px;border:1px solid #b99548;border-radius:10px;background:linear-gradient(#e8c76b,#a97b22);color:#171008;font-weight:900}
`;document.head.appendChild(s);
})();
