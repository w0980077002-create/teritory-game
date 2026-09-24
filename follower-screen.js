/* STEP-04-C — Followers screen with characteristics */
(function(){
  'use strict';

  const order=['liabro','teralel','king_cows','mort','stone_face'];

  function store(){return window.TerritoryStore?.state||null;}
  function cfg(id){return window.Followers?.CATALOG?.[id]||null;}
  function data(id){return window.Followers?.get?.(id)||null;}

  const statNames=[
    ['attack','АТАКА'],['defense','ЗАЩИТА'],['hp','HP'],['speed','СКОРОСТЬ'],
    ['critChance','КРИТ %'],['critDamage','КРИТ УРОН %'],['dodge','УВОРОТ %'],
    ['heal','ЛЕЧЕНИЕ'],['control','КОНТРОЛЬ %']
  ];

  function render(){
    const root=document.getElementById('followersScreen');
    if(!root||!window.Followers)return;

    const s=store();
    const active=s?.followers?.activeFollower||null;
    const ownedCount=order.filter(id=>data(id)?.owned).length;

    root.innerHTML=`
      <header class="followers-head">
        <button class="followers-back" data-screen="home">‹</button>
        <div><small>ГЕРОЙ</small><h2>СПУТНИКИ</h2></div>
        <div class="followers-count">${ownedCount}/5</div>
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

  function fmt(v){
    return Number.isInteger(v)?String(v):Number(v).toFixed(1).replace(/\.0$/,'');
  }

  function statsHtml(id){
    const stats=window.Followers.getStats(id);
    if(!stats)return '';
    return `<div class="follower-stats">
      ${statNames.filter(([key])=>stats[key]>0).map(([key,label])=>
        `<span><i>${label}</i><b>${fmt(stats[key])}</b></span>`
      ).join('')}
    </div>`;
  }

  function card(id,active){
    const c=cfg(id), f=data(id);
    if(!c||!f)return '';

    const p=window.Followers.getProgress(id);
    const awakened=f.awakened;
    const status=!f.owned?'ЗАКРЫТ':active===id?'АКТИВЕН':'ПОЛУЧЕН';

    return `
      <article class="follower-card ${active===id?'is-active':''} ${f.owned?'is-owned':'is-locked'}">
        <div class="follower-icon">${c.icon}</div>
        <div class="follower-main">
          <div class="follower-title">
            <div><h3>${c.name}</h3><span>${c.role}</span></div>
            <b>${status}</b>
          </div>

          <div class="follower-level">
            <span>УР. ${p.level}/${p.maxLevel}</span>
            <span>${awakened?'✦ ПРОБУЖДЁН':'Пробуждение: 50'}</span>
          </div>

          <div class="follower-xp"><i style="width:${p.percent}%"></i></div>
          <div class="follower-xp-text">
            ${p.level>=100?'МАКСИМАЛЬНЫЙ УРОВЕНЬ':`${p.xp} / ${p.xpToNext} XP`}
          </div>

          ${statsHtml(id)}

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
      showMessage('Цена спутников пока не зафиксирована — стоимость не выдумываем.');
      return;
    }

    let result;
    if(action==='select')result=window.Followers.select(id);
    if(action==='awaken')result=window.Followers.awaken(id);

    if(result?.ok){
      showMessage(action==='select'?'Спутник выбран.':'Пробуждение открыто!');
    }else if(result){
      showMessage('Действие пока недоступно.');
    }
    render();
  });

  function showMessage(text){
    let n=document.querySelector('.followers-toast');
    if(!n){
      n=document.createElement('div');
      n.className='followers-toast';
      document.body.appendChild(n);
    }
    n.textContent=text;
    n.classList.add('show');
    clearTimeout(n._t);
    n._t=setTimeout(()=>n.classList.remove('show'),2200);
  }

  document.addEventListener('territory:render',()=>{
    if(document.getElementById('followersScreen'))render();
  });
  document.addEventListener('DOMContentLoaded',render);
  window.FollowersScreen={render};
})();
