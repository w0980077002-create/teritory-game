/* Territory G32 loader — Tasks + real Battle screen */
(function(){
"use strict";
function load(src){return new Promise(function(resolve,reject){
 var s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;
 document.head.appendChild(s);
});}
load("arena-core.js?v=140")
.then(function(){return load("vip.js?v=1");})
.then(function(){return load("equipment.js?v=1");})
.then(function(){return load("market.js?v=1");})
.then(function(){return load("districts.js?v=1");})
.then(function(){return load("duke-alex.js?v=4");})
.then(function(){return load("mobile-layout-fix.js?v=29");})
.then(function(){return load("click-fix.js?v=1");})
.then(function(){return load("tasks-fix.js?v=31");})
.then(function(){return load("battle-fix.js?v=32");})
.catch(function(err){console.error("Territory G32 loader:",err);});
})();