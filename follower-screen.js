/* STEP-04-B — Followers screen */
(function(){
  'use strict';

  const order=['liabro','teralel','king_cows','mort','stone_face'];

  function store(){return window.TerritoryStore?.state||null;}
  function cfg(id){return window.Followers?.CATALOG?.[id]||null;}
  function data(id){return window.Followers?.get?.(id)||null;}

  function render(){
    const root=document.getElementById('followersScreen');
    if(!root||!window.Followers)return;
    const s=store();
    const active=s?.followers?.activeFollower||null;

    root.innerHTML=`
      <header class="followers-head">
        <button class="followers-back" data-screen="home">‹</button>
        <div><small>ГЕРОЙ</small><h2>СПУТНИКИ</h2></div>
        <div class="followers-count">${order.filter(id=>data(id)?.owned).length}/5</div>
      </header>
      <div class="followers-intro">
        <b>ВЫБЕРИ СВОЕГО СПУТНИКА</b>
        <span>Один активный спутник сопровождает героя в бою.</span>
      </div>
      <div class="followers-list">
        ${order.map(id=>card(id,active)).join('')}
      </div>
    `;
  }

  function card(id,active){
    const c=cfg(id), f=data(id);
    if(!c||!f)return '';
    const xpNext=window.Followers.xpToNext(f.level);
    const xpPct=f.level>=100?100:Math.min(100,Math.round((f.xp/xpNext)*100));
    const awakened=f.awakened;
    const status=!f.owned?'ЗАКРЫТ':active===id?'АКТИВЕН': 'ПОЛУЧЕН';

    return `
      <article class="follower-card ${active===id?'is-active':''} ${f.owned?'is-owned':'is-locked'}">
        <div class="follower-icon">${c.icon}</div>
        <div class="follower-main">
          <div class="follower-title">
            <div><h3>${c.name}</h3><span>${c.role}</span></div>
            <b>${status}</b>
          </div>
          <div class="follower-level">
            <span>УР. ${f.level}/100</span>
            <span>${awakened?'✦ ПРОБУЖДЁН':'Пробуждение: 50'}</span>
          </div>
          <div class="follower-xp"><i style="width:${xpPct}%"></i></div>
          <div class="follower-awakening">${c.awakening}</div>
          <div class="follower-actions">
            ${!f.owned
              ? `<button class="follower-btn follower-disabled" data-follower-action="buy" data-id="${id}">ЦЕНА БУДЕТ ЗАДАНА</button>`
              : `<button class="follower-btn ${active===id?'selected':''}" data-follower-action="select" data-id="${id}" ${active===id?'disabled':''}>${active===id?'В БОЮ':'ВЫБРАТЬ'}</button>
                 ${f.level>=50&&!awakened?`<button class="follower-btn awakening" data-follower-action="awaken" data-id="${id}">ПРОБУДИТЬ</button>`:''}`
            }
          </div>
        </div>
      </article>`;
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-follower-action]');
    if(!b)return;
    const id=b.dataset.id, action=b.dataset.followerAction;
    if(action==='buy'){
      showMessage('Цена спутников пока не зафиксирована — я не стал выдумывать стоимость.');
      return;
    }
    let result;
    if(action==='select')result=window.Followers.select(id);
    if(action==='awaken')result=window.Followers.awaken(id);
    if(result?.ok)showMessage(action==='select'?'Спутник выбран.':'Пробуждение открыто!');
    else if(result)showMessage('Действие пока недоступно.');
    render();
  });

  function showMessage(text){
    let n=document.querySelector('.followers-toast');
    if(!n){n=document.createElement('div');n.className='followers-toast';document.body.appendChild(n);}
    n.textContent=text;n.classList.add('show');
    clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('show'),2200);
  }

  document.addEventListener('territory:render',()=>{if(document.getElementById('followersScreen'))render();});
  document.addEventListener('DOMContentLoaded',render);
  window.FollowersScreen={render};
})();
