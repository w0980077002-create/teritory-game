/* PASS55 — Territory Telegram Auth + Safe Progress Sync
   Identity and premium economy remain server-owned. This bridge persists
   gameplay state needed to resume a session while deliberately excluding
   coins/gems/redGems from client writes.
*/
(function(){
'use strict';
if(window.TerritoryTelegramAuth)return;
const STORE_KEY='territory_store_v1';
const SERVER_KEY='territory_server_url_v1';
const SYNC_KEY='territory_auth_sync_v1';
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
function safeState(s){if(!s)return null;return {
 level:Math.max(1,Number(s.level)||1),xp:Math.max(0,Number(s.xp)||0),xpNext:Math.max(1,Number(s.xpNext)||100),
 hp:Math.max(0,Number(s.hp)||0),maxHp:Math.max(1,Number(s.maxHp)||100),
 equipment:Array.isArray(s.equipment)?s.equipment.slice(0,7):[],inventoryItems:Array.isArray(s.inventoryItems)?s.inventoryItems.slice(0,100):[],
 followers:s.followers||{},activeFollower:s.activeFollower||null,consumables:s.consumables||{},
 pve:s.pve||{},currentChapter:Number(s.currentChapter)||1,chapterStage:Number(s.chapterStage)||1,chapterProgress:Number(s.chapterProgress)||0,
 forge:s.forge||{},arena:s.arena||{},daily:s.daily||{},weekly:s.weekly||{}
};}
function apply(p,state){
 const S=window.TerritoryStore?.state;if(!S)return;
 if(p){S.profile=S.profile||{};S.profile.displayName=p.first_name||p.username||'Игрок';S.profile.username=p.username||'';S.profile.telegramId=String(p.id||'');S.profile.photoUrl=p.photo_url||'';S.level=Math.max(1,Number(p.level)||1);S.xp=Math.max(0,Number(p.xp)||0);S.xpNext=Math.max(1,Number(p.xp_next)||100);S.hp=Math.max(0,Number(p.hp)||0);S.maxHp=Math.max(1,Number(p.max_hp)||100);S.coins=Math.max(0,Number(p.coins)||0);S.gems=Math.max(0,Number(p.gems)||0);S.redGems=Math.max(0,Number(p.red_gems)||0);}
 if(state){const keep={coins:S.coins,gems:S.gems,redGems:S.redGems};Object.assign(S,state);S.coins=keep.coins;S.gems=keep.gems;S.redGems=keep.redGems;S.profile=S.profile||{};S.profile.level=S.level;}
 window.TerritoryStore?.saveNow?.();
}
function card(title,text){
 if(document.getElementById('tta-card'))document.getElementById('tta-card').remove();const home=document.getElementById('home');if(!home)return;
 const c=document.createElement('div');c.id='tta-card';c.className='tta-card';c.innerHTML='<div class="tta-dot"></div><div class="tta-copy"><b>'+esc(title)+'</b><span>'+esc(text)+'</span></div>';home.appendChild(c);requestAnimationFrame(()=>c.classList.add('show'));setTimeout(()=>{c.classList.remove('show');setTimeout(()=>c.remove(),450)},6000);
}
let syncing=false, timer=0;
async function pushState(force){if(window.TerritoryTelegramAuth.state!=='authenticated'||syncing)return;const s=safeState(localState());if(!s)return;clearTimeout(timer);if(!force){timer=setTimeout(()=>pushState(true),1200);return;}syncing=true;try{await api('/api/state',{method:'POST',body:JSON.stringify({state:s})});localStorage.setItem(SYNC_KEY,String(Date.now()));}catch(e){window.TerritoryTelegramAuth.lastSyncError=e.message||String(e)}finally{syncing=false;}}
async function authenticate(){
 const w=tg();if(!w||!w.initData){window.TerritoryTelegramAuth.state='guest';return {ok:false,guest:true};}
 try{w.ready();w.expand?.();const auth=await api('/api/auth');const local=localState();
  if(meaningful(local)&&auth.player?.legacy_imported===false&&auth.player?.has_server_progress===false)await api('/api/migrate',{method:'POST',body:JSON.stringify({level:Number(local.level||1),xp:Number(local.xp||local.exp||0),hp:Number(local.hp||100),maxHp:Number(local.maxHp||100),state:safeState(local)})});
  const fresh=await api('/api/auth');
  const remote=await api('/api/state');
  apply(fresh.player,remote.state||null);window.TerritoryTelegramAuth.state='authenticated';window.TerritoryTelegramAuth.player=fresh.player;
  card('Telegram подключён',(fresh.player.first_name||fresh.player.username||'Игрок')+' · прогресс синхронизирован');return fresh;
 }catch(e){window.TerritoryTelegramAuth.state='error';window.TerritoryTelegramAuth.error=e.message||String(e);card('Авторизация не завершена',e.message||'Сервер недоступен');return {ok:false,error:e};}
}
async function refresh(){if(window.TerritoryTelegramAuth.state!=='authenticated')return null;const d=await api('/api/state');apply(null,d.state||null);return d;}
window.TerritoryTelegramAuth={state:'idle',player:null,error:null,lastSyncError:'',authenticate,refresh,pushState,setServerUrl(v){localStorage.setItem(SERVER_KEY,String(v||''));},getServerUrl:serverUrl};
window.addEventListener('territory:state-changed',()=>pushState(false));
function boot(){setTimeout(authenticate,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
