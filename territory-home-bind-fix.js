/* Territory LIVE HOME FIX 02
 * Runtime compatibility fix for home-life.js.
 *
 * Current home-life.js calls bind() during DOMContentLoaded, but that local
 * function no longer exists. This file supplies a harmless compatibility
 * bind() before DOMContentLoaded, allowing the canonical HomeLife init to
 * continue and paint() to mount the living home.
 *
 * No battle/economy/auth/Cloudflare logic is changed.
 */
(function(){
  'use strict';

  if(typeof window.bind !== 'function'){
    window.bind = function(){};
  }

  function refresh(){
    try { window.HomeLife?.refresh?.(); } catch(_) {}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(refresh, 30);
      setTimeout(refresh, 250);
    }, {once:true});
  } else {
    setTimeout(refresh, 30);
    setTimeout(refresh, 250);
  }
})();
