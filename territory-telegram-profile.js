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
