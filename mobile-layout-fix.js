/* Territory G19 — restore baked HUD + keep side-button click fix */
(function(){
"use strict";
function apply(){
 var old=document.getElementById("territoryG18Layout");
 if(old) old.remove();

 var s=document.getElementById("territoryG19Layout");
 if(!s){
  s=document.createElement("style");
  s.id="territoryG19Layout";
  s.textContent=`
   body:has(#home.active){overflow:hidden!important;background:#07111b!important}
   body:has(#home.active) #app{max-width:none!important;width:100%!important;height:100dvh!important;background:#07111b!important}
   body:has(#home.active) main{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important}
   body:has(#home.active) #home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;padding:0!important;margin:0!important;overflow:hidden!important}
   body:has(#home.active) .real-home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#07111b!important}
   body:has(#home.active) .real-home-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;object-position:center center!important;display:block!important;margin:0!important}
   body:has(#home.active) .living-scene{display:none!important}
   body:has(#home.active) .ref-hud{display:block!important;pointer-events:none!important}
   body:has(#home.active) .ref-hud .ref-actions,
   body:has(#home.active) .ref-hud .ref-task,
   body:has(#home.active) .ref-hud .ref-daily,
   body:has(#home.active) .ref-hud .ref-left,
   body:has(#home.active) .ref-hud .ref-right,
   body:has(#home.active) .ref-hud .ref-bottom,
   body:has(#home.active) .ref-hud .ref-res{pointer-events:auto!important}
   body:has(#home.active) .v5-zone{pointer-events:none!important}
   body:has(#home.active) #territoryAlexButton{display:none!important}
  `;
  document.head.appendChild(s);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
setTimeout(apply,300);
setTimeout(apply,1000);
})();