/* Territory Telegram-Only AUTH GATE PASS 02
   One rule: Territory is Telegram-only.
   Protected actions wait for the real /api/player authentication result.
*/
(function(){
'use strict';
if(window.TerritoryTelegramAuthGate02)return;

const A=()=>window.TerritoryTelegramAuth;
let authPromise=null;

function isReady(){
  const a=A();
  return !!(a && a.state==='authenticated' && a.player);
}

function authenticate(){
  const a=A();
  if(!a) return Promise.reject(new Error('Telegram авторизация не загружена.'));
  if(isReady()) return Promise.resolve(a);
  if(authPromise) return authPromise;
  if(typeof a.authenticate!=='function')
    return Promise.reject(new Error('Telegram авторизация недоступна.'));
  authPromise=Promise.resolve(a.authenticate()).then(result=>{
    if(!isReady()){
      const msg=a.error||result?.error||'Не удалось подтвердить Telegram-профиль.';
      throw new Error(msg);
    }
    return a;
  }).finally(()=>{authPromise=null});
  return authPromise;
}

function whenReady(){
  if(isReady()) return Promise.resolve(A());
  return authenticate();
}

function waitMessage(){
  const log=document.getElementById('merchantLog');
  if(log) log.textContent='Проверяем профиль Telegram…';
}

const PROTECTED = [
  '[data-shop-buy]',
  '[data-buy-consumable]',
  '[data-forge-upgrade]',
  '[data-forge-salvage]',
  '[data-daily]',
  '[data-weekly]',
  '[data-story-claim]',
  '[data-achievement]',
  '[data-world-event]',
  '[data-npc]',
  '[data-npc-quest]',
  '[data-world-choice]',
  '[data-world-echo]',
  '[data-convergence]',
  '[data-branch-choice]',
  '[data-frontier-choice]',
  '[data-frontier-after]',
  '[data-npc-story]',
  '[data-npc-after]',
  '[data-npc-ending]',
  '[data-claim-npc-story]',
  '[data-claim-npc-after]',
  '[data-claim-npc-ending]',
  '[data-open-finale]',
  '[data-stone-checkin]',
  '[data-stone-buy]'
];

let replaying=false;

document.addEventListener('click',function(e){
  if(replaying) return;
  const target=e.target?.closest?.(PROTECTED.join(','));
  if(!target) return;
  if(isReady()) return;

  e.preventDefault();
  e.stopImmediatePropagation();
  waitMessage();

  whenReady().then(()=>{
    replaying=true;
    try{
      target.dispatchEvent(new MouseEvent('click',{
        bubbles:true,cancelable:true,view:window
      }));
    }finally{
      setTimeout(()=>{replaying=false},0);
    }
  }).catch(err=>{
    const log=document.getElementById('merchantLog');
    if(log) log.textContent=err.message||'Telegram авторизация не подтверждена.';
    else window.alert?.(err.message||'Telegram авторизация не подтверждена.');
  });
},true);

window.TerritoryTelegramAuthGate02={
  isReady,
  whenReady,
  authenticate
};
})();
