(function(){
  "use strict";
  const files=[
    "arena-core.js?v=140",
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
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  files.reduce((p,f)=>p.then(()=>load(f)),Promise.resolve()).catch(e=>console.error('Territory G40 load error',e));
})();
