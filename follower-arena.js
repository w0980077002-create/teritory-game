/* Territory Game — Arena follower visual layer
   Keeps the existing Arena combat logic intact.
   Adds a clean companion beside each Viking without covering HUD or controls.
*/
(function(){
'use strict';

const FOLLOWER_STYLE = `
.battle-follower{
  position:absolute;
  z-index:8;
  pointer-events:none;
  width:58px;
  min-height:58px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  transform:translateZ(0);
  filter:drop-shadow(0 5px 8px rgba(0,0,0,.45));
}
.battle-follower .follower-aura{
  position:absolute;
  width:48px;height:48px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(232,199,107,.24) 0%,rgba(232,199,107,.07) 45%,transparent 72%);
  box-shadow:0 0 14px rgba(232,199,107,.20);
}
.battle-follower .follower-icon{
  position:relative;
  width:38px;height:38px;
  display:grid;place-items:center;
  border-radius:50%;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.16),rgba(9,17,24,.78) 62%,rgba(9,17,24,.25));
  border:1px solid rgba(232,199,107,.60);
  font-size:22px;
  line-height:1;
  box-shadow:0 0 10px rgba(232,199,107,.18),inset 0 0 8px rgba(0,0,0,.4);
}
.battle-follower b{
  position:relative;
  color:#f1d98e;
  font-size:7px;
  line-height:1;
  white-space:nowrap;
  text-shadow:0 1px 3px #000;
}
.battle-follower small{
  position:relative;
  color:rgba(239,235,221,.72);
  font-size:5.5px;
  line-height:1;
  white-space:nowrap;
  text-shadow:0 1px 3px #000;
}
.player-wrap .battle-follower{left:100%;bottom:25px;margin-left:2px}
.bot-wrap .battle-follower{right:100%;bottom:25px;margin-right:2px}
.follower-companion-bot{position:absolute;right:100%;bottom:25px;margin-right:2px}
@media(max-width:390px){
 .battle-follower{width:52px;min-height:52px}
 .battle-follower .follower-icon{width:34px;height:34px;font-size:19px}
 .battle-follower .follower-aura{width:43px;height:43px}
}
`;

function injectStyle(){
  if(document.getElementById('arenaFollowerVisualStyle'))return;
  const s=document.createElement('style');
  s.id='arenaFollowerVisualStyle';
  s.textContent=FOLLOWER_STYLE;
  document.head.appendChild(s);
}
function state(){return window.TerritoryStore?.state||null}
function active(){
  const s=state(),id=s?.followers?.activeFollower;
  const f=id&&window.Followers?.get?.(id);
  const cfg=id&&window.Followers?.CATALOG?.[id];
  const stats=id&&window.Followers?.getStats?.(id);
  return f?.owned&&cfg&&stats?{id,data:f,cfg,stats}:null;
}
function makeFollower(data,extraClass){
  const el=document.createElement('div');
  el.className='battle-follower '+(extraClass||'');
  el.innerHTML=`<div class="follower-aura"></div><div class="follower-icon">${data.icon||'✦'}</div><b>${String(data.name||'Спутник')}</b><small>${String(data.role||'Поддержка')} · ур.${Number(data.level)||1}</small>`;
  return el;
}
function ensurePlayer(){
  const f=active();
  const wrap=document.querySelector('.player-wrap');
  if(!wrap)return;
  const old=wrap.querySelector('.battle-follower');
  if(!f){old?.remove();return}
  if(old){
    old.querySelector('.follower-icon').textContent=f.cfg.icon||'✦';
    old.querySelector('b').textContent=f.cfg.name;
    old.querySelector('small').textContent=`${f.cfg.role} · ур.${f.data.level}`;
    return;
  }
  wrap.appendChild(makeFollower({icon:f.cfg.icon,name:f.cfg.name,role:f.cfg.role,level:f.data.level},'follower-companion-player'));
}
function ensureBot(){
  const wrap=document.querySelector('.bot-wrap');
  if(!wrap)return;
  if(wrap.querySelector('.follower-companion-bot'))return;
  const name=wrap.querySelector('.fighter-name')?.textContent||'';
  const presets={
    'tank':{name:'Тералель',role:'Защита',icon:'🛡️'},
    'assassin':{name:'Морт',role:'Уворот',icon:'🌀'},
    'berserker':{name:'Лиабро',role:'Крит',icon:'⚔️'},
    'duelist':{name:'Каменное Лицо',role:'Контроль',icon:'💀'}
  };
  let kind='duelist';
  const battleRoot=document.querySelector('[data-battle-root]');
  const text=battleRoot?.querySelector('.bot-wrap .fighter-name')?.textContent||name;
  const mapByName={'Эйрик':'tank','Хальвдан':'berserker','Сигурд':'dodge','Рагнар':'assassin','Ивар':'duelist','Бьёрн':'tank'};
  kind=mapByName[text.split(' Lv.')[0].trim()]||kind;
  if(kind==='dodge')presets.dodge={name:'Морт',role:'Уворот',icon:'🌀'};
  const data=presets[kind]||presets.duelist;
  const el=makeFollower(data,'follower-companion-bot');
  el.classList.add('follower-companion-bot');
  wrap.appendChild(el);
}
function decorate(){
  injectStyle();
  if(!document.querySelector('.arena-battle'))return;
  ensurePlayer();
  ensureBot();
}
const observer=new MutationObserver(()=>decorate());
document.addEventListener('DOMContentLoaded',()=>{decorate();observer.observe(document.body,{subtree:true,childList:true})});
window.FollowerArena={
  active,
  getAbilityState:function(){
    const f=active();
    if(!f)return null;
    return {id:f.id,name:f.cfg.name,role:f.cfg.role,level:f.data.level,awakened:Boolean(f.data.awakened),critChance:Number(f.stats.critChance||0),defense:Number(f.stats.defense||0),heal:Number(f.stats.heal||0),dodge:Number(f.stats.dodge||0),control:Number(f.stats.control||0)};
  }
};
})();
