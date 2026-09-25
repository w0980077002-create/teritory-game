/* Territory Game — mobile navigation fix 10004 */
(function(){
  'use strict';

  const navItems=[
    ['home','Город','⌂'],
    ['inventory','Инвентарь','🎒'],
    ['hero','Герой','⚔'],
    ['battle','Бой','⚔️'],
    ['districts','Квесты','📜'],
    ['casino','Игры','🎲'],
    ['clan','Клан','🛡']
  ];

  function go(id){
    if(id==='battle'){
      window.HomeRebuild?.startRunner?.(false);
      return;
    }
    if(id==='clan'){
      let m=document.getElementById('mobileFeatureModal');
      if(!m){
        m=document.createElement('div');
        m.id='mobileFeatureModal';
        m.innerHTML='<div class="mobile-feature-card"><button type="button" data-mf-close>×</button><b>КЛАН</b><span>Раздел в разработке.</span><button type="button" data-mf-close>ОК</button></div>';
        document.body.appendChild(m);
      }
      m.classList.add('show');
      return;
    }
    window.showScreen?.(id);
  }

  function mount(){
    if(document.getElementById('mobileGlobalNav')) return;

    const nav=document.createElement('nav');
    nav.id='mobileGlobalNav';
    nav.setAttribute('aria-label','Главная навигация');
    nav.innerHTML=navItems.map(([id,label,icon])=>
      `<button type="button" data-mobile-nav="${id}"><i>${icon}</i><span>${label}</span></button>`
    ).join('');
    document.body.appendChild(nav);

    const back=document.createElement('button');
    back.id='mobileBack';
    back.type='button';
    back.setAttribute('aria-label','Назад');
    back.textContent='‹';
    document.body.appendChild(back);

    nav.addEventListener('click',e=>{
      const b=e.target.closest('[data-mobile-nav]');
      if(!b)return;
      e.preventDefault();
      e.stopPropagation();
      go(b.dataset.mobileNav);
    },true);

    back.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      window.showScreen?.('home');
    },true);

    document.addEventListener('click',e=>{
      const close=e.target.closest('[data-mf-close]');
      if(close){
        document.getElementById('mobileFeatureModal')?.classList.remove('show');
      }
    },true);

    sync();
  }

  function sync(){
    const current=document.body.dataset.screen||document.documentElement.dataset.screen||'home';
    const nav=document.getElementById('mobileGlobalNav');
    const back=document.getElementById('mobileBack');
    if(!nav||!back)return;
    const home=current==='home';
    nav.classList.toggle('home-mode',home);
    back.classList.toggle('show',!home);
    nav.querySelectorAll('[data-mobile-nav]').forEach(b=>{
      const id=b.dataset.mobileNav;
      b.classList.toggle('active',id===current || (current==='hero'&&id==='hero') || (current==='inventory'&&id==='inventory'));
    });
  }

  const original=window.showScreen;
  if(typeof original==='function'){
    window.showScreen=function(id){
      original(id);
      requestAnimationFrame(sync);
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    mount();
    setTimeout(sync,50);
  });
  document.addEventListener('territory:render',sync);
  window.addEventListener('popstate',()=>window.showScreen?.('home'));
})();
