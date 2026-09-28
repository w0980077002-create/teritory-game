/* Territory Living Home — consolidated core PASS 32
 * One canonical home-life runtime. Legacy dead duplicate reaction handler removed.
 * VIP remains cosmetic/convenience oriented; paid entitlement must be server-authoritative.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const FOLLOWERS=()=>window.Followers;
const CONFIG={
 liabro:{name:'Лиабро',icon:'⚔️',role:'Крит',accent:'crit'},
 teralel:{name:'Тералель',icon:'🛡️',role:'Защита',accent:'guard'},
 king_cows:{name:'Король Коров',icon:'❤️',role:'Лечение',accent:'heal'},
 mort:{name:'Морт',icon:'🌀',role:'Уворот',accent:'dodge'},
 stone_face:{name:'Каменное Лицо',icon:'💀',role:'Контроль',accent:'control'}
};
function activeFollower(){
 const id=FOLLOWERS?.getActiveId?.()||S().followers?.activeFollower||'liabro';
 const c=CONFIG[id]||CONFIG.liabro;
 return {id,name:c.name,icon:c.icon,role:c.role,accent:c.accent};
}
function safe(v){return String(v??'').replace(/[<>&"]/g,'');}
function ensure(){
 const home=document.getElementById('home'); if(!home)return null;
 let layer=home.querySelector('.home-life'); if(layer)return layer;
 layer=document.createElement('div'); layer.className='home-life';
 layer.innerHTML=`
  <div class="life-vignette"></div><div class="life-moon"></div>
  <div class="life-snow" aria-hidden="true">${'<i></i>'.repeat(16)}</div>
  <div class="life-fire fire-left"><i></i><b></b><em></em></div>
  <div class="life-fire fire-right"><i></i><b></b><em></em></div>
  <div class="life-ambient"><i></i><i></i><i></i></div>
  <div class="life-ground-runes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="life-world-pulse" data-world-pulse></div>
  <div class="life-hero" data-life-hero aria-label="Герой">
    <div class="life-shadow"></div><div class="hero-aura"></div><div class="hero-glow"></div>
    <div class="hero-cape"></div><div class="hero-body"><i class="hero-belt"></i><i class="hero-chest"></i><i class="hero-arm left"></i><i class="hero-arm right"></i></div>
    <div class="hero-head"><i class="hero-hood"></i><i class="hero-face"></i><i class="hero-eye"></i></div>
    <div class="hero-weapon"><i></i><b></b></div><div class="hero-boots"><i></i><i></i></div>
    <div class="hero-spark"><i></i><i></i><i></i></div>
    <div class="hero-status" data-hero-status></div>
  </div>
  <button class="life-follower" data-life-follower aria-label="Последователь слева от героя">
    <div class="life-shadow"></div><div class="follower-aura"></div><div class="follower-glow"></div>
    <div class="follower-body"><i class="follower-cape"></i><i class="follower-head"></i><i class="follower-arm left"></i><i class="follower-arm right"></i><i class="follower-blade"></i><span data-life-follower-icon>⚔️</span></div>
    <div class="follower-spark"><i></i><i></i></div><div class="follower-status" data-follower-status></div>
  </button>
  <div class="life-nameplate" data-life-nameplate></div><div class="follower-nameplate" data-follower-nameplate></div>
  <div class="life-weather"><span></span><span></span><span></span></div>
  <div class="life-tap" data-life-tap></div>
  <div class="life-toast" data-life-toast></div>`;
 home.appendChild(layer); return layer;
}
let lastSnap=null;
function paint(){
 const layer=ensure(); if(!layer)return;
 const s=S(), p=s.profile||{}, f=activeFollower();
 const snap={level:Number(s.level)||Number(p.level)||1,hp:Number(s.hp??100),coins:Number(s.coins??s.gold??0),gems:Number(s.gems??0),redgems:Number(s.redgems??s.redGems??0),xp:Number(s.xp??0),follower:f.id};
 if(lastSnap){
   if(snap.level>lastSnap.level) react('level-up');
   else if(snap.hp<lastSnap.hp-1) react('damage');
   else if(snap.hp>lastSnap.hp+1) react('heal');
   if(snap.coins>lastSnap.coins || snap.gems>lastSnap.gems || snap.redgems>lastSnap.redgems) react('reward',{text:'🎁 Награда получена'});
   if(snap.follower!==lastSnap.follower){ layer.classList.add('follower-switch'); burst('follower','blue'); setTimeout(()=>layer.classList.remove('follower-switch'),900); }
 }
 lastSnap=snap;
 const hp=Math.max(0,Number(s.hp??100)), maxHp=Math.max(1,Number(s.maxHp??100));
 const hero=layer.querySelector('[data-life-hero]'), fol=layer.querySelector('[data-life-follower]');
 const plate=layer.querySelector('[data-life-nameplate]'), fplate=layer.querySelector('[data-follower-nameplate]');
 const icon=layer.querySelector('[data-life-follower-icon]'); if(!hero||!fol)return;
 hero.classList.toggle('hero-lowhp',hp/maxHp<.35); hero.classList.toggle('hero-hurt',hp/maxHp<.7);
 icon.textContent=f.icon; fol.dataset.follower=f.id; fol.dataset.accent=f.accent;
 plate.innerHTML='<b>'+safe(p.displayName||'Игрок')+'</b><small>Lv.'+(Number(s.level)||1)+' · Герой</small>';
 fplate.innerHTML='<b>'+safe(f.name)+'</b><small>'+safe(f.role)+'</small>';
 fol.setAttribute('aria-label',f.name+' — последователь слева от героя'); layer.dataset.follower=f.id;
}
function pulse(x){
 const layer=ensure(),tap=layer?.querySelector('[data-life-tap]'); if(!tap)return;
 tap.style.left=x.clientX+'px';tap.style.top=x.clientY+'px';tap.classList.remove('show');void tap.offsetWidth;tap.classList.add('show');
}
function toast(text,kind){
 const layer=ensure(),t=layer?.querySelector('[data-life-toast]');if(!t)return;
 t.textContent=text;t.dataset.kind=kind||'info';t.classList.remove('show');void t.offsetWidth;t.classList.add('show');
}
function burst(target,kind){
 const layer=ensure();if(!layer)return;
 const el=document.createElement('i');el.className='life-burst '+(kind||'gold');el.dataset.target=target;el.textContent=kind==='heal'?'♥':kind==='damage'?'✦':'✦';layer.appendChild(el);
 requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>el.remove(),900);
}
function react(kind){
 const layer=document.querySelector('.home-life'); if(!layer)return;
 layer.classList.remove('life-react-hit','life-react-heal','life-react-reward','life-react-level','life-react-follow');
 void layer.offsetWidth;
 layer.classList.add('life-react-'+kind);
 setTimeout(()=>layer.classList.remove('life-react-hit','life-react-heal','life-react-reward','life-react-level','life-react-follow'),900);
}
function watchState(){
 let last={hp:null,level:null,coins:null,gems:null,red:null,follower:null};
 return function(){
  const s=S(), hp=Number(s.hp??100), level=Number(s.level??s.profile?.level??1);
  const coins=Number(s.coins??s.gold??s.resources?.coins??0), gems=Number(s.gems??s.resources?.gems??0), red=Number(s.redGems??s.redgems??s.resources?.redGems??0);
  const fol=activeFollower().id;
  if(last.hp!==null && hp<last.hp)react('hit'); else if(last.hp!==null && hp>last.hp)react('heal');
  if(last.level!==null && level>last.level)react('level');
  if((last.coins!==null&&coins>last.coins)||(last.gems!==null&&gems>last.gems)||(last.red!==null&&red>last.red))react('reward');
  if(last.follower!==null && fol!==last.follower)react('follow');
  last={hp,level,coins,gems,red,follower:fol};
 };
}

function battleFX(type,data){
 const layer=document.querySelector('.home-life'); if(!layer)return;
 const safe=['attack','crit','enemy-hit','enemy-defeat','skill','block','heal','reward'];
 if(!safe.includes(type))type='attack';
 layer.classList.remove('battle-'+type);
 void layer.offsetWidth;
 layer.classList.add('battle-'+type);
 const fx=document.createElement('div'); fx.className='life-battle-fx fx-'+type;
 fx.textContent= type==='crit'?'CRIT!':type==='enemy-defeat'?'✦':type==='skill'?'✦':type==='block'?'🛡️':type==='heal'?'+'+(data?.amount||''):type==='enemy-hit'?'✦':'⚔';
 layer.appendChild(fx);
 setTimeout(()=>fx.remove(),900);
 setTimeout(()=>layer.classList.remove('battle-'+type),950);
}
window.TerritoryHomeBattleFX={play:battleFX,attack:()=>battleFX('attack'),crit:()=>battleFX('crit'),enemyHit:()=>battleFX('enemy-hit'),enemyDefeat:()=>battleFX('enemy-defeat'),skill:()=>battleFX('skill'),block:()=>battleFX('block'),heal:(amount)=>battleFX('heal',{amount})};
function bindBattleBridge(){
 const names={
  'territory:attack':'attack','territory:crit':'crit','territory:enemy-hit':'enemy-hit',
  'territory:enemy-defeat':'enemy-defeat','territory:skill':'skill',
  'territory:block':'block','territory:heal':'heal'
 };
 Object.keys(names).forEach(ev=>document.addEventListener(ev,e=>battleFX(names[ev],e.detail||{})));
}


function bindPvEAutoBridge(){
 const map={
  'pve:attack':'attack','pve:crit':'crit','pve:damage':'enemy-hit',
  'pve:enemy-hit':'enemy-hit','pve:enemy-defeat':'enemy-defeat',
  'pve:skill':'skill','pve:block':'block','pve:heal':'heal',
  'battle:attack':'attack','battle:crit':'crit','battle:damage':'enemy-hit',
  'battle:enemy-defeat':'enemy-defeat','battle:skill':'skill','battle:block':'block','battle:heal':'heal'
 };
 Object.entries(map).forEach(([ev,type])=>{
   document.addEventListener(ev,e=>battleFX(type,e.detail||{}));
   window.addEventListener(ev,e=>battleFX(type,e.detail||{}));
 });
}
window.TerritoryHomeBattleFX.sequence=function(seq){
 if(!Array.isArray(seq))return;
 let t=0;
 seq.forEach(step=>{
   t+=Math.max(0,Number(step.delay)||0);
   setTimeout(()=>battleFX(step.type||'attack',step),t);
 });
};


/* PASS 10 — first encounter presentation layer */
function firstEncounter(){
 const layer=document.querySelector('.home-life'); if(!layer)return;
 if(layer.querySelector('.life-encounter'))return;
 const e=document.createElement('div'); e.className='life-encounter';
 e.innerHTML='<div class="encounter-enemy"><span class="enemy-emoji">👹</span><b>Дикий громила</b><small>Lv.1</small></div><div class="encounter-vs">⚔</div><div class="encounter-hint">ПЕРВЫЙ БОЙ</div>';
 layer.appendChild(e);
 setTimeout(()=>e.classList.add('show'),40);
}
window.TerritoryHomeBattleFX.firstEncounter=firstEncounter;


