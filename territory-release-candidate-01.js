/* Territory RELEASE CANDIDATE 05 — player utility integration
   Keeps existing engines intact and connects the home utility actions to the
   server systems that already exist. Replace territory-release-candidate-01.js
   with this file.
*/
(function(){
'use strict';
function qs(q){return document.querySelector(q)}
function qsa(q){return Array.from(document.querySelectorAll(q))}
function S(){return window.TerritoryStore?.state||{}}
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
  const combat=!!qs('#runnerScreen,.pve-battle.show,.arena-modal.show,#territory-live-arena');
  if(bar&&combat)bar.classList.remove('hidden');
}
function modal(title,text,action){
  const m=qs('#modal'),b=qs('#modalBody');if(!m||!b)return;
  b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p>'+
    (action?'<button class="gold-btn wide" data-rc-action="'+action+'">ОТКРЫТЬ</button>':'')+
    '<button class="dark-btn wide" data-rc-close>ЗАКРЫТЬ</button>';
  m.classList.add('show');
}
function escapeHtml(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function authApi(){
  const a=window.TerritoryTelegramAuth;
  return a?.state==='authenticated'&&typeof a.api==='function'?a:null;
}
async function openMail(){
  const a=authApi();
  if(!a){modal('✉️ Почта','Почта сохраняется на сервере после входа через Telegram.');return}
  const m=qs('#modal'),b=qs('#modalBody');if(!m||!b)return;
  b.innerHTML='<h2>✉️ Почта</h2><p>Загрузка…</p>';m.classList.add('show');
  try{
    const d=await a.api('/api/mail');
    const rows=Array.isArray(d)?d:(d.mail||d.items||[]);
    if(!rows.length){b.innerHTML='<h2>✉️ Почта</h2><p>Новых сообщений нет.</p><button class="dark-btn wide" data-rc-close>ЗАКРЫТЬ</button>';return}
    b.innerHTML='<h2>✉️ Почта</h2><div class="rc-mail-list">'+rows.slice(0,30).map(x=>{
      const claimed=!!x.claimed;
      return '<article class="hero-card rc-mail-card"><b>'+escapeHtml(x.subject||'Сообщение')+'</b>'+
        '<p>'+escapeHtml(x.body||'')+'</p>'+
        '<small>🪙 '+Number(x.coins||0)+' · 💎 '+Number(x.gems||0)+'</small>'+
        '<button class="gold-btn wide" data-mail-claim="'+escapeHtml(x.mail_id||x.id||'')+'" '+(claimed?'disabled':'')+'>'+
        (claimed?'✓ Получено':'ЗАБРАТЬ')+'</button></article>';
    }).join('')+'</div><button class="dark-btn wide" data-rc-close>ЗАКРЫТЬ</button>';
    b.querySelectorAll('[data-mail-claim]').forEach(btn=>btn.addEventListener('click',async()=>{
      const id=btn.dataset.mailClaim;if(!id)return;
      btn.disabled=true;
      try{
        const r=await a.api('/api/mail/claim',{method:'POST',body:JSON.stringify({mail_id:id})});
        if(r.state)Object.assign(S(),r.state);
        if(r.player){
          S().coins=Number(r.player.coins)||0;S().gems=Number(r.player.gems)||0;S().redGems=Number(r.player.red_gems)||0;
          S().level=Math.max(1,Number(r.player.level)||1);S().xp=Number(r.player.xp)||0;
        }
        window.TerritoryStore?.saveNow?.('mail-claim');
        btn.textContent='✓ Получено';
        window.TerritoryNavigation?.sync?.();
      }catch(e){btn.disabled=false;alert(e.message||'Награда почты недоступна.')}
    }));
  }catch(e){
    b.innerHTML='<h2>✉️ Почта</h2><p>'+escapeHtml(e.message||'Не удалось загрузить почту.')+'</p><button class="dark-btn wide" data-rc-close>ЗАКРЫТЬ</button>';
  }
}
function openTrophy(){
  const s=S(),a=s.arena||{};
  modal('🏆 Трофеи',
    'Арена: '+Number(a.rating||1000)+' рейтинга · '+Number(a.wins||0)+' побед · '+Number(a.losses||0)+' поражений.<br>'+
    'Пройдено глав: '+Number(s.totalChaptersCompleted||0)+' · Найдено предметов: '+Number(s.lootFound||0)+'.');
}
async function refreshServer(){
  const a=authApi();
  if(!a){modal('⚙️ Настройки','Открой игру через Telegram, чтобы синхронизировать серверный профиль.');return}
  modal('⚙️ Настройки','Синхронизация с сервером…');
  const d=await a.refresh();
  if(d)modal('⚙️ Настройки','Профиль и прогресс синхронизированы.');
  else modal('⚙️ Настройки','Сервер не ответил. Локальный прогресс сохранён.');
}
function route(a){
  const nav=window.TerritoryNavigation;
  if(['home','inventory','hero','battle','quests','games','clan','map','shop','arena','forge'].includes(a))return nav?.go?.(a);
  if(/^gear[1-6]$/.test(a))return nav?.go?.('inventory');
  if(/^elixir[1-4]$/.test(a))return nav?.go?.('shop');
  if(a==='daily')return window.TerritoryCompletePass?.openStoneModal?.()||modal('🎁 Ежедневная награда','Открой раздел боевого ресурса.');
  if(a==='trials')return nav?.go?.('map');
  if(a==='capture')return nav?.go?.('clan');
  if(a==='mail')return openMail();
  if(a==='trophy')return openTrophy();
  if(a==='settings')return refreshServer();
  if(a==='speed'){
    const s=S();s.battleSpeed=Number(s.battleSpeed)===2?1:2;window.TerritoryStore?.saveNow?.('speed-toggle');
    return modal('⏩ Скорость боя','Скорость сохранена: x'+s.battleSpeed+'.');
  }
  if(a==='auto'){
    const s=S();s.auto=!Boolean(s.auto);window.TerritoryStore?.saveNow?.('auto-toggle');
    return modal('🔄 Автобой',s.auto?'Автобой включён.':'Автобой выключен.');
  }
  const info={
    coins:['🪙 Монеты','Текущий баланс: '+Number(S().coins||0).toLocaleString('ru-RU')],
    gems:['💎 Синие алмазы','Текущий баланс: '+Number(S().gems||0).toLocaleString('ru-RU')],
    redgems:['🔴 Красные алмазы','Текущий баланс: '+Number(S().redGems||0).toLocaleString('ru-RU')],
    energy:['⚡ Энергия','Текущая энергия: '+Number(S().energy||0)+' / '+Number(S().maxEnergy||100)+'.'],
    events:['🎉 События','Система временных событий пока не подключена отдельным экраном.'],
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
  if(old&&!old.__rc03Wrapped){
    const go=function(id,push){
      if(id==='battle'||id==='home'||id==='arena'){
        if(id==='battle')closeArena();
      }else closeArena();
      const result=old.call(this,id,push);
      setTimeout(sync,0);return result;
    };
    go.__rc03Wrapped=true;
    window.TerritoryNavigation.go=go;
  }
  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-rc-close]');
    if(close){e.preventDefault();qs('#modal')?.classList.remove('show');return}
    const home=e.target.closest('#home.active [data-home-action],#home.active [data-action]');
    if(home&&!e.defaultPrevented){
      const a=home.dataset.homeAction||home.dataset.action;
      if(a&&!['battle-stones'].includes(a)){e.preventDefault();e.stopImmediatePropagation();route(a)}
    }
  },true);
  new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.TerritoryReleaseCandidate03={sync,route,openMail};
})();