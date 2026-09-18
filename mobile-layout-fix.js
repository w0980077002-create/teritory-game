/* Territory G12 — fill the actual Telegram game viewport */
(function(){
"use strict";
function apply(){
 var style=document.getElementById("territoryG12Layout");
 if(!style){
  style=document.createElement("style");
  style.id="territoryG12Layout";
  style.textContent=`
   body:has(#home.active){overflow:hidden!important;background:#07111b!important}
   body:has(#home.active) #app,body:has(#home.active) main,body:has(#home.active) #home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
   body:has(#home.active) .real-home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#07111b!important}
   body:has(#home.active) .real-home-image{position:absolute!important;left:0!important;top:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-height:0!important;object-fit:cover!important;object-position:center center!important;margin:0!important;padding:0!important;display:block!important}
   body:has(#home.active) .ref-hud{pointer-events:none!important}
   body:has(#home.active) .v5-click-layer{z-index:500!important}
   #territoryAlexButton{display:none!important}
   #territoryAlexHit{position:absolute;left:3%;bottom:9%;width:42%;height:43%;z-index:6500;background:transparent;border:0;padding:0;margin:0}
  `;
  document.head.appendChild(style);
 }
 var home=document.getElementById("home");
 if(home&&!document.getElementById("territoryAlexHit")){
  var b=document.createElement("button");
  b.id="territoryAlexHit";b.type="button";b.setAttribute("aria-label","Герцог Alex");
  b.addEventListener("click",function(){if(window.TerritoryDukeAlex)window.TerritoryDukeAlex.open()});
  home.appendChild(b);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
setTimeout(apply,500);
})();