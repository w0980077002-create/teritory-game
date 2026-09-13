'use strict';
const http=require('http');
const crypto=require('crypto');
const WebSocket=require('ws');
const fs=require('fs');
const PORT=Number(process.env.PORT||8080);
const BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN||'';
const DATA_FILE=process.env.TERRITORY_DATA_FILE||'./territory-data.json';
let db={players:{},clans:{}};
try{if(fs.existsSync(DATA_FILE)){const x=JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));db={players:x.players||{},clans:x.clans||{}}}}catch(e){console.error('db load:',e.message)}
function persist(){try{fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2))}catch(e){console.error('db save:',e.message)}}
const rooms=new Map(),players=new Map(),MAX_ROOM=50;
function json(res,code,obj){const body=JSON.stringify(obj);res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-telegram-init-data'});res.end(body)}
function body(req,cb){let raw='';req.on('data',d=>{raw+=d;if(raw.length>1e6)req.destroy()});req.on('end',()=>{try{cb(JSON.parse(raw||'{}'))}catch(e){cb({})}})}
function clean(v,max=32){return String(v??'').trim().slice(0,max)}
function safeId(v){return clean(v,40).replace(/[^a-zA-Z0-9_-]/g,'')}
function roomCode(){let c;do c=Math.random().toString(36).slice(2,8).toUpperCase();while(rooms.has(c));return c}
function verifyTelegram(initData){
  if(!BOT_TOKEN)return {ok:true,telegramId:null,verified:false};
  if(!initData)return {ok:false,reason:'missing_init_data'};
  const p=new URLSearchParams(initData),hash=p.get('hash');if(!hash)return {ok:false,reason:'missing_hash'};p.delete('hash');
  const data=[...p.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>k+'='+v).join('\n');
  const secret=crypto.createHmac('sha256','WebAppData').update(BOT_TOKEN).digest();
  const calc=crypto.createHmac('sha256',secret).update(data).digest('hex');
  const ok=hash.length===calc.length&&crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(calc));
  let user=null;try{user=JSON.parse(p.get('user')||'null')}catch(e){}
  return {ok,telegramId:user&&String(user.id)||null,verified:true,user};
}
function auth(req){return verifyTelegram(req.headers['x-telegram-init-data']||'')}
function clanPublic(c){return {id:c.id,name:c.name,tag:c.tag,ownerId:c.ownerId,level:c.level,xp:c.xp,reputation:c.reputation,treasury:c.treasury,members:Object.values(c.members).map(m=>({id:m.id,name:m.name,role:m.role,level:m.level,power:m.power,joinedAt:m.joinedAt})),createdAt:c.createdAt,updatedAt:c.updatedAt}}
function makeClan(id,name,tag,owner){return {id,name,tag,ownerId:owner,level:1,xp:0,reputation:0,treasury:0,members:{[owner]:{id:owner,name,role:'leader',level:1,power:10,joinedAt:Date.now()}},createdAt:Date.now(),updatedAt:Date.now()}}
function playerIdFrom(req,b){const a=auth(req);return {a,id:String(b.playerId||a.telegramId||'')}}
function ensurePlayer(id,name){if(!db.players[id])db.players[id]={id,name:name||'Игрок',clan:'',level:1,xp:0,updatedAt:Date.now()};return db.players[id]}
function clanByMember(id){return Object.values(db.clans).find(c=>c.members&&c.members[id])||null}
function snapshot(room){const set=rooms.get(room);return {room,players:set?[...set].map(ws=>{for(const p of players.values())if(p.ws===ws)return {playerId:p.playerId,name:p.name,connected:true};return null}).filter(Boolean):[]}}
function broadcast(room,msg,except){const set=rooms.get(room);if(!set)return;const raw=JSON.stringify(msg);for(const c of set)if(c!==except&&c.readyState===WebSocket.OPEN)c.send(raw)}

