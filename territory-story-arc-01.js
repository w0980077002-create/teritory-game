/* Territory — STORY ARC 01: first playable narrative layer. */
(function(){'use strict';
function S(){return window.TerritoryStore?.state||{};}function save(){try{window.TerritoryStore?.saveNow?.('story-arc-01')}catch(_){} }
function st(){const s=S();s.story=s.story||{};s.story.arc01=s.story.arc01||{step:0,claimed:{},startedAt:0};return s.story.arc01}
function modal(t,h){const m=document.getElementById('modal'),b=document.getElementById('modalBody');if(!m||!b)return;b.innerHTML='<h2>'+t+'</h2>'+h+'<button class="dark-btn wide" data-story-close>ЗАКРЫТЬ</button>';m.classList.add('show')}
function close(){document.getElementById('modal')?.classList.remove('show')}
function progress(){const s=S(),x=st();let p=Number(x.step)||0;if(Number(s.pve?.wins||0)>=1)p=Math.max(p,1);if(Number(s.pve?.wins||0)>=2)p=Math.max(p,2);if(Number(s.forge?.successes||0)>=1)p=Math.max(p,3);if(Number(s.pve?.wins||0)>=3)p=Math.max(p,4);if(Number(s.pve?.bossDefeated||0)>=1)p=Math.max(p,6);if(p!==x.step){x.step=p;save()}return p}
const steps=[
['Пробуждение','Ты просыпаешься в Territory. Город ещё держится, но за северными воротами замечены враги. Наставник просит проверить дорогу.','map','ОТКРЫТЬ КАРТУ'],
['Первый след','Первый враг повержен. На следах найдена эмблема Чёрного Флага. Кто-то собирает силы на севере.','battle','СЛЕДУЮЩИЙ БОЙ'],
['Кузнец','Трофеи повреждены. Кузнец предлагает восстановить найденное оружие. Улучши любой предмет перед дальнейшим походом.','forge','ОТКРЫТЬ КУЗНИЦУ'],
['Северные ворота','После улучшения оружия путь открыт. За воротами находится командир отряда Чёрного Флага.','battle','ИДТИ В БОЙ'],
['След ведёт дальше','Командир повержен. Теперь становится ясно: отряд подчиняется Вождю Боевого Племени.','map','ОТКРЫТЬ КАРТУ'],
['Последний рубеж','Вождь ждёт за северными воротами. Победа откроет первую новую землю.','boss','ВЫЗВАТЬ БОССА'],
['Новые земли','Вождь повержен. Северная дорога открыта. Это только начало большой истории Territory.','map','ПРОДОЛЖИТЬ ПУТЬ']];
function open(){const p=Math.min(progress(),steps.length-1),x=st();if(!x.startedAt){x.startedAt=Date.now();save()}const q=steps[p];modal('📖 '+q[0],'<p>'+q[1]+'</p><p><b>Сюжетный этап '+(p+1)+' из '+steps.length+'</b></p><button class="gold-btn wide" data-story-action="'+q[2]+'">'+q[3]+'</button>')}
function action(a){close();if(a==='map')return window.TerritoryNavigation?.go?.('map');if(a==='battle')return window.HomeRebuild?.startRunner?.();if(a==='forge')return window.TerritoryNavigation?.go?.('forge');if(a==='boss')return window.PvEFlow?.openBoss?.()||window.HomeRebuild?.openBoss?.()}
function install(){document.addEventListener('click',e=>{const c=e.target.closest('[data-story-close]');if(c){e.preventDefault();close()}const a=e.target.closest('[data-story-action]');if(a){e.preventDefault();action(a.dataset.storyAction)}},true);window.addEventListener('territory:state-changed',progress)}
window.TerritoryStoryArc01={open,progress,state:st,action};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();})();
