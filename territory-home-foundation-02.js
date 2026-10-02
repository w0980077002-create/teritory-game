/* Territory Home Foundation PASS 02 — canonical Home action bridge
   Keeps PvE/Arena/Forge/Battle Stones untouched.
   Consolidates the remaining Home hit actions so they no longer depend on
   the retired release-candidate router.
*/
(function(){
'use strict';

const ACTIONS = {
  coins:      ['🪙 Монеты', 'Твой текущий запас монет.'],
  gems:       ['💎 Синие алмазы', 'Премиальная валюта. Списание выполняется только серверными API.'],
  redgems:    ['🔴 Красные алмазы', 'Особая валюта профиля.'],
  energy:     ['⚡ Энергия', 'Расходуется на игровые действия и восстанавливается по правилам игры.'],
  trophy:     ['🏆 Трофеи', 'Раздел трофеев готовится к отдельной серверной коллекции достижений.'],
  settings:   ['⚙️ Настройки', 'Настройки интерфейса и игры.'],
  events:     ['🎉 События', 'Событийный раздел — следующая игровая система.'],
  daily:      ['🎁 Ежедневные награды', 'Ежедневная награда уже обслуживается серверным check-in.'],
  invite:     ['👥 Пригласить друзей', 'Реферальная система подключается отдельным серверным этапом.'],
  sea:        ['🌊 Морской набор', 'Контент морского набора пока не активирован.'],
  trials:     ['🏆 Испытания', 'Испытания — отдельный режим, не смешиваем его с PvE.'],
  capture:    ['🏙️ Захват улиц', 'Мировой режим захвата улиц будет подключён к серверному World API.'],
  honor:      ['🎖️ Почётные звания', 'Звания отображаются отдельно от базовой силы героя.'],
  blessing:   ['✨ Благословение', 'Бонусный эффект. Не изменяет серверную экономику напрямую.']
};

function state(){ return window.TerritoryStore?.state || {}; }
function num(v,d=0){ const n=Number(v); return Number.isFinite(n)?n:d; }

function openInfo(title, body){
  if(window.TerritoryNavigation?.info){
    window.TerritoryNavigation.info(title, body);
    return;
  }
  const modal=document.getElementById('modal'), host=document.getElementById('modalBody');
  if(!modal || !host) return;
  host.innerHTML='<h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(body)+'</p>';
  modal.classList.add('show');
}
function escapeHtml(v){
  return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function daily(){
  if(window.TerritoryCompletePass?.openStoneModal){
    window.TerritoryCompletePass.openStoneModal();
    return;
  }
  openInfo('🎁 Ежедневные награды','Серверный ежедневный вход доступен через систему Battle Stones.');
}

function toggleAuto(){
  const s=state();
  s.auto=!s.auto;
  try{ window.TerritoryStore?.saveNow?.(); }catch(_){}
  window.dispatchEvent(new CustomEvent('territory:state-changed',{detail:{source:'home-auto'}}));
  openInfo('🤖 Автобой', s.auto ? 'Автобой включён.' : 'Автобой выключен.');
}

function toggleSpeed(){
  const s=state();
  const current=num(s.battleSpeed||s.speed,1);
  const next=current===2?1:2;
  s.battleSpeed=next;
  s.speed=next;
  try{ window.TerritoryStore?.saveNow?.(); }catch(_){}
  window.dispatchEvent(new CustomEvent('territory:state-changed',{detail:{source:'home-speed',speed:next}}));
  openInfo('⚡ Скорость боя','Скорость: ×'+next+'.');
}

function route(action){
  switch(action){
    case 'daily': return daily();
    case 'auto': return toggleAuto();
    case 'speed': return toggleSpeed();

    case 'coins':
    case 'gems':
    case 'redgems':
    case 'energy': {
      const s=state();
      const value =
        action==='coins' ? num(s.coins??s.gold) :
        action==='gems' ? num(s.gems) :
        action==='redgems' ? num(s.redGems??s.redgems) :
        num(s.energy??s.stamina);
      return openInfo(ACTIONS[action][0], 'Сейчас: '+value+'.');
    }

    case 'trophy':
    case 'settings':
    case 'events':
    case 'invite':
    case 'sea':
    case 'trials':
    case 'capture':
    case 'honor':
    case 'blessing':
      return openInfo(ACTIONS[action][0], ACTIONS[action][1]);

    default:
      return false;
  }
}

function bind(){
  if(document.documentElement.dataset.territoryHomeFoundation02==='1') return;
  document.documentElement.dataset.territoryHomeFoundation02='1';

  document.addEventListener('click', function(e){
    const el=e.target.closest?.('#home [data-home-action]');
    if(!el) return;
    const action=el.dataset.homeAction;
    if(!Object.prototype.hasOwnProperty.call(ACTIONS,action) &&
       !['daily','auto','speed'].includes(action)) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    route(action);
  }, true);

  window.addEventListener('territory:state-changed', sync);
  window.addEventListener('territory:screen', sync);
  sync();
}

function sync(){
  const home=document.getElementById('home');
  if(!home) return;
  const s=state();
  const auto=home.querySelector('[data-home-action="auto"]');
  const speed=home.querySelector('[data-home-action="speed"]');
  if(auto) auto.dataset.active=s.auto?'1':'0';
  if(speed) speed.dataset.speed=String(num(s.battleSpeed||s.speed,1));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();

window.TerritoryHomeFoundation02={route,sync};
})();
