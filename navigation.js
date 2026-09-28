(function(){
'use strict';

const aliases={market:'shop',casino:'games',districts:'quests',profile:'hero',roadmap:'map'};
const items=[['home','🏰','Город'],['inventory','🎒','Инвентарь'],['hero','🪖','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🚩','Клан']];
let originalShow=null;

function isCombat(){
  return !!document.querySelector('#runnerScreen,.pve-battle.show,.arena-modal.arena-in-battle.show');
}
function activeId(){return aliases[document.body.dataset.screen||'home']||document.body.dataset.screen||'home';}
function sync(){
  const bar=document.getElementById('territoryNav');
  if(!bar)return;
  const active=activeId();
  const hide=active==='home'||isCombat();
  bar.classList.toggle('hidden',hide);
  bar.querySelectorAll('button[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===active));
}
function closeOverlays(){
  try{window.PvEFlow?.stop?.();}catch(_){}
  try{window.ArenaGame?.close?.();}catch(_){}
  document.querySelectorAll('.pve-battle.show').forEach(x=>x.classList.remove('show'));
  document.querySelectorAll('.arena-modal.show').forEach(x=>{x.classList.remove('show');x.setAttribute('aria-hidden','true');});
  document.querySelector('#runnerScreen')?.remove();
}
function go(id,push){
  id=aliases[id]||id||'home';
  if(id==='battle'){window.HomeRebuild?.startRunner?.();sync();return;}
  if(id==='arena'){closeOverlays();window.ArenaGame?.open?.();sync();return;}
  if(id==='forge'){originalShow?.('shop');window.ForgeV2?.open?.();if(push!==false)history.pushState({screen:'shop'},'','#shop');sync();return;}
  if(id==='home')closeOverlays();
  originalShow?.(id);
  if(push!==false)history.pushState({screen:id},'','#'+id);
  sync();
}
function info(title,text){
  const m=document.getElementById('modal'),b=document.getElementById('modalBody');
  if(!m||!b)return;
  b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p><button class="gold-btn wide" data-modal-ok>ПОНЯТНО</button>';
  m.classList.add('show');
}
function routeHomeAction(a){
  const map={battle:'battle',arena:'arena',map:'map',forge:'forge',shop:'shop',inventory:'inventory',hero:'hero',quests:'quests',games:'games',clan:'clan'};
  if(a==='home')return go('home');
  if(a==='trophy')return info('🏆 Трофеи','Награды и достижения подключим к единому профилю игрока.');
  if(a==='mail')return info('✉️ Почта','Почтовый модуль готовится к подключению к серверу.');
  if(map[a])return go(map[a]);
  if(a==='events')return info('🎉 События','Событийный раздел подключён как следующий игровой модуль.');
  if(a==='daily')return info('🎁 Ежедневные награды','Система ежедневных наград подготовлена для следующего этапа.');
  if(a==='invite')return info('👥 Пригласить друзей','Приглашения будут привязаны к Telegram WebApp после подключения серверного модуля.');
  if(a==='sea')return info('⚓ Морской набор','Морской режим пока не запускаем отдельно — кнопка больше не будет молчать.');
  if(a==='trials')return info('🏆 Испытания','Испытания будут добавлены в отдельный игровой режим.');
  if(a==='capture')return go('battle');
  if(a==='settings')return info('⚙️ Настройки','Настройки профиля и игры будут расширены здесь.');
}
function mount(){
  if(document.getElementById('territoryNav'))return;
  const bar=document.createElement('nav');
  bar.id='territoryNav';bar.className='global-nav';
  bar.innerHTML=items.map(x=>`<button type="button" data-screen="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('');
  document.body.appendChild(bar);
  bar.addEventListener('click',e=>{const b=e.target.closest('button[data-screen]');if(b)go(b.dataset.screen);});
}
function init(){
  originalShow=window.showScreen;
  mount();
  window.showScreen=function(id){go(id,true);};
  if(window.TerritoryUI)window.TerritoryUI.show=window.showScreen;
  document.addEventListener('click',e=>{
    const back=e.target.closest('[data-back],[data-home]');
    if(back){e.preventDefault();go('home');return;}
    const home=e.target.closest('[data-home-action]');
    if(home){e.preventDefault();routeHomeAction(home.dataset.homeAction);return;}
    const action=e.target.closest('[data-action]');
    if(action){e.preventDefault();routeHomeAction(action.dataset.action);return;}
    const roadmap=e.target.closest('[data-roadmap]');
    if(roadmap){e.preventDefault();go('map');return;}
    const modalOk=e.target.closest('[data-modal-ok]');
    if(modalOk){document.getElementById('modal')?.classList.remove('show');return;}
    const fj=e.target.closest('[data-fj-nav]');
    if(fj){e.preventDefault();go(fj.dataset.fjNav);return;}
  },true);
  document.getElementById('modalClose')?.addEventListener('click',()=>document.getElementById('modal')?.classList.remove('show'));
  window.addEventListener('territory:screen',sync);
  window.addEventListener('territory:state-changed',sync);
  window.addEventListener('popstate',e=>{
    const id=aliases[e.state?.screen||location.hash.slice(1)||'home']||'home';
    if(id==='arena')window.ArenaGame?.open?.();
    else if(!isCombat())originalShow?.(id);
    sync();
  });
  history.replaceState({screen:activeId()},'',location.hash||'#home');
  sync();
}
window.TerritoryNavigation={go,sync,info};
document.addEventListener('DOMContentLoaded',init);
})();