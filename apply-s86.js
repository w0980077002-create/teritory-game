#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
const start=s.indexOf("  if(u.pathname==='/api/pvp/action'&&req.method==='POST')");
if(start<0) throw new Error('S86: /api/pvp/action route not found');
const end=s.indexOf("\n  // S82 REAL MATCHMAKING",start);
if(end<0) throw new Error('S86: matchmaking marker not found');
const old=s.slice(start,end);
const replacement=`  if(u.pathname==='/api/pvp/action'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);
    if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const m=pvpMatches.get(String(b.matchId||''));
    if(!m||m.status!=='active')return json(res,404,{ok:false,error:'match_not_active'});
    if(m.turn!==id)return json(res,409,{ok:false,error:'not_your_turn'});

    const zones=['head','chest','belt','legs'];
    const zone=clean(b.zone||'',16).toLowerCase();
    let defs=Array.isArray(b.defenseZones)?b.defenseZones:[];
    if(!defs.length&&Array.isArray(b.defenses))defs=b.defenses;
    if(!defs.length&&typeof b.defense==='string')defs=b.defense.split(',').map(x=>x.trim());
    defs=[...new Set(defs.map(x=>String(x).toLowerCase()).filter(x=>zones.includes(x)))];

    if(!zones.includes(zone))return json(res,400,{ok:false,error:'invalid_attack_zone'});
    if(defs.length!==2)return json(res,400,{ok:false,error:'exactly_two_defense_zones_required'});
    if(defs.includes(zone))return json(res,400,{ok:false,error:'attack_zone_cannot_be_blocked'});

    const isA=id===m.attacker.id;
    const power=isA?m.attacker.power:m.defender.power;
    const targetHp=isA?'defenderHp':'attackerHp';

    let dmg=Math.max(5,Math.round(7+power*0.55+(zone==='head'?5:zone==='chest'?3:zone==='belt'?2:0)));
    if(defs.includes(zone))dmg=Math.max(1,dmg-4);
    else if(defs.includes(zone==='head'?'chest':zone==='chest'?'belt':zone==='belt'?'legs':'head'))dmg=Math.max(2,dmg-2);
    if(Math.random()<0.12)dmg+=Math.round(dmg*.5);

    m[targetHp]=Math.max(0,m[targetHp]-dmg);
    m.log.push({ts:Date.now(),type:'attack',zone,defenseZones:defs.slice(),text:\`\${isA?m.attacker.name:m.defender.name} атакует \${zone}, блок: \${defs.join('+')}, урон \${dmg}\`});

    if(m[targetHp]<=0){
      m.status='finished';m.winner=id;
      m.log.push({ts:Date.now(),type:'finish',text:\`Победитель: \${isA?m.attacker.name:m.defender.name}\`});
      const win=db.players[id],lose=db.players[isA?m.defender.id:m.attacker.id];
      if(win){win.xp=Number(win.xp||0)+25;win.updatedAt=Date.now()}
      if(lose){lose.xp=Number(lose.xp||0)+5;lose.updatedAt=Date.now()}
      const wc=clanByMember(id),lc=clanByMember(isA?m.defender.id:m.attacker.id);
      if(wc){wc.reputation=Number(wc.reputation||0)+15;wc.xp=Number(wc.xp||0)+20;wc.updatedAt=Date.now()}
      if(lc){lc.reputation=Math.max(0,Number(lc.reputation||0)-8);lc.updatedAt=Date.now()}
      persist();
    }else{
      m.turn=isA?m.defender.id:m.attacker.id;m.round++;
      m.log.push({ts:Date.now(),type:'turn',text:\`Ход игрока \${m.turn}\`});
    }
    m.updatedAt=Date.now();
    return json(res,200,{ok:true,match:pvpPublic(m)});
  });`;
fs.copyFileSync(file,file+'.s85-backup');
s=s.slice(0,start)+replacement+s.slice(end);
fs.writeFileSync(file,s);
console.log('S86 applied:',file,'backup:',file+'.s85-backup');
