/* TERRITORY — HOME CANONICAL GUARD 04
   home-master.png is the canonical Home artwork. Remove only the old
   procedural/VIP overlays. Keep the artwork and hit layer untouched.
*/
(function(){
'use strict';
if(window.TerritoryHomeCanonicalGuard04)return;
function clean(){
  document.querySelectorAll('.vip-personality-badge,.vip-scene-aura').forEach(el=>el.remove());
  document.querySelectorAll('#home .home-life').forEach(el=>el.remove());
}
window.TerritoryHomeCanonicalGuard04={clean};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});
})();
