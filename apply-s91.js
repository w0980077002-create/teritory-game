#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
if(s.includes('// S91 DODGE COMBAT')){console.log('S91 already present');process.exit(0)}
const marker="\n  // S82 REAL MATCHMAKING";
const at=s.indexOf(marker);
if(at<0)throw new Error('S91: matchmaking marker not found');

const block=String.raw`
  // S91 DODGE COMBAT
  function s91CombatStats(id){
    const p=db.players[id]||{};
    const base=typeof progressionStats==='function'?progressionStats(id):{strength:5,agility:5,dodgeChance:1,critChance:2};
    return {
      strength:Number(base.strength||5),
      agility:Number(base.agility||5),
      dodgeChance:Math.min(35,Number(base.dodgeChance||0)),
      critChance:Math.min(40,Number(base.critChance||0))
    };
  }
  function s91Attack(m,id,zone,defs){
    const isA=id===m.attacker.id;
    const attackerStats=s91CombatStats(id);
    const targetId=isA?m.defender.id:m.attacker.id;
    const targetStats=s91CombatStats(targetId);
    const power=isA?m.attacker.power:m.defender.power;
    let dmg=Math.max(5,Math.round(7+power*.55+attackerStats.strength*.65+
      (zone==='head'?5:zone==='chest'?3:zone==='belt'?2:0)));
    if(defs.includes(zone))dmg=Math.max(1,dmg-4);
    else {
      const adjacent=zone==='head'?'chest':zone==='chest'?'belt':zone==='belt'?'legs':'head';
      if(defs.includes(adjacent))dmg=Math.max(2,dmg-2);
    }
    const crit=Math.random() < attackerStats.critChance/100;
    if(crit)dmg+=Math.round(dmg*.5);
    const dodge=Math.random() < targetStats.dodgeChance/100;
    return {dmg: dodge?0:dmg,crit,dodge,dodgeChance:targetStats.dodgeChance,critChance:attackerStats.critChance};
  }
`;
s=s.slice(0,at)+block+s.slice(at);

/* Replace the existing damage/crit section inside the S86 action route. */
const oldStart="const actorStats=combatStats(id);";
const oldEnd="m[targetHp]=Math.max(0,m[targetHp]-dmg);";
const pos=s.indexOf(oldStart);
if(pos<0)throw new Error('S91: actorStats section not found');
const end=s.indexOf(oldEnd,pos);
if(end<0)throw new Error('S91: damage assignment not found');

const replacement=String.raw`const actorStats=combatStats(id);
    const result=s91Attack(m,id,zone,defs);
    dmg=result.dmg;
    if(result.dodge){
      m.log.push({ts:Date.now(),type:'dodge',zone,defenseZones:defs.slice(),text:\`\${isA?m.defender.name:m.attacker.name} уклонился от атаки (\${result.dodgeChance.toFixed(1)}%)\`});
    }else if(result.crit){
      m.log.push({ts:Date.now(),type:'crit',zone,defenseZones:defs.slice(),text:\`КРИТИЧЕСКИЙ УДАР по зоне \${zone}, урон \${dmg}\`});
    }
    `;
s=s.slice(0,pos)+replacement+s.slice(end);
/* Keep the existing HP assignment but ensure it follows the new result. */

fs.copyFileSync(file,file+'.s90-backup');
fs.writeFileSync(file,s);
console.log('S91 applied:',file);
