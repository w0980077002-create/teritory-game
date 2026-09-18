/* Territory G40 — Unified Character Core */
(function(){
  'use strict';
  const KEY='territory_save_v1';
  const OLD='territory_save';
  const CORE={
    strength:5, agility:5, defense:0, endurance:12, weaponMastery:1,
    freePoints:0, level:1, exp:0, maxExp:100, hp:120, maxHp:120,
    coins:1000, gems:25, energy:100, combatStone:0, weapon:'Кулаки', bonusDamage:0
  };
  function read(){
    try{
      const a=JSON.parse(localStorage.getItem(KEY)||'null');
      if(a&&typeof a==='object') return a;
      const b=JSON.parse(localStorage.getItem(OLD)||'null');
      return b&&typeof b==='object'?b:{};
    }catch(e){return {};}
  }
  function normalize(s){
    s={...CORE,...s};
    s.level=Math.max(1,Number(s.level)||1);
    s.exp=Math.max(0,Number(s.exp)||0);
    s.maxExp=Math.max(100,Number(s.maxExp)||100);
    s.strength=Math.max(1,Number(s.strength)||5);
    s.agility=Math.max(1,Number(s.agility)||5);
    s.defense=Math.max(0,Number(s.defense)||0);
    s.endurance=Math.max(1,Number(s.endurance)||12);
    s.weaponMastery=Math.max(1,Number(s.weaponMastery)||1);
    s.freePoints=Math.max(0,Number(s.freePoints)||0);
    s.maxHp=Math.max(120,Number(s.maxHp)||120);
    s.hp=Math.max(0,Math.min(s.maxHp,Number(s.hp)||s.maxHp));
    s.energy=Math.max(0,Math.min(200,Number(s.energy)||0));
    s.bonusDamage=Math.max(0,Number(s.bonusDamage)||0);
    s.characterCoreVersion=40;
    return s;
  }
  let state=normalize(read());
  function write(){
    state=normalize(state);
    try{
      localStorage.setItem(KEY,JSON.stringify(state));
      /* Keep the legacy key in sync for older modules already in the game. */
      localStorage.setItem(OLD,JSON.stringify(state));
    }catch(e){}
    try{window.dispatchEvent(new CustomEvent('territory:characterChanged',{detail:{...state}}));}catch(e){}
    if(typeof window.render==='function') window.render();
  }
  function derived(){
    return {
      power: Math.round(state.strength*2 + state.agility*1.5 + state.defense*2 + state.endurance + state.weaponMastery*3 + state.bonusDamage),
      maxHp: 120 + Math.max(0,state.endurance-12)*5,
      crit: Math.min(60,Math.round(state.strength*2)),
      dodge: Math.min(45,Math.round(state.agility*1.5)),
      damage: Math.max(1,5+state.strength+state.weaponMastery+state.bonusDamage),
      block: Math.min(70,Math.round(state.defense*1.8))
    };
  }
  function ensureStyle(){
    if(document.getElementById('g40DevStyle'))return;
    const s=document.createElement('style');s.id='g40DevStyle';
    s.textContent=`
      #g40Dev{position:fixed;inset:0;z-index:100090;display:none;align-items:flex-end;background:rgba(2,8,20,.82);padding:10px;box-sizing:border-box}
      #g40Dev.show{display:flex}
      .g40-card{width:100%;max-width:540px;max-height:90vh;margin:auto;background:linear-gradient(180deg,#142944,#07111f);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(0,0,0,.7)}
      .g40-head{display:flex;align-items:center;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
      .g40-head b{font-size:19px}.g40-head small{display:block;color:#aebbd0;margin-top:3px}
      .g40-close{margin-left:auto;width:42px;height:42px;border:0;border-radius:12px;background:#263751;color:#fff;font-size:24px}
      .g40-body{padding:14px;overflow:auto}
      .g40-level{padding:13px;border-radius:16px;background:rgba(224,194,103,.09);border:1px solid rgba(224,194,103,.28);margin-bottom:12px}
      .g40-level-row{display:flex;justify-content:space-between;align-items:center}.g40-level b{font-size:18px}.g40-level span{color:#d8bf72;font-weight:800}
      .g40-bar{height:8px;background:rgba(255,255,255,.1);border-radius:9px;overflow:hidden;margin-top:8px}.g40-bar i{display:block;height:100%;background:#d7b85e;width:0}
      .g40-points{margin-top:8px;font-size:12px;color:#b9c6d8}
      .g40-stats{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .g40-stat{padding:12px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1)}
      .g40-stat b{display:block;font-size:14px}.g40-stat small{display:block;color:#91a2bb;margin-top:4px;font-size:11px}
      .g40-stat-row{display:flex;align-items:center;justify-content:space-between;margin-top:8px}.g40-stat-row strong{font-size:20px}.g40-plus{width:36px;height:36px;border:0;border-radius:10px;background:#2d4770;color:#fff;font-size:22px}.g40-plus:disabled{opacity:.35}
      .g40-derived{margin-top:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.g40-derived div{padding:10px;border-radius:13px;background:rgba(255,255,255,.04);font-size:11px;color:#aebbd0}.g40-derived b{display:block;color:#fff;font-size:15px;margin-top:3px}
      .g40-note{text-align:center;color:#8293ac;font-size:10px;margin-top:12px;line-height:1.4}
      #g40DevButton{margin:12px 14px 0;width:calc(100% - 28px);border:0;border-radius:14px;padding:13px;background:linear-gradient(180deg,#355a88,#203a5d);color:#fff;font-weight:900;font-size:14px}
    `;
    document.head.appendChild(s);
  }
  function statMeta(key){return {
    strength:['💪 Сила','Урон и критический шанс'],
    agility:['🏃 Ловкость','Уклонение и скорость'],
    defense:['🛡️ Защита','Снижение входящего урона'],
    endurance:['❤️ Выносливость','Максимальное HP'],
    weaponMastery:['⚔️ Мастерство оружия','Базовый урон оружия']
  }[key]}
  const stats=['strength','agility','defense','endurance','weaponMastery'];
  function render(){
    const m=document.getElementById('g40Dev');if(!m)return;
    const d=derived();
    const p=Math.min(100,Math.round(state.exp/state.maxExp*100));
    m.querySelector('.g40-body').innerHTML=`
      <div class="g40-level"><div class="g40-level-row"><b>Уровень ${state.level}</b><span>${state.exp} / ${state.maxExp} XP</span></div><div class="g40-bar"><i style="width:${p}%"></i></div><div class="g40-points">Свободные очки: <strong>${state.freePoints}</strong></div></div>
      <div class="g40-stats">${stats.map(k=>{const meta=statMeta(k);return `<div class="g40-stat"><b>${meta[0]}</b><small>${meta[1]}</small><div class="g40-stat-row"><strong>${state[k]}</strong><button class="g40-plus" data-g40-add="${k}" ${state.freePoints<=0?'disabled':''}>+</button></div></div>`}).join('')}</div>
      <div class="g40-derived">
        <div>⚔️ Сила удара<b>${d.damage}</b></div><div>💥 Крит<b>${d.crit}%</b></div>
        <div>🌀 Уклонение<b>${d.dodge}%</b></div><div>🛡️ Блок<b>${d.block}%</b></div>
        <div>❤️ Максимум HP<b>${d.maxHp}</b></div><div>🏆 Боевая мощь<b>${d.power}</b></div>
      </div>
      <div class="g40-note">Каждое очко влияет на игровые характеристики. Следующий этап свяжет эти показатели напрямую с тактической Ареной 4×4.</div>`;
  }
  function open(){ensureStyle();let m=document.getElementById('g40Dev');if(!m){m=document.createElement('div');m.id='g40Dev';m.innerHTML='<div class="g40-card"><div class="g40-head"><div><b>🧙 РАЗВИТИЕ ПЕРСОНАЖА</b><small>Единое ядро героя Sdolars</small></div><button class="g40-close">×</button></div><div class="g40-body"></div></div>';document.body.appendChild(m);m.querySelector('.g40-close').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close();const b=e.target.closest('[data-g40-add]');if(b)add(b.dataset.g40Add);});}render();m.classList.add('show')}
  function close(){const m=document.getElementById('g40Dev');if(m)m.classList.remove('show')}
  function add(key){if(!stats.includes(key)||state.freePoints<=0)return;state[key]++;state.freePoints--;if(key==='endurance'){const old=state.maxHp;state.maxHp=derived().maxHp;state.hp=Math.min(state.maxHp,Math.max(state.hp,old));}write();render()}
  function install(){
    state=normalize(read()); write();
    const profile=document.getElementById('profile');if(!profile)return;
    if(!document.getElementById('g40DevButton')){const b=document.createElement('button');b.id='g40DevButton';b.type='button';b.textContent='🧙 РАЗВИТИЕ ПЕРСОНАЖА';b.onclick=open;profile.appendChild(b)}
  }
  window.TerritoryCharacter={get:()=>({...state}),derived,open,close,add,save:write};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  setTimeout(install,150);setTimeout(install,600);setTimeout(install,1500);
})();