/* PASS 11 — playable first encounter controller */
function ensureEncounterController(){
 const layer=document.querySelector('.home-life'); if(!layer)return;
 if(layer.querySelector('.life-battle-panel'))return;
 const panel=document.createElement('div'); panel.className='life-battle-panel';
 panel.innerHTML='<div class="battle-status"><span class="battle-turn">ГОТОВ</span><span class="battle-wave">ВОЛНА 1</span></div><div class="battle-log" data-battle-log>Враг приближается...</div><button type="button" class="battle-action" data-life-attack>⚔ АТАКА</button>';
 layer.appendChild(panel);
 panel.querySelector('[data-life-attack]').addEventListener('click',()=>{
   const enemy=layer.querySelector('.life-encounter');
   if(!enemy)return;
   battleFX('attack');
   setTimeout(()=>battleFX('enemy-hit'),280);
   setTimeout(()=>battleFX('attack'),620);
   setTimeout(()=>battleFX('enemy-defeat'),940);
   setTimeout(()=>{
     const log=panel.querySelector('[data-battle-log]');
     if(log)log.textContent='Победа! Получена награда.';
     battleFX('reward');
     setTimeout(()=>{
       if(enemy)enemy.remove();
       const next=document.createElement('div');next.className='life-next-enemy';
       next.innerHTML='<span>👹</span><b>Следующий враг</b><small>Готов к бою</small>';
       layer.appendChild(next);
       setTimeout(()=>next.classList.add('show'),40);
     },500);
   },1050);
 });
}
window.TerritoryHomeBattleFX.startEncounter=function(){
 firstEncounter();
 ensureEncounterController();
};


/* PASS 12 — real Store-driven first encounter */
function getBattleState(){
 const s=S();
 const level=Number(s.level??s.profile?.level??1);
 const maxHp=Math.max(1,Number(s.maxHp??100));
 const hp=Math.max(0,Number(s.hp??maxHp));
 const energy=Math.max(0,Number(s.energy??s.stamina??100));
 const coins=Number(s.coins??s.gold??s.resources?.coins??0);
 const gems=Number(s.gems??s.resources?.gems??0);
 return {s,level,maxHp,hp,energy,coins,gems};
}
function saveState(s){
 try{window.TerritoryStore?.saveNow?.()}catch(_){}
 window.dispatchEvent(new CustomEvent('territory:state-changed'));
}
function encounterNumbers(){
 const b=getBattleState();
 return {heroDamage:Math.max(6,Math.round(8+b.level*2)), enemyMax:Math.max(24,Math.round(34+b.level*8)), energyCost:5, reward:Math.max(8,Math.round(10+b.level*4))};
}
function mountRealEncounter(){
 const layer=document.querySelector('.home-life'); if(!layer)return;
 if(layer.querySelector('.life-real-battle'))return;
 const n=encounterNumbers(), role=followerCombatRole();
 const chance={crit:22,block:28,heal:30,dodge:25,control:24}[role.kind]||22;
 const box=document.createElement('div');box.className='life-real-battle';
 box.innerHTML='<div class="follower-combat-badge"><span>'+role.icon+'</span><b>Поддержка: '+role.label+'</b><small>шанс '+chance+'% · ГОТОВ</small></div><div class="real-enemy"><div class="enemy-health"><i data-enemy-hp></i></div><div class="enemy-icon">👹</div><b>Дикий громила</b><small>Lv.'+getBattleState().level+'</small></div><div class="real-battle-log" data-real-log>Громила преградила путь.</div><button type="button" class="real-attack" data-real-attack>⚔ АТАКА</button>';
 layer.appendChild(box);
 let enemyHp=n.enemyMax,busy=false,turn=0;
 const hpEl=box.querySelector('[data-enemy-hp]'),log=box.querySelector('[data-real-log]'),btn=box.querySelector('[data-real-attack]'),badge=box.querySelector('.follower-combat-badge');
 function renderHp(){hpEl.style.width=Math.max(0,enemyHp/n.enemyMax*100)+'%';}
 function badgeState(text){const small=badge?.querySelector('small');if(small)small.textContent=text;}
 renderHp();
 btn.addEventListener('click',()=>{
   if(busy||enemyHp<=0)return;
   const b=getBattleState();
   if(b.energy<n.energyCost){log.textContent='⚡ Не хватает энергии.';return;}
   busy=true;btn.disabled=true;turn++;
   b.s.energy=Math.max(0,b.energy-n.energyCost);saveState(b.s);
   const assist=followerAssist(enemyHp,n.heroDamage), baseDamage=n.heroDamage, dmg=assist.damage||baseDamage;
   badgeState('срабатывает…');
   battleFX('attack');log.textContent='Герой атакует вместе с '+role.label.toLowerCase()+'!';
   setTimeout(()=>{
     enemyHp=Math.max(0,enemyHp-dmg);renderHp();
     if(assist.fx==='crit')battleFX('crit'); else battleFX('enemy-hit');
     if(assist.fx==='crit')log.textContent='⚔️ '+role.label+': крит! −'+dmg;
     else log.textContent='Удар! −'+dmg;
   },300);
   setTimeout(()=>{
     if(enemyHp<=0){
       battleFX('enemy-defeat');log.textContent='Победа! Награда получена.';
       const before=Number(b.s.coins??b.s.gold??b.s.resources?.coins??0);
       if(typeof b.s.coins==='number')b.s.coins=before+n.reward; else if(typeof b.s.gold==='number')b.s.gold=before+n.reward; else b.s.coins=before+n.reward;
       saveState(b.s);react('reward');badgeState('ПОБЕДА');
       setTimeout(()=>{box.classList.add('real-complete');btn.textContent='✓ ПОБЕДА';},350);
       return;
     }
     setTimeout(()=>{
       let retaliation=Math.max(1,Math.round(3+b.level));
       if(assist.fx==='block')retaliation=Math.max(0,Math.round(retaliation*.35));
       if(assist.fx==='dodge'||assist.fx==='control')retaliation=0;
       if(assist.fx==='heal'){
         const beforeHp=Math.max(0,Number(b.s.hp??b.maxHp));
         const healed=Math.min(b.maxHp-beforeHp,assist.heal||0);
         b.s.hp=beforeHp+healed;
         if(healed>0){battleFX('heal', {amount:healed});log.textContent='❤️ '+role.label+': +'+healed+' HP';}
       }
       if(assist.fx==='block')battleFX('block');
       else if(assist.fx==='dodge')battleFX('block');
       else if(assist.fx==='control')battleFX('skill');
       else if(retaliation>0)battleFX('enemy-hit');
       const beforeHp2=Math.max(0,Number(b.s.hp??b.maxHp));
       if(assist.fx!=='heal') b.s.hp=Math.max(0,beforeHp2-retaliation);
       else if(retaliation>0) b.s.hp=Math.max(0,Number(b.s.hp)-retaliation);
       saveState(b.s);
       if(assist.fx==='block')log.textContent='🛡️ '+role.label+': ответный удар снижен! −'+retaliation+' HP';
       else if(assist.fx==='dodge')log.textContent='🌀 '+role.label+': враг промахнулся!';
       else if(assist.fx==='control')log.textContent='💀 '+role.label+': враг оглушён!';
       else if(assist.fx==='heal'){} else log.textContent='Ответный удар! −'+retaliation+' HP';
       if(retaliation>0)react('hit');
       badgeState('готов · ход '+turn);
       busy=false;btn.disabled=false;
     },320);
   },650);
 });
}
window.TerritoryHomeBattleFX.mountRealEncounter=mountRealEncounter;


/* PASS 13 — follower combat roles */
function followerCombatRole(){
 const f=activeFollower();
 const roles={liabro:{label:'Крит',icon:'⚔️',kind:'crit'},teralel:{label:'Защита',icon:'🛡️',kind:'block'},king_cows:{label:'Лечение',icon:'❤️',kind:'heal'},mort:{label:'Уворот',icon:'🌀',kind:'dodge'},stone_face:{label:'Контроль',icon:'💀',kind:'control'}};
 return roles[f.id]||roles.liabro;
}
function followerAssist(enemyHp,damage){
 const role=followerCombatRole(), b=getBattleState();
 const result={enemyHp,damage,role};
 if(role.kind==='crit' && Math.random()<.22){result.damage=Math.round(damage*1.75);result.fx='crit';}
 else if(role.kind==='block' && Math.random()<.28){result.fx='block';result.retaliationMult=.35;}
 else if(role.kind==='heal' && Math.random()<.30){result.fx='heal';result.heal=Math.max(4,Math.round(b.maxHp*.06));}
 else if(role.kind==='dodge' && Math.random()<.25){result.fx='dodge';result.retaliationMult=0;}
 else if(role.kind==='control' && Math.random()<.24){result.fx='control';result.skipRetaliation=true;}
 else result.fx='attack';
 return result;
}
window.TerritoryHomeBattleFX.followerAssist=followerAssist;

