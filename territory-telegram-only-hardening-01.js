/* TERRITORY — TELEGRAM ONLY HARDENING 01
   No guest/demo state. Remove legacy guest-demo artifacts and block protected
   client actions until the concrete Telegram identity is authenticated.
*/
(function(){
'use strict';
if(window.TerritoryTelegramOnlyHardening01)return;
try{localStorage.removeItem('territory_guest_demo_stones_seeded')}catch(_){ }
function ready(){return window.TerritoryTelegramAuth?.state==='authenticated'&&!!window.TerritoryTelegramAuth?.player}
function cleanGuestUi(){document.querySelectorAll('.tsm-demo').forEach(e=>e.remove());document.querySelectorAll('[data-real-stones]').forEach(e=>e.dataset.telegramOnly='1')}
function block(e){
  if(ready())return;
  const t=e.target?.closest?.('[data-shop-buy],[data-buy-consumable],[data-stone-buy],[data-stone-checkin],[data-forge-upgrade],[data-forge-salvage]');
  if(!t)return;
  e.preventDefault();e.stopImmediatePropagation();
  window.TerritoryTelegramAuthGate02?.whenReady?.().catch(err=>alert(err.message||'Telegram авторизация не подтверждена.'));
}
document.addEventListener('click',block,true);document.addEventListener('DOMContentLoaded',cleanGuestUi);setInterval(cleanGuestUi,1000);
window.TerritoryTelegramOnlyHardening01={ready};
})();
