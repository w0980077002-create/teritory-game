/* Territory G42 — Arena loader with cache-busted v141 assets. */
(function(){
  "use strict";
  const files=[
    "arena-core.js?v=142",
    "vip.js?v=1",
    "equipment.js?v=1",
    "market.js?v=1",
    "districts.js?v=1",
    "duke-alex.js?v=4",
    "mobile-layout-fix.js?v=29",
    "click-fix.js?v=1",
    "tasks-section.js?v=33",
    "rewards-section.js?v=34",
    "development-core.js?v=40"
  ];
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  function loadCss(href){return new Promise(resolve=>{if([...document.querySelectorAll('link[rel="stylesheet"]')].some(x=>x.href.includes('arena.css')))return resolve();const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=resolve;l.onerror=resolve;document.head.appendChild(l);});}
  loadCss('arena.css?v=142').then(()=>files.reduce((p,f)=>p.then(()=>loadScript(f)),Promise.resolve())).catch(e=>console.error('Territory G42 load error',e));
})();
