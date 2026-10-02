/* TERRITORY — CANONICAL HOME
   Three independent layers:
   #bg-layer   = background
   #game-layer = characters/entities
   #hud-layer  = HUD + interaction
*/
(function(){
'use strict';
if(window.TerritoryHome)return;

const A=()=>window.TerritoryTelegramAuth;
const S=()=>window.TerritoryStore?.state||{};
const N=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const F=v=>Math.floor(N(v)).toLocaleString('ru-RU');
const ready=()=>A()?.state==='authenticated'&&!!window.__territoryServerHydrated55;
const defaults={level:1,vip:0,coins:0,gems:0,red:0,energy:100,maxEnergy:100,hp:100,maxHp:100,xp:0,xpNext:100,chapter:1,stage:1,progress:0};

function data(){
 const s=S();
 if(!ready())return defaults;
 return {
  level:N(s.level??s.profile?.level,1),vip:N(s.profile?.vip,0),coins:N(s.coins,0),
  gems:N(s.gems,0),red:N(s.redGems??s.red_gems,0),energy:N(s.energy,0),
  maxEnergy:N(s.maxEnergy,100),hp:N(s.hp,0),maxHp:N(s.maxHp,100),
  xp:N(s.xp??s.exp,0),xpNext:N(s.xpNext??s.expToNext,100),
  chapter:N(s.currentChapter??s.pve?.chapter,1),stage:N(s.chapterStage??s.pve?.stage,1),
  progress:Math.round(Math.max(0,Math.min(100,N(s.chapterProgress??s.pve?.progress,0))))
 };
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function hit(a,c,l){return `<button type="button" class="home-hit ${c}" data-home-action="${a}" aria-label="${esc(l)}"></button>`;}
const HOME_ASSETS={background:'home-master.png',hero:'',follower:'',enemy1:'',enemy2:''};
function entity(asset,classes,label){
 if(!asset)return '';
 return `<img class="territory-home-entity ${classes}" src="${asset}" alt="${esc(label)}">`;
}

function template(){
 return `<div class="territory-home">
  <div id="bg-layer" aria-hidden="true">
    <img class="territory-home-background" src="${HOME_ASSETS.background}" alt="">
  </div>

  <div id="game-layer" aria-hidden="true">
    ${entity(HOME_ASSETS.hero,'hero','Главный герой')}
    ${entity(HOME_ASSETS.follower,'follower','Последователь')}
    ${entity(HOME_ASSETS.enemy1,'enemy-1','Враг 1')}
    ${entity(HOME_ASSETS.enemy2,'enemy-2','Враг 2')}
  </div>

  <div id="hud-layer">
    <div class="territory-home-live" aria-hidden="true">
      <span class="live live-level" data-live="level"></span>
      <span class="live live-vip" data-live="vip"></span>
      <span class="live live-coins" data-live="coins"></span>
      <span class="live live-gems" data-live="gems"></span>
      <span class="live live-red" data-live="red"></span>
      <span class="live live-energy-top" data-live="energyTop"></span>
      <span class="live live-chapter" data-live="chapter"></span>
      <span class="live live-xp" data-live="xp"></span>
      <span class="live live-bottom-level" data-live="bottomLevel"></span>
      <span class="live live-hp" data-live="hp"></span>
      <span class="live live-energy" data-live="energy"></span>
      <span class="live live-eq e1" data-live="eq1"></span><span class="live live-eq e2" data-live="eq2"></span>
      <span class="live live-eq e3" data-live="eq3"></span><span class="live live-eq e4" data-live="eq4"></span>
      <span class="live live-eq e5" data-live="eq5"></span><span class="live live-eq e6" data-live="eq6"></span>
      <span class="live live-cons c1" data-live="c1"></span><span class="live live-cons c2" data-live="c2"></span>
      <span class="live live-cons c3" data-live="c3"></span><span class="live live-cons c4" data-live="c4"></span>
      <span class="live live-progress" data-live="progress"></span>
    </div>

    <div class="territory-home-hit-layer home-hit-layer">
      ${hit('hero','top profile','Профиль')}${hit('coins','top coins','Монеты')}${hit('gems','top gems','Синие алмазы')}
      ${hit('redgems','top redgems','Красные алмазы')}${hit('trophy','top trophy','Трофеи')}${hit('mail','top mail','Почта')}${hit('settings','top settings','Настройки')}
      ${hit('energy','energy','Энергия')}
      ${hit('events','left side1','События')}${hit('daily','left side2','Ежедневные награды')}${hit('quests','left side3','Задания')}${hit('invite','left side4','Пригласить друзей')}${hit('sea','left side5','Морской набор')}
      ${hit('shop','right side1','Лавка')}${hit('forge','right side2','Кузница')}${hit('trials','right side3','Испытания')}${hit('capture','right side4','Захват улиц')}${hit('arena','right side5','Арена')}
      ${hit('chapter','chapter','Северные земли')}
      ${hit('gear1','gear g1','Оружие')}${hit('gear2','gear g2','Шлем')}${hit('gear3','gear g3','Броня')}${hit('gear4','gear g4','Обувь')}${hit('gear5','gear g5','Эликсир')}${hit('gear6','gear g6','Аксессуар')}
      ${hit('elixir1','elixir e1','Эликсир 1')}${hit('elixir2','elixir e2','Эликсир 2')}${hit('elixir3','elixir e3','Эликсир 3')}${hit('elixir4','elixir e4','Эликсир 4')}
      ${hit('locked1','locked l1','Закрытая ячейка')}${hit('locked2','locked l2','Закрытая ячейка')}${hit('locked3','locked l3','Закрытая ячейка')}
      ${hit('speed','speed','Скорость')}${hit('auto','auto','Автобой')}${hit('honor','honor','Звания')}${hit('blessing','blessing','Благословение')}
      ${hit('home','bottom b1','Город')}${hit('inventory','bottom b2','Инвентарь')}${hit('hero','bottom b3','Герой')}${hit('battle','bottom b4','Бой')}${hit('quests','bottom b5','Квесты')}${hit('games','bottom b6','Игры')}${hit('clan','bottom b7','Клан')}
    </div>
  </div>
 </div>`;
}
function set(k,v){const el=document.querySelector(`#home [data-live="${k}"]`);if(el)el.textContent=v;}
function paint(){
 const v=data(),s=S(),is=ready();
 set('level','Lv. '+F(v.level));set('vip','VIP '+F(v.vip));set('coins',F(v.coins));set('gems',F(v.gems));set('red',F(v.red));
 set('energyTop',F(v.energy)+' / '+F(v.maxEnergy));set('chapter','Глава '+F(v.chapter)+' • Северные земли '+F(v.chapter)+'-'+F(v.stage));
 set('xp',F(v.xp)+' / '+F(v.xpNext));set('bottomLevel','Lv. '+F(v.level));set('hp',F(v.hp)+' / '+F(v.maxHp));
 set('energy',F(v.energy)+' / '+F(v.maxEnergy));set('progress',F(v.progress)+'%');
 const eq=Array.isArray(s.equipment)?s.equipment:[];for(let i=0;i<6;i++)set('eq'+(i+1),is&&eq[i]?'Lv. '+F(eq[i].level||1):'');
 const c=s.consumables||{};['elixir_hp','elixir_energy','elixir_attack','elixir_guard'].forEach((k,i)=>set('c'+(i+1),is?F(c[k]):''));
}
function render(){
 const home=document.getElementById('home');if(!home||home.dataset.territoryHome)return;
 home.dataset.territoryHome='1';home.classList.add('territory-home-screen');home.innerHTML=template();paint();
}
function startRunner(){return window.PvEFlow?.startRunner?.()} function openBoss(){return window.PvEFlow?.openBoss?.()}
function boot(){render();window.addEventListener('territory:state-changed',paint);window.addEventListener('territory:telegram-authenticated',paint);window.addEventListener('territory:screen',paint);setInterval(paint,1000);}
window.HomeRebuild={render,startRunner,openBoss,refresh:paint};window.TerritoryHome={render,refresh:paint};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();