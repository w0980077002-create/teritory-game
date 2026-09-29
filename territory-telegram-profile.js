/* Territory — FIRST LIVE TEST 03: Telegram profile UI bridge. */
(function(){
  'use strict';
  if(window.TerritoryTelegramProfile03) return;

  function tgUser(){
    try { return window.Telegram?.WebApp?.initDataUnsafe?.user || null; }
    catch(_) { return null; }
  }

  function state(){ return window.TerritoryStore?.state || null; }

  function value(){
    const s=state()||{}, p=s.profile||{}, u=tgUser()||{}, auth=window.TerritoryTelegramAuth?.player||{};
    return {
      name: p.displayName || auth.first_name || u.first_name || auth.username || u.username || 'Игрок',
      username: p.username || auth.username || u.username || '',
      id: String(p.telegramId || auth.telegram_id || u.id || ''),
      photo: p.photoUrl || auth.photo_url || u.photo_url || ''
    };
  }

  function render(){
    const el=document.getElementById('telegramProfile');
    if(!el) return;
    const v=value();
    const name=document.getElementById('telegramProfileName');
    const username=document.getElementById('telegramProfileUsername');
    const id=document.getElementById('telegramProfileId');
    const img=document.getElementById('telegramProfilePhoto');
    const fallback=document.getElementById('telegramProfileFallback');

    if(name) name.textContent=v.name;
    if(username){ username.textContent=v.username ? '@'+v.username : 'Telegram'; }
    if(id) id.textContent=v.id ? v.id : 'не получен';

    if(img){
      if(v.photo){
        img.src=v.photo;
        img.hidden=false;
        img.onerror=function(){img.hidden=true;if(fallback) fallback.hidden=false;};
      }else{
        img.hidden=true;
      }
    }
    if(fallback) fallback.hidden=!!v.photo;
    el.dataset.ready='1';
  }

  async function copyId(){
    const id=document.getElementById('telegramProfileId')?.textContent||'';
    if(!id || id==='не получен') return;
    try{
      await navigator.clipboard.writeText(id);
      const btn=document.getElementById('telegramProfileCopy');
      if(btn){const old=btn.textContent;btn.textContent='✓ Скопировано';setTimeout(()=>btn.textContent=old,1200);}
    }catch(_){ }
  }

  function boot(){
    render();
    document.getElementById('telegramProfileCopy')?.addEventListener('click',copyId);
    let n=0;
    const timer=setInterval(()=>{render();if(++n>=30)clearInterval(timer);},500);
    window.addEventListener('territory:state-changed',render);
    window.addEventListener('territory:telegram-authenticated',render);
  }

  window.TerritoryTelegramProfile03={render};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

/* Territory LIVE HOTFIX — recover the living home after the legacy init crash.
 * home-life.js currently calls a removed local bind() during DOMContentLoaded.
 * HomeLife.refresh() itself is safe and mounts the real living scene, so we
 * invoke that refresh after the normal home renderer has mounted the screen.
 * No Cloudflare/auth/economy logic is changed here.
 */
(function(){
  'use strict';
  function fallback(){
    const home=document.getElementById('home');
    if(!home) return;
    try { window.HomeLife?.refresh?.(); } catch(_) {}
    if(home.querySelector('.home-life')) return;
    if(home.querySelector('.territory-home-boot-fallback')) return;

    const el=document.createElement('div');
    el.className='territory-home-boot-fallback';
    el.style.cssText='position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(circle at 50% 42%,#18384a 0,#08141d 48%,#02070b 100%);color:#e8c76b;font-family:Arial,sans-serif;text-align:center';
    el.innerHTML='<div style="padding:20px"><div style="font-size:74px;filter:drop-shadow(0 8px 8px #000)">⚔️</div><div style="font-size:20px;font-weight:900">TERRITORY</div><div style="margin-top:7px;font-size:11px;color:#aebbc2">Город загружается…</div></div>';
    home.appendChild(el);
  }
  function schedule(){ setTimeout(fallback,60); setTimeout(fallback,350); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
})();