function init(){
 bind();bindBattleBridge();bindPvEAutoBridge();paint();
 const watch=watchState();watch();
 window.addEventListener('territory:state-changed',()=>{paint();watch()});
 document.addEventListener('territory:reward',()=>react('reward'));
 document.addEventListener('territory:level-up',()=>react('level'));
 document.addEventListener('territory:damage',()=>react('hit'));
 document.addEventListener('territory:heal',()=>react('heal'));
 document.addEventListener('territory:follower-changed',()=>react('follow'));
 setInterval(()=>{paint();watch()},1000);
}
function legacyInit(){bind();paint();setInterval(paint,1500);}
window.HomeLife={refresh:paint,react};
document.addEventListener('DOMContentLoaded',init);
})();


/* TERRITORY PASS 15 - FOLLOWER PROGRESSION */
(function(){
  'use strict';

  const KEY = 'territory_follower_progress_v1';

  function store(){
    try { return window.TerritoryStore; } catch(e){ return null; }
  }
  function activeId(){
    try {
      return window.Followers && window.Followers.getActiveId
        ? window.Followers.getActiveId()
        : 'liabro';
    } catch(e){ return 'liabro'; }
  }
  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function write(v){
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){}
  }
  function stateFor(id){
    const all = read();
    if(!all[id]) all[id] = { xp:0, level:1, assists:0, meter:0 };
    return all[id];
  }
  function xpNeed(level){
    return Math.round(40 + (level-1) * 22);
  }
  function emit(name, detail){
    try { window.dispatchEvent(new CustomEvent(name, {detail})); } catch(e){}
  }

  window.TerritoryFollowerProgress = {
    get(id){
      return Object.assign({}, stateFor(id || activeId()));
    },
    addXp(amount, reason){
      amount = Math.max(0, Number(amount)||0);
      const id = activeId();
      const all = read();
      const s = stateFor(id);
      s.xp += amount;
      s.assists += 1;
      s.meter = Math.min(100, s.meter + 8);
      let levelUps = 0;
      while(s.xp >= xpNeed(s.level)){
        s.xp -= xpNeed(s.level);
        s.level += 1;
        levelUps++;
      }
      all[id] = s;
      write(all);
      emit('territory:follower-progress', {
        id, xp:amount, level:s.level, totalXp:s.xp,
        assists:s.assists, meter:s.meter, levelUps, reason:reason||'assist'
      });
      return Object.assign({}, s, {levelUps});
    },
    spendMeter(amount){
      const id = activeId();
      const all = read();
      const s = stateFor(id);
      const n = Math.max(0, Number(amount)||0);
      if(s.meter < n) return false;
      s.meter -= n;
      all[id] = s;
      write(all);
      emit('territory:follower-meter', {id, meter:s.meter});
      return true;
    },
    need(id){ return xpNeed(stateFor(id || activeId()).level); }
  };

  // Expose a tiny, non-invasive HUD refresh hook.
  function refresh(){
    const host = document.querySelector('.life-battle-panel');
    if(!host) return;
    const id = activeId();
    const s = stateFor(id);
    let hud = host.querySelector('.follower-progress-hud');
    if(!hud){
      hud = document.createElement('div');
      hud.className = 'follower-progress-hud';
      const status = host.querySelector('.life-battle-status');
      if(status && status.parentNode) status.parentNode.insertBefore(hud, status);
      else host.insertBefore(hud, host.firstChild);
    }
    const need = xpNeed(s.level);
    hud.innerHTML =
      '<span class="fph-name">🤝 Поддержка</span>' +
      '<span class="fph-lvl">Lv.'+s.level+'</span>' +
      '<span class="fph-xp">'+s.xp+'/'+need+' XP</span>' +
      '<span class="fph-meter">⚡ '+s.meter+'%</span>';
  }

  window.addEventListener('territory:follower-progress', refresh);
  window.addEventListener('territory:follower-meter', refresh);
  window.addEventListener('territory:battle:attack', function(){
    // Progress is awarded once per completed attack cycle by the real encounter.
    refresh();
  });
  document.addEventListener('click', function(e){
    if(e.target && e.target.closest && e.target.closest('.life-battle-panel')) {
      setTimeout(refresh, 20);
    }
  });

  // Hook into the existing real encounter completion without replacing it.
  const oldFX = window.TerritoryHomeBattleFX;
  if(oldFX && typeof oldFX.onFollowerAssist === 'function'){
    const old = oldFX.onFollowerAssist;
    oldFX.onFollowerAssist = function(){
      const r = old.apply(this, arguments);
      window.TerritoryFollowerProgress.addXp(8, 'assist');
      return r;
    };
  }

  // Generic bridge: battle code can call this explicitly when an assist occurs.
  window.TerritoryHomeBattleFX = window.TerritoryHomeBattleFX || {};
  if(typeof window.TerritoryHomeBattleFX.followerProgress !== 'function'){
    window.TerritoryHomeBattleFX.followerProgress = function(amount, reason){
      return window.TerritoryFollowerProgress.addXp(amount || 8, reason || 'assist');
    };
  }
})();


/* TERRITORY PASS 16 - FOLLOWER ABILITIES */
(function(){
  'use strict';

  const KEY = 'territory_follower_abilities_v1';
  const ROLES = {
    liabro:      {name:'Кровавый удар', icon:'⚔️', desc:'Усиливает критический удар', base:1.10, step:.08},
    teralel:     {name:'Каменная стойка', icon:'🛡️', desc:'Сильнее снижает ответный урон', base:.65, step:.06},
    king_cows:   {name:'Большое лечение', icon:'❤️', desc:'Усиливает лечение героя', base:1.00, step:.10},
    mort:        {name:'Тень уклонения', icon:'🌀', desc:'Повышает шанс полного уклонения', base:1.00, step:.07},
    stone_face:  {name:'Окаменение', icon:'💀', desc:'Повышает шанс контроля', base:1.00, step:.07}
  };

  function activeId(){
    try{return window.Followers.getActiveId();}catch(e){return 'liabro';}
  }
  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}
  }
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function getLevel(id){
    try{return window.TerritoryFollowerProgress.get(id).level||1;}catch(e){return 1;}
  }
  function ensure(id){
    const all=read();
    if(!all[id]) all[id]={rank:1,uses:0};
    return all;
  }
  function ability(id){
    id=id||activeId();
    const a=ROLES[id]||ROLES.liabro;
    const rank=(ensure(id)[id]||{rank:1}).rank||1;
    return {
      id, name:a.name, icon:a.icon, desc:a.desc,
      rank, followerLevel:getLevel(id),
      power:+(a.base+(rank-1)*a.step).toFixed(2)
    };
  }

  window.TerritoryFollowerAbility = {
    roles:ROLES,
    get:ability,
    use:function(){
      const id=activeId(), all=ensure(id), s=all[id];
      s.uses=(s.uses||0)+1;
      const fl= getLevel(id);
      if(fl>=3 && s.rank<2) s.rank=2;
      if(fl>=6 && s.rank<3) s.rank=3;
      if(fl>=10 && s.rank<4) s.rank=4;
      all[id]=s; write(all);
      const a=ability(id);
      try{window.dispatchEvent(new CustomEvent('territory:follower-ability',{detail:a}));}catch(e){}
      return a;
    }
  };

  // Make the next real assist consume exactly one ability use.
  window.addEventListener('territory:follower-progress', function(){
    try{ window.TerritoryFollowerAbility.use(); }catch(e){}
  });

  function hud(){
    const panel=document.querySelector('.life-battle-panel');
    if(!panel) return;
    const a=ability();
    let el=panel.querySelector('.follower-ability-hud');
    if(!el){
      el=document.createElement('div');
      el.className='follower-ability-hud';
      const progress=panel.querySelector('.follower-progress-hud');
      if(progress && progress.parentNode) progress.parentNode.insertBefore(el,progress.nextSibling);
      else panel.insertBefore(el,panel.firstChild);
    }
    const power = a.id==='liabro'
      ? 'x'+a.power.toFixed(2)
      : (a.id==='teralel' ? Math.round(a.power*100)+'%' : '+'+Math.round((a.power-1)*100)+'%');
    el.innerHTML='<span class="fah-icon">'+a.icon+'</span>'+
      '<span class="fah-name">'+a.name+'</span>'+
      '<span class="fah-rank">R'+a.rank+'</span>'+
      '<span class="fah-power">'+power+'</span>';
    el.title=a.desc+' • открывается на уровнях последователя 3 / 6 / 10';
  }

  window.addEventListener('territory:follower-ability',hud);
  window.addEventListener('territory:follower-progress',hud);
  document.addEventListener('click',function(e){
    if(e.target && e.target.closest && e.target.closest('.life-battle-panel')) setTimeout(hud,20);
  });
  setTimeout(hud,100);
})();


