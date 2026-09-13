#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
if(s.includes('// S96 LIVE EQUIPMENT IN PVP')){console.log('S96 already present');process.exit(0)}

const marker="\n  // S82 REAL MATCHMAKING";
const at=s.indexOf(marker);
if(at<0)throw new Error('S96: matchmaking marker not found');

const block=String.raw`
  // S96 LIVE EQUIPMENT IN PVP
  function s96Equipment(id){
    const p=db.players[id]||{};
    if(typeof equipState==='function')return {...equipState(p)};
    return {...(p.equipment||{weapon:'fists',armor:null,belt:null})};
  }
  function s96BattleProfile(id){
    const p=db.players[id]||{};
    const eq=typeof combatStats==='function'?combatStats(id):{
      power:10+Number(p.level||1)*5,
      hp:100+Number(p.level||1)*10,
      crit:0
    };
    return {
      equipment:s96Equipment(id),
      power:Number(eq.power||10),
      maxHp:Number(eq.hp||100),
      crit:Number(eq.crit||0),
      level:Number(p.level||1)
    };
  }
  function s96PvpPublic(m){
    const a=s96BattleProfile(m.attacker.id),d=s96BattleProfile(m.defender.id);
    return {
      id:m.id,status:m.status,round:m.round,
      attacker:{...m.attacker,equipment:a.equipment,stats:a},
      defender:{...m.defender,equipment:d.equipment,stats:d},
      turn:m.turn,attackerHp:m.attackerHp,defenderHp:m.defenderHp,
      log:m.log.slice(-12),winner:m.winner||null,createdAt:m.createdAt,updatedAt:m.updatedAt
    };
  }
`;

s=s.slice(0,at)+block+s.slice(at);

/* Replace pvpPublic calls with the live equipment-aware serializer. */
const replacements=[
  ["return {ok:true,match:pvpPublic(m)}","return {ok:true,match:s96PvpPublic(m)}"],
  ["map(pvpPublic)","map(s96PvpPublic)"]
];
for(const [a,b] of replacements)s=s.split(a).join(b);

/* Make newly created PVP snapshots use equipment-aware profiles immediately. */
s=s.replace(
  "function makePvp(id,a,d){return {id, status:'active', round:1, attacker:a, defender:d, turn:a, attackerHp:100+memberPower(a)*2, defenderHp:100+memberPower(d)*2,",
  "function makePvp(id,a,d){return {id, status:'active', round:1, attacker:a, defender:d, turn:a, attackerHp:s96BattleProfile(a.id).maxHp, defenderHp:s96BattleProfile(d.id).maxHp,"
);

/* Ensure the pending challenge and matchmaking responses also expose live equipment. */
s=s.replace(
  "const m={id:idm,status:'pending'",
  "const m={id:idm,status:'pending'"
);

fs.copyFileSync(file,file+'.s95-backup');
fs.writeFileSync(file,s);
console.log('S96 applied:',file);
