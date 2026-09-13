#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
if(s.includes('// S90 CHARACTER PROGRESSION')){console.log('S90 already present');process.exit(0)}
const marker="\n  // S82 REAL MATCHMAKING";
const at=s.indexOf(marker);
if(at<0)throw new Error('S90: matchmaking marker not found');

const block=String.raw`
  // S90 CHARACTER PROGRESSION
  const S90_MAX_STAT=100;
  function statsState(p){
    p.strength=Math.max(1,Number(p.strength??5));
    p.agility=Math.max(1,Number(p.agility??5));
    p.freePoints=Math.max(0,Number(p.freePoints??0));
    return p;
  }
  function progressionStats(id){
    const p=db.players[id]||{};statsState(p);
    const eq=typeof combatStats==='function'?combatStats(id):{power:10+(Number(p.level||1)*5),hp:100+(Number(p.level||1)*10),crit:0};
    const strength=Number(p.strength||1),agility=Number(p.agility||1);
    return {
      strength,agility,freePoints:Number(p.freePoints||0),
      level:Number(p.level||1),xp:Number(p.xp||0),
      attackPower:Math.round(eq.power+strength*1.5),
      maxHp:Math.round(eq.hp+agility*2),
      critChance:Math.min(40,2+strength*.25),
      dodgeChance:Math.min(35,agility*.3)
    };
  }
  function awardLevelPoints(p){
    statsState(p);
    const level=Number(p.level||1);
    p.freePoints=Math.max(0,Number(p.freePoints||0));
    return level;
  }
  function upgradeStat(p,stat,count){
    statsState(p);
    const n=Math.max(1,Math.min(20,Math.floor(Number(count||1))));
    if(!['strength','agility'].includes(stat))return {ok:false,error:'invalid_stat'};
    if(p.freePoints<n)return {ok:false,error:'not_enough_free_points'};
    if(Number(p[stat]||0)+n>S90_MAX_STAT)return {ok:false,error:'stat_limit'};
    p[stat]+=n;p.freePoints-=n;p.updatedAt=Date.now();return {ok:true};
  }
  if(u.pathname==='/api/character'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40),p=db.players[id];
    if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    return json(res,200,{ok:true,stats:progressionStats(id)});
  }
  if(u.pathname==='/api/character/upgrade'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    const r=upgradeStat(p,clean(b.stat,16),b.count);
    if(!r.ok)return json(res,409,r);
    persist();return json(res,200,{ok:true,stats:progressionStats(id)});
  });
  if(u.pathname==='/api/character/reset-points'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    statsState(p);
    const spent=Math.max(0,(p.strength-5)+(p.agility-5));
    p.strength=5;p.agility=5;p.freePoints+=spent;p.updatedAt=Date.now();persist();
    return json(res,200,{ok:true,stats:progressionStats(id)});
  });
`;

/* Insert system before matchmaking. */
s=s.slice(0,at)+block+s.slice(at);

/* Make every existing level-up grant 2 free points per gained level. */
const old="while(p.xp>=need&&levels<20){p.xp-=need;p.level++;levels++;need=100+p.level*75}";
const repl="while(p.xp>=need&&levels<20){p.xp-=need;p.level++;levels++;p.freePoints=Number(p.freePoints||0)+2;need=100+p.level*75}";
if(!s.includes(old))throw new Error('S90: level-up loop not found');
s=s.replace(old,repl);

/* Give stats a real role in PvP: strength raises damage/crit, agility adds dodge. */
const oldDmg="let dmg=Math.max(5,Math.round(7+power*0.55+(zone==='head'?5:zone==='chest'?3:zone==='belt'?2:0)))";
const newDmg="const actorProg=progressionStats(id); let dmg=Math.max(5,Math.round(7+power*0.55+actorProg.strength*0.65+(zone==='head'?5:zone==='chest'?3:zone==='belt'?2:0)))";
if(!s.includes(oldDmg))throw new Error('S90: PvP damage formula not found');
s=s.replace(oldDmg,newDmg);

const oldCrit="if(Math.random()<Math.min(.35,.12+actorStats.crit/100))dmg+=Math.round(dmg*.5);";
const newCrit="if(Math.random()<Math.min(.40,.12+actorStats.crit/100+actorProg.strength*.002))dmg+=Math.round(dmg*.5);";
if(s.includes(oldCrit))s=s.replace(oldCrit,newCrit);

fs.copyFileSync(file,file+'.s89-backup');
fs.writeFileSync(file,s);
console.log('S90 applied:',file);
