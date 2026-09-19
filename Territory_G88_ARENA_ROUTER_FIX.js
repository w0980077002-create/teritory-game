/* Territory G88 — Arena navigation fix
   Purpose: the City uses data-screen="arena", but Arena is a modal and has
   no <section id="arena">. This capture router opens the canonical Arena
   before app.js can silently return from showScreen().
*/
(function(){
  'use strict';

  function openArenaFromCity(ev){
    const button = ev.target && ev.target.closest
      ? ev.target.closest('[data-screen="arena"]')
      : null;
    if(!button) return;

    ev.preventDefault();
    ev.stopImmediatePropagation();

    if(typeof window.openArena === 'function'){
      window.openArena();
    }else{
      // arena.js is normally loaded before this fix. This fallback gives it
      // one tick to finish initialization instead of failing silently.
      setTimeout(function(){
        if(typeof window.openArena === 'function') window.openArena();
        else if(typeof window.arenaToast === 'function')
          window.arenaToast('Арена ещё загружается…');
      }, 0);
    }
  }

  // Capture phase runs before app.js's document-level bubble handler.
  document.addEventListener('click', openArenaFromCity, true);

  window.TerritoryG88ArenaRouter = {
    version: 'G88',
    ready: true
  };
})();