// S81 REAL PVP
const pvpMatches=new Map(), pvpQueue=[];
function pvpPublic(m){return {id:m.id,status:m.status,round:m.round,attacker:m.attacker,defender:m.defender,turn:m.turn,attackerHp:m.attackerHp,defenderHp:m.defenderHp,log:m.log.slice(-12),winner:m.winner||null,createdAt:m.createdAt,updatedAt:m.updatedAt};}
function memberPower(id){const p=db.players[id]; if(!p)return 10; return Math.max(10,10+Number(p.level||1)*5);}
function findPlayerClan(id){const c=clanByMember(id); return c?c.id:'';}
function makePvp(id,a,d){return {id, status:'active', round:1, attacker:a, defender:d, turn:a, attackerHp:100+memberPower(a)*2, defenderHp:100+memberPower(d)*2, log:[{ts:Date.now(),type:'match_start',text:'Бой начат'}],winner:null,createdAt:Date.now(),updatedAt:Date.now()};}

const server=http.createServer((req,res)=>{
  if(req.method==='OPTIONS')return json(res,204,{});
  const u=new URL(req.url,'http://territory');
  if(u.pathname==='/health')return json(res,200,{ok:true,service:'territory-s82',rooms:rooms.size,online:players.size,accounts:Object.keys(db.players).length,clans:Object.keys(db.clans).length});
  if(u.pathname==='/api/profile'&&req.method==='GET'){const id=clean(u.searchParams.get('id'),40);if(!id||!db.players[id])return json(res,404,{ok:false,error:'profile_not_found'});return json(res,200,{ok:true,profile:db.players[id]})}
  if(u.pathname==='/api/profile'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});if(!id)return json(res,400,{ok:false,error:'telegram_id_required'});const old=db.players[id]||{};db.players[id]={id,name:clean(b.name||old.name||a.user?.first_name||'Игрок'),clan:clean(b.clan||old.clan||'',32),level:Number(b.level||old.level||1),xp:Number(b.xp??old.xp??0),updatedAt:Date.now()};persist();return json(res,200,{ok:true,profile:db.players[id]})});
  if(u.pathname==='/api/clans'&&req.method==='GET'){const q=clean(u.searchParams.get('q'),40).toLowerCase();let list=Object.values(db.clans);if(q)list=list.filter(c=>c.name.toLowerCase().includes(q)||c.tag.toLowerCase().includes(q));list.sort((a,b)=>Object.keys(b.members).length-Object.keys(a.members).length||b.reputation-a.reputation);return json(res,200,{ok:true,clans:list.slice(0,50).map(clanPublic)})}
  if(u.pathname==='/api/clan'&&req.method==='GET'){const id=safeId(u.searchParams.get('id'));const c=db.clans[id];if(!c)return json(res,404,{ok:false,error:'clan_not_found'});return json(res,200,{ok:true,clan:clanPublic(c)})}
  if(u.pathname==='/api/clan/create'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const name=clean(b.name,32),tag=clean(b.tag,8).toUpperCase().replace(/[^A-Z0-9]/g,'');if(!id||!name||tag.length<2)return json(res,400,{ok:false,error:'name_tag_required'});if(clanByMember(id))return json(res,409,{ok:false,error:'already_in_clan'});if(Object.values(db.clans).some(c=>c.tag===tag))return json(res,409,{ok:false,error:'tag_taken'});const cid=crypto.randomUUID();db.clans[cid]=makeClan(cid,name,tag,id);const p=ensurePlayer(id,clean(b.playerName||'Игрок'));p.clan=cid;p.updatedAt=Date.now();persist();return json(res,201,{ok:true,clan:clanPublic(db.clans[cid])})});
  if(u.pathname==='/api/clan/join'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const cid=safeId(b.clanId),c=db.clans[cid];if(!id||!c)return json(res,404,{ok:false,error:'clan_not_found'});if(clanByMember(id))return json(res,409,{ok:false,error:'already_in_clan'});if(Object.keys(c.members).length>=50)return json(res,409,{ok:false,error:'clan_full'});const p=ensurePlayer(id,clean(b.playerName||'Игрок'));c.members[id]={id,name:p.name||clean(b.playerName||'Игрок'),role:'warrior',level:Number(p.level||1),power:10+Number(p.level||1)*5,joinedAt:Date.now()};c.updatedAt=Date.now();p.clan=cid;p.updatedAt=Date.now();c.xp+=10;persist();return json(res,200,{ok:true,clan:clanPublic(c)})});
  if(u.pathname==='/api/clan/leave'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const c=clanByMember(id);if(!c)return json(res,404,{ok:false,error:'not_in_clan'});if(c.ownerId===id)return json(res,409,{ok:false,error:'owner_must_transfer'});delete c.members[id];c.updatedAt=Date.now();if(db.players[id]){db.players[id].clan='';db.players[id].updatedAt=Date.now()}persist();return json(res,200,{ok:true})});
  if(u.pathname==='/api/clan/role'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const c=clanByMember(id),target=String(b.memberId||''),role=clean(b.role,16);if(!c||c.ownerId!==id)return json(res,403,{ok:false,error:'leader_only'});if(!c.members[target]||!['officer','warrior','scout'].includes(role))return json(res,400,{ok:false,error:'invalid_role'});c.members[target].role=role;c.updatedAt=Date.now();persist();return json(res,200,{ok:true,clan:clanPublic(c)})});
  if(u.pathname==='/api/pvp/challenge'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const target=String(b.targetId||'');if(!id||!target||id===target)return json(res,400,{ok:false,error:'invalid_target'});if(!db.players[target])return json(res,404,{ok:false,error:'target_not_found'});if(findPlayerClan(id)&&findPlayerClan(id)===findPlayerClan(target))return json(res,409,{ok:false,error:'same_clan'});const idm=crypto.randomUUID();const m={id:idm,status:'pending',round:0,attacker:{id,name:db.players[id]?.name||clean(b.name||'Игрок'),power:memberPower(id)},defender:{id,name:db.players[target]?.name||'Игрок',power:memberPower(target)},turn:null,attackerHp:0,defenderHp:0,log:[{ts:Date.now(),type:'challenge',text:'Вызов отправлен'}],winner:null,createdAt:Date.now(),updatedAt:Date.now()};pvpMatches.set(idm,m);return json(res,201,{ok:true,match:pvpPublic(m)})});
  if(u.pathname==='/api/pvp/incoming'&&req.method==='GET')return json(res,200,{ok:true,matches:[...pvpMatches.values()].filter(m=>m.status==='pending'&&(m.defender.id===clean(u.searchParams.get('id'),40))).map(pvpPublic)});
  if(u.pathname==='/api/pvp/accept'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const m=pvpMatches.get(String(b.matchId||''));if(!m||m.status!=='pending')return json(res,404,{ok:false,error:'match_not_found'});if(m.defender.id!==id)return json(res,403,{ok:false,error:'not_defender'});Object.assign(m,makePvp(m.id,m.attacker.id,m.defender.id));m.attacker.name=db.players[m.attacker.id]?.name||m.attacker.name;m.defender.name=db.players[m.defender.id]?.name||m.defender.name;m.attacker.power=memberPower(m.attacker.id);m.defender.power=memberPower(m.defender.id);m.log.push({ts:Date.now(),type:'accepted',text:'Вызов принят'});m.updatedAt=Date.now();return json(res,200,{ok:true,match:pvpPublic(m)})});
  if(u.pathname==='/api/pvp/mine'&&req.method==='GET'){const id=clean(u.searchParams.get('id'),40);return json(res,200,{ok:true,matches:[...pvpMatches.values()].filter(m=>m.attacker.id===id||m.defender.id===id).sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,20).map(pvpPublic)})}
  if(u.pathname==='/api/pvp/action'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const m=pvpMatches.get(String(b.matchId||''));if(!m||m.status!=='active')return json(res,404,{ok:false,error:'match_not_active'});if(m.turn!==id)return json(res,409,{ok:false,error:'not_your_turn'});const zone=clean(b.zone||'chest',16);let defenses=Array.isArray(b.defenses)?b.defenses.slice(0,2).map(x=>clean(x,16)):[];if(!defenses.length&&b.defense)defenses=[clean(b.defense,16)];defenses=[...new Set(defenses)];const isA=id===m.attacker.id;const power=isA?m.attacker.power:m.defender.power;const targetHp=isA?'defenderHp':'attackerHp';const legal=['head','chest','stomach','waist','legs'];if(!legal.includes(zone))return json(res,400,{ok:false,error:'invalid_attack_zone'});defenses=defenses.filter(x=>legal.includes(x));const blocked=defenses.includes(zone);let dmg=Math.max(5,Math.round(7+power*0.55+(zone==='head'?5:zone==='chest'?3:zone==='legs'?1:0)-(blocked?7:0)));if(Math.random()<0.12)dmg+=Math.round(dmg*.5);m[targetHp]=Math.max(0,m[targetHp]-dmg);m.log.push({ts:Date.now(),type:'attack',text:`${isA?m.attacker.name:m.defender.name} атакует ${zone}, защита: ${defenses.join(', ')||'нет'}, урон ${dmg}`});if(m[targetHp]<=0){m.status='finished';m.winner=id;m.log.push({ts:Date.now(),type:'finish',text:`Победитель: ${isA?m.attacker.name:m.defender.name}`});const win=db.players[id],lose=db.players[isA?m.defender.id:m.attacker.id];if(win){win.xp=Number(win.xp||0)+25;win.rating=Math.max(100,Number(win.rating||1000)+25);win.wins=Number(win.wins||0)+1;win.updatedAt=Date.now()}if(lose){lose.xp=Number(lose.xp||0)+5;lose.rating=Math.max(100,Number(lose.rating||1000)-15);lose.losses=Number(lose.losses||0)+1;lose.updatedAt=Date.now()}const wc=clanByMember(id),lc=clanByMember(isA?m.defender.id:m.attacker.id);if(wc){wc.reputation=Number(wc.reputation||0)+15;wc.xp=Number(wc.xp||0)+20;wc.updatedAt=Date.now()}if(lc){lc.reputation=Math.max(0,Number(lc.reputation||0)-8);lc.updatedAt=Date.now()}persist()}else{m.turn=isA?m.defender.id:m.attacker.id;m.round++;m.log.push({ts:Date.now(),type:'turn',text:`Ход игрока ${m.turn}`})}m.updatedAt=Date.now();return json(res,200,{ok:true,match:pvpPublic(m)})});
  // S82 REAL MATCHMAKING
  const mmQueue = new Map();
  const mmRating = id => { const p=db.players[id]||{}; return Math.max(100, Number(p.rating||1000) || 1000 + Math.max(0,Number(p.level||1)-1)*40); };
  const mmPublic = q => ({playerId:q.playerId,name:q.name,rating:q.rating,joinedAt:q.joinedAt,status:q.status||'searching',matchId:q.matchId||null,opponent:q.opponent||null});
  function mmCandidates(){
    const now=Date.now(), arr=[...mmQueue.values()].filter(q=>q.status==='searching');
    for(const q of arr){
      const current=mmQueue.get(q.playerId); if(!current||current.status!=='searching')continue;
      const wait=Math.floor((now-q.joinedAt)/1000), range=Math.min(500,100+wait*20);
      let best=null,bestDiff=1e9;
      for(const x of arr){ if(x.playerId===q.playerId||x.status!=='searching')continue; if(findPlayerClan(q.playerId)&&findPlayerClan(q.playerId)===findPlayerClan(x.playerId))continue;
        const diff=Math.abs(q.rating-x.rating); if(diff<=range && diff<bestDiff){best=x;bestDiff=diff;}
      }
      if(best){
        const mid=crypto.randomUUID();
        const m=makePvp(mid,{id:q.playerId,name:q.name,power:memberPower(q.playerId)},{id:best.playerId,name:best.name,power:memberPower(best.playerId)});
        m.mode='matchmaking'; m.matchRating=Math.round((q.rating+best.rating)/2); m.log.push({ts:Date.now(),type:'matchmaking',text:'Соперник найден автоматически'});
        pvpMatches.set(mid,m);
        q.status='matched';q.matchId=mid;q.opponent=mmPublic(best);
        best.status='matched';best.matchId=mid;best.opponent=mmPublic(q);
        q.opponent=mmPublic(best);best.opponent=mmPublic(q);
      }
    }
  }
  if(u.pathname==='/api/matchmaking/join'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});
    if(!id)return json(res,400,{ok:false,error:'player_id_required'});
    const existing=mmQueue.get(id);if(existing&&existing.status==='searching')return json(res,200,{ok:true,queue:mmPublic(existing),alreadySearching:true});
    const active=[...pvpMatches.values()].find(m=>m.status==='active'&&(m.attacker.id===id||m.defender.id===id));if(active)return json(res,409,{ok:false,error:'active_match'});
    const p=ensurePlayer(id,clean(b.name||a.user?.first_name||'Игрок'));p.name=clean(b.name||p.name||'Игрок');
    const q={playerId:id,name:p.name,rating:mmRating(id),joinedAt:Date.now(),status:'searching'};mmQueue.set(id,q);mmCandidates();return json(res,201,{ok:true,queue:mmPublic(q)});
  });
  if(u.pathname==='/api/matchmaking/leave'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const q=mmQueue.get(id);if(!q)return json(res,200,{ok:true,removed:false});mmQueue.delete(id);return json(res,200,{ok:true,removed:true});
  });
  if(u.pathname==='/api/matchmaking/status'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40),q=mmQueue.get(id);mmCandidates();
    if(!q)return json(res,200,{ok:true,queue:null});return json(res,200,{ok:true,queue:mmPublic(q)});
  }
  if(u.pathname==='/api/players'&&req.method==='GET'){
    const q=clean(u.searchParams.get('q')||'',40).toLowerCase(); const clan=clean(u.searchParams.get('clan')||'',80).toLowerCase();
    const online=[...players.values()].map(x=>x.telegramId||x.playerId).filter(Boolean);
    const arr=Object.values(db.players).filter(p=>{const n=(p.name||'').toLowerCase();const c=(p.clan||'').toLowerCase();return (!q||n.includes(q)||String(p.id).includes(q))&&(!clan||c.includes(clan))}).slice(0,50).map(p=>({id:p.id,name:p.name,clan:p.clan||'',level:p.level||1,xp:p.xp||0,online:online.includes(String(p.id))}));
    return json(res,200,{ok:true,players:arr});
  }
  if(u.pathname==='/api/player'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40); const p=db.players[id]; if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    return json(res,200,{ok:true,player:{id:p.id,name:p.name,clan:p.clan||'',level:p.level||1,xp:p.xp||0,online:[...players.values()].some(x=>String(x.telegramId||x.playerId)===id)}});
  }
  if(u.pathname==='/api/friends'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b); if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'}); if(!id||!b.targetId)return json(res,400,{ok:false,error:'ids_required'});
    const p=ensurePlayer(id,a.user?.first_name||'Игрок'); const t=ensurePlayer(clean(b.targetId,40),'Игрок'); p.friends=Array.isArray(p.friends)?p.friends:[]; t.friendRequests=Array.isArray(t.friendRequests)?t.friendRequests:[];
    if(!p.friends.includes(t.id))p.friendRequests.push(id); persist(); return json(res,200,{ok:true,requested:true});
  });
  if(u.pathname==='/api/clan/invite'&&req.method==='POST')return body(req,b=>{
    const {a,id}=playerIdFrom(req,b); if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'}); const c=clanByMember(id); if(!c)return json(res,400,{ok:false,error:'no_clan'}); const target=ensurePlayer(clean(b.targetId,40),'Игрок'); target.clanInvites=Array.isArray(target.clanInvites)?target.clanInvites:[]; if(!target.clanInvites.includes(c.id))target.clanInvites.push(c.id); persist(); return json(res,200,{ok:true,clan:c.name});
  });
    // S84 FRIENDS & SOCIAL
  function socialPlayer(id){const p=db.players[id]||{};return {id:p.id,name:p.name||'Игрок',clan:p.clan||'',level:Number(p.level||1),xp:Number(p.xp||0),online:[...players.values()].some(x=>String(x.telegramId||x.playerId)===String(id))};}
  if(u.pathname==='/api/social'&&req.method==='GET'){
    const id=clean(u.searchParams.get('id'),40);const p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});
    p.friends=Array.isArray(p.friends)?p.friends:[];p.friendRequests=Array.isArray(p.friendRequests)?p.friendRequests:[];p.clanInvites=Array.isArray(p.clanInvites)?p.clanInvites:[];
    const friends=p.friends.map(x=>db.players[x]).filter(Boolean).map(x=>socialPlayer(x.id));
    const requests=p.friendRequests.map(x=>db.players[x]).filter(Boolean).map(x=>socialPlayer(x.id));
    const invites=p.clanInvites.map(x=>db.clans[x]).filter(Boolean).map(c=>({id:c.id,name:c.name,tag:c.tag,ownerId:c.ownerId}));
    return json(res,200,{ok:true,friends,requests,invites});
  }
  if(u.pathname==='/api/friends/accept'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const from=clean(b.fromId,40),p=ensurePlayer(id,'Игрок'),src=db.players[from];if(!src)return json(res,404,{ok:false,error:'request_not_found'});p.friendRequests=Array.isArray(p.friendRequests)?p.friendRequests:[];if(!p.friendRequests.includes(from))return json(res,404,{ok:false,error:'request_not_found'});p.friendRequests=p.friendRequests.filter(x=>x!==from);p.friends=Array.isArray(p.friends)?p.friends:[];src.friends=Array.isArray(src.friends)?src.friends:[];if(!p.friends.includes(from))p.friends.push(from);if(!src.friends.includes(id))src.friends.push(id);persist();return json(res,200,{ok:true})});
  if(u.pathname==='/api/friends/decline'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});p.friendRequests=Array.isArray(p.friendRequests)?p.friendRequests.filter(x=>x!==clean(b.fromId,40)):[];persist();return json(res,200,{ok:true})});
  if(u.pathname==='/api/friends/remove'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const other=clean(b.targetId,40),p=db.players[id],t=db.players[other];if(!p||!t)return json(res,404,{ok:false,error:'player_not_found'});p.friends=Array.isArray(p.friends)?p.friends.filter(x=>x!==other):[];t.friends=Array.isArray(t.friends)?t.friends.filter(x=>x!==id):[];persist();return json(res,200,{ok:true})});
  if(u.pathname==='/api/messages'&&req.method==='GET'){const id=clean(u.searchParams.get('id'),40),withId=clean(u.searchParams.get('with'),40),p=db.players[id];if(!p||!withId)return json(res,400,{ok:false,error:'ids_required'});p.messages=Array.isArray(p.messages)?p.messages:[];return json(res,200,{ok:true,messages:p.messages.filter(m=>m.from===withId||m.to===withId).slice(-100)});}
  if(u.pathname==='/api/messages'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const to=clean(b.toId,40),text=clean(b.text,500),p=db.players[id],t=db.players[to];if(!p||!t||!text)return json(res,400,{ok:false,error:'message_invalid'});p.messages=Array.isArray(p.messages)?p.messages:[];t.messages=Array.isArray(t.messages)?t.messages:[];const m={id:crypto.randomUUID(),from:id,to,name:p.name||'Игрок',text,ts:Date.now()};p.messages.push(m);t.messages.push(m);p.messages=p.messages.slice(-300);t.messages=t.messages.slice(-300);persist();return json(res,201,{ok:true,message:m})});
  if(u.pathname==='/api/clan/invites'&&req.method==='GET'){const id=clean(u.searchParams.get('id'),40),p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});const ids=Array.isArray(p.clanInvites)?p.clanInvites:[];return json(res,200,{ok:true,invites:ids.map(x=>db.clans[x]).filter(Boolean).map(c=>({id:c.id,name:c.name,tag:c.tag}))});}
  if(u.pathname==='/api/clan/invite/accept'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const cid=safeId(b.clanId),c=db.clans[cid],p=db.players[id];if(!c||!p)return json(res,404,{ok:false,error:'not_found'});if(clanByMember(id))return json(res,409,{ok:false,error:'already_in_clan'});if(Object.keys(c.members).length>=50)return json(res,409,{ok:false,error:'clan_full'});c.members[id]={id,name:p.name||'Игрок',role:'warrior',level:Number(p.level||1),power:memberPower(id),joinedAt:Date.now()};p.clan=cid;p.clanInvites=(p.clanInvites||[]).filter(x=>x!==cid);c.xp+=10;c.updatedAt=Date.now();persist();return json(res,200,{ok:true,clan:clanPublic(c)});});
  if(u.pathname==='/api/clan/invite/decline'&&req.method==='POST')return body(req,b=>{const {a,id}=playerIdFrom(req,b);if(!a.ok&&BOT_TOKEN)return json(res,401,{ok:false,error:'telegram_auth_failed'});const p=db.players[id];if(!p)return json(res,404,{ok:false,error:'player_not_found'});p.clanInvites=(p.clanInvites||[]).filter(x=>x!==safeId(b.clanId));persist();return json(res,200,{ok:true})});
  if(u.pathname==='/api/room'&&req.method==='POST')return body(req,b=>{const r=roomCode();rooms.set(r,new Set());return json(res,201,{ok:true,room:r})});
  return json(res,404,{ok:false,error:'not_found'});
});
const wss=new WebSocket.Server({server,path:'/ws'});
wss.on('connection',(ws,req)=>{let current=null,playerId=null;ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch(e){return ws.send(JSON.stringify({type:'ERROR',error:'invalid_json'}))}const type=String(m.type||'');playerId=String(m.playerId||playerId||crypto.randomUUID());if(type==='HELLO'){const a=verifyTelegram(req.headers['x-telegram-init-data']||'');if(!a.ok){ws.send(JSON.stringify({type:'AUTH_ERROR',error:a.reason||'telegram_auth_failed'}));return ws.close()}const name=clean(m.payload?.name||a.user?.first_name||'Игрок');players.set(playerId,{ws,playerId,telegramId:a.telegramId,name});if(a.telegramId){const p=ensurePlayer(a.telegramId,name);p.name=name;p.updatedAt=Date.now();persist()}ws.send(JSON.stringify({type:'WELCOME',playerId,telegramId:a.telegramId,verified:a.verified,profile:a.telegramId?db.players[a.telegramId]:null}));return}if(!players.has(playerId))return ws.send(JSON.stringify({type:'ERROR',error:'hello_required'}));if(type==='ROOM_CREATE'){const r=roomCode();rooms.set(r,new Set([ws]));current=r;players.get(playerId).room=r;return ws.send(JSON.stringify({type:'ROOM_CREATED',room:r,state:snapshot(r)}))}if(type==='ROOM_JOIN'){const r=clean(m.room||m.payload?.room,12).toUpperCase();if(!rooms.has(r))return ws.send(JSON.stringify({type:'ERROR',error:'room_not_found'}));const set=rooms.get(r);if(set.size>=MAX_ROOM)return ws.send(JSON.stringify({type:'ERROR',error:'room_full'}));if(current&&rooms.has(current))rooms.get(current).delete(ws);current=r;set.add(ws);players.get(playerId).room=r;broadcast(r,{type:'PLAYER_JOIN',room:r,playerId,name:players.get(playerId).name},ws);return ws.send(JSON.stringify({type:'ROOM_STATE',room:r,state:snapshot(r)}))}if(type==='ROOM_LEAVE'){if(current&&rooms.has(current)){rooms.get(current).delete(ws);broadcast(current,{type:'PLAYER_LEAVE',playerId},ws)}current=null;return}if(type==='GAME_ACTION'){if(!current||!rooms.has(current))return ws.send(JSON.stringify({type:'ERROR',error:'not_in_room'}));const event={type:'GAME_ACTION',room:current,playerId,payload:m.payload||{},ts:Date.now()};broadcast(current,event);ws.send(JSON.stringify({type:'ACTION_ACCEPTED',event}))}});ws.on('close',()=>{if(current&&rooms.has(current)){rooms.get(current).delete(ws);broadcast(current,{type:'PLAYER_LEAVE',playerId});if(rooms.get(current).size===0)rooms.delete(current)}if(playerId)players.delete(playerId)})});
server.listen(PORT,()=>console.log(`Territory S82 server listening on ${PORT}`));
