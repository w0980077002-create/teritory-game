#!/usr/bin/env node
'use strict';
const fs=require('fs');
const file=process.argv[2]||'server.js';
let s=fs.readFileSync(file,'utf8');
if(s.includes('// S89 QUESTS PROGRESSION')){console.log('S89 already present');process.exit(0)}
const marker="\n  // S82 REAL MATCHMAKING";
const at=s.indexOf(marker);
if(at<0)throw new Error('S89: matchmaking marker not found');

const block=String.raw`
  // S89 QUESTS PROGRESSION
  const S89_QUESTS={
    first_blood:{id:'first_blood',name:'Первая кровь',desc:'Проведи 1 PvP-бой',type:'wins',goal:1,xp:40,coins:120},
    fighter:{id:'fighter',name:'Боец Сдоларса',desc:'Победи 3 противников',type:'wins',goal:3,xp:120,coins:350},
    veteran:{id:'veteran',name:'Ветеран арены',desc:'Проведи 10 PvP-побед',type:'wins',goal:10,xp:450,coins:1000}
  };
  function questState(p){
    p.quests=p.quests&&typeof p.quests==='object'?p.quests:{};
    for(const q of Object.values(S89_QUESTS)){
      if(!p.quests[q.id])p.quests[q.id]={progress:0,claimed:false};
    }
    return p.quests;
  }
  function playerWins(p){return Number(p.pvpWins||0)}
  function levelUp(p){
    p.level=Math.max(1,Number(p.level||1));
    p.xp=Math.max(0,Number(p.xp||0));
    let need=100+p.level*75,levels=0;
    while(p.xp>=need&&levels<20){p.xp-=need;p.level++;levels++;need=100+p.level*75}
    return levels;
  }
  function questPublic(p){
    const st=questState(p);
    return Object.values(S89_QUESTS).map(q=>({...q,progress:Math.min(q.goal,Number(st[q.id].progress||0)),claimed:!!st[q.id].claimed,completed:Number(st[q.id].progress||0)>=q.goal}));
  }
  function advanceQuests(id,kind,amount=1){
    const p=db.players[id];if(!p)return;
    const st=questState(p);
    for(const q of Object.values(S89_QUESTS))if(q.type===kind&&!st[q.id].claimed)st[q.id].progress=Math.min(q.goal,Number(st[q.id].progress||0)+amount);
  }
  if(u.pathname==='/api/quests'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40),p=db.players[id];
    if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    return json(res,200,{ok:true,quests:questPublic(p),level:Number(p.level||1),xp:Number(p.xp||0),nextXp:100+Number(p.level||1)*75,wins:playerWins(p)});
  }
  if(u.pathname==='/api/quests/claim'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    const p=db.players[id],qid=clean(b.questId,40),q=S89_QUESTS[qid];
    if(!p||!q)return json(res,404,{ok:false,error:'quest_not_found'});
    const st=questState(p)[qid];
    if(st.claimed)return json(res,409,{ok:false,error:'quest_already_claimed'});
    if(Number(st.progress||0)<q.goal)return json(res,409,{ok:false,error:'quest_not_completed',progress:st.progress,goal:q.goal});
    p.xp=Number(p.xp||0)+q.xp;p.coins=Math.max(0,Number(p.coins??1000))+q.coins;st.claimed=true;
    const gained=levelUp(p);p.updatedAt=Date.now();persist();
    return json(res,200,{ok:true,quest:qid,reward:{xp:q.xp,coins:q.coins},level:p.level,xp:p.xp,levelsGained:gained,quests:questPublic(p)});
  });
`;
s=s.slice(0,at)+block+s.slice(at);

/* Count a PvP win at the existing finish point. */
const needle="if(win){win.xp=Number(win.xp||0)+25;win.updatedAt=Date.now()}";
const repl="if(win){win.xp=Number(win.xp||0)+25;win.pvpWins=Number(win.pvpWins||0)+1;advanceQuests(id,'wins',1);const gained=levelUp(win);win.updatedAt=Date.now()}";
if(!s.includes(needle))throw new Error('S89: PvP reward point not found');
s=s.replace(needle,repl);

fs.copyFileSync(file,file+'.s88-backup');
fs.writeFileSync(file,s);
console.log('S89 applied:',file);
