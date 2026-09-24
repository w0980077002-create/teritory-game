/* Territory Game — STEP-06 HERO / PROFILE / EQUIPMENT */
(function(){
  'use strict';

  const S=()=>window.TerritoryStore?.state||{};
  const save=()=>window.TerritoryStore?.saveNow?.('hero');

  const slots=[
    ['weapon','ОРУЖИЕ','⚔️'],
    ['helmet','ШЛЕМ','⛑️'],
    ['shoulders','НАПЛЕЧНИКИ','🛡️'],
    ['belt','ПОЯС','◉'],
    ['pants','ШТАНЫ','▣'],
    ['boots','САПОГИ','🥾'],
    ['ring','КОЛЬЦО','💍']
  ];

  function escapeHtml(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function activeFollower(){
    const f=window.FollowerCore?.getActive?.();
    return f||null;
  }

  function equipmentFor(slot){
    const s=S();
    const eq=Array.isArray(s.equipment)?s.equipment:[];
    return eq.find(x=>String(x?.slot||'')===slot)||null;
  }

  function photoMarkup(){
    const p=S().profile||{};
    if(p.photoUrl){
      const url=String(p.photoUrl).replace(/"/g,'%22');
      return `<div class="hero-avatar" style="background-image:url("${url}")"><span></span></div>`;
    }
    return '<div class="hero-avatar hero-avatar-fallback">⚔️</div>';
  }

  function render(){
    const root=document.getElementById('hero');
    if(!root)return;
    const s=S(),p=s.profile||{},name=p.displayName||s.name||'Игрок';
    const lvl=Math.max(1,Number(s.level)||1);
    const exp=Math.max(0,Number(s.exp)||0);
    const need=Math.max(1,Number(s.expToNext)||100);
    const xp=Math.max(0,Math.min(100,exp/need*100));
    const hp=Math.max(0,Number(s.hp)||0),maxHp=Math.max(1,Number(s.maxHp)||1);
    const energy=Math.max(0,Number(s.energy)||0),maxEnergy=Math.max(1,Number(s.maxEnergy)||1);
    const follower=activeFollower();
    const followerText=follower?`${escapeHtml(follower.name)} · Lv.${Number(follower.level)||1}`:'Не выбран';

    root.innerHTML=`
      <div class="hero-shell">
        <header class="hero-head">
          <button class="hero-back" type="button" data-screen="home" aria-label="Назад">‹</button>
          <div class="hero-head-title"><small>ПЕРСОНАЖ</small><h1>ГЕРОЙ</h1></div>
          <div class="hero-level-badge">LV.${lvl}</div>
        </header>

        <div class="hero-scroll">
          <section class="hero-profile-card">
            ${photoMarkup()}
            <div class="hero-profile-main">
              <b>${escapeHtml(name)}</b>
              <span>${p.username?'@'+escapeHtml(p.username):'Telegram игрок'}</span>
              <div class="hero-xp"><i style="width:${xp}%"></i></div>
              <small>Опыт ${Math.floor(exp)} / ${Math.floor(need)}</small>
            </div>
          </section>

          <section class="hero-bars">
            <div class="hero-bar-card"><div><b>❤️ ЗДОРОВЬЕ</b><span>${Math.floor(hp)} / ${Math.floor(maxHp)}</span></div><i class="hp" style="--value:${Math.max(0,Math.min(100,hp/maxHp*100))}%"></i></div>
            <div class="hero-bar-card"><div><b>⚡ ЭНЕРГИЯ</b><span>${Math.floor(energy)} / ${Math.floor(maxEnergy)}</span></div><i class="energy" style="--value:${Math.max(0,Math.min(100,energy/maxEnergy*100))}%"></i></div>
          </section>

          <section class="hero-section">
            <div class="hero-section-title"><b>ХАРАКТЕРИСТИКИ</b><small>ТЕКУЩИЕ ЗНАЧЕНИЯ</small></div>
            <div class="hero-stats">
              <article><span>⚔️</span><b>${Math.floor(Number(s.strength)||0)}</b><small>СИЛА</small></article>
              <article><span>🌀</span><b>${Math.floor(Number(s.agility)||0)}</b><small>ЛОВКОСТЬ</small></article>
              <article><span>🛡️</span><b>${Math.floor(Number(s.defense)||0)}</b><small>ЗАЩИТА</small></article>
              <article><span>➕</span><b>${Math.floor(Number(s.bonusDamage)||0)}</b><small>УРОН ОРУЖИЯ</small></article>
            </div>
          </section>

          <section class="hero-section">
            <div class="hero-section-title"><b>ЭКИПИРОВКА</b><small>7 СЛОТОВ</small></div>
            <div class="hero-equip">
              ${slots.map(([key,label,icon])=>{
                const item=equipmentFor(key);
                const fallback=key==='weapon'?String(s.weapon||'Кулаки'):'Пусто';
                const itemName=item?.name||fallback;
                const val=key==='weapon' ? `Урон +${Math.floor(Number(item?.damage??s.bonusDamage)||0)}` : (item?`Ур. ${Math.floor(Number(item.level)||1)}`:'Слот свободен');
                return `<button type="button" class="hero-equip-slot ${item?'filled':''}" data-hero-equip="${key}">
                  <span class="hero-equip-icon">${item?.icon||icon}</span>
                  <span class="hero-equip-copy"><b>${escapeHtml(label)}</b><strong>${escapeHtml(itemName)}</strong><small>${escapeHtml(val)}</small></span>
                  <em>›</em>
                </button>`;
              }).join('')}
            </div>
          </section>

          <section class="hero-section hero-follower-card">
            <div class="hero-section-title"><b>СПУТНИК В БОЮ</b><small>АКТИВНЫЙ</small></div>
            <div class="hero-follower-row">
              <span class="hero-follower-icon">${follower?.icon||'⚔️'}</span>
              <div><b>${followerText}</b><small>${follower?escapeHtml(follower.specialAbility||'Способность'): 'Открой экран спутников и выбери одного'}</small></div>
              <button type="button" data-screen="followersScreen">ОТКРЫТЬ</button>
            </div>
          </section>

          <section class="hero-note">Все значения берутся из <b>TerritoryStore.state</b>. Экран не создаёт отдельную копию прогресса.</section>
        </div>
      </div>`;

    root.querySelectorAll('[data-hero-equip]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const slot=btn.dataset.heroEquip;
        const item=equipmentFor(slot);
        const title=slots.find(x=>x[0]===slot)?.[1]||slot;
        if(item) window.alert?.(`${title}: ${item.name||'Предмет'}`);
        else if(slot==='weapon') window.ForgeV2?.open?.();
        else window.alert?.(`${title}: слот пока пуст.`);
      });
    });
  }

  document.addEventListener('territory:render',()=>{
    if(document.getElementById('hero')?.classList.contains('active'))render();
  });
  document.addEventListener('DOMContentLoaded',render);
  window.HeroScreen={render,save};
})();