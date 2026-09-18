/* Territory G21 — fix transparent V5 click overlays */
(function(){
  "use strict";
  function apply(){
    document.querySelectorAll(".v5-zone").forEach(function(el){ el.style.pointerEvents="none"; });
    var layer=document.querySelector(".v5-click-layer");
    if(layer) layer.style.pointerEvents="none";
  }
  apply();
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply,{once:true});
  setTimeout(apply,50);
  setTimeout(apply,300);
})();