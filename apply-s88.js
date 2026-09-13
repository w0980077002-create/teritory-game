#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
if(s.includes('// S88 ECONOMY SYSTEM')){console.log('S88 already present');process.exit(0)}
const marker="\n  // S82 REAL MATCHMAKING";
const at=s.indexOf(marker);
if(at<0)throw new Error('S88: matchmaking marker not found');

const block=String.raw`
  // S88 ECONOMY SYSTEM
  const S88_CATALOG={
    iron_sword:{id:'iron_sword',name:'Железный меч',slot:'weapon',power:8,crit:2,buy:250,sell:125},
    viking_axe:{id:'viking_axe',name:'Викингский топор',slot:'weapon',power:12,crit:3,buy:450,sell:225},
    steel_armor:{id:'steel_armor',name:'Стальная броня',slot:'armor',power:5,hp:30,buy:600,sell:300},
    leather_belt:{id:'leather_belt',name:'Кожаный пояс',slot:'belt',power:2,hp:10,buy:180,sell:90}
  };
  function economyPlayer(id){
    const p=db.players[id];
    if(!p)return null;
    p.coins=Math.max(0,Number(p.coins??1000));
    p.inventory=Array.isArray(p.inventory)?p.inventory:[];
    return p;
  }
  function ownedCount(p,id){return p.inventory.filter(x=>x===id).length}
  if(u.pathname==='/api/market'&&req.method==='GET'){
    return json(res,200,{ok:true,items:Object.values(S88_CATALOG)});
  }
  if(u.pathname==='/api/economy'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40),p=economyPlayer(id);
    if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    return json(res,200,{ok:true,coins:p.coins,inventory:p.inventory,equipment:typeof equipState==='function'?equipState(p):null});
  }
  if(u.pathname==='/api/market/buy'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=economyPlayer(id),item=S88_CATALOG[String(b.itemId||'')],qty=Math.max(1,Math.min(20,Number(b.qty||1)));
    if(!p||!item)return json(res,404,{ok:false,error:'item_not_found'});
    const cost=item.buy*qty;if(p.coins<cost)return json(res,409,{ok:false,error:'not_enough_coins',coins:p.coins,cost});
    p.coins-=cost;for(let i=0;i<qty;i++)p.inventory.push(item.id);p.updatedAt=Date.now();persist();
    return json(res,200,{ok:true,coins:p.coins,item:item.id,qty,inventory:p.inventory});
  });
  if(u.pathname==='/api/market/sell'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=economyPlayer(id),item=S88_CATALOG[String(b.itemId||'')],qty=Math.max(1,Math.min(20,Number(b.qty||1)));
    if(!p||!item)return json(res,404,{ok:false,error:'item_not_found'});
    const n=Math.min(qty,ownedCount(p,item.id));if(!n)return json(res,409,{ok:false,error:'item_not_owned'});
    if(typeof equipState==='function'){const e=equipState(p);if(e[item.slot]===item.id&&ownedCount(p,item.id)<=n&&item.slot==='weapon')return json(res,409,{ok:false,error:'cannot_sell_equipped_weapon'});if(e[item.slot]===item.id&&ownedCount(p,item.id)<=n)e[item.slot]=null}
    for(let i=0;i<n;i++){const ix=p.inventory.indexOf(item.id);if(ix>=0)p.inventory.splice(ix,1)}
    p.coins+=item.sell*n;p.updatedAt=Date.now();persist();
    return json(res,200,{ok:true,coins:p.coins,item:item.id,qty:n,inventory:p.inventory});
  });
  if(u.pathname==='/api/economy/reward'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=economyPlayer(id),amount=Math.max(0,Math.min(10000,Math.floor(Number(b.amount||0))));
    if(!p||!amount)return json(res,400,{ok:false,error:'invalid_reward'});
    p.coins+=amount;p.updatedAt=Date.now();persist();return json(res,200,{ok:true,coins:p.coins,added:amount});
  });
`;
s=s.slice(0,at)+block+s.slice(at);
fs.copyFileSync(file,file+'.s87-backup');
fs.writeFileSync(file,s);
console.log('S88 applied:',file);
