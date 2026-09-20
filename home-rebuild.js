/* Territory — Home Rebuild v1
   Real HTML controls over a clean city composition.
   Does not depend on coordinate hit-testing or baked buttons.
*/
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function go(id){
    if(typeof window.showScreen==='function') window.showScreen(id);
    else {
      $$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
    }
  }

  function modal(title,body,actions){
    const old=$('#homeRebuildModal'); if(old) old.remove();
    const m=document.createElement('div'); m.id='homeRebuildModal'; m.className='hr-modal';
    const buttons=(actions||[{id:'close',text:'Закрыть'}]).map(a=>`<button type="button" data-hr-act="${a.id}">${a.text}</button>`).join('');
    m.innerHTML=`<div class="hr-modal-card" role="dialog" aria-modal="true"><button class="hr-modal-x" type="button" data-hr-act="close">×</button><div class="hr-modal-icon">${title.icon||'✦'}</div><h3>${title.text||title}</h3><div class="hr-modal-body">${body}</div><div class="hr-modal-actions">${buttons}</div></div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{const a=e.target.closest('[data-hr-act]');if(!a)return;if(a.dataset.hrAct==='close'||a.dataset.hrAct==='ok')m.remove();});
    m.addEventListener('click',e=>{if(e.target===m)m.remove();});
    return m;
  }

  function dailyBonus(){
    const key='territory_daily_bonus_v1';
    const today=new Date().toISOString().slice(0,10);
    if(localStorage.getItem(key)===today){
      modal({icon:'🎁',text:'Ежедневный бонус'},'<p>Бонус на сегодня уже получен.</p><p class="hr-muted">Возвращайся завтра.</p>');
      return;
    }
    try{
      const st=window.TerritoryStore&&window.TerritoryStore.state;
      if(st){ st.coins=(Number(st.coins)||0)+100; st.gems=(Number(st.gems)||0)+1; st.energy=Math.min(200,(Number(st.energy)||0)+10); localStorage.setItem('territory_save_v1',JSON.stringify(st)); }
    }catch(e){}
    localStorage.setItem(key,today);
    const m=modal({icon:'🎁',text:'Бонус получен'},'<div class="hr-reward"><b>+100 🪙</b><b>+1 💎</b><b>+10 ⚡</b></div><p>Награды добавлены в профиль.</p>');
    setTimeout(()=>m&&m.remove(),3200);
    sync();
  }

  function gameHall(){
    const games=[
      ['🎲','Монополия','Поля, броски и награды','open-monopoly'],
      ['⚄','Dice','Быстрый бросок кубика','soon'],
      ['🍀','Luck','Риск ради редкой награды','soon'],
      ['🃏','Cards','Карточные испытания','soon'],
      ['🎯','Стрельбище','Попади в мишень','soon']
    ];
    const m=modal({icon:'🎮',text:'Игровой зал'},`<div class="hr-games">${games.map(g=>`<button class="hr-game-card" type="button" data-game="${g[3]}"><span>${g[0]}</span><b>${g[1]}</b><small>${g[2]}</small></button>`).join('')}</div>`);
    m.addEventListener('click',e=>{
      const b=e.target.closest('[data-game]'); if(!b)return;
      if(b.dataset.game==='open-monopoly'){m.remove();go('game');return;}
      modal({icon:'🔒',text:b.querySelector('b')?.textContent||'Игра'},'<p>Эта игра входит в игровой зал и подключается следующим этапом.</p><p class="hr-muted">Сейчас доступна Монополия.</p>');
    });
  }

  function resources(kind){
    const el=kind==='coins'?$('#coins'):$('#gems');
    const val=el?el.textContent:'0';
    modal({icon:kind==='coins'?'🪙':'💎',text:kind==='coins'?'Монеты':'Кристаллы'},`<div class="hr-big-number">${val}</div><p>Ресурс синхронизируется с текущим сохранением игры.</p>`);
  }

  function vip(){
    modal({icon:'👑',text:'VIP'},'<p>VIP-бонусы будут подключены к общей системе прогресса.</p><ul><li>автоматические ходы в предусмотренных режимах;</li><li>дополнительные бонусы;</li><li>косметические возможности.</li></ul>');
  }

  function action(name){
    switch(name){
      case 'profile': go('inventory'); break;
      case 'coins': resources('coins'); break;
      case 'gems': resources('gems'); break;
      case 'energy': modal({icon:'⚡',text:'Энергия'},'<div class="hr-big-number">'+($('#energyValue')?.textContent||$('#energy')?.textContent||'100')+'</div><p>Энергия расходуется в игровых активностях и восстанавливается со временем.</p>'); break;
      case 'quest': go('districts'); break;
      case 'bonus': dailyBonus(); break;
      case 'events': go('districts'); break;
      case 'vip': vip(); break;
      case 'game': gameHall(); break;
      case 'arena': go('arena'); break;
      case 'blacksmith': go('market'); break;
      case 'tavern': go('districts'); break;
      case 'shop': go('market'); break;
      default: break;
    }
  }

  function sync(){
    const st=window.TerritoryStore&&window.TerritoryStore.state;
    const coins=$('#coins')?.textContent||st?.coins||'1000';
    const gems=$('#gems')?.textContent||st?.gems||'25';
    const level=$('#level')?.textContent||st?.level||'1';
    const name=st?.name||$('#playerName')?.textContent||'SSS';
    const hp=Number(st?.hp??120), max=Number(st?.maxHp??120);
    $$('[data-hr-coins]').forEach(x=>x.textContent=coins);
    $$('[data-hr-gems]').forEach(x=>x.textContent=gems);
    $$('[data-hr-level]').forEach(x=>x.textContent=level);
    $$('[data-hr-name]').forEach(x=>x.textContent=name);
    const hpText=`${hp}/${max}`; $$('[data-hr-hp-text]').forEach(x=>x.textContent=hpText);
    $$('[data-hr-hp]').forEach(x=>x.style.width=Math.max(0,Math.min(100,hp/max*100))+'%');
    $$('[data-hr-energy]').forEach(x=>x.textContent=st?.energy??100);
  }

  function mount(){
    const home=$('#home'); if(!home||$('#homeRebuild'))return;
    home.classList.add('home-rebuild-host');
    home.innerHTML=`
      <div id="homeRebuild" class="home-rebuild" aria-label="Город Сдоларс">
        <img class="hr-bg" src="sdolars_home_bg.png" alt="Город Сдоларс">
        <div class="hr-vignette"></div>
        <header class="hr-top">
          <button class="hr-profile" type="button" data-hr="profile">
            <span class="hr-avatar">⚔️</span>
            <span class="hr-player"><b data-hr-name>SSS</b><small>Уровень <strong data-hr-level>1</strong></small><i><em data-hr-hp style="width:100%"></em></i><small data-hr-hp-text>120/120</small></span>
          </button>
          <div class="hr-resources">
            <button type="button" class="hr-resource" data-hr="coins" aria-label="Монеты">🪙 <b data-hr-coins>1000</b></button>
            <button type="button" class="hr-resource" data-hr="gems" aria-label="Кристаллы">💎 <b data-hr-gems>25</b></button>
            <button type="button" class="hr-resource" data-hr="energy" aria-label="Энергия">⚡ <b data-hr-energy>100</b></button>
          </div>
        </header>

        <div class="hr-quest glass-card" data-hr="quest">
          <div class="hr-icon">📜</div><div><small>ТЕКУЩЕЕ ЗАДАНИЕ</small><b>Поговори с кузнецом</b><span>Открыть район кузницы →</span></div>
        </div>

        <button class="hr-daily glass-card" type="button" data-hr="bonus"><span>🎁</span><div><small>ЕЖЕДНЕВНЫЙ БОНУС</small><b>Забрать награду</b></div></button>

        <div class="hr-left">
          <button type="button" data-hr="game"><span>🎮</span><b>Игровой зал</b><small>5 игр</small></button>
          <button type="button" data-hr="events"><span>📅</span><b>События</b><small>Город</small></button>
          <button type="button" data-hr="vip"><span>👑</span><b>VIP</b><small>Бонусы</small></button>
        </div>
        <div class="hr-right">
          <button type="button" data-hr="arena"><span>🏟️</span><b>Арена</b><small>PvP</small></button>
          <button type="button" data-hr="blacksmith"><span>⚒️</span><b>Кузница</b><small>Экипировка</small></button>
          <button type="button" data-hr="shop"><span>🛒</span><b>Магазин</b><small>Предметы</small></button>
        </div>

        <div class="hr-hero-card">
          <span class="hr-hero-mark">♛</span><div><b>Твой герой</b><small>Сдоларс ждёт твоего пути</small></div><button type="button" data-hr="profile">Профиль →</button>
        </div>

        <div class="hr-scene-label">SDOLARS · ЦЕНТРАЛЬНЫЙ КВАРТАЛ</div>
      </div>`;
    const dispatch=(e)=>{
      const b=e.target&&e.target.closest?e.target.closest('[data-hr]'):null;
      if(!b||!home.contains(b))return;
      e.preventDefault();
      e.stopPropagation();
      action(b.dataset.hr);
    };
    home.addEventListener('click',dispatch);
    home.addEventListener('pointerup',dispatch,true);
    home.addEventListener('touchend',dispatch,{capture:true,passive:false});
    sync();
    setInterval(sync,1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