/* TERRITORY PASS 17 - ABILITY EFFECTS BRIDGE */
(function(){
  'use strict';

  // PASS 16 displayed ability ranks. PASS 17 makes those ranks affect
  // the real first-encounter follower assist values through a safe bridge.
  const ROLE_IDS = ['liabro','teralel','king_cows','mort','stone_face'];

  function activeId(){
    try { return window.Followers.getActiveId(); } catch(e) { return 'liabro'; }
  }
  function ability(){
    try { return window.TerritoryFollowerAbility.get(activeId()); }
    catch(e) { return {id:activeId(),rank:1,power:1}; }
  }

  window.TerritoryFollowerAbilityEffect = {
    get: function(){
      const a = ability();
      const r = Math.max(1, Number(a.rank)||1);
      const id = a.id;

      // Multipliers are intentionally modest: progression should feel useful,
      // not instantly break the early-game encounter.
      if(id === 'liabro') return {
        id, rank:r, damageMult: 1 + (r-1)*0.10,
        critMult: 1 + (r-1)*0.08, retaliationMult:1
      };
      if(id === 'teralel') return {
        id, rank:r, damageMult:1,
        critMult:1, retaliationMult: Math.max(.35, .65-(r-1)*.07)
      };
      if(id === 'king_cows') return {
        id, rank:r, damageMult:1,
        critMult:1, retaliationMult:1,
        healMult: 1 + (r-1)*.12
      };
      if(id === 'mort') return {
        id, rank:r, damageMult:1,
        critMult:1, retaliationMult:1,
        dodgeBonus: (r-1)*.05
      };
      if(id === 'stone_face') return {
        id, rank:r, damageMult:1,
        critMult:1, retaliationMult:1,
        controlBonus:(r-1)*.05
      };
      return {id,rank:r,damageMult:1,critMult:1,retaliationMult:1};
    }
  };

  // Public helper for the canonical/overlay battle bridge.
  window.TerritoryHomeBattleFX = window.TerritoryHomeBattleFX || {};
  window.TerritoryHomeBattleFX.getFollowerAbilityEffect = function(){
    return window.TerritoryFollowerAbilityEffect.get();
  };

  function showPulse(){
    const panel=document.querySelector('.life-battle-panel');
    if(!panel) return;
    const a=ability(), e=window.TerritoryFollowerAbilityEffect.get();
    let el=panel.querySelector('.follower-ability-pulse');
    if(!el){
      el=document.createElement('div');
      el.className='follower-ability-pulse';
      panel.appendChild(el);
    }
    let detail='';
    if(a.id==='liabro') detail='⚔️ Урон x'+e.damageMult.toFixed(2);
    else if(a.id==='teralel') detail='🛡️ Ответный урон x'+e.retaliationMult.toFixed(2);
    else if(a.id==='king_cows') detail='❤️ Лечение x'+e.healMult.toFixed(2);
    else if(a.id==='mort') detail='🌀 Уворот +'+Math.round(e.dodgeBonus*100)+'%';
    else if(a.id==='stone_face') detail='💀 Контроль +'+Math.round(e.controlBonus*100)+'%';
    el.textContent='✨ '+detail;
  }

  window.addEventListener('territory:follower-ability',showPulse);
  window.addEventListener('territory:follower-progress',showPulse);
  document.addEventListener('click',function(e){
    if(e.target && e.target.closest && e.target.closest('.life-battle-panel')) setTimeout(showPulse,30);
  });
})();


