/* TERRITORY — TELEGRAM AUTHORITY PASS 55
   Telegram-only. Server is the source of truth for identity, economy,
   level, VIP and progression. LocalStorage is never migrated into a new account.
*/
(function(){
'use strict';
if(window.TerritoryTelegramAuth?.foundationComplete08)return;
const STORE_KEY='territory_store_v1';
const SERVER_KEY='territory_server_url_v1';
const tg=()=>window.Telegram?.WebApp||null;
const serverUrl=()=>String(window.TERRITORY_SERVER_URL||localStorage.getItem(SERVER_KEY)||'https://territory-sdolars-server.w0660077002.workers.dev').replace(/\/$/,'');
function localState(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'null')}catch(_){return null}}
function safeState(s){
  if(!s||typeof s!=='object')return null;
  const x={...s};
  for(const k of ['coins','gems','redGems','red_gems','profile','vip','pve','currentChapter','chapterStage','chapterProgress','chapterBossUnlocked','chapterBossDefeated','chapterCompleted','battleStones','battleStonesBonus','battleStonesDate','battleStonesCap','level','xp','xpNext','inventoryItems','lootFound','forge','totalChaptersCompleted','chapterRewardsClaimed','rewardProgress','rewardClaims','daily','weekly','story','achievementClaims'])delete x[k];
  x.hp=Math.max(0,Number(s.hp)||0);x.maxHp=Math.max(1,Number(s.maxHp)||100);
  x.energy=Math.max(0,Number(s.energy)||0);x.maxEnergy=Math.max(1,Number(s.maxEnergy)||100);
  x.equipment=Array.isArray(s.equipment)?s.equipment.slice(0,7):[];
  x.followers=s.followers||{};x.activeFollower=s.activeFollower||null;x.consumables=s.consumables||{};x.arena=s.arena||{};
  x.auto=!!s.auto;x.pos=Math.max(0,Number(s.pos)||0);x.dice=Math.max(0,Number(s.dice)||0);
  return x;
}
async function api(path,options){
  const w=tg();
  const headers=Object.assign({'content-type':'application/json','x-telegram-init-data':w?.initData||''},options?.headers||{});
  const r=await fetch(serverUrl()+path,Object.assign({},options||{},{headers}));
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
  return d;
}
function patchSaveGate(){
  const S=window.TerritoryStore;
  if(!S||S.__territoryServerSaveGate55)return;
  const original=S.saveNow?.bind(S);
  if(typeof original!=='function')return;
  S.__territoryServerSaveGate55=true;
  S.__territoryOriginalSaveNow55=original;
  S.saveNow=function(){
    if(window.TerritoryTelegramAuth?.state!=='authenticated')return;
    return original.apply(null,arguments);
  };
}
function apply(player,state){
  const S=window.TerritoryStore?.state;if(!S)throw new Error('TerritoryStore недоступен');
  const serverState=(state&&typeof state==='object')?state:{};
  Object.assign(S,serverState);
  S.profile=Object.assign({},S.profile||{},serverState.profile||{});
  if(player){
    S.profile.displayName=player.first_name||player.username||S.profile.displayName||'Игрок';
    S.profile.username=player.username||'';
    S.profile.telegramId=String(player.telegram_id||'');
    S.profile.photoUrl=player.photo_url||'';
    S.profile.vip=Math.max(0,Number(player.vip)||0);
    S.level=Math.max(1,Number(player.level)||1);
    S.profile.level=S.level;
    S.xp=Math.max(0,Number(player.xp)||0);
    S.xpNext=Math.max(1,Number(player.xp_next)||100);
    S.exp=S.xp;S.expToNext=S.xpNext;
    S.hp=Math.max(0,Number(player.hp)||0);
    S.maxHp=Math.max(1,Number(player.max_hp)||100);
    S.coins=Math.max(0,Number(player.coins)||0);
    S.gems=Math.max(0,Number(player.gems)||0);
    S.redGems=Math.max(0,Number(player.red_gems)||0);
  }
  if(!S.currentChapter)S.currentChapter=1;
  if(!S.chapterStage)S.chapterStage=1;
  if(S.chapterProgress==null)S.chapterProgress=0;
  S.pve=Object.assign({},S.pve||{},{chapter:S.currentChapter,stage:S.chapterStage,progress:S.chapterProgress});
  window.__territoryServerHydrated55=true;
  try{window.TerritoryStore?.saveNow?.('server-authoritative-hydrate')}catch(_){ }
}
let syncTimer=0,syncing=false,hydrating=false,lastRefresh=0;
async function hydrate(player,state){hydrating=true;try{apply(player,state)}finally{hydrating=false}}
async function pushState(force){
  if(hydrating||window.TerritoryTelegramAuth.state!=='authenticated'||syncing)return;
  const state=safeState(localState());if(!state)return;
  clearTimeout(syncTimer);
  if(!force){syncTimer=setTimeout(()=>pushState(true),1200);return;}
  syncing=true;
  try{const d=await api('/api/state',{method:'POST',body:JSON.stringify({state})});if(d.player)await hydrate(d.player,d.state||null);window.TerritoryTelegramAuth.lastSyncError=''}
  catch(e){window.TerritoryTelegramAuth.lastSyncError=e.message||String(e)}
  finally{syncing=false}
}
async function refresh(){
  if(window.TerritoryTelegramAuth.state!=='authenticated'||syncing)return null;
  const t=Date.now();if(t-lastRefresh<1500)return null;lastRefresh=t;
  try{const d=await api('/api/player');await hydrate(d.player,d.state||null);window.TerritoryTelegramAuth.player=d.player;return d}
  catch(e){window.TerritoryTelegramAuth.lastSyncError=e.message||String(e);return null}
}
async function authenticate(){
  patchSaveGate();
  const w=tg();
  if(!w||!w.initData){
    window.TerritoryTelegramAuth.state='error';
    window.TerritoryTelegramAuth.error='Territory запускается только внутри Telegram.';
    return {ok:false,error:new Error(window.TerritoryTelegramAuth.error)};
  }
  try{
    w.ready();w.expand?.();
    const auth=await api('/api/player');
    await hydrate(auth.player,auth.state||null);
    window.TerritoryTelegramAuth.state='authenticated';
    window.TerritoryTelegramAuth.player=auth.player;
    window.TerritoryTelegramAuth.error=null;
    window.dispatchEvent(new CustomEvent('territory:telegram-authenticated',{detail:{player:auth.player}}));
    window.TerritoryTelegramAuth.refreshEconomy=async()=>{
      const d=await api('/api/economy');
      if(d.economy)await hydrate({coins:d.economy.coins,gems:d.economy.gems,red_gems:d.economy.red_gems,vip:d.economy.vip},null);
      return d;
    };
    return auth;
  }catch(e){
    window.TerritoryTelegramAuth.state='error';
    window.TerritoryTelegramAuth.error=e.message||String(e);
    return {ok:false,error:e};
  }
}
window.TerritoryTelegramAuth=Object.assign(window.TerritoryTelegramAuth||{},{
  foundationComplete08:true,state:'idle',player:null,error:null,lastSyncError:'',authenticate,refresh,pushState,
  setServerUrl(v){localStorage.setItem(SERVER_KEY,String(v||''))},getServerUrl:serverUrl,api
});
window.addEventListener('territory:state-changed',()=>{if(!hydrating)pushState(false)});
function boot(){patchSaveGate();setTimeout(authenticate,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
