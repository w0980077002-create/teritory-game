/* Territory — PvE elixir transcript bridge 09. */
(function(){
'use strict';
if(window.TerritoryPveElixirTrace09)return;
function send(key){const t=window.TerritoryPveTranscript08,k=String(key||'');if(!t||typeof t.send!=='function')return;if(['hp','energy','attack','guard'].includes(k))t.send('elixir_'+k)}
document.addEventListener('click',function(e){const b=e.target?.closest?.('[data-consumable]');if(!b)return;send(b.dataset.consumable)},true);
window.TerritoryPveElixirTrace09={send};
})();
