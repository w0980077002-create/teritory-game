
/* PASS54 — Territory Telegram Auth Foundation
   Telegram identity is verified by the server. No client-side authority over
   premium currency, XP, level, inventory or purchases is introduced here.
*/
(function(){
'use strict';
if(window.TerritoryTelegramAuth)return;
const STORE_KEY='territory_store_v1';
const SERVER_KEY='territory_server_url_v1';
const tg=()=>window.Telegram?.WebApp||null;
const serverUrl=()=>String(window.TERRITORY_SERVER_URL||localStorage.getItem(SERVER_KEY)||window.location.origin).replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path,opts){
 const w=tg();
 const headers=Object.assign({'content-type':'application/json','x-telegram-init-data':w?.initData||''},opts?.headers||{});
 const r=await fetch(serverUrl()+path,Object.assign({},opts||{},{headers}));
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
 return d;
}
function localState(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'null')}catch(_){return null}}
function meaningful(s){return !!s&&(Number(s.level||1)>1||Number(s.xp||0)>0||Number(s.coins||0)>0||Number(s.gems||0)>0||Number(s.redGems||0)>0||(Array.isArray(s.inventoryItems)&&s.inventoryItems.length>0)||(Array.isArray(s.equipment)&&s.equipment.some(Boolean)))}
function apply(p){
 const S=window.TerritoryStore?.state;if(!S||!p)return;
 S.profile=S.profile||{};
 S.profile.displayName=p.first_name||p.username||'Игрок';
 S.profile.username=p.username||'';S.profile.telegramId=String(p.id||'');S.profile.photoUrl=p.photo_url||'';
 if(Number.isFinite(Number(p.level)))S.level=Math.max(1,Number(p.level)||1);
 if(Number.isFinite(Number(p.xp)))S.xp=Math.max(0,Number(p.xp)||0);
 if(Number.isFinite(Number(p.xp_next)))S.xpNext=Math.max(1,Number(p.xp_next)||100);
 if(Number.isFinite(Number(p.hp)))S.hp=Math.max(0,Number(p.hp)||0);
 if(Number.isFinite(Number(p.max_hp)))S.maxHp=Math.max(1,Number(p.max_hp)||100);
 if(Number.isFinite(Number(p.coins)))S.coins=Math.max(0,Number(p.coins)||0);
 if(Number.isFinite(Number(p.gems)))S.gems=Math.max(0,Number(p.gems)||0);
 if(Number.isFinite(Number(p.red_gems)))S.redGems=Math.max(0,Number(p.red_gems)||0);
 S.profile.level=S.level;
 window.TerritoryStore?.saveNow?.();
}
function card(title,text){
 if(document.getElementById('tta-card'))document.getElementById('tta-card').remove();
 const home=document.getElementById('home');if(!home)return;
 const c=document.createElement('div');c.id='tta-card';c.className='tta-card';
 c.innerHTML='<div class="tta-dot"></div><div class="tta-copy"><b>'+esc(title)+'</b><span>'+esc(text)+'</span></div>';
 home.appendChild(c);requestAnimationFrame(()=>c.classList.add('show'));
 setTimeout(()=>{c.classList.remove('show');setTimeout(()=>c.remove(),450)},6000);
}
async function authenticate(){
 const w=tg();
 if(!w||!w.initData){window.TerritoryTelegramAuth.state='guest';return {ok:false,guest:true};}
 try{
  w.ready();w.expand?.();
  const auth=await api('/api/auth');
  const local=localState();
  if(meaningful(local)&&auth.player?.legacy_imported===false&&auth.player?.has_server_progress===false){
   await api('/api/migrate',{method:'POST',body:JSON.stringify({level:Number(local.level||1),xp:Number(local.xp||local.exp||0),coins:Number(local.coins||0),gems:Number(local.gems||0),redGems:Number(local.redGems||0),hp:Number(local.hp||100),maxHp:Number(local.maxHp||100)})});
  }
  const fresh=await api('/api/auth');apply(fresh.player);
  window.TerritoryTelegramAuth.state='authenticated';window.TerritoryTelegramAuth.player=fresh.player;
  card('Telegram подключён',(fresh.player.first_name||fresh.player.username||'Игрок')+' · профиль загружен');
  return fresh;
 }catch(e){window.TerritoryTelegramAuth.state='error';window.TerritoryTelegramAuth.error=e.message||String(e);card('Авторизация не завершена',e.message||'Сервер недоступен');return {ok:false,error:e};}
}
async function refresh(){if(window.TerritoryTelegramAuth.state!=='authenticated')return null;const d=await api('/api/progress');apply(d.player);return d;}
window.TerritoryTelegramAuth={state:'idle',player:null,error:null,authenticate,refresh,setServerUrl(v){localStorage.setItem(SERVER_KEY,String(v||''));},getServerUrl:serverUrl};
function boot(){setTimeout(authenticate,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
