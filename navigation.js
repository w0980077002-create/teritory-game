(function(){
'use strict';
const aliases={market:'shop',casino:'games',districts:'quests',profile:'hero',roadmap:'map'};
const items=[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🚩','Клан']];
let originalShow=null;
function isCombat(){return !!document.querySelector('#runnerScreen,.pve-battle.show,.arena-modal.arena-in-battle.show');}
function activeId(){return aliases[document.body.dataset.screen||'home']||document.body.dataset.screen||'home';}
function sync(){const bar=document.getElementById('territoryNav');if(!bar)return;const active=activeId();bar.classList.toggle('hidden',active==='home'||isCombat());bar.querySelectorAll('button[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===active));}
function closeOverlays(){try{window.PvEFlow?.stop?.()}catch(_){} try{window.ArenaGame?.close?.()}catch(_){} document.querySelectorAll('.pve-battle.show').forEach(x=>x.classList.remove('show'));document.querySelectorAll('.arena-modal.show').forEach(x=>{x.classList.remove('show');x.setAttribute('aria-hidden','true')});document.querySelector('#runnerScreen')?.remove();}
function go(id,push=true){id=aliases[id]||id||'home';if(id==='battle'){window.HomeRebuild?.startRunner?.();sync();return;}if(id==='arena'){closeOverlays();window.ArenaGame?.open?.();sync();return;}if(id==='forge'){originalShow?.('shop');window.ForgeV2?.open?.();if(push)history.pushState({screen:'shop'},'','#shop');sync();return;}if(id==='home')closeOverlays();originalShow?.(id);if(push)history.pushState({screen:id},'','#'+id);sync();}
function info(title,text,action){const m=document.getElementById('modal'),b=document.getElementById('modalBody');if(!m||!b)return;b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p>'+(action?'<button class="gold-btn wide" data-modal-action="'+action+'">ОТКРЫТЬ</button>':'')+'<button class="dark-btn wide" data-modal-ok>ЗАКРЫТЬ</button>';m.classList.add('show');}
function routeHomeAction(a){
 const map={battle:'battle',arena:'arena',map:'map',forge:'forge',shop:'shop',inventory:'inventory',hero:'hero',quests:'quests',games:'games',clan:'clan'};
 if(a==='home')return go('home'); if(map[a])return go(map[a]);
 if(/^gear[1-6]$/.test(a))return go('inventory'); if(/^elixir[1-4]$/.test(a))return go('shop');
 if(/^locked[1-3]$/.test(a))return info('🔒 Ячейка закрыта','Эта ячейка откроется по мере развития героя.');
 if(a==='coins')return info('🪙 Монеты','Здесь отображается баланс монет героя.');
 if(a==='gems')return info('💎 Синие алмазы','Премиальная валюта. Баланс и операции будут показаны здесь.');
 if(a==='redgems')return info('🔴 Красные алмазы','Особая премиальная валюта. Раздел готов к подключению магазина.');
 if(a==='energy')return info('⚡ Энергия','Энергия расходуется на игровые действия и восстанавливается со временем.');
 if(a==='chapter')return go('map');
 if(a==='speed')return info('⏩ Скорость боя','Кнопка скорости боя. Режим x2 будет применён к боевому экрану, когда он запущен.');
 if(a==='auto'){const s=window.TerritoryStore?.state;if(s){s.auto=!Boolean(s.auto);window.TerritoryStore?.saveNow?.();return info('🔄 Автобой',s.auto?'Автобой включён.':'Автобой выключен.')}return info('🔄 Автобой','Меню автоматического боя.');}
 if(a==='honor')return info('👑 Почётные звания','Раздел званий героя. Здесь будут отображаться доступные звания и их бонусы.');
 if(a==='blessing')return info('⭐ Благословение','Раздел благословения героя. Бонусы будут подключены к профилю.');
 if(a==='trophy')return info('🏆 Трофеи','Награды и достижения героя.');
 if(a==='mail')return info('✉️ Почта','Почтовый раздел игры.');
 if(a==='settings')return info('⚙️ Настройки','Настройки профиля и игры.');
 if(a==='events')return info('🎉 События','Событийный раздел.');
 if(a==='daily')return info('🎁 Ежедневные награды','Ежедневные награды.');
 if(a==='invite')return info('👥 Пригласить друзей','Приглашения друзей.');
 if(a==='sea')return info('⚓ Морской набор','Морской набор.');
 if(a==='trials')return info('🏆 Испытания','Испытания героя.');
 if(a==='capture')return go('battle');
}
function mount(){if(document.getElementById('territoryNav'))return;const bar=document.createElement('nav');bar.id='territoryNav';bar.className='global-nav';bar.innerHTML=items.map(x=>`<button type="button" data-screen="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('');document.body.appendChild(bar);bar.addEventListener('click',e=>{const b=e.target.closest('button[data-screen]');if(b)go(b.dataset.screen)});}
function init(){originalShow=window.showScreen;mount();window.showScreen=function(id){go(id,true)};if(window.TerritoryUI)window.TerritoryUI.show=window.showScreen;document.addEventListener('click',e=>{const back=e.target.closest('[data-back],[data-home]');if(back){e.preventDefault();go('home');return;}const home=e.target.closest('[data-home-action]');if(home){e.preventDefault();e.stopPropagation();routeHomeAction(home.dataset.homeAction);return;}const action=e.target.closest('[data-action]');if(action){e.preventDefault();e.stopPropagation();routeHomeAction(action.dataset.action);return;}const modalAction=e.target.closest('[data-modal-action]');if(modalAction){e.preventDefault();document.getElementById('modal')?.classList.remove('show');routeHomeAction(modalAction.dataset.modalAction);return;}const modalOk=e.target.closest('[data-modal-ok]');if(modalOk){document.getElementById('modal')?.classList.remove('show');return;}},true);document.getElementById('modalClose')?.addEventListener('click',()=>document.getElementById('modal')?.classList.remove('show'));window.addEventListener('territory:screen',sync);window.addEventListener('territory:state-changed',sync);window.addEventListener('popstate',e=>{const id=aliases[e.state?.screen||location.hash.slice(1)||'home']||'home';if(id==='arena')window.ArenaGame?.open?.();else if(!isCombat())originalShow?.(id);sync()});history.replaceState({screen:activeId()},'',location.hash||'#home');sync();}
window.TerritoryNavigation={go,sync,info};document.addEventListener('DOMContentLoaded',init);
})();
