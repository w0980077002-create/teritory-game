(function(){
'use strict';
function qs(q){return document.querySelector(q)}
function qsa(q){return Array.from(document.querySelectorAll(q))}
function closeArena(){
  try{window.ArenaGame?.close?.()}catch(_){}
  try{window.TerritoryLiveArena?.close?.()}catch(_){}
  qsa('.arena-modal.show').forEach(x=>{x.classList.remove('show');x.setAttribute('aria-hidden','true')});
  qs('#territory-live-arena')?.remove();
}
function sync(){
  try{window.TerritoryNavigation?.sync?.()}catch(_){}
  qsa('.arena-bottom-nav').forEach(x=>x.remove());
  const live=qs('#territoryLiveNav'); if(live)live.style.display='none';
  const bar=qs('#territoryNav');
  const arenaOpen=!!qs('.arena-modal.show,#territory-live-arena');
  if(bar&&arenaOpen)bar.classList.remove('hidden');
}
function modal(title,text,action){
  const m=qs('#modal'),b=qs('#modalBody');if(!m||!b)return;
  b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p>'+
    (action?'<button class="gold-btn wide" data-rc-action="'+action+'">ОТКРЫТЬ</button>':'')+
    '<button class="dark-btn wide" data-rc-close>ЗАКРЫТЬ</button>';
  m.classList.add('show');
}
function route(a){
  const nav=window.TerritoryNavigation;
  if(['home','inventory','hero','battle','quests','games','clan','map','shop','arena','forge'].includes(a))return nav?.go?.(a);
  if(/^gear[1-6]$/.test(a))return nav?.go?.('inventory');
  if(/^elixir[1-4]$/.test(a))return nav?.go?.('shop');
  if(a==='daily')return window.TerritoryCompletePass?.openStoneModal?.()||modal('🎁 Ежедневная награда','Открой раздел боевого ресурса.');
  if(a==='trials')return nav?.go?.('map');
  if(a==='capture')return nav?.go?.('clan');
  if(a==='speed'){
    const s=window.TerritoryStore?.state;
    if(s){s.battleSpeed=Number(s.battleSpeed)===2?1:2;window.TerritoryStore?.saveNow?.('speed-toggle');return modal('⏩ Скорость боя','Скорость: x'+s.battleSpeed+'.');}
  }
  if(a==='auto'){
    const s=window.TerritoryStore?.state;
    if(s){s.auto=!Boolean(s.auto);window.TerritoryStore?.saveNow?.('auto-toggle');return modal('🔄 Автобой',s.auto?'Автобой включён.':'Автобой выключен.');}
  }
  const info={
    coins:['🪙 Монеты','Текущий баланс: '+Number(window.TerritoryStore?.state?.coins||0).toLocaleString('ru-RU')],
    gems:['💎 Синие алмазы','Текущий баланс: '+Number(window.TerritoryStore?.state?.gems||0).toLocaleString('ru-RU')],
    redgems:['🔴 Красные алмазы','Текущий баланс: '+Number(window.TerritoryStore?.state?.redGems||0).toLocaleString('ru-RU')],
    trophy:['🏆 Трофеи','Экран трофеев пока не подключён к отдельному разделу.'],
    mail:['✉️ Почта','Серверная почта есть, экран игрока пока не подключён.'],
    settings:['⚙️ Настройки','Экран настроек пока не подключён.'],
    events:['🎉 События','Экран событий пока не подключён.'],
    invite:['👥 Пригласить друзей','Механика приглашений пока не подключена.'],
    sea:['🌊 Морской набор','Раздел пока не подключён.'],
    honor:['🏅 Почётные звания','Раздел пока не подключён.'],
    blessing:['✨ Благословение','Раздел пока не подключён.']
  };
  if(info[a])return modal(info[a][0],info[a][1]);
  if(/^locked[1-3]$/.test(a))return modal('🔒 Ячейка закрыта','Эта ячейка открывается по мере развития героя.');
}
function install(){
  qsa('.arena-bottom-nav').forEach(x=>x.remove());
  const old=window.TerritoryNavigation?.go;
  if(old&&!old.__rc02Wrapped){
    const go=function(id,push){
      if(id==='battle'||id==='home'||id==='arena') {
        if(id==='battle')closeArena();
      } else closeArena();
      const result=old.call(this,id,push);
      setTimeout(sync,0);
      return result;
    };
    go.__rc02Wrapped=true;
    window.TerritoryNavigation.go=go;
  }
  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-rc-close]');
    if(close){e.preventDefault();qs('#modal')?.classList.remove('show');return;}
    const act=e.target.closest('[data-rc-action]');
    if(act){e.preventDefault();qs('#modal')?.classList.remove('show');route(act.dataset.rcAction);return;}
    const home=e.target.closest('#home.active [data-home-action],#home.active [data-action]');
    if(home&&!e.defaultPrevented){
      const a=home.dataset.homeAction||home.dataset.action;
      if(a&&!['battle-stones'].includes(a)){e.preventDefault();e.stopImmediatePropagation();route(a);}
    }
  },true);
  new MutationObserver(()=>sync()).observe(document.body,{childList:true,subtree:true});
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.TerritoryReleaseCandidate02={sync,route};
})();