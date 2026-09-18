/* Territory G18 — real visible buttons receive the tap */
(function(){
"use strict";

function install(){
 var old=document.getElementById("territoryG17Layout");
 if(old) old.remove();

 var s=document.getElementById("territoryG18Layout");
 if(!s){
  s=document.createElement("style");
  s.id="territoryG18Layout";
  s.textContent=`
   /* The transparent legacy hitboxes are the source of the shifted taps. */
   body:has(#home.active) .v5-zone{pointer-events:none!important}
   body:has(#home.active) .ref-hud{pointer-events:none!important}
   body:has(#home.active) .ref-hud .ref-actions,
   body:has(#home.active) .ref-hud .ref-task,
   body:has(#home.active) .ref-hud .ref-daily,
   body:has(#home.active) .ref-hud .ref-left,
   body:has(#home.active) .ref-hud .ref-right,
   body:has(#home.active) .ref-hud .ref-bottom,
   body:has(#home.active) .ref-hud .ref-res{pointer-events:auto!important}
  `;
  document.head.appendChild(s);
 }

 if(document.body.dataset.g18Clicks==="1") return;
 document.body.dataset.g18Clicks="1";

 document.addEventListener("click",function(e){
   if(!document.querySelector("#home.active")) return;
   var b=e.target.closest(".ref-right button, .ref-task");
   if(!b) return;

   var action=b.getAttribute("data-action");

   if(action==="forge"){
     e.preventDefault(); e.stopImmediatePropagation();
     if(window.TerritoryEquipment) window.TerritoryEquipment.open();
     return;
   }
   if(action==="tavern"){
     e.preventDefault(); e.stopImmediatePropagation();
     if(window.TerritoryDistricts) window.TerritoryDistricts.open();
     return;
   }
   if(action==="shop"){
     e.preventDefault(); e.stopImmediatePropagation();
     if(window.TerritoryMarket) window.TerritoryMarket.open();
     return;
   }
 },true);
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,300);
setTimeout(install,1000);
})();