/* TERRITORY PASS 18 - FOLLOWER DEVELOPMENT PANEL */
(function(){
  'use strict';

  const CATALOG = {
    liabro:{name:'Лиабро',role:'Крит',icon:'⚔️'},
    teralel:{name:'Тералель',role:'Защита',icon:'🛡️'},
    king_cows:{name:'Король Коров',role:'Лечение',icon:'❤️'},
    mort:{name:'Морт',role:'Уворот',icon:'🌀'},
    stone_face:{name:'Каменное Лицо',role:'Контроль',icon:'💀'}
  };

  function id(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function progress(){
    try{return window.TerritoryFollowerProgress.get(id());}
    catch(e){return {level:1,xp:0,assists:0,meter:0};}
  }
  function ability(){
    try{return window.TerritoryFollowerAbility.get(id());}
    catch(e){return {rank:1,name:'Способность',icon:'✨',power:1};}
  }
  function need(){
    try{return window.TerritoryFollowerProgress.need(id());}catch(e){return 40;}
  }

  function open(){
    const fid=id(), c=CATALOG[fid]||CATALOG.liabro, p=progress(), a=ability();
    let modal=document.querySelector('.follower-development-modal');
    if(modal) modal.remove();

    modal=document.createElement('div');
    modal.className='follower-development-modal';
    modal.innerHTML =
      '<div class="fdm-backdrop"></div>'+
      '<section class="fdm-card" role="dialog" aria-label="Развитие последователя">'+
        '<button class="fdm-close" type="button">×</button>'+
        '<div class="fdm-head">'+
          '<div class="fdm-icon">'+c.icon+'</div>'+
          '<div><div class="fdm-name">'+c.name+'</div><div class="fdm-role">'+c.role+'</div></div>'+
          '<div class="fdm-level">Lv.'+p.level+'</div>'+
        '</div>'+
        '<div class="fdm-xp"><div><span>XP</span><b>'+p.xp+' / '+need()+'</b></div>'+
          '<div class="fdm-bar"><i style="width:'+Math.min(100,(p.xp/Math.max(1,need()))*100)+'%"></i></div></div>'+
        '<div class="fdm-ability">'+
          '<div class="fdm-ability-icon">'+a.icon+'</div>'+
          '<div class="fdm-ability-main"><b>'+a.name+'</b><span>Ранг R'+a.rank+'</span></div>'+
          '<div class="fdm-power">'+(a.power ? 'x'+Number(a.power).toFixed(2) : '—')+'</div>'+
        '</div>'+
        '<div class="fdm-stats">'+
          '<div><small>Поддержек</small><b>'+p.assists+'</b></div>'+
          '<div><small>Шкала</small><b>⚡ '+p.meter+'%</b></div>'+
          '<div><small>След. ранг</small><b>'+([3,6,10].find(x=>x>p.level)||'MAX')+'</b></div>'+
        '</div>'+
        '<button class="fdm-action" type="button">✨ ПОКАЗАТЬ СЛЕДУЮЩУЮ СТУПЕНЬ</button>'+
        '<p class="fdm-hint">Новый ранг способности открывается по мере роста последователя.</p>'+
      '</section>';

    document.body.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector('.fdm-close').onclick=close;
    modal.querySelector('.fdm-backdrop').onclick=close;
    modal.querySelector('.fdm-action').onclick=function(){
      const next=[3,6,10].find(x=>x>p.level);
      const msg=next
        ? 'Следующая ступень откроется на Lv.'+next
        : '✨ Максимальный ранг способности открыт!';
      this.textContent=msg;
      this.classList.add('fdm-action-done');
    };
  }

  window.TerritoryFollowerDevelopment={open};

  // Tap the living follower to open its development panel.
  document.addEventListener('click',function(e){
    const hit=e.target && e.target.closest ? e.target.closest('[data-home-action="follower"], .life-follower, .home-follower, .living-follower') : null;
    if(hit){
      setTimeout(function(){ 
        if(window.TerritoryFollowerDevelopment) window.TerritoryFollowerDevelopment.open();
      },20);
    }
  });
})();


/* TERRITORY PASS 19 - CHOICE UPGRADES */
(function(){
  'use strict';

  const KEY='territory_follower_choices_v1';
  const DATA={
    liabro:[
      {id:'crit',icon:'⚔️',name:'Острый клинок',desc:'+8% к критическому урону',stat:'crit',value:.08},
      {id:'fury',icon:'🔥',name:'Ярость',desc:'+5% к обычному урону',stat:'damage',value:.05}
    ],
    teralel:[
      {id:'wall',icon:'🛡️',name:'Крепкая стена',desc:'−8% ответного урона',stat:'retaliation',value:.08},
      {id:'guard',icon:'💠',name:'Охрана',desc:'+10% к силе щита',stat:'block',value:.10}
    ],
    king_cows:[
      {id:'spring',icon:'❤️',name:'Источник жизни',desc:'+10% к лечению',stat:'heal',value:.10},
      {id:'warmth',icon:'✨',name:'Забота',desc:'+5% к максимуму лечения',stat:'healCap',value:.05}
    ],
    mort:[
      {id:'shadow',icon:'🌀',name:'Глубокая тень',desc:'+6% к уклонению',stat:'dodge',value:.06},
      {id:'step',icon:'💨',name:'Теневой шаг',desc:'+4% к шансу контратаки',stat:'counter',value:.04}
    ],
    stone_face:[
      {id:'gaze',icon:'💀',name:'Тяжёлый взгляд',desc:'+6% к контролю',stat:'control',value:.06},
      {id:'stone',icon:'🗿',name:'Каменная воля',desc:'−5% к ответному урону',stat:'retaliation',value:.05}
    ]
  };

  function id(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function chosen(fid){
    const all=read();
    return all[fid]||null;
  }
  function level(){
    try{return window.TerritoryFollowerProgress.get(id()).level||1;}catch(e){return 1;}
  }

  window.TerritoryFollowerChoices={
    get:function(fid){return chosen(fid||id());},
    options:function(fid){return DATA[fid||id()]||DATA.liabro;},
    canChoose:function(){
      const s=level();
      return s>=3 && !chosen(id());
    },
    choose:function(choiceId){
      const fid=id(), opts=DATA[fid]||[];
      const pick=opts.find(x=>x.id===choiceId);
      if(!pick || level()<3) return false;
      const all=read();
      all[fid]=pick;
      write(all);
      try{window.dispatchEvent(new CustomEvent('territory:follower-choice',{detail:{followerId:fid,choice:pick}}));}catch(e){}
      return true;
    },
    effects:function(fid){
      const pick=chosen(fid||id());
      return pick ? {[pick.stat]:pick.value} : {};
    }
  };

  function openChoice(){
    const fid=id();
    if(level()<3 || chosen(fid)) return;

    const opts=DATA[fid]||DATA.liabro;
    let modal=document.querySelector('.follower-choice-modal');
    if(modal) modal.remove();

    modal=document.createElement('div');
    modal.className='follower-choice-modal';
    modal.innerHTML=
      '<div class="fcm-backdrop"></div>'+
      '<section class="fcm-card">'+
        '<div class="fcm-title">✨ НОВАЯ СТУПЕНЬ</div>'+
        '<div class="fcm-sub">Выбери направление развития последователя</div>'+
        '<div class="fcm-options">'+
          opts.map(o=>
            '<button class="fcm-option" data-choice="'+o.id+'">'+
              '<span class="fcm-icon">'+o.icon+'</span>'+
              '<span><b>'+o.name+'</b><small>'+o.desc+'</small></span>'+
            '</button>'
          ).join('')+
        '</div>'+
        '<p class="fcm-hint">Выбор сохраняется за этим последователем.</p>'+
      '</section>';

    document.body.appendChild(modal);
    modal.querySelector('.fcm-backdrop').onclick=()=>modal.remove();
    modal.querySelectorAll('[data-choice]').forEach(btn=>{
      btn.onclick=()=>{
        if(window.TerritoryFollowerChoices.choose(btn.dataset.choice)){
          modal.remove();
          try{window.TerritoryFollowerDevelopment.open();}catch(e){}
        }
      };
    });
  }

  window.TerritoryFollowerChoices.open=openChoice;

  // Development panel action becomes an actual choice at Lv.3.
  const oldOpen=window.TerritoryFollowerDevelopment && window.TerritoryFollowerDevelopment.open;
  if(oldOpen){
    window.TerritoryFollowerDevelopment.open=function(){
      oldOpen();
      const modal=document.querySelector('.follower-development-modal');
      if(!modal) return;
      const btn=modal.querySelector('.fdm-action');
      const fid=id(), p=chosen(fid);
      if(btn){
        if(level()>=3 && !p){
          btn.textContent='✨ ВЫБРАТЬ УЛУЧШЕНИЕ';
          btn.onclick=()=>{modal.remove();openChoice();};
        }else if(p){
          btn.textContent='✓ '+p.name+' — выбрано';
          btn.classList.add('fdm-action-done');
          btn.disabled=true;
        }
      }
    };
  }

  window.addEventListener('territory:follower-choice',function(){
    try{window.TerritoryHomeBattleFX.followerProgress(0,'choice');}catch(e){}
  });
})();


/* TERRITORY PASS 20 - CHOSEN UPGRADE EFFECT BRIDGE */
(function(){
  'use strict';

  function followerId(){
    try{return window.Followers.getActiveId();}catch(e){return 'liabro';}
  }
  function chosen(){
    try{return window.TerritoryFollowerChoices.get(followerId());}catch(e){return null;}
  }

  window.TerritoryFollowerChosenEffect = {
    get:function(){
      const c=chosen();
      if(!c) return {};
      const out={};
      out[c.stat]=Number(c.value)||0;
      out.choiceId=c.id;
      return out;
    },
    describe:function(){
      const c=chosen();
      return c ? {id:c.id,icon:c.icon,name:c.name,desc:c.desc,stat:c.stat,value:c.value} : null;
    }
  };

  window.TerritoryHomeBattleFX = window.TerritoryHomeBattleFX || {};
  window.TerritoryHomeBattleFX.getChosenFollowerEffect=function(){
    return window.TerritoryFollowerChosenEffect.get();
  };

  function refreshBadge(){
    const panel=document.querySelector('.life-battle-panel');
    if(!panel) return;
    const c=chosen();
    let el=panel.querySelector('.follower-choice-badge');
    if(!c){
      if(el) el.remove();
      return;
    }
    if(!el){
      el=document.createElement('div');
      el.className='follower-choice-badge';
      const ability=panel.querySelector('.follower-ability-hud');
      if(ability && ability.parentNode) ability.parentNode.insertBefore(el,ability.nextSibling);
      else panel.appendChild(el);
    }
    el.innerHTML='<span>'+c.icon+'</span><b>'+c.name+'</b><small>'+c.desc+'</small>';
  }

  window.addEventListener('territory:follower-choice',refreshBadge);
  window.addEventListener('territory:follower-progress',refreshBadge);
  document.addEventListener('click',function(e){
    if(e.target && e.target.closest && e.target.closest('.life-battle-panel')) setTimeout(refreshBadge,25);
  });
  setTimeout(refreshBadge,100);
})();


/* TERRITORY PASS 21 - REAL CHOSEN EFFECTS */
(function(){
  'use strict';

  function id(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function choice(){
    try{return window.TerritoryFollowerChoices.get(id());}catch(e){return null;}
  }

  function effect(){
    const c=choice();
    if(!c) return {};
    const v=Number(c.value)||0;
    switch(c.id){
      case 'crit': return {critMult:1+v};
      case 'fury': return {damageMult:1+v};
      case 'wall': return {retaliationMult:1-v};
      case 'guard': return {blockMult:1+v};
      case 'spring': return {healMult:1+v};
      case 'warmth': return {healCapMult:1+v};
      case 'shadow': return {dodgeBonus:v};
      case 'step': return {counterBonus:v};
      case 'gaze': return {controlBonus:v};
      case 'stone': return {retaliationMult:1-v};
    }
    return {};
  }

  window.TerritoryFollowerRealEffect={
    get:effect,
    applyDamage:function(damage,isCrit){
      const e=effect();
      let d=Number(damage)||0;
      if(e.damageMult) d*=e.damageMult;
      if(isCrit && e.critMult) d*=e.critMult;
      return Math.max(1,Math.round(d));
    },
    applyHeal:function(amount){
      const e=effect();
      let h=Number(amount)||0;
      if(e.healMult) h*=e.healMult;
      return Math.max(1,Math.round(h));
    },
    applyRetaliation:function(amount){
      const e=effect();
      let d=Number(amount)||0;
      if(e.retaliationMult) d*=e.retaliationMult;
      return Math.max(0,Math.round(d));
    }
  };

  window.TerritoryHomeBattleFX=window.TerritoryHomeBattleFX||{};
  window.TerritoryHomeBattleFX.applyFollowerDamage=function(d,isCrit){
    return window.TerritoryFollowerRealEffect.applyDamage(d,isCrit);
  };
  window.TerritoryHomeBattleFX.applyFollowerHeal=function(h){
    return window.TerritoryFollowerRealEffect.applyHeal(h);
  };
  window.TerritoryHomeBattleFX.applyFollowerRetaliation=function(d){
    return window.TerritoryFollowerRealEffect.applyRetaliation(d);
  };

  function refresh(){
    const panel=document.querySelector('.life-battle-panel');
    if(!panel) return;
    const c=choice();
    if(!c) return;
    let el=panel.querySelector('.follower-effect-live');
    if(!el){
      el=document.createElement('div');
      el.className='follower-effect-live';
      panel.appendChild(el);
    }
    const e=effect();
    let value='';
    if(e.damageMult) value='⚔️ Урон +'+Math.round((e.damageMult-1)*100)+'%';
    else if(e.critMult) value='💥 Крит +'+Math.round((e.critMult-1)*100)+'%';
    else if(e.retaliationMult) value='🛡️ Ответный урон '+Math.round(e.retaliationMult*100)+'%';
    else if(e.healMult) value='❤️ Лечение +'+Math.round((e.healMult-1)*100)+'%';
    else if(e.dodgeBonus) value='🌀 Уворот +'+Math.round(e.dodgeBonus*100)+'%';
    else if(e.controlBonus) value='💀 Контроль +'+Math.round(e.controlBonus*100)+'%';
    else value='✨ Эффект активен';
    el.textContent='АКТИВНО • '+value;
  }
  window.addEventListener('territory:follower-choice',refresh);
  window.addEventListener('territory:follower-progress',refresh);
  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('.life-battle-panel')) setTimeout(refresh,25);
  });
  setTimeout(refresh,120);
})();


/* TERRITORY PASS 22 - FOLLOWER MILESTONES & REWARDS */
(function(){
  'use strict';

  const KEY='territory_follower_milestones_v1';
  const MILESTONES=[
    {id:'first_assist',need:1,icon:'🤝',name:'Первый союз',desc:'Последователь впервые помог в бою',reward:5},
    {id:'ten_assists',need:10,icon:'🔥',name:'Боевой напарник',desc:'10 успешных поддержек',reward:15},
    {id:'level3',need:3,type:'level',icon:'✨',name:'Пробуждение',desc:'Последователь достиг Lv.3',reward:20},
    {id:'level6',need:6,type:'level',icon:'🌟',name:'Опытный союзник',desc:'Последователь достиг Lv.6',reward:35},
    {id:'level10',need:10,type:'level',icon:'👑',name:'Верный спутник',desc:'Последователь достиг Lv.10',reward:60}
  ];

  function fid(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function progress(){try{return window.TerritoryFollowerProgress.get(fid());}catch(e){return {level:1,assists:0};}}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}

  function claimState(){
    const all=read();
    if(!all[fid()]) all[fid()]={};
    return all;
  }

  function isComplete(m,p){
    return m.type==='level' ? p.level>=m.need : p.assists>=m.need;
  }

  function claim(m){
    const all=claimState();
    const s=all[fid()];
    if(s[m.id]) return false;
    s[m.id]=Date.now();
    all[fid()]=s;
    write(all);
    try{
      const Store=window.TerritoryStore;
      if(Store && Store.getState){
        const st=Store.getState();
        st.gems=(Number(st.gems)||0)+m.reward;
        if(Store.saveState) Store.saveState(st);
      }
    }catch(e){}
    try{window.dispatchEvent(new CustomEvent('territory:follower-milestone',{detail:{...m,followerId:fid()}}));}catch(e){}
    return true;
  }

  window.TerritoryFollowerMilestones={
    list:function(){return MILESTONES.map(m=>Object.assign({},m,{completed:isComplete(m,progress()),claimed:!!claimState()[fid()]?.[m.id]}));},
    claim:claim,
    next:function(){
      const p=progress(), s=claimState()[fid()]||{};
      return MILESTONES.find(m=>isComplete(m,p)&&!s[m.id])||null;
    }
  };

  function render(){
    const panel=document.querySelector('.life-battle-panel');
    if(!panel) return;
    const next=window.TerritoryFollowerMilestones.next();
    let el=panel.querySelector('.follower-milestone');
    if(!el){el=document.createElement('div');el.className='follower-milestone';panel.appendChild(el);}
    if(!next){
      el.textContent='🏅 Все текущие достижения последователя собраны';
      return;
    }
    const p=progress();
    const current=next.type==='level'?p.level:p.assists;
    el.innerHTML='<span>'+next.icon+'</span><b>'+next.name+'</b><small>'+Math.min(current,next.need)+'/'+next.need+' • награда 💎'+next.reward+'</small>'+
      '<button type="button" data-follower-claim="1">ЗАБРАТЬ</button>';
    el.querySelector('[data-follower-claim]').onclick=function(){
      if(window.TerritoryFollowerMilestones.claim(next)) render();
    };
  }

  window.addEventListener('territory:follower-progress',render);
  window.addEventListener('territory:follower-milestone',render);
  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('.life-battle-panel')) setTimeout(render,25);
  });
  setTimeout(render,150);
})();


