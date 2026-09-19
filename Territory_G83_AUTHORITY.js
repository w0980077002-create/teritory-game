/* Territory G83 — Authority Gateway
   Unifies the GAME-side calls that must be accepted from the server.
   G80/G81 remain compatible; this layer adds action IDs and economy reconciliation.
   PvE/Arena results are NOT claimed to be server-authoritative yet. */
(function(){'use strict';
 const Store=window.TerritoryStore; if(!Store)return;
 const st=Store.state;
 const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
 const tg=()=>window.Telegram?.WebApp||null;
 const initData=()=>String(tg()?.initData||'');
 const uid=()=>{try{if(crypto?.randomUUID)return crypto.randomUUID()}catch(_){}return 'g83-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
 const emit=(n,d)=>window.dispatchEvent(new CustomEvent(n,{detail:d}));
 const saveLocal=r=>{try{Store.saveNow?.(r||'g83')}catch(_){}};
 function applyEconomy(s){if(!s||typeof s!=='object')return false;for(const k of ['coins','gems','combatStone','inventory'])if(Object.prototype.hasOwnProperty.call(s,k))st[k]=s[k];st.g83=st.g83||{};st.g83.lastSync=Date.now();saveLocal('g83-sync');return true;}
 async function request(action,extra={}){
   const data=initData(); if(!data)throw new Error('Открой Territory внутри Telegram');
   const body={initData:data,action,actionId:uid(),...extra};
   const r=await fetch(SERVER+'/api/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
   let d=null;try{d=await r.json()}catch(_){}
   if(!r.ok||!d?.ok)throw new Error(d?.error||('HTTP '+r.status));
   if(d.state)applyEconomy(d.state);
   emit('territory:authority-action',{action,result:d});
   return d;
 }
 async function sync(){
   const data=initData(); if(!data)return {ok:false,reason:'not-telegram'};
   const r=await fetch(SERVER+'/api/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData:data}),cache:'no-store'});
   let d=null;try{d=await r.json()}catch(_){}
   if(!r.ok||!d?.ok)throw new Error(d?.error||('HTTP '+r.status));
   applyEconomy(d.state||{});
   st.g83=st.g83||{};st.g83.server=SERVER;st.g83.authoritative=['coins','gems','combatStone','inventory'];st.g83.lastAuth=Date.now();
   emit('territory:authority-sync',{result:d});
   return d;
 }
 async function dailyClaim(){return request('daily_claim');}
 async function shopBuy(itemId){return request('shop_buy',{itemId:String(itemId||'')});}
 function status(){return {version:'G83',server:SERVER,telegram:!!initData(),lastSync:Number(st.g83?.lastSync||0),authoritative:['coins','gems','combatStone','inventory']};}
 // Replace the older G81 entry points so existing UI can keep using them.
 if(window.TerritoryServerActions){window.TerritoryServerActions.dailyClaim=dailyClaim;window.TerritoryServerActions.shopBuy=shopBuy;window.TerritoryServerActions.request=request;window.TerritoryServerActions.status=status;}
 window.TerritoryAuthority={version:'G83',server:SERVER,request,sync,dailyClaim,shopBuy,status,applyEconomy};
 st.g83=st.g83||{};st.g83.version='G83';
 setTimeout(()=>{if(initData())sync().catch(e=>{st.g83=st.g83||{};st.g83.lastError=String(e.message||e);emit('territory:authority-error',{stage:'sync',error:st.g83.lastError})})},1800);
 setInterval(()=>{if(initData())sync().catch(()=>{})},60000);
})();
