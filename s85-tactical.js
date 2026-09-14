(()=>{'use strict';
/*
 Territory S104 Battle Core
 - Video-inspired auto battle: timer, live HP/power/rage, skill cards, floating damage/heal,
   battle log, victory rewards, XP/level progression.
 - Keeps the old tactical PvP entry as a secondary mode.
 - Client simulation is deliberately separated from server profile saving.
*/
const tg=window.Telegram?.WebApp, API=location.origin;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const me=()=>String(tg?.initDataUnsafe?.user?.id||localStorage.getItem('territory_player_id')||localStorage.getItem('playerId')||'');
async function api(path,opt={}){const o={...opt,headers:{'content-type':'application/json',...(opt.headers||{})}};if(tg?.initData)o.headers['x-telegram-init-data']=tg.initData;const r=await fetch(API+path,o),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Ошибка');return j}

const ZONES=[['head','Голова'],['chest','Грудь'],['stomach','Живот'],['belt','Пояс'],['legs','Ноги']];
const SKILLS=[
 {id:'strike',icon:'⚔️',name:'Удар',cost:0,cd:0,base:10,desc:'Быстрая атака'},
 {id:'power',icon:'💥',name:'Сокрушение',cost:25,cd:5,base:22,desc:'Сильный удар'},
 {id:'bleed',icon:'🩸',name:'Разрыв',cost:35,cd:8,base:15,desc:'Урон + кровотечение'},
 {id:'heal',icon:'✚',name:'Восстановление',cost:30,cd:10,base:18,heal:true,desc:'Лечение'},
];
let S={profile:null,battle:null,mode:'auto',timer:null,tick:null,open:false};

function css(){
 if(document.getElementById('s104css'))return;
 const s=document.createElement('style');s.id='s104css';s.textContent=`
#s85open{position:fixed;right:12px;bottom:144px;z-index:9997;background:linear-gradient(180deg,#302416,#17120d);border:1px solid #a47a36;color:#f5d99a;border-radius:12px;padding:10px 12px;font-weight:900;box-shadow:0 8px 30px #0008}
#s85{position:fixed;inset:0;z-index:10000;display:none;background:radial-gradient(circle at 50% 25%,#26313c55,#040608f5 65%);color:#f2f2f2;font-family:inherit}
#s85.on{display:block}#s85box{position:absolute;inset:2.5% 6px 2.5%;overflow:auto;background:linear-gradient(180deg,#141a20f7,#080b0ff7);border:1px solid #6e5730;border-radius:18px;padding:10px;box-shadow:0 20px 70px #000b}
.s104-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.s104-title{font-weight:950;letter-spacing:.4px}.s104-sub{font-size:11px;color:#9da5ad}
.s104-x,.s104-mode{background:#211f1b;border:1px solid #49443b;color:#ddd;border-radius:9px;padding:7px 9px}.s104-mode.active{border-color:#caa15b;color:#ffd783}
.s104-arena{position:relative;min-height:360px;margin:8px 0;border:1px solid #252c33;border-radius:15px;overflow:hidden;background:linear-gradient(180deg,#1b2228,#0d1217 62%,#17130f)}
.s104-arena:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 70%,#9c743822,transparent 55%);pointer-events:none}
.s104-fighter{position:absolute;top:18px;width:44%;text-align:center}.s104-fighter.me{left:3%}.s104-fighter.enemy{right:3%}
.s104-avatar{width:88px;height:88px;margin:auto;border-radius:50%;display:grid;place-items:center;font-size:48px;background:radial-gradient(circle,#303a44,#11161b);border:2px solid #786039;box-shadow:0 7px 25px #0008}
.s104-name{font-weight:900;margin-top:4px}.s104-lvl{font-size:11px;color:#aab1b7}
.s104-bar{height:14px;background:#262b31;border-radius:9px;overflow:hidden;margin-top:6px;border:1px solid #0008}.s104-bar i{display:block;height:100%;transition:width .25s}.s104-hp i{background:linear-gradient(90deg,#2d8d4b,#63bf6d)}.s104-hp.enemy i{background:linear-gradient(90deg,#a72e35,#e0524e)}
.s104-stat{font-size:11px;color:#aeb6be;margin-top:3px}.s104-vs{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%);font-weight:1000;font-size:28px;color:#d3b06d;text-shadow:0 3px 15px #000}
.s104-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden}.s104-dmg{position:absolute;font-size:26px;font-weight:1000;text-shadow:0 2px 5px #000;animation:s104float .9s ease-out forwards}.s104-dmg.heal{font-size:22px;color:#7ee58d}.s104-dmg.crit{font-size:34px;color:#ffd36a}
@keyframes s104float{0%{transform:translate(-50%,10px) scale(.7);opacity:0}15%{opacity:1}100%{transform:translate(-50%,-72px) scale(1.12);opacity:0}}
.s104-center{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);width:88%;text-align:center}.s104-timer{font-size:23px;font-weight:1000;color:#f3d58d}.s104-rage{height:8px;background:#22282e;border-radius:8px;overflow:hidden;margin:4px auto;width:80%}.s104-rage i{display:block;height:100%;background:linear-gradient(90deg,#754e9e,#d179e9);transition:width .2s}
.s104-controls{display:flex;gap:6px;overflow-x:auto;padding:4px 0}.s104-card{min-width:82px;flex:1;background:linear-gradient(180deg,#222a31,#12171c);border:1px solid #414a53;border-radius:12px;padding:9px 6px;color:#eee;position:relative}.s104-card:disabled{opacity:.42}.s104-card b{display:block;font-size:12px}.s104-card small{display:block;color:#aeb5bc;font-size:9px;margin-top:2px}.s104-cost{position:absolute;right:5px;top:4px;font-size:9px;color:#e1b6ff}
.s104-row{display:flex;gap:7px;align-items:center}.s104-row>*{flex:1}.s104-progress{height:9px;background:#22272c;border-radius:8px;overflow:hidden}.s104-progress i{display:block;height:100%;background:#c39b52;transition:width .3s}.s104-panel{background:#10151a;border:1px solid #252c33;border-radius:12px;padding:9px;margin-top:7px}.s104-log{height:74px;overflow:auto;font-size:11px;color:#aeb6bd;line-height:1.45}.s104-log b{color:#e4c27b}
.s104-victory{position:absolute;inset:0;display:grid;place-items:center;background:#05070bd9;backdrop-filter:blur(4px);z-index:4}.s104-reward{width:84%;background:linear-gradient(180deg,#1d1812,#0e1216);border:1px solid #9b7438;border-radius:16px;padding:18px;text-align:center;box-shadow:0 15px 50px #000}.s104-reward h2{margin:4px 0 10px;color:#f2d28d}.s104-reward .big{font-size:28px;font-weight:1000}.s104-btn{width:100%;padding:12px;border-radius:11px;border:1px solid #9d773b;background:#563d1c;color:#ffe0a0;font-weight:950;margin-top:8px}
.s104-tabs{display:flex;gap:6px;margin-bottom:7px}.s104-tabs button{flex:1}
.s104-tactical{display:none}.s104-tactical.on{display:block}
.s104-auto.on{display:block}.s104-auto.off{display:none}
@media(min-width:700px){#s85box{inset:3% 20% 3%}.s104-arena{min-height:430px}}
`;document.head.appendChild(s)
}

async function loadProfile(){
 try{const j=await api('/api/profile');S.profile=j.profile||j||{}}
 catch(e){S.profile={name:'Игрок',level:+localStorage.getItem('territory_level')||1,xp:+localStorage.getItem('territory_xp')||0,strength:10,agility:10}}
}
function playerStats(){
 const p=S.profile||{};const level=+p.level||1;
 return {name:p.name||'Игрок',level,hp:100+level*18,maxHp:100+level*18,power:14+level*4,strength:+p.strength||10,agility:+p.agility||10};
}
function enemyFor(level){
 const lv=Math.max(1,level+Math.floor(Math.random()*3)-1);
 return {name:['Громила','Наёмник','Боец','Ветеран','Охотник'][Math.floor(Math.random()*5)],level:lv,maxHp:92+lv*20,hp:92+lv*20,power:12+lv*4,strength:8+lv*2,agility:7+lv*2};
}
function newBattle(){
 const mep=playerStats(), en=enemyFor(mep.level);
 S.battle={m:mep,e:en,time:30,log:[],rage:0,erage:0,cd:{},ecds:{},last:'',running:true,won:false,started:Date.now()};
 log(`<b>${esc(mep.name)}</b> вступает в бой против <b>${esc(en.name)}</b>.`);
 render();
 clearInterval(S.timer);clearInterval(S.tick);
 S.timer=setInterval(()=>{if(!S.battle?.running)return;S.battle.time--;if(S.battle.time<=0){S.battle.time=0;finish(false)}render()},1000);
 S.tick=setInterval(autoTurn,1100);
}
function log(t){if(!S.battle)return;S.battle.log.push(t);if(S.battle.log.length>20)S.battle.log.shift()}
function spawn(text,heal,crit,enemy){
 const fx=document.getElementById('s104fx');if(!fx)return;const d=document.createElement('div');d.className='s104-dmg '+(heal?'heal ':'')+(crit?'crit':'');d.textContent=(heal?'+':'-')+text;d.style.left=(enemy?(65+Math.random()*13):(25+Math.random()*13))+'%';d.style.top=(enemy?(34+Math.random()*12):(36+Math.random()*12))+'%';fx.appendChild(d);setTimeout(()=>d.remove(),950)
}
function canSkill(id,enemy=false){const b=S.battle;if(!b)return false;const skill=SKILLS.find(x=>x.id===id);const cds=enemy?b.ecds:b.cd;return (!cds[id]||cds[id]<=0)&&(enemy||b.rage>=skill.cost)}
function useSkill(id,enemy=false){
 const b=S.battle;if(!b||!b.running)return;
 const skill=SKILLS.find(x=>x.id===id);if(!skill||!canSkill(id,enemy))return;
 const a=enemy?b.e:b.m,t=enemy?b.m:b.e;
 let amount=Math.max(2,Math.round(skill.base+a.power*(skill.heal?.35:.55)+Math.random()*8));
 const crit=Math.random()<(.08+a.strength*.006);
 if(crit)amount=Math.round(amount*1.7);
 if(skill.heal){a.hp=Math.min(a.maxHp,a.hp+amount);spawn(amount,true,crit,enemy);log(`${enemy?'Враг':'Ты'}: ${skill.icon} ${skill.name} <b>+${amount}</b> HP${crit?' — КРИТ!':''}`)}
 else {if(Math.random()<Math.min(.22,t.agility*.007)){log(`${enemy?'Ты':'Враг'} уклонился от ${skill.name}.`);return}t.hp=Math.max(0,t.hp-amount);spawn(amount,false,crit,enemy);log(`${enemy?'Враг':'Ты'}: ${skill.icon} ${skill.name} <b>${amount}</b> урона${crit?' — КРИТ!':''}`)}
 const cds=enemy?b.ecds:b.cd;cds[id]=skill.cd;if(!enemy)b.rage=Math.min(100,b.rage+(skill.cost?18:8));
 if(t.hp<=0)finish(!enemy);render()
}
function autoTurn(){
 const b=S.battle;if(!b?.running)return;
 Object.keys(b.cd).forEach(k=>b.cd[k]--);Object.keys(b.ecds).forEach(k=>b.ecds[k]--);
 // Player AI prioritizes heal below 35%, otherwise highest affordable damage.
 if(b.m.hp/b.m.maxHp<.35&&canSkill('heal'))useSkill('heal');
 else if(b.rage>=35&&canSkill('bleed'))useSkill('bleed');
 else if(b.rage>=25&&canSkill('power'))useSkill('power');
 else useSkill('strike');
 if(!b.running)return;
 // Enemy has a simple weighted AI.
 if(b.e.hp/b.e.maxHp<.3&&Math.random()<.45&&canSkill('heal',true))useSkill('heal',true);
 else if(Math.random()<.25&&canSkill('power',true))useSkill('power',true);
 else useSkill('strike',true);
}
async function finish(win){
 const b=S.battle;if(!b||!b.running)return;b.running=false;b.won=win;clearInterval(S.timer);clearInterval(S.tick);
 const p=S.profile||{};let level=+p.level||1,xp=+p.xp||0;
 const gain=win?35+b.e.level*8:8;xp+=gain;let need=100+level*50;let ups=0;
 while(xp>=need){xp-=need;level++;ups++;need=100+level*50}
 localStorage.setItem('territory_level',level);localStorage.setItem('territory_xp',xp);
 try{await api('/api/profile',{method:'POST',body:JSON.stringify({playerId:me(),name:p.name||'Игрок',level,xp})})}catch(e){}
 b.reward={xp:gain,loot:win?(50+b.e.level*15):0,level,ups};log(win?'<b>ПОБЕДА!</b>':'<b>ВРЕМЯ ВЫШЛО</b>');render()
}
function skillButtons(){
 return SKILLS.map(x=>`<button class="s104-card" data-skill="${x.id}" ${!canSkill(x.id)?'disabled':''}><span style="font-size:20px">${x.icon}</span><b>${esc(x.name)}</b><small>${esc(x.desc)}</small><span class="s104-cost">${x.cost?'◆ '+x.cost:'AUTO'}</span></button>`).join('')
}
function render(){
 const root=document.getElementById('s85body');if(!root)return;
 if(!S.battle){root.innerHTML=`<div class="s104-panel"><b>Арена</b><p class="s104-sub">Автобой запускается сразу. Во время боя работают HP, энергия, критические удары, уклонение, навыки, таймер и прокачка.</p><button class="s104-btn" id="s104start">⚔ НАЧАТЬ АВТОБОЙ</button></div>`;document.getElementById('s104start').onclick=()=>{newBattle()};return}
 const b=S.battle,m=b.m,e=b.e, need=100+(+b.reward?.level||+m.level)*50, xp=+S.profile?.xp||+localStorage.getItem('territory_xp')||0;
 root.innerHTML=`<div class="s104-tabs"><button id="s104auto" class="s104-mode active">⚔ АВТОБОЙ</button><button id="s104reset" class="s104-mode">↻ НОВЫЙ БОЙ</button></div>
 <div class="s104-auto on"><div class="s104-arena">
 <div class="s104-fighter me"><div class="s104-avatar">🛡️</div><div class="s104-name">${esc(m.name)}</div><div class="s104-lvl">УР. ${m.level} · СИЛА ${m.strength}</div><div class="s104-bar s104-hp"><i style="width:${100*m.hp/m.maxHp}%"></i></div><div class="s104-stat">${Math.max(0,Math.round(m.hp))} / ${m.maxHp} HP · ⚡ ${m.power}</div></div>
 <div class="s104-fighter enemy"><div class="s104-avatar">⚔️</div><div class="s104-name">${esc(e.name)}</div><div class="s104-lvl">УР. ${e.level} · СИЛА ${e.strength}</div><div class="s104-bar s104-hp enemy"><i style="width:${100*e.hp/e.maxHp}%"></i></div><div class="s104-stat">${Math.max(0,Math.round(e.hp))} / ${e.maxHp} HP · ⚡ ${e.power}</div></div>
 <div class="s104-vs">VS</div><div id="s104fx" class="s104-fx"></div>
 <div class="s104-center"><div class="s104-timer">00:${String(Math.max(0,b.time)).padStart(2,'0')}</div><div class="s104-rage"><i style="width:${b.rage}%"></i></div><div class="s104-sub">ЭНЕРГИЯ ${Math.round(b.rage)} / 100</div></div>
 ${b.reward?`<div class="s104-victory"><div class="s104-reward"><div style="font-size:40px">${b.won?'🏆':'⏱️'}</div><h2>${b.won?'ПОБЕДА':'БОЙ ОКОНЧЕН'}</h2><div class="big">+${b.reward.xp} XP</div><div class="s104-sub">${b.won?'Награда: '+b.reward.loot+' монет (боевой лут)':''}${b.reward.ups?`<br><b>⬆ НОВЫЙ УРОВЕНЬ: ${b.reward.level}</b>`:''}</div><button class="s104-btn" id="s104again">СЛЕДУЮЩИЙ БОЙ</button></div></div>`:''}
 </div>
 <div class="s104-controls">${skillButtons()}</div>
 <div class="s104-panel"><div class="s104-row"><b>УРОВЕНЬ ${m.level}</b><span class="s104-sub">XP ${xp} / ${need}</span></div><div class="s104-progress"><i style="width:${Math.min(100,100*xp/need)}%"></i></div></div>
 <div class="s104-panel"><div class="s104-sub">ЖУРНАЛ БОЯ</div><div class="s104-log">${b.log.slice().reverse().join('<br>')}</div></div></div>`;
 document.getElementById('s104reset').onclick=()=>{S.battle=null;newBattle()};
 root.querySelectorAll('[data-skill]').forEach(x=>x.onclick=()=>useSkill(x.dataset.skill));
 const ag=document.getElementById('s104again');if(ag)ag.onclick=()=>{S.battle=null;newBattle()};
}
function shell(){
 if(document.getElementById('s85'))return;css();
 const b=document.createElement('button');b.id='s85open';b.textContent='⚔ АРЕНА';b.onclick=()=>open();document.body.appendChild(b);
 const w=document.createElement('div');w.id='s85';w.innerHTML='<div id="s85box"><div class="s104-head"><div><div class="s104-title">TERRITORY — АРЕНА</div><div class="s104-sub">S104 · автобой и прокачка</div></div><button class="s104-x" id="s85x">✕</button></div><div id="s85body">Загрузка...</div></div>';document.body.appendChild(w);
 document.getElementById('s85x').onclick=()=>{w.classList.remove('on');clearInterval(S.timer);clearInterval(S.tick)};
}
async function open(){S.open=true;document.getElementById('s85').classList.add('on');await loadProfile();S.battle=null;render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',shell);else shell();
window.TerritoryS104={open,newBattle};
})();