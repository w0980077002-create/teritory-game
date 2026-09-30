/* Territory Navigation FIX 02 — 2026-10-01
   Single router for the seven bottom buttons and home hit areas.
   Important: home hit actions are scoped to #home only, so Arena/PvE controls
   can never be mistaken for home buttons.
*/
(function(){
'use strict';

const aliases={market:'shop',casino:'games',districts:'quests',profile:'hero',roadmap:'map'};
const items=[['home','Город'],['inventory','Инвентарь'],['hero','Герой'],['battle','Бой'],['quests','Квесты'],['games','Игры'],['clan','Клан']];
let originalShow=null;

function isCombat(){
  return !!document.querySelector('#runnerScreen,.pve-battle.show,.arena-modal.arena-in-battle.show,#territory-live-arena');
}
function activeId(){
  const raw=document.body.dataset.screen||'home';
  return aliases[raw]||raw||'home';
}
function cleanupArenaDuplicate(){
  document.querySelectorAll('.arena-bottom-nav').forEach(el=>el.remove());
}
function sync(){
  const bar=document.getElementById('territoryNav');
  cleanupArenaDuplicate();
  if(!bar)return;
  const active=activeId();
  /* Home artwork already contains the canonical bar. During PvE/Arena overlays
     we deliberately show the same canonical bar above the overlay. */
  const show=active!=='home'||isCombat();
  bar.classList.toggle('hidden',!show);
  bar.querySelectorAll('button[data-screen]').forEach(b=>{
    const on=b.dataset.screen===active;
    b.classList.toggle('active',on);
    if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
}
function closeOverlays(){
  try{window.PvEFlow?.stop?.()}catch(_){ }
  try{window.ArenaGame?.close?.()}catch(_){ }
  document.querySelectorAll('.pve-battle.show').forEach(x=>x.classList.remove('show'));
  document.querySelectorAll('.arena-modal.show').forEach(x=>{x.classList.remove('show');x.setAttribute('aria-hidden','true')});
  document.querySelector('#runnerScreen')?.remove();
  document.getElementById('territory-live-arena')?.remove();
}
function go(id,push=true){
  id=aliases[id]||id||'home';
  if(id==='battle'){
    window.HomeRebuild?.startRunner?.();
    sync();
    return;
  }
  if(id==='arena'){
    closeOverlays();
    if(window.TerritoryTelegramAuth?.state==='authenticated'&&window.TerritoryLiveArena?.open)window.TerritoryLiveArena.open();
    else window.ArenaGame?.open?.();
    sync();
    return;
  }
  if(id==='forge'){
    originalShow?.('shop');
    window.ForgeV2?.open?.();
    if(push)history.pushState({screen:'shop'},'','#shop');
    sync();
    return;
  }
  if(id==='home')closeOverlays();
  else document.getElementById('territory-live-arena')?.remove();
  originalShow?.(id);
  if(push)history.pushState({screen:id},'','#'+id);
  sync();
}
function info(title,text,action){
  const m=document.getElementById('modal'),b=document.getElementById('modalBody');
  if(!m||!b)return;
  b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p>'+(action?'<button class="gold-btn wide" data-modal-action="'+action+'">ОТКРЫТЬ</button>':'')+'<button class="dark-btn wide" data-modal-ok>ЗАКРЫТЬ</button>';
  m.classList.add('show');
}
function routeHomeAction(a){
  const map={battle:'battle',arena:'arena',map:'map',forge:'forge',shop:'shop',inventory:'inventory',hero:'hero',quests:'quests',games:'games',clan:'clan'};
  if(a==='home')return go('home');
  if(map[a])return go(map[a]);
  if(/^gear[1-6]$/.test(a))return go('inventory');
  if(/^elixir[1-4]$/.test(a))return go('shop');
  if(/^locked[1-3]$/.test(a))return info('🔒 Ячейка закрыта','Эта ячейка откроется по мере развития героя.');
  const messages={
    coins:['🪙 Монеты','Здесь отображается баланс монет героя.'],
    gems:['💎 Синие алмазы','Премиальная валюта.'],
    redgems:['🔴 Красные алмазы','Особая премиальная валюта.'],
    energy:['⚡ Энергия','Энергия расходуется на игровые действия.'],
    trophy:['🏆 Трофеи','Раздел трофеев героя.'],mail:['✉️ Почта','Почтовый ящик героя.'],settings:['⚙️ Настройки','Настройки игры.'],
    events:['🎉 События','Игровые события и временные активности.'],daily:['🎁 Ежедневная награда','Ежедневные награды.'],invite:['👥 Пригласить друзей','Приглашение друзей в игру.'],sea:['🌊 Морской набор','Раздел морского набора.'],
    trials:['🏹 Испытания','Раздел испытаний.'],capture:['🏰 Захват улиц','Раздел захвата улиц.'],honor:['🏅 Почётные звания','Почётные звания героя.'],blessing:['✨ Благословение','Благословение героя.'],speed:['⏩ Скорость боя','Кнопка скорости боя.']
  };
  if(messages[a])return info(messages[a][0],messages[a][1]);
  if(a==='chapter')return go('map');
  if(a==='auto'){
    const s=window.TerritoryStore?.state;
    if(s){s.auto=!Boolean(s.auto);window.TerritoryStore?.saveNow?.();return info('🔄 Автобой',s.auto?'Автобой включён.':'Автобой выключен.')}
  }
}
function mount(){
  if(document.getElementById('territoryNav'))return;
  const bar=document.createElement('nav');bar.id='territoryNav';bar.className='global-nav hidden';bar.setAttribute('aria-label','Основная навигация');
  bar.innerHTML=items.map(x=>`<button type="button" data-screen="${x[0]}" aria-label="${x[1]}"><span>${x[1]}</span></button>`).join('');
  document.body.appendChild(bar);
  bar.addEventListener('click',e=>{const b=e.target.closest('button[data-screen]');if(b){e.preventDefault();e.stopPropagation();go(b.dataset.screen)}});
}
function init(){
  originalShow=window.showScreen;
  mount();
  window.showScreen=function(id){go(id,true)};
  if(window.TerritoryUI)window.TerritoryUI.show=window.showScreen;
  document.addEventListener('click',e=>{
    /* Never route clicks originating outside the home screen through home actions. */
    if(e.target.closest('#territoryNav,.arena-bottom-nav,#territoryLiveNav'))return;
    const back=e.target.closest('[data-back],[data-home]');
    if(back){e.preventDefault();e.stopPropagation();go('home');return;}
    const home=e.target.closest('#home.active [data-home-action]');
    if(home){e.preventDefault();e.stopPropagation();routeHomeAction(home.dataset.homeAction);return;}
    const action=e.target.closest('#home.active [data-action]');
    if(action){e.preventDefault();e.stopPropagation();routeHomeAction(action.dataset.action);return;}
    const modalAction=e.target.closest('[data-modal-action]');
    if(modalAction){e.preventDefault();document.getElementById('modal')?.classList.remove('show');routeHomeAction(modalAction.dataset.modalAction);return;}
    const modalOk=e.target.closest('[data-modal-ok]');
    if(modalOk){e.preventDefault();document.getElementById('modal')?.classList.remove('show');return;}
  },true);
  window.addEventListener('territory:screen',sync);
  window.addEventListener('territory:state-changed',sync);
  window.addEventListener('popstate',e=>{
    const id=aliases[e.state?.screen||location.hash.slice(1)||'home']||'home';
    if(id==='arena')go('arena',false);else if(!isCombat())originalShow?.(id);
    sync();
  });
  new MutationObserver(()=>cleanupArenaDuplicate()).observe(document.body,{childList:true,subtree:true});
  history.replaceState({screen:activeId()},'',location.hash||'#home');
  sync();
}
window.TerritoryNavigation={go,sync,info};
document.addEventListener('DOMContentLoaded',init);
})();
