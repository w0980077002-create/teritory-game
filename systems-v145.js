/* Territory v145 — progression systems, daily reward, achievements, hunger, durability, attributes, reward history.
   Deliberately isolated from Arena UI. Bots remain enabled in Arena for testing. */
(()=>{
  const KEY='territory_systems_v145';
  const today=()=>new Date().toISOString().slice(0,10);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  let meta=read();
  meta.hunger=Math.max(0,Math.min(100,Number(meta.hunger??100)||0));
  meta.durability=Math.max(0,Math.min(300,Number(meta.durability??300)||0));
  meta.freePoints=Math.max(0,Number(meta.freePoints??0)||0);
  meta.battles=Math.max(0,Number(meta.battles??0)||0);
  meta.wins=Math.max(0,Number(meta.wins??0)||0);
  meta.losses=Math.max(0,Number(meta.losses??0)||0);
  meta.lastLogin=String(meta.lastLogin||'');
  meta.lastReward=String(meta.lastReward||'');
  meta.streak=Math.max(0,Number(meta.streak??0)||0);
  meta.achievements=Array.isArray(meta.achievements)?meta.achievements:[];
  meta.history=Array.isArray(meta.history)?meta.history:[];
  meta.lastLevel=Math.max(1,Number(meta.lastLevel??state.level??1)||1);

  function persist(){try{localStorage.setItem(KEY,JSON.stringify(meta))}catch(e){}}
  function addHistory(icon,text){
    meta.history.unshift({icon,text,at:Date.now()});
    meta.history=meta.history.slice(0,30);
  }
  function levelSync(){
    const lv=Math.max(1,Number(state.level||1));
    if(lv>meta.lastLevel){
      meta.freePoints += lv-meta.lastLevel;
      addHistory('⭐',`Новые очки характеристик: +${lv-meta.lastLevel}`);
      meta.lastLevel=lv;
      persist();
    }
  }
  function dailyInit(){
    const d=today();
    if(meta.lastLogin!==d){
      const prev=new Date(Date.now()-86400000).toISOString().slice(0,10);
      meta.streak=meta.lastLogin===prev?meta.streak+1:1;
      meta.lastLogin=d;
      addHistory('📅',`Вход в игру · серия ${meta.streak} дн.`);
      persist();
    }
  }
  dailyInit();
  levelSync();

  const achievements=[
    {id:'first_battle',icon:'⚔️',title:'Первый бой',desc:'Завершить первый бой',test:()=>meta.battles>=1,reward:()=>{state.coins+=75}},
    {id:'first_win',icon:'🏆',title:'Первая победа',desc:'Победить в Arena',test:()=>meta.wins>=1,reward:()=>{state.gems+=3}},
    {id:'three_battles',icon:'🔥',title:'Три боя',desc:'Завершить 3 боя',test:()=>meta.battles>=3,reward:()=>{state.coins+=150}},
    {id:'five_wins',icon:'👑',title:'Пять побед',desc:'Одержать 5 побед',test:()=>meta.wins>=5,reward:()=>{meta.freePoints+=1}},
    {id:'seven_days',icon:'📅',title:'Неделя в Sdolars',desc:'Серия входов 7 дней',test:()=>meta.streak>=7,reward:()=>{state.gems+=7}}
  ];
  function checkAchievements(){
    const fresh=[];
    for(const a of achievements){
      if(!meta.achievements.includes(a.id)&&a.test()){
        meta.achievements.push(a.id);
        a.reward();
        addHistory(a.icon,`Достижение «${a.title}» · награда получена`);
        fresh.push(a.title);
      }
    }
    if(fresh.length){
      persist();
      window.save?.();
      setTimeout(()=>window.territorySystems.toast?.(`🏆 ${fresh.join(' · ')}`),50);
    }
  }

  function ensurePanel(){
    const inv=document.getElementById('inventory');
    if(!inv)return;
    if(document.getElementById('systems145'))return;
    const wrap=document.createElement('div');
    wrap.id='systems145';
    wrap.innerHTML=`
      <section class="sys145-card sys145-status">
        <div class="sys145-head"><b>⚔️ ПРОГРЕСС ПЕРСОНАЖА</b><small>v145</small></div>
        <div class="sys145-bars">
          <div><span>🍖 Голод</span><b id="sysHungerValue">100%</b><i><em id="sysHungerBar"></em></i></div>
          <div><span>🛡️ Прочность экипировки</span><b id="sysDurabilityValue">300/300</b><i><em id="sysDurabilityBar"></em></i></div>
        </div>
        <div class="sys145-actions"><button id="sysEatBtn">🍖 Поесть · 20 🪙</button><button id="sysRepairBtn">🔧 Полный ремонт</button></div>
      </section>
      <section class="sys145-card">
        <div class="sys145-head"><b>📈 ХАРАКТЕРИСТИКИ</b><small>Очки: <strong id="sysPoints">0</strong></small></div>
        <div class="sys145-stats">
          <div><span>⚔️ Сила</span><b id="sysStr">0</b><button data-stat="strength">+</button></div>
          <div><span>🏃 Ловкость</span><b id="sysAgi">0</b><button data-stat="agility">+</button></div>
          <div><span>🛡️ Защита</span><b id="sysDef">0</b><button data-stat="defense">+</button></div>
        </div>
      </section>
      <section class="sys145-card">
        <div class="sys145-head"><b>🎁 ЕЖЕДНЕВНАЯ НАГРАДА</b><small id="sysStreak">Серия 1 дн.</small></div>
        <div class="sys145-daily"><span>🪙 +100</span><span>💎 +2</span><button id="sysDailyBtn">ПОЛУЧИТЬ</button></div>
      </section>
      <section class="sys145-card">
        <div class="sys145-head"><b>🏆 ДОСТИЖЕНИЯ</b><small id="sysAchCount">0/0</small></div>
        <div id="sysAchievements" class="sys145-achievements"></div>
      </section>
      <section class="sys145-card">
        <div class="sys145-head"><b>📜 ИСТОРИЯ НАГРАД</b><small>последние 8</small></div>
        <div id="sysHistory" class="sys145-history"></div>
      </section>`;
    inv.appendChild(wrap);
    wrap.querySelector('#sysEatBtn').onclick=eat;
    wrap.querySelector('#sysRepairBtn').onclick=repair;
    wrap.querySelector('#sysDailyBtn').onclick=claimDaily;
    wrap.querySelectorAll('[data-stat]').forEach(b=>b.onclick=()=>spendPoint(b.dataset.stat));
  }

  function render(){
    levelSync(); ensurePanel();
    const hunger=meta.hunger,dur=meta.durability;
    const set=(id,v)=>{const x=document.getElementById(id);if(x)x.textContent=v};
    set('sysHungerValue',`${hunger}%`);
    set('sysDurabilityValue',`${dur}/300`);
    set('sysPoints',meta.freePoints);
    set('sysStr',state.strength||0);set('sysAgi',state.agility||0);set('sysDef',state.defense||0);
    const hb=document.getElementById('sysHungerBar'),db=document.getElementById('sysDurabilityBar');
    if(hb)hb.style.width=hunger+'%';if(db)db.style.width=(dur/3)+'%';
    const daily=document.getElementById('sysDailyBtn');
    if(daily){daily.disabled=meta.lastReward===today();daily.textContent=daily.disabled?'ПОЛУЧЕНО СЕГОДНЯ':'ПОЛУЧИТЬ +100 🪙';}
    set('sysStreak',`Серия ${meta.streak} дн.`);
    const ac=document.getElementById('sysAchCount');if(ac)ac.textContent=`${meta.achievements.length}/${achievements.length}`;
    const al=document.getElementById('sysAchievements');
    if(al)al.innerHTML=achievements.map(a=>`<div class="sys145-ach ${meta.achievements.includes(a.id)?'done':''}"><span>${a.icon}</span><div><b>${esc(a.title)}</b><small>${esc(a.desc)}</small></div><strong>${meta.achievements.includes(a.id)?'✓':'·'}</strong></div>`).join('');
    const hl=document.getElementById('sysHistory');
    if(hl)hl.innerHTML=meta.history.slice(0,8).map(h=>`<div><span>${h.icon}</span><b>${esc(h.text)}</b><small>${new Date(h.at).toLocaleDateString('ru-RU')}</small></div>`).join('')||'<p>Наград пока нет.</p>';
    const rb=document.getElementById('sysRepairBtn');
    if(rb){const missing=300-dur;rb.disabled=missing<=0||Number(state.coins||0)<missing*2;rb.textContent=missing>0?`🔧 Ремонт · ${missing*2} 🪙`:'✓ Экипировка исправна';}
  }

  function eat(){
    if(meta.hunger>=100){toast('Голод уже 100%');return}
    if(Number(state.coins||0)<20){toast('Не хватает 20 монет');return}
    state.coins-=20;meta.hunger=Math.min(100,meta.hunger+20);addHistory('🍖','Питание · +20% голода');persist();window.save?.();render();toast('🍖 Голод восстановлен');
  }
  function repair(){
    const missing=300-meta.durability,cost=missing*2;
    if(!missing){toast('Экипировка уже полностью исправна');return}
    if(Number(state.coins||0)<cost){toast(`Нужно ${cost} 🪙 на ремонт`);return}
    state.coins-=cost;meta.durability=300;addHistory('🔧',`Полный ремонт экипировки · −${cost} 🪙`);persist();window.save?.();render();toast('🔧 Экипировка отремонтирована');
  }
  function spendPoint(stat){
    if(meta.freePoints<=0){toast('Нет свободных очков');return}
    if(!['strength','agility','defense'].includes(stat))return;
    state[stat]=Number(state[stat]||0)+1;meta.freePoints--;addHistory('📈',`Характеристика повышена: ${stat}`);persist();window.save?.();render();
  }
  function claimDaily(){
    const d=today();if(meta.lastReward===d){toast('Награда уже получена сегодня');return}
    const bonus=Math.min(150,100+Math.max(0,meta.streak-1)*10);
    state.coins=Number(state.coins||0)+bonus;state.gems=Number(state.gems||0)+2;meta.lastReward=d;
    addHistory('🎁',`Ежедневная награда · +${bonus} 🪙 · +2 💎`);persist();window.save?.();checkAchievements();render();toast(`🎁 +${bonus} 🪙 · +2 💎`);
  }
  function onBattleTurn(){
    meta.durability=Math.max(0,meta.durability-1);
    addHistory('🛡️','Экипировка потеряла 1 прочность');
    persist();render();
  }
  function onBattleFinished(result){
    meta.battles++;
    if(result==='Победа')meta.wins++;
    if(result==='Поражение'){meta.losses++;meta.hunger=Math.max(0,meta.hunger-5);addHistory('🍖','Поражение · −5% голода')}
    checkAchievements();persist();render();
  }
  function toast(text){
    const t=document.getElementById('arenaToast');
    if(t){t.textContent=text;t.classList.add('show');clearTimeout(window.__sys145Toast);window.__sys145Toast=setTimeout(()=>t.classList.remove('show'),1800)}
  }
  window.territorySystems={render,onBattleTurn,onBattleFinished,toast,claimDaily};
  document.addEventListener('click',e=>{if(e.target.closest('[data-screen="inventory"]'))setTimeout(render,0)});
  setInterval(render,2000);
  setTimeout(render,0);
})();