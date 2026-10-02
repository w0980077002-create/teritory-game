/* Territory Telegram-Only compatibility layer — no guest mode */
(function(){
'use strict';
const A=()=>window.TerritoryTelegramAuth;
function ready(){return !!(A()?.state==='authenticated' && A()?.player)}
window.TerritoryTelegramOnly02={
  ready,
  require:()=>window.TerritoryTelegramAuthGate02?.whenReady?.()
};
})();
