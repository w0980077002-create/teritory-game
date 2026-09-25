/* HOME button routing fix 10003 */
(function(){
  'use strict';

  function feature(title, text){
    let m=document.getElementById('homeFeatureModal');
    if(!m){
      m=document.createElement('div');
      m.id='homeFeatureModal';
      m.className='home-feature-modal';
      m.innerHTML='<div class="home-feature-card"><button type="button" class="home-feature-close" data-feature-close>×</button><div class="home-feature-title"></div><div class="home-feature-text"></div><button type="button" class="home-feature-action" data-feature-close>ОК</button></div>';
      document.body.appendChild(m);
      const s=document.createElement('style');
      s.textContent='.home-feature-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.68)}.home-feature-modal.show{display:flex}.home-feature-card{position:relative;width:min(92vw,380px);padding:28px 22px 22px;border:1px solid rgba(232,199,107,.55);border-radius:18px;background:linear-gradient(145deg,#142d3b,#07131d);box-shadow:0 18px 60px rgba(0,0,0,.65);text-align:center}.home-feature-close{position:absolute;right:10px;top:8px;width:36px;height:36px;border:0;background:transparent;font-size:28px;color:#fff}.home-feature-title{font-size:20px;font-weight:900;color:#e8c76b;margin-bottom:12px}.home-feature-text{font-size:14px;line-height:1.45;color:#d8e0e5;margin-bottom:20px}.home-feature-action{min-width:120px;padding:11px 18px;border:1px solid #b99548;border-radius:10px;background:linear-gradient(#e8c76b,#a97b22);color:#171008;font-weight:900}';
      document.head.appendChild(s);
    }
    m.querySelector('.home-feature-title').textContent=title;
    m.querySelector('.home-feature-text').textContent=text;
    m.classList.add('show');
  }

  const route={
    home:()=>window.showScreen?.('home'),
    inventory:()=>window.showScreen?.('inventory'),
    hero:()=>window.showScreen?.('hero'),
    game:()=>window.showScreen?.('casino'),
    battle:()=>window.HomeRebuild?.startRunner?.(false),
    attack:()=>window.HomeRebuild?.startRunner?.(false),
    chapter:()=>window.HomeRebuild?.startRunner?.(false),
    arena:()=>window.ArenaGame?.open?.(),
    shop:()=>window.showScreen?.('market'),
    forge:()=>window.ForgeV2?.open?.(),
    profile:()=>window.showScreen?.('hero'),
    equipment:()=>window.showScreen?.('inventory'),

    bottomQuests:()=>feature('КВЕСТЫ','Текущие задания и прогресс.'),
    quests:()=>feature('ЗАДАНИЯ','Текущие задания и награды.'),
    events:()=>feature('СОБЫТИЯ','Раздел событий.'),
    daily:()=>feature('ЕЖЕДНЕВНЫЕ НАГРАДЫ','Ежедневные награды будут здесь.'),
    friends:()=>feature('ПРИГЛАСИТЬ ДРУЗЕЙ','Приглашения и бонусы.'),
    sea:()=>feature('МОРСКОЙ НАБОР','Раздел морского набора. В разработке.'),
    challenges:()=>feature('ИСПЫТАНИЯ','Раздел испытаний. В разработке.'),
    streets:()=>feature('ЗАХВАТ УЛИЦ','Раздел захвата улиц. В разработке.'),
    clan:()=>feature('КЛАН','В разработке.'),
    trophy:()=>feature('РЕЙТИНГ','Рейтинг игрока.'),
    messages:()=>feature('СООБЩЕНИЯ','Сообщения появятся здесь.'),
    settings:()=>feature('НАСТРОЙКИ','Настройки игры.'),
    lock1:()=>feature('СЛОТ','Откроется на Lv. 90.'),
    lock2:()=>feature('СЛОТ','Откроется после доступа к Арене.'),
    lock3:()=>feature('СЛОТ','Откроется позже.'),
    quest:()=>feature('КВЕСТ','2-7 Пройти Северные земли.'),
    speed:()=>feature('УСКОРЕНИЕ','Ускорение боя. В разработке.'),
    refresh:()=>feature('ОБНОВИТЬ','Обновление задания.'),
    crown:()=>feature('НАГРАДЫ','Награды и достижения.'),
    star:()=>feature('ПРЕМИУМ','Дополнительные награды.'),

    consumable1:()=>window.CombatItems?.use?.('elixir_hp'),
    consumable2:()=>window.CombatItems?.use?.('elixir_energy'),
    consumable3:()=>window.CombatItems?.use?.('elixir_attack'),
    consumable4:()=>window.CombatItems?.use?.('elixir_guard')
  };

  document.addEventListener('click',function(e){
    const close=e.target.closest?.('[data-feature-close]');
    if(close){
      e.preventDefault(); e.stopImmediatePropagation();
      document.getElementById('homeFeatureModal')?.classList.remove('show');
      return;
    }
    const hz=e.target.closest?.('.hz');
    if(!hz) return;
    const key=hz.dataset.action, fn=route[key];
    if(!fn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    fn();
  },true);
})();
