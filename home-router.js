/* Territory Game — HOME ROUTER 10070
   Fresh navigation core. See newnav10070.js for implementation.
   This file is the entry point loaded by the existing project.
*/
(function(){
  'use strict';
  if(window.__TERRITORY_HOME_ROUTER_ENTRY_10070__) return;
  window.__TERRITORY_HOME_ROUTER_ENTRY_10070__=true;
  const load=()=>{
    if(document.getElementById('territoryNewNav10070'))return;
    const css=document.createElement('link');css.id='territoryNewNav10070';css.rel='stylesheet';css.href='home-router.css?v=10070';document.head.appendChild(css);
    const s=document.createElement('script');s.id='territoryNewNav10070';s.src='newnav10070.js?v=10070';document.body.appendChild(s);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