/* TERRITORY PASS 23 - PREMIUM ECONOMY GUARDRAIL */
(function(){
  'use strict';

  /*
   * Territory economy rule:
   * red diamonds are premium currency and are never granted by
   * ordinary follower milestones. Milestones use a separate reward
   * channel so paid currency remains explicit and auditable.
   */
  const KEY='territory_follower_reward_v2';
  const REWARDS={
    first_assist:{type:'coins',amount:25},
    ten_assists:{type:'coins',amount:75},
    level3:{type:'follower_xp',amount:20},
    level6:{type:'coins',amount:150},
    level10:{type:'follower_xp',amount:60}
  };

  function state(){
    try{return window.TerritoryStore && window.TerritoryStore.getState
      ? window.TerritoryStore.getState() : null;}catch(e){return null;}
  }
  function save(s){
    try{
      if(window.TerritoryStore && window.TerritoryStore.saveState)
        window.TerritoryStore.saveState(s);
    }catch(e){}
  }
  function addReward(id){
    const r=REWARDS[id];
    if(!r) return false;

    // Never modify redgems/gems here. Premium currency stays purchase-only
    // unless a future explicit, auditable premium-reward system is designed.
    if(r.type==='coins'){
      const s=state();
      if(!s) return false;
      s.coins=(Number(s.coins)||0)+r.amount;
      save(s);
      return true;
    }
    if(r.type==='follower_xp'){
      try{
        window.TerritoryFollowerProgress.addXp(r.amount,'milestone');
        return true;
      }catch(e){return false;}
    }
    return false;
  }

  window.TerritoryFollowerReward={
    get:function(id){
      return REWARDS[id] ? Object.assign({},REWARDS[id]) : null;
    },
    claim:function(id){ return addReward(id); },
    premiumCurrencyProtected:true
  };

  // Public audit helper for future shop/battle systems.
  window.TerritoryEconomy={
    isPremiumCurrency:function(key){
      return key==='redgems' || key==='redDiamonds' || key==='red_diamonds';
    },
    grantPremium:function(){
      // Intentionally disabled: premium currency must come from an
      // explicit purchase/entitlement flow.
      return false;
    }
  };

  window.dispatchEvent(new CustomEvent('territory:economy-ready'));
})();


