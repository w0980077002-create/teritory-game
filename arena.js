/* Territory G4 loader — preserves Arena and loads VIP + Equipment */
(function(){
  "use strict";
  function load(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement("script");
      s.src=src;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }
  load("arena-core.js?v=140")
    .then(function(){ return load("vip.js?v=1"); })
    .then(function(){ return load("equipment.js?v=1"); })
    .catch(function(err){ console.error("Territory G4 loader:",err); });
})();
