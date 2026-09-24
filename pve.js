/* Territory Game — STEP-05-A
   PvE city/ district progression. Battle engine comes in STEP-05-B.
   All persistent values are stored through TerritoryStore.
*/
(function(){
  'use strict';
  const S=()=>window.TerritoryStore?.state||{};
  const save=(reason)=>window.TerritoryStore?.saveNow?.(reason||'pve');
  const districts=[
    {id:'harbor',name:'ПОРТ',icon:'⚓',desc:'Контрабандисты, наёмники и морские рейдеры.',req:1,energy:8,coins:90,xp:18},
    {id:'walls',name:'СЕВЕРНЫЕ СТЕНЫ',icon:'🛡️',desc:'Дозорные и тяжёлые воины у городских стен.',req:2,energy:10,coins:125,xp:25},
    {id:'quarter',name:'ЦЕНТРАЛЬНЫЙ КВАРТАЛ',icon:'🏰',desc:'Сильные противники охраняют богатые кварталы.',req:3,energy:12,coins:170,xp:34},
    {id:'old-town',name:'СТАРЫЙ ГОРОД',icon:'🏚️',desc:'Опасные бойцы и первые элитные враги.',req:5,energy:15,coins:240,xp:48},
    {id:'fortress',name:'КРЕПОСТЬ',icon:'👑',desc:'Элитная стража и босс района.',req:8,energy:20,coins:350,xp:70}
  ];
  const enemies={
    harbor:['Портовый головорез','Контрабандист','Морской рейдер'],
    walls:['Дозорный стены','Северный воин','Щитоносец'],
    quarter:['Городской наёмник','Варяжский страж','Капитан квартала'],
    'old-town':['Разбойник','Теневой боец','Старший наёмник'],
    fortress:['Элитный страж','Командир крепости','Ярл крепости']
  };
  function ensure(){
    const s=S();
    s.pve=s.pve&&typeof s.pve==='object'?s.pve:{};
    s.pve.districts=s.pve.districts&&typeof s.pve.districts==='object'?s.pve.districts:{};
    s.pve.current=''+(s.pve.current||'harbor');
    districts.forEach((d,i)=>{
      const x=s.pve.districts[d.id];
      if(!x)s.pve.districts[d.id]={wins:0,stars:0,bossDefeated:false,unlocked:i===0};
      else x.unlocked=Boolean(x.unlocked)||(i===0);
    });
    unlockByLevel();
  }
  function unlockByLevel(){
    const s=S(); const lv=Math.max(1,Number(s.level)||1);
    districts.forEach(d=>{if(lv>=d.req)s.pve.districts[d.id].unlocked=true;});
  }
  function render(){
    ensure();
    const root=document.getElementById('districts'); if(!root)return;
    const s=S(), lv=Math.max(1,Number(s.level)||1), active=s.pve.current;
    root.innerHTML=`
      <header class="pve-head">
        <button class="back" data-screen="home">‹</button>
        <div><small>ГОРОД</small><h2>РАЙОНЫ</h2></div>
        <div class="pve-wallet">⚡ ${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}</div>
      </header>
      <div class="pve-intro">
        <div><span>🏙️</span><div><b>ГОРОД</b><small>Открывай районы, побеждай врагов и забирай награды.</small></div></div>
        <strong>Lv.${lv}</strong>
      </div>
      <div class="pve-map">${districts.map(d=>{
        const st=s.pve.districts[d.id]||{}, unlocked=!!st.unlocked;
        return `<button class="pve-district ${unlocked?'':'locked'} ${active===d.id?'selected':''}" data-pve-district="${d.id}" ${unlocked?'':'disabled'}>
          <span class="pve-icon">${unlocked?d.icon:'🔒'}</span>
          <span class="pve-copy"><b>${d.name}</b><small>${unlocked?d.desc:`Открывается с уровня ${d.req}`}</small><em>${unlocked?`Победы ${st.wins||0} · ⭐ ${st.stars||0}/3`:`Требуется Lv.${d.req}`}</em></span>
          <i>›</i>
        </button>`;
      }).join('')}</div>
      <div class="pve-panel">${districtPanel(active)}</div>`;
  }
  function districtPanel(id){
    const d=districts.find(x=>x.id===id)||districts[0], s=S(), st=s.pve.districts[d.id];
    const en=Math.floor(s.energy||0), can=en>=d.energy;
    const names=enemies[d.id]||enemies.harbor;
    return `<div class="pve-selected">
      <div class="pve-selected-title"><span>${d.icon}</span><div><small>РАЙОН</small><h3>${d.name}</h3></div></div>
      <p>${d.desc}</p>
      <div class="pve-enemies">${names.map((n,i)=>`<div><b>${i===2?'👑':'⚔️'}</b><span>${n}</span><small>Уровень ${Math.max(1,(Number(s.level)||1)+i)}</small></div>`).join('')}</div>
      <div class="pve-reward-row"><span>⚡ ${d.energy}</span><span>🪙 +${d.coins}</span><span>✨ +${d.xp} XP</span></div>
      <button class="pve-start" data-pve-start="${d.id}" ${can?'':'disabled'}>⚔️ НАЧАТЬ РАЗВЕДКУ</button>
      ${can?'':`<small class="pve-warn">Недостаточно энергии. Нужно ещё ${d.energy-en}.</small>`}
      <div class="pve-progress">Победы: <b>${st.wins||0}</b> · Босс: <b>${st.bossDefeated?'побеждён':'не побеждён'}</b></div>
    </div>`;
  }
  function start(id){
    ensure();
    const d=districts.find(x=>x.id===id),s=S(); if(!d||!s.pve.districts[id]?.unlocked)return;
    if(Number(s.energy||0)<d.energy){render();return;}
    s.pve.current=id;
    s.energy=Math.max(0,Number(s.energy||0)-d.energy);
    const st=s.pve.districts[id]; st.wins=(Number(st.wins)||0)+1; st.stars=Math.min(3,Math.floor(st.wins/3));
    if(st.wins>=3)st.bossDefeated=true;
    s.coins=Math.max(0,Number(s.coins||0)+d.coins);
    s.exp=Math.max(0,Number(s.exp||0)+d.xp);
    save('pve-scout');
    window.TerritoryStore?.render?.();
    render();
    showResult(d);
  }
  function showResult(d){
    const layer=document.createElement('div');layer.className='pve-result';
    layer.innerHTML=`<div class="pve-result-card"><span>${d.icon}</span><small>РАЗВЕДКА ЗАВЕРШЕНА</small><h2>${d.name}</h2><b>⚔️ Победа засчитана</b><div><span>🪙 +${d.coins}</span><span>✨ +${d.xp} XP</span><span>⚡ −${d.energy}</span></div><button data-pve-close>ПРОДОЛЖИТЬ</button></div>`;
    document.body.appendChild(layer);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-pve-district]'); if(b){ensure();S().pve.current=b.dataset.pveDistrict;save('pve-select');render();return;}
    const startBtn=e.target.closest?.('[data-pve-start]'); if(startBtn){start(startBtn.dataset.pveStart);return;}
    if(e.target.closest?.('[data-pve-close]'))document.querySelector('.pve-result')?.remove();
  });
  document.addEventListener('territory:render',()=>{if(document.getElementById('districts')?.classList.contains('active'))render();});
  document.addEventListener('DOMContentLoaded',()=>{ensure();});
  window.PvEGame={open:render,render,ensure,districts};
})();