/* TERRITORY PASS 24 - FOLLOWER DEVELOPMENT ECONOMY */
(function(){
  'use strict';

  const KEY='territory_follower_development_economy_v1';

  const PRICES={
    rank2:{coins:120},
    rank3:{coins:350},
    rank4:{coins:900}
  };

  function fid(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function ability(){
    try{return window.TerritoryFollowerAbility.get(fid());}
    catch(e){return {rank:1,name:'Способность'};}
  }
  function store(){
    try{return window.TerritoryStore.getState();}catch(e){return null;}
  }
  function save(s){
    try{window.TerritoryStore.saveState(s);return true;}catch(e){return false;}
  }

  function buyRank(targetRank){
    const a=ability(), current=Number(a.rank)||1;
    if(targetRank!==current+1 || targetRank>4) return {ok:false,reason:'rank'};
    const price=PRICES['rank'+targetRank];
    const s=store();
    if(!s) return {ok:false,reason:'store'};
    const coins=Number(s.coins)||0;
    if(coins<price.coins) return {ok:false,reason:'coins',need:price.coins,have:coins};

    s.coins=coins-price.coins;
    if(!save(s)) return {ok:false,reason:'save'};

    const all=read();
    const id=fid();
    if(!all[id]) all[id]={rank:1,spent:0};
    all[id].rank=targetRank;
    all[id].spent=(Number(all[id].spent)||0)+price.coins;
    write(all);

    try{window.dispatchEvent(new CustomEvent('territory:follower-rank-up',{detail:{id,targetRank,price:price.coins}}));}catch(e){}
    return {ok:true,rank:targetRank,spent:price.coins};
  }

  window.TerritoryFollowerDevelopmentEconomy={
    prices:PRICES,
    canBuy:function(targetRank){
      const a=ability(), s=store(), price=PRICES['rank'+targetRank];
      return !!(price && targetRank===(Number(a.rank)||1)+1 && s && (Number(s.coins)||0)>=price.coins);
    },
    buyRank:buyRank
  };

  // Upgrade buttons in the follower development panel.
  function wire(){
    const modal=document.querySelector('.follower-development-modal');
    if(!modal) return;
    const a=ability(), next=(Number(a.rank)||1)+1, price=PRICES['rank'+next];
    const btn=modal.querySelector('.fdm-action');
    if(!btn || !price) return;

    btn.textContent='⬆️ УЛУЧШИТЬ ДО R'+next+' • '+price.coins+' 🪙';
    btn.disabled=false;
    btn.onclick=function(){
      const r=buyRank(next);
      if(r.ok){
        btn.textContent='✓ R'+r.rank+' ОТКРЫТ';
        btn.disabled=true;
        setTimeout(function(){
          try{window.TerritoryFollowerDevelopment.open();}catch(e){}
        },220);
      }else if(r.reason==='coins'){
        btn.textContent='🪙 НУЖНО '+r.need+' • ЕСТЬ '+r.have;
      }
    };
  }

  window.addEventListener('territory:follower-rank-up',function(){
    setTimeout(wire,30);
  });

  const oldOpen=window.TerritoryFollowerDevelopment && window.TerritoryFollowerDevelopment.open;
  if(oldOpen){
    window.TerritoryFollowerDevelopment.open=function(){
      oldOpen();
      setTimeout(wire,30);
    };
  }
})();


/* TERRITORY PASS 25 - FOLLOWER FORGE SHOP */
(function(){
  'use strict';

  const ITEMS = [
    {id:'training',icon:'⚡',name:'Тренировка',desc:'+25 XP последователю',cost:80,kind:'xp'},
    {id:'support',icon:'🤝',name:'Боевой жетон',desc:'+20 к шкале поддержки',cost:120,kind:'meter'},
    {id:'rank',icon:'✨',name:'Знак мастерства',desc:'+1 ранг способности',cost:350,kind:'rank'}
  ];

  function fid(){try{return window.Followers.getActiveId();}catch(e){return 'liabro';}}
  function state(){try{return window.TerritoryStore.getState();}catch(e){return null;}}
  function save(s){try{window.TerritoryStore.saveState(s);return true;}catch(e){return false;}}
  function progress(){try{return window.TerritoryFollowerProgress.get(fid());}catch(e){return {level:1,xp:0,meter:0};}}
  function ability(){try{return window.TerritoryFollowerAbility.get(fid());}catch(e){return {rank:1};}}

  function buy(item){
    const s=state();
    if(!s) return {ok:false,reason:'store'};
    const coins=Number(s.coins)||0;
    if(coins<item.cost) return {ok:false,reason:'coins',need:item.cost,have:coins};

    if(item.kind==='rank'){
      const r=window.TerritoryFollowerDevelopmentEconomy &&
        window.TerritoryFollowerDevelopmentEconomy.buyRank
        ? window.TerritoryFollowerDevelopmentEconomy.buyRank((Number(ability().rank)||1)+1)
        : null;
      if(!r || !r.ok) return {ok:false,reason:r&&r.reason||'rank'};
      return {ok:true};
    }

    s.coins=coins-item.cost;
    if(!save(s)) return {ok:false,reason:'save'};

    if(item.kind==='xp'){
      try{window.TerritoryFollowerProgress.addXp(item.amount||25,'forge-shop');}catch(e){}
    }else if(item.kind==='meter'){
      try{
        const p=progress();
        const raw=JSON.parse(localStorage.getItem('territory_follower_progress_v1')||'{}');
        if(!raw[fid()]) raw[fid()]={xp:p.xp||0,level:p.level||1,assists:p.assists||0,meter:p.meter||0};
        raw[fid()].meter=Math.min(100,(Number(raw[fid()].meter)||0)+20);
        localStorage.setItem('territory_follower_progress_v1',JSON.stringify(raw));
        window.dispatchEvent(new CustomEvent('territory:follower-meter',{detail:{id:fid(),meter:raw[fid()].meter}}));
      }catch(e){}
    }
    return {ok:true};
  }

  function open(){
    let modal=document.querySelector('.follower-forge-modal');
    if(modal) modal.remove();

    const s=state()||{coins:0};
    const coins=Number(s.coins)||0;
    const a=ability(), p=progress();

    modal=document.createElement('div');
    modal.className='follower-forge-modal';
    modal.innerHTML=
      '<div class="ffm-backdrop"></div>'+
      '<section class="ffm-card">'+
        '<button class="ffm-close">×</button>'+
        '<div class="ffm-title">⚒️ МАСТЕРСКАЯ ПОСЛЕДОВАТЕЛЯ</div>'+
        '<div class="ffm-sub">Развитие: Lv.'+p.level+' • R'+a.rank+' • 🪙 '+coins+'</div>'+
        '<div class="ffm-items">'+ITEMS.map(item=>{
          let cost=item.cost;
          if(item.kind==='rank') cost=(window.TerritoryFollowerDevelopmentEconomy?.prices?.['rank'+((Number(a.rank)||1)+1)]?.coins)||cost;
          return '<button class="ffm-item" data-buy="'+item.id+'">'+
            '<span class="ffm-icon">'+item.icon+'</span>'+
            '<span class="ffm-main"><b>'+item.name+'</b><small>'+item.desc+'</small></span>'+
            '<strong>'+cost+' 🪙</strong>'+
          '</button>';
        }).join('')+'</div>'+
        '<p class="ffm-hint">Премиальная валюта здесь не используется.</p>'+
      '</section>';

    document.body.appendChild(modal);
    modal.querySelector('.ffm-close').onclick=()=>modal.remove();
    modal.querySelector('.ffm-backdrop').onclick=()=>modal.remove();
    modal.querySelectorAll('[data-buy]').forEach(btn=>{
      btn.onclick=()=>{
        const item=ITEMS.find(x=>x.id===btn.dataset.buy);
        if(!item) return;
        const r=buy(item);
        if(r.ok){
          btn.classList.add('ffm-bought');
          btn.querySelector('strong').textContent='✓ ГОТОВО';
          setTimeout(()=>open(),180);
        }else if(r.reason==='coins'){
          btn.querySelector('strong').textContent='Нужно '+r.need;
        }
      };
    });
  }

  window.TerritoryFollowerForgeShop={open,items:ITEMS};
})();


/* TERRITORY PASS 26 - VIP FOUNDATION */
(function(){
  'use strict';

  const KEY='territory_vip_v1';

  const TIERS={
    0:{name:'Без VIP',icon:'◇',bonusXp:0,energy:0},
    1:{name:'VIP I',icon:'◆',bonusXp:0.05,energy:5},
    2:{name:'VIP II',icon:'◆',bonusXp:0.10,energy:10},
    3:{name:'VIP III',icon:'◆',bonusXp:0.15,energy:15},
    4:{name:'VIP IV',icon:'◆',bonusXp:0.20,energy:20},
    5:{name:'VIP V',icon:'◆',bonusXp:0.25,energy:25}
  };

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function get(){
    const s=read();
    return {level:Math.max(0,Math.min(5,Number(s.level)||0)),lifetime:s.lifetime||0};
  }
  function tier(){return TIERS[get().level]||TIERS[0];}

  window.TerritoryVIP={
    tiers:TIERS,
    get:get,
    current:tier,
    setLevel:function(level){
      level=Math.max(0,Math.min(5,Number(level)||0));
      const s=read();s.level=level;write(s);
      try{window.dispatchEvent(new CustomEvent('territory:vip-change',{detail:{level,tier:TIERS[level]}}));}catch(e){}
      return get();
    },
    // Purchase systems can award VIP entitlement later; no real-money
    // payment handling is implemented in this overlay.
    grantLifetime:function(amount){
      const s=read();s.lifetime=(Number(s.lifetime)||0)+Math.max(0,Number(amount)||0);write(s);
      return get();
    }
  };

  // Central, transparent VIP bonus hooks for future canonical systems.
  window.TerritoryVIPEffects={
    xpMultiplier:function(){return 1+(tier().bonusXp||0);},
    energyBonus:function(){return tier().energy||0;}
  };

  function open(){
    const v=get(), t=tier();
    let modal=document.querySelector('.territory-vip-modal');
    if(modal) modal.remove();

    modal=document.createElement('div');
    modal.className='territory-vip-modal';
    modal.innerHTML=
      '<div class="tvm-backdrop"></div>'+
      '<section class="tvm-card">'+
        '<button class="tvm-close">×</button>'+
        '<div class="tvm-icon">'+t.icon+'</div>'+
        '<div class="tvm-title">TERRITORY VIP</div>'+
        '<div class="tvm-tier">'+t.name+' • уровень '+v.level+'</div>'+
        '<div class="tvm-current">'+
          '<div><small>Бонус XP</small><b>+'+Math.round(t.bonusXp*100)+'%</b></div>'+
          '<div><small>Энергия</small><b>+'+t.energy+'</b></div>'+
        '</div>'+
        '<div class="tvm-note">VIP — отдельная система привилегий. Покупная премиальная валюта не тратится автоматически.</div>'+
        '<div class="tvm-coming">👑 Следующий слой: VIP-привилегии и уровни наград</div>'+
      '</section>';

    document.body.appendChild(modal);
    modal.querySelector('.tvm-close').onclick=()=>modal.remove();
    modal.querySelector('.tvm-backdrop').onclick=()=>modal.remove();
  }

  window.TerritoryVIP.open=open;

  // Make existing top VIP action open the new panel when available.
  document.addEventListener('click',function(e){
    const el=e.target&&e.target.closest?e.target.closest('[data-home-action="vip"], [data-action="vip"], [data-home-action="profile-vip"]'):null;
    if(el){e.preventDefault();open();}
  });
})();


/* TERRITORY PASS 27 - VIP DAILY REWARDS */
(function(){
  'use strict';

  const KEY='territory_vip_daily_v1';
  const REWARDS={
    0:{coins:25,xp:0,tag:'Обычный день'},
    1:{coins:45,xp:5,tag:'VIP I'},
    2:{coins:70,xp:10,tag:'VIP II'},
    3:{coins:100,xp:15,tag:'VIP III'},
    4:{coins:140,xp:20,tag:'VIP IV'},
    5:{coins:190,xp:25,tag:'VIP V'}
  };

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function today(){
    const d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function vip(){
    try{return window.TerritoryVIP.get().level||0;}catch(e){return 0;}
  }
  function state(){try{return window.TerritoryStore.getState();}catch(e){return null;}}
  function save(s){try{window.TerritoryStore.saveState(s);return true;}catch(e){return false;}}

  function get(){
    const s=read();
    return {claimed:s.claimedDate===today(),claimedDate:s.claimedDate||null,streak:Number(s.streak)||0};
  }

  function claim(){
    const current=get();
    if(current.claimed) return {ok:false,reason:'claimed'};

    const r=REWARDS[vip()]||REWARDS[0];
    const s=state();
    if(!s) return {ok:false,reason:'store'};

    s.coins=(Number(s.coins)||0)+r.coins;
    if(!save(s)) return {ok:false,reason:'save'};

    const all=read();
    all.claimedDate=today();
    all.streak=(Number(all.streak)||0)+1;
    write(all);

    try{window.dispatchEvent(new CustomEvent('territory:vip-daily-claimed',{detail:{vip:vip(),reward:r,streak:all.streak}}));}catch(e){}
    return {ok:true,reward:r,streak:all.streak};
  }

  window.TerritoryVIPDaily={
    get:get,
    reward:function(){return Object.assign({},REWARDS[vip()]||REWARDS[0]);},
    claim:claim
  };

  function open(){
    let modal=document.querySelector('.vip-daily-modal');
    if(modal) modal.remove();

    const v=vip(), r=REWARDS[v]||REWARDS[0], d=get();
    modal=document.createElement('div');
    modal.className='vip-daily-modal';
    modal.innerHTML=
      '<div class="vdm-backdrop"></div>'+
      '<section class="vdm-card">'+
        '<button class="vdm-close">×</button>'+
        '<div class="vdm-icon">🎁</div>'+
        '<div class="vdm-title">ЕЖЕДНЕВНАЯ НАГРАДА</div>'+
        '<div class="vdm-vip">'+r.tag+' • серия '+d.streak+'</div>'+
        '<div class="vdm-reward"><span>🪙</span><b>'+r.coins+'</b><small>монет</small></div>'+
        '<div class="vdm-line">Каждый день — новая награда. VIP повышает её размер.</div>'+
        '<button class="vdm-claim" type="button">'+(d.claimed?'✓ УЖЕ ПОЛУЧЕНО':'ЗАБРАТЬ НАГРАДУ')+'</button>'+
      '</section>';

    document.body.appendChild(modal);
    modal.querySelector('.vdm-close').onclick=()=>modal.remove();
    modal.querySelector('.vdm-backdrop').onclick=()=>modal.remove();
    const btn=modal.querySelector('.vdm-claim');
    btn.disabled=d.claimed;
    btn.onclick=()=>{
      const result=claim();
      if(result.ok){
        btn.textContent='✓ ПОЛУЧЕНО • '+result.reward.coins+' 🪙';
        btn.disabled=true;
        modal.querySelector('.vdm-vip').textContent=r.tag+' • серия '+result.streak;
      }
    };
  }

  window.TerritoryVIPDaily.open=open;
})();


/* TERRITORY PASS 28 - VIP CENTER 10 TIERS */
(function(){
  'use strict';

  const KEY='territory_vip_v2';

  // Prices are configuration only. Payment/Telegram entitlement verification
  // remains a separate server-side responsibility.
  const TIERS={
    0:{name:'Без VIP',price:0,icon:'◇',xp:0,energy:0,daily:25},
    1:{name:'VIP I',price:1,icon:'◆',xp:5,energy:5,daily:45},
    2:{name:'VIP II',price:3,icon:'◆',xp:8,energy:8,daily:60},
    3:{name:'VIP III',price:7,icon:'◆',xp:12,energy:10,daily:80},
    4:{name:'VIP IV',price:15,icon:'◆',xp:16,energy:13,daily:105},
    5:{name:'VIP V',price:30,icon:'◆',xp:20,energy:16,daily:135},
    6:{name:'VIP VI',price:55,icon:'◆',xp:25,energy:20,daily:170},
    7:{name:'VIP VII',price:90,icon:'◆',xp:30,energy:24,daily:215},
    8:{name:'VIP VIII',price:140,icon:'◆',xp:36,energy:28,daily:270},
    9:{name:'VIP IX',price:200,icon:'◆',xp:42,energy:33,daily:335},
    10:{name:'VIP X',price:300,icon:'◆',xp:50,energy:40,daily:420}
  };

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}');}
    catch(e){return {};}
  }
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function level(){
    const v=read();
    return Math.max(0,Math.min(10,Number(v.level)||0));
  }
  function current(){return TIERS[level()]||TIERS[0];}

  window.TerritoryVIP10={
    tiers:TIERS,
    get:function(){return {level:level(),tier:current(),lifetime:read().lifetime||0};},
    // Local/dev entitlement hook only. Production purchases must be verified
    // by the server before calling the entitlement layer.
    setEntitlement:function(lvl){
      lvl=Math.max(0,Math.min(10,Number(lvl)||0));
      const v=read(); v.level=lvl; write(v);
      try{window.dispatchEvent(new CustomEvent('territory:vip10-change',{detail:{level:lvl,tier:TIERS[lvl]}}));}catch(e){}
      return this.get();
    },
    next:function(){
      const n=level()+1;
      return n<=10 ? TIERS[n] : null;
    },
    xpMultiplier:function(){return 1+(current().xp/100);},
    energyBonus:function(){return current().energy;},
    dailyReward:function(){return current().daily;}
  };

  function open(){
    let modal=document.querySelector('.vip-center-modal');
    if(modal) modal.remove();

    const lv=level(), t=current(), next=lv<10?TIERS[lv+1]:null;
    modal=document.createElement('div');
    modal.className='vip-center-modal';
    modal.innerHTML=
      '<div class="vcm-backdrop"></div>'+
      '<section class="vcm-card">'+
        '<button class="vcm-close">×</button>'+
        '<div class="vcm-crown">👑</div>'+
        '<div class="vcm-title">TERRITORY VIP</div>'+
        '<div class="vcm-current">'+t.icon+' '+t.name+' <span>• '+lv+'/10</span></div>'+
        '<div class="vcm-stats">'+
          '<div><small>XP</small><b>+'+t.xp+'%</b></div>'+
          '<div><small>Энергия</small><b>+'+t.energy+'</b></div>'+
          '<div><small>Ежедневно</small><b>'+t.daily+' 🪙</b></div>'+
        '</div>'+
        '<div class="vcm-section-title">УРОВНИ VIP</div>'+
        '<div class="vcm-levels">'+Object.keys(TIERS).filter(k=>k>0).map(k=>{
          const x=TIERS[k], active=Number(k)===lv, unlocked=Number(k)<=lv;
          return '<button class="vcm-level '+(active?'active ':'')+(unlocked?'unlocked':'')+'" data-vip-level="'+k+'">'+
            '<span>'+x.icon+'</span><b>VIP '+k+'</b><small>$'+x.price+'</small>'+
          '</button>';
        }).join('')+'</div>'+
        (next
          ? '<div class="vcm-next"><span>Следующий: <b>VIP '+(lv+1)+'</b></span><span>$'+next.price+'</span></div>'
          : '<div class="vcm-max">👑 VIP X — максимальный уровень</div>')+
        '<p class="vcm-note">Цены отображаются как настройки VIP. Реальная покупка должна подтверждаться сервером.</p>'+
      '</section>';

    document.body.appendChild(modal);
    modal.querySelector('.vcm-close').onclick=()=>modal.remove();
    modal.querySelector('.vcm-backdrop').onclick=()=>modal.remove();

    // Only opens a preview of a tier; it does not grant paid VIP.
    modal.querySelectorAll('[data-vip-level]').forEach(btn=>{
      btn.onclick=()=>{
        const n=Number(btn.dataset.vipLevel), x=TIERS[n];
        modal.querySelector('.vcm-current').textContent=x.icon+' '+x.name+' • '+n+'/10';
        modal.querySelector('.vcm-note').textContent=
          'VIP '+n+': +'+x.xp+'% XP • +'+x.energy+' энергии • '+x.daily+' 🪙 в ежедневной награде. Покупка требует серверного подтверждения.';
      };
    });
  }

  window.TerritoryVIPCenter={open};
})();


