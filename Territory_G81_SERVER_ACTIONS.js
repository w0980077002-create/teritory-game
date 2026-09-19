/* Territory G81 — Server Action Bridge
   Routes security-sensitive economy actions through the existing G80 Worker.
   Local UI remains the same; the server becomes authoritative for supported actions. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
 const tg=()=>window.Telegram?.WebApp||null;
 const initData=()=>String(tg()?.initData||'');
 const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
 async function request(action,extra={}){
   const data=initData();
   if(!data) throw new Error('Открой Territory внутри Telegram');
   const r=await fetch(SERVER+'/api/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData:data,action,...extra}),cache:'no-store'});
   let d=null;try{d=await r.json()}catch(_){}
   if(!r.ok||!d?.ok)throw new Error(d?.error||('HTTP '+r.status));
   if(d.state&&typeof d.state==='object'){
     if(window.TerritoryServer?.applyServerPatch)window.TerritoryServer.applyServerPatch(d.state);
     else Object.assign(st,d.state);
     try{Store.saveNow?.('g81-server-action')}catch(_){}
   }
   emit('territory:server-action',{action,result:d});
   return d;
 }
 async function dailyClaim(){
   const d=await request('daily_claim');
   const g65=st.g65||{};
   g65.serverDaily=true;
   st.g65=g65;
   try{Store.saveNow?.('g81-daily')}catch(_){}
   return d;
 }
 async function shopBuy(itemId){return request('shop_buy',{itemId:String(itemId||'')});}
 function status(){return {version:'G81',server:SERVER,telegram:!!initData(),supported:['daily_claim','shop_buy']};}
 window.TerritoryServerActions={version:'G81',server:SERVER,request,dailyClaim,shopBuy,status};
})();
