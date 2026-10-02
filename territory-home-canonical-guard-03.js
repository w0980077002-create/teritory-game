/* TERRITORY — HOME CANONICAL GUARD 03
   Keep home-master.png as the single visual base. Remove procedural Home/VIP
   layers that previously created duplicate characters or global VIP badges.
*/
(function(){
'use strict';
if(window.TerritoryHomeCanonicalGuard03)return;
function clean(){document.querySelectorAll('.home-life,.vip-personality-badge,.vip-scene-aura').forEach(el=>el.remove())}
window.TerritoryHomeCanonicalGuard03={clean};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});
})();