/* TERRITORY PASS 29 - VIP PERSONALITY */
(function(){
  'use strict';

  const TIERS={
    1:{title:'Искра',color:'violet',aura:'✨',cosmetic:'Мягкое сияние'},
    2:{title:'Знак',color:'violet',aura:'💫',cosmetic:'След света'},
    3:{title:'Страж',color:'blue',aura:'🛡️',cosmetic:'Аура стража'},
    4:{title:'Герой',color:'blue',aura:'⚔️',cosmetic:'Боевой след'},
    5:{title:'Мастер',color:'gold',aura:'🔥',cosmetic:'Пламенный след'},
    6:{title:'Легенда',color:'gold',aura:'🌟',cosmetic:'Золотая аура'},
    7:{title:'Владыка',color:'gold',aura:'👑',cosmetic:'Королевское сияние'},
    8:{title:'Титан',color:'red',aura:'💎',cosmetic:'Алмазный след'},
    9:{title:'Архонт',color:'red',aura:'🌌',cosmetic:'Космическая аура'},
    10:{title:'Император',color:'red',aura:'👑',cosmetic:'Императорская аура'}
  };

  function level(){
    try{return window.TerritoryVIP10.get().level||0;}catch(e){return 0;}
  }
  function data(){return TIERS[level()]||null;}

  window.TerritoryVIPPersonality={
    get:function(){
      const d=data();
      return d ? Object.assign({level:level()},d) : {level:0,title:'Обычный игрок',aura:'◇',cosmetic:'Без VIP-ауры'};
    }
  };

  function applyHomeAura(){
    const d=data();
    const host=document.querySelector('.home-reference-host, .home-life, #home, .home-screen');
    if(!host || !d) return;
    host.classList.remove('vip-aura-1','vip-aura-2','vip-aura-3','vip-aura-4','vip-aura-5','vip-aura-6','vip-aura-7','vip-aura-8','vip-aura-9','vip-aura-10');
    host.classList.add('vip-aura-'+level());
    host.dataset.vipTitle=d.title;
  }

  function badge(){
    const d=data();
    if(!d) return;
    let el=document.querySelector('.vip-personality-badge');
    if(!el){
      el=document.createElement('div');
      el.className='vip-personality-badge';
      document.body.appendChild(el);
    }
    el.innerHTML='<span>'+d.aura+'</span><b>VIP '+level()+' • '+d.title+'</b><small>'+d.cosmetic+'</small>';
  }

  function refresh(){
    applyHomeAura();
    badge();
  }

  window.addEventListener('territory:vip10-change',refresh);
  window.addEventListener('territory:vip-change',refresh);
  setTimeout(refresh,180);
})();


/* TERRITORY PASS 30 - VIP HERO & FOLLOWER COSMETICS */
(function(){
  'use strict';

  const TIERS={
    1:{hero:'✨',follower:'✦',label:'Искра'},
    2:{hero:'💫',follower:'✦',label:'Знак'},
    3:{hero:'🛡️',follower:'🛡️',label:'Страж'},
    4:{hero:'⚔️',follower:'⚔️',label:'Герой'},
    5:{hero:'🔥',follower:'🔥',label:'Мастер'},
    6:{hero:'🌟',follower:'🌟',label:'Легенда'},
    7:{hero:'👑',follower:'👑',label:'Владыка'},
    8:{hero:'💎',follower:'💎',label:'Титан'},
    9:{hero:'🌌',follower:'🌌',label:'Архонт'},
    10:{hero:'👑',follower:'💎',label:'Император'}
  };

  function level(){
    try{return window.TerritoryVIP10.get().level||0;}catch(e){return 0;}
  }

  function data(){return TIERS[level()]||null;}

  window.TerritoryVIPCosmetics={
    get:function(){
      const d=data();
      return d ? Object.assign({level:level()},d) : {level:0};
    }
  };

  function findHero(){
    return document.querySelector('.life-hero,.home-hero,.living-hero,[data-home-action="hero"]');
  }
  function findFollower(){
    return document.querySelector('.life-follower,.home-follower,.living-follower,[data-home-action="follower"]');
  }

  function apply(){
    const d=data();
    if(!d) return;
    const hero=findHero(), follower=findFollower();

    if(hero){
      hero.classList.add('vip-cosmetic-hero');
      hero.dataset.vipLevel=level();
      hero.dataset.vipAura=d.hero;
    }
    if(follower){
      follower.classList.add('vip-cosmetic-follower');
      follower.dataset.vipLevel=level();
      follower.dataset.vipAura=d.follower;
    }

    let scene=document.querySelector('.vip-scene-aura');
    if(!scene){
      scene=document.createElement('div');
      scene.className='vip-scene-aura';
      document.body.appendChild(scene);
    }
    scene.dataset.vipLevel=level();
    scene.innerHTML='<span>'+d.hero+'</span><span>'+d.follower+'</span>';
  }

  function refresh(){
    // Give the living scene time to mount before applying cosmetics.
    setTimeout(apply,50);
  }

  window.addEventListener('territory:vip10-change',refresh);
  window.addEventListener('territory:vip-change',refresh);
  document.addEventListener('click',function(){
    if(level()>0) setTimeout(apply,80);
  });
  setTimeout(apply,220);
})();
