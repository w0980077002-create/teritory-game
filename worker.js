import { DurableObject } from "cloudflare:workers";

const START = {
  coins: 1779, gems: 1330, energy: 191, hp: 120, maxHp: 120,
  level: 3, exp: 120, maxExp: 150, strength: 12, agility: 9,
  freePoints: 0, wins: 0, losses: 0, battles: 0
};

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store",
      "access-control-allow-origin":"*",
      "access-control-allow-headers":"Content-Type, X-Telegram-Init-Data, X-Guest-Id"
    }
  });
}
function cleanId(v) {
  return String(v ?? "").replace(/[^a-zA-Z0-9_:@.-]/g,"").slice(0,120);
}
function safeName(v) {
  return String(v ?? "Игрок").replace(/[<>]/g,"").slice(0,40) || "Игрок";
}
function validMove(m) {
  const a=Number(m?.attack), d=Array.isArray(m?.defs)?m.defs.map(Number):[];
  return Number.isInteger(a)&&a>=0&&a<=4&&d.length===2&&d[0]!==d[1]&&d.every(x=>Number.isInteger(x)&&x>=0&&x<=4);
}
async function telegramAuth(initData, token) {
  if(!initData||!token) return null;
  const p=new URLSearchParams(initData), hash=p.get("hash");
  if(!hash) return null;
  const authDate=Number(p.get("auth_date")||0);
  if(!authDate || Date.now()/1000-authDate>86400) return null;
  p.delete("hash");
  const check=[...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join("\n");
  const te=new TextEncoder();
  const webKey=await crypto.subtle.importKey("raw",te.encode("WebAppData"),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const secret=await crypto.subtle.sign("HMAC",webKey,te.encode(token));
  const signKey=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("HMAC",signKey,te.encode(check));
  const calc=[...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("");
  if(calc!==hash) return null;
  let user={}; try{user=JSON.parse(p.get("user")||"{}")}catch{}
  if(!user.id) return null;
  return {playerId:"tg_"+user.id,name:safeName([user.first_name,user.last_name].filter(Boolean).join(" ")||user.username||"Игрок")};
}
async function auth(request, env) {
  const init=request.headers.get("X-Telegram-Init-Data")||new URL(request.url).searchParams.get("initData");
  if(env.TELEGRAM_BOT_TOKEN) return telegramAuth(init,env.TELEGRAM_BOT_TOKEN);
  const id=cleanId(request.headers.get("X-Guest-Id")||"guest_"+crypto.randomUUID());
  return {playerId:id,name:safeName(request.headers.get("X-Guest-Name")||"Игрок"),guest:true};
}
function sanitize(s, auth) {
  const x=s&&typeof s==="object"?s:{};
  return {
    ...START, ...x,
    playerId:auth.playerId, playerName:auth.name,
    coins:Math.max(0,Math.min(500000,Number(x.coins)||START.coins)),
    gems:Math.max(0,Math.min(500000,Number(x.gems)||START.gems)),
    energy:Math.max(0,Math.min(500,Number(x.energy)||START.energy)),
    hp:Math.max(1,Math.min(500,Number(x.hp)||START.hp)),
    maxHp:Math.max(100,Math.min(500,Number(x.maxHp)||START.maxHp)),
    level:Math.max(1,Math.min(50,Number(x.level)||START.level)),
    strength:Math.max(1,Math.min(100,Number(x.strength)||START.strength)),
    agility:Math.max(1,Math.min(100,Number(x.agility)||START.agility))
  };
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==="OPTIONS") return json({});
    if(url.pathname==="/api/health") return json({ok:true,game:"Territory",city:"Sdolars",version:"s2"});
    if(url.pathname==="/api/state") {
      const a=await auth(request,env); if(!a) return json({error:"unauthorized"},401);
      const id=env.GAME_HUB.idFromName(a.playerId);
      return env.GAME_HUB.get(id).fetch(new Request("https://internal/state",{headers:{"x-player":a.playerId,"x-name":a.name}}));
    }
    if(url.pathname==="/api/state"&&request.method==="POST") {
      const a=await auth(request,env); if(!a) return json({error:"unauthorized"},401);
      const body=await request.json(); const id=env.GAME_HUB.idFromName(a.playerId);
      return env.GAME_HUB.get(id).fetch(new Request("https://internal/save",{method:"POST",headers:{"content-type":"application/json","x-player":a.playerId,"x-name":a.name},body:JSON.stringify(body)}));
    }
    if(url.pathname==="/api/battle"&&request.method==="POST") {
      const a=await auth(request,env); if(!a) return json({error:"unauthorized"},401);
      const move=await request.json(); if(!validMove(move)) return json({error:"invalid_move"},400);
      const id=env.GAME_HUB.idFromName(a.playerId);
      return env.GAME_HUB.get(id).fetch(new Request("https://internal/battle",{method:"POST",headers:{"content-type":"application/json","x-player":a.playerId,"x-name":a.name},body:JSON.stringify(move)}));
    }
    // Static game is served from /assets through the Workers Assets binding.
    if(env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Territory is running. Configure the ASSETS binding in wrangler.jsonc.",{status:404});
  }
};

export class GameHub extends DurableObject {
  constructor(ctx, env){super(ctx,env);this.ctx=ctx;this.env=env;}
  async fetch(request){
    const path=new URL(request.url).pathname;
    let s=await this.ctx.storage.get("state")||{...START,items:[]};
    if(path==="/state") return json(s);
    if(path==="/save"&&request.method==="POST"){
      const body=await request.json();
      s={...s,...body,playerId:request.headers.get("x-player"),playerName:safeName(request.headers.get("x-name")||"Игрок")};
      await this.ctx.storage.put("state",s); return json({ok:true,state:s});
    }
    if(path==="/battle"&&request.method==="POST"){
      const m=await request.json();
      const enemy={hp:90+Math.floor(Math.random()*141),damage:8+Math.floor(Math.random()*11)};
      const blocked=m.defs.includes(Math.floor(Math.random()*5));
      const crit=Math.random()<s.strength/100;
      let damage=Math.max(2,6+Math.floor(s.strength/3));
      if(crit) damage*=2;
      enemy.hp-=damage;
      if(enemy.hp<=0){s.wins++;s.coins+=100;s.exp+=35;}
      else if(!blocked)s.hp=Math.max(1,s.hp-enemy.damage);
      s.battles++;
      await this.ctx.storage.put("state",s);
      return json({ok:true,enemy,damage,crit,blocked,state:s});
    }
    return json({error:"not_found"},404);
  }
}
