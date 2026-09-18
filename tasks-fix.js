/* Territory G30 — bottom Задания opens the real task window */
(function(){
"use strict";

function install(){
  var home=document.getElementById("home");
  if(!home || home.dataset.g30TasksFix==="1") return;
  home.dataset.g30TasksFix="1";

  var btn=document.createElement("button");
  btn.type="button";
  btn.id="g30-tasks-hit";
  btn.setAttribute("aria-label","Задания");
  btn.style.cssText=[
    "position:absolute!important",
    "left:66.8%!important",
    "bottom:0!important",
    "width:16.6%!important",
    "height:14%!important",
    "z-index:10020!important",
    "background:transparent!important",
    "border:0!important",
    "padding:0!important",
    "margin:0!important",
    "pointer-events:auto!important",
    "-webkit-tap-highlight-color:transparent!important"
  ].join(";");
  home.appendChild(btn);

  btn.addEventListener("click",function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    var modal=document.getElementById("gameTasksModal");
    if(!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    if(typeof window.gameTasksInit==="function") window.gameTasksInit();
  },true);
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,300);
setTimeout(install,900);
setTimeout(install,1600);
})();