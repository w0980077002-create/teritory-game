/* Territory Game — STEP-04-E follower battle UI bridge.
   Arena owns combat state. This file only exposes active-follower data and decorates the UI.
*/
(function(){
'use strict';
function state(){return window.TerritoryStore?.state||null}
function active(){const s=state(),id=s?.followers?.activeFollower,f=id&&window.Followers?.get?.(id),cfg=id&&window.Followers?.CATALOG?.[id],stats=id&&window.Followers?.getStats?.(id);return f?.owned&&cfg&&stats?{id,data:f,cfg,stats}:null}
function decorate(){const f=active(),root=document.querySelector('.arena-battle');if(!f||!root)return;let badge=root.querySelector('.active-follower-badge');if(!badge){const p=root.querySelector('.player-wrap');if(!p)return;badge=document.createElement('div');badge.className='active-follower-badge';p.appendChild(badge)}badge.innerHTML=`<span>${f.cfg.icon||'✦'}</span><b>${String(f.cfg.name)}</b><small>${String(f.cfg.role)} · ур.${f.data.level}</small>`}
const observer=new MutationObserver(decorate);
document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{subtree:true,childList:true});decorate()});
window.FollowerArena={active,getAbilityState:function(){const f=active();if(!f)return null;return{id:f.id,name:f.cfg.name,role:f.cfg.role,level:f.data.level,awakened:Boolean(f.data.awakened),critChance:Number(f.stats.critChance||0),defense:Number(f.stats.defense||0),heal:Number(f.stats.heal||0),dodge:Number(f.stats.dodge||0),control:Number(f.stats.control||0)}}};
})();
