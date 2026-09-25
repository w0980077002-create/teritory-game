/* Territory Game — Character screen / active follower */
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slots=[['weapon','ОРУЖИЕ','⚔️'],['helmet','ШЛЕМ','⛑️'],['shoulders','НАПЛЕЧНИКИ','🛡️'],['belt','ПОЯС','◉'],['pants','ШТАНЫ','▣'],['boots','САПОГИ','🥾'],['ring','КОЛЬЦО','💍']];

  function activeFollower(){
    const id=S().followers?.activeFollower;
    if(!id||!window.Followers)return null;
    const f=window.Followers.get?.(id),cfg=window.Followers.CATALOG?.[id],stats=window.Followers.getStats?.(id);
    if(!f?.owned||!cfg||!stats)return null;
    return{id,data:f,cfg,stats};
  }
  function derived(){
    const s=S(),d=window.TerritoryStore?.getDerivedStats?.()||{};
    return{strength:Number(d.strength??s.strength)||0,defense:Number(d.defense??s.defense)||0,maxHp:Number(d.maxHp??s.maxHp)||1,agility:Number(d.agility??s.agility)||0,bonusDamage:Number(d.bonusDamage??s.bonusDamage)||0};
  }
  function equipmentFor(slot){return(Array.isArray(S().equipment)?S().equipment:[]).find(x=>String(x?.slot||'')===slot)||null;}
  function photoMarkup(){const p=S().profile||{};return p.photoUrl?`<div class="hero-avatar" style="background-image:url("${String(p.photoUrl).replace(/"/g,'%22')}")"><span></span></div>`:'<div class="hero-avatar hero-avatar-fallback">⚔️</div>';}

  function followerSelector(){
    const activeId=S().followers?.activeFollower;
    const cards=Object.values(window.Followers?.CATALOG||{}).map(cfg=>{
      const f=window.Followers.get(cfg.id),stats=window.Followers.getStats(cfg.id),active=cfg.id===activeId;
      return `<button type="button" class="hero-follower-option ${active?'active':''}" data-select-follower="${cfg.id}" ${f?.owned?'':'disabled'}><span>${esc(cfg.icon)}</span><div><b>${esc(cfg.name)}</b><small>${esc(cfg.role)} · ур.${f?.level||1}</small></div><strong>${active?'В БОЮ':f?.owned?'ВЫБРАТЬ':'ЗАКРЫТ'}</strong></button>`;
    }).join('');
    return `<div class="hero-follower-picker"><div class="hero-picker-head"><b>ВЫБЕРИ ОДНОГО ИЗ ПЯТИ</b><button type="button" data-close-follower>×</button></div>${cards}</div>`;
  }

  function render(){
    const root=document.getElementById('hero');if(!root)return;
    const s=S(),p=s.profile||{},d=derived(),name=p.displayName||s.name||'Игрок',lvl=Math.max(1,Number(s.level)||1);
    const exp=Math.max(0,Number(s.exp)||0),need=Math.max(1,Number(s.expToNext)||100),xp=Math.min(100,exp/need*100);
    const hp=Math.max(0,Number(s.hp)||0),energy=Math.max(0,Number(s.energy)||0),maxEnergy=Math.max(1,Number(s.maxEnergy)||200);
    const f=activeFollower();
    root.innerHTML=`<div class="hero-shell"><header class="hero-head"><button class="hero-back" type="button" data-screen="home">‹</button><div class="hero-head-title"><small>ПЕРСОНАЖ</small><h1>ГЕРОЙ</h1></div><div class="hero-level-badge">LV.${lvl}</div></header><div class="hero-scroll">
      <section class="hero-profile-card">${photoMarkup()}<div class="hero-profile-main"><b>${esc(name)}</b><span>${p.username?'@'+esc(p.username):'Telegram игрок'}</span><div class="hero-xp"><i style="width:${xp}%"></i></div><small>Опыт ${Math.floor(exp)} / ${Math.floor(need)}</small></div></section>
      <section class="hero-bars"><div class="hero-bar-card"><div><b>❤️ ЗДОРОВЬЕ</b><span>${Math.floor(hp)} / ${Math.floor(d.maxHp)}</span></div><i class="hp" style="--value:${Math.min(100,hp/d.maxHp*100)}%"></i></div><div class="hero-bar-card"><div><b>⚡ ЭНЕРГИЯ</b><span>${Math.floor(energy)} / ${Math.floor(maxEnergy)}</span></div><i class="energy" style="--value:${Math.min(100,energy/maxEnergy*100)}%"></i></div></section>
      <section class="hero-section"><div class="hero-section-title"><b>ХАРАКТЕРИСТИКИ</b><small>СПУТНИК УЧИТЫВАЕТСЯ В РЕАЛЬНОМ ВРЕМЕНИ</small></div><div class="hero-stats"><article><span>⚔️</span><b>${Math.floor(d.strength)}</b><small>СИЛА</small></article><article><span>🌀</span><b>${Math.floor(d.agility)}</b><small>ЛОВКОСТЬ</small></article><article><span>🛡️</span><b>${Math.floor(d.defense)}</b><small>ЗАЩИТА</small></article><article><span>➕</span><b>${Math.floor(d.bonusDamage)}</b><small>УРОН</small></article></div></section>
      <section class="hero-section"><div class="hero-section-title"><b>ЭКИПИРОВКА</b><small>7 СЛОТОВ</small></div><div class="hero-equip">${slots.map(([key,label,icon])=>{const item=equipmentFor(key),fallback=key==='weapon'?String(s.weapon||'Кулаки'):'Пусто';return `<button type="button" class="hero-equip-slot ${item?'filled':''}" data-hero-equip="${key}"><span class="hero-equip-icon">${item?.icon||icon}</span><span class="hero-equip-copy"><b>${label}</b><strong>${esc(item?.name||fallback)}</strong><small>${item?`Ур. ${Number(item.level)||1}`:'Слот свободен'}</small></span><em>›</em></button>`}).join('')}</div></section>
      <section class="hero-section hero-follower-card"><div class="hero-section-title"><b>СПУТНИК В БОЮ</b><small>ОДИН ИЗ ПЯТИ</small></div><div class="hero-follower-row"><span class="hero-follower-icon">${f?.cfg.icon||'✦'}</span><div><b>${f?esc(f.cfg.name):'Не выбран'}</b><small>${f?`${esc(f.cfg.role)} · ур.${f.data.level}`:'Выбери одного спутника'}</small></div><button type="button" data-open-follower>ВЫБРАТЬ</button></div></section>
      <section class="hero-note">Активный спутник автоматически добавляет свои характеристики к Силе, Здоровью и Защите героя.</section>
    </div><div class="hero-follower-overlay" data-follower-overlay hidden></div></div>`;
    root.querySelector('[data-open-follower]')?.addEventListener('click',()=>{const o=root.querySelector('[data-follower-overlay]');o.hidden=false;o.innerHTML=followerSelector();});
    root.querySelector('[data-follower-overlay]')?.addEventListener('click',e=>{
      if(e.target.closest('[data-close-follower]')){e.currentTarget.hidden=true;return;}
      const b=e.target.closest('[data-select-follower]');if(!b)return;
      const result=window.Followers?.select?.(b.dataset.selectFollower);
      if(result?.ok){e.currentTarget.hidden=true;render();window.TerritoryStore.render();}
    });
  }
  document.addEventListener('territory:render',()=>{if(document.getElementById('hero')?.classList.contains('active'))render();});
  document.addEventListener('DOMContentLoaded',render);
  window.HeroScreen={render,activeFollower};
})